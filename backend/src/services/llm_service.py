import os
import re
from typing import AsyncGenerator
from groq import AsyncGroq

class GroqContextEngine:
    def __init__(self, api_key: str = None):
        key = api_key or os.getenv("GROQ_API_KEY", "")
        self.client = AsyncGroq(api_key=key) if key else None
        self.model = "llama-3.1-8b-instant"

    def build_system_prompt(self, emotion_data: dict) -> str:
        arousal = emotion_data.get('arousal', 0.5)
        valence = emotion_data.get('valence', 0.0)
        label = emotion_data.get('primary_label', 'unknown').upper()

        return f"""You are an expert Crisis Negotiator de-escalating a hostage or emergency situation.
USER EMOTION PARAMETERS:
- Acoustic Primary State: {label}
- Arousal (Energy Level): {arousal:.2f} / 1.00
- Valence (Tone Positivity): {valence:.2f} / 1.00

DE-ESCALATION RULES:
1. Keep your reply concise (1-2 calm sentences).
2. Directly address their emotional state without arguing.
3. Use steady, reassuring language to lower agitation."""

    async def stream_deescalation_response(self, user_transcript: str, emotion_data: dict, history: list = None) -> AsyncGenerator[str, None]:
        if not self.client:
            # Fallback mock response if API key not present during dev test
            yield "I hear how overwhelmed you are right now. Take a breath with me. I am standing right here and nobody is going to hurt you."
            return

        history = history or []
        system_prompt = self.build_system_prompt(emotion_data)
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
