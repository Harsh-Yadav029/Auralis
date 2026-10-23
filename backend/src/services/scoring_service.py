import os
import json
import logging
from typing import Dict, Any, List
from groq import AsyncGroq

logger = logging.getLogger("auralis.bcsm_scorer")

# FBI Behavioral Change Stairway Model (BCSM) Stages
BCSM_STAGES = [
    {"stage": 1, "name": "Active Listening", "description": "Trainee uses open questions, pauses, emotional labeling, or mirroring to understand suspect."},
    {"stage": 2, "name": "Empathy", "description": "Trainee validates emotions and articulates the suspect's perspective without judgment."},
    {"stage": 3, "name": "Rapport", "description": "Suspect feels understood; conversation becomes collaborative and mutual."},
    {"stage": 4, "name": "Influence", "description": "Trainee guides suspect toward problem-solving and alternative choices."},
    {"stage": 5, "name": "Behavioral Change", "description": "Suspect agrees to de-escalate, surrender weapon, or release hostages."}
]

class BCSMScorer:
    """
    Evaluates trainee utterances against the FBI Behavioral Change Stairway Model (BCSM).
    Operates asynchronously without blocking the sub-800ms speech-to-speech loop.
    """
    def __init__(self, api_key: str = None):
        key = api_key or os.getenv("GROQ_API_KEY", "")
        self.client = AsyncGroq(api_key=key) if key else None
        self.model = "llama-3.1-8b-instant"
        self.history: List[Dict[str, str]] = []

    async def evaluate_turn(
        self,
        trainee_transcript: str,
        acoustic_emotion: Dict[str, Any],
        ai_response: str
    ) -> Dict[str, Any]:
        """
        Asynchronously assesses trainee negotiation tactics and determines stage progression.
        """
        if not trainee_transcript.strip():
            return self._default_score()

        if not self.client:
            return self._heuristic_evaluation(trainee_transcript, acoustic_emotion)

        prompt = f"""You are a senior FBI Crisis Negotiation Instructor evaluating a trainee in real-time.
The Behavioral Change Stairway Model (BCSM) stages are:
1. Active Listening
2. Empathy
3. Rapport
4. Influence
5. Behavioral Change

EVALUATION INPUTS:
- Trainee Spoke: "{trainee_transcript}"
- Trainee Acoustic Emotion: {acoustic_emotion.get('primary_label', 'neutral')} (Arousal: {acoustic_emotion.get('arousal', 0.5):.2f}, Valence: {acoustic_emotion.get('valence', 0.0):.2f})
- Suspect Prior/Context Response: "{ai_response}"

INSTRUCTIONS:
Evaluate this single turn. You MUST output ONLY valid JSON matching this exact structure:
{{
  "stage": 1,
  "stage_name": "Active Listening",
  "scores": {{
    "active_listening": 85,
    "emotional_labeling": 70,
    "mirroring": 60,
    "rapport": 40
  }},
  "tactical_feedback": "One concise sentence instructing the trainee on their next tactical move.",
  "overall_progress": 25.0
}}
Do NOT output any markdown, conversational remarks, or extra keys."""

        try:
            completion = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an automated evaluation engine that returns strictly valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=220,
                response_format={"type": "json_object"}
            )
            raw_text = completion.choices[0].message.content or "{}"
            result = json.loads(raw_text)

            # Ensure valid types and clamp bounds
            stage = int(result.get("stage", 1))
            stage = max(1, min(5, stage))
            stage_name = BCSM_STAGES[stage - 1]["name"]

            scores = result.get("scores", {})
            return {
                "stage": stage,
                "stage_name": stage_name,
                "scores": {
                    "active_listening": max(0, min(100, int(scores.get("active_listening", 60)))),
                    "emotional_labeling": max(0, min(100, int(scores.get("emotional_labeling", 50)))),
                    "mirroring": max(0, min(100, int(scores.get("mirroring", 50)))),
                    "rapport": max(0, min(100, int(scores.get("rapport", 30))))
                },
                "tactical_feedback": result.get("tactical_feedback", "Focus on active listening and acknowledge the suspect's frustration."),
                "overall_progress": max(0.0, min(100.0, float(result.get("overall_progress", stage * 20.0))))
            }
        except Exception as e:
            logger.warning(f"Groq BCSM scoring fallback: {e}")
            return self._heuristic_evaluation(trainee_transcript, acoustic_emotion)

    def _heuristic_evaluation(self, transcript: str, acoustic_emotion: dict) -> Dict[str, Any]:
        """Fast rule-based heuristic fallback if LLM is unreachable."""
        lower = transcript.lower()
        arousal = acoustic_emotion.get("arousal", 0.5)

        listening_score = 65
        labeling_score = 50
        mirroring_score = 50
        rapport_score = 35
        stage = 1

        # Check for open-ended questions & empathy markers
        if any(w in lower for w in ["what", "how", "tell me", "help me understand"]):
            listening_score += 20
        if any(w in lower for w in ["sounds like", "seems like", "feel", "scared", "angry", "upset"]):
            labeling_score += 30
            stage = 2
        if any(w in lower for w in ["together", "we can", "with you", "promise", "listen"]):
            rapport_score += 30
            stage = max(stage, 3)

        feedback = "Keep your tone calm and reflect the suspect's core concerns with open questions."
        if arousal > 0.75:
            feedback = "High vocal agitation detected in trainee voice. Lower your pitch and slow down."

        return {
            "stage": stage,
            "stage_name": BCSM_STAGES[stage - 1]["name"],
            "scores": {
                "active_listening": min(100, listening_score),
                "emotional_labeling": min(100, labeling_score),
                "mirroring": min(100, mirroring_score),
                "rapport": min(100, rapport_score)
            },
            "tactical_feedback": feedback,
            "overall_progress": float(stage * 20.0)
        }

    def _default_score(self) -> Dict[str, Any]:
        return {
            "stage": 1,
            "stage_name": "Active Listening",
            "scores": {
                "active_listening": 50,
                "emotional_labeling": 40,
                "mirroring": 40,
                "rapport": 20
            },
            "tactical_feedback": "Awaiting initial trainee contact.",
            "overall_progress": 10.0
        }
