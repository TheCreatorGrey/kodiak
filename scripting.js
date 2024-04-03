export function startScript(scr, world, tickspeed=1) {
    let activeLine = 0;
    let script = scr.syntax.split('\n');
    let scriptName = scr.name;
    let variables = {};

    function studioLog(str, type="Error") {
        let c = document.getElementById('studioConsole');

        if (type == 'Normal') {
            c.innerHTML += "<br>" + str
        }

        if (type == 'Error') {
            c.innerHTML += `<br><span style="color:red">[!] Script error at line ${activeLine} in script "${scriptName}": ${str}</span>`;
            clearInterval(interval);
        }

        if (type == 'Warn') {
            c.innerHTML += `<br><span style="color:yellow">[!] Script warning at line ${activeLine} in script "${scriptName}": ${str}</span>`
        }

        c.scrollTo(0, c.scrollHeight);
    }

    function parseValue(string) {
        let v = string.split(":");
        let type = v[0];
        let val = v[1];

        if (type === 'copy') {
            if (val in variables) {
                return variables[val]
            } else {
                studioLog(`Could not copy variable "${val}" because it does not exist.`, "Error")
            }
        }

        if (type === 'str') {
            return val
        }

        if (type === 'int') {
            let int = parseInt(val);

            if (isNaN(int)) {
                studioLog(`"${int}" is not a valid integer.`, "Error")
            } else {
                return int
            }
        }

        if (type === 'float') {
            let int = parseFloat(val);

            if (isNaN(int)) {
                studioLog(`"${int}" is not a valid float.`, "Error")
            } else {
                return int
            }
        }

        if (type === 'cond') {
            if (val.includes(">")) {
                let conds = val.split(">");
                
                if (! (conds[0] in variables)) {
                    studioLog(`Could not find variable "${conds[0]}".`, "Error")
                }

                if (! (conds[1] in variables)) {
                    studioLog(`Could not find variable "${conds[1]}".`, "Error")
                }
    
                return (variables[conds[0]] > variables[conds[1]])
            }
        }

        if (type === 'math') {
            if (val.includes("+")) {
                let conds = val.split("+");
                
                if (! (conds[0] in variables)) {
                    studioLog(`Could not find variable "${conds[0]}".`, "Error")
                }

                if (! (conds[1] in variables)) {
                    studioLog(`Could not find variable "${conds[1]}".`, "Error")
                }
    
                return (variables[conds[0]] > variables[conds[1]])
            }
        }

        if (type === 'random') {
            let args = val.split('&');
            if (args.length > 1) {
                let int1 = parseInt(args[0]);
                let int2 = parseInt(args[1]);

                if (isNaN(int1) || isNaN(int2)) {
                    studioLog(`One or both of the range values you specified ("${int1}" and "${int2}") are not integers.`, "Error")
                } else {
                    return Math.random() * (int2 - int1) + int1
                }
            } else {
                studioLog(`You must specify the mininum and maximum range when making random values. Example: "random:1_10"`, "Error")
            }
        }
    }

    let condition = true;
    let interval = setInterval(function() {
        variables.camX = world.camera.position.x;
        variables.camY = world.camera.position.y;
        variables.camZ = world.camera.position.z;
        variables.partCount = world.parts.length;
        variables.Random = Math.random()-.5;

        let line = script[activeLine].split(" ");

        if (line[0] === 'endif') {
            condition = true
        }

        if (condition) {
            if (line[0] === 'if') {
                condition = parseValue(line[1])
            }

            if (line[0] === 'log') {
                studioLog(parseValue(line[1]), "Normal")
            }
            
            if (line[0] === 'var') {
                if (line[1] === 'set') {
                    variables[line[2]] = parseValue(line[3])
                }
    
                if (line[1] === 'iter') {
                    variables[line[2]] += parseValue(line[3])
                }

                if (line[1] === 'multiply') {
                    variables[line[2]] *= parseValue(line[3])
                }

                if (line[1] === 'add') {
                    variables[line[2]] += parseValue(line[3])
                }

                if (line[1] === 'subtract') {
                    variables[line[2]] -= parseValue(line[3])
                }
            }
    
            if (line[0] === 'part') {
                if (line[1] === 'new') {
                    world.newPart()
                } else {
                    let partID = parseValue(line[2]);

                    if (partID <= world.parts.length) {
                        if (line[1] === 'modify') {
                            if (partID <= world.parts.length) {
                                let part = world.parts[partID];
                                let val = parseValue(line[4]);
                
                                if (line[3] == 'rotation_x') {
                                    part.rotation.x = val
                                }
                                if (line[3] == 'rotation_y') {
                                    part.rotation.y = val
                                }
                                if (line[3] == 'rotation_z') {
                                    part.rotation.z = val
                                }
            
                                if (line[3] == 'position_x') {
                                    part.position.x = val
                                }
                                if (line[3] == 'position_y') {
                                    part.position.y = val
                                }
                                if (line[3] == 'position_z') {
                                    part.position.z = val
                                }
            
                                if (line[3] == 'scale_x') {
                                    part.scale.x = val
                                }
                                if (line[3] == 'scale_y') {
                                    part.scale.y = val
                                }
                                if (line[3] == 'scale_z') {
                                    part.scale.z = val
                                }
                
                                if (line[3] == 'material') {
                                    world.setMat(part, val)
                                }
                            } else {
                                studioLog(`Could not find part with ID ${partID}.`, "Error")
                            }
                        }
        
                        if (line[1] === 'remove') {
                            world.delPart(world.parts[partID])
                        }
                    } else {
                        studioLog(`Could not find part with ID ${partID}.`, "Error")
                    }
                }
            }
    
            if (line[0] === 'setline') {
                let val = parseValue(line[1]);
    
                activeLine = val-1;
            }
        }

        activeLine += 1

        if ((activeLine+1) > script.length) {
            clearInterval(interval);
        }



        world.camera.position.set(
            variables.camX,
            variables.camY,
            variables.camZ
        )
    }, tickspeed)
}