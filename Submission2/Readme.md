## Implemented basic Transforms, lighting, and texturing with Rasterization using Webgl.

### How to run this program

- For this program to work, you will need a lamp server to be hosted on local machine as I have used Xmlhttprequest for reading the files.
- Else use chrome with cross origin support. To do that:
  - On Ubuntu, sudo apt-get install chromium-browser. Then run "chromium-browser --disable-web-security" on terminal
  - On Mac, run "/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --disable-web-security"
  - On windows, goto command prompt and run "chrome.exe --disable-web-security"
- This Program will run only for vase and head Objects
- Keep this folder as it is.
- Just run the index.html with the url string of  (index.html?objfilepath=objfilepath)
  - Specify the objfilepath=vase or head
  - To display texture, it will first be rendered with blue pixels. Please press any keyboard input to display the included textures.
  - I have included the obj files for which this code is tested with (vase and head)

### Features of this program
- Using ray casting, rendered white triangles.
- Using ray casting, rendered lit triangles with Blinn-Phong local illumincation method.
- Rendered lit triangles blended with custom texture
- Basic keyboard operations like Scaling, Rotation and Translation. User can transform the rendered object as follows:
  - Use "z" to zoom-in/scale-up the object
  - Use "x" to zoom-out/scale-down the object
  - Use "up-arrow" to move the object in +Y
  - Use "down-arrow" to move the object in -Y
  - Use "right-arrow" to move the object in +X
  - Use "left-arrow" to move the object in -X
  - Use "[" to move the object in +Z
  - Use "]" to move the object in -Z
  - Use "q" to rotate the view in clockwise direction
  - Use "w" to rotate the view in anti-clockwise direction
