import * as THREE from 'three';

export class World {
    constructor(data, advancedRendering=true) {
        this.load(data, advancedRendering)
    }

    load(data, advancedRendering=true) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000000);
        this.textureLoader = new THREE.TextureLoader();
        this.clock = new THREE.Clock();
        this.raycaster = new THREE.Raycaster();

        this.renderer = new THREE.WebGLRenderer({
            antialias: false,
            alpha: false,
        });

        this.renderer.shadowMap.enabled = true;

        const resulution = 1;
        this.renderer.setSize(window.innerWidth / resulution, window.innerHeight / resulution);
        this.renderer.domElement.style.width = (this.renderer.domElement.width * resulution) + 'px';
        this.renderer.domElement.style.height = (this.renderer.domElement.height * resulution) + 'px';
        document.body.appendChild(this.renderer.domElement);


        this.camera.position.y = 2;
        this.camera.fov = 70;
        this.camera.updateProjectionMatrix();


        this.sky = this.textureLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/kloofendal_43d_clear_puresky.jpg');
        this.sky.mapping = THREE.EquirectangularReflectionMapping;
        const material = new THREE.MeshBasicMaterial({map: this.sky, side: THREE.BackSide});
        const geometry = new THREE.SphereGeometry(100000, 64, 64);
        const mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);


        const sun = new THREE.DirectionalLight(0xFFFDDD, 3);
        sun.position.set(2000, 2000, 2000);
        sun.castShadow = true;
        //sun.shadow.radius = 8;

        sun.shadow.camera.far = 10000;
        this.scene.add(sun);

        const ambient = new THREE.AmbientLight( new THREE.Color(`rgb(100,100,100)`) );
        this.scene.add(ambient);


        const planeGeometry = new THREE.PlaneGeometry(50, 50);
        const diffuse = this.textureLoader.load(`https://media.discordapp.net/attachments/1043652794374160385/1152635703608475779/Untitled_1.png?width=630&height=630`);
        diffuse.repeat.set(50, 50);
        diffuse.wrapS = THREE.RepeatWrapping;
        diffuse.wrapT = THREE.RepeatWrapping;
        const planeMaterial = new THREE.MeshPhongMaterial({
            map: diffuse,
        });
        const groundPlane = new THREE.Mesh(planeGeometry, planeMaterial);
        groundPlane.rotation.x = -Math.PI / 2;
        this.scene.add(groundPlane);

        groundPlane.receiveShadow = true;

        //sun.lookAt(groundPlane.position);


        window.addEventListener("resize", (event) => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();

            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });



        this.parts = [];
        this.lights = [];
        this.advancedRendering = advancedRendering;
        this.materialCache = {};

        if (data) {
            let parsed = JSON.parse(atob(data));
            console.log(parsed)

            for (let p in parsed.parts) {
                let part = parsed.parts[p];

                this.newPart(
                    part.type,
                    part.position,
                    part.scale,
                    part.rotation,
                    part.material,
                    part.color,
                    part.emissive,
                    part.emissionIntensity,
                    part.emissionRange
                )
            }
        }
    }

    getMaterial(id) {
        if (false) { //(this.materialCache[id])
            return this.materialCache[id];
        } else {
            const diff = this.textureLoader.load(`https://dl.polyhaven.org/file/ph-assets/Textures/png/1k/${id}/${id}_diff_1k.png`);

            diff.wrapS = THREE.RepeatWrapping;
            diff.wrapT = THREE.RepeatWrapping;

            let material;

            if (this.advancedRendering) {
                const arm = this.textureLoader.load(`https://dl.polyhaven.org/file/ph-assets/Textures/png/1k/${id}/${id}_arm_1k.png`);
                const norm = this.textureLoader.load(`https://dl.polyhaven.org/file/ph-assets/Textures/png/1k/${id}/${id}_nor_gl_1k.png`);

                arm.wrapS = THREE.RepeatWrapping;
                arm.wrapT = THREE.RepeatWrapping;
            
                norm.wrapS = THREE.RepeatWrapping;
                norm.wrapT = THREE.RepeatWrapping;

                material = new THREE.MeshStandardMaterial({
                    map: diff,
                    aoMap: arm,
                    roughnessMap: arm,
                    metalnessMap: arm,
                    normalMap: norm
                })
            } else {
                material = new THREE.MeshBasicMaterial({
                    map: diff
                })
            }

            this.materialCache[id] = material;
            return material;
        }
    }

    setMat(part, matID) {
        if (part) {
            //let col = new THREE.Color(`rgb(${part.material.color.r*255},${part.material.color.g*255},${part.material.color.b*255})`)
            part.material = this.getMaterial(matID);
            //part.material.color = col;

            part.mat = matID;
        } else {
            console.warn("[!] Action (set material) was not performed; No part was supplied or found.")
        }
    }

    setGeom(part, geomName) {
        let newObjGeom;

        if (geomName === "cube") {
            newObjGeom = new THREE.BoxGeometry();
        } else if (geomName === "sphere") {
            newObjGeom = new THREE.SphereGeometry(.5);
        } else if (geomName === "cylinder") {
            newObjGeom = new THREE.CylinderGeometry(.5, .5);
        } else if (geomName === "plane") {
            newObjGeom = new THREE.PlaneGeometry();
        } else if (geomName === "torus") {
            newObjGeom = new THREE.TorusGeometry(.3, .2);
        } else if (geomName === "pyramid") {
            newObjGeom = new THREE.ConeGeometry(.5, 1, 4);  
            //newObjGeom.rotateY(Math.PI / 4);
        } else if (geomName === "cone") {
            newObjGeom = new THREE.ConeGeometry(.5, 1, 24); 
        }

        part.geometry = newObjGeom;
        part.type = geomName;

        this.updateUVs(part);
    }

    newPart(type="cube", position=[0, .5, 0], scale=[1, 1, 1], rotation=[0, 0, 0], material="double_brick_floor", color=[255, 255, 255], emissive=false, emissionIntensity=2, emissionRange=10) {
        const newObj = new THREE.Mesh();

        this.setGeom(newObj, type);
        this.setMat(newObj, material);

        newObj.position.x = position[0];
        newObj.position.y = position[1];
        newObj.position.z = position[2];

        newObj.rotation.x = rotation[0];
        newObj.rotation.y = rotation[1];
        newObj.rotation.z = rotation[2];

        newObj.scale.x = scale[0];
        newObj.scale.y = scale[1];
        newObj.scale.z = scale[2];

        newObj.material.color.r = color[0]/255;
        newObj.material.color.g = color[1]/255;
        newObj.material.color.b = color[2]/255;

        newObj.receiveShadow = this.advancedRendering;
        newObj.castShadow = this.advancedRendering;

        newObj.isPart = true;

        this.parts.push(newObj);
        this.scene.add(newObj);

        this.updateUVs(newObj);

        if (emissive) {
            this.changeEmissive(newObj, true, emissionIntensity, emissionRange)
        }

        return newObj;
    }

    async changeEmissive(part, mode, intensity=2, range=10) {
        if (mode === true) {
            part.receiveShadow = false;
            part.castShadow = false;

            let col = new THREE.Color(`rgb(${part.material.color.r*255},${part.material.color.g*255},${part.material.color.b*255})`)

            part.material = new THREE.MeshBasicMaterial({color:col});
    
            let light = new THREE.PointLight(col, intensity);
            light.shadow.camera.far = range;
            this.scene.add(light);
            light.castShadow = true;
            light.parent = part;
            part.light = light;
            part.emissive = true;
        } else {
            part.receiveShadow = this.advancedRendering;
            part.castShadow = this.advancedRendering;
            this.setMat(part, part.mat);

            this.scene.remove(part.light);
            part.light = null;
            part.emissive = false;
        }
    }

    async clonePart(part) {
        if (part) {
            this.newPart(
                part.type,
                [part.position.x, part.position.y, part.position.z],
                [part.scale.x, part.scale.y, part.scale.z],
                [part.rotation.x, part.rotation.y, part.rotation.z],
                part.mat,
                part.shadows
            )
        } else {
            console.warn("[!] Action (clone) was not performed; No part was supplied or found.")
        }
    }

    async delPart(part) {
        if (part) {
            if (part.emissive) {
                this.scene.remove(part.light);
            }

            this.parts = this.parts.filter(item => item !== part);
            this.scene.remove(part);

        } else {
            console.warn("[!] Action (delete) was not performed; No part was supplied or found.")
        }
    }

    async updateUVs(part) {
        if (part) {
            console.log(part.type)
            if (part.type === "cube") {
                //left

                part.geometry.attributes.uv.array[2] = part.scale.z;
                part.geometry.attributes.uv.array[6] = part.scale.z;
        
                part.geometry.attributes.uv.array[1] = part.scale.y;
                part.geometry.attributes.uv.array[3] = part.scale.y;
        
        
        
                //right
                part.geometry.attributes.uv.array[10] = part.scale.z;
                part.geometry.attributes.uv.array[14] = part.scale.z;
        
                part.geometry.attributes.uv.array[9] = part.scale.y;
                part.geometry.attributes.uv.array[11] = part.scale.y;
        
        
                //top
                part.geometry.attributes.uv.array[18] = part.scale.x;
                part.geometry.attributes.uv.array[22] = part.scale.x;
        
                part.geometry.attributes.uv.array[17] = part.scale.z;
                part.geometry.attributes.uv.array[19] = part.scale.z;
        
        
                //bottom
                part.geometry.attributes.uv.array[26] = part.scale.x;
                part.geometry.attributes.uv.array[30] = part.scale.x;
        
                part.geometry.attributes.uv.array[25] = part.scale.z;
                part.geometry.attributes.uv.array[27] = part.scale.z;
        
        
                //left
                part.geometry.attributes.uv.array[34] = part.scale.x;
                part.geometry.attributes.uv.array[38] = part.scale.x;
        
                part.geometry.attributes.uv.array[33] = part.scale.y;
                part.geometry.attributes.uv.array[35] = part.scale.y;
        
        
                //right
                part.geometry.attributes.uv.array[42] = part.scale.x;
                part.geometry.attributes.uv.array[46] = part.scale.x;
        
                part.geometry.attributes.uv.array[41] = part.scale.y;
                part.geometry.attributes.uv.array[43] = part.scale.y;
            }
    
    
            part.geometry.attributes.uv.needsUpdate = true;
        } else {
            console.warn("[!] Action (update uvs) was not performed; No part was supplied or found.")
        }
    }

    export() {
        var saveParts = [];

        for (let p in this.parts) {
            let part = this.parts[p];

            saveParts.push({
                position: [
                    part.position.x,
                    part.position.y,
                    part.position.z
                ],

                scale: [
                    part.scale.x,
                    part.scale.y,
                    part.scale.z
                ],

                rotation: [
                    part.rotation.x,
                    part.rotation.y,
                    part.rotation.z
                ],

                material: part.mat,

                type: part.type,

                color: [
                    part.material.color.r*255,
                    part.material.color.g*255,
                    part.material.color.b*255,
                ]
            })

            if (part.emissive) {
                saveParts[saveParts.length - 1].emissive = true;
                saveParts[saveParts.length - 1].emissionIntensity = part.light.intensity;
                saveParts[saveParts.length - 1].emissionRange = part.light.shadow.camera.far;
            }
        }

        return {parts: saveParts};
    }
}