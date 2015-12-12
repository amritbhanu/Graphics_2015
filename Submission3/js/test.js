/**
 * 
 */
// Majorly code has been referenced from
// http://webglfundamentals.org/webgl/lessons/webgl-fundamentals.html or
// http://learningwebgl.com/blog/?page_id=1217
window.onload = webGLStart;
var objjs = {};
var arr1 = [];
var t0 = performance.now();
var g_count = 0;
var texture;
var combine = [];
var Xmin = 0, Xmax = 0, Ymin = 0, Ymax = 0, Zmin = 0, Zmax = 0;
function parseMtl(url) {
	arr1 = [];
	$.ajax({
		url : "obj/" + url + ".mtl",
		async : false,
		success : function(data) {
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
		}
	});
	return arr1;
	// arr1 = [gname,[ka-rgb],[kd],ks]
}

function parseObj(url) {
	combine = [];
	$.ajax({
		url : "obj/" + url + ".obj",
		async : false,
		success : function(data) {
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
			Xmin = vertices[0][0], Xmax = vertices[0][0],
					Ymin = vertices[0][1], Ymax = vertices[0][1],
					Zmin = vertices[0][2], Zmax = vertices[0][2];
			for (var c = 0; c < vertices.length; c++) {
				if (Xmin > vertices[c][0])
					Xmin = vertices[c][0];
				if (Xmax < vertices[c][0])
					Xmax = vertices[c][0];
				if (Ymin > vertices[c][1])
					Ymin = vertices[c][1];
				if (Ymax < vertices[c][1])
					Ymax = vertices[c][1];
				if (Zmin > vertices[c][2])
					Zmin = vertices[c][2];
				if (Zmax < vertices[c][2])
					Zmax = vertices[c][2];
			}
			combine.push(vertices);
			combine.push(faces);
			combine.push(vt);
			combine.push(vn);
			combine.push(gname);
		}
	});
	all_mtl.push(parseMtl(url));
	return combine;
}
var all_obj = [];
var all_mtl = [];
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

function initbuffers(num) {
	buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(all_vertices[num][0]),
			gl.STATIC_DRAW);
	// gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	buffer.itemSize = 3;
	buffer.numItems = points.length / 3;

	buffer_v = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer_v);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(all_index[num]),
			gl.STATIC_DRAW);

	buffer_vt = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer_vt);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(all_vertices[num][1]),
			gl.STATIC_DRAW);
	// gl.enableVertexAttribArray(shaderProgram.texcoordLocation);
	buffer_vt.itemSize = 2;
	buffer_vt.numItems = all_vertices[num][1].length / 2;

	buffer_vn = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer_vn);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(all_vertices[num][2]),
			gl.STATIC_DRAW);
	// gl.enableVertexAttribArray(shaderProgram.a_normalLoc);
	buffer_vn.itemSize = 3;
	buffer_vn.numItems = all_vertices[num][2].length / 3;

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
	shaderProgram.v_my_bool = gl.getUniformLocation(shaderProgram, "v_my_bool");
	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram,
			"uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram,
			"uMVMatrix");
	shaderProgram.ts = gl.getUniformLocation(shaderProgram, "ts");
	shaderProgram.trans = gl.getUniformLocation(shaderProgram, "trans");
	shaderProgram.uNMatrix = gl.getUniformLocation(shaderProgram, "uNMatrix");

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
var g_modelMatrix = [];
var canvas;
var buffer, buffer_v, buffer_vt, buffer_vn, buffer_bound;
var i_x, tri_nos;
var vt = [], points = [], v_index = [], vn = [];
var mtl;
var ctx, c;
var bound_box = [];
var all_index_count = [];
var all_index = [];
var all_vertices = [];

function bound_func(Xmin, Xmax, Ymin, Ymax, Zmin, Zmax) {
	bound_box = [ Xmin, Ymin, Zmin, Xmax, Ymin, Zmin, Xmax, Ymin, Zmin, Xmax,
			Ymax, Zmin, Xmax, Ymax, Zmin, Xmin, Ymax, Zmin, Xmin, Ymax, Zmin,
			Xmin, Ymin, Zmin, Xmin, Ymin, Zmin, Xmin, Ymin, Zmax, Xmin, Ymin,
			Zmax, Xmin, Ymax, Zmax, Xmin, Ymax, Zmax, Xmin, Ymax, Zmin, Xmin,
			Ymin, Zmax, Xmax, Ymin, Zmax, Xmax, Ymin, Zmax, Xmax, Ymax, Zmax,
			Xmax, Ymax, Zmax, Xmin, Ymax, Zmax, Xmax, Ymax, Zmax, Xmax, Ymax,
			Zmin, Xmax, Ymin, Zmax, Xmax, Ymin, Zmin ];

	return bound_box;
}
function rendering(arr, num) {

	var faces = arr[1];
	tri_nos = faces.length;
	var gname_obj = arr[4];
	mtl = arr1;

	all_box.push(bound_func(Xmin, Xmax, Ymin, Ymax, Zmin, Zmax));

	bound_box = [];
	var waste = [];
	waste.push(Xmin);
	waste.push(Xmax);
	waste.push(Ymin);
	waste.push(Ymax);
	waste.push(Zmin);
	waste.push(Zmax);
	bounding.push(waste);
	Xmin = 0, Xmax = 0, Ymin = 0, Ymax = 0, Zmin = 0, Zmax = 0;
	var vex = [], tex = [], nor = [];
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
	all_index.push(v_index);
	all_index_count.push(i_x);
	var waste = [];
	i_x = 0;

	waste.push(points);
	waste.push(vt);
	waste.push(vn);
	all_vertices.push(waste);
	// console.log(all_vertices);
	v_index = [];
	points = [];
	vt = [];
	vn = [];
	/*
	 * for (var w=0;w<vt.length;w++) if (!vt[w]) console.log(vt[w]);
	 */

	nor = [], tex = [], arr = [], objjs = {}, arr1 = [];

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

	// var t1 = performance.now();
	// console.log("The program took " + (t1 - t0) / 1000 + " seconds.");
}
var dx = 0, dy = 0, dz = 0, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0;
// var u_translation = vec3.create();
// u_translation = [dx,dy,dz];
// var translation = vec3.create();
var stack = [];
var g_modelMatrix = [];
function render_bound(space_key, num) {
	if (space_key == -1) {
		for (var i = 0; i < hier.length; i++) {
			buffer_bound = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer_bound);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(all_box[i]),
					gl.STATIC_DRAW);
			gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
			buffer_bound.itemSize = 3;
			buffer_bound.numItems = all_box[i].length / 3;

			setMatrixUniforms(1, i);

			gl.bindBuffer(gl.ARRAY_BUFFER, buffer_bound);
			gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
					buffer_bound.itemSize, gl.FLOAT, false, 0, 0);
			gl.drawArrays(gl.LINES, 0, buffer_bound.numItems);
			gl.disableVertexAttribArray(shaderProgram.vertexPositionAttribute);
		}
	} else if (space_key != -1) {
		buffer_bound = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer_bound);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(all_box[space_key]),
				gl.STATIC_DRAW);
		gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
		buffer_bound.itemSize = 3;
		buffer_bound.numItems = all_box[space_key].length / 3;

		setMatrixUniforms(1, num);

		gl.bindBuffer(gl.ARRAY_BUFFER, buffer_bound);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
				buffer_bound.itemSize, gl.FLOAT, false, 0, 0);
		gl.drawArrays(gl.LINES, 0, buffer_bound.numItems);
		gl.disableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	}
}
//Code has been referenced from http://www.crownandcutlass.com/features/technicaldetails/frustum.html
frustum = [ [], [], [], [], [], [] ];
function ExtractFrustum() {
	var proj;
	var modl;
	var clip = [];
	var t;

	/* Get the current PROJECTION matrix from OpenGL */
	proj = pMatrix;
	modl = mvMatrix;

	/* Combine the two matrices (multiply projection by modelview) */
	clip[0] = modl[0] * proj[0] + modl[1] * proj[4] + modl[2] * proj[8]
			+ modl[3] * proj[12];
	clip[1] = modl[0] * proj[1] + modl[1] * proj[5] + modl[2] * proj[9]
			+ modl[3] * proj[13];
	clip[2] = modl[0] * proj[2] + modl[1] * proj[6] + modl[2] * proj[10]
			+ modl[3] * proj[14];
	clip[3] = modl[0] * proj[3] + modl[1] * proj[7] + modl[2] * proj[11]
			+ modl[3] * proj[15];

	clip[4] = modl[4] * proj[0] + modl[5] * proj[4] + modl[6] * proj[8]
			+ modl[7] * proj[12];
	clip[5] = modl[4] * proj[1] + modl[5] * proj[5] + modl[6] * proj[9]
			+ modl[7] * proj[13];
	clip[6] = modl[4] * proj[2] + modl[5] * proj[6] + modl[6] * proj[10]
			+ modl[7] * proj[14];
	clip[7] = modl[4] * proj[3] + modl[5] * proj[7] + modl[6] * proj[11]
			+ modl[7] * proj[15];

	clip[8] = modl[8] * proj[0] + modl[9] * proj[4] + modl[10] * proj[8]
			+ modl[11] * proj[12];
	clip[9] = modl[8] * proj[1] + modl[9] * proj[5] + modl[10] * proj[9]
			+ modl[11] * proj[13];
	clip[10] = modl[8] * proj[2] + modl[9] * proj[6] + modl[10] * proj[10]
			+ modl[11] * proj[14];
	clip[11] = modl[8] * proj[3] + modl[9] * proj[7] + modl[10] * proj[11]
			+ modl[11] * proj[15];

	clip[12] = modl[12] * proj[0] + modl[13] * proj[4] + modl[14] * proj[8]
			+ modl[15] * proj[12];
	clip[13] = modl[12] * proj[1] + modl[13] * proj[5] + modl[14] * proj[9]
			+ modl[15] * proj[13];
	clip[14] = modl[12] * proj[2] + modl[13] * proj[6] + modl[14] * proj[10]
			+ modl[15] * proj[14];
	clip[15] = modl[12] * proj[3] + modl[13] * proj[7] + modl[14] * proj[11]
			+ modl[15] * proj[15];

	// console.log(clip);
	/* Extract the numbers for the RIGHT plane */
	var waste = [];
	waste.push(clip[3] - clip[0]);
	waste.push(clip[7] - clip[4]);
	waste.push(clip[11] - clip[8]);
	waste.push(clip[15] - clip[12]);
	// console.log(waste);
	frustum[0] = waste;

	waste = [];

	/* Normalize the result */
	t = Math.sqrt(frustum[0][0] * frustum[0][0] + frustum[0][1] * frustum[0][1]
			+ frustum[0][2] * frustum[0][2]);
	frustum[0][0] /= t;
	frustum[0][1] /= t;
	frustum[0][2] /= t;
	frustum[0][3] /= t;

	/* Extract the numbers for the LEFT plane */
	waste.push(clip[3] + clip[0]);
	waste.push(clip[7] + clip[4]);
	waste.push(clip[11] + clip[8]);
	waste.push(clip[15] + clip[12]);
	frustum[1] = waste;
	waste = [];

	/* Normalize the result */
	t = Math.sqrt(frustum[1][0] * frustum[1][0] + frustum[1][1] * frustum[1][1]
			+ frustum[1][2] * frustum[1][2]);
	frustum[1][0] /= t;
	frustum[1][1] /= t;
	frustum[1][2] /= t;
	frustum[1][3] /= t;

	/* Extract the BOTTOM plane */
	waste.push(clip[3] + clip[1]);
	waste.push(clip[7] + clip[5]);
	waste.push(clip[11] + clip[9]);
	waste.push(clip[15] + clip[13]);
	frustum[2] = waste;
	waste = [];
	/* Normalize the result */
	t = Math.sqrt(frustum[2][0] * frustum[2][0] + frustum[2][1] * frustum[2][1]
			+ frustum[2][2] * frustum[2][2]);
	frustum[2][0] /= t;
	frustum[2][1] /= t;
	frustum[2][2] /= t;
	frustum[2][3] /= t;

	/* Extract the TOP plane */
	waste.push(clip[3] - clip[1]);
	waste.push(clip[7] - clip[5]);
	waste.push(clip[11] - clip[9]);
	waste.push(clip[15] - clip[13]);
	frustum[3] = waste;
	waste = [];
	/* Normalize the result */
	t = Math.sqrt(frustum[3][0] * frustum[3][0] + frustum[3][1] * frustum[3][1]
			+ frustum[3][2] * frustum[3][2]);
	frustum[3][0] /= t;
	frustum[3][1] /= t;
	frustum[3][2] /= t;
	frustum[3][3] /= t;

	/* Extract the FAR plane */
	waste.push(clip[3] - clip[2]);
	waste.push(clip[7] - clip[6]);
	waste.push(clip[11] - clip[10]);
	waste.push(clip[15] - clip[14]);
	frustum[4] = waste;
	waste = [];

	/* Normalize the result */
	t = Math.sqrt(frustum[4][0] * frustum[4][0] + frustum[4][1] * frustum[4][1]
			+ frustum[4][2] * frustum[4][2]);
	frustum[4][0] /= t;
	frustum[4][1] /= t;
	frustum[4][2] /= t;
	frustum[4][3] /= t;

	/* Extract the NEAR plane */
	waste.push(clip[3] + clip[2]);
	waste.push(clip[7] + clip[6]);
	waste.push(clip[11] + clip[10]);
	waste.push(clip[15] + clip[14]);
	frustum[5] = waste;
	waste = [];

	/* Normalize the result */
	t = Math.sqrt(frustum[5][0] * frustum[5][0] + frustum[5][1] * frustum[5][1]
			+ frustum[5][2] * frustum[5][2]);
	frustum[5][0] /= t;
	frustum[5][1] /= t;
	frustum[5][2] /= t;
	frustum[5][3] /= t;
}
function PolygonInFrustum(num) {
	var p = 0;
	// all_vertices[num][0]
	for (var f = 0; f < 6; f++) {
		for (p = 0; p < all_vertices[num][0].length; p = p + 3) {
			if (frustum[f][0] * all_vertices[num][0][p] + frustum[f][1]
					* all_vertices[num][0][p + 1] + frustum[f][2]
					* all_vertices[num][0][p + 2] + frustum[f][3] > 0)
				break;
		}
		if (p == all_vertices[num][0].length)
			return false;
	}
	return true;
}
function CubeInFrustum(num) {

	var min_a = [ bounding[num][0], bounding[num][2], bounding[num][4] ];
	var max_a = [ bounding[num][1], bounding[num][3], bounding[num][5] ];
	var b = mat4.create();
	b = g_matrix[num];

	min_a = mat4.multiplyVec3(b, min_a);
	max_a = mat4.multiplyVec3(b, max_a);
	for (var p = 0; p < 6; p++) {
		if (frustum[p][0] * min_a[0] + frustum[p][1] * min_a[1] + frustum[p][2]
				* min_a[2] + frustum[p][3] > 0)
			continue;
		if (frustum[p][0] * max_a[0] + frustum[p][1] * min_a[1] + frustum[p][2]
				* min_a[2] + frustum[p][3] > 0)
			continue;
		if (frustum[p][0] * min_a[0] + frustum[p][1] * max_a[1] + frustum[p][2]
				* min_a[2] + frustum[p][3] > 0)
			continue;
		if (frustum[p][0] * max_a[0] + frustum[p][1] * max_a[1] + frustum[p][2]
				* min_a[2] + frustum[p][3] > 0)
			continue;
		if (frustum[p][0] * min_a[0] + frustum[p][1] * max_a[1] + frustum[p][2]
				* max_a[2] + frustum[p][3] > 0)
			continue;
		if (frustum[p][0] * max_a[0] + frustum[p][1] * max_a[1] + frustum[p][2]
				* max_a[2] + frustum[p][3] > 0)
			continue;
		if (frustum[p][0] * min_a[0] + frustum[p][1] * min_a[1] + frustum[p][2]
				* max_a[2] + frustum[p][3] > 0)
			continue;
		if (frustum[p][0] * max_a[0] + frustum[p][1] * min_a[1] + frustum[p][2]
				* max_a[2] + frustum[p][3] > 0)
			continue;
		// console.log(num);
		return false;
	}
	return true;
}

var ts = mat4.create();
function transform() {
	mat4.identity(ts);
	var T = [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, dx, dy, dz, 1 ];
	var S = [ sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1 ];
	var Rx = [ 1, 0, 0, 0, 0, Math.cos(rx), -Math.sin(rx), 0, 0, Math.sin(rx),
			Math.cos(rx), 0, 0, 0, 0, 1 ];
	var Ry = [ Math.cos(ry), 0, Math.sin(ry), 0, 0, 1, 0, 0, -Math.sin(ry), 0,
			Math.cos(ry), 0, 0, 0, 0, 1 ];
	var Rz = [ Math.cos(rz), -Math.sin(rz), 0, 0, Math.sin(rz), Math.cos(rz),
			0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ];

	ts = mat4.multiply(mvMatrix, Rz);
	ts = mat4.multiply(mvMatrix, Ry);
	ts = mat4.multiply(mvMatrix, Rx);
	ts = mat4.multiply(mvMatrix, T);
	ts = mat4.multiply(mvMatrix, S);
}

function call_min_max(num) {

	console.log(bounding);
	var a = []
	var b = mat4.create();
	b = g_matrix[num];
	a = [ bounding[num][0], bounding[num][2], bounding[num][4] ];
	var waste = mat4.create();
	waste = mat4.multiplyVec3(b, a);

	bounding[num][0] = waste[0];
	bounding[num][2] = waste[5];
	bounding[num][4] = waste[10];

	a = [ bounding[num][1], bounding[num][3], bounding[num][5] ];
	waste = mat4.multiplyVec3(g_matrix[num], a);
	bounding[num][1] = waste[1];
	bounding[num][3] = waste[5];
	bounding[num][5] = waste[10];
	console.log(bounding);
}
var g_matrix = [];
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
	var T = [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, dx, dy, dz, 1 ];
	var S = [ sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1 ];
	var Rx = [ 1, 0, 0, 0, 0, Math.cos(rx), -Math.sin(rx), 0, 0, Math.sin(rx),
			Math.cos(rx), 0, 0, 0, 0, 1 ];
	var Ry = [ Math.cos(ry), 0, Math.sin(ry), 0, 0, 1, 0, 0, -Math.sin(ry), 0,
			Math.cos(ry), 0, 0, 0, 0, 1 ];
	var Rz = [ Math.cos(rz), -Math.sin(rz), 0, 0, Math.sin(rz), Math.cos(rz),
			0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ];

	var eye = [ 0, 10, 40 ];
	var target = [ 0, 5, 0 ];
	var up = [ 0, 1, 0 ];
	mvMatrix = mat4.lookAt(eye, target, up);

	var adjustedLD = vec3.create();
	vec3.normalize([ 0.0, 15.0, -30.0 ], adjustedLD);
	vec3.scale(adjustedLD, -1);
	gl.uniform3fv(shaderProgram.uLightingDirection, adjustedLD);
	var adjustedC = vec3.create();
	vec3.normalize([ 0, 10, 30 ], adjustedC);
	vec3.scale(adjustedC, -1);
	gl.uniform3fv(shaderProgram.u_cameraPosition, adjustedC);

	// transform();
	mvMatrix = mat4.multiply(mvMatrix, Rz);
	mvMatrix = mat4.multiply(mvMatrix, Ry);
	mvMatrix = mat4.multiply(mvMatrix, Rx);
	mvMatrix = mat4.multiply(mvMatrix, T);
	mvMatrix = mat4.multiply(mvMatrix, S);

	ExtractFrustum();

	for (var i = 0; i < hier.length; i++) {
		g_modelMatrix = [];
		for (var j = 0; j < hier[i][1].length; j++) {
			g_modelMatrix.push(parseFloat(hier[i][1][j]));
		}
		g_matrix.push(g_modelMatrix);

		if (frust == false || CubeInFrustum(i) == true) {
			// console.log(i);
			if (box == true && (space_key == -1 || space_key == i)) {
				render_bound(space_key, i);
				// gl.disableVertexAttribArray(shaderProgram.vertexPositionAttribute);
				// gl.disableVertexAttribArray(shaderProgram.a_normalLoc);
				// gl.disableVertexAttribArray(shaderProgram.texcoordLocation);
			}
			// mat4.identity(trans);
			// mat4.multiply(trans, trans, g_modelMatrix);

			// console.log(i);

			initbuffers(i);
			// setTexcoords(gl, all_mtl[i][0][3][0]);

			var normalMatrix = mat3.create();
			mat4.toInverseMat3(mvMatrix, normalMatrix);
			mat3.transpose(normalMatrix);
			gl.uniformMatrix3fv(shaderProgram.uNMatrix, false, normalMatrix);
			// console.log(all_vertices);

			gl.uniform3fv(shaderProgram.u_matDiffuseReflectances,
					all_mtl[i][0][2]);
			gl.uniform1f(shaderProgram.u_matShininess, all_mtl[i][0][1][0]);
			gl.uniform1i(shaderProgram.u_texture, 0);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, texture);

			setMatrixUniforms(0, i);
			// console.log(trans)
			gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
			gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
					buffer.itemSize, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(shaderProgram.texcoordLocation);
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer_vt);
			gl.vertexAttribPointer(shaderProgram.texcoordLocation,
					buffer_vt.itemSize, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(shaderProgram.a_normalLoc);
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer_vn);
			gl.vertexAttribPointer(shaderProgram.a_normalLoc,
					buffer_vn.itemSize, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer_v);
			// console.log(all_index_count);
			gl.drawElements(gl.TRIANGLES, all_index_count[i],
					gl.UNSIGNED_SHORT, 0);
			// mvMatrix = cloned;
			gl.disableVertexAttribArray(shaderProgram.vertexPositionAttribute);
			gl.disableVertexAttribArray(shaderProgram.a_normalLoc);
			gl.disableVertexAttribArray(shaderProgram.texcoordLocation);
		}
	}

	fpsCounter.update();
	ctx.clearRect(0, 0, 200, 600);
	ctx.rect(0, 0, 200, 600);
	ctx.fillStyle = "black";
	ctx.fill();
	ctx.fillStyle = "white";
	ctx.fillText("frames per second: " + fpsCounter.getCountPerSecond(), 5, 20);
	ctx.fillText("frames average: " + fpsCounter.getCountPerMinute(), 5, 50);
	// gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	window.requestAnimationFrame(render);

}

function setMatrixUniforms(val, i) {
	// console.log(g_modelMatrix);
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
	gl.uniformMatrix4fv(shaderProgram.trans, false, g_matrix[i]);
	// gl.uniformMatrix4fv(shaderProgram.ts, false, ts);
	gl.uniform1i(shaderProgram.v_my_bool, val);
}

var texture;

function setTexcoords(gl, img) {

	texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	// Fill the texture with a 1x1 blue pixel.
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA,
			gl.UNSIGNED_BYTE, new Uint8Array([ 0, 0, 255, 255 ]))
	texture.image = new Image();
	texture.image.src = "textures/" + img;
	texture.image.onload = function() {
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
				texture.image);

		setupTextureFilteringAndMips(texture.image.width, texture.image.height);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}
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

function OverrideRingBuffer(size) {
	this.size = size;
	this.head = 0;
	this.buffer = new Array();
};

OverrideRingBuffer.prototype.push = function(value) {
	if (this.head >= this.size)
		this.head -= this.size;
	this.buffer[this.head] = value;
	this.head++;
};

OverrideRingBuffer.prototype.getAverage = function() {
	if (this.buffer.length === 0)
		return 0;

	var sum = 0;

	for (var i = 0; i < this.buffer.length; i++) {
		sum += this.buffer[i];
	}

	return (sum / this.buffer.length).toFixed(1);
};

function FpsCounter() {
	this.count = 0;
	this.fps = 0;
	this.prevSecond;
	this.minuteBuffer = new OverrideRingBuffer(60);
}

FpsCounter.prototype.update = function() {
	if (!this.prevSecond) {
		this.prevSecond = new Date().getTime();
		this.count = 1;
	} else {
		var currentTime = new Date().getTime();
		var difference = currentTime - this.prevSecond;
		if (difference > 1000) {
			this.prevSecond = currentTime;
			this.fps = this.count;
			this.minuteBuffer.push(this.count);
			this.count = 0;
		} else {
			this.count++;
		}
	}
};

FpsCounter.prototype.getCountPerMinute = function() {
	return this.minuteBuffer.getAverage();
};

FpsCounter.prototype.getCountPerSecond = function() {
	return this.fps;
};

var url;
var hier = [];
function parseHierarchy(url) {
	c = document.getElementById("c1");
	c.width=c_length[0];
	//c.height=c_length[1];
	ctx = c.getContext("2d");
	//ctx.width=c_length[0];
	ctx.font = "15px Georgia";

	canvas = document.getElementById("c");
	canvas.width=c_length[0];
	canvas.height=c_length[1];
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
	var tran_16 = [];
	$.ajax({
		url : "obj/" + url + ".txt",
		async : false,
		success : function(data) {
			var data1 = data.replace(/\t+/g, '')
			var lines = data1.replace(/  +/g, ' ').split("\n");
			for (var i = 0; i < lines.length; i++) {
				var vals = lines[i].trim().split(" ");
				if (vals[0] != null && vals[0] != "#" && vals[0] != '') {
					var objs = [];
					objs.push(vals[0]);
					i++;
					tran_16 = lines[i].trim().split(" ");
					objs.push(tran_16);
					tran_16 = [];
					i++;
					objs.push(lines[i].trim().split(" "))
					hier.push(objs);
				}

			}
		}
	});
	for (var num = 0; num < hier.length; num++) {
		url = hier[num][0].split(".")[0];
		all_obj.push(parseObj(url));
		rendering(all_obj[num], num);
		setTexcoords(gl, "vase_round_d.bmp");
	}
	// update_boundbox();
	/*
	 * for (var i = 0; i < hier.length; i++) {
	 * 
	 * g_modelMatrix=[]; for (var j = 0; j < hier[i][1].length; j++) {
	 * g_modelMatrix.push(parseFloat(hier[i][1][j])); }
	 * g_matrix.push(g_modelMatrix); call_min_max(i); }
	 */
	render();
}

var fpsCounter;
var all_box = [];
var bounding = [];
function update_boundbox() {
	for (var i = 0; i < hier.length; i++) {
		if (hier[i][2] != 0) {
			var t = hier[i][2];
			var Xm = bounding[i][0];
			var XM = bounding[i][1];
			var Ym = bounding[i][2];
			var YM = bounding[i][3];
			var Zm = bounding[i][4];
			var ZM = bounding[i][5];
			for (var j = 1; j < t; j++) {
				if (Xm > bounding[j][0])
					Xm = bounding[j][0];
				if (XM < bounding[j][1])
					XM = bounding[j][1];
				if (Ym > bounding[j][2])
					Ym = bounding[j][2];
				if (YM < bounding[j][3])
					YM = bounding[j][3];
				if (Zm > bounding[j][4])
					Zm = bounding[j][4];
				if (ZM < bounding[j][5])
					ZM = bounding[j][5];
			}
			console.log(all_box);
			all_box[i] = bound_func(Xm, XM, Ym, YM, Zm, ZM);
			console.log(all_box);
			bounding[i][0] = Xm;
			bounding[i][1] = XM;
			bounding[i][2] = Ym;
			bounding[i][3] = YM;
			bounding[i][4] = Zm;
			bounding[i][5] = ZM;
		}
	}
}

function webGLStart() {

	fpsCounter = new FpsCounter();
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	parseWindow();
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		if (pair[0] == 'hierarchy')
			parseHierarchy(pair[1])

	}

}
var c_length=[];
function parseWindow()
{
	
	$.ajax({
		url : "obj/window.txt",
		async : false,
		success : function(data) {
			var data1 = data.replace(/\t+/g, '')
			var lines = data1.replace(/  +/g, ' ').split("\n");
			for (var i = 0; i < lines.length; i++) {
				var vals = lines[i].trim().split(" ");
				if (vals[0] != null && vals[0] != "#" && vals[0] != '') {
					c_length=vals;					
				}

			}
		}
	});

}
/*
 * function update(dx, dy, dz) { for (var i = 0; i < points.length; i = i + 3) {
 * points[i] += dx; points[i + 1] = dy; points[i + 2] = dz; } // initbuffers();
 * buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
 * gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
 * gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
 * buffer.itemSize = 3; buffer.numItems = points.length / 3;
 * console.log(points); render(); }
 */
var keys = {};
$(document).keydown(function(e) {
	// e.preventDefault();
	keys[e.which] = true;
	// rotate up
	if (e.which == 38) {
		rx -= 0.1;
		render();
	}
	// rotate down
	if (e.which == 40) {
		rx += 0.1;
		render();
	}
	// rotate left
	if (e.which == 37) {
		ry -= 0.1;
		render();
	}
	// rotate right
	if (e.which == 39) {
		ry += 0.1;
		render();
	}

	// printKeys();
	// Z=90, X=88, Y=89, up=38, down=40, left=37, right=39, z=122, x=120, y=121
});
var box = false;
$(document).keypress(function(e) {

	// zoom out
	if (e.charCode == 90) {
		dz -= 0.1;
		render();
	}

	// move right
	if (e.charCode == 88) {
		dx -= 0.1;
		render();
	}
	// move down
	if (e.charCode == 89) {
		dy += 0.1;
		render();
	}

	// zoom out
	if (e.charCode == 122) {
		dz += 0.1;
		render();
	}
	// move left
	if (e.charCode == 120) {
		dx += 0.1;
		render();
	}
	// move down
	if (e.charCode == 121) {
		dy -= 0.1;
		render();
	}
	// b or B press
	if (e.charCode == 66) {
		if (box == false) {
			box = true;
			render();
		} else if (box == true) {
			space_key = -1;
			box = false;
			render();
		}
	}
	if (e.charCode == 98) {
		if (box == false) {
			box = true;
			render();
		} else if (box == true) {
			space_key = -1;
			box = false;
			render();
		}
	}
	if (e.charCode == 32) {
		if (box == true) {
			space_key += 1;
			if (space_key != hier.length) {

				render();
			} else if (space_key == hier.length) {
				space_key = 0;
				render();
			}
		}
	}
	if (e.charCode == 70) {
		if (frust == true) {
			frust = false;
			render();
		} else if (frust == false) {
			frust = true;
			render();
		}
	}
	if (e.charCode == 102) {
		if (frust == true) {
			frust = false;
			render();
		} else if (frust == false) {
			frust = true;
			render();
		}
	}
	// console.log(dy);

	// printKeys();
	// Z=90, X=88, Y=89, up=38, down=40, left=37, right=39, z=122, x=120, y=121
});
var frust = false
var space_key = -1;

$(document).keyup(function(e) {
	delete keys[e.which];

	// printKeys();
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
