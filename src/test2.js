// import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// import fragment from "../shaders/fragment.glsl";
// import vertex from "../shaders/vertex.glsl";
// import * as dat from "dat.gui";
// import gsap from "gsap";
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

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
//         this.renderer.setClearColor("#111", 1);
//         this.renderer.physicallyCorrectLights = true;
//         this.renderer.outputEncoding = THREE.sRGBEncoding;

//         console.log("WebGL Capabilities:", this.renderer.capabilities);

//         this.container.appendChild(this.renderer.domElement);

//         this.camera = new THREE.PerspectiveCamera(
//             70,
//             this.width / this.height,
//             0.001,
//             1000
//         );
//         this.camera.position.set(0, 0, 2);
//         this.controls = new OrbitControls(this.camera, this.renderer.domElement);

//         this.time = 0;
//         this.isPlaying = true;
//         this.mouse = 0;
//         this.clock = new THREE.Clock();
//         this.veinList = [];

//         this.settings();
//         this.material();
//         this.light();
//         this.addModel();
//         this.resize();
//         this.setupResize();
//         this.render();
//     }

//     settings() {
//         this.settings = {
//             test: 1,
//             useShaderMaterial: true,
//             animationSpeed: 1.0,
//             pulseSpeed: 1.0,
//             waveWidth: 0.05,
//             numVeins: 5,
//             whichUV: 0,
//             pulseStart: 0.0,
//             pulseDelay: 0.5,
//             glowStrength: 1.0,
//             debugUV: false,
//         };
//         this.gui = new dat.GUI();
//         this.gui.add(this.settings, "test", 0, 1, 0.01);
//         this.gui.add(this.settings, "useShaderMaterial").name("Use Shader Material").onChange((value) => {
//             if (this.meshes) {
//                 this.meshes.forEach((mesh) => {
//                     mesh.material = value ? this.material : mesh.userData.originalMaterial || new THREE.MeshStandardMaterial();
//                 });
//             }
//         });
//         this.gui.add(this.settings, "animationSpeed", 0, 5, 0.1).name("Animation Speed").onChange((value) => {
//             if (this.mixer) {
//                 this.mixer.timeScale = value;
//             }
//         });
//         this.gui.add(this.settings, "pulseSpeed", 0, 10, 0.1).name("Pulse Speed").onChange((value) => {
//             this.material.uniforms.speed.value = value;
//         });
//         this.gui.add(this.settings, "waveWidth", 0, 0.5, 0.01).name("Wave Width").onChange((value) => {
//             this.material.uniforms.waveWidth.value = value;
//         });
//         this.gui.add(this.settings, "numVeins", 1, 20, 1).name("Number of Veins").onChange((value) => {
//             this.material.uniforms.numVeins.value = value;
//             this.veinList = Array.from({ length: value }, (_, i) => i);
//             this.veinList = this.veinList.sort(() => Math.random() - 0.5);
//         });
//         this.gui.add(this.settings, "whichUV", 0, 2, 1).name("Which UV Set").onChange((value) => {
//             this.material.uniforms.whichUV.value = value;
//         });
//         this.gui.add(this.settings, "pulseStart", 0, 1, 0.01).name("Pulse Start UV").onChange((value) => {
//             this.material.uniforms.pulseStart.value = value;
//         });
//         this.gui.add(this.settings, "pulseDelay", 0, 5, 0.1).name("Pulse Delay");
//         this.gui.add(this.settings, "glowStrength", 0, 10, 0.1).name("Glow Strength").onChange((value) => {
//             this.material.uniforms.glowStrength.value = value;
//         });
//         this.gui.add(this.settings, "debugUV").name("Debug UV Map").onChange((value) => {
//             this.material.uniforms.debugUV.value = value ? 1.0 : 0.0;
//         });
//     }

//     light() {
//         const light = new THREE.AmbientLight(0x404040);
//         this.scene.add(light);
//         const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
//         this.scene.add(directionalLight);
//     }

//     addModel() {
//         this.loader = new GLTFLoader();
//         this.dracoLoader = new DRACOLoader();
//         this.dracoLoader.setDecoderPath('./draco/');
//         this.loader.setDRACOLoader(this.dracoLoader);

//         let that = this;
//         this.loader.load(
//             "/model/heart.glb",
//             function(gltf) {
//                 that.model = gltf.scene;
//                 that.meshes = [];

//                 console.log("GLTF Animations:", gltf.animations);
//                 gltf.animations.forEach((clip, index) => {
//                     console.log(`Animation ${index} Tracks:`, clip.tracks);
//                     console.log(`Animation ${index} targets:`, clip.tracks.map(track => track.name));
//                 });

//                 gltf.scene.traverse(function (child) {
//                     if (child.isMesh) {
//                         child.userData.originalMaterial = child.material;

//                         const box = new THREE.Box3().setFromObject(child);
//                         const center = box.getCenter(new THREE.Vector3());

//                         child.position.sub(center);
//                         child.position.x = 0.25;

//                         child.scale.set(0.575, 0.575, 0.575);

//                         child.material = that.material;

//                         that.meshes.push(child);

//                         console.log("Mesh:", child.name, "Material:", child.material.name);
//                         console.log("Mesh has skeleton:", !!child.skeleton, "Skeleton:", child.skeleton);
//                         console.log("Mesh has morph targets:", !!child.morphTargetInfluences, "Morph targets:", child.morphTargetInfluences);
//                         console.log("Geometry attributes:", Object.keys(child.geometry.attributes));
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
//                 that.veinList = Array.from({ length: that.settings.numVeins }, (_, i) => i);
//                 that.veinList = that.veinList.sort(() => Math.random() - 0.5);
//                 that.selectNewVein();
//             },
//             undefined,
//             function(e) {
//                 console.error("Model loading error:", e);
//             }
//         );
//     }

//     material() {
//         this.material = new THREE.ShaderMaterial({
//             side: THREE.DoubleSide,
//             uniforms: {
//                 time: { value: 0 },
//                 mouse: { value: 0 },
//                 resolution: { value: new THREE.Vector4(this.width, this.height, this.width / this.height, 1) },
//                 uvRate1: { value: new THREE.Vector2(1, 1) },
//                 currentVein: { value: 0 },
//                 pulseTime: { value: 0 },
//                 speed: { value: this.settings.pulseSpeed },
//                 waveWidth: { value: this.settings.waveWidth },
//                 numVeins: { value: this.settings.numVeins },
//                 whichUV: { value: this.settings.whichUV },
//                 pulseStart: { value: this.settings.pulseStart },
//                 glowStrength: { value: this.settings.glowStrength },
//                 debugUV: { value: this.settings.debugUV ? 1.0 : 0.0 },
//             },
//             vertexShader: vertex,
//             fragmentShader: fragment,
//             morphTargets: true,
//             morphNormals: true,
//             skinning: true,
//         });
//     }

//     selectNewVein() {
//         if (this.veinList.length === 0) {
//             this.veinList = Array.from({ length: this.settings.numVeins }, (_, i) => i);
//             this.veinList = this.veinList.sort(() => Math.random() - 0.5);
//         }
//         this.currentVein = this.veinList.shift();
//         this.material.uniforms.currentVein.value = this.currentVein;
//         this.pulseStartTime = this.time;
//     }

//     setupResize() {
//         window.addEventListener("resize", this.resize.bind(this));
//     }

//     resize() {
//         this.width = this.container.offsetWidth;
//         this.height = this.container.offsetHeight;
//         this.renderer.setSize(this.width, this.height);
//         this.material.uniforms.resolution.value.set(this.width, this.height, this.width / this.height, 1);
//         this.camera.aspect = this.width / this.height;
//         this.camera.updateProjectionMatrix();
//     }

//     stop() {
//         this.isPlaying = false;
//     }

//     play() {
//         if (!this.isPlaying) {
//             this.isPlaying = true;
//             this.render();
//         }
//     }

//     render() {
//         if (!this.isPlaying) return;
//         const delta = this.clock.getDelta();
//         this.time += delta;

//         if (this.mixer) {
//             this.mixer.update(delta);
//             console.log("Mixer time:", this.mixer.time);
//         }

//         const pulseDuration = 1.0 / this.material.uniforms.speed.value;
//         if (this.time - this.pulseStartTime > pulseDuration + this.settings.pulseDelay) {
//             this.selectNewVein();
//         }
//         this.material.uniforms.pulseTime.value = this.time - this.pulseStartTime;
//         this.material.uniforms.time.value = this.time;

//         this.renderer.render(this.scene, this.camera);
//         requestAnimationFrame(this.render.bind(this));
//     }
// }

// new Sketch({
//     dom: document.querySelector(".canvas"),
// });

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import fragment from "../shaders/fragment.glsl";
import vertex from "../shaders/vertex.glsl";
import * as dat from "dat.gui";
import gsap from "gsap";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

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
        this.camera.position.set(0, 0, 2);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        this.time = 0;
        this.isPlaying = true;
        this.mouse = 0;
        this.clock = new THREE.Clock();
        this.veinList = [];

        this.settings();
        this.material();
        this.light();
        this.addModel();
        this.resize();
        this.setupResize();
        this.render();
    }

    settings() {
        this.settings = {
            test: 1,
            useShaderMaterial: true,
            animationSpeed: 1.0,
            pulseSpeed: 1.0,
            waveWidth: 0.05,
            numVeins: 5,
            whichUV: 0,
            reverseDirection: false,
            pulseDelay: 0.5,
            glowStrength: 1.0,
            debugUV: false,
        };
        this.gui = new dat.GUI();
        this.gui.add(this.settings, "test", 0, 1, 0.01);
        this.gui.add(this.settings, "useShaderMaterial").name("Use Shader Material").onChange((value) => {
            if (this.meshes) {
                this.meshes.forEach((mesh) => {
                    mesh.material = value ? this.material : mesh.userData.originalMaterial || new THREE.MeshStandardMaterial();
                });
            }
        });
        this.gui.add(this.settings, "animationSpeed", 0, 5, 0.1).name("Animation Speed").onChange((value) => {
            if (this.mixer) {
                this.mixer.timeScale = value;
            }
        });
        this.gui.add(this.settings, "pulseSpeed", 0, 10, 0.1).name("Pulse Speed").onChange((value) => {
            this.material.uniforms.speed.value = value;
        });
        this.gui.add(this.settings, "waveWidth", 0, 0.5, 0.01).name("Wave Width").onChange((value) => {
            this.material.uniforms.waveWidth.value = value;
        });
        this.gui.add(this.settings, "numVeins", 1, 20, 1).name("Number of Veins").onChange((value) => {
            this.material.uniforms.numVeins.value = value;
            this.veinList = Array.from({ length: value }, (_, i) => i);
            this.veinList = this.veinList.sort(() => Math.random() - 0.5);
        });
        this.gui.add(this.settings, "whichUV", 0, 2, 1).name("Which UV Set").onChange((value) => {
            this.material.uniforms.whichUV.value = value;
        });
        this.gui.add(this.settings, "reverseDirection").name("Reverse Direction").onChange((value) => {
            this.material.uniforms.reverseDirection.value = value ? 1.0 : 0.0;
        });
        this.gui.add(this.settings, "pulseDelay", 0, 5, 0.1).name("Pulse Delay");
        this.gui.add(this.settings, "glowStrength", 0, 10, 0.1).name("Glow Strength").onChange((value) => {
            this.material.uniforms.glowStrength.value = value;
        });
        this.gui.add(this.settings, "debugUV").name("Debug UV Map").onChange((value) => {
            this.material.uniforms.debugUV.value = value ? 1.0 : 0.0;
        });
    }

    light() {
        const light = new THREE.AmbientLight(0x404040);
        this.scene.add(light);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        this.scene.add(directionalLight);
    }

    addModel() {
        this.loader = new GLTFLoader();
        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setDecoderPath('./draco/');
        this.loader.setDRACOLoader(this.dracoLoader);

        let that = this;
        this.loader.load(
            "/model/heart.glb",
            function(gltf) {
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
                        child.position.x = 0.25;

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
                that.veinList = Array.from({ length: that.settings.numVeins }, (_, i) => i);
                that.veinList = that.veinList.sort(() => Math.random() - 0.5);
                that.selectNewVein();
            },
            undefined,
            function(e) {
                console.error("Model loading error:", e);
            }
        );
    }

    material() {
        this.material = new THREE.ShaderMaterial({
            side: THREE.DoubleSide,
            uniforms: {
                time: { value: 0 },
                mouse: { value: 0 },
                resolution: { value: new THREE.Vector4(this.width, this.height, this.width / this.height, 1) },
                uvRate1: { value: new THREE.Vector2(1, 1) },
                currentVein: { value: 0 },
                pulseTime: { value: 0 },
                speed: { value: this.settings.pulseSpeed },
                waveWidth: { value: this.settings.waveWidth },
                numVeins: { value: this.settings.numVeins },
                whichUV: { value: this.settings.whichUV },
                reverseDirection: { value: this.settings.reverseDirection ? 1.0 : 0.0 },
                glowStrength: { value: this.settings.glowStrength },
                debugUV: { value: this.settings.debugUV ? 1.0 : 0.0 },
            },
            vertexShader: vertex,
            fragmentShader: fragment,
            morphTargets: true,
            morphNormals: true,
            skinning: true,
        });
    }

    selectNewVein() {
        if (this.veinList.length === 0) {
            this.veinList = Array.from({ length: this.settings.numVeins }, (_, i) => i);
            this.veinList = this.veinList.sort(() => Math.random() - 0.5);
        }
        this.currentVein = this.veinList.shift();
        this.material.uniforms.currentVein.value = this.currentVein;
        this.pulseStartTime = this.time;
    }

    setupResize() {
        window.addEventListener("resize", this.resize.bind(this));
    }

    resize() {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer.setSize(this.width, this.height);
        this.material.uniforms.resolution.value.set(this.width, this.height, this.width / this.height, 1);
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
        if (!this.isPlaying) return;
        const delta = this.clock.getDelta();
        this.time += delta;

        if (this.mixer) {
            this.mixer.update(delta);
            console.log("Mixer time:", this.mixer.time);
        }

        const pulseDuration = 1.0 / this.material.uniforms.speed.value;
        if (this.time - this.pulseStartTime > pulseDuration + this.settings.pulseDelay) {
            this.selectNewVein();
        }
        this.material.uniforms.pulseTime.value = this.time - this.pulseStartTime;
        this.material.uniforms.time.value = this.time;

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render.bind(this));
    }
}

new Sketch({
    dom: document.querySelector(".canvas"),
});