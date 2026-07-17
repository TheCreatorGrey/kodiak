Kodiak is a file format designed for large and explorable models, such as video game maps, buildings and other environments.
The format is designed with a balance between simplicity and file size in mind. This is to make it as portable as possible,
and to hopefully allow software that can load, view, and edit the format to be written for various systems and archetectures,
and in different programming languages, low and high level. The design encourages the use of primitives and imported models to
contruct environments instead of editing geometry, similar to Roblox Studio. It also includes its own scripting language for
automation and basic interactivity of the models.

This project (Kodiak Editor) is so far the only software that can read and edit my format. I am developing the format and its 
editor alongside eachother, and both are works in progress. 

Kodiak was originally written in Python, and was meant to be a level editor built on Ursina, which is a wrapper of Panda3D meant 
to make usage of the engine simpler. To continue the trend of bear names, this is where the name "Kodiak" came from. While the 
original editor was replaced with this one, which is written almost entirely in JavaScript, I have decided to keep the name.