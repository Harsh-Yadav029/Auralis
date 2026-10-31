import json
import logging
from typing import Any, Dict, List

import httpx

logger = logging.getLogger("auralis.bcsm_scorer")

# FBI Behavioral Change Stairway Model (BCSM) Stages
BCSM_STAGES = [
    {"stage": 1, "name": "Active Listening", "description": "Trainee uses open questions, pauses, emotional labeling, or mirroring to understand suspect."},
    {"stage": 2, "name": "Empathy", "description": "Trainee validates emotions and articulates the suspect's perspective without judgment."},
    {"stage": 3, "name": "Rapport", "description": "Suspect feels understood; conversation becomes collaborative and mutual."},
    {"stage": 4, "name": "Influence", "description": "Trainee guides suspect toward problem-solving and alternative choices."},
    {"stage": 5, "name": "Behavioral Change", "description": "Suspect agrees to de-escalate, surrender weapon, or release hostages."},
]


class BCSMScorer:
    """
    Evaluates trainee utterances against the FBI Behavioral Change Stairway Model.
    Uses local Ollama for JSON-structured scoring.
    Falls back to fast keyword heuristic if Ollama is unreachable.
    Operates asynchronously — zero latency impact on the sub-800ms audio loop.
    """

    def __init__(
        self,
        ollama_base_url: str = "http://localhost:11434",
        ollama_model: str = "qwen2.5:7b-instruct-q4_K_M",
    ):
        self.ollama_base_url = ollama_base_url.rstrip("/")
        self.ollama_model = ollama_model
        self.history: List[Dict[str, str]] = []

    def _build_scoring_prompt(
        self,
        trainee_transcript: str,
        acoustic_emotion: Dict[str, Any],
        ai_response: str,
    ) -> str:
        return f"""You are a senior FBI Crisis Negotiation Instructor evaluating a trainee in real-time.
The Behavioral Change Stairway Model (BCSM) stages are:
1. Active Listening
2. Empathy
3. Rapport
4. Influence
5. Behavioral Change

EVALUATION INPUTS:
- Trainee Spoke: "{trainee_transcript}"
- Trainee Acoustic Emotion: {acoustic_emotion.get('primary_label', 'neutral')} (Arousal: {acoustic_emotion.get('arousal', 0.5):.2f}, Valence: {acoustic_emotion.get('valence', 0.0):.2f})
- Suspect Prior Response: "{ai_response}"

OUTPUT ONLY valid JSON matching this exact structure, no markdown, no explanation:
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
}}"""

    async def _query_ollama(self, prompt: str) -> dict | None:
        """Call Ollama /api/generate with JSON mode, return parsed dict or None."""
        payload = {
            "model": self.ollama_model,
            "prompt": prompt,
            "stream": False,
            "format": "json",
            "options": {"temperature": 0.1, "num_predict": 220},
        }
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                resp = await client.post(
                    f"{self.ollama_base_url}/api/generate",
                    json=payload,
                )
                resp.raise_for_status()
                raw = resp.json().get("response", "{}")
                return json.loads(raw)
        except httpx.ConnectError:
            logger.warning("BCSM: Ollama not reachable — using heuristic fallback")
            return None
        except Exception as exc:
            logger.warning(f"BCSM: Ollama scoring error ({exc}) — using heuristic fallback")
            return None

    async def evaluate_turn(
        self,
        trainee_transcript: str,
        acoustic_emotion: Dict[str, Any],
        ai_response: str,
    ) -> Dict[str, Any]:
        """
        Asynchronously assess trainee negotiation tactics.
        Returns a structured BCSM score dict.
        """
        if not trainee_transcript.strip():
            return self._default_score()

        prompt = self._build_scoring_prompt(trainee_transcript, acoustic_emotion, ai_response)
        result = await self._query_ollama(prompt)

        if result:
            try:
                stage = max(1, min(5, int(result.get("stage", 1))))
                scores = result.get("scores", {})
                return {
                    "stage": stage,
                    "stage_name": BCSM_STAGES[stage - 1]["name"],
                    "scores": {
                        "active_listening": max(0, min(100, int(scores.get("active_listening", 60)))),
                        "emotional_labeling": max(0, min(100, int(scores.get("emotional_labeling", 50)))),
                        "mirroring": max(0, min(100, int(scores.get("mirroring", 50)))),
                        "rapport": max(0, min(100, int(scores.get("rapport", 30)))),
                    },
                    "tactical_feedback": str(result.get("tactical_feedback", "Focus on active listening.")),
                    "overall_progress": max(0.0, min(100.0, float(result.get("overall_progress", stage * 20.0)))),
                }
            except Exception as exc:
                logger.warning(f"BCSM: JSON parse error ({exc}) — using heuristic fallback")

        return self._heuristic_evaluation(trainee_transcript, acoustic_emotion)

    def _heuristic_evaluation(self, transcript: str, acoustic_emotion: dict) -> Dict[str, Any]:
        """Fast rule-based heuristic fallback when Ollama is unreachable."""
        lower = transcript.lower()
        arousal = acoustic_emotion.get("arousal", 0.5)

        listening_score = 65
        labeling_score = 50
        mirroring_score = 50
        rapport_score = 35
        stage = 1

        # Open-ended questions & empathy markers
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
            feedback = "High vocal agitation detected. Lower your pitch and slow down deliberately."

        return {
            "stage": stage,
            "stage_name": BCSM_STAGES[stage - 1]["name"],
            "scores": {
                "active_listening": min(100, listening_score),
                "emotional_labeling": min(100, labeling_score),
                "mirroring": min(100, mirroring_score),
                "rapport": min(100, rapport_score),
            },
            "tactical_feedback": feedback,
            "overall_progress": float(stage * 20.0),
        }

    def _default_score(self) -> Dict[str, Any]:
        return {
            "stage": 1,
            "stage_name": "Active Listening",
            "scores": {
                "active_listening": 50,
                "emotional_labeling": 40,
                "mirroring": 40,
                "rapport": 20,
            },
            "tactical_feedback": "Awaiting initial trainee contact.",
            "overall_progress": 10.0,
        }
