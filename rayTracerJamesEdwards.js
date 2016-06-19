

var canvas;

var pointsArray = [];
var cubeNormalsArray = []; //each element is [ vec4normal, vec4point ]
var minMaxArray = []; //each element is [ minx, maxx, miny, maxy, minz, maxz ]
var colorsArray = [];
var reflectiveArray = [];
var spheresArray = [];
var vertices = [];
var objColor;

function quad(a, b, c, d) {
    var diff1 = subtract(vertices[a],vertices[b]);
    var diff2 = subtract(vertices[a],vertices[c]);
    var norm = vec4(normalize(cross(diff2, diff1),false),0.0);
    cubeNormalsArray.push( [normalize(norm, true), vertices[b]] );
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
    //colorsArray.push(setLightingColor(norm, vertices[b], objColor));
    colorsArray.push(objColor);
}

function makeShapes()
{
    objColor = vec4(1,0,0,1);
    generateCube( 0, 2,-1, objColor); //start of J
    generateCube( 1, 2,-1, objColor);
    generateCube( 2, 2,-1, objColor);
    generateCube( 1, 1,-1, objColor);
    generateCube( 1, 0,-1, objColor);
    generateCube( 0,-1,-1, objColor);
    generateCube( 1,-1,-1, objColor);

    generateCube( 3,-2,-1, objColor); //start of E
    generateCube( 4,-2,-1, objColor);
    generateCube( 5,-2,-1, objColor);
    generateCube( 3,-3,-1, objColor);
    generateCube( 4,-3.5,-1, objColor);
    generateCube( 3,-4,-1, objColor);
    generateCube( 3,-5,-1, objColor);
    generateCube( 4,-5,-1, objColor);
    generateCube( 5,-5,-1, objColor);

    generateSphere( -2,-1,0,2, vec4(0,1,0,1));

    /*
    generateCube(-5.5, 4,-1, color); //start of A
    generateCube(-4.5, 4,-1, color);
    generateCube(-3.5, 4,-1, color);
    generateCube(-5.5, 3,-1, color);
    generateCube(-3.5, 3,-1, color);
    generateCube(-5.5, 2,-1, color);
    generateCube(-4.5, 2,-1, color);
    generateCube(-3.5, 2,-1, color);
    generateCube(-5.5, 1,-1, color);
    generateCube(-3.5, 1,-1, color);
    
    generateCube(-2, 1,-1, color); //start of M
    generateCube(-1, 0.5,-1, color);
    //generateCube( 0, 1,-1, color);
    generateCube( 1, 0.5,-1, color);
    generateCube( 2, 1,-1, color);
    generateCube(-2, 0,-1, color);
    generateCube( 0, 0,-1, color);
    generateCube( 2, 0,-1, color);
    generateCube(-2,-1,-1, color);
    generateCube( 0,-1,-1, color);
    generateCube( 2,-1,-1, color);

    generateCube( 6,-6,-1, color); //start of S
    generateCube( 7,-6,-1, color);
    generateCube( 8,-6,-1, color);
    generateCube( 6,-7,-1, color);
    generateCube( 7,-7.5,-1, color);
    generateCube( 8,-8,-1, color);
    generateCube( 6,-9,-1, color);
    generateCube( 7,-9,-1, color);
    generateCube( 8,-9,-1, color);
    */
}

function generateCube(x, y, z, color) {
    // makes a unit cube with that point at the center
    // adds the points to the verticesList
    vertices.push( vec4( x-0.5, y-0.5, z+0.5 ));
    vertices.push( vec4( x-0.5, y+0.5, z+0.5 ));
    vertices.push( vec4( x+0.5, y+0.5, z+0.5 ));
    vertices.push( vec4( x+0.5, y-0.5, z+0.5 ));
    vertices.push( vec4( x-0.5, y-0.5, z-0.5 ));
    vertices.push( vec4( x-0.5, y+0.5, z-0.5 ));
    vertices.push( vec4( x+0.5, y+0.5, z-0.5 ));
    vertices.push( vec4( x+0.5, y-0.5, z-0.5 ));
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
    vertices=[];
}

function generateSphere(x,y,z,r,color) {
    spheresArray.push([ vec4(x,y,z,1),
		        r,
			color ]);
}

function findIntersectionTime(rs, rv) {
    var min_i = 1000;
    var min_t = 1000;
    var min_p = 1000;

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
	var c = dot(eyeToCenter,eyeToCenter);
	var disc = b*b - 4*a*c;
        var t = (-1*b - disc)/(2*a);
	var p = add(rs, scale(t,rv));
	if (disc > 0 && t < min_t) {
	    min_t = t;
	    min_i = -1*(j+1);
	    min_p = p;
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

function sphereNormal(i, pt) {
    var c = spheresArray[i][0];
    return normalize(subtract(pt,c),true);
}

function getColor(ray) {
    //takes ray from eye to point
    //if ray intersects anything, make it that color
    var ret = findIntersectionTime(eye, ray);
    //ret = [ index of surface of intersection, time of intersect, pt of intersect ]
    if (ret[1] < 1000 && ret[0] > 0) {
	//intersects with a cube
	return setLightingColor(cubeNormalsArray[ret[0]][0], 
			        ret[2], 
				colorsArray[ret[0]]);
    } else if (ret[1] < 1000 && ret[0] < 0) {
	var realIndex = -1 * ret[0] + 1;
        return setLightingColor(sphereNormal(realIndex, ret[2]), 
			        ret[2], 
			        spheresArray[realIndex][2]);
    } else {
	return vec3(0,0,0,255);
    }
}

function setLightingColor(norm, pt, baseColor) {
    //the normal, the point of intersection, and the object color are passed in
    var ambientPart = mult(mult(iAmbient, kAmbient),baseColor);
    var diffusePart = vec4(0,0,0,1);
    var specularPart = vec4(0,0,0,1);
    for (var i=0; i<lightPositions.length; i++){
	var rayToLight = normalize(subtract(lightPositions[i], pt),true);
	var currentDiffuseScale = scale(Math.max(0.0,dot(rayToLight,norm)),kDiffuse);
	var currentDiffuse = mult(currentDiffuseScale, iDiffuse);
	var reflectionVec = normalize(findReflectionVector(norm, rayToLight),true);
	var rayToEye = normalize(subtract(pt,eye));
	var currentSpecScale = scale(Math.pow(dot(reflectionVec,rayToEye),kShininess), kSpecular);
	var currentSpecular = mult(currentSpecScale, iSpecular);
	diffusePart = add(diffusePart,currentDiffuse);
	specularPart = add(specularPart,currentSpecular);
	//console.log(currentDiffuse);

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

var eye = vec4(5.0, 5.0, 22.0, 1);
var at = vec4(0.0, 0.0, 0.0, 1);
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
    tl = add(add(center,scale(width/2,u)), scale(height/2,v));

    var currentIndex;
    var colorAtPoint;
    var currentXpoint, currentYpoint, currentRay;
    for(var j=0; j<canvas.height; j++) {
	currentYpoint = scale(-1*height*(j-0.5)/canvas.height,v);
	for(var i=0; i<canvas.width; i++) {
	    currentXpoint = scale(-1*width*(i+0.5)/canvas.width,u);
	    currentRay = subtract(add(tl,add(currentXpoint,currentYpoint)),eye);
	    colorAtPoint = getColor(currentRay); 
	    currentIndex = 4*(canvas.width * j + i); 
	    contextData.data[currentIndex] =   colorAtPoint[0];
	    contextData.data[currentIndex+1] = colorAtPoint[1];
	    contextData.data[currentIndex+2] = colorAtPoint[2];
	    contextData.data[currentIndex+3] = 255;
	}
    }
    console.log("finished setting colors");
    context.putImageData(contextData, 0, 0);
}
