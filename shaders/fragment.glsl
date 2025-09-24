// uniform float time;
// uniform float mouse;
// varying vec2 vUv;
// varying vec3 vPosition;
// varying vec3 vNormal;
// varying vec3 eyeVector;
// varying vec3 vBary;
// float PI = 3.141592653589793238;

// void main() {
//     // Visualize vertex position to detect animation
//     vec3 color = normalize(vPosition) * 0.5 + 0.5; // Map position to color
//     // Alternative: Use normal for visualization
//     // vec3 color = normalize(vNormal) * 0.5 + 0.5;
//     gl_FragColor = vec4(color, 1.0);
// }

// uniform float time;
// uniform float mouse;
// varying vec2 vUv;
// varying vec3 vPosition;
// varying vec3 vNormal;
// varying vec3 eyeVector;
// varying vec3 vBary;
// float PI = 3.141592653589793238;

// void main() {
//     // Use normal to visualize animation (changes with vertex movement)
//     vec3 color = normalize(vNormal) * 0.5 + 0.5;
//     gl_FragColor = vec4(color, 1.0);
// }


// uniform float time;
// uniform float mouse;
// varying vec2 vUv;
// varying vec3 vPosition;
// varying vec3 vNormal;
// varying vec3 eyeVector;
// varying vec3 vBary;
// float PI = 3.141592653589793238;

// void main() {
//     // Simple diffuse lighting
//     vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0)); // Example light direction
//     float diffuse = max(dot(normalize(vNormal), lightDir), 0.0);
//     vec3 color = vec3(0.0, 0.8824, 1.0) * diffuse; // Base color modulated by diffuse
//     color += normalize(vNormal) * 0.2; // Add some normal-based color for visibility
//     gl_FragColor = vec4(color, 1.0);
// }


varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vMatCapUV;

uniform sampler2D uMatCap;
uniform float uSpecterSize;
uniform float uWaveBorder;
uniform float uWaveSpeed;
uniform vec3 uBorderColor;
uniform float uTime;
uniform float uSpecterCount;

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// void main() {
//     // float n3 = snoise(vec3(vPosition.xz * 1.0, uTime * 0.01)) * 0.5;
//     float n3 = 2.;
//     float w = sin(vPosition.z * 1.0 - uTime * uWaveSpeed);

//     float borderMask = step(w, n3 - uSpecterSize);
//     borderMask -= step(w, n3 - (uSpecterSize + uWaveBorder));
//     vec4 borderOut = vec4(uBorderColor * borderMask, borderMask);

//     float mcMask = step(w, n3 - uSpecterSize);
//     vec4 matCap = texture2D(uMatCap, vMatCapUV);
//     vec4 matCapOut = vec4(matCap.rgb, mcMask);

//     float opMask = 1.0 - vPosition.y;
//     opMask *= 0.15;
//     opMask += 0.5;
//     vec4 opMaskOut = vec4(1.0, 1.0, 1.0, opMask);

//     vec4 col = matCapOut + borderOut;
//     col *= opMaskOut;

//     gl_FragColor = vec4(col);
// }

void main() {
    float n3 = 2.;
    float w = sin(vPosition.z * uSpecterCount - uTime * uWaveSpeed);

    float borderMask = step(w, n3 - uSpecterSize);
    borderMask -= step(w, n3 - (uSpecterSize + uWaveBorder));
    vec4 borderOut = vec4(uBorderColor * borderMask, borderMask);

    float mcMask = step(w, n3 - uSpecterSize);
    vec4 matCap = texture2D(uMatCap, vMatCapUV);
    vec4 matCapOut = vec4(matCap.rgb, mcMask);

    float opMask = 1.0 - vPosition.y;
    opMask *= 0.15;
    opMask += 0.5;
    vec4 opMaskOut = vec4(1.0, 1.0, 1.0, opMask);

    vec4 col = matCapOut + borderOut;
    col *= opMaskOut;

    gl_FragColor = vec4(col);
}




// uniform float time;
// uniform float mouse;
// uniform float impulseSpeed;
// uniform float impulseIntensity;
// uniform float veinIndex;
// uniform float impulseProgress;
// uniform float numVeins;
// varying vec2 vUv;
// varying vec3 vPosition;
// varying vec3 vNormal;
// varying vec3 eyeVector;
// varying vec3 vBary;
// float PI = 3.141592653589793238;

// float random(float seed) {
//     return fract(sin(seed * 127.1 + time * 0.1) * 43758.5453);
// }

// float glow(float dist, float width) {
//     return smoothstep(-width, width, dist);
// }

// void main() {
//     // Base diffuse lighting
//     vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
//     float diffuse = max(dot(normalize(vNormal), lightDir), 0.0);
//     vec3 baseColor = vec3(0.0, 0.8824, 1.0) * diffuse;
//     baseColor += normalize(vNormal) * 0.2;

//     // Simulate vein selection using UV.y (assuming veins align roughly along UV.y)
//     float veinID = floor(vUv.y * numVeins);
//     float isActiveVein = step(abs(veinID - veinIndex), 0.5);

//     // Impulse effect: glow travels along UV.y
//     float impulsePos = impulseProgress * impulseSpeed;
//     float glowWidth = 0.1;
//     float glowDist = abs(vUv.y - impulsePos);
//     float impulseGlow = glow(glowDist, glowWidth) * isActiveVein * impulseIntensity;

//     // Combine base color with impulse glow
//     vec3 glowColor = vec3(1.0, 0.0, 0.0); // Yellowish glow
//     vec3 finalColor = baseColor + glowColor * impulseGlow;

//     gl_FragColor = vec4(finalColor, 1.0);
// }




// uniform float time;
// uniform float mouse;
// uniform float currentVein;
// uniform float pulseTime;
// uniform float speed;
// uniform float waveWidth;
// uniform float numVeins;
// uniform float whichUV;
// uniform float invertAlong;
// uniform float glowStrength;
// varying vec2 vUv;
// varying vec2 vUv1;
// varying vec2 vUv2;
// varying vec3 vPosition;
// varying vec3 vNormal;
// varying vec3 eyeVector;
// varying vec3 vBary;
// float PI = 3.141592653589793238;

// void main() {
//     // Simple diffuse lighting
//     vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0)); // Example light direction
//     float diffuse = max(dot(normalize(vNormal), lightDir), 0.0);
//     vec3 color = vec3(0.0, 0.8824, 1.0) * diffuse; // Base color modulated by diffuse
//     color += normalize(vNormal) * 0.2; // Add some normal-based color for visibility

//     // Impulse effect
//     vec2 coord;
//     if (whichUV < 0.5) {
//         coord = vUv;
//     } else if (whichUV < 1.5) {
//         coord = vUv1;
//     } else {
//         coord = vUv2;
//     }
//     float along = invertAlong > 0.5 ? 1.0 - coord.y : coord.y;
//     float veinID = floor(coord.x * numVeins);
//     vec3 glow = vec3(0.0);
//     if (veinID == currentVein) {
//         float wavePos = pulseTime * speed;
//         float dist = abs(wavePos - along);
//         if (dist < waveWidth) {
//             float intensity = (1.0 - dist / waveWidth) * glowStrength;
//             glow = vec3(1.0, 0.0, 0.0) * intensity; // Yellow glow
//         }
//     }

//     gl_FragColor = vec4(color + glow, 1.0);
// }



// uniform float time;
// uniform float mouse;
// uniform float currentVein;
// uniform float pulseTime;
// uniform float speed;
// uniform float waveWidth;
// uniform float numVeins;
// uniform float whichUV;
// uniform float reverseDirection;
// uniform float glowStrength;
// uniform float debugUV;
// varying vec2 vUv;
// varying vec2 vUv1;
// varying vec2 vUv2;
// varying vec3 vPosition;
// varying vec3 vNormal;
// varying vec3 eyeVector;
// varying vec3 vBary;
// float PI = 3.141592653589793238;

// void main() {
//     vec2 coord;
//     if (whichUV < 0.5) {
//         coord = vUv;
//     } else if (whichUV < 1.5) {
//         coord = vUv1;
//     } else {
//         coord = vUv2;
//     }

//     if (debugUV > 0.5) {
//         gl_FragColor = vec4(coord.x, coord.y, 0.0, 1.0);
//         return;
//     }

//     vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
//     float diffuse = max(dot(normalize(vNormal), lightDir), 0.0);
//     vec3 color = vec3(0.0, 0.8824, 1.0) * diffuse;
//     color += normalize(vNormal) * 0.2;

//     float veinID = floor(coord.x * numVeins);
//     vec3 glow = vec3(0.0);
//     if (veinID == currentVein) {
//         float along = coord.y;
//         float wavePos = reverseDirection > 0.5 ? 1.0 - pulseTime * speed : pulseTime * speed;
//         float dist = abs(wavePos - along);
//         if (dist < waveWidth) {
//             float intensity = (1.0 - dist / waveWidth) * glowStrength;
//             float startFade = smoothstep(0.0, waveWidth, along);
//             float endFade = smoothstep(1.0, 1.0 - waveWidth, along);
//             float fade = reverseDirection > 0.5 ? endFade : startFade;
//             glow = vec3(0.0, 1.0, 1.0) * intensity * fade; // Cyan glow
//         }
//     }

//     gl_FragColor = vec4(color + glow, 1.0);
// }