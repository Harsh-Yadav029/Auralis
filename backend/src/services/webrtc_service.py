import asyncio
import fractions
import numpy as np
from aiortc import MediaStreamTrack
from av import AudioFrame

def resample_to_16k(audio_frame: AudioFrame) -> np.ndarray:
    """Extract and resample inbound audio frame to 16kHz mono int16 PCM."""
    array = audio_frame.to_ndarray()
    # If stereo (shape [2, N]), average channels to mono
    if array.ndim > 1 and array.shape[0] == 2:
        array = np.mean(array, axis=0)
    elif array.ndim > 1:
        array = array.flatten()

    src_rate = audio_frame.sample_rate or 48000
    if src_rate == 16000:
        return array.astype(np.int16)

    num_samples = int(len(array) * 16000 / src_rate)
    if num_samples <= 0:
        return np.array([], dtype=np.int16)

    x_old = np.linspace(0, 1, len(array))
    x_new = np.linspace(0, 1, num_samples)
    return np.interp(x_new, x_old, array).astype(np.int16)

class CustomOutboundAudioTrack(MediaStreamTrack):
    """Outbound WebRTC track streaming generated TTS PCM audio chunks to browser."""
    kind = "audio"

    def __init__(self):
        super().__init__()
        self.queue = asyncio.Queue()
        self._pts = 0
        self.sample_rate = 48000
        self.channels = 1
        self._silent_frame = np.zeros(960, dtype=np.int16)

    async def add_pcm_chunk(self, pcm_data_16k: np.ndarray):
        """Resample 16kHz TTS output to 48kHz and push to outbound WebRTC queue in 20ms frames."""
        if pcm_data_16k.size == 0:
            return

        x_old = np.linspace(0, 1, len(pcm_data_16k))
        x_new = np.linspace(0, 1, len(pcm_data_16k) * 3)
        resampled = np.interp(x_new, x_old, pcm_data_16k).astype(np.int16)

        # Split into 960-sample (20ms) frames
        frame_size = 960
        for i in range(0, len(resampled), frame_size):
            chunk = resampled[i:i + frame_size]
            if len(chunk) < frame_size:
                padded = np.zeros(frame_size, dtype=np.int16)
                padded[:len(chunk)] = chunk
                chunk = padded
            await self.queue.put(chunk)

    async def recv(self):
        frame_size = 960  # 20ms frame at 48kHz
        try:
            # Wait up to 20ms for audio, otherwise return silent frame
            data = await asyncio.wait_for(self.queue.get(), timeout=0.02)
        except (asyncio.TimeoutError, asyncio.QueueEmpty):
            data = self._silent_frame

        frame = AudioFrame(format='s16', layout='mono', samples=frame_size)
        frame.planes[0].update(data.tobytes())
        frame.sample_rate = self.sample_rate
        frame.pts = self._pts
        frame.time_base = fractions.Fraction(1, self.sample_rate)
        self._pts += frame_size
        return frame

    def clear(self):
        """Flush audio queue during barge-in interruption."""
        while not self.queue.empty():
            try:
                self.queue.get_nowait()
            except asyncio.QueueEmpty:
                break

