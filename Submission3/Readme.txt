For this program to work, we will need a jquery to run Ajax calls.
I have included the obj files for which this code is tested with (vase and head)

Just run the index.html?hierarchy=h1

I have used jquery to read the url string of  (index.html?hierarchy=h1)
Hierarchy file name is h1 which is in obj folder.
Here please only specify the hierarchy=h1. Don't include the folder name.
For jquery, you will need to have internet so that jquery.js can be accessed.

For the texture, it will first be rendered with blue pixels.

- My code is rendering single object with texture, lighting, and transformations of viewport.
- My code is rendering multiple object using hierarchy.
- My code is producing green light with 1 fixed texture.
- Works all the bounding box, and displays fps.
- Frustum culling is getting enabled with 'f' key on demand.

Extra credits:
window.txt is included in obj folder. And it supports arbitrarly size interface windows.
