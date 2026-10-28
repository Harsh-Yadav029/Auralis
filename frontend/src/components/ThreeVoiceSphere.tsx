import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeVoiceSphereProps {
  emotion?: string;
  arousal?: number;
  valence?: number;
  sessionState?: string;
  size?: number;
}

export const ThreeVoiceSphere: React.FC<ThreeVoiceSphereProps> = ({
  emotion = 'CALM',
  arousal = 0.25,
  valence = 0.5,
  sessionState = 'IDLE',
  size = 200,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const uniformsRef = useRef<{
    time: { value: number };
    intensity: { value: number };
    color1: { value: THREE.Color };
    color2: { value: THREE.Color };
    speaking: { value: number };
  }>({
    time: { value: 0 },
    intensity: { value: 0.3 },
    color1: { value: new THREE.Color('#f0a94b') },
    color2: { value: new THREE.Color('#7928ca') },
    speaking: { value: 0 },
  });

  // Dynamic emotional color calculations
  useEffect(() => {
    const norm = emotion.toLowerCase();
    const c1 = uniformsRef.current.color1.value;
    const c2 = uniformsRef.current.color2.value;

    if (norm.includes('panic') || norm.includes('angry') || norm.includes('rage')) {
      c1.set('#ef4444');
      c2.set('#f97316');
      uniformsRef.current.intensity.value = 0.85 + arousal * 0.4;
    } else if (norm.includes('excited') || norm.includes('engaged')) {
      c1.set('#f59e0b');
      c2.set('#10b981');
      uniformsRef.current.intensity.value = 0.6 + arousal * 0.3;
    } else if (norm.includes('stress') || norm.includes('tense')) {
      c1.set('#eab308');
      c2.set('#f43f5e');
      uniformsRef.current.intensity.value = 0.7 + arousal * 0.3;
    } else if (norm.includes('sad') || norm.includes('depress') || valence < -0.2) {
      c1.set('#3b82f6');
      c2.set('#6366f1');
      uniformsRef.current.intensity.value = 0.25;
    } else {
      c1.set('#f0a94b');
      c2.set('#06b6d4');
      uniformsRef.current.intensity.value = 0.35 + arousal * 0.2;
    }

    if (sessionState === 'SPEAKING') {
      uniformsRef.current.speaking.value = 1.0;
    } else if (sessionState === 'LISTENING') {
      uniformsRef.current.speaking.value = 0.5;
    } else {
      uniformsRef.current.speaking.value = 0.15;
    }
  }, [emotion, arousal, valence, sessionState]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 4.8;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size, size);
    container.appendChild(renderer.domElement);

    // Glowing organic shader sphere
    const sphereGeometry = new THREE.IcosahedronGeometry(1.6, 32);

    const vertexShader = `
      uniform float time;
      uniform float intensity;
      uniform float speaking;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying float vDisplacement;

      // Classic Perlin 3D Noise by Stefan Gustavson
      vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
      vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

      float snoise(vec3 v){
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + 1.0 * C.xxx;
        vec3 x2 = x0 - i2 + 2.0 * C.xxx;
        vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
        i = mod(i, 289.0);
        vec4 p = permute(permute(permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        vec4 j = p - 49.0 * floor(p * (1.0 / 49.0));
        vec4 x_ = floor(j * (1.0 / 7.0));
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ * (2.0 / 7.0) + 0.5 / 7.0 - 1.0;
        vec4 y = y_ * (2.0 / 7.0) + 0.5 / 7.0 - 1.0;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }

      void main() {
        vNormal = normal;
        vPosition = position;
        float speed = 1.2 + speaking * 2.0;
        float noise = snoise(position * (1.4 + speaking * 0.8) + vec3(time * speed));
        vDisplacement = noise * (0.2 + intensity * 0.35 + speaking * 0.3);
        vec3 newPosition = position + normal * vDisplacement;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `;

    const fragmentShader = `
      uniform vec3 color1;
      uniform vec3 color2;
      uniform float speaking;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying float vDisplacement;

      void main() {
        // Fresnel glow
        vec3 viewDir = normalize(cameraPosition - vPosition);
        float fresnel = dot(viewDir, vNormal);
        fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
        fresnel = pow(fresnel, 2.2);

        // Mix colors according to displacement & fresnel
        float mixFactor = clamp((vDisplacement + 0.3) * 1.5, 0.0, 1.0);
        vec3 baseColor = mix(color1, color2, mixFactor);

        // Add soft rim light
        vec3 glow = mix(color1, vec3(1.0), 0.5) * fresnel * (1.2 + speaking * 1.0);
        vec3 finalColor = baseColor + glow;

        gl_FragColor = vec4(finalColor, 0.94);
      }
    `;

    const sphereMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        time: uniformsRef.current.time,
        intensity: uniformsRef.current.intensity,
        color1: uniformsRef.current.color1,
        color2: uniformsRef.current.color2,
        speaking: uniformsRef.current.speaking,
      },
      transparent: true,
    });

    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);

    // Outer Halo Ring
    const ringGeometry = new THREE.RingGeometry(2.1, 2.18, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xf0a94b,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2.6;
    scene.add(ring);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      uniformsRef.current.time.value += delta;

      sphere.rotation.y += delta * 0.4;
      sphere.rotation.x += delta * 0.2;
      ring.rotation.z += delta * 0.3;

      ringMaterial.color.copy(uniformsRef.current.color1.value);
      ringMaterial.opacity = 0.25 + uniformsRef.current.intensity.value * 0.3;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      sphereGeometry.dispose();
      sphereMaterial.dispose();
      ringGeometry.dispose();
      ringMaterial.dispose();
      renderer.dispose();
    };
  }, [size]);

  return (
    <div
      ref={mountRef}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    />
  );
};

