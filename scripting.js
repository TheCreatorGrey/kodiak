export class WorldScriptHandler {
    constructor(world) {
        this.world = world;
        this.scripts = {};
    }

    loadScript(object_id, raw) {
        // Init if not already
        if (! (object_id in this.scripts)) {
            this.scripts[object_id] = new ObjectScript(this.world, object_id);
        }

        this.scripts[object_id].loadFromText(raw);
    }

    async updateAll() {
        for (let s in this.scripts) {
            await this.scripts[s].executeUntilNextRefresh()
        }
    }
}

export class ObjectScript {
    constructor(world, object_id) {
        this.world = world;
        this.object_id = object_id;

        this.active = false;

        this.script = []; // The script in array form (compiled from string)
        this.running_line = 0;
        this.memory = new Array(256); // Memory for the script's variables / memory slots
        this.filled_memory_slots = 0; // How many memory slots are taken, starting from 0

        this.script_raw = ""; // Containins the original script in string form
        
        

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

            jump: {
                id:3,
                params:[
                    {   // Value
                        range:[-128, 127],
                        memory:1
                    }
                ]
            },

            jumpif: {
                id:4,
                params:[
                    {   // Value
                        range:[-128, 127],
                        memory:1
                    },

                    {   // Condition (0 or above)
                        range:[0, 1],
                        memory:1
                    }
                ]
            },

            scriptobj: { // Sets the slots value to the ID of the parent object
                id:5,
                params:[
                    {   // Memory slot number
                        range:[0, 255],
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

            settint: {
                id: 37,
                params:[
                    { // ID of object
                        range:[0, 255],
                        memory:1
                    },

                    { // r
                        range:[0, 255],
                        memory:1
                    },

                    { // g
                        range:[0, 255],
                        memory:1
                    },

                    { // b
                        range:[0, 255],
                        memory:1
                    }
                ]
            },

            getpos: {
                id: 60,
                params:[
                    { // ID of object
                        range:[0, 255],
                        memory:1
                    },

                    { // Mem slot for x
                        range:[0, 255],
                        memory:1
                    },

                    { // Mem slot for y
                        range:[0, 255],
                        memory:1
                    },

                    { // Mem slot for z
                        range:[0, 255],
                        memory:1
                    }
                ]
            },

            getscale: {
                id: 61,
                params:[
                    { // ID of object
                        range:[0, 255],
                        memory:1
                    },

                    { // Mem slot for x
                        range:[0, 255],
                        memory:1
                    },

                    { // Mem slot for y
                        range:[0, 255],
                        memory:1
                    },

                    { // Mem slot for z
                        range:[0, 255],
                        memory:1
                    }
                ]
            },

            getrot: {
                id: 62,
                params:[
                    { // ID of object
                        range:[0, 255],
                        memory:1
                    },

                    { // Mem slot for x
                        range:[0, 255],
                        memory:1
                    },

                    { // Mem slot for y
                        range:[0, 255],
                        memory:1
                    },

                    { // Mem slot for z
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

            invert: { // Sets above zero values to zero and zero or below values to 1
                id:132,
                params:[
                    {   // ID of memory slot
                        range:[0, 255],
                        memory:1
                    }
                ]
            },

            compare: { // Sets the value of the memory slot given to 1 if the value 1 is greater than value 2, or to 0 if not
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
            },

            match: { // Sets the value of the memory slot given to 1 if the value 1 is the same as value 2, or to 0 if they are different
                id:134,
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

            sin: {
                id:135,
                params:[
                    {   // ID of memory slot
                        range:[0, 255],
                        memory:1
                    },

                    {   // Value
                        range:[0, 255],
                        memory:1
                    }
                ]
            },

            cos: {
                id:136,
                params:[
                    {   // ID of memory slot
                        range:[0, 255],
                        memory:1
                    },

                    {   // Value
                        range:[0, 255],
                        memory:1
                    }
                ]
            },


            newmodel: { // Creates an empty model slot and sets the value of the memory slot given to the ID of the new model
                id: 200,
                params:[
                    { // Slot ID
                        range:[0, 255],
                        memory: 1
                    }
                ]
            },

            newtri: { // Adds a triangle to a mesh. 0 - 255 are the limits for each axis.
                id: 201,
                params:[
                    { // Mesh ID
                        range:[0, 255],
                        memory:1
                    },

                    { // Point 1 x value
                        range:[0, 255],
                        memory:1
                    },

                    { // Point 1 y value
                        range:[0, 255],
                        memory:1
                    },

                    { // Point 1 z value
                        range:[0, 255],
                        memory:1
                    },

                    { // Point 2 x value
                        range:[0, 255],
                        memory:1
                    },

                    { // Point 2 y value
                        range:[0, 255],
                        memory:1
                    },

                    { // Point 2 z value
                        range:[0, 255],
                        memory:1
                    },

                    { // Point 3 x value
                        range:[0, 255],
                        memory:1
                    },

                    { // Point 3 y value
                        range:[0, 255],
                        memory:1
                    },

                    { // Point 3 z value
                        range:[0, 255],
                        memory:1
                    }
                ]
            },

            vertloc: { // Sets the location of an existing triangle vertex
                id:202,
                params:{ // Mesh ID
                    range:[0, 255],
                    memory:1
                },
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
        this.log(`Error (line ${this.running_line}): ${text}`, "red")
        this.active = false;
    }

    logWarning(text) {
        this.log(`Warning (line ${this.running_line}): ${text}`, "yellow")
    }


    loadFromText(script) {
        this.active = true;

        this.script_raw = script;

        this.running_line = 0;
        this.script = [] ;

        // Names / aliases for memory slots. Temporary and not needed after loading
        let aliases = {};

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

                } else if (line_param === "@") {
                    // If a parameter is a single "@", it should be evaluated as the line number
                    line.push([0, this.script.length])
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
        if (this.active) {    
            if (this.running_line < this.script.length) {
                let line = this.script[this.running_line]
                console.log(this.script, this.running_line)
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
                    this.log(param_values[0], "log")
                }
    
                if (command === 2) { // write
                    this.memory[param_values[0]] = param_values[1]
                }
    
                if (command === 3) { // jump
                    this.running_line = param_values[0]
                }

                if (command === 4) { // jumpif
                    if (0 < param_values[1]) {
                        this.running_line = param_values[0]
                    }                    
                }

                if (command === 5) { // scriptobj
                    this.memory[param_values[0]] = this.object_id;           
                }
    
    
    
                if (command === 16) { // newobject
                    let object = await this.world.newObject()
                    this.memory[param_values[0]] = object.object_id
                }
                
    
                if (command === 32) { // move
                    let object = this.world.getObjectByID(param_values[0])

                    if (object) {
                        object.position.x = param_values[1]
                        object.position.y = param_values[2]
                        object.position.z = param_values[3]
                    } else {
                        this.logError(`Couldn't find object with ID ${param_values[0]}`)
                    }
                }
    
                if (command === 33) { // rotate
                    let object = this.world.getObjectByID(param_values[0])

                    if (object) {
                        object.rotation.x = param_values[1]
                        object.rotation.y = param_values[2]
                        object.rotation.z = param_values[3]
                    } else {
                        this.logError(`Couldn't find object with ID ${param_values[0]}`)
                    }                    
                }
    
                if (command === 34) { // scale
                    let object = this.world.getObjectByID(param_values[0])

                    if (object) {
                        object.scale.x = param_values[1]
                        object.scale.y = param_values[2]
                        object.scale.z = param_values[3]
                    } else {
                        this.logError(`Couldn't find object with ID ${param_values[0]}`)
                    }   
                }
    
                if (command === 35) { // setmodel
                    let object = this.world.getObjectByID(param_values[0])

                    if (object) {
                        await this.world.setModel(object.object_id, param_values[1])
                    } else {
                        this.logError(`Couldn't find object with ID ${param_values[0]}`)
                    }                    
                }
    
                if (command === 36) { // setmaterial
                    let object = this.world.getObjectByID(param_values[0])

                    if (object) {
                        await this.world.setMaterial(object.object_id, param_values[1])
                    } else {
                        this.logError(`Couldn't find object with ID ${param_values[0]}`)
                    }                    
                }

                if (command === 37) { // settint
                    let object = this.world.getObjectByID(param_values[0])

                    if (object) {
                        object.material.color.r = param_values[1];
                        object.material.color.g = param_values[2];
                        object.material.color.b = param_values[3];
                    } else {
                        this.logError(`Couldn't find object with ID ${param_values[0]}`)
                    }                    
                }
    
    
                if (command === 60) { // getpos
                    let object = this.world.getObjectByID(param_values[0])

                    if (object) {
                        this.memory[param_values[1]] = object.position.x;
                        this.memory[param_values[2]] = object.position.y;
                        this.memory[param_values[3]] = object.position.z;
                    } else {
                        this.logError(`Couldn't find object with ID ${param_values[0]}`)
                    }
                }

                if (command === 61) { // getscale
                    let object = this.world.getObjectByID(param_values[0])

                    if (object) {
                        this.memory[param_values[1]] = object.scale.x;
                        this.memory[param_values[2]] = object.scale.y;
                        this.memory[param_values[3]] = object.scale.z;
                    } else {
                        this.logError(`Couldn't find object with ID ${param_values[0]}`)
                    }
                }

                if (command === 62) { // getrot
                    let object = this.world.getObjectByID(param_values[0])

                    if (object) {
                        this.memory[param_values[1]] = object.rotation.x;
                        this.memory[param_values[2]] = object.rotation.y;
                        this.memory[param_values[3]] = object.rotation.z;
                    } else {
                        this.logError(`Couldn't find object with ID ${param_values[0]}`)
                    }
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
                    if (param_values[1] <= 0) {
                        this.memory[param_values[0]] = 1
                    } else {
                        this.memory[param_values[0]] = 0
                    }
                }
    
                if (command === 133) { // compare
                    if (param_values[2] < param_values[1]) {
                        this.memory[param_values[0]] = 1
                    } else {
                        this.memory[param_values[0]] = 0
                    }
                }

                if (command === 134) { // match
                    if (param_values[1] === param_values[2]) {
                        this.memory[param_values[0]] = 1
                    } else {
                        this.memory[param_values[0]] = 0
                    }
                }
    
                if (command === 135) { // sin                
                    this.memory[param_values[0]] = Math.sin(param_values[1])
                }
    
                if (command === 136) { // sin                
                    this.memory[param_values[0]] = Math.cos(param_values[1])
                }
    
                if (command === 200) { // newtri
                    let model = this.world.models[param_values[0]]
    
                    model.tris.push(
                        [
                            [[(param_values[1]/255)-0.5, (param_values[2]/255)-0.5, (param_values[3]/255)-0.5], [0, 1, 0], [0, 0]],
                            [[(param_values[4]/255)-0.5, (param_values[5]/255)-0.5, (param_values[6]/255)-0.5], [0, 1, 0], [0, 0]],
                            [[(param_values[7]/255)-0.5, (param_values[8]/255)-0.5, (param_values[9]/255)-0.5], [0, 1, 0], [0, 0]]
                        ]
                    )
    
                    console.log(model)
                }
        
                this.running_line++
            }
        }
    }

    // Keeps executing lines until there is a skip command (possibility of loop)
    async executeUntilNextRefresh() {
        if (this.active) {
            if (this.running_line < this.script.length) {
                while (this.running_line < this.script.length) {
                    await this.executeNextLine()
    
                    if (this.script[this.running_line-1][0] === 0) {
                        break
                    }
                }
            } else {
                this.logInfo("Script finished");
                this.active = false;
            }
        }
    }
}