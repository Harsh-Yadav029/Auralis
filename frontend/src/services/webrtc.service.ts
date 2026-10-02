export interface WebRTCConfig {
  signalingUrl: string;
  iceServers: RTCIceServer[];
  onTranscript: (text: string) => void;
  onEmotionUpdate: (arousal: number, valence: number, label: string) => void;
  onStateChange: (state: string) => void;
  onLatencyUpdate: (ttfaMs: number) => void;
}

export class AuralisWebRTCClient {
  private pc: RTCPeerConnection | null = null;
  private ws: WebSocket | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private localStream: MediaStream | null = null;

  constructor(private config: WebRTCConfig) {}

  async initialize(): Promise<MediaStream> {
    this.localStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000,
        channelCount: 1,
      },
      video: false,
    });

    this.pc = new RTCPeerConnection({ iceServers: this.config.iceServers });

    this.localStream.getTracks().forEach((track) => {
      this.pc?.addTrack(track, this.localStream!);
    });

    this.pc.ontrack = (event) => {
      const remoteAudio = new Audio();
      remoteAudio.srcObject = event.streams[0];
      remoteAudio.play().catch(console.error);
    };

    this.setupDataChannel();
    await this.connectSignaling();
    return this.localStream;
  }

  private setupDataChannel() {
    if (!this.pc) return;
    this.dataChannel = this.pc.createDataChannel("auralis-control");
    this.dataChannel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === "TRANSCRIPT") this.config.onTranscript(data.text);
        if (data.event === "EMOTION") this.config.onEmotionUpdate(data.arousal, data.valence, data.label);
        if (data.event === "STATE_CHANGE") this.config.onStateChange(data.state);
        if (data.event === "LATENCY") this.config.onLatencyUpdate(data.ttfa);
      } catch (err) {
        console.error("Failed to parse DataChannel event", err);
      }
    };
  }

  private async connectSignaling() {
    this.ws = new WebSocket(this.config.signalingUrl);
    this.ws.onopen = async () => {
      const offer = await this.pc?.createOffer();
      await this.pc?.setLocalDescription(offer);
      this.ws?.send(JSON.stringify({ type: "offer", sdp: offer?.sdp }));
    };

    this.ws.onmessage = async (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "answer") {
        await this.pc?.setRemoteDescription(new RTCSessionDescription(msg));
      } else if (msg.type === "candidate") {
        await this.pc?.addIceCandidate(new RTCIceCandidate(msg.candidate));
      }
    };
  }

  sendTurnRequest(transcript: string, emotion: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: "user_turn",
        transcript,
        emotion
      }));
    }
  }

  triggerBargeIn() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "barge_in" }));
    }
  }

  disconnect() {
    this.localStream?.getTracks().forEach((track) => track.stop());
    this.dataChannel?.close();
    this.pc?.close();
    this.ws?.close();
  }
}
