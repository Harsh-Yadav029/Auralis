import numpy as np
import scipy.signal

def resample_48k_to_16k(pcm_48k: np.ndarray) -> np.ndarray:
    """Resample 48kHz audio array to 16kHz PCM mono for ML models."""
    if pcm_48k.size == 0:
        return np.array([], dtype=np.int16)
    return scipy.signal.resample_poly(pcm_48k, 1, 3).astype(np.int16)

def resample_16k_to_48k(pcm_16k: np.ndarray) -> np.ndarray:
    """Resample 16kHz audio array to 48kHz PCM mono for WebRTC output."""
    if pcm_16k.size == 0:
        return np.array([], dtype=np.int16)
    return scipy.signal.resample_poly(pcm_16k, 3, 1).astype(np.int16)
