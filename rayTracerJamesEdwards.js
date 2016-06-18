

var canvas;

var pointsArray = [];
var normalsArray = []; //each element is [ vec4normal, vec4point ]
var minMaxArray = []; //each element is [ minx, maxx, miny, maxy, minz, maxz ]
var colorsArray = [];
var reflectiveArray = [];
var vertices = [];

function quad(a, b, c, d) {
    var diff1 = subtract(vertices[a],vertices[b]);
    var diff2 = subtract(vertices[a],vertices[c]);
    var norm = vec4(normalize(cross(diff2, diff1),false),0.0);
    normalsArray.push( [norm, vertices[b]] );
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
}

function draw()
{
    var color = vec3(255,0,0,255);
    generateCube(-8, 8,-1, color);
    generateCube(-7, 8,-1, color);
    generateCube(-6, 8,-1, color);
    generateCube(-7, 7,-1, color);
    generateCube(-7, 6,-1, color);
    generateCube(-8, 5,-1, color);
    generateCube(-7, 5,-1, color);

    generateCube(-5.5, 4,-1, color);
    generateCube(-4.5, 4,-1, color);
    generateCube(-3.5, 4,-1, color);
    generateCube(-5.5, 3,-1, color);
    generateCube(-3.5, 3,-1, color);
    generateCube(-5.5, 2,-1, color);
    generateCube(-4.5, 2,-1, color);
    generateCube(-3.5, 2,-1, color);
    generateCube(-5.5, 1,-1, color);
    generateCube(-3.5, 1,-1, color);
    
    generateCube(-2, 1,-1, color);
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

    generateCube( 3,-2,-1, color);
    generateCube( 4,-2,-1, color);
    generateCube( 5,-2,-1, color);
    generateCube( 3,-3,-1, color);
    generateCube( 4,-3.5,-1, color);
    generateCube( 3,-4,-1, color);
    generateCube( 3,-5,-1, color);
    generateCube( 4,-5,-1, color);
    generateCube( 5,-5,-1, color);

    generateCube( 6,-6,-1, color);
    generateCube( 7,-6,-1, color);
    generateCube( 8,-6,-1, color);
    generateCube( 6,-7,-1, color);
    generateCube( 7,-7.5,-1, color);
    generateCube( 8,-8,-1, color);
    generateCube( 6,-9,-1, color);
    generateCube( 7,-9,-1, color);
    generateCube( 8,-9,-1, color);
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
    //quad( 2, 3, 7, 6 );
    //quad( 3, 0, 4, 7 );
    //quad( 6, 5, 1, 2 );
    //quad( 4, 5, 6, 7 );
    //quad( 5, 4, 0, 1 );
    vertices=[];
    for(var i=0; i<6; i++) {
        colorsArray.push(color);
    }
}

function findIntersectionTime(rs, rv) {
    var min_i = 1000;
    var min_t = 1000;

    for(var i=0; i<normalsArray.length; i++) {
        var subt = subtract(normalsArray[i][1],rs);
	var t = dot(normalsArray[i][0],subt)/dot(normalsArray[i][0],rv);
	var p = add(rs, scale(t,rv)); //point of potential intersection
	//console.log(p);
	if (p[0] >= minMaxArray[i][0]-0.0001 && p[0] <= minMaxArray[i][1]+0.0001 &&
            p[1] >= minMaxArray[i][2]-0.0001 && p[1] <= minMaxArray[i][3]+0.0001 &&
            p[2] >= minMaxArray[i][4]-0.0001 && p[2] <= minMaxArray[i][5]+0.0001 ) {
            //inside actual object plane
	    if (t < min_t && t > 0) {
		//intersects first and actually intersects
		//console.log(i);
	        min_t = t;
		min_i = i;
		//alert(rs + " hit " + i);
	    } else {
		//alert(rv);
	    }
	} else {
	    //alert(rs + " miss " + i);
	}
    }
    return [min_i, min_t];
}

function findReflectionVector(i, rv) {
    var rvnorm = normalize(rv, true);
    var normnorm = normalize(normalsArray[i][0], true);
    return add(scale(-2*dot(rvnorm,normnorm), normnorm), rvnorm);
}

function getColor(ray) {
    //takes ray from eye to point
    //if ray intersects anything, make it that color
    var ret = findIntersectionTime(eye, ray);
    if (ret[1] < 1000) {
	return colorsArray[ret[0]];
    } else {
	return vec3(0,255,0,255);
    }
}

var near = -10;
var far = 10;
var radius = 1.0;
var theta  = 30.0 * Math.PI/180.0;
var phi    = 30.0 * Math.PI/180.0;
var dr = 15.0 * Math.PI/180.0;

var left = -10.0;
var right = 10.0;
var ytop = 10.0;
var bottom = -10.0;

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);
    
var lightPosition = vec4(-3.0, 3.0, 3.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

var context, contextData;
var ambientColor, diffuseColor, specularColor;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var eye = vec4(0.0, 0.0, 20.0, 1);
var at = vec4(0.0, 0.0, 0.0, 1);
var up = vec4(0.0, 1.0, 0.0, 0);
var n, u, v;
var theta = 45 * Math.PI / 180; //angle of view
var dist =  18; //distance of viewing plane from eye
var aspect; //canvas width/height
var width, height; //viewing plane width/height
var tl; //top left point on the viewing plane
    

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    context = canvas.getContext('2d');
    contextData = context.getImageData(0, 0, canvas.width, canvas.height);
    aspect = canvas.width/canvas.height;

    draw();
    //console.log(normalsArray.length);

    n = normalize(subtract(at,eye),true); //into-screen-pointing unit vector
    u = normalize(vec4(cross(up, n),0),true); //left-pointing unit vector
    v = normalize(vec4(cross(n, u),0),true); //up-pointing unit vector

    height = Math.tan(theta/2) * 2 * dist;
    console.log(height);
    width = height * aspect;
    center = add(eye, scale(dist,n));
    tl = add(add(center,scale(width/2,u)), scale(height/2,v));
    console.log(center);
    console.log(tl);

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
	//console.log("finished row " + currentRay);
    }
    context.putImageData(contextData, 0, 0);
}
