export class KScript {
    constructor(world) {
        this.world = world;
        this.running_line = 0
        this.script = []
        this.memory = new Array(256); // Memory for the script's variables / memory slots is stored here

        // How many memory slots are taken, starting from 0
        this.filled_memory_slots = 32; // The first 32 memory slots are reserved for things like camera position, rotation and mouse position, which are updated every time a line executes

        this.command_table = {
            refresh: { // A marker that tells the interpreter that it can stop running code and render the next frame. Does not actually do anything when run. Usually used in loops. Every frame it executes line after line until it finds a refresh command (id 0).
                id:0,
                params:[]
            },

            log: { // Logs a number to the output
                id:1,
                params:[
                    {   // Value to log
                        range:[-128, 127],
                        memory:1
                    }
                ]
            },

            write: {
                id:2,
                params:[
                    {   // Memory slot number
                        range:[0, 255],
                        memory:1
                    },

                    {   // Value
                        range:[-128, 127],
                        memory:1
                    }
                ]
            },


            newobject: { // Creates a new object and sets the value of the memory slot given to its id
                id:16,
                params:[
                    {   // ID of memory slot to be set to the ID of the new obejct
                        range:[0, 255],
                        memory:1
                    }
                ]
            },


            move: {
                id:32,
                params:[
                    {
                        range:[0, 255],
                        memory:1
                    },
        
                    {
                        range:[0, 255^2],
                        memory:2
                    },
        
                    {
                        range:[0, 255^2],
                        memory:2
                    },
        
                    {
                        range:[0, 255^2],
                        memory:2
                    },
                ]
            },

            rotate: {
                id:33,
                params:[
                    {
                        range:[0, 255],
                        memory:1
                    },
        
                    {
                        range:[0, 360],
                        memory:2
                    },
        
                    {
                        range:[0, 360],
                        memory:2
                    },
        
                    {
                        range:[0, 360],
                        memory:2
                    },
                ]
            },

            scale: {
                id:34,
                params:[
                    {
                        range:[0, 255],
                        memory:1
                    },
        
                    {
                        range:[0, 360],
                        memory:2
                    },
        
                    {
                        range:[0, 360],
                        memory:2
                    },
        
                    {
                        range:[0, 360],
                        memory:2
                    },
                ]
            },

            setmodel: {
                id:35,
                params:[
                    {
                        range:[0, 255],
                        memory:1
                    },
        
                    {
                        range:[0, 255],
                        memory:1
                    }
                ]
            },

            setmaterial: {
                id:36,
                params:[
                    {
                        range:[0, 255],
                        memory:1
                    },
        
                    {
                        range:[0, 255],
                        memory:1
                    }
                ]
            },



            sum: { // Sets the value of the memory slot given to the sum of the two following values
                id:128,
                params:[
                    {   // ID of memory slot
                        range:[0, 255],
                        memory:1
                    },

                    {   // Value 1
                        range:[0, 255],
                        memory:1
                    },

                    {   // Value 2
                        range:[0, 255],
                        memory:1
                    }
                ]
            },

            diff: { // Sets the value of the memory slot given to the difference of the two following values
                id:129,
                params:[
                    {   // ID of memory slot
                        range:[0, 255],
                        memory:1
                    },

                    {   // Value 1
                        range:[0, 255],
                        memory:1
                    },

                    {   // Value 2
                        range:[0, 255],
                        memory:1
                    }
                ]
            },

            product: { // Sets the value of the memory slot given to the product of the two following values
                id:130,
                params:[
                    {   // ID of memory slot
                        range:[0, 255],
                        memory:1
                    },

                    {   // Value 1
                        range:[0, 255],
                        memory:1
                    },

                    {   // Value 2
                        range:[0, 255],
                        memory:1
                    }
                ]
            },

            quotient: { // Sets the value of the memory slot given to the quotient of the two following values
                id:131,
                params:[
                    {   // ID of memory slot
                        range:[0, 255],
                        memory:1
                    },

                    {   // Value 1
                        range:[0, 255],
                        memory:1
                    },

                    {   // Value 2
                        range:[0, 255],
                        memory:1
                    }
                ]
            },

            invert: { // Sets nonzero values to zero and zero values to 1
                id:132,
                params:[
                    {   // ID of memory slot
                        range:[0, 255],
                        memory:1
                    }
                ]
            },

            compare: { // Sets the value of the memory slot given to 0 if value 1 is greater than value 2, 1 if its the reverse of that, or 2 if there is a match
                id:133,
                params:[
                    {   // ID of memory slot
                        range:[0, 255],
                        memory:1
                    },

                    {   // Value 1
                        range:[0, 255],
                        memory:1
                    },

                    {   // Value 2
                        range:[0, 255],
                        memory:1
                    }
                ]
            }
        }
    }

    // Gets the index of the next empty/available memory slot
    nextAvailableMemSlot() {
        this.filled_memory_slots++
        return this.filled_memory_slots-1
    }


    // Adds a message to the script output panel (if there is one)
    log(text, color) {
        let script_output = document.getElementById("script_output")

        let message_div = document.createElement("div")
        message_div.innerText = text
        message_div.style.color = color
        script_output.appendChild(message_div)

        // Removes items if there is too much in the output
        if (10 < script_output.childElementCount) {
            script_output.removeChild(script_output.firstChild)
        }
    }

    // I think these are obvious
    logInfo(text) {
        this.log(`[i] ${text}`, "green")
    }

    logError(text) {
        this.log(`Error: ${text}`, "red")
    }

    logWarning(text) {
        this.log(`Warning: ${text}`, "yellow")
    }


    loadFromText(script) {
        this.running_line = 0
        this.script = [] 

        // Names / aliases for memory slots. Temporary and not needed after loading
        let aliases = {
            camera_x:0, // Pre-assign aliases to data slots reserved for uhh this stuff
            camera_y:1, // MAKE SURE filled_memory_slots MATCHES THE NUMBER OF PREASSIGNED ALIASES HERE
            camera_z:2,
            cam_rotation_x:3,
            cam_rotation_y:4,
            cam_rotation_z:5,
            mouse_x:6,
            mouse_y:7
        }

        this.logInfo("Loading script...")



        // I'm going to start writing this differently
        // Like it would be written in a low level language without
        // easy access to functions like split to make it easier
        // to rewrite if needed

        // Whether the current chars are part of a comment or not. Toggled when an asterisk is found
        let comment_ignore = false;
        // Whether the current line is invalid and should be ignored
        let line_invalid = false;
        // The name of the command of the current line
        let line_command_name = ""
        // Whether the loader reading the current line has reached the parameter part of the line
        let loading_params = false;
        // The current raw parameter text of the current line
        let line_param = "";
        // Parsed line
        let line = []


        // Try to find command ID from function name and add to the line
        let addRawFunctionName = () => {
            if (line_command_name in this.command_table) {
                let command_id = this.command_table[line_command_name].id
                line.push(command_id)
            } else {
                this.logWarning(`"${line_command_name}" is not a recognized command`)
                line_invalid = true
            }

            // Reset for next line
            line_command_name = ""
        }

        // Parse raw parameter text and add it to the line
        let addLineParameter = () => {
            if (line_param) {
                // If the parameter starts with a #, it means the ID of the memory slot associated with an alias or name should be used
                // If used for the first time, a memory slot ID will be associated with it
                if (line_param.startsWith("#")) {
                    // Names for memory slots are called aliases, and memory slots are referred to using aliases in the unprocessed script
                    // The alias for the slot being referred to should immediately follow the #.
                    let alias = line_param.slice(1)

                    let slot_id;
                    if (alias in aliases) {
                        // If the alias has already been established, use its memory slot id
                        slot_id = aliases[alias]
                    } else {
                        // If an alias is found for the first time, associate it with an unused memory slot number
                        slot_id = this.nextAvailableMemSlot()
                        aliases[alias] = slot_id
                    }

                    // Add the slot ID value
                    line.push([0, slot_id])

                } else if (line_param.startsWith("$")) {
                    // Or if the parameter starts with a $, the value stored in the memory slot
                    // associated with the alias should be used
                    
                    let alias = line_param.slice(1)
                    if (alias in aliases) {
                        let slot_id = aliases[alias]

                        // Type 1 is used because the ID should be used to get the value of the memory slot
                        line.push([1, slot_id])
                    }

                } else {
                    // If there is no tag and only a number, interpret literally as a number
                    // The first number 0 tells the interpreter that this is just a number
                    line.push([0, parseFloat(line_param)])
                }                
            }

            // Reset for next line parameter
            line_param = ""
        }


        for (let char of script) {
            if (char === "*") {
                comment_ignore = !comment_ignore
                continue
            }

            // Ignore characters inside comments
            if (comment_ignore) {
                continue
            }

            // Ignore newlines
            if (char === "\n") {
                continue
            }

            // Ignore whitespaces
            if (char === " ") {
                continue
            }


            if (char === ";") {
                // A semicolon indicates the end of a line

                // Wrap up command names or params for the current line
                if (loading_params) {
                    addLineParameter()
                } else {
                    addRawFunctionName()
                }

                if (!line_invalid) {
                    this.script.push(line)
                }

                // Everything should be reset for the next line
                loading_params = false
                line = []
                line_invalid = false

                // Continue so that the semicolon itself is not processed below
                continue
            }


            if (!loading_params) {
                if (char === ":") {
                    // By the time a colon is found, the command name
                    // should be completely loaded into the line_command_name string
                    
                    // Try to find command ID and add to the parsed line
                    addRawFunctionName()

                    // Now it is loading the parameter part of the line
                    loading_params = true

                    continue
                } else {
                    line_command_name += char
                }
            } else {
                // Otherwise if the loader is reading the parameter part of the line
                
                // A comma marks the end of a parameter
                if (char === ",") {
                    addLineParameter()

                    continue
                } else {
                    line_param += char
                }
            }
        
        }
    }


    getParamValue(param) {
        let param_type = param[0]
        let param_value = param[1]

        console.log(param)

        // 0 means interpret literally
        if (param_type === 0) {
            return param_value
        } else if (param_type === 1) { // 1 means get value from memory slot
            return this.memory[param_value]
        }
    }

    async executeNextLine() {
        this.memory[0] = this.world.camera.position.x
        this.memory[1] = this.world.camera.position.y
        this.memory[2] = this.world.camera.position.z

        this.memory[3] = this.world.camera.rotation.x
        this.memory[4] = this.world.camera.rotation.y
        this.memory[5] = this.world.camera.rotation.z

        this.memory[6] = 0 // Mouse x (add later)
        this.memory[7] = 0 // Mouse y (add later)


        if (this.running_line < this.script.length) {
            let line = this.script[this.running_line]
            let command = line[0]
            let params = line.slice(1)
    
            let param_values = []
            for (let param of params) {
                param_values.push(this.getParamValue(param))
            }
    
            //console.log(param_values)

            // Remember that refresh (id 0) does not directly run code;
            // it is a marker that tells the interpreter that
            // it can stop running code and render the next frame. All
            // Code still remaining will be put off to the next frame.
    
            if (command === 1) { // log
                console.log(param_values, "log")
                this.log(param_values[0], "white")
            }

            if (command === 2) { // write
                console.log(param_values, "write")
                this.memory[param_values[0]] = param_values[1]
            }



            if (command === 16) { // newobject
                let object = await this.world.newObject()
                this.memory[param_values[0]] = object.object_id
            }
            

            if (command === 32) { // move
                let object = this.world.getObjectByID(param_values[0])
                object.position.x = param_values[1]
                object.position.y = param_values[2]
                object.position.z = param_values[3]
            }

            if (command === 33) { // rotate
                let object = this.world.getObjectByID(param_values[0])
                //console.log(param_values[0])
                object.rotation.x = param_values[1]
                object.rotation.y = param_values[2]
                object.rotation.z = param_values[3]
            }

            if (command === 34) { // scale
                let object = this.world.getObjectByID(param_values[0])
                //console.log(param_values[0])
                object.scale.x = param_values[1]
                object.scale.y = param_values[2]
                object.scale.z = param_values[3]
            }

            if (command === 35) { // setmodel
                let object = this.world.getObjectByID(param_values[0])
                await this.world.setModel(object.object_id, param_values[1])
            }

            if (command === 36) { // setmaterial
                let object = this.world.getObjectByID(param_values[0])
                await this.world.setMaterial(object.object_id, param_values[1])
            }


            if (command === 128) { // sum
                this.memory[param_values[0]] = param_values[1] + param_values[2]
            }

            if (command === 129) { // diff
                this.memory[param_values[0]] = param_values[1] - param_values[2]
            }
            
            if (command === 130) { // product
                this.memory[param_values[0]] = param_values[1] * param_values[2]
            }

            if (command === 131) { // quotient
                this.memory[param_values[0]] = param_values[1] / param_values[2]
            }

            if (command === 132) { // invert
                if (param_values[1] === 0) {
                    this.memory[param_values[0]] = 1
                } else {
                    this.memory[param_values[0]] = 0
                }
            }

            if (command === 133) { // compare
                if (param_values[1] < param_values[0]) {
                    this.memory[param_values[0]] = 0
                } else if (param_values[1] > param_values[0]) {
                    this.memory[param_values[0]] = 1
                } else {
                    this.memory[param_values[0]] = 2
                }
            }
    
            this.running_line++
        }
    }

    // Keeps executing lines until there is a skip command (possibility of loop)
    async executeUntilNextRefresh() {
        if (this.running_line < this.script.length) {

            while (this.running_line < this.script.length) {
                await this.executeNextLine()

                if (this.script[this.running_line-1][0] === 3) {
                    this.logInfo("Script finished")

                    break
                }
            }
        }
    }
}