var canvas;
var gl;
var program;
var vertexbuffer;
// var all_obj = [];
// var all_mtl = [];

// var nMatrix = mat3.create();
// var g_modelMatrix = [];
// var buffer, buffer_v, buffer_vt, buffer_vn, buffer_bound;
// var i_x, tri_nos;
// var vt = [], points = [], v_index = [], vn = [];
var mtl;
var ctx, c;
/*
 * var bound_box = []; var all_index_count = []; var all_index = []; var
 * all_vertices = []; var bounding = []; var objjs = {}; var arr1 = []; var t0 =
 * performance.now(); var g_count = 0; var texture; var combine = []; var Xmin =
 * 0, Xmax = 0, Ymin = 0, Ymax = 0, Zmin = 0, Zmax = 0;
 * 
 * var url; var hier = [];
 */
function getShader(gl, id) {
	var shaderScript = document.getElementById(id);
	if (!shaderScript)
		return null;

	var str = "";
	var k = shaderScript.firstChild;
	while (k) {
		if (k.nodeType == 3) {
			str += k.textContent;
		}
		k = k.nextSibling;
	}

	var shader;
	if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else {
		return null;
	}

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}

/**
 * Load and compile GLSL shaders.
 */
var fragmentShader;
var vertexShader;
function initShaders() {
	fragmentShader = getShader(gl, "shader-fs");
	vertexShader = getShader(gl, "shader-vs");
	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Could not initialise shaders");
	}
	gl.useProgram(shaderProgram);
	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram,
			"aVertexPosition");
	shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram,
			"aVertexColor");
	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram,
			"uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram,
			"uMVMatrix");
	shaderProgram.v_my_bool = gl.getUniformLocation(shaderProgram, "v_my_bool");
	shaderProgram.vcolor1 = gl.getUniformLocation(shaderProgram, "vcolor1");
}
var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();
function mvPushMatrix() {
	var copy = mat4.create();
	mat4.set(mvMatrix, copy);
	mvMatrixStack.push(copy);
}
function mvPopMatrix() {
	if (mvMatrixStack.length == 0) {
		throw "Invalid popMatrix!";
	}
	mvMatrix = mvMatrixStack.pop();
}
function setMatrixUniforms() {
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}
var cubeVertexPositionBuffer;
var cubeVertexColorBuffer;
var cubeVertexIndexBuffer;
var squareVertexPositionBuffer;
var squareVertexIndexBuffer;

all_colors = [ [ [ 0.5, 0.0, 0.5, 1.0 ], // Front face
[ 0.5, 0.0, 0.5, 1.0 ], // Back face
[ 1.0, 0.0, 0.0, 1.0 ], // Top face
[ 1.0, 0.0, 0.0, 1.0 ], // Bottom face
[ 0.5, 0.5, 0.5, 1.0 ], // Right face
[ 0.5, 0.5, 0.5, 1.0 ] // Left face
], [ [ 0.5, 0.5, 0.0, 1.0 ], // Front face
[ 0.5, 0.5, 0.0, 1.0 ], // Back face
[ 0.0, 0.0, 1.0, 1.0 ], // Top face
[ 0.0, 0.0, 1.0, 1.0 ], // Bottom face
[ 0.5, 0.0, 0.5, 1.0 ], // Right face
[ 0.5, 0.0, 0.5, 1.0 ] // Left face
] ];
var level = 0;
/**
 * Program initialization.
 */
function initcubes(x) {

	// create and compile our GLSL program from the shaders
	initShaders();

	// create a buffer and put a single clipspace triangle in it
	cubeVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
	vertices = [
	// Front face
	-1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,

	// Back face
	-1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,

	// Top face
	-1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,

	// Bottom face
	-1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,

	// Right face
	1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,

	// Left face
	-1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0 ];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	cubeVertexPositionBuffer.itemSize = 3;
	cubeVertexPositionBuffer.numItems = 24;
	cubeVertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
	colors = all_colors[x];
	var unpackedColors = [];
	for ( var i in colors) {
		var color = colors[i];
		for (var j = 0; j < 4; j++) {
			unpackedColors = unpackedColors.concat(color);
		}
	}
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedColors),
			gl.STATIC_DRAW);
	cubeVertexColorBuffer.itemSize = 4;
	cubeVertexColorBuffer.numItems = 24;

	cubeVertexIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
	cubeVertexIndices = [ 0, 1, 2, 0, 2, 3, // Front face
	4, 5, 6, 4, 6, 7, // Back face
	8, 9, 10, 8, 10, 11, // Top face
	12, 13, 14, 12, 14, 15, // Bottom face
	16, 17, 18, 16, 18, 19, // Right face
	20, 21, 22, 20, 22, 23 // Left face
	];
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices),
			gl.STATIC_DRAW);
	cubeVertexIndexBuffer.itemSize = 1;
	cubeVertexIndexBuffer.numItems = 36;
}

function init() {

	// create and compile our GLSL program from the shaders
	initShaders();

	// create a buffer and put a single clipspace triangle in it
	cubeVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
	vertices = [
	// Front face
	-1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,

	// Back face
	-1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,

	// Top face
	-1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,

	// Bottom face
	-1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,

	// Right face
	1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,

	// Left face
	-1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0 ];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	cubeVertexPositionBuffer.itemSize = 3;
	cubeVertexPositionBuffer.numItems = 24;

	cubeVertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
	colors = all_colors[0];
	var unpackedColors = [];
	for ( var i in colors) {
		var color = colors[i];
		for (var j = 0; j < 4; j++) {
			unpackedColors = unpackedColors.concat(color);
		}
	}
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedColors),
			gl.STATIC_DRAW);
	cubeVertexColorBuffer.itemSize = 4;
	cubeVertexColorBuffer.numItems = 24;

	cubeVertexIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
	cubeVertexIndices = [ 0, 1, 2, 0, 2, 3, // Front face
	4, 5, 6, 4, 6, 7, // Back face
	8, 9, 10, 8, 10, 11, // Top face
	12, 13, 14, 12, 14, 15, // Bottom face
	16, 17, 18, 16, 18, 19, // Right face
	20, 21, 22, 20, 22, 23 // Left face
	];
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices),
			gl.STATIC_DRAW);
	cubeVertexIndexBuffer.itemSize = 1;
	cubeVertexIndexBuffer.numItems = 36;
}

function initsquares() {
	initShaders();
	squareVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
	vertices1 = [
	// Top face
	-1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0 ];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices1), gl.STATIC_DRAW);
	squareVertexPositionBuffer.itemSize = 3;
	squareVertexPositionBuffer.numItems = 4;

	squareVertexIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareVertexIndexBuffer);
	squareVertexIndices = [ 0, 1, 2, 0, 2, 3 // Top face
	];
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
			new Uint16Array(squareVertexIndices), gl.STATIC_DRAW);
	squareVertexIndexBuffer.itemSize = 1;
	squareVertexIndexBuffer.numItems = 6;

}

var x = 0, y = 0, z = 0;
ax = 1, ay = 1, az = 1;
function render(transforms, i, c1, c2, c3) {

	if (i == "cubes") {
		mat4.identity(mvMatrix);
		mat4.ortho(-8.0, 8.0, -8.0, 8.0, 0.1, 100, pMatrix);
		mat4.translate(mvMatrix, [ 0.0, 3.5, -5.0 ]);
		mat4.rotate(mvMatrix, Math.PI / 4, [ 1, 0, 0 ]);
		mat4.rotate(mvMatrix, Math.PI / 4, [ 0, 1, 0 ]);
		mat4.scale(mvMatrix, [ 0.5, 0.5, 0.5 ]);
		mvPushMatrix();
		mat4.translate(mvMatrix, transforms);

		gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
		gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
		gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
				cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
				cubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
		setMatrixUniforms();
		gl.uniform1i(shaderProgram.v_my_bool, 0);
		gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems,
				gl.UNSIGNED_SHORT, 0);
		gl.disableVertexAttribArray(shaderProgram.vertexPositionAttribute);
		gl.disableVertexAttribArray(shaderProgram.vertexColorAttribute);
		mvPopMatrix();
	} else if (i == "qbert") {

		// var tc=animate_transform(transforms);

		mat4.identity(mvMatrix);
		mat4.ortho(-8.0, 8.0, -8.0, 8.0, 0.1, 100, pMatrix);
		mat4.translate(mvMatrix, [ 0.0, 4.0, -1.0 ]);
		mat4.rotate(mvMatrix, Math.PI / 4, [ 1, 0, 0 ]);
		mat4.rotate(mvMatrix, Math.PI / 4, [ 0, 1, 0 ]);
		mat4.scale(mvMatrix, [ 0.25, 0.25, 0.25 ]);

		var waste = [];
		for ( var x in transforms) {
			waste[x] = 2 * transforms[x];
		}
		mat4.translate(mvMatrix, waste);
		// mvPushMatrix();

		gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
		// gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
		gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
				cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.uniform1i(shaderProgram.v_my_bool, 1);
		gl.uniform4f(shaderProgram.vcolor1, c1, c2, c3, 1.0);
		setMatrixUniforms();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
		gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems,
				gl.UNSIGNED_SHORT, 0);

		gl.disableVertexAttribArray(shaderProgram.vertexPositionAttribute);
		// gl.disableVertexAttribArray(shaderProgram.vertexColorAttribute);
	}

	else if (i == "square") {
		mat4.identity(mvMatrix);
		mat4.ortho(-8.0, 8.0, -8.0, 8.0, 0.1, 100, pMatrix);
		mat4.translate(mvMatrix, [ 0.0, 3.5001, -5.0 ]);
		mat4.rotate(mvMatrix, Math.PI / 4, [ 1, 0, 0 ]);
		mat4.rotate(mvMatrix, Math.PI / 4, [ 0, 1, 0 ]);
		mat4.scale(mvMatrix, [ 0.5, 0.5, 0.5 ]);

		mat4.translate(mvMatrix, transforms);
		// mvPushMatrix();

		gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
		// gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
		gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
				squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.uniform1i(shaderProgram.v_my_bool, 2);
		gl.uniform4f(shaderProgram.vcolor1, c1, c2, c3, 1.0);
		setMatrixUniforms();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareVertexIndexBuffer);
		gl.drawElements(gl.TRIANGLES, squareVertexIndexBuffer.numItems,
				gl.UNSIGNED_SHORT, 0);

		gl.disableVertexAttribArray(shaderProgram.vertexPositionAttribute);
		// gl.disableVertexAttribArray(shaderProgram.vertexColorAttribute);
	}
	// mvPopMatrix();

}

function randomIntFromInterval(min, max) {

	return Math.floor(Math.random() * (max - min + 1) + min);
}

var track = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0 ];

/**
 * Program entry point.
 */
function main() {

	// var query = window.location.search.substring(1);
	// var vars = query.split("&");
	// parseWindow();
	// for (var i = 0; i < vars.length; i++) {
	// var pair = vars[i].split("=");
	// if (pair[0] == 'objurlpath')
	// rendering(parseObj("vase"));

	// }
	// get a WebGL context
	canvas = document.getElementById("canvas");
	loadSound1();
	// 3D example
	gl = canvas.getContext("experimental-webgl");
	gl.viewportWidth = canvas.width;
	gl.viewportHeight = canvas.height;
	gl.viewport(0.0, 0.0, gl.viewportWidth, gl.viewportHeight);

	// console.log(randomIntFromInterval(1,10));
	// set the GL clear color
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	// load shaders and bind arrays
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	document.getElementById("level").innerHTML = "Current Level: "
			+ (level + 1);

	var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

	oscillator = audioCtx.createOscillator();
	var gainNode = audioCtx.createGain();

	oscillator.connect(gainNode);
	gainNode.connect(audioCtx.destination);
	lastTime = new Date().getTime();
	elapsed = 0;
	if (val == 20)
		tick();
}
var f = 0;
function ani() {

	if (f == 0)
		f = 1;
	else if (f == 1)
		f = 0;
}

var lastTime = new Date().getTime();
var elapsed = 0;
function animate() {
	var timeNow = new Date().getTime();
	if (moved == true)
		elapsed = timeNow - lastTime;
}

var prevtime = new Date().getTime();
var one_sec = 0;
function animate1() {

	var timeNow = new Date().getTime();
	one_sec = timeNow - prevtime;
	if (one_sec >= 1000) {
		prevtime = timeNow;
	}
}
var val = 20;
function level_animation() {

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	val--;
	pausecomp(50);
	initcubes(f);
	for (var i = 0; i < 28; i++) {
		render(transforms_cube[i], "cubes", 0, 0, 0);
	}
	ani();

	if (val > 0)
		window.requestAnimationFrame(level_animation);
	else {
		val = 20;
		if (level == 0) {
			level++;

			main();
		} else if (level == 1) {
			document.getElementById("test").innerHTML = "GAMEWIN";
		}
	}
}

function nextlevel() {
	moved = true;
	mov1 = -1;
	count1 = 0;
	mov2 = -1;
	count2 = 0;
	mov3 = -1;
	count3 = 0;
	count = 0;
	mov = 0;
	mov4 = 0;
	count4 = 0;
	bool_c1 = false;
	bool_c2 = false;
	bool_c3 = false;
	bool_c4 = false;
	overall = false;
	one_sec = 0;
	elapsed = 0;
	lastTime = new Date().getTime();
	prevtime = new Date().getTime();
	track = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0 ];
	left = true;
	up = true;
	disc = false;
	moved = false;
	score += 50;
	level_animation();
}
var a = 1;
var overall = false;
var revers = false;
var prev1 = 0, prev2 = 0, prev3 = 0, prev = 0;
function tick() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	document.getElementById("lives").innerHTML = "Lives: " + lives;
	document.getElementById("scores").innerHTML = "Scores: " + score;
	document.getElementById("test").innerHTML = "";// startover(); }
	drawboard();
	qbert();
	square();

	if (left == true) {

		disc1();
	}
	if (up == true) {

		disc2();
	}
	if (level == 1) {
		creature4();
	}
	creature1();
	creature2();
	creature3();
	if (one_sec > 1000) {
		if (elapsed >= 2000 && bool_c1 == false) {
			mov1 = 0;
			prev1 = mov1;
			creature1();
			count1 = 1 * count1 + 1;
			mov1 = randomIntFromInterval(mov1 + count1, mov1 + 1 + count1);
			bool_c1 = true;
		}
		if (elapsed >= 4000 && bool_c2 == false) {
			mov2 = 0;
			prev2 = mov2;
			creature2();
			count2 = 1 * count2 + 1;
			mov2 = randomIntFromInterval(mov2 + count2, mov2 + count2);
			bool_c2 = true;
		}
		if (elapsed >= 6000 && bool_c3 == false) {
			mov3 = 0;
			prev3 = mov3;
			creature3();
			count3 = 1 * count3 + 1;
			mov3 = randomIntFromInterval(mov3 + 1 + count3, mov3 + 1 + count3);
			bool_c3 = true;
		}
		if (elapsed >= 8000 && bool_c4 == false && level == 1) {
			mov4 = 0;
			prev4 = mov4;
			creature4();
			count4 = 1 * count4 + 1;
			mov4 = randomIntFromInterval(mov4 + 1 + count4, mov4 + 1 + count4);
			bool_c4 = true;
		}
		if (bool_c1 == true) {
			if (mov1 >= transforms_cube.length) {
				mov1 = 0;
				count1 = 0;
			}
			prev1 = mov1;
			creature1();
			count1 = 1 * count1 + 1;
			mov1 = randomIntFromInterval(mov1 + count1, mov1 + 1 + count1);
		}
		if (bool_c2 == true) {
			prev2 = mov2;
			if (count2 == 6)
				revers = true;
			if (count2 == 0)
				revers = false;
			if (revers == true) {
				creature2();
				count2 = 1 * count2 - 1;
				mov2 = randomIntFromInterval(mov2 - 2 - count2, mov2 - count2);

			}
			if (revers == false) {
				creature2();
				count2 = 1 * count2 + 1;
				mov2 = randomIntFromInterval(mov2 + count2, mov2 + 1 + count2);
			}
		}
		if (bool_c3 == true) {
			prev3 = mov3;
			if (count3 == 3) {
				if (mov3 == 6)
					a = 1;
				else if (mov3 == 9)
					a = -1;
				mov3 += a;
				creature3();
			} else {
				creature3();
				count3 = 1 * count3 + 1;
				mov3 = randomIntFromInterval(mov3 + 1 + count3, mov3 + 1
						+ count3);
			}
		}
		if (bool_c4 == true && level == 1) {
			prev4 = mov4;
			if (mov4 >= transforms_cube.length) {
				mov4 = 0;
				count4 = 0;
			}
			creature4();
			count4 = 1 * count4 + 1;
			mov4 = randomIntFromInterval(mov4 + count4, mov4 + count4);
		}
	}
	animate();
	animate1();

	if (lives > 0 && gamewin() == false) {
		window.requestAnimationFrame(tick);
	}

}
color_squares = [ [ 1.0, 1.0, 0.0 ], [ 0.0, 0.0, 1.0 ] ]
var bool_c1 = false;
var bool_c2 = false;
var bool_c3 = false;
var bool_c4 = false;

function drawboard() {
	init();
	for (var i = 0; i < 28; i++) {
		render(transforms_cube[i], "cubes", 0, 0, 0);
	}

}
function square() {

	if (lives > 0) {
		for (var i = 0; i < 28; i++) {
			if (track[i] == 1) {
				initsquares();
				render(transforms_cube[i], "square", color_squares[0][0],
						color_squares[0][1], color_squares[0][2]);
			}
			if (track[i] == 2) {
				initsquares();
				render(transforms_cube[i], "square", color_squares[1][0],
						color_squares[1][1], color_squares[1][2]);
			}
		}

	}
}
function qbert() {
	if (mov == mov1 || mov == mov2 || mov == mov3 || mov == mov4) {
		lives--;
		document.getElementById("lives").innerHTML = "Lives: " + lives;// startover();
		// }
		bool_c1 = false;
		bool_c2 = false;
		bool_c3 = false;
		bool_c3 = false;
		mov1 = -1;
		count1 = 0;
		mov2 = -1;
		count2 = 0;
		mov3 = -1;
		count3 = 0;
		mov4 = -1;
		count4 = 0;
		elapsed = 0;
	}
	if (lives > 0) {
		x = 2 * transforms_cube[mov][0];
		y = 2 * transforms_cube[mov][1];
		z = 2 * transforms_cube[mov][2];
		if (x < 0)
			ax = -1;
		else if (x > 0)
			ax = 1;
		if (y < 0)
			ay = -1;
		else if (y > 0)
			ay = 1;
		if (z < 0)
			az = -1;
		else if (z > 0)
			az = 1;
		init();
		render(transforms_cube[mov], "qbert", 1.0, 0, 1.0);
	} else {
		document.getElementById("lives").innerHTML = "Lives: " + lives;// startover();
		// }
		document.getElementById("test").innerHTML = "Gameover ";
		// startover();
	}
}
var transforms_cube = [ [ 0, 0, 0 ],// 11
[ -2, -2, 0 ],// 21
[ 0, -2, 2 ],// 22
[ -4, -4, 0 ],// 31
[ -2, -4, 2 ],// 32
[ 0, -4, 4 ],// 33
[ -6, -6, 0 ],// 41
[ -4, -6, 2 ],// 42
[ -2, -6, 4 ],// 43
[ 0, -6, 6 ],// 44
[ -8, -8, 0 ],// 51
[ -6, -8, 2 ],// 52
[ -4, -8, 4 ],// 53
[ -2, -8, 6 ],// 54
[ 0, -8, 8 ],// 55
[ -10, -10, 0 ],// 61
[ -8, -10, 2 ],// 62
[ -6, -10, 4 ],// 63
[ -4, -10, 6 ],// 64
[ -2, -10, 8 ],// 65
[ 0, -10, 10 ],// 66
[ -12, -12, 0 ], [ -10, -12, 2 ], [ -8, -12, 4 ], [ -6, -12, 6 ],
		[ -4, -12, 8 ], [ -2, -12, 10 ], [ 0, -12, 12 ] ];

var t = 1;
function animate_transform(l, r) {
	var a = [];
	if ((l <= 27) && (r <= 27)) {

		console.log(l);
		console.log(r);
		var x = 0, y = 0, z = 0;
		// x moved right
		if (transforms_cube[l][0] < transforms_cube[r][0])
			x = 1;
		else if (transforms_cube[l][0] > transforms_cube[r][0])
			x = -1;
		else if (transforms_cube[l][0] == transforms_cube[r][0])
			x = 0;
		// y moved up
		if (transforms_cube[l][1] < transforms_cube[r][1])
			y += 1;
		else if (transforms_cube[l][1] > transforms_cube[r][1])
			y = -1;
		else if (transforms_cube[l][1] == transforms_cube[r][1])
			y = 0;
		// z moved right
		if (transforms_cube[l][2] < transforms_cube[r][2])
			z = 1;
		else if (transforms_cube[l][2] > transforms_cube[r][2])
			z = -1;
		else if (transforms_cube[l][2] == transforms_cube[r][2])
			z = 0;
		a = [ transforms_cube[l][0] + x, transforms_cube[l][1] + y,
				transforms_cube[l][2] + z ];
	}
	return a;

}

function creature1() {
	if (mov1 != -1) {

		init();
		render(transforms_cube[mov1], "qbert", 0.0, 0, 0);

	}

}
function creature2() {
	if (mov2 != -1) {

		init();
		render(transforms_cube[mov2], "qbert", 0, 1.0, 0.0);

	}

}
function creature3() {
	if (mov3 != -1) {

		init();
		render(transforms_cube[mov3], "qbert", 1.0, 1.0, 1.0);

	}

}
function creature4() {
	if (mov4 != -1) {
		x = 2 * transforms_cube[mov][0];
		y = 2 * transforms_cube[mov][1];
		z = 2 * transforms_cube[mov][2];
		if (x < 0)
			ax = -1;
		else if (x > 0)
			ax = 1;
		if (y < 0)
			ay = -1;
		else if (y > 0)
			ay = 1;
		if (z < 0)
			az = -1;
		else if (z > 0)
			az = 1;
		init();
		render(transforms_cube[mov4], "qbert", 0.0, 1, 1);
	}

}
function disc1() {
	initsquares();
	render([ -8, -8, -3 ], "square", 0.2, 0.8, 0.3);
}
function disc2() {
	initsquares();
	render([ 3, -8, 8 ], "square", 0.2, 0.8, 0.3);
}
var disc = false;

function pausecomp(millis) {
	var date = new Date();
	var curDate = null;
	do {
		curDate = new Date();
	} while (curDate - date < millis);
}

var mov1 = -1;
var count1 = 0;
var mov2 = -1;
var count2 = 0;
var mov3 = -1;
var count3 = 0;
var mov4 = -1;
var count4 = 0;
var count = 0;
var mov = 0;
var lives = 4;
var score = 0;
var left = true;
var up = true;
function checkMove(pos, level, keys) {
	switch (keys) {
	case 38:// up
		if (level == 0)
			return false;
		else if (pos == 14) {
			if (up == true) {
				up = false;
				disc = true;
				score += 100;
				return true;
			} else
				return false
		} else if (pos == calpos(level + 1)) {
			return false;
		}
		break;

	case 40:// down

		if (level == 6)
			return false;
		break;
	case 37:// left

		if (level == 0)
			return false;

		else if (pos == 10) {
			if (left == true) {
				left = false;
				disc = true;
				score += 100;
				return true;
			} else
				return false
		} else if (pos == (calpos(level) + 1)) {
			return false;
		}
		break;
	case 39:// right

		if (level == 6)
			return false;
		break;
	default:
		return true;
	}
	return true;
}

function calpos(level) {
	var waste = 0;
	for (var c = level; c > 1; c--) {
		waste = waste + c;
	}
	return waste;
}

function gamewin() {
	for (var i = 0; i < 28; i++) {
		if (track[i] == 0 && level == 0)
			return false;
		if ((track[i] == 0 || track[i] == 1) && level == 1)
			return false;
	}
	return true;
}
var moved = false;
window.onload = main;
var position = 0;
var keys = {};
$(document).keydown(function(e) {
	// e.preventDefault();
	keys[e.which] = true;

	// up
	if (e.which == 38) {
		if (checkMove(mov, count, e.which)) {
			playSound1();
			if (disc == false) {
				count = 1 * count - 1;
				mov = mov - count - 1;
			} else if (disc == true) {
				playSound2();
				mov = 0;
				count = 0;
				disc = false;
			}
			if (moved == false)
				moved = true;
			if (track[mov] == 0 && level == 0) {
				track[mov] = 1;
				score += 50;
			}
			if ((track[mov] == 0 || track[mov] == 1) && level == 1) {
				track[mov] += 1;
				score += 50;
			}
		} else {
			mov = 0;
			count = 0;
			if (lives == 0) {
				document.getElementById("test").innerHTML = "Gameover ";
			}// startover(); }
			else {
				lives--;
				document.getElementById("lives").innerHTML = "Lives: " + lives;
			}
		}
	}
	// down
	if (e.which == 40) {
		if (checkMove(mov, count, e.which)) {
			playSound1();
			count = 1 * count + 1;
			mov = mov + count;
			if (moved == false)
				moved = true;
			if (track[mov] == 0 && level == 0) {
				track[mov] = 1;
				score += 50;
			}
			if ((track[mov] == 0 || track[mov] == 1) && level == 1) {
				track[mov] += 1;
				score += 50;
			}
		} else {
			mov = 0;
			count = 0;
			if (lives == 0) {
				document.getElementById("test").innerHTML = "Gameover ";
			}// startover(); }
			else {
				lives--;
				document.getElementById("lives").innerHTML = "Lives: " + lives;
			}
		}
	}
	// left
	if (e.which == 37) {
		if (checkMove(mov, count, e.which)) {
			playSound1();
			if (disc == false) {
				count = 1 * count - 1;
				mov = mov - 2 - count;
			} else if (disc == true) {
				playSound2();
				mov = 0;
				count = 0;
				disc = false;
			}
			if (moved == false)
				moved = true;
			if (track[mov] == 0 && level == 0) {
				track[mov] = 1;
				score += 50;
			}
			if ((track[mov] == 0 || track[mov] == 1) && level == 1) {
				track[mov] += 1;
				score += 50;
			}
		} else {
			mov = 0;
			count = 0;
			if (lives == 0) {
				document.getElementById("test").innerHTML = "Gameover ";
			}// startover(); }
			else {
				lives--;
				document.getElementById("lives").innerHTML = "Lives: " + lives;
			}
		}
	}
	// right
	if (e.which == 39) {
		if (checkMove(mov, count, e.which)) {
			playSound1();
			count = 1 * count + 1;
			mov = mov + 1 + count;
			if (moved == false)
				moved = true;
			if (track[mov] == 0 && level == 0) {
				track[mov] = 1;
				score += 50;
			}
			if ((track[mov] == 0 || track[mov] == 1) && level == 1) {
				track[mov] += 1;
				score += 50;
			}
		} else {
			mov = 0;
			count = 0;
			if (lives == 0) {
				document.getElementById("test").innerHTML = "Gameover ";
			}// startover(); }
			else {
				lives--;
				document.getElementById("lives").innerHTML = "Lives: " + lives;
			}
		}
	}
	document.getElementById("test").innerHTML = "Lives: " + lives;
	// pausecomp(500);
	if (gamewin() == true && lives > 0) {
		// tick();

		document.getElementById("test").innerHTML = "Next Level ";
		nextlevel();
	} else if (gamewin() == false && lives > 0) {
		tick();
	} else if (lives <= 0) {
		playSound();
		document.getElementById("lives").innerHTML = "Lives " + lives;// startover();
		// }
		document.getElementById("test").innerHTML = "Gameover ";// startover();
		// }

	}

	// printKeys();
	// Z=90, X=88, Y=89, up=38, down=40, left=37, right=39, z=122, x=120, y=121
});

$(document).keyup(function(e) {
	delete keys[e.which];

	// printKeys();
});

function playSound() {
	createjs.Sound.play(soundID);
}
function playSound1() {
	createjs.Sound.play(soundID1);
}
function playSound2() {
	createjs.Sound.play(soundID2);
}
function loadSound1() {
	createjs.Sound.registerSound("js/Ahop.wav", soundID1);
	createjs.Sound.registerSound("js/game.wav", soundID);
	createjs.Sound.registerSound("js/ride.wav", soundID2);
}
var soundID = "Gamestart";
var soundID1 = "hop";
var soundID2 = "ride";

