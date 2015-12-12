/**
 * 
 */
//Global Vars
var objjs = {};
var arr1=[];
objjs.handleLoadedMtl = function handleLoadedMtl(data) {
    var lines = data.split("\n");
	//[gname,[ka-rgb],[kd],ks]
    var gname=[];
    //r,g,b
    var k_values=[];

	for(var i=0; i<lines.length; i++){
		var vals = lines[i].split(" ");
		if(vals[0] == 'newmtl')
		{
			gname.push(vals[1]);
		}
		else if (vals[0] == 'Ka' )
		{
			k_values.push(vals[1]);
			k_values.push(vals[2]);
			k_values.push(vals[3]);
			gname.push(k_values);
			k_values=[];
		}
		else if (vals[0] == 'Kd' )
		{
			k_values.push(vals[1]);
			k_values.push(vals[2]);
			k_values.push(vals[3]);
			gname.push(k_values);
			k_values=[];
		}
		else if (vals[0] == 'Ks' )
		{
			k_values.push(vals[1]);
			k_values.push(vals[2]);
			k_values.push(vals[3]);
			gname.push(k_values);
			k_values=[];
		}
		if (gname.length==4)
		{

			arr1.push(gname);
			gname=[];
		}
	}
	//arr1 = [gname,[ka-rgb],[kd],ks]
}

objjs.handleLoadedObject = function handleLoadedObject(data) {
    var lines = data.split("\n");

    //index =0 is 1st [x,y,z]
    var vertices=[];
	//[gid from 1,[[a-index,b,c]]
    var faces=[];
    var flag=false;
    var k=0,ii=0,index_val=0;
    var gname=[];
    var g_count_faces=[];
    var waste=[];
    for(var i=0; i<lines.length; i++){
		var vals = lines[i].split(" ");
		
		if(vals[0] == 'g'){
			for (k=0;k<gname.length;k++){
				if (gname[k]==vals[1]){
					index_val=k;
					flag=true;
				}
			}
			if (!flag){
			gname.push(vals[1]);
			index_val=gname.length - 1;
			flag=false
			}
		}
		
		else if(vals[0] == 'v'){
			var z=[];
			for (var iii=1;iii<vals.length;iii++)
				if (vals[iii]!=''){
					z.push(vals[iii]);
				}
			waste.push(parseFloat(z[0]));
			waste.push(parseFloat(z[1]));
			waste.push(parseFloat(z[2]));
			vertices.push(waste)
			waste=[];
		}
		
		else if(vals[0] == 'f'){
			waste.push(parseFloat(index_val));
			g_count_faces[index_val]+=1;
			for (ii=1;ii<vals.length;ii++){
				waste.push(vals[ii]-1);
			}
			faces.push(waste);
			waste=[];
		}
	}

        var combine=[];
console.log(vertices[10]);
	combine.push(vertices);
        combine.push(faces);
	combine.push(gname);
	return combine;
}

function setPixel( imageData, x, y, r, g, b ) {
    index = ( x + y * imageData.width ) * 4;
	//if (r<0)r=r;else if (r>256)r=r-256; else r=r;
	//if (g<0)g=g;else if (g>256)g=g-256; else g=g;
	//if (b<0)b=b;else if (b>256)b=b-256; else b=b;
    imageData.data[index+0] = r;
    imageData.data[index+1] = g;
    imageData.data[index+2] = b;

}

function findplane(unit_face_a,unit_face_b,unit_face_c,vertices){
	
	var ax=vertices[unit_face_a][0], ay=vertices[unit_face_a][1], az=vertices[unit_face_a][2];
	var bx=vertices[unit_face_b][0], by=vertices[unit_face_b][1], bz=vertices[unit_face_b][2];
	var cx=vertices[unit_face_c][0], cy=vertices[unit_face_c][1], cz=vertices[unit_face_c][2];
	//ABxAC
	var AB=[(bx-ax),(by-ay),(bz-az)];
	var AC=[(cx-ax),(cy-ay),(cz-az)];
	//normal plane equation
	var plane=[(AB[1]*AC[2]-AB[2]*AC[1]),(AB[2]*AC[0]-AC[2]*AB[0]),(AB[0]*AC[1]-AC[0]*AB[1])];
	var x = Math.sqrt(plane[0]*plane[0]+plane[1]*plane[1]+plane[2]*plane[2])
	if (x!=0){var plane_eqn=[plane[0]/x,plane[1]/x,plane[2]/x]}
	else{var plane_eqn=[plane[0],plane[1],plane[2]]}
	//var cons_d=-(ax*plane_eqn[0]+ay*plane_eqn[1]+az*plane_eqn[2]);
	//plane_eqn.push(cons_d);
	return plane_eqn;
}

function rendering(arr)
{
	var canvas = document.getElementById( "webGL" );
	var ctx = canvas.getContext('2d');
    	ctx.rect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle="black";
	ctx.fill();
	var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height );
	//1,1,1
	//var white_light=[0,5,0];
	//var eye=[0,0,-2];

	var vertices=arr[0];
	var faces=arr[1];
	//just gname
	var gname_obj=arr[2];
	//arr1 = [gname, [ka - [r,g,b]], [kd], [ks]]

	//plane_face = [face_number 0-, [all xyz values of plan]]
	var plane_face=[];
	for (var x_cor=0;x_cor<256;x_cor++){
		for (var y_cor=0;y_cor<256;y_cor++){
			var eye_point=[(1-x_cor/128),(1-y_cor/128)];
			for (var i=0;i<faces.length;i++){
				//unit face[gid=1 to, vertice 1 index, vertice 2 index, vertice 3 index]
				var unit_face=faces[i];
//console.log(unit_face);
				//a,b,c are points
				var unit_face_a=unit_face[1];
				var unit_face_b=unit_face[2];
				var unit_face_c=unit_face[3];
				
				if (plane_face.length==i && plane_face.length<=12){
					var waste = [];
					waste.push(i);
					waste.push(findplane(unit_face_a,unit_face_b,unit_face_c, vertices));
					plane_face.push(waste);
				//if (i==4 || i==5) {console.log(plane_face[i][1])};
				}

				var ax=vertices[unit_face_a][0], ay=vertices[unit_face_a][1], az=vertices[unit_face_a][2];
				var bx=vertices[unit_face_b][0], by=vertices[unit_face_b][1], bz=vertices[unit_face_b][2];
				var cx=vertices[unit_face_c][0], cy=vertices[unit_face_c][1], cz=vertices[unit_face_c][2];
				
				//det, t, alpha, beta
				var det=(ax-cx)*(bz-cz)*(eye_point[1])+(ax-cx)*(by-cy)-(bx-cx)*(az-cz)*(eye_point[1])-(bx-cx)*(ay-cy)+(az-cz)*(by-cy)*(eye_point[0])-(bz-cz)*(ay-cy)*(eye_point[0]);

				if (det!=0){
				var t=((ax-cx)*(bz-cz)*cy-(ax-cx)*(by-cy)*cz-(bx-cx)*(az-cz)*cy+(bx-cx)*(ay-cy)*cz+(az-cz)*(by-cy)*cx-(bz-cz)*(ay-cy)*cx)/det;
				var inter_section=[eye_point[0]*t,eye_point[1]*t,-t];
				var alpha=(cx*(cz-bz)*(eye_point[1])-cx*(by-cy)+(bx-cx)*cz*(eye_point[1])+(bx-cx)*cy-cz*(by-cy)*eye_point[0]+(bz-cz)*cy*(eye_point[0]))/det;
				var beta=((cx-ax)*eye_point[1]*cz-(ax-cx)*(cy)+cx*(az-cz)*eye_point[1]+cx*(ay-cy)-(az-cz)*cy*eye_point[0]+cz*(ay-cy)*eye_point[0])/det;}
				else{
				var t=((ax-cx)*(bz-cz)*cy-(ax-cx)*(by-cy)*cz-(bx-cx)*(az-cz)*cy+(bx-cx)*(ay-cy)*cz+(az-cz)*(by-cy)*cx-(bz-cz)*(ay-cy)*cx);
				var inter_section=[eye_point[0]*t,eye_point[1]*t,-t];
				var alpha=(cx*(cz-bz)*(eye_point[1])-cx*(by-cy)+(bx-cx)*cz*(eye_point[1])+(bx-cx)*cy-cz*(by-cy)*eye_point[0]+(bz-cz)*cy*(eye_point[0]));
				var beta=((cx-ax)*eye_point[1]*cz-(ax-cx)*(cy)+cx*(az-cz)*eye_point[1]+cx*(ay-cy)-(az-cz)*cy*eye_point[0]+cz*(ay-cy)*eye_point[0]);}

				if ((alpha>=0 ) && ( beta>=0 ) && (alpha+beta)<=1){
					for (var iii=0;iii<plane_face.length;iii++){
						if (i==plane_face[iii][0]){
							var n=plane_face[iii][1];
							var l_vector=[-eye_point[0]*t,5-eye_point[1]*t,t];
							var nor_l= Math.sqrt(l_vector[0]*l_vector[0]+l_vector[1]*l_vector[1]+l_vector[2]*l_vector[2]);
							if (nor_l!=0) nor_l=nor_l; else nor_l=1;
							var viewer=[-eye_point[0]*t,-eye_point[1]*t,-2+t];

							var N_I=n[0]*l_vector[0]/nor_l+n[1]*l_vector[1]/nor_l+n[2]*l_vector[2]/nor_l;
							if (N_I<0 ) N_I=-N_I; else N_I=N_I;
							//negation of incident light
							var reflected=[-l_vector[0]-2*n[0]*N_I,-l_vector[1]-2*n[1]*N_I,-l_vector[2]-2*n[2]*N_I];
							for (var jj=0;jj<gname_obj.length;jj++){
							    for (var jjj=0;jjj<arr1.length;jjj++){
									if (gname_obj[jj]==arr1[jjj][0] && unit_face[0]==jj){
								var red=1*((arr1[jjj])[1])[0]+1*((arr1[jjj])[2])[0]*N_I+((arr1[jjj])[3])[0]*Math.pow((reflected[0]*viewer[0]+reflected[1]*viewer[1]+reflected[2]*viewer[2]),0);
								var green=1*((arr1[jjj])[1])[1]+1*((arr1[jjj])[2])[1]*N_I+((arr1[jjj])[3])[1]*Math.pow((reflected[0]*viewer[0]+reflected[1]*viewer[1]+reflected[2]*viewer[2]),0);
								var blue=1*((arr1[jjj])[1])[2]+1*((arr1[jjj])[2])[2]*N_I+((arr1[jjj])[3])[2]*Math.pow((reflected[0]*viewer[0]+reflected[1]*viewer[1]+reflected[2]*viewer[2]),0);
							}}}
						}
					}
					//if (red>=0 && green>=0 && blue>=0 && red<=1 && green<=1 && blue<=1){
					//var abc=[];abc.push(parseInt(red*255));abc.push(parseInt(green*255));abc.push(parseInt(blue*255));
					//console.log(abc);
					setPixel(imageData, x_cor+100, y_cor+100, parseInt(red*255), parseInt(green*255), parseInt(blue*255));
					//}
				}
			}
		}
	}
		// update the canvas
		ctx.putImageData( imageData, 0, 0 );
	//var plane= findplane(unit_face_a,unit_face_b,unit_face_c);
}

objjs.loadObj = function loadObj(fileName) {
    var request = new XMLHttpRequest();
    var arr;
    request.open("GET", fileName+'.obj');
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            arr = objjs.handleLoadedObject(request.responseText);
            rendering(arr);
        }
    }
    request.send();
}

objjs.loadMtl = function loadMtl(fileName) {
    var request = new XMLHttpRequest();
    request.open("GET", fileName+'.mtl');
    request.onreadystatechange = function () {
        if (request.readyState == 4){ 
	    objjs.loadObj('cube2');
            objjs.handleLoadedMtl(request.responseText);
        }
    }
    request.send();
}

function webGLStart() {
	var canvas = document.getElementById("webGL");
	var t0 = performance.now();
	objjs.loadMtl('cube2');
	var t1 = performance.now();
	console.log("The program took " + (t1 - t0) + " milliseconds.");

    //drawScene();

}
