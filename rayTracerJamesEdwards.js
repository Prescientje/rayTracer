

var canvas;
var gl;

var numTimesToSubdivide = 5;
 
var index = 0;

var pointsArray = [];
var normalsArray = []; //each element is [ vec4normal, vec4point ]
var minMaxArray = []; //each element is [ minx, maxx, miny, maxy, minz, maxz ]
var colorsArray = [];
var reflectiveArray = [];

var vertices = [];


function quad(a, b, c, d) {
     pointsArray.push(vertices[a]); 
     //colorsArray.push(vertexColors[a]); 
     normalsArray.push(vertices[a]);
	 
     pointsArray.push(vertices[b]); 
     //colorsArray.push(vertexColors[a]); 
     normalsArray.push(vertices[b]);
	 
     pointsArray.push(vertices[c]); 
     //colorsArray.push(vertexColors[a]);    
     normalsArray.push(vertices[c]);
	 
     pointsArray.push(vertices[a]); 
     //colorsArray.push(vertexColors[a]); 
     normalsArray.push(vertices[a]);

     pointsArray.push(vertices[c]); 
     //colorsArray.push(vertexColors[a]); 
     normalsArray.push(vertices[c]);

     pointsArray.push(vertices[d]); 
     //colorsArray.push(vertexColors[a]); 
     normalsArray.push(vertices[d]);

     index += 6;


    var diff1 = subtract(vertices[a],vertices[b]);
    var diff2 = subtract(vertices[a],vertices[c]);
    var norm = vec4(cross(diff2, diff1),0.0);
    //normalsArray.push( [norm, vertices[b]] );
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

// Each face determines two triangles

function draw()
{
    generateCube(-8, 8,-1);
    generateCube(-7, 8,-1);
    generateCube(-6, 8,-1);
    generateCube(-7, 7,-1);
    generateCube(-7, 6,-1);
    generateCube(-8, 5,-1);
    generateCube(-7, 5,-1);

    generateCube(-5, 4,-1);
    generateCube(-4, 4,-1);
    generateCube(-3, 4,-1);
    generateCube(-5, 3,-1);
    generateCube(-3, 3,-1);
    generateCube(-5, 2,-1);
    generateCube(-4, 2,-1);
    generateCube(-3, 2,-1);
    generateCube(-5, 1,-1);
    generateCube(-3, 1,-1);
    
    generateCube(-2, 1,-1);
    generateCube(-1, 0.5,-1);
    //generateCube( 0, 1,-1);
    generateCube( 1, 0.5,-1);
    generateCube( 2, 1,-1);
    generateCube(-2, 0,-1);
    generateCube( 0, 0,-1);
    generateCube( 2, 0,-1);
    generateCube(-2,-1,-1);
    generateCube( 0,-1,-1);
    generateCube( 2,-1,-1);

    generateCube( 3,-2,-1);
    generateCube( 4,-2,-1);
    generateCube( 5,-2,-1);
    generateCube( 3,-3,-1);
    generateCube( 4,-3.5,-1);
    generateCube( 3,-4,-1);
    generateCube( 3,-5,-1);
    generateCube( 4,-5,-1);
    generateCube( 5,-5,-1);

    generateCube( 6,-6,-1);
    generateCube( 7,-6,-1);
    generateCube( 8,-6,-1);
    generateCube( 6,-7,-1);
    generateCube( 7,-7.5,-1);
    generateCube( 8,-8,-1);
    generateCube( 6,-9,-1);
    generateCube( 7,-9,-1);
    generateCube( 8,-9,-1);


}

function generateCube(x, y, z) {
    // makes a unit cube with that point at the center
    // adds the points to the verticesList
    vertices.push( vec4( x-0.5, y-0.5, z+0.5));
    vertices.push( vec4( x-0.5, y+0.5, z+0.5));
    vertices.push( vec4( x+0.5, y+0.5, z+0.5));
    vertices.push( vec4( x+0.5, y-0.5, z+0.5));
    vertices.push( vec4( x-0.5, y-0.5, z-0.5));
    vertices.push( vec4( x-0.5, y+0.5, z-0.5));
    vertices.push( vec4( x+0.5, y+0.5, z-0.5));
    vertices.push( vec4( x+0.5, y-0.5, z-0.5));
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
    vertices=[];
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
var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);
    
function triangle(a, b, c) {

     normalsArray.push(a);
     normalsArray.push(b);
     normalsArray.push(c);
     
     pointsArray.push(a);
     pointsArray.push(b);      
     pointsArray.push(c);

     texCoordsArray.push(a);
     texCoordsArray.push(b);
     texCoordsArray.push(c);

     index += 3;
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    context = canvas.getContext('2d');
    contextData = context.getImageData(0, 0, canvas.width, canvas.height);
    var current;
    for(var j=0; j<canvas.height; j++) {
	for(var i=0; i<canvas.width; i++) {
	    current = 4*(canvas.width * i + j); 
	    contextData.data[current] = 0;
	    contextData.data[current+1] = 0;
	    contextData.data[current+2] = 255;
	    contextData.data[current+3] = 255;
	}
    }
    context.putImageData(contextData, 0, 0);
}
