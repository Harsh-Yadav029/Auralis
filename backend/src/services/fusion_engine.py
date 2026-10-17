import re
from typing import Dict, Any

class EmotionFusionEngine:
    """
    Dual-stream emotion fusion engine that detects cognitive dissonance and
    incongruence between acoustic soundwaves and semantic text sentiment.
    
    Example: Trainee speaks 'I am completely calm and under control', but Wav2Vec2
    registers Arousal = 0.94 and Valence = -0.75 (high panic/agitation).
    Flags: SUPPRESSED_PANIC or FALSE_COMPLIANCE.
    """
    
    POSITIVE_WORDS = {
        "calm", "fine", "okay", "peace", "relax", "good", "safe", "control", 
        "agree", "cooperate", "promise", "help", "understand", "listen"
    }
    
    NEGATIVE_WORDS = {
        "angry", "furious", "kill", "die", "gun", "shoot", "scared", "afraid", 
        "hurt", "blood", "stop", "never", "hate", "destroy", "hostage"
    }

    def estimate_semantic_valence(self, text: str) -> float:
        """
        Calculates lexical valence in [-1.0, 1.0].
        Fast, deterministic, sub-1ms regex lookup.
        """
        words = re.findall(r'\b\w+\b', text.lower())
        if not words:
            return 0.0

        pos_count = sum(1 for w in words if w in self.POSITIVE_WORDS)
        neg_count = sum(1 for w in words if w in self.NEGATIVE_WORDS)

        total = pos_count + neg_count
        if total == 0:
            return 0.0

        # Scale between -1.0 and 1.0
        return (pos_count - neg_count) / total

    def fuse_and_evaluate(
        self,
        transcript: str,
        acoustic_emotion: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Compares text semantic valence against acoustic arousal & valence.
        Returns dissonance status, incongruence score, and tactical injection cues.
        """
        acoustic_arousal = float(acoustic_emotion.get("arousal", 0.5))
        acoustic_valence = float(acoustic_emotion.get("valence", 0.0))
        acoustic_label = str(acoustic_emotion.get("primary_label", "neutral")).lower()

        semantic_valence = self.estimate_semantic_valence(transcript)

        # Incongruence metric:
        # High when semantic claims are positive/neutral but acoustic signals indicate panic/distress
        valence_gap = abs(semantic_valence - acoustic_valence)
        incongruence_score = min(1.0, valence_gap * acoustic_arousal)

        flag = "ALIGNED"
        tactical_hint = ""

        # Trainee claims to be calm/agreeable, but voice exhibits extreme agitation/panic
        if semantic_valence >= 0.2 and acoustic_arousal >= 0.75 and acoustic_valence <= -0.2:
            flag = "SUPPRESSED_PANIC"
            tactical_hint = "Trainee words claim calmness or control, but acoustic tremor reveals severe underlying panic. Call out their genuine fear."

        # Trainee claims anger/hostility, but acoustic voice is trembling/frightened
        elif semantic_valence <= -0.3 and acoustic_label in ["fear", "sadness"] and acoustic_valence <= -0.4:
            flag = "MASKED_VULNERABILITY"
            tactical_hint = "Trainee is adopting aggressive posturing to mask deep vulnerability and fear. Reassure physical safety."

        # Trainee agrees readily, but acoustic valence is strongly negative
        elif ("yes" in transcript.lower() or "agree" in transcript.lower()) and acoustic_valence < -0.4:
            flag = "FALSE_COMPLIANCE"
            tactical_hint = "Trainee gives verbal agreement but acoustic tone lacks conviction. Probe for reservations."

        return {
            "flag": flag,
            "incongruence_score": round(incongruence_score, 2),
            "semantic_valence": round(semantic_valence, 2),
            "acoustic_valence": round(acoustic_valence, 2),
            "acoustic_arousal": round(acoustic_arousal, 2),
            "tactical_hint": tactical_hint
        }
