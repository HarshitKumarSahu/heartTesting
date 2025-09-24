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

//         this.light()
//         this.material()
//         this.addModel();
//         this.resize();
//         this.setupResize();
//         this.settings();
//         this.render();
//     }

//     light() {
//         const light = new THREE.AmbientLight( 0x404040 ); // soft white light
//         this.scene.add( light );  
        
//         const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
//         this.scene.add( directionalLight );
//     }

//     // addModel() {
//     //     this.loader = new GLTFLoader();
//     //     this.dracoLoader = new DRACOLoader();
//     //     this.dracoLoader.setDecoderPath('./draco/');
//     //     this.loader.setDRACOLoader(this.dracoLoader);

//     //     let that = this;
//     //     this.loader.load(
//     //         "/model/heart.glb",
//     //         function(gltf) {
//     //             that.model = gltf.scene;
//     //             that.meshes = [];

//     //             console.log("GLTF Animations:", gltf.animations);
//     //             gltf.animations.forEach((clip, index) => {
//     //                 console.log(`Animation ${index} Tracks:`, clip.tracks);
//     //             });

//     //             gltf.scene.traverse(function (child) {
//     //                 if (child.isMesh) {
//     //                     child.userData.originalMaterial = child.material;

//     //                     const box = new THREE.Box3().setFromObject(child);
//     //                     const center = box.getCenter(new THREE.Vector3());

//     //                     child.position.sub(center);
//     //                     child.position.x = 0.25;

//     //                     child.scale.set(0.575, 0.575, 0.575);

//     //                     child.material = that.material;
//     //                     // child.material = new THREE.MeshStandardMaterial()

//     //                     that.meshes.push(child);

//     //                     console.log("Mesh:", child.name, "Material:", child.material);
//     //                     if (child.skeleton) {
//     //                         console.log("Mesh Skeleton:", child.skeleton);
//     //                     }
//     //                 }
//     //             });

//     //             that.mixer = null;
//     //             if (gltf.animations && gltf.animations.length > 0) {
//     //                 that.mixer = new THREE.AnimationMixer(gltf.scene);
//     //                 gltf.animations.forEach((clip, index) => {
//     //                     console.log(`Playing animation ${index}: ${clip.name}`);
//     //                     const action = that.mixer.clipAction(clip);
//     //                     action.setLoop(THREE.LoopRepeat);
//     //                     action.timeScale = that.settings.animationSpeed;
//     //                     action.play();
//     //                 });
//     //             } else {
//     //                 console.warn("No animations found in the model.");
//     //             }

//     //             that.scene.add(gltf.scene);
//     //         },
//     //         undefined,
//     //         function(e) {
//     //             console.error("Model loading error:", e);
//     //         }
//     //     );
//     // }

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
//             },
//             vertexShader: vertex,
//             fragmentShader: fragment,
//             morphTargets: true, // Support morph targets
//             morphNormals: true, // Support morph normals
//             skinning: true, // Support skinning
//             // wireframe: true
//         });
//     }

//     settings() {
//         this.settings = {
//             test: 1,
//             useShaderMaterial: true,
//             animationSpeed: 1.0,
//         };
//         this.gui = new dat.GUI();
//         this.gui.add(this.settings, "test", 0, 1, 0.01);
//         this.gui.add(this.settings, "useShaderMaterial").name("Use Shader Material").onChange((value) => {
//             if (this.meshes) {
//                 this.meshes.forEach((mesh) => {
//                     mesh.material = value ? this.material : mesh.userData.originalMaterial || new THREE.MeshStandardMaterial();
//                 });
//             }
//             this.plane.material = value ? this.material : new THREE.MeshStandardMaterial();
//         });
//         this.gui.add(this.settings, "animationSpeed", 0, 5, 0.1).name("Animation Speed").onChange((value) => {
//             if (this.mixer) {
//                 this.mixer.timeScale = value;
//             }
//         });
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

//     // render() {
//     //     if (!this.isPlaying) return;
//     //     const delta = this.clock.getDelta();
//     //     this.time += delta;

//     //     this.material.uniforms.time.value = this.time;

//     //     if (this.mixer) {
//     //         this.mixer.update(delta);
//     //         console.log("Mixer time:", this.mixer.time);
//     //     }

//     //     this.renderer.render(this.scene, this.camera);
//     //     requestAnimationFrame(this.render.bind(this));
//     // }
//     render() {
//         if (!this.isPlaying) return;
//         const delta = this.clock.getDelta();
//         this.time += delta;
    
//         this.material.uniforms.time.value = this.time;
    
//         if (this.mixer) {
//             this.mixer.update(delta);
//             console.log("Mixer time:", this.mixer.time);
//             // Debug bone transformations
//             if (this.model && this.model.skeleton) {
//                 this.model.skeleton.bones.forEach((bone, index) => {
//                     console.log(`Bone ${index} position:`, bone.position);
//                 });
//             }
//         }
    
//         this.renderer.render(this.scene, this.camera);
//         requestAnimationFrame(this.render.bind(this));
//     }
// }

// new Sketch({
//     dom: document.querySelector(".canvas"),
// });



import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import * as dat from "dat.gui";
import { Pane } from "tweakpane";
import vertex from "../shaders/vertex.glsl";
import fragment from "../shaders/fragment.glsl";

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
            uMatCap: { value: this.textureLoader.load("../public/textures/black.png") },
            uSpecterSize: { value: 0.8 },
            uWaveBorder: { value: 0.3 },
            uWaveSpeed: { value: 2.0 },
            uBorderColor: { value: new THREE.Color("#87DCE1") },
            resolution: { value: new THREE.Vector4(this.width, this.height, this.width / this.height, 1) },
        };

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
            morphTargets: true, // Support morph targets
        });
    }

    addModel() {
        this.loader = new GLTFLoader();
        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setDecoderPath("./draco/");
        this.loader.setDRACOLoader(this.dracoLoader);

        this.loader.load(
            "/model/heart.glb",
            (gltf) => {
                this.model = gltf.scene;
                this.meshes = [];

                gltf.scene.traverse((child) => {
                    if (child.isMesh) {
                        child.userData.originalMaterial = child.material;
                        const box = new THREE.Box3().setFromObject(child);
                        const center = box.getCenter(new THREE.Vector3());
                        child.position.sub(center);
                        child.position.x = 0.25;
                        child.scale.set(0.575, 0.575, 0.575);
                        child.material = this.material;
                        this.meshes.push(child);

                        console.log("Mesh:", child.name, "Material:", child.material.name);
                        console.log("Mesh has morph targets:", !!child.morphTargetInfluences);
                    }
                });

                this.mixer = null;
                if (gltf.animations && gltf.animations.length > 0) {
                    this.mixer = new THREE.AnimationMixer(gltf.scene);
                    gltf.animations.forEach((clip) => {
                        console.log(`Playing animation: ${clip.name}`);
                        const action = this.mixer.clipAction(clip);
                        action.setLoop(THREE.LoopRepeat);
                        action.timeScale = this.settings.animationSpeed;
                        action.play();
                    });
                } else {
                    console.warn("No animations found in the model.");
                }

                this.scene.add(gltf.scene);
            },
            undefined,
            (e) => {
                console.error("Model loading error:", e);
            }
        );
    }

    // addModel() {
    //             this.loader = new GLTFLoader();
    //             this.dracoLoader = new DRACOLoader();
    //             this.dracoLoader.setDecoderPath('./draco/');
    //             this.loader.setDRACOLoader(this.dracoLoader);
            
    //             let that = this;
    //             this.loader.load(
    //                 "/model/heart.glb",
    //                 function(gltf) {
    //                     that.model = gltf.scene;
    //                     that.meshes = [];
            
    //                     console.log("GLTF Animations:", gltf.animations);
    //                     gltf.animations.forEach((clip, index) => {
    //                         console.log(`Animation ${index} Tracks:`, clip.tracks);
    //                         console.log(`Animation ${index} targets:`, clip.tracks.map(track => track.name));
    //                     });
            
    //                     gltf.scene.traverse(function (child) {
    //                         if (child.isMesh) {
    //                             child.userData.originalMaterial = child.material;
            
    //                             const box = new THREE.Box3().setFromObject(child);
    //                             const center = box.getCenter(new THREE.Vector3());
            
    //                             child.position.sub(center);
    //                             child.position.x = 0.15;
            
    //                             child.scale.set(0.575, 0.575, 0.575);
            
    //                             child.material = that.material;
            
    //                             that.meshes.push(child);
            
    //                             console.log("Mesh:", child.name, "Material:", child.material.name);
    //                             console.log("Mesh has skeleton:", !!child.skeleton, "Skeleton:", child.skeleton);
    //                             console.log("Mesh has morph targets:", !!child.morphTargetInfluences, "Morph targets:", child.morphTargetInfluences);
    //                             console.log("Geometry attributes:", Object.keys(child.geometry.attributes));
    //                         }
    //                     });
            
    //                     that.mixer = null;
    //                     if (gltf.animations && gltf.animations.length > 0) {
    //                         that.mixer = new THREE.AnimationMixer(gltf.scene);
    //                         gltf.animations.forEach((clip, index) => {
    //                             console.log(`Playing animation ${index}: ${clip.name}`);
    //                             const action = that.mixer.clipAction(clip);
    //                             action.setLoop(THREE.LoopRepeat);
    //                             action.timeScale = that.settings.animationSpeed;
    //                             action.play();
    //                         });
    //                     } else {
    //                         console.warn("No animations found in the model.");
    //                     }
            
    //                     that.scene.add(gltf.scene);
    //                 },
    //                 undefined,
    //                 function(e) {
    //                     console.error("Model loading error:", e);
    //                 }
    //             );
    //         }

    setupControls() {
        this.settings = {
            animationSpeed: 1.0,
            useShaderMaterial: true,
        };

        // dat.GUI
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

        // Tweakpane
        this.pane = new Pane({ title: "Spectrum Customization", expanded: true });
        const folder = this.pane.addFolder({ title: "Spectrum Settings", expanded: true });
        folder.addBinding(this.uniforms.uSpecterSize, "value", {
            min: -1,
            max: 1,
            label: "Spectrum Size",
        });
        folder.addBinding(this.uniforms.uWaveBorder, "value", {
            min: 0,
            max: 1,
            label: "Border Size",
        });
        folder.addBinding(this.uniforms.uWaveSpeed, "value", {
            min: 0,
            max: 5,
            label: "Wave Speed",
        });
        const colorSettings = { lightness: 80 };
        const updateBorderColor = () => {
            this.uniforms.uBorderColor.value.set(`hsl(287, 80%, ${colorSettings.lightness}%)`);
        };
        folder.addBinding(colorSettings, "lightness", {
            min: 5,
            max: 100,
            step: 1,

            label: "Color Brightness",
        }).on("change", updateBorderColor);

        // Adjust Tweakpane for mobile
        const adjustPaneWidth = () => {
            const paneElement = document.querySelector(".tp-dfwv");
            if (paneElement) {
                if (window.innerWidth < 600) {
                    paneElement.style.width = "62vw";
                    paneElement.style.top = "auto";
                    paneElement.style.right = "auto";
                    paneElement.style.bottom = "1rem";
                    paneElement.style.left = "1rem";
                    paneElement.style.fontSize = "0.75rem";
                    paneElement.classList.add("bottom-to-top");
                } else {
                    paneElement.style.top = "1rem";
                    paneElement.style.right = "1rem";
                    paneElement.classList.remove("bottom-to-top");
                }
            }
        };
        adjustPaneWidth();
        window.addEventListener("resize", adjustPaneWidth);
    }

    setupResize() {
        window.addEventListener("resize", this.resize.bind(this));
    }

    resize() {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer.setSize(this.width, this.height);
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

        // this.scene.rotateY(0.0015); // Optional: add slight rotation like spectrum
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render.bind(this));
    }
}

new Sketch({
    dom: document.querySelector(".canvas"),
});













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
//             invertAlong: false,
//             pulseDelay: 0.5,
//             glowStrength: 1.0,
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
//         });
//         this.gui.add(this.settings, "whichUV", 0, 2, 1).name("Which UV Set").onChange((value) => {
//             this.material.uniforms.whichUV.value = value;
//         });
//         this.gui.add(this.settings, "invertAlong").name("Invert Along Direction").onChange((value) => {
//             this.material.uniforms.invertAlong.value = value ? 1.0 : 0.0;
//         });
//         this.gui.add(this.settings, "pulseDelay", 0, 5, 0.1).name("Pulse Delay");
//         this.gui.add(this.settings, "glowStrength", 0, 10, 0.1).name("Glow Strength").onChange((value) => {
//             this.material.uniforms.glowStrength.value = value;
//         });
//     }

//     light() {
//         const light = new THREE.AmbientLight( 0x404040 ); // soft white light
//         this.scene.add( light );  
        
//         const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
//         this.scene.add( directionalLight );
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
//                 that.selectNewVein(); // Initialize the first pulse
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
//                 invertAlong: { value: this.settings.invertAlong ? 1.0 : 0.0 },
//                 glowStrength: { value: this.settings.glowStrength },
//             },
//             vertexShader: vertex,
//             fragmentShader: fragment,
//             morphTargets: true, // Support morph targets
//             morphNormals: true, // Support morph normals
//             skinning: true, // Support skinning
//             // wireframe: true
//         });
//     }

//     selectNewVein() {
//         this.currentVein = Math.floor(Math.random() * this.settings.numVeins);
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

//         // Update impulse effect
//         const pulseDuration = 1.0 / this.material.uniforms.speed.value;
//         if (this.time - this.pulseStartTime > pulseDuration + this.settings.pulseDelay) {
//             this.selectNewVein();
//         }
//         this.material.uniforms.pulseTime.value = this.time - this.pulseStartTime;
//         this.material.uniforms.currentVein.value = this.currentVein;
//         this.material.uniforms.time.value = this.time;
    
//         this.renderer.render(this.scene, this.camera);
//         requestAnimationFrame(this.render.bind(this));
//     }
// }

// new Sketch({
//     dom: document.querySelector(".canvas"),
// });



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

//         this.light();
//         this.material();
//         this.addModel();
//         this.resize();
//         this.setupResize();
//         this.settings();
//         this.render();
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
//                 impulseSpeed: { value: 1.0 },
//                 impulseIntensity: { value: 1.0 },
//                 veinIndex: { value: 0 },
//                 impulseProgress: { value: 0 },
//                 numVeins: { value: 5 } // Adjust based on actual number of veins
//             },
//             vertexShader: vertex,
//             fragmentShader: fragment,
//             morphTargets: true,
//             morphNormals: true,
//             skinning: true,
//             wireframe: true
//         });
//     }

//     settings() {
//         this.settings = {
//             test: 1,
//             useShaderMaterial: true,
//             animationSpeed: 1.0,
//             impulseSpeed: 1.0,
//             impulseIntensity: 1.0,
//             impulseInterval: 2.0
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
//         this.gui.add(this.settings, "impulseSpeed", 0.1, 5, 0.1).name("Impulse Speed").onChange((value) => {
//             this.material.uniforms.impulseSpeed.value = value;
//         });
//         this.gui.add(this.settings, "impulseIntensity", 0, 2, 0.1).name("Glow Intensity").onChange((value) => {
//             this.material.uniforms.impulseIntensity.value = value;
//         });
//         this.gui.add(this.settings, "impulseInterval", 0.5, 5, 0.1).name("Impulse Interval").onChange((value) => {
//             this.impulseInterval = value;
//         });
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

//     updateImpulse() {
//         const interval = this.settings.impulseInterval;
//         const progress = (this.time % interval) / interval;
//         this.material.uniforms.impulseProgress.value = progress;
//         if (progress < 0.01) { // Reset at the start of each cycle
//             const newVeinIndex = Math.floor(Math.random() * this.material.uniforms.numVeins.value);
//             this.material.uniforms.veinIndex.value = newVeinIndex;
//         }
//     }

//     render() {
//         if (!this.isPlaying) return;
//         const delta = this.clock.getDelta();
//         this.time += delta;

//         this.material.uniforms.time.value = this.time;
//         this.updateImpulse();

//         if (this.mixer) {
//             this.mixer.update(delta);
//             console.log("Mixer time:", this.mixer.time);
//         }

//         this.renderer.render(this.scene, this.camera);
//         requestAnimationFrame(this.render.bind(this));
//     }
// }

// new Sketch({
//     dom: document.querySelector(".canvas"),
// });