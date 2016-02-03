## Implemented 3D version of Q-Bert game using Webgl.
If you are not familiar with the game, you can play it online [here] (https://games.yahoo.com/game/qbert-flash.html).

### How to run this program

- For this program to work, you will need a lamp server to be hosted on local machine as I have used Xmlhttprequest for reading the files.
- Else use chrome with cross origin support. To do that:
  - On Ubuntu, sudo apt-get install chromium-browser. Then run "chromium-browser --disable-web-security" on terminal
  - On Mac, run "/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --disable-web-security"
  - On windows, goto command prompt and run "chrome.exe --disable-web-security"
- This Program will run only for vase and head Objects
- Keep this folder as it is.
- Just run the index.html.
  - For jquery, you will need to have internet so that jquery.js can be accessed.

### The Q-bert game is built with the following features:
1. The game board will be rendered with red faces of cubes.
2. The q-bert character and creatures are all cubes with distinguishing colors.
3. Q-bert character is PINK.
4. Creature 1 is of pure Black color and its movements are random down the level and fall off from the board to restart from the top.
5. Creature 2 is of pure Green color and its movements are random down the level and random up the level.
6. Creature 3 is of pure White color and its movements are sideways and will go left and right at board level 4.
7. Creature 4 is of Cyan color and its movements are sideways left and will fall of the board to start again. It will only be shown at level 2.
8. Discs are made up of squares and are dark green in color.
9. There are 2 levels. In 2nd level each square needs to be touched twice to win.
10. Level Transitions are nicely shown with change of gameboard cubes colors.
11. Scoring is also done where each right hop is +50 and disc rides are +100.
12. Multiple Lives are also included.
13. Sounds are enabled for disc rides, q-bert hops and level transition and game overs. For sound, sound.js library has been used.

Extra Credits:-
1. There are 2 levels. In 2nd level each square needs to be touched twice to win.
2. Level Transitions are nicely shown with change of gameboard cubes colors.
3. Scoring is also done where each right hop is +50 and disc rides are +100.
4. Multiple Lives are also included.
5. Sounds are enabled for disc rides, q-bert hops and level transition and game overs. For sound, sound.js library has been used.

If the program is slow, please comment out the line number 615 to stop the windows animation frame. The program will render and can be played with normal functionalities.

VIDEO LINK: https://drive.google.com/file/d/0B6L_ShRNMys7b3hXWjlva2ZyeVU/view?usp=sharing
