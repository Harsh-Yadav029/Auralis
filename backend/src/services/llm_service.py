import json
import logging
import re
from typing import AsyncGenerator

import httpx

logger = logging.getLogger("auralis.llm")


class OllamaLLMEngine:
    """
    Local LLM via Ollama streaming API.
    Endpoint: POST /api/generate (streaming NDJSON)
    Model: qwen2.5:7b-instruct-q4_K_M (configurable)
    """

    def __init__(self, base_url: str = "http://localhost:11434", model: str = "qwen2.5:7b-instruct-q4_K_M"):
        self.base_url = base_url.rstrip("/")
        self.model = model

    def build_system_prompt(
        self,
        emotion_data: dict,
        fusion_data: dict | None = None,
        scenario: dict | None = None,
    ) -> str:
        arousal = emotion_data.get("arousal", 0.5)
        valence = emotion_data.get("valence", 0.0)
        label = emotion_data.get("primary_label", "unknown").upper()

        fusion_notes = ""
        if fusion_data and fusion_data.get("flag") != "ALIGNED":
            fusion_notes = (
                f"\n[PSYCHOLOGICAL DISSONANCE DETECTED]: {fusion_data.get('flag')}"
                f" (Incongruence: {fusion_data.get('incongruence_score')})"
                f"\nTactical Clue: {fusion_data.get('tactical_hint')}"
            )

        persona_block = (
            scenario.get("prompt_personality", "")
            if scenario
            else "You are an armed suspect holding hostages in a bank vault."
        )

        return f"""CRISIS NEGOTIATION SIMULATOR PERSONA:
{persona_block}

TRAINEE VOICE ACOUSTIC TELEMETRY:
- Acoustic Primary State: {label}
- Arousal (Energy Level): {arousal:.2f} / 1.00
- Valence (Tone Positivity): {valence:.2f} / 1.00{fusion_notes}

ROLEPLAY GUIDELINES:
1. Speak in first person as the suspect/subject. Keep replies concise (1-2 sentences).
2. React authentically to the trainee's emotional tone and tactical de-escalation skills.
3. If dissonance is flagged (e.g. suppressed panic), comment on their nervous or trembling voice."""

    async def stream_deescalation_response(
        self,
        user_transcript: str,
        emotion_data: dict,
        history: list | None = None,
        fusion_data: dict | None = None,
        scenario: dict | None = None,
    ) -> AsyncGenerator[str, None]:
        history = history or []
        system_prompt = self.build_system_prompt(emotion_data, fusion_data, scenario)

        # Build a flat prompt string for Ollama /api/generate
        history_text = ""
        for msg in history:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            history_text += f"\n[{role.upper()}]: {content}"

        full_prompt = (
            f"[SYSTEM]: {system_prompt}\n"
            f"{history_text}\n"
            f"[USER]: {user_transcript}\n"
            "[ASSISTANT]:"
        )

        payload = {
            "model": self.model,
            "prompt": full_prompt,
            "stream": True,
            "options": {
                "temperature": 0.3,
                "num_predict": 120,
                "stop": ["\n[USER]:", "\n[SYSTEM]:"],
            },
        }

        buffer = ""
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                async with client.stream(
                    "POST",
                    f"{self.base_url}/api/generate",
                    json=payload,
                ) as response:
                    response.raise_for_status()
                    async for line in response.aiter_lines():
                        if not line:
                            continue
                        try:
                            data = json.loads(line)
                        except json.JSONDecodeError:
                            continue

                        token = data.get("response", "")
                        buffer += token

                        # Yield on clause boundaries to trigger TTS early
                        if re.search(r"[.,?!;]\s*$", buffer):
                            yield buffer.strip()
                            buffer = ""

                        if data.get("done"):
                            break

            if buffer.strip():
                yield buffer.strip()

        except httpx.ConnectError:
            logger.error("Ollama not reachable at %s — is 'ollama serve' running?", self.base_url)
            yield "I need a moment. Give me a second to think."
        except Exception as exc:
            logger.error("Ollama streaming error: %s", exc)
            yield "Let's slow this down. Talk to me."
