import asyncio
import fractions
import numpy as np
from aiortc import MediaStreamTrack
from av import AudioFrame

class CustomOutboundAudioTrack(MediaStreamTrack):
    """Outbound WebRTC track streaming generated TTS PCM audio chunks to browser."""
    kind = "audio"

    def __init__(self):
        super().__init__()
        self.queue = asyncio.Queue()
        self._pts = 0
        self.sample_rate = 48000
        self.channels = 1

    async def add_pcm_chunk(self, pcm_data_16k: np.ndarray):
        """Resample 16kHz TTS output to 48kHz and push to outbound WebRTC queue."""
        if pcm_data_16k.size == 0:
            return
        
        # Replaced scipy.signal.resample_poly with numpy interpolation to avoid DLL load issues
        x_old = np.linspace(0, 1, len(pcm_data_16k))
        x_new = np.linspace(0, 1, len(pcm_data_16k) * 3)
        resampled = np.interp(x_new, x_old, pcm_data_16k).astype(np.int16)
        
        await self.queue.put(resampled)

    async def recv(self):
        frame_size = 960  # 20ms frame at 48kHz
        data = await self.queue.get()
        
        # Ensure exact frame length
        if len(data) < frame_size:
            padded = np.zeros(frame_size, dtype=np.int16)
            padded[:len(data)] = data
            data = padded
        else:
            data = data[:frame_size]

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
