//Majorly code has been referenced from http://webglfundamentals.org/webgl/lessons/webgl-fundamentals.html or http://learningwebgl.com/blog/?page_id=1217

window.onload = webGLStart;
var objjs = {};
var arr1 = [];
var t0 = performance.now();
var g_count = 0;
var texture;

objjs.handleLoadedMtl = function handleLoadedMtl(data) {
	var data1 = data.replace(/\t+/g, '')
	var lines = data1.replace(/  +/g, ' ').split("\n");

	// [gname,[ka-rgb],[kd],ks]
	var gname = [];
	// r,g,b
	var k_values = [];

	for (var i = 0; i < lines.length; i++) {
		var vals = lines[i].split(" ");
		if (vals[0] == 'newmtl') {
			gname.push(vals[1]);
		} else if (vals[0] == 'map_Kd') {
			k_values.push(vals[1]);
			gname.push(k_values);
			k_values = [];
		} else if (vals[0] == 'Kd') {
			k_values.push(vals[1]);
			k_values.push(vals[2]);
			k_values.push(vals[3]);
			gname.push(k_values);
			k_values = [];
		} else if (vals[0] == 'Ns') {
			k_values.push(vals[1]);
			gname.push(k_values);
			k_values = [];
		}
		if (gname.length == 4) {

			arr1.push(gname);
			gname = [];
		}
	}
	// arr1 = [gname,[ka-rgb],[kd],ks]
}

objjs.handleLoadedObject = function handleLoadedObject(data) {
	var data1 = data.replace(/\t+/g, '')
	var lines = data1.replace(/  +/g, ' ').split("\n");
	// index =0 is 1st [x,y,z]
	var vertices = [];
	// [gid from 1,[[a-index,b,c]]

	var vt = [];
	var vn = [];
	var faces = [];
	var flag = false;
	var k = 0, ii = 0, index_val = 0;
	var gname = [];
	var g_count_faces = [];
	var waste = [];
	for (var i = 0; i < lines.length; i++) {
		var vals = lines[i].trim().split(" ");

		if (vals[0] == 'usemtl') {
			for (k = 0; k < gname.length; k++) {
				if (gname[k] == vals[1]) {
					index_val = k;
					flag = true;
				}
			}
			if (!flag) {
				gname.push(vals[1]);
				index_val = gname.length - 1;
				flag = false
			}
		} else if (vals[0] == 'g') {
			g_count += 1;
		} else if (vals[0] == 'v') {
			var z = [];
			for (var iii = 1; iii < vals.length; iii++)
				if (vals[iii] != '') {
					z.push(vals[iii]);
				}
			waste.push(parseFloat(z[0]));
			waste.push(parseFloat(z[1]));
			waste.push(parseFloat(z[2]));
			vertices.push(waste)
			waste = [];
		}
		// index is not negated minus 1. Take care of it later on.
		else if (vals[0] == 'f') {
			waste.push(parseFloat(index_val));
			g_count_faces[index_val] += 1;
			for (ii = 1; ii < vals.length; ii++) {
				waste.push(vals[ii]);
			}
			faces.push(waste);
			waste = [];
		} else if (vals[0] == 'vt') {
			var z = [];
			for (var iii = 1; iii < vals.length; iii++)
				if (vals[iii] != '') {
					z.push(vals[iii]);
				}
			waste.push(parseFloat(z[0]));
			waste.push(parseFloat(z[1]));
			waste.push(parseFloat(z[2]));
			vt.push(waste)
			waste = [];
		} else if (vals[0] == 'vn') {
			var z = [];
			for (var iii = 1; iii < vals.length; iii++)
				if (vals[iii] != '') {
					z.push(vals[iii]);
				}
			waste.push(parseFloat(z[0]));
			waste.push(parseFloat(z[1]));
			waste.push(parseFloat(z[2]));
			vn.push(waste)
			waste = [];
		}
	}

	var combine = [];

	combine.push(vertices);
	combine.push(faces);
	combine.push(vt);
	combine.push(vn);
	combine.push(gname);
	return combine;
}

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

function initbuffers() {
	buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	buffer.itemSize = 3;
	buffer.numItems = points.length / 3;

	buffer_v = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer_v);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(v_index),
			gl.STATIC_DRAW);

	buffer_vt = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer_vt);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vt), gl.STATIC_DRAW);
	gl.enableVertexAttribArray(shaderProgram.texcoordLocation);
	buffer_vt.itemSize = 2;
	buffer_vt.numItems = vt.length / 2;

	buffer_vn = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer_vn);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vn), gl.STATIC_DRAW);
	gl.enableVertexAttribArray(shaderProgram.a_normalLoc);
	buffer_vn.itemSize = 3;
	buffer_vn.numItems = vn.length / 3;

}

var shaderProgram;
function initShaders() {
	var vertexShader = getShader(gl, "2d-vertex-shader");
	var fragmentShader = getShader(gl, "2d-fragment-shader");

	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Could not initialise shaders");
	}

	gl.useProgram(shaderProgram);
	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram,
			"a_position");
	shaderProgram.texcoordLocation = gl.getAttribLocation(shaderProgram,
			"a_texcoord");
	shaderProgram.a_normalLoc = gl.getAttribLocation(shaderProgram,
			"aVertexNormal");
	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram,
			"uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram,
			"uMVMatrix");
shaderProgram.uNMatrix = gl.getUniformLocation(shaderProgram,
			"uNMatrix");


	shaderProgram.u_cameraPosition = gl.getUniformLocation(shaderProgram,
			"u_cameraPosition");
	shaderProgram.uLightingDirection = gl.getUniformLocation(shaderProgram,
			"uLightingDirection");
	shaderProgram.u_matAmbientReflectances = gl.getUniformLocation(
			shaderProgram, "u_matAmbientReflectances");
	shaderProgram.u_matDiffuseReflectances = gl.getUniformLocation(
			shaderProgram, "u_matDiffuseReflectances");
	shaderProgram.matSpecularReflectances = gl.getUniformLocation(
			shaderProgram, "matSpecularReflectances");
	shaderProgram.u_matShininess = gl.getUniformLocation(shaderProgram,
			"u_matShininess");

	gl.uniform3fv(shaderProgram.u_matAmbientReflectances, [ 1.0, 1.0, 1.0 ]);
	gl.uniform3fv(shaderProgram.u_matSpecularReflectances, [ 1.0, 1.0, 1.0 ]);
	// shaderProgram.u_translationUniform = gl.getUniformLocation(shaderProgram,
	// "u_translation");
	shaderProgram.u_texture = gl.getUniformLocation(gl.shaderProgram,
			"u_texture");
	// shaderProgram.veccolor = gl.getAttribLocation(shaderProgram, "color");
	// gl.uniform4fv(veccolor, 1.0, 0.0, 0.0, 1.0);

}

var gl;
var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var nMatrix = mat3.create();
var canvas;
var buffer, buffer_v, buffer_vt, buffer_vn;
var i_x, tri_nos;
var vt = [], points = [], v_index = [], vn = [];
var mtl;

function rendering(arr) {
	canvas = document.getElementById("c");
	gl = canvas.getContext("experimental-webgl");
	gl.viewportWidth = canvas.width;
	gl.viewportHeight = canvas.height;
	gl.viewport(0.0, 0.0, gl.viewportWidth, gl.viewportHeight);

	initShaders();

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	// Enable depth testing
	gl.enable(gl.DEPTH_TEST);
	// Near things obscure far things
	// gl.depthFunc(gl.LEQUAL);
	// Clear the color as well as the depth buffer.
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


	var faces = arr[1];
	tri_nos = faces.length;
	var gname_obj = arr[4];
	mtl = arr1;

	var vex = [], tex = [], nor = [];//vt = [], points = [], v_index = [], vn = [];
		var i = 0;


	for (var t = 0; t < faces.length; t++) {
		for (var e = 1; e < 4; e++) {
			v_index.push(i);
			i += 1;
			vex.push(arr[0][faces[t][e].split('/')[0] - 1]);
			tex.push(arr[2][faces[t][e].split('/')[1] - 1]);
			nor.push(arr[3][faces[t][e].split('/')[2] - 1]);
		}
	}

	for (var t = 0; t < vex.length; t++) {
		points = points.concat(vex[t]);
	}
	vex = [];
	// console.log(Math.max.apply(Math, v_index));
	// console.log(v_index.length);
	// just gname

	for (var t = 0; t < tex.length; t++) {
		vt = vt.concat(tex[t][0]);
		vt = vt.concat(tex[t][1]);
	}
	i_x = v_index.length;
	// console.log(vt.length)
	for (var t = 0; t < nor.length; t++) {
		vn = vn.concat(nor[t]);
	}
	/*
	 * for (var w=0;w<vt.length;w++) if (!vt[w]) console.log(vt[w]);
	 */

	nor = [], tex = [], arr = [], objjs = {}, arr1 = [];


	initbuffers();
	setTexcoords(gl, mtl[0][3][0]);

	// gl.enableVertexAttribArray(shaderProgram.veccolor);

	/*
	 * var buffer2 = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer2);
	 * 
	 * var colorsOfFaces = []; for (var r = 0; r < g_count; r++) { var waste =
	 * []; for (var p = 0; p < 3; p++) { waste.push(Math.random()); }
	 * waste.push(1.0); colorsOfFaces.push(waste); } console.log(colorsOfFaces);
	 * var colors = [];
	 * 
	 * for (var j = 0; j < g_count; j++) { var polygonColor = colorsOfFaces[j];
	 * 
	 * for (var i = 0; i < 4; i++) { colors = colors.concat(polygonColor); } }
	 * console.log(colors); gl.bufferData(gl.ARRAY_BUFFER, new
	 * Float32Array(colors), gl.STATIC_DRAW);
	 */

	var t1 = performance.now();
	console.log("The program took " + (t1 - t0) / 1000 + " seconds.");
}
var dx = 0, dy = 0, dz = 0, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0;
// var u_translation = vec3.create();
// u_translation = [dx,dy,dz];
// var translation = vec3.create();

function render() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	var fieldOfView = 100;
	var aspect = canvas.width / canvas.height;
	pMatrix = mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1,
			100.0);
	mat4.identity(mvMatrix);

	/*
	 * mat4.translate(mvMatrix,mvMatrix, [dx, dy, dz]);
	 * mat4.translate(mvMatrix,mvMatrix, [sx, sy, sz]);
	 * mat4.rotate(mvMatrix,mvMatrix, rz, [0, 0, 1]);
	 */

	var T = [ 1, 0, 0, dx, 0, 1, 0, dy, 0, 0, 1, dz, 0, 0, 0, 1 ];
	var S = [ sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1 ];
	var Rx = [ 1, 0, 0, 0, 0, Math.cos(rx), -Math.sin(rx), 0, 0, Math.sin(rx),
			Math.cos(rx), 0, 0, 0, 0, 1 ];
	var Ry = [ Math.cos(ry), 0, Math.sin(ry), 0, 0, 1, 0, 0, -Math.sin(ry), 0,
			Math.cos(ry), 0, 0, 0, 0, 1 ];
	var Rz = [ Math.cos(rz), -Math.sin(rz), 0, 0, Math.sin(rz), Math.cos(rz),
			0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ];

	var eye = [ 0, 10, 30 ];
	var target = [ 0, 5, 0 ];
	var up = [ 0, 1, 0 ];
	mvMatrix = mat4.lookAt(eye, target, up);

	var normalMatrix = mat3.create(); mat4.toInverseMat3(mvMatrix,normalMatrix);
	 mat3.transpose(normalMatrix);
	 gl.uniformMatrix3fv(shaderProgram.uNMatrix, false, normalMatrix);
	 var adjustedLD = vec3.create(); vec3.normalize([ 0.0, 15.0, -30.0 ],adjustedLD); vec3.scale(adjustedLD, -1);
	gl.uniform3fv(shaderProgram.uLightingDirection, adjustedLD);
	 var adjustedC = vec3.create(); vec3.normalize([ 0, 10, 30 ],adjustedC); vec3.scale(adjustedC, -1);
	gl.uniform3fv(shaderProgram.u_cameraPosition, adjustedC);

	gl.uniform3fv(shaderProgram.u_matDiffuseReflectances, mtl[0][2]);
	gl.uniform1f(shaderProgram.u_matShininess, mtl[0][1][0]);
	// mat4.multiply(T, uTMatrix, uTMatrix);

	// vec3.set (translation, [dx, dy, dz]);
	// console.log(translation);
	// mat4.translate (mvMatrix, mvMatrix, translation);
	mat4.multiply(T, mvMatrix, mvMatrix);
	mat4.multiply(S, mvMatrix, mvMatrix);
	mat4.multiply(Rz, mvMatrix, mvMatrix);

	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
			buffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, buffer_vt);
	gl.vertexAttribPointer(shaderProgram.texcoordLocation, buffer_vt.itemSize,
			gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, buffer_vn);
	gl.vertexAttribPointer(shaderProgram.a_normalLoc, buffer_vn.itemSize,
			gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer_v);

	gl.uniform1i(shaderProgram.u_texture, 0);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);

	setMatrixUniforms();

	gl.drawElements(gl.TRIANGLES, i_x, gl.UNSIGNED_SHORT, 0);
	// gl.drawArrays(gl.TRIANGLES, 0, tri_nos*3);
}

function setMatrixUniforms() {
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
	// gl.uniform3fv(shaderProgram.u_translationUniform, u_translation);
}

var texture;

function setTexcoords(gl, img) {

	texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	// Fill the texture with a 1x1 blue pixel.
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA,
			gl.UNSIGNED_BYTE, new Uint8Array([ 0, 0, 255, 255 ]))
	texture.image = new Image();
	texture.image.src = img;
	texture.image.addEventListener('load',
			function() {
				gl.bindTexture(gl.TEXTURE_2D, texture);
				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
						gl.UNSIGNED_BYTE, texture.image);

				setupTextureFilteringAndMips(texture.image.width,
						texture.image.height);
				gl.bindTexture(gl.TEXTURE_2D, null);
			});
	render();
}
function isPowerOf2(value) {
	return (value & (value - 1)) == 0;
}

function setupTextureFilteringAndMips(width, height) {
	if (isPowerOf2(width) && isPowerOf2(height)) {
		// the dimensions are power of 2 so generate mips and turn on
		// tri-linear filtering.
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
				gl.LINEAR_MIPMAP_LINEAR);
	} else {
		// at least one of the dimensions is not a power of 2 so set the
		// filtering
		// so WebGL will render it.
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	}
}

objjs.loadObj = function loadObj(fileName) {
	var request = new XMLHttpRequest();
	var arr;
	request.open("GET", "obj/"+fileName + '.obj');
	request.onreadystatechange = function() {
		if (request.readyState == 4) {
			arr = objjs.handleLoadedObject(request.responseText);
			rendering(arr);
		}
	}
	request.send();
}

objjs.loadMtl = function loadMtl(fileName) {
	var request = new XMLHttpRequest();
	request.open("GET", "obj/"+fileName + '.mtl');
	request.onreadystatechange = function() {
		if (request.readyState == 4) {
			objjs.loadObj(fileName);
			objjs.handleLoadedMtl(request.responseText);
		}
	}
	request.send();
}

function webGLStart() {

	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		if (pair[0] == 'objfilepath')
			console.log(pair[1]);
	}
	objjs.loadMtl(pair[1]);

}
/*function update(dx, dy, dz) {
	for (var i = 0; i < points.length; i = i + 3) {
		points[i] += dx;
		points[i + 1] = dy;
		points[i + 2] = dz;
	}
	// initbuffers();
	buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	buffer.itemSize = 3;
	buffer.numItems = points.length / 3;
	console.log(points);
	render();
}*/
var keys = {};

$(document).keydown(function(e) {
	keys[e.which] = true;
	// zoom in
	if (e.which == 90)
		sz -= 0.01;
	// zoom out
	if (e.which == 88)
		sz += 0.01;
	// object in +y
	if (e.which == 38)
		dy -= 0.1;
	// object in -y
	if (e.which == 40)
		dy += 0.1;
	// object in +x
	if (e.which == 39)
		dx -= 0.1;
	// object in -x
	if (e.which == 37)
		dx += 0.1;
	// object in +z
	if (e.which == 219)
		dz -= 0.1;
	// object in -z
	if (e.which == 221)
		dz += 0.1;
	// rotate anti in z
	if (e.which == 87)
		rz -= 0.1;
	// rotate clock in z
	if (e.which == 81)
		rz += 0.1;
	// console.log(dy);
	render();
	//printKeys();
	// z=90, x=88, up=38, down=40, left=37, right=39, [=219, ]=221, q=81, w=87
});

$(document).keyup(function(e) {
	delete keys[e.which];

	//printKeys();
});

function printKeys() {
	var html = '';
	for ( var i in keys) {
		if (!keys.hasOwnProperty(i))
			continue;
		html += '<p>' + i + '</p>';
	}
	$('#out').html(html);
}
