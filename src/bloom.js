
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import * as dat from "dat.gui";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import vertex from "../shaders/vertex1.glsl";
import fragment from "../shaders/fragment1.glsl";

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
        this.renderer.setClearColor("#010101", 1);
        this.renderer.physicallyCorrectLights = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        this.container.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(
            70,
            this.width / this.height,
            0.1,
            100
        );
        this.camera.position.set(0, 0, 2);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        this.time = 0;
        this.isPlaying = true;
        this.clock = new THREE.Clock();

        this.textureLoader = new THREE.TextureLoader();
        this.uniforms = {
            uTime: { value: 0 },
            uMatCap: { value: this.textureLoader.load("/textures/black.png") },
            uSpecterSize: { value: 0.8 },
            uWaveBorder: { value: 0.3 },
            uWaveSpeed: { value: 2.0 },
            uBorderColor: { value: new THREE.Color("#87DCE1") },
            uSpecterCount: { value: 2.0 },
            resolution: { value: new THREE.Vector4(this.width, this.height, this.width / this.height, 1) },
        };

        // Post-processing
        this.composer = new EffectComposer(this.renderer);
        this.renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(this.renderPass);
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(this.width, this.height),
            1.5, // strength
            0.4, // radius
            0.20 // threshold
        );
        this.composer.addPass(this.bloomPass);

        this.lights();
        this.material();
        this.addModel();
        this.setupResize();
        this.setupControls();
        this.render();
    }

    lights() {
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        this.scene.add(directionalLight);
    }

    material() {
        this.material = new THREE.ShaderMaterial({
            side: THREE.DoubleSide,
            uniforms: this.uniforms,
            vertexShader: vertex,
            fragmentShader: fragment,
            transparent: true,
            morphTargets: true,
        });
    }

    addModel() {
        this.loader = new GLTFLoader();
        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setDecoderPath("./draco/");
        this.loader.setDRACOLoader(this.dracoLoader);

        let that = this;
        this.loader.load(
            "/model/heart.glb",
            function (gltf) {
                that.model = gltf.scene;
                that.meshes = [];

                console.log("GLTF Animations:", gltf.animations);
                gltf.animations.forEach((clip, index) => {
                    console.log(`Animation ${index} Tracks:`, clip.tracks);
                    console.log(`Animation ${index} targets:`, clip.tracks.map(track => track.name));
                });

                gltf.scene.traverse(function (child) {
                    if (child.isMesh) {
                        child.userData.originalMaterial = child.material;

                        const box = new THREE.Box3().setFromObject(child);
                        const center = box.getCenter(new THREE.Vector3());

                        child.position.sub(center);
                        child.position.x = 0.15;

                        child.scale.set(0.575, 0.575, 0.575);

                        child.material = that.material;

                        that.meshes.push(child);

                        console.log("Mesh:", child.name, "Material:", child.material.name);
                        console.log("Mesh has skeleton:", !!child.skeleton, "Skeleton:", child.skeleton);
                        console.log("Mesh has morph targets:", !!child.morphTargetInfluences, "Morph targets:", child.morphTargetInfluences);
                        console.log("Geometry attributes:", Object.keys(child.geometry.attributes));
                    }
                });

                that.mixer = null;
                if (gltf.animations && gltf.animations.length > 0) {
                    that.mixer = new THREE.AnimationMixer(gltf.scene);
                    gltf.animations.forEach((clip, index) => {
                        console.log(`Playing animation ${index}: ${clip.name}`);
                        const action = that.mixer.clipAction(clip);
                        action.setLoop(THREE.LoopRepeat);
                        action.timeScale = that.settings.animationSpeed;
                        action.play();
                    });
                } else {
                    console.warn("No animations found in the model.");
                }

                that.scene.add(gltf.scene);
            },
            undefined,
            function (e) {
                console.error("Model loading error:", e);
            }
        );
    }

    setupControls() {
        this.settings = {
            animationSpeed: 1.0,
            useShaderMaterial: true,
            specterSize: this.uniforms.uSpecterSize.value,
            specterCount: this.uniforms.uSpecterCount.value,
            waveBorder: this.uniforms.uWaveBorder.value,
            waveSpeed: this.uniforms.uWaveSpeed.value,
            colorLightness: 80,
            bloomStrength: this.bloomPass.strength,
            bloomRadius: this.bloomPass.radius,
            bloomThreshold: this.bloomPass.threshold,
        };

        this.gui = new dat.GUI();
        this.gui.add(this.settings, "animationSpeed", 0, 5, 0.1).name("Animation Speed").onChange((value) => {
            if (this.mixer) {
                this.mixer.timeScale = value;
            }
        });
        this.gui.add(this.settings, "useShaderMaterial").name("Use Shader Material").onChange((value) => {
            if (this.meshes) {
                this.meshes.forEach((mesh) => {
                    mesh.material = value ? this.material : mesh.userData.originalMaterial || new THREE.MeshStandardMaterial();
                });
            }
        });
        const spectrumFolder = this.gui.addFolder("Spectrum Settings");
        spectrumFolder.add(this.settings, "specterSize", -1, 1, 0.01).name("Spectrum Size").onChange((value) => {
            this.uniforms.uSpecterSize.value = value;
        });
        spectrumFolder.add(this.settings, "specterCount", -1, 32, 1).name("Spectrum Count").onChange((value) => {
            this.uniforms.uSpecterCount.value = value;
        });
        spectrumFolder.add(this.settings, "waveBorder", 0, 1, 0.01).name("Border Size").onChange((value) => {
            this.uniforms.uWaveBorder.value = value;
        });
        spectrumFolder.add(this.settings, "waveSpeed", 0, 5, 0.1).name("Wave Speed").onChange((value) => {
            this.uniforms.uWaveSpeed.value = value;
        });
        spectrumFolder.add(this.settings, "colorLightness", 5, 100, 1).name("Color Brightness").onChange((value) => {
            this.uniforms.uBorderColor.value.set(`hsl(287, 80%, ${value}%)`);
        });
        const bloomFolder = this.gui.addFolder("Bloom Settings");
        bloomFolder.add(this.settings, "bloomStrength", 0, 3, 0.1).name("Strength").onChange((value) => {
            this.bloomPass.strength = value;
        });
        bloomFolder.add(this.settings, "bloomRadius", 0, 1, 0.01).name("Radius").onChange((value) => {
            this.bloomPass.radius = value;
        });
        bloomFolder.add(this.settings, "bloomThreshold", 0, 1, 0.01).name("Threshold").onChange((value) => {
            this.bloomPass.threshold = value;
        });
    }

    setupResize() {
        window.addEventListener("resize", this.resize.bind(this));
    }

    resize() {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer.setSize(this.width, this.height);
        this.composer.setSize(this.width, this.height);
        this.uniforms.resolution.value.set(this.width, this.height, this.width / this.height, 1);
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
    }

    render() {
        if (!this.isPlaying) return;
        const delta = this.clock.getDelta();
        this.time += delta;
        this.uniforms.uTime.value = this.time;

        if (this.mixer) {
            this.mixer.update(delta);
        }

        this.composer.render();
        requestAnimationFrame(this.render.bind(this));
    }
}

new Sketch({
    dom: document.querySelector(".canvas"),
});





// class Sketch {
//     constructor(options) {
//         this.scene = new THREE.Scene();
//         this.container = options.dom;
//         this.width = this.container.offsetWidth;
//         this.height = this.container.offsetHeight;

//         this.renderer = new THREE.WebGLRenderer({
//             alpha: true,
//             antialias: true,
//         });
//         this.renderer.setPixelRatio(window.devicePixelRatio);
//         this.renderer.setSize(this.width, this.height);
//         this.renderer.setClearColor("#050505", 1);
//         this.renderer.physicallyCorrectLights = true;
//         this.renderer.outputEncoding = THREE.sRGBEncoding;

//         this.container.appendChild(this.renderer.domElement);

//         this.camera = new THREE.PerspectiveCamera(
//             70,
//             this.width / this.height,
//             0.1,
//             100
//         );
//         this.camera.position.set(0, 0, 2);
//         this.controls = new OrbitControls(this.camera, this.renderer.domElement);

//         this.time = 0;
//         this.isPlaying = true;
//         this.clock = new THREE.Clock();

//         this.textureLoader = new THREE.TextureLoader();
//         this.uniforms = {
//             uTime: { value: 0 },
//             uMatCap: { value: this.textureLoader.load("/texture.png") },
//             uPulsePosition: { value: 0.0 },
//             uPulseWidth: { value: 0.2 },
//             uPulseSpeed: { value: 1.0 },
//             uPulseColor: { value: new THREE.Color("#87DCE1") },
//             uPulseOpacity: { value: 0.8 },
//             uActiveVein: { value: 0.0 },
//         };

//         // Post-processing
//         this.composer = new EffectComposer(this.renderer);
//         this.renderPass = new RenderPass(this.scene, this.camera);
//         this.composer.addPass(this.renderPass);
//         this.bloomPass = new UnrealBloomPass(
//             new THREE.Vector2(this.width, this.height),
//             1.5, // strength
//             0.4, // radius
//             0.20 // threshold
//         );
//         this.composer.addPass(this.bloomPass);

//         this.lights();
//         this.material();
//         this.addModel();
//         this.setupResize();
//         this.setupControls();
//         this.shuffleVeins()
//         this.selectNextVein()
//         // this.setupVeinSelection();
//         this.render();
//     }

//     lights() {
//         const ambientLight = new THREE.AmbientLight(0x404040);
//         this.scene.add(ambientLight);
//         const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
//         this.scene.add(directionalLight);
//     }

//     material() {
//         this.material = new THREE.ShaderMaterial({
//             side: THREE.DoubleSide,
//             uniforms: this.uniforms,
//             vertexShader: vertex,
//             fragmentShader: fragment,
//             transparent: true,
//             morphTargets: true,
//         });
//     }

//     addModel() {
//         this.loader = new GLTFLoader();
//         this.dracoLoader = new DRACOLoader();
//         this.dracoLoader.setDecoderPath("./draco/");
//         this.loader.setDRACOLoader(this.dracoLoader);

//         let that = this;
//         this.loader.load(
//             "/model/heart.glb",
//             function (gltf) {
//                 that.model = gltf.scene;
//                 that.meshes = [];
//                 that.veinIndices = [];

//                 gltf.scene.traverse(function (child) {
//                     if (child.isMesh) {
//                         child.userData.originalMaterial = child.material;

//                         const box = new THREE.Box3().setFromObject(child);
//                         const center = box.getCenter(new THREE.Vector3());

//                         child.position.sub(center);
//                         child.position.x = 0.15;
//                         child.scale.set(0.575, 0.575, 0.575);

//                         child.material = that.material;

//                         that.meshes.push(child);
//                         that.veinIndices.push(that.meshes.length - 1);

//                         console.log("Mesh:", child.name, "Material:", child.material.name);
//                         console.log("Mesh has morph targets:", !!child.morphTargetInfluences);
//                     }
//                 });

//                 that.mixer = null;
//                 if (gltf.animations && gltf.animations.length > 0) {
//                     that.mixer = new THREE.AnimationMixer(gltf.scene);
//                     gltf.animations.forEach((clip, index) => {
//                         console.log(`Playing animation ${index}: ${clip.name}`);
//                         const action = that.mixer.clipAction(clip);
//                         action.setLoop(THREE.LoopRepeat);
//                         action.timeScale = that.settings.animationSpeed;
//                         action.play();
//                     });
//                 } else {
//                     console.warn("No animations found in the model.");
//                 }

//                 that.scene.add(gltf.scene);

//                 // Initialize vein selection
//                 that.shuffleVeins();
//                 that.selectNextVein();
//             },
//             undefined,
//             function (e) {
//                 console.error("Model loading error:", e);
//             }
//         );
//     }

//     shuffleVeins() {
//         // Fisher-Yates shuffle
//         this.veinOrder = [...this.veinIndices];
//         for (let i = this.veinOrder.length - 1; i > 0; i--) {
//             const j = Math.floor(Math.random() * (i + 1));
//             [this.veinOrder[i], this.veinOrder[j]] = [this.veinOrder[j], this.veinOrder[i]];
//         }
//         this.currentVeinIndex = 0;
//     }

//     selectNextVein() {
//         if (this.currentVeinIndex >= this.veinOrder.length) {
//             this.shuffleVeins();
//         }
//         this.uniforms.uActiveVein.value = this.veinOrder[this.currentVeinIndex];
//         this.uniforms.uPulsePosition.value = 0.0; // Reset pulse position
//         this.currentVeinIndex++;
//         setTimeout(() => this.selectNextVein(), 3000 / this.settings.pulseSpeed); // Adjust timing based on pulse speed
//     }

//     setupControls() {
//         this.settings = {
//             animationSpeed: 1.0,
//             useShaderMaterial: true,
//             pulseWidth: this.uniforms.uPulseWidth.value,
//             pulseSpeed: this.uniforms.uPulseSpeed.value,
//             pulseOpacity: this.uniforms.uPulseOpacity.value,
//             colorLightness: 80,
//             bloomStrength: this.bloomPass.strength,
//             bloomRadius: this.bloomPass.radius,
//             bloomThreshold: this.bloomPass.threshold,
//         };

//         this.gui = new dat.GUI();
//         this.gui.add(this.settings, "animationSpeed", 0, 5, 0.1).name("Animation Speed").onChange((value) => {
//             if (this.mixer) {
//                 this.mixer.timeScale = value;
//             }
//         });
//         this.gui.add(this.settings, "useShaderMaterial").name("Use Shader Material").onChange((value) => {
//             if (this.meshes) {
//                 this.meshes.forEach((mesh) => {
//                     mesh.material = value ? this.material : mesh.userData.originalMaterial || new THREE.MeshStandardMaterial();
//                 });
//             }
//         });
//         const pulseFolder = this.gui.addFolder("Pulse Settings");
//         pulseFolder.add(this.settings, "pulseWidth", 0.05, 0.5, 0.01).name("Pulse Width").onChange((value) => {
//             this.uniforms.uPulseWidth.value = value;
//         });
//         pulseFolder.add(this.settings, "pulseSpeed", 0.1, 5.0, 0.1).name("Pulse Speed").onChange((value) => {
//             this.uniforms.uPulseSpeed.value = value;
//         });
//         pulseFolder.add(this.settings, "pulseOpacity", 0, 1, 0.01).name("Pulse Opacity").onChange((value) => {
//             this.uniforms.uPulseOpacity.value = value;
//         });
//         pulseFolder.add(this.settings, "colorLightness", 5, 100, 1).name("Pulse Brightness").onChange((value) => {
//             this.uniforms.uPulseColor.value.set(`hsl(287, 80%, ${value}%)`);
//         });
//         const bloomFolder = this.gui.addFolder("Bloom Settings");
//         bloomFolder.add(this.settings, "bloomStrength", 0, 3, 0.1).name("Strength").onChange((value) => {
//             this.bloomPass.strength = value;
//         });
//         bloomFolder.add(this.settings, "bloomRadius", 0, 1, 0.01).name("Radius").onChange((value) => {
//             this.bloomPass.radius = value;
//         });
//         bloomFolder.add(this.settings, "bloomThreshold", 0, 1, 0.01).name("Threshold").onChange((value) => {
//             this.bloomPass.threshold = value;
//         });
//     }

//     setupResize() {
//         window.addEventListener("resize", this.resize.bind(this));
//     }

//     resize() {
//         this.width = this.container.offsetWidth;
//         this.height = this.container.offsetHeight;
//         this.renderer.setSize(this.width, this.height);
//         this.composer.setSize(this.width, this.height);
//         this.camera.aspect = this.width / this.height;
//         this.camera.updateProjectionMatrix();
//     }

//     render() {
//         if (!this.isPlaying) return;
//         const delta = this.clock.getDelta();
//         this.time += delta;
//         this.uniforms.uTime.value = this.time;
//         this.uniforms.uPulsePosition.value = (this.uniforms.uPulsePosition.value + delta * this.uniforms.uPulseSpeed.value) % 1.0;

//         if (this.mixer) {
//             this.mixer.update(delta);
//         }

//         this.composer.render();
//         requestAnimationFrame(this.render.bind(this));
//     }
// }

// new Sketch({
//     dom: document.querySelector(".canvas"),
// });