import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

class Sketch {
    constructor(options) {
        this.scene = new THREE.Scene();

        this.container = options.dom;
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;

        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor("#111", 1);
        this.renderer.physicallyCorrectLights = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        console.log("WebGL Capabilities:", this.renderer.capabilities);

        this.container.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(
            70,
            this.width / this.height,
            0.001,
            1000
        );
        this.camera.position.set(0, 0, 4);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        this.time = 0;
        this.isPlaying = true;
        this.clock = new THREE.Clock();
        this.allVeins = Array.from({ length: 10 }, (_, i) => i + 1); // Veins 1-10
        this.activeVeins = [];
        this.staggerDelays = [];
        this.groupStart = 0;
        this.veinList = [];

        this.settings();
        this.material();
        this.setupPostProcessing();
        this.light();
        this.addModel();
        this.resize();
        this.setupResize();
    }

    settings() {
        this.settings = {
            test: 1,
            useShaderMaterial: true,
            animationSpeed: 1.0,
            pulseSpeed: 0.25,
            waveWidth: 0.075,
            minActiveVeins: 2,
            maxActiveVeins: 3,
            whichUV: 0,
            reverseDirection: true,
            pulseDelay: 0.025,
            groupStagger: 0.125,
            glowStrength: 1.0,
            pulseColor: "#0e5d66",
            debugUV: false,
            easingType: "linear",
            bloomThreshold: 0.085,
            bloomStrength: 1.75,
            bloomRadius: 0.25,
            fresnelStrength: 5, // Fresnel effect strength
            fresnelPower: 5,   // Fresnel power for edge sharpness
        };
        this.gui = new dat.GUI();
        this.gui.add(this.settings, "test", 0, 1, 0.01);
        this.gui.add(this.settings, "useShaderMaterial").name("Use Shader Material").onChange((value) => {
            if (this.heart) {
                this.heart.traverse((child) => {
                    if (child.isMesh) {
                        child.material = value ? this.material : this.heart.userData.originalMaterial;
                    }
                });
            }
        });
        this.gui.add(this.settings, "animationSpeed", 0, 5, 0.1).name("Animation Speed");
        this.gui.add(this.settings, "pulseSpeed", 0, 10, 0.1).name("Pulse Speed").onChange((value) => {
            this.material.uniforms.speed.value = value;
        });
        this.gui.add(this.settings, "waveWidth", 0, 0.5, 0.01).name("Pulse Width").onChange((value) => {
            this.material.uniforms.waveWidth.value = value;
        });
        this.gui.add(this.settings, "minActiveVeins", 1, 5, 1).name("Min Active Veins");
        this.gui.add(this.settings, "maxActiveVeins", 1, 10, 1).name("Max Active Veins");
        this.gui.add(this.settings, "whichUV", 0, 1, 1).name("Which UV (0:x,1:y)").onChange((value) => {
            this.material.uniforms.whichUV.value = value;
        });
        this.gui.add(this.settings, "reverseDirection").name("Reverse Direction").onChange((value) => {
            this.material.uniforms.reverseDirection.value = value ? 1.0 : 0.0;
        });
        this.gui.add(this.settings, "pulseDelay", 0, 5, 0.1).name("Group Delay");
        this.gui.add(this.settings, "groupStagger", 0, 1, 0.05).name("Group Stagger");
        this.gui.add(this.settings, "glowStrength", 0, 10, 0.1).name("Glow Strength").onChange((value) => {
            this.material.uniforms.glowStrength.value = value;
        });
        this.gui.addColor(this.settings, "pulseColor").name("Pulse Color").onChange((value) => {
            this.material.uniforms.pulseColor.value.set(value);
        });
        this.gui.add(this.settings, "debugUV").name("Debug UV Map").onChange((value) => {
            this.material.uniforms.debugUV.value = value ? 1.0 : 0.0;
        });
        this.gui.add(this.settings, "easingType", ["linear", "easeInQuad", "easeOutQuad", "easeInOutQuad"]).name("Easing Type");
        this.gui.add(this.settings, "bloomThreshold", 0, 1, 0.01).name("Bloom Threshold").onChange((value) => {
            this.bloomPass.threshold = value;
        });
        this.gui.add(this.settings, "bloomStrength", 0, 3, 0.1).name("Bloom Strength").onChange((value) => {
            this.bloomPass.strength = value;
        });
        this.gui.add(this.settings, "bloomRadius", 0, 1, 0.01).name("Bloom Radius").onChange((value) => {
            this.bloomPass.radius = value;
        });
        this.gui.add(this.settings, "fresnelStrength", -1, 10, 1).name("Fresnel Strength").onChange((value) => {
            this.material.uniforms.fresnelStrength.value = value;
        });
        this.gui.add(this.settings, "fresnelPower", -1, 10, 0.01).name("Fresnel Power").onChange((value) => {
            this.material.uniforms.fresnelPower.value = value;
        });
    }

    setupPostProcessing() {
        const renderScene = new RenderPass(this.scene, this.camera);

        this.bloomPass = new UnrealBloomPass(new THREE.Vector2(this.width, this.height), this.settings.bloomStrength, this.settings.bloomRadius, this.settings.bloomThreshold);

        this.bloomComposer = new EffectComposer(this.renderer);
        this.bloomComposer.renderToScreen = false;
        this.bloomComposer.addPass(renderScene);
        this.bloomComposer.addPass(this.bloomPass);

        const finalPass = new ShaderPass(
            new THREE.ShaderMaterial({
                uniforms: {
                    baseTexture: { value: null },
                    bloomTexture: { value: this.bloomComposer.renderTarget2.texture }
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform sampler2D baseTexture;
                    uniform sampler2D bloomTexture;
                    varying vec2 vUv;
                    void main() {
                        gl_FragColor = texture2D(baseTexture, vUv) + texture2D(bloomTexture, vUv);
                    }
                `,
                defines: {}
            }), 'baseTexture'
        );
        finalPass.needsSwap = true;

        this.finalComposer = new EffectComposer(this.renderer);
        this.finalComposer.addPass(renderScene);
        this.finalComposer.addPass(finalPass);
    }

    light() {
        const light = new THREE.AmbientLight(0x404040);
        this.scene.add(light);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        this.scene.add(directionalLight);
    }

    addModel() {
        const loader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('./draco/');
        loader.setDRACOLoader(dracoLoader);

        loader.load(
            '/model/today2.glb', 
            // '/model/heartokay.glb', 
            (gltf) => {
            this.heart = gltf.scene; // Use the entire scene
            this.scene.add(this.heart);

            // Store the original material of the first mesh as a reference
            this.heart.traverse((child) => {
                if (child.isMesh) {
                    this.heart.userData.originalMaterial = child.material.clone();
                    console.log("Original material:", this.heart.userData.originalMaterial);
                    return; // Stop after finding the first mesh
                }
            });
            if (!this.heart.userData.originalMaterial) {
                console.log("No valid MeshStandardMaterial found, using fallback.");
                this.heart.userData.originalMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
            }

            // Apply shader material to all meshes in the scene with vein ID fallback
            this.heart.traverse((child) => {
                if (child.isMesh && child.geometry.attributes && child.geometry.attributes._attribute_veinid) {
                    const veinIdAttr = child.geometry.attributes._attribute_veinid;
                    console.log('veinID values:', veinIdAttr.array);
                    child.geometry.setAttribute('_attribute_veinid', veinIdAttr);
                    child.material = this.material;
                    child.material.needsUpdate = true;

                    // Fallback: Assign random vein IDs if all are zero
                    const veinIds = veinIdAttr.array;
                    let hasNonZero = false;
                    for (let i = 0; i < veinIds.length; i++) {
                        if (veinIds[i] > 0) {
                            hasNonZero = true;
                            break;
                        }
                    }
                    if (!hasNonZero && veinIds.length > 0) {
                        for (let i = 0; i < veinIds.length; i += Math.floor(veinIds.length / 10)) {
                            veinIds[i] = Math.floor(Math.random() * 10) + 1; // Assign random vein IDs (1-10)
                        }
                        child.geometry.attributes._attribute_veinid.needsUpdate = true;
                        console.log(`Fallback veinIDs assigned for ${child.name}:`, veinIds);
                    }
                }
            });

            this.selectNewGroup();
            this.render(); // Start render loop after model is loaded
        }, undefined, (error) => {
            console.error('Error loading model:', error);
        });
    }

    material() {
        this.material = new THREE.ShaderMaterial({
            side: THREE.DoubleSide,
            uniforms: {
                speed: { value: this.settings.pulseSpeed },
                waveWidth: { value: this.settings.waveWidth },
                whichUV: { value: this.settings.whichUV },
                reverseDirection: { value: this.settings.reverseDirection ? 1.0 : 0.0 },
                glowStrength: { value: this.settings.glowStrength },
                pulseColor: { value: new THREE.Color(this.settings.pulseColor) },
                debugUV: { value: this.settings.debugUV ? 1.0 : 0.0 },
                currentVeins: { value: new Array(10).fill(-1.0) },
                progresses: { value: new Array(10).fill(0.0) },
                numActive: { value: 0 },
                isGlowPass: { value: 0.0 },
                fresnelStrength: { value: this.settings.fresnelStrength },
                fresnelPower: { value: this.settings.fresnelPower },
                viewVector: { value: new THREE.Vector3() },
            },
            vertexShader: `
                attribute float _attribute_veinid;
                varying float vVeinID;
                varying vec2 vUv;
                varying vec3 vViewPosition;
                void main() {
                    vUv = uv;
                    vVeinID =_attribute_veinid;
                    vViewPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying float vVeinID;
                varying vec2 vUv;
                varying vec3 vViewPosition;
                uniform float waveWidth;
                uniform float reverseDirection;
                uniform int whichUV;
                uniform float glowStrength;
                uniform vec3 pulseColor;
                uniform float debugUV;
                uniform float currentVeins[10];
                uniform float progresses[10];
                uniform int numActive;
                uniform float isGlowPass;
                uniform float fresnelStrength;
                uniform float fresnelPower;
                uniform vec3 viewVector;

                #define S(a, b, c) smoothstep(a, b, c)

                void main() {
                    if (debugUV > 0.5) {
                        gl_FragColor = vec4(vUv.x, vUv.y, 0.0, 1.0);
                        return;
                    }

                    // Black base color
                    vec3 baseColor = vec3(0.0, 0.0, 0.0);

                    // Fresnel effect
                    vec3 normal = normalize(cross(dFdx(vViewPosition), dFdy(vViewPosition)));
                    vec3 viewDir = normalize(-vViewPosition);
                    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), fresnelPower) * fresnelStrength;

                    // Darken veins slightly for contrast
                    if (vVeinID > 0.5) {
                        baseColor *= 0.6;
                    }

                    float coord = (whichUV == 0) ? vUv.x : vUv.y;
                    if (reverseDirection > 0.5) coord = 1.0 - coord;

                    float f = 0.0;
                    for (int i = 0; i < 9; i++) {
                        if (i >= numActive) break;
                        if (abs(vVeinID - currentVeins[i]) < 0.01) {
                            float normAt = progresses[i];
                            float hWidth = waveWidth * 0.5;
                            float fw = fwidth(coord);
                            f = S(hWidth + fw, hWidth, abs(coord - normAt));
                            break;
                        }
                    }

                    vec3 glow = pulseColor * f * glowStrength;

                    if (isGlowPass > 0.5) {
                        gl_FragColor = vec4(glow + fresnel * pulseColor, 1.0);
                    } else {
                        gl_FragColor = vec4(baseColor + glow + fresnel * pulseColor, 1.0);
                    }
                }
            `,
        });
    }

    selectNewGroup() {
        if (this.veinList.length < this.settings.maxActiveVeins) {
            this.veinList = [...this.allVeins].sort(() => Math.random() - 0.5);
        }

        const num = Math.floor(Math.random() * (this.settings.maxActiveVeins - this.settings.minActiveVeins + 1)) + this.settings.minActiveVeins;

        this.activeVeins = this.veinList.splice(0, num);
        this.staggerDelays = Array.from({ length: num }, (_, i) => i * this.settings.groupStagger);

        // Use the user-defined pulseColor without randomization
        this.material.uniforms.pulseColor.value.set(this.settings.pulseColor);

        const currentVeinsArray = this.material.uniforms.currentVeins.value;
        for (let i = 0; i < 10; i++) {
            currentVeinsArray[i] = i < num ? this.activeVeins[i] : -1.0;
        }
        this.material.uniforms.numActive.value = num;

        this.groupStart = this.time;

        console.log("New group started with veins:", this.activeVeins);
    }

    ease(progress, type) {
        switch (type) {
            case "easeInQuad":
                return progress * progress;
            case "easeOutQuad":
                return progress * (2 - progress);
            case "easeInOutQuad":
                return progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
            default:
                return progress;
        }
    }

    setupResize() {
        window.addEventListener("resize", this.resize.bind(this));
    }

    resize() {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer.setSize(this.width, this.height);
        this.bloomComposer.setSize(this.width, this.height);
        this.finalComposer.setSize(this.width, this.height);
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
    }

    stop() {
        this.isPlaying = false;
    }

    play() {
        if (!this.isPlaying) {
            this.isPlaying = true;
            this.render();
        }
    }

    render() {
        if (!this.isPlaying || !this.heart) return;
        const delta = this.clock.getDelta();
        this.time += delta * this.settings.animationSpeed;

        const speed = this.material.uniforms.speed.value;
        let maxRawProgress = 0;

        if (this.activeVeins.length > 0) {
            for (let i = 0; i < this.activeVeins.length; i++) {
                const delay = this.staggerDelays[i];
                const rawProgress = (this.time - this.groupStart - delay) * speed;
                maxRawProgress = Math.max(maxRawProgress, rawProgress);
                const clamped = Math.min(Math.max(rawProgress, 0), 1);
                const eased = this.ease(clamped, this.settings.easingType);
                this.material.uniforms.progresses.value[i] = eased;
            }

            if (maxRawProgress > 1.0 + this.settings.pulseDelay) {
                this.activeVeins = [];
                this.staggerDelays = [];
                this.material.uniforms.numActive.value = 0;
                this.selectNewGroup();
            }
        }

        // Update view vector for Fresnel using camera position relative to heart
        if (this.heart && this.heart.position) {
            this.material.uniforms.viewVector.value.copy(
                this.camera.position.clone().sub(this.heart.position).normalize()
            );
        } else {
            this.material.uniforms.viewVector.value.copy(this.camera.position.clone().normalize());
        }

        // Render bloom pass with glow only
        this.material.uniforms.isGlowPass.value = 1.0;
        this.bloomComposer.render();

        // Render final with normal + bloom
        this.material.uniforms.isGlowPass.value = 0.0;
        this.finalComposer.render();

        requestAnimationFrame(this.render.bind(this));
    }
}

new Sketch({
    dom: document.querySelector(".canvas"),
});