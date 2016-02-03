## Implemented basic object hierarchies and frustum culling using Webgl.

### How to run this program

- For this program to work, you will need a lamp server to be hosted on local machine as I have used Xmlhttprequest for reading the files.
- Else use chrome with cross origin support. To do that:
  - On Ubuntu, sudo apt-get install chromium-browser. Then run "chromium-browser --disable-web-security" on terminal
  - On Mac, run "/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --disable-web-security"
  - On windows, goto command prompt and run "chrome.exe --disable-web-security"
- This Program will run only for vase and head Objects
- Keep this folder as it is.
- Just run the index.html with the url string of  (index.html?hierarchy=h1)
  - If you want to use different hieracrchy just edit the h1 file
  - Hierarchy file name is h1 which is in obj folder.
  - Here please only specify the hierarchy=h1. Don't include the folder name.
  - For jquery, you will need to have internet so that jquery.js can be accessed.
  - To display texture, it will first be rendered with blue pixels. Please press any keyboard input to display the included textures.
  - I have included the obj files for which this code is tested with (vase and head)

### Features of this program
- Rendered several models at once, arranged in an object hierarchy. Structure of Hierarchy file is:
  - Load a hierarchy file with multiple records having the following format:
  ```
  <filename.obj>       // obj file for the node, if any. NOOBJ if no file.
  <transform>          // node transform, 16 floats. IDENTITY if identity transform.
  <num children>     // the number of children for the node. 0 if no children.
  <blank line>         // white space separates each node.
   ```
- Transformations performed using (vertex) shaders. User can move the view as follows:
  - Use "z" and "Z" to move into / out of the view (translate the eye in view Z)
  - Use "x" and "X" to slide the view left and right (translate the eye in view X)
  - Use "y" and "Y" to slide the view up and down (translate the eye in view Y)
  - Use "up" and "down" to rotate the view up and down (rotate lookat around view X)
  - Use "left" and "right" to rotate the view left and right (rotate lookat around view Y)
- Added bounding boxes to each node in your hierarchy, display them on demand.
  - When the user presses "b" or "B", the Bounding boxes will appear. When the user presses "b" or "B" a second time, the boxes disappear.
  - When bounding box wireframes are displayed, pressing the "space bar" shows only the box around the hierarchy root. Each time the user presses the "space bar" 	again, the box moves to the next node in the hierarchy file
- Rendered the current frame rate and time in a heads up display.
- Used view-frustum culling to accelerate your rendering, turn it off on demand.
  - Use "f" or "F" to turn frustum culling on and off.
- window.txt is included in obj folder. And it supports arbitrarly size interface windows.
- Objects are produced in green light with 1 fixed texture.
- Multiple objects are being rendered using hierarchy.
