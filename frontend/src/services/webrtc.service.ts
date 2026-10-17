export interface WebRTCConfig {
  signalingUrl: string;
  iceServers: RTCIceServer[];
  onTranscript: (text: string) => void;
  onEmotionUpdate: (arousal: number, valence: number, label: string) => void;
  onStateChange: (state: string) => void;
  onLatencyUpdate: (ttfaMs: number) => void;
  onAiText?: (text: string) => void;
  onRemoteStream?: (stream: MediaStream) => void;
  onBCSMScore?: (data: any) => void;
  onFusionUpdate?: (data: any) => void;
  onScenarioUpdate?: (data: any) => void;
}

export class AuralisWebRTCClient {
  private pc: RTCPeerConnection | null = null;
  private ws: WebSocket | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private localStream: MediaStream | null = null;
  private remoteAudioElement: HTMLAudioElement | null = null;

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
      if (!this.remoteAudioElement) {
        this.remoteAudioElement = new Audio();
        this.remoteAudioElement.autoplay = true;
      }
      this.remoteAudioElement.srcObject = event.streams[0];
      this.remoteAudioElement.play().catch(console.error);
      if (this.config.onRemoteStream) {
        this.config.onRemoteStream(event.streams[0]);
      }
    };

    this.setupDataChannel();
    await this.connectSignaling();
    return this.localStream;
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  private handleEvent(data: any) {
    if (data.event === "TRANSCRIPT") this.config.onTranscript(data.text);
    if (data.event === "EMOTION") this.config.onEmotionUpdate(data.arousal, data.valence, data.label);
    if (data.event === "STATE_CHANGE") this.config.onStateChange(data.state);
    if (data.event === "LATENCY") this.config.onLatencyUpdate(data.ttfa);
    if (data.event === "AI_TEXT" && this.config.onAiText) this.config.onAiText(data.text);
    if (data.event === "BCSM_SCORE" && this.config.onBCSMScore) this.config.onBCSMScore(data);
    if (data.event === "FUSION" && this.config.onFusionUpdate) this.config.onFusionUpdate(data);
    if (data.event === "SCENARIO_UPDATED" && this.config.onScenarioUpdate) this.config.onScenarioUpdate(data);
  }

  private setupDataChannel() {
    if (!this.pc) return;
    this.dataChannel = this.pc.createDataChannel("auralis-control");
    this.dataChannel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleEvent(data);
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
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "answer") {
          await this.pc?.setRemoteDescription(new RTCSessionDescription(msg));
        } else if (msg.type === "candidate") {
          await this.pc?.addIceCandidate(new RTCIceCandidate(msg.candidate));
        } else if (msg.event) {
          this.handleEvent(msg);
        }
      } catch (e) {
        console.error("Error handling signaling message", e);
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

  selectScenario(scenarioId: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: "change_scenario",
        scenario_id: scenarioId
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
    if (this.remoteAudioElement) {
      this.remoteAudioElement.srcObject = null;
    }
    this.dataChannel?.close();
    this.pc?.close();
    this.ws?.close();
  }
}

