import React, { useEffect, useRef } from 'react';

export const AccretionDiskBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;
    let resizeObserver: ResizeObserver | null = null;

    function syncSize() {
      if (!canvas) return;
      const w = canvas.clientWidth || window.innerWidth || 1280;
      const h = canvas.clientHeight || window.innerHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(syncSize);
      resizeObserver.observe(canvas);
    }
    syncSize();

    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return;

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

    const fs = `precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

// Black Hole & Accretion Disk Shader
#define PI 3.14159265359

// Hash function
float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

// 2D Noise
float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// FBM (Fractal Brownian Motion)
float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 5; ++i) {
        v += a * noise(p);
        p = rot * p * 2.0 + vec2(100.0);
        a *= 0.5;
    }
    return v;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    
    // Slight offset upwards so the black hole sits right behind the hero & interactive preview
    vec2 center = vec2(0.0, 0.08);
    vec2 p = uv - center;
    
    float r = length(p);
    float theta = atan(p.y, p.x);
    
    // Background deep void space with star field
    vec3 col = vec3(0.012, 0.012, 0.024); // #030308 base
    
    // Distant twinkle stars
    vec2 starUv = uv * 35.0;
    float starGrid = hash(floor(starUv));
    if (starGrid > 0.985) {
        float sparkle = sin(u_time * 2.5 + starGrid * 6.28) * 0.5 + 0.5;
        col += vec3(0.8, 0.9, 1.0) * sparkle * smoothstep(0.1, 0.0, length(fract(starUv) - 0.5));
    }

    // Gravitational lensing warp
    float eventHorizon = 0.18;
    float photonSphere = 0.26;
    float accretionOuter = 0.75;
    
    // Swirling motion for accretion vortex
    float swirlSpeed = 0.7;
    float angleWarp = theta - (u_time * swirlSpeed) - 2.5 / (r + 0.08);
    
    // Accretion disk spiral arms texture
    vec2 diskCoord = vec2(r * 5.0, angleWarp * 1.5);
    float flow = fbm(diskCoord + vec2(-u_time * 0.4, 0.0));
    float flow2 = fbm(diskCoord * 1.8 + vec2(u_time * 0.3, flow));
    
    // Accretion glow mask
    float diskIntensity = smoothstep(eventHorizon * 0.95, photonSphere, r) * smoothstep(accretionOuter, photonSphere * 1.1, r);
    diskIntensity = pow(diskIntensity, 1.4);
    
    // Spectral color gradient: deep violet -> electric cyan -> blazing white starlight -> pulsar pink
    vec3 colCyan = vec3(0.22, 0.74, 0.97);    // #38bdf8
    vec3 colViolet = vec3(0.55, 0.35, 0.95);  // #8b5cf6 / #c084fc
    vec3 colPink = vec3(0.96, 0.45, 0.71);    // #f472b6
    vec3 colCoreWhite = vec3(1.0, 0.98, 0.95);

    // Color distribution based on radius and turbulence
    vec3 diskCol = mix(colViolet, colCyan, smoothstep(photonSphere, accretionOuter * 0.7, r + flow * 0.1));
    diskCol = mix(diskCol, colPink, smoothstep(accretionOuter * 0.5, accretionOuter, r) * 0.6);
    diskCol = mix(diskCol, colCoreWhite, pow(smoothstep(photonSphere * 1.3, photonSphere, r), 2.5) * 0.85);
    
    // Relativistic Doppler beaming effect (one side brighter due to high orbital velocity)
    float beaming = 1.0 + 0.45 * sin(theta + 0.3);
    
    // Apply accretion disk
    float totalGas = (flow * 0.6 + flow2 * 0.4) * diskIntensity * beaming;
    col += diskCol * totalGas * 2.8;
    
    // Photon ring / event horizon border (intense razor thin starlight rim)
    float photonRing = exp(-pow((r - photonSphere) * 45.0, 2.0));
    col += vec3(0.85, 0.95, 1.0) * photonRing * 3.5;
    
    // Secondary outer faint ring
    float outerRing = exp(-pow((r - photonSphere * 1.45) * 20.0, 2.0)) * 0.3;
    col += colCyan * outerRing * 1.2;

    // True Black Hole Singularity (pitch black inside the shadow)
    float blackHoleShadow = smoothstep(eventHorizon * 1.05, eventHorizon * 0.96, r);
    col *= (1.0 - blackHoleShadow);

    // Subtle atmospheric cosmic dust radial glow
    float nebulaHaze = 1.0 / (1.0 + r * 3.5);
    col += mix(vec3(0.08, 0.04, 0.18), vec3(0.02, 0.12, 0.22), sin(theta * 2.0 + u_time * 0.1) * 0.5 + 0.5) * nebulaHaze * 0.35;

    gl_FragColor = vec4(col, 1.0);
}
`;

    function cs(type: number, src: string) {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    }

    const prog = gl.createProgram();
    if (!prog) return;

    const vertShader = cs(gl.VERTEX_SHADER, vs);
    const fragShader = cs(gl.FRAGMENT_SHADER, fs);
    if (!vertShader || !fragShader) return;

    gl.attachShader(prog, vertShader);
    gl.attachShader(prog, fragShader);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(prog));
      return;
    }

    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };

    const handleMouseMove = (event: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (event.clientX - rect.left) / rect.width;
        const ny = 1.0 - (event.clientY - rect.top) / rect.height;
        mouse.x = nx * canvas.width;
        mouse.y = ny * canvas.height;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const render = (t: number) => {
      syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (buf) gl.deleteBuffer(buf);
      if (vertShader) gl.deleteShader(vertShader);
      if (fragShader) gl.deleteShader(fragShader);
      if (prog) gl.deleteProgram(prog);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden" style={{ display: 'block' }}>
      <canvas
        ref={canvasRef}
        id="shader-canvas-ANIMATION_8"
        className="w-full h-full block"
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
      {/* Ambient Cosmic Vignette Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#030308]/40 via-transparent to-[#030308]/90 pointer-events-none z-0" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] cosmic-radial-glow pointer-events-none z-0" />
    </div>
  );
};

export default AccretionDiskBackground;
