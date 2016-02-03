## Implemented basic ray casting using Webgl.

### How to run this program

- For this program to work, you will need a lamp server to be hosted on local machine as I have used Xmlhttprequest for reading the files.
- Else use chrome with cross origin support. To do that:
  - On Ubuntu, sudo apt-get install chromium-browser. Then run "chromium-browser --disable-web-security" on terminal
  - On Mac, run "/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --disable-web-security"
  - On windows, goto command prompt and run "chrome.exe --disable-web-security"
- This Program will run only for Cube Obj
- Keep this folder as it is and run index.html

### Features of this program
- Using ray casting, rendered white triangles.
- Using ray casting, render lit triangles with Blinn-Phong local illumincation method.
