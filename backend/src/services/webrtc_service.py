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
    SAMPLE_RATE = 48000
    FRAME_SAMPLES = 960  # 20ms at 48kHz

    def __init__(self):
        super().__init__()
        self._queue: asyncio.Queue = asyncio.Queue(maxsize=200)
        self._pts = 0
        self._silent_frame = np.zeros(self.FRAME_SAMPLES, dtype=np.int16)
        # Accumulation buffer for partial resampled chunks
        self._buffer = np.array([], dtype=np.int16)

    async def add_pcm_chunk(self, pcm_16k: np.ndarray):
        """
        Accept 16kHz mono int16 PCM, resample to 48kHz, enqueue complete 20ms frames.
        Accumulates partial frames in a buffer — handles any input chunk size.
        """
        if pcm_16k is None or pcm_16k.size == 0:
            return

        pcm_16k = pcm_16k.astype(np.int16).flatten()

        # Resample 16kHz → 48kHz (integer ×3 ratio — no quality loss)
        n_out = len(pcm_16k) * 3
        x_old = np.linspace(0, 1, len(pcm_16k))
        x_new = np.linspace(0, 1, n_out)
        resampled = np.interp(x_new, x_old, pcm_16k).astype(np.int16)

        # Append to accumulation buffer
        self._buffer = np.concatenate([self._buffer, resampled])

        # Drain complete 960-sample frames from buffer
        while len(self._buffer) >= self.FRAME_SAMPLES:
            frame_data = self._buffer[: self.FRAME_SAMPLES]
            self._buffer = self._buffer[self.FRAME_SAMPLES :]
            try:
                self._queue.put_nowait(frame_data)
            except asyncio.QueueFull:
                # Drop oldest frame on overflow to keep latency low
                try:
                    self._queue.get_nowait()
                except asyncio.QueueEmpty:
                    pass
                self._queue.put_nowait(frame_data)

    async def recv(self):
        """Return next 20ms AudioFrame, or silence if queue is empty."""
        try:
            data = await asyncio.wait_for(self._queue.get(), timeout=0.02)
        except (asyncio.TimeoutError, asyncio.QueueEmpty):
            data = self._silent_frame

        frame = AudioFrame(format="s16", layout="mono", samples=self.FRAME_SAMPLES)
        frame.planes[0].update(data.tobytes())
        frame.sample_rate = self.SAMPLE_RATE
        frame.pts = self._pts
        frame.time_base = fractions.Fraction(1, self.SAMPLE_RATE)
        self._pts += self.FRAME_SAMPLES
        return frame

    def clear(self):
        """Flush all queued + buffered audio during barge-in interrupt."""
        self._buffer = np.array([], dtype=np.int16)
        while not self._queue.empty():
            try:
                self._queue.get_nowait()
            except asyncio.QueueEmpty:
                break


