import os
import re
from typing import AsyncGenerator
from groq import AsyncGroq

class GroqContextEngine:
    def __init__(self, api_key: str = None):
        key = api_key or os.getenv("GROQ_API_KEY", "")
        self.client = AsyncGroq(api_key=key) if key else None
        # Primary verified active model on Groq
        self.model = os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b")

    def build_system_prompt(self, emotion_data: dict, fusion_data: dict = None, scenario: dict = None) -> str:
        arousal = emotion_data.get('arousal', 0.5)
        valence = emotion_data.get('valence', 0.0)
        label = emotion_data.get('primary_label', 'unknown').upper()

        fusion_notes = ""
        if fusion_data and fusion_data.get("flag") != "ALIGNED":
            fusion_notes = f"\n[PSYCHOLOGICAL DISSONANCE DETECTED]: {fusion_data.get('flag')} (Incongruence: {fusion_data.get('incongruence_score')})\nTactical Clue: {fusion_data.get('tactical_hint')}"

        persona_block = scenario.get("prompt_personality", "") if scenario else "You are an armed suspect holding hostages in a bank vault."

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

    async def stream_deescalation_response(self, user_transcript: str, emotion_data: dict, history: list = None, fusion_data: dict = None, scenario: dict = None) -> AsyncGenerator[str, None]:
        if not self.client:
            # Fallback mock response if API key not present during dev test
            yield "I hear how overwhelmed you are right now. Take a breath with me. I am standing right here and nobody is going to hurt you."
            return

        history = history or []
        system_prompt = self.build_system_prompt(emotion_data, fusion_data, scenario)
        messages = [{"role": "system", "content": system_prompt}] + history + [{"role": "user", "content": user_transcript}]



        completion = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0.3,
            max_tokens=120,
            stream=True
        )

        buffer = ""
        async for chunk in completion:
            token = chunk.choices[0].delta.content or ""
            buffer += token
            # Stream on clause boundaries to trigger TTS as early as possible
            if re.search(r'[.,?!;]\s*$', buffer):
                yield buffer
                buffer = ""

        if buffer.strip():
            yield buffer
