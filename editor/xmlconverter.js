import { RM2EA } from "../bridge.js";

export async function convertXML(world, filename) {
    let request = await fetch(filename);
    let text = await request.text();

    let parser = new DOMParser();
    let xml = parser.parseFromString(text, "text/xml");

    console.log(xml)


    // According to the Roblox wiki, a stud is about 0.28 meters. In Kodiak, 1 unit is equivalent to a meter.
    let scale_factor = 0.28;


    // Load Roblox primitives
    await world.importModelByURL("/kodiak/3rdparty/roblox/shapes/cylinder.obj", "roblox_cylinder");
    await world.importModelByURL("/kodiak/3rdparty/roblox/shapes/wedge.obj", "roblox_wedge");
    await world.importModelByURL("/kodiak/3rdparty/roblox/shapes/cornerwedge.obj", "roblox_cornerwedge");


    let special_parts = xml.getElementsByClassName("WedgePart");
    for (let part of special_parts) {
        let props = part.firstElementChild;

        let shape_token = xml.createElement("token")
        shape_token.setAttribute("name", "shape")
        shape_token.innerHTML = "3"
        props.appendChild(shape_token)

        part.className = "Part"
    }

    special_parts = xml.getElementsByClassName("TrussPart");
    for (let part of special_parts) {
        let props = part.firstElementChild;

        let shape_token = xml.createElement("token")
        shape_token.setAttribute("name", "shape")
        shape_token.innerHTML = "1"
        props.appendChild(shape_token)

        part.className = "Part"
    }


    let parts = xml.getElementsByClassName("Part");

    let parts_iterated = 0;
    for (let part of parts) {
        let properties = part.firstElementChild;

        function getTransformFromProperties(el) {
            // Position
            let CFrame = properties.getElementsByTagName("CoordinateFrame")[0];
            let x = parseFloat(CFrame.getElementsByTagName("X")[0].textContent);
            let y = parseFloat(CFrame.getElementsByTagName("Y")[0].textContent);
            let z = parseFloat(CFrame.getElementsByTagName("Z")[0].textContent);


            // Scale
            let size;
            let vec3s = properties.getElementsByTagName("Vector3");
            for (let i of vec3s) {
                if (i.getAttribute("name") === "size") {
                    size = i;
                    break
                }
            }

            let size_x = parseFloat(size.getElementsByTagName("X")[0].textContent);
            let size_y = parseFloat(size.getElementsByTagName("Y")[0].textContent);
            let size_z = parseFloat(size.getElementsByTagName("Z")[0].textContent);


            // Rotation
            let R00 = parseFloat(CFrame.getElementsByTagName("R00")[0].textContent);
            let R01 = parseFloat(CFrame.getElementsByTagName("R01")[0].textContent);
            let R02 = parseFloat(CFrame.getElementsByTagName("R02")[0].textContent);

            let R10 = parseFloat(CFrame.getElementsByTagName("R10")[0].textContent);
            let R11 = parseFloat(CFrame.getElementsByTagName("R11")[0].textContent);
            let R12 = parseFloat(CFrame.getElementsByTagName("R12")[0].textContent);

            let R20 = parseFloat(CFrame.getElementsByTagName("R20")[0].textContent);
            let R21 = parseFloat(CFrame.getElementsByTagName("R21")[0].textContent);
            let R22 = parseFloat(CFrame.getElementsByTagName("R22")[0].textContent);

            function getRotation(cf) {
                let R00 = parseFloat(cf.getElementsByTagName("R00")[0].textContent);
                let R01 = parseFloat(cf.getElementsByTagName("R01")[0].textContent);
                let R02 = parseFloat(cf.getElementsByTagName("R02")[0].textContent);
    
                let R10 = parseFloat(cf.getElementsByTagName("R10")[0].textContent);
                let R11 = parseFloat(cf.getElementsByTagName("R11")[0].textContent);
                let R12 = parseFloat(cf.getElementsByTagName("R12")[0].textContent);
    
                let R20 = parseFloat(cf.getElementsByTagName("R20")[0].textContent);
                let R21 = parseFloat(cf.getElementsByTagName("R21")[0].textContent);
                let R22 = parseFloat(cf.getElementsByTagName("R22")[0].textContent);

                //return RM2EA([
                //    [R00, R01, R02],
                //    [R10, R11, R12],
                //    [R20, R21, R22]
                //])

                return [
                    -Math.atan2(R12, R22),
                    Math.asin(R02),
                    -Math.atan2(R01, R00)
                ]
            }

            let [rotation_x, rotation_y, rotation_z] = getRotation(CFrame);
            //let [origin_rotation_x, origin_rotation_y, origin_rotation_z] = getRotation(CFrame);

            //rotation_x -= origin_rotation_x; // Also make sure to apply origin rotation offset
            //rotation_y -= origin_rotation_y;
            //rotation_z -= origin_rotation_z;

            //rotation_z += 1.570796;

            //if (el.parentElement.parentElement) {
            //    let parent_offset = getTransformFromProperties(el.parentElement.parentElement.firstElementChild)

            //    rotation_x += parent_offset.rotation[0];
            //    rotation_y += parent_offset.rotation[1];
            //    rotation_z += parent_offset.rotation[2];
            //}

            return {
                position:[x, y, z],
                scale:[size_x, size_y, size_z],
                rotation:[rotation_x, rotation_y, rotation_z]
            }
        }

        let transform = getTransformFromProperties(properties)

        //rotation_x = Math.atan2(R12, R22);
        //rotation_y = -Math.asin(R02);
        //rotation_z = Math.atan2(R01, R00)


        // Texture
        let mat_texture_url = "../3rdparty/roblox/materials/Wood/color.png";
        
        let part_children = part.children;
        for (let child of part.children) {
            if (child.nodeName == "Item") {
                let props = child.firstElementChild;

                break

                for (let p of props.children) {
                    console.log(p)
                    if (p.nodeName == "Content") {
                        console.log(p.attributes.name.nodeValue)
                        if (p.attributes.name.nodeValue == "Texture") {
                            let asset_id = p.children[0].textContent;
                            let id_stripped = asset_id.split("://")[1]
                            console.log(id_stripped)



                            let request = await fetch(`https://assetdelivery.roblox.com/v1/asset/?id=${id_stripped}`);
                            const blob = await request.blob();
            
                            // 2. Convert blob to Base64 data URL
                            const base64 = await new Promise((resolve, reject) => {
                                const reader = new FileReader();
                                reader.onerror = reject;
                                reader.onload = () => resolve(reader.result); // e.g., "data:application/octet-stream;base64,XYZ..."
                                reader.readAsDataURL(blob);
                            });
            
                            mat_texture_url = base64
                        }
                    }
                }
            }
        }

        console.log(mat_texture_url)


        // Ignore if transparent (for now)
        let transparency = 0
        for (let float of properties.getElementsByTagName("float")) {
            //console.log(token)
            if (float.attributes.name.nodeValue == "Transparency") {
                transparency = parseFloat(float.textContent)
            }
        }

        if (transparency >= 0.5) {
            continue
        }


        // Color
        let Color3uint8 = parseInt(properties.getElementsByTagName("Color3uint8")[0].textContent);
        let r = (Color3uint8 >> 16) & 0xFF;
        let g = (Color3uint8 >> 8) & 0xFF;
        let b = Color3uint8 & 0xFF;

        console.log(r, g, b)


        // Material
        let mat_token = 256
        for (let token of properties.getElementsByTagName("token")) {
            //console.log(token)
            if (token.attributes.name.nodeValue == "Material") {
                mat_token = token
            }
        }
        let material_code = mat_token.textContent;

        let material_name = "Pebble";
        if (material_code == 256) {
            material_name = "Plastic" // Verified
        } if (material_code == 816) {
            material_name = "Concrete"
        } if (material_code == 528) {
            material_name = "WoodPlanks" // Verified
        } if (material_code == 1056) {
            material_name = "DiamondPlate" // Verified
        } if (material_code == 848) {
            material_name = "Brick" // Verified
        } if (material_code == 1280) {
            material_name = "Grass"
        } if (material_code == 1376) {
            material_name = "Asphalt"
        } if (material_code == 272) {
            material_name = "Plastic" // This is supposed to be smoothplastic
        } if (material_code == 512) {
            material_name = "Wood"
        } if (material_code == 1568) {
            material_name = "Glass"
        } if (material_code == 1312) {
            material_name = "Fabric"
        } if (material_code == 1088) {
            material_name = "Metal"
        } if (material_code == 1296) {
            material_name = "Sand"
        } if (material_code == 1284) {
            material_name = "LeafyGrass"
        } if (material_code == 1360) {
            material_name = "Ground"
        } if (material_code == 836) {
            material_name = "Pavement"
        } if (material_code == 800) {
            material_name = "Slate"
        } if (material_code == 288) {
            material_name = "Plastic" // This is supposed to be neon
        } if (material_code == 784) {
            material_name = "Marble"
        } if (material_code == 1536) {
            material_name = "Ice"
        } if (material_code == 832) {
            material_name = "Granite"
        }


        // Shape
        let shape_token;
        for (let token of properties.getElementsByTagName("token")) {
            //console.log(token)
            if (token.attributes.name.nodeValue == "shape") {
                shape_token = token
            }
        }
        let shape_code = shape_token.textContent;

        let model_name;
        if (shape_code == "0") {
            model_name = "Sphere"
        } else if (shape_code == "1") {
            model_name = "Box"
        } else if (shape_code == "2") {
            model_name = "roblox_cylinder"
        } else if (shape_code == "3") {
            model_name = "roblox_wedge"
        } else if (shape_code == "4") {
            model_name = "roblox_cornerwedge"
        }




        // ========
        let new_object_id = world.newPart();
        let new_object = world.getObjectByID(new_object_id);

        new_object.position[0] = transform.position[0]*scale_factor;
        new_object.position[1] = transform.position[1]*scale_factor;
        new_object.position[2] = transform.position[2]*scale_factor;

        new_object.scale[0] = transform.scale[0]*scale_factor;
        new_object.scale[1] = transform.scale[1]*scale_factor;
        new_object.scale[2] = transform.scale[2]*scale_factor;

        console.log("shit pant", transform.rotation[0])
        new_object.rotation[0] = transform.rotation[0];
        new_object.rotation[1] = transform.rotation[1];
        new_object.rotation[2] = transform.rotation[2];

        let kodiak_material_name = `Roblox ${material_name} (${r},${g},${b})`;
        let mat_id = world.getMaterialIDByName(kodiak_material_name)

        if (!mat_id) {
            mat_id = await world.importMaterialByURL(`../3rdparty/roblox/materials/${material_name}/color.png`, kodiak_material_name);
            let object_mat = world.materials[mat_id];
            object_mat.tint = [r, g, b];
            object_mat.stretch = false;
            object_mat.scale = [.2/scale_factor, .2/scale_factor]
        }

        new_object.material = mat_id;
        new_object.model = world.getModelIDByName(model_name)

        world.manifest(new_object_id);

        updateProgress("Importing RBXMX", "parts", parts_iterated, parts.length)
        parts_iterated++
    }
}