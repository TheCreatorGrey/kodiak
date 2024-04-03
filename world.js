import * as THREE from 'three';
import { startScript } from './scripting.js';

export const defaultWorld = "eyJwYXJ0cyI6W3sicG9zaXRpb24iOlszLjEyNSwxLjg3NSwwLjVdLCJzY2FsZSI6WzAuMjUsMy4yNSw1LjVdLCJyb3RhdGlvbiI6WzAsMCwwXSwibWF0ZXJpYWwiOiJicmlja193YWxsXzAwNSIsInR5cGUiOiJjdWJlIiwiY29sb3IiOlsyNTUsMjU1LDI1NV19LHsicG9zaXRpb24iOlswLDAuMjUsMC41XSwic2NhbGUiOls2LDAuNSw1XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiYnJ1c2hlZF9jb25jcmV0ZV8yIiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzI1NSwyNTUsMjU1XX0seyJwb3NpdGlvbiI6WzAsMC42MjUsMC41XSwic2NhbGUiOls2LDAuMjUsNV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6InJhd19wbGFua193YWxsIiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzUwLDEwLDEwXX0seyJwb3NpdGlvbiI6WzIuODc1LDIuMTI1LDAuNV0sInNjYWxlIjpbMC4yNSwyLjc1LDQuNV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImJlaWdlX3dhbGxfMDAxIiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzIwMCwyMDAsMjAwXX0seyJwb3NpdGlvbiI6Wy0xLjg3NSwzLjI1LDIuODc1XSwic2NhbGUiOlsxLjI1LDAuNSwwLjI1XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiYmVpZ2Vfd2FsbF8wMDEiLCJ0eXBlIjoiY3ViZSIsImNvbG9yIjpbMjAwLDIwMCwyMDBdfSx7InBvc2l0aW9uIjpbMCw0LjM3NSwwLjVdLCJzY2FsZSI6WzUuNSwwLjI1LDQuNV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImdyZXlfcm9vZl90aWxlc18wMiIsInR5cGUiOiJjdWJlIiwiY29sb3IiOls1MCwwLDBdfSx7InBvc2l0aW9uIjpbMC44NzUsMi4xMjUsMi44NzVdLCJzY2FsZSI6WzQuMjUsMi43NSwwLjI1XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiYmVpZ2Vfd2FsbF8wMDEiLCJ0eXBlIjoiY3ViZSIsImNvbG9yIjpbMjAwLDIwMCwyMDBdfSx7InBvc2l0aW9uIjpbMCwyLjEyNSwtMS44NzVdLCJzY2FsZSI6WzYsMi43NSwwLjI1XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiYmVpZ2Vfd2FsbF8wMDEiLCJ0eXBlIjoiY3ViZSIsImNvbG9yIjpbMjAwLDIwMCwyMDBdfSx7InBvc2l0aW9uIjpbLTIuNzUsMi4xMjUsMi44NzVdLCJzY2FsZSI6WzAuNSwyLjc1LDAuMjVdLCJyb3RhdGlvbiI6WzAsMCwwXSwibWF0ZXJpYWwiOiJiZWlnZV93YWxsXzAwMSIsInR5cGUiOiJjdWJlIiwiY29sb3IiOlsyMDAsMjAwLDIwMF19LHsicG9zaXRpb24iOlstMi44NzUsMi4xMjUsMC41XSwic2NhbGUiOlswLjI1LDIuNzUsNC41XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiYmVpZ2Vfd2FsbF8wMDEiLCJ0eXBlIjoiY3ViZSIsImNvbG9yIjpbMjAwLDIwMCwyMDBdfSx7InBvc2l0aW9uIjpbLTMuMTI1LDEuODc1LDAuNV0sInNjYWxlIjpbMC4yNSwzLjI1LDUuNV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImJyaWNrX3dhbGxfMDA1IiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzI1NSwyNTUsMjU1XX0seyJwb3NpdGlvbiI6WzAsMS44NzUsLTIuMTI1XSwic2NhbGUiOls2LDMuMjUsMC4yNV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImJyaWNrX3dhbGxfMDA1IiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzI1NSwyNTUsMjU1XX0seyJwb3NpdGlvbiI6WzAuODc1LDEuODc1LDMuMTI1XSwic2NhbGUiOls0LjI1LDMuMjUsMC4yNV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImJyaWNrX3dhbGxfMDA1IiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzI1NSwyNTUsMjU1XX0seyJwb3NpdGlvbiI6Wy0yLjc1LDEuODc1LDMuMTI1XSwic2NhbGUiOlswLjUsMy4yNSwwLjI1XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiYnJpY2tfd2FsbF8wMDUiLCJ0eXBlIjoiY3ViZSIsImNvbG9yIjpbMjU1LDI1NSwyNTVdfSx7InBvc2l0aW9uIjpbLTEuODc1LDMuMjUsMy4xMjVdLCJzY2FsZSI6WzEuMjUsMC41LDAuMjVdLCJyb3RhdGlvbiI6WzAsMCwwXSwibWF0ZXJpYWwiOiJicmlja193YWxsXzAwNSIsInR5cGUiOiJjdWJlIiwiY29sb3IiOlsyNTUsMjU1LDI1NV19LHsicG9zaXRpb24iOlstMS44NzUsMC4xMjUsMy42MjVdLCJzY2FsZSI6WzEuMjUsMC4yNSwwLjI1XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiYnJ1c2hlZF9jb25jcmV0ZSIsInR5cGUiOiJjdWJlIiwiY29sb3IiOlsyNTUsMjU1LDI1NV19LHsicG9zaXRpb24iOlswLDMuMzc1LDAuNV0sInNjYWxlIjpbNS41LDAuMjUsNC41XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiYmVpZ2Vfd2FsbF8wMDEiLCJ0eXBlIjoiY3ViZSIsImNvbG9yIjpbMjU1LDI1NSwyNTVdfSx7InBvc2l0aW9uIjpbMCwzLjYyNSwwLjVdLCJzY2FsZSI6WzcsMC4yNSw2XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiZ3JleV9yb29mX3RpbGVzXzAyIiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzUwLDAsMF19LHsicG9zaXRpb24iOlswLDMuODc1LDAuNV0sInNjYWxlIjpbNi41LDAuMjUsNS41XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiZ3JleV9yb29mX3RpbGVzXzAyIiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzUwLDAsMF19LHsicG9zaXRpb24iOlswLDQuMTI1LDAuNV0sInNjYWxlIjpbNiwwLjI1LDVdLCJyb3RhdGlvbiI6WzAsMCwwXSwibWF0ZXJpYWwiOiJncmV5X3Jvb2ZfdGlsZXNfMDIiLCJ0eXBlIjoiY3ViZSIsImNvbG9yIjpbNTAsMCwwXX0seyJwb3NpdGlvbiI6Wy0xLjg3NSwwLjM3NSwzLjEyNV0sInNjYWxlIjpbMS4yNSwwLjc1LDAuMjVdLCJyb3RhdGlvbiI6WzAsMCwwXSwibWF0ZXJpYWwiOiJicnVzaGVkX2NvbmNyZXRlIiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzI1NSwyNTUsMjU1XX0seyJwb3NpdGlvbiI6Wy0xLjg3NSwwLjI1LDMuMzc1XSwic2NhbGUiOlsxLjI1LDAuNSwwLjI1XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiYnJ1c2hlZF9jb25jcmV0ZSIsInR5cGUiOiJjdWJlIiwiY29sb3IiOlsyNTUsMjU1LDI1NV19LHsicG9zaXRpb24iOlswLDMuMTI1LDAuNV0sInNjYWxlIjpbMSwwLjI1LDFdLCJyb3RhdGlvbiI6WzAsMCwwXSwibWF0ZXJpYWwiOiJkb3VibGVfYnJpY2tfZmxvb3IiLCJ0eXBlIjoiY3lsaW5kZXIiLCJjb2xvciI6WzI1NSwyNTUsMjU1XSwiZW1pc3NpdmUiOnRydWUsImVtaXNzaW9uSW50ZW5zaXR5IjozLCJlbWlzc2lvblJhbmdlIjoxMH0seyJwb3NpdGlvbiI6WzAsLTAuMTI1LDMuNV0sInNjYWxlIjpbMTMuNSwwLjI1LDE4XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiYnJvd25fbXVkX2xlYXZlc18wMSIsInR5cGUiOiJjdWJlIiwiY29sb3IiOlsyNTUsMjU1LDI1NV19LHsicG9zaXRpb24iOlswLDEuMjUsMTIuMzc1XSwic2NhbGUiOlsxMywyLjUsMC4yNV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImJyb3duX3BsYW5rc18wMyIsInR5cGUiOiJjdWJlIiwiY29sb3IiOlsyNTUsMjU1LDI1NV19LHsicG9zaXRpb24iOls2LjYyNSwxLjI1LDMuNV0sInNjYWxlIjpbMC4yNSwyLjUsMThdLCJyb3RhdGlvbiI6WzAsMCwwXSwibWF0ZXJpYWwiOiJicm93bl9wbGFua3NfMDMiLCJ0eXBlIjoiY3ViZSIsImNvbG9yIjpbMjU1LDI1NSwyNTVdfSx7InBvc2l0aW9uIjpbLTYuNjI1LDEuMjUsMy41XSwic2NhbGUiOlswLjI1LDIuNSwxOF0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImJyb3duX3BsYW5rc18wMyIsInR5cGUiOiJjdWJlIiwiY29sb3IiOlsyNTUsMjU1LDI1NV19LHsicG9zaXRpb24iOlswLDEuMjUsLTUuMzc1XSwic2NhbGUiOlsxMywyLjUsMC4yNV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImJyb3duX3BsYW5rc18wMyIsInR5cGUiOiJjdWJlIiwiY29sb3IiOlsyNTUsMjU1LDI1NV19LHsicG9zaXRpb24iOlstNC4yNSwxLjUsOS42MjVdLCJzY2FsZSI6WzEsMSwxXSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiYmx1ZV9wYWludGVkX3BsYW5rcyIsInR5cGUiOiJjdWJlIiwiY29sb3IiOlsyNTUsMjU1LDI1NV19LHsicG9zaXRpb24iOlstNC43NSwwLjUsMTAuMjVdLCJzY2FsZSI6WzEsMSwxXSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiZG91YmxlX2JyaWNrX2Zsb29yIiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzI1NSwyNTUsMjU1XX0seyJwb3NpdGlvbiI6Wy00Ljc1LDAuNSw5XSwic2NhbGUiOlsxLDEsMV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImJhcmtfd2lsbG93IiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzI1NSwyNTUsMjU1XX0seyJwb3NpdGlvbiI6Wy0zLjUsMC41LDkuNjI1XSwic2NhbGUiOlsxLDEsMV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImJsdWVfZmxvb3JfdGlsZXNfMDEiLCJ0eXBlIjoiY3ViZSIsImNvbG9yIjpbMjU1LDI1NSwyNTVdfV0sInNjcmlwdHMiOlt7InN5bnRheCI6ImxvZyBzdHI6SGVsbG8hIiwibmFtZSI6Ik1haW4ifV19";

export class World {
    constructor(data, advancedRendering=true, mode='studio') {
        this.load(data, advancedRendering, mode)
    }

    load(data, advancedRendering=true, mode='studio') {
        this.canvas = document.getElementById('cnv');

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(100, this.canvas.clientWidth / this.canvas.clientHeight, 0.1, 1000000);
        this.textureLoader = new THREE.TextureLoader();
        this.clock = new THREE.Clock();
        this.raycaster = new THREE.Raycaster();

        this.renderer = new THREE.WebGLRenderer({
            antialias: false,
            alpha: false,
            canvas: this.canvas
        });

        this.renderer.shadowMap.enabled = true;

        const resulution = 1;
        this.renderer.setSize(this.canvas.clientWidth / resulution, this.canvas.clientHeight / resulution);
        //this.renderer.domElement.style.width = (this.renderer.domElement.width * resulution) + 'px';
        //this.renderer.domElement.style.height = (this.renderer.domElement.height * resulution) + 'px';
        document.body.appendChild(this.renderer.domElement);
        this.mode = mode;


        this.camera.position.y = 2;
        this.camera.fov = 70;
        this.camera.updateProjectionMatrix();

        this.skybox = new THREE.Mesh(
            new THREE.BoxGeometry(100000, 100000, 100000),
            new THREE.MeshBasicMaterial({color: new THREE.Color('rgb(50, 50, 50)'), side: THREE.BackSide}));

        this.scene.add(this.skybox);


        const sun = new THREE.DirectionalLight(0xFFFDDD, 3);
        sun.position.set(2000, 2000, 2000);
        sun.castShadow = true;
        //sun.shadow.radius = 8;

        sun.shadow.camera.far = 10000;
        this.scene.add(sun);

        this.ambient = new THREE.AmbientLight( new THREE.Color(`rgb(50, 50, 50)`) );
        this.scene.add(this.ambient);

        this.scene.fog = new THREE.FogExp2( new THREE.Color(`rgb(50, 50, 50)`), .05);


        //const planeGeometry = new THREE.PlaneGeometry(50, 50);
        //const diffuse = this.textureLoader.load(`https://media.discordapp.net/attachments/1043652794374160385/1152635703608475779/Untitled_1.png?width=630&height=630`);
        //diffuse.repeat.set(50, 50);
        //diffuse.wrapS = THREE.RepeatWrapping;
        //diffuse.wrapT = THREE.RepeatWrapping;
        //const planeMaterial = new THREE.MeshPhongMaterial({
        //    map: diffuse,
        //});
        //const groundPlane = new THREE.Mesh(planeGeometry, planeMaterial);
        //groundPlane.rotation.x = -Math.PI / 2;
        //this.scene.add(groundPlane);
        //
        //groundPlane.receiveShadow = true;

        //sun.lookAt(groundPlane.position);


        window.addEventListener("resize", (event) => {
            console.log(this.canvas.clientWidth)
            this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
            this.camera.updateProjectionMatrix();

            this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        });



        this.parts = [];
        this.lights = [];
        this.advancedRendering = advancedRendering;
        this.materialCache = {};

        if (data) {
            let parsed = JSON.parse(atob(data));
            parsed.world = {skyColor:[50, 50, 50], studioCamPos:[2, 2, -2, 0, 2.356, 0]}
            
            if (parsed.world) {
                let rawcol = parsed.world.skyColor;
                let col = new THREE.Color(`rgb(${rawcol[0]},${rawcol[1]},${rawcol[2]})`);
                this.skybox.material.color = col;
                this.ambient.color = col;
                this.scene.fog.color = col;

                if (this.mode = 'studio') {
                    let studiocampos = parsed.world.studioCamPos;

                    this.camera.position.set(
                        studiocampos[0],
                        studiocampos[1],
                        studiocampos[2]
                    );

                    this.camera.rotation.set(
                        studiocampos[3],
                        studiocampos[4],
                        studiocampos[5]
                    );
                }
            }

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

            if (parsed.scripts) {
                this.scripts = parsed.scripts;
            } else {
                this.scripts = [{syntax:'log str:Hello!', name:'Main'}]
            }
        }
    }

    loadScripts() {
        for (let sc of this.scripts) {
            startScript(sc, this)
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
                material = new THREE.MeshLambertMaterial({
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

            let col = new THREE.Color(`rgb(${part.material.color.r*255},${part.material.color.g*255},${part.material.color.b*255})`);

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

        return {parts: saveParts, scripts:this.scripts};
    }
}