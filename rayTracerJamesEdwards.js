

var canvas;

var pointsArray = [];
var cubeNormalsArray = []; //each element is [ vec4normal, vec4point ]
var minMaxArray = []; //each element is [ minx, maxx, miny, maxy, minz, maxz ]
var colorsArray = [];
var reflectiveArray = [];
var refractiveArray = []; //water = 1.33, glass 1.5, else false;
var spheresArray = [];
var vertices = [];
var objColor;
var numObjects = 0;


function makeShapes()
{
    objColor = vec4(1,0,0,1);
    generateCube( 0, 2,-1); //start of J
    generateCube( 1, 2,-1);
    generateCube( 2, 2,-1);
    generateCube( 1, 1,-1);
    generateCube( 1, 0,-1);
    generateCube( 0,-1,-1);
    generateCube( 1,-1,-1);

    generateCube( 3,-2, 0); //start of E
    generateCube( 4,-2, 0);
    generateCube( 5,-2, 0);
    generateCube( 3,-3, 0);
    generateCube( 4,-3.5, 0);
    generateCube( 3,-4, 0);
    generateCube( 3,-5, 0);
    generateCube( 4,-5, 0);
    generateCube( 5,-5, 0);

    generateSphere( 4, 4,-2, 2, vec4(0,1,0,1));

    //"WATER"
    //generateQuad( 4, 4, 3, 2, 2, 1, vec4(0,0,0.5,1), false, 1.53 );

    //MIRROR
    generateQuad( 2, 0,-5, 10, 10, 0.5, vec4(1,1,1,1), true, false);
}

function generateCube(x, y, z) {
    generateQuad(x,y,z,1,1,1,objColor,false,false);
}

function generateQuad(x, y, z, xlen, ylen, zlen, color, isReflective, isRefractive) {
    // makes a rectangular prism with that point at the center
    // xlen, ylen, and zlen are specified
    // adds reflectivity to the array
    vertices = [];
    vertices.push( vec4( x-xlen/2, y-ylen/2, z+zlen/2 ));
    vertices.push( vec4( x-xlen/2, y+ylen/2, z+zlen/2 ));
    vertices.push( vec4( x+xlen/2, y+ylen/2, z+zlen/2 ));
    vertices.push( vec4( x+xlen/2, y-ylen/2, z+zlen/2 ));
    vertices.push( vec4( x-xlen/2, y-ylen/2, z-zlen/2 ));
    vertices.push( vec4( x-xlen/2, y+ylen/2, z-zlen/2 ));
    vertices.push( vec4( x+xlen/2, y+ylen/2, z-zlen/2 ));
    vertices.push( vec4( x+xlen/2, y-ylen/2, z-zlen/2 ));
    quad( 1, 0, 3, 2, color, isReflective, isRefractive);
    quad( 2, 3, 7, 6, color, false, isRefractive);
    quad( 3, 0, 4, 7, color, false, isRefractive);
    quad( 6, 5, 1, 2, color, false, isRefractive);
    quad( 4, 5, 6, 7, color, false, isRefractive);
    quad( 5, 4, 0, 1, color, false, isRefractive);
    vertices=[];
}

function quad(a, b, c, d, color, isReflective, isRefractive) {
    var diff1 = subtract(vertices[b],vertices[a]);
    var diff2 = subtract(vertices[a],vertices[c]);
    var norm = vec4(normalize(cross(diff2, diff1),false),0.0);
    for (var i=0;i<norm.length;i++){
	if (norm[i] === -0) {
            norm[i] = 0;
	}
    }
    cubeNormalsArray.push( [norm, vertices[b]] );
    minMaxArray.push( [Math.min(vertices[a][0],
		    	        vertices[b][0],
			        vertices[c][0],
			        vertices[d][0]),
    		       Math.max(vertices[a][0],
		    	        vertices[b][0],
			        vertices[c][0],
			        vertices[d][0]),
                       Math.min(vertices[a][1],
		    	        vertices[b][1],
			        vertices[c][1],
			        vertices[d][1]),
                       Math.max(vertices[a][1],
		    	        vertices[b][1],
			        vertices[c][1],
			        vertices[d][1]),
                       Math.min(vertices[a][2],
		    	        vertices[b][2],
			        vertices[c][2],
			        vertices[d][2]),
                       Math.max(vertices[a][2],
		    	        vertices[b][2],
			        vertices[c][2],
			        vertices[d][2]) ]);
    colorsArray.push(color);
    reflectiveArray.push(isReflective);
    refractiveArray.push(isRefractive);
    numObjects++;
}

function generateSphere(x,y,z,r,color) {
    spheresArray.push([ vec4(x,y,z,1),
		        r,
			color ]);
    refractiveArray.push(false);
    numObjects++;
}

function findIntersectionTime(rs, rv) {
    var min_i = 1000;
    var min_t = 1000;
    var min_p = 1000;

    /*
    for(var i=0; i<cubeNormalsArray.length; i++) {
        var subt = subtract(cubeNormalsArray[i][1],rs);
	var t = dot(cubeNormalsArray[i][0],subt)/dot(cubeNormalsArray[i][0],rv);
	var p = add(rs, scale(t,rv)); //point of potential intersection
	if (p[0] >= minMaxArray[i][0]-0.0001 && p[0] <= minMaxArray[i][1]+0.0001 &&
            p[1] >= minMaxArray[i][2]-0.0001 && p[1] <= minMaxArray[i][3]+0.0001 &&
            p[2] >= minMaxArray[i][4]-0.0001 && p[2] <= minMaxArray[i][5]+0.0001 ) {
            //inside actual object plane
	    if (t < min_t && t > 0) {
		//intersects first and actually intersects
	        min_t = t;
		min_i = i;
		min_p = p;
	    }
	}
    }
    for(var j = 0; j<spheresArray.length; j++) {
	var a = dot(rv,rv);
	var eyeToCenter = subtract(rs,spheresArray[j][0]);
	var b = 2 * dot(rv, eyeToCenter);
	var c = dot(eyeToCenter,eyeToCenter) - (spheresArray[j][1] * spheresArray[j][1]);
	var disc = b*b - 4*a*c;
        var t = (-1*b - Math.sqrt(disc))/(2*a);
	if (disc > 0 && t < min_t) {
	    var p = add(rs, scale(t,rv));
	    min_t = t;
	    min_i = -1*(j+1);
	    min_p = p;
	}
    }
    */
    for(var i = 0; i<numObjects; i++) {
	if (i < cubeNormalsArray.length) {
            var subt = subtract(cubeNormalsArray[i][1],rs);
	    var t = dot(cubeNormalsArray[i][0],subt)/dot(cubeNormalsArray[i][0],rv);
	    var p = add(rs, scale(t,rv)); //point of potential intersection
	    if (p[0] >= minMaxArray[i][0]-0.0001 && p[0] <= minMaxArray[i][1]+0.0001 &&
                p[1] >= minMaxArray[i][2]-0.0001 && p[1] <= minMaxArray[i][3]+0.0001 &&
                p[2] >= minMaxArray[i][4]-0.0001 && p[2] <= minMaxArray[i][5]+0.0001 ) {
                //inside actual object plane
	        if (t < min_t && t > 0) {
		    //intersects first and actually intersects
	            min_t = t;
		    min_i = i;
		    min_p = p;
	        }
	    }
	} else if (i < cubeNormalsArray.length + spheresArray.length) {
	    var a = dot(rv,rv);
	    var eyeToCenter = subtract(rs,spheresArray[i - cubeNormalsArray.length][0]);
	    var b = 2 * dot(rv, eyeToCenter);
	    var c = dot(eyeToCenter,eyeToCenter) - 
		    (spheresArray[i - cubeNormalsArray.length][1] * 
		     spheresArray[i - cubeNormalsArray.length][1]);
	    var disc = b*b - 4*a*c;
            var t = (-1*b - Math.sqrt(disc))/(2*a);
	    if (disc > 0 && t < min_t) {
	        var p = add(rs, scale(t,rv));
	        min_t = t;
	        min_i = i;
	        min_p = p;
	    }
	}
    }
    return [min_i, min_t, min_p];
}

function findReflectionVector(norm, rv) {
    //var rvnorm = normalize(rv, true);
    //var normnorm = normalize(cubeNormalsArray[i][0], true);
    //return add(scale(-2*dot(rvnorm,normnorm), normnorm), rvnorm);
    return add(scale(-2*dot(rv,norm), norm), rv);
}

function findRefractionVector(ret, rv) {
    //ret = [ index of surface of intersection, time of intersect, pt of intersect ]
    var norm = cubeNormalsArray[ret[0]][0];
    var n1 = (norm[0] > 0 || norm[1] > 0 ||  norm[2] > 0) ? 1.0 : refractiveArray[ret[0]];
    var n2 = (n1 < 1.1) ? refractiveArray[ret[0]] : 1.0;
    var n = n1/n2;
    if (n > 1) {
	var c1 = dot(rv,norm); 
	n = n2/n1;
    }
    else {
        var c1 = -1 * dot(rv,norm);
    }
    var c2 = Math.sqrt(1 - n*n*(1 - c1*c1));
    var r = add(scale(n, rv), scale(n*c1-c2, norm));
    return r;
}

function sphereNormal(i, pt) {
    var c = spheresArray[i][0];
    return normalize(subtract(pt,c),true);
}

function getColor(ray, start, depth) {
    //if ray intersects anything, make it that color
    if (depth > 1) {
	//console.log(depth + "  at " + start);
    }
    var ret = findIntersectionTime(start, ray);
    //ret = [ index of surface of intersection, time of intersect, pt of intersect ]
    if (ret[1] < 1000 && ret[0] < cubeNormalsArray.length) {
	//intersects with a cube
	if (reflectiveArray[ret[0]]) {
	    //take the normal of the surface and the ray and find reflection vector
	    //follow that and get the color of that surface (or gray)
	    var v = normalize(findReflectionVector(cubeNormalsArray[ret[0]][0], ray),true);
	    var r = getColor(v, ret[2], depth+1);
	    //if (r[1] === 102 && r[0] === 102) {
		//console.log(depth);
	    //}
	    if (r[3] === 0) {
		return vec4(127,127,127,255);
	    } else {
	        return r;
	    }
	//} else if (refractiveArray[ret[0]] && depth < 2) {
            //console.log("refractive");
	    //var v = findRefractionVector(ret, ray);
	    //var r = getColor(normalize(v, true), ret[2], depth+1);
	    //return r;
	} else {

	return setLightingColor(cubeNormalsArray[ret[0]][0], 
			        ret[2], 
				colorsArray[ret[0]]);
	}

    } else if (ret[1] < 1000 && ret[0] < cubeNormalsArray.length + spheresArray.length) {
	//intersects with a sphere
	var realIndex = ret[0] - cubeNormalsArray.length;
        return setLightingColor(sphereNormal(realIndex, ret[2]), 
			        ret[2], 
			        spheresArray[realIndex][2]);

    } else {
	return vec4(0,0,0,0);
    }
}

function setLightingColor(norm, pt, baseColor) {
    //the normal, the point of intersection, and the object color are passed in
    var ambientPart = mult(mult(iAmbient, kAmbient),baseColor);
    var diffusePart = vec4(0,0,0,1);
    var specularPart = vec4(0,0,0,1);
    for (var i=0; i<lightPositions.length; i++) {
	var rayToLight = normalize(subtract(lightPositions[i], pt),true);
	var currentDiffuseScale = scale(Math.max(0.0,dot(rayToLight,norm)),kDiffuse);
	var currentDiffuse = mult(currentDiffuseScale, iDiffuse);
	diffusePart = add(diffusePart,currentDiffuse);
	var reflectionVec = normalize(findReflectionVector(norm, rayToLight),true);
	var rayToEye = normalize(subtract(pt,eye));
	var currentSpecScale = scale(Math.pow(dot(reflectionVec,rayToEye),kShininess), kSpecular);
	var currentSpecular = mult(currentSpecScale, iSpecular);
	specularPart = add(specularPart,currentSpecular);
    }
    var c = add(ambientPart,add(diffusePart,specularPart));
    for(var j=0; j<3; j++){
        if(c[j] < 0) {
	    c[j] = 0;
	} else if (c[j] > 1) {
	    c[j] = 1;
	}
	c[j] = Math.floor(c[j] * 255);
    }
    c[3] = 255;
    return c;
}

//TOP LEFT CUBE IS 0  2 -1
//BOT RIGHT     IS 5 -5 -1

var lightPositions = [vec4(-1.0,-3.0, 6.0, 1.0),
    		      vec4( 3.0,-4.0, 2.0, 1.0),
    		     ];
var iAmbient =  vec4( 1.0, 1.0, 1.0, 1.0 );
var iDiffuse =  vec4( 1.0, 1.0, 1.0, 1.0 );
var iSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var kAmbient = vec4( 0.4, 0.4, 0.4, 1.0 );
var kDiffuse = vec4( 0.8, 0.6, 0.5, 1.0 );
var kSpecular = vec4( 0.7, 0.7, 0.7, 1.0 );
var kShininess =  50.0;

var context, contextData;

var eye = vec4(12.0, 6.0, 15.0, 1);
var at = vec4(2.0, 0.0, 0.0, 1);
var up = vec4(0.0, 1.0, 0.0, 0);
var n, u, v;
var theta = 45 * Math.PI / 180; //angle of view
var dist =  eye[2] - 2; //distance of viewing plane from eye
var aspect; //canvas width/height
var width, height; //viewing plane width/height
var tl; //top left point on the viewing plane
    

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    context = canvas.getContext('2d');
    contextData = context.getImageData(0, 0, canvas.width, canvas.height);
    aspect = canvas.width/canvas.height;

    makeShapes();

    n = normalize(subtract(at,eye),true); //into-screen-pointing unit vector
    u = normalize(vec4(cross(up, n),0),true); //left-pointing unit vector
    v = normalize(vec4(cross(n, u),0),true); //up-pointing unit vector

    height = Math.tan(theta/2) * 2 * dist;
    width = height * aspect;
    center = add(eye, scale(dist,n));
    //console.log(width);
    //console.log(center);
    tl = add(add(center,scale(width/2,u)), scale(height/2,v));

    var currentIndex;
    var colorAtPoint;
    var currentXpoint, currentYpoint, currentRay;
    for(var j=0; j<canvas.height; j++) {
	currentYpoint = scale(-1*height*(j-0.5)/canvas.height,v);
	for(var i=0; i<canvas.width; i++) {
	    currentXpoint = scale(-1*width*(i+0.5)/canvas.width,u);
	    currentRay = subtract(add(tl,add(currentXpoint,currentYpoint)),eye);
	    colorAtPoint = getColor(currentRay,eye, 0); 
	    //if (colorAtPoint[1] === 127) {
	        //console.log(i);
	    //}
	    currentIndex = 4*(canvas.width * j + i); 
	    contextData.data[currentIndex] =   colorAtPoint[0];
	    contextData.data[currentIndex+1] = colorAtPoint[1];
	    contextData.data[currentIndex+2] = colorAtPoint[2];
	    contextData.data[currentIndex+3] = 255;
	}
	//console.log("finish row " + j);
    }
    console.log("finished setting colors");
    context.putImageData(contextData, 0, 0);
}
