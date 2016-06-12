

var canvas;
var gl;

var numVertices  = 36;

var pointsArray = [];
var colorsArray = [];
var texCoordsArray = [];

var vertices = [
        vec4( -1, -1,  0, 1.0 ),
        vec4( -1,  0,  0, 1.0 ),
        vec4( 0,  0,  0, 1.0 ),
        vec4( 0, -1,  0, 1.0 ),
        vec4( -1, -1, -1, 1.0 ),
        vec4( -1,  0, -1, 1.0 ),
        vec4( 0,  0, -1, 1.0 ),
        vec4( 0, -1, -1, 1.0 ),

        //vec4( 0,  0,  1, 1.0 ),
        //vec4( 0,  1,  1, 1.0 ),
        //vec4( 1,  1,  1, 1.0 ),
        //vec4( 1,  0,  1, 1.0 ),
        //vec4( 0,  0,  0, 1.0 ),
        //vec4( 0,  1,  0, 1.0 ),
        //vec4( 1,  1,  0, 1.0 ),
        //vec4( 1,  0,  0, 1.0 )
	
        vec4( 0,  0,  1, 1.0 ),
        vec4( 0,  0,  0, 1.0 ),
        vec4( 1,  0,  0, 1.0 ),
        vec4( 1,  0,  1, 1.0 ),
        vec4( 0.5,  0.8,  0.5, 1.0 ),
        //vec4( 1,  1,  1, 1.0 ),
        //vec4( 1,  1,  1, 1.0 ),
        //vec4( 1,  1,  1, 1.0 ),
    ];

var vertexColors = [
        vec4( 0.0, 0.0, 1.0, 1.0 ),  // black
        vec4( 0.0, 0.0, 1.0, 1.0 ),  // red
        vec4( 0.0, 0.0, 1.0, 1.0 ),  // yellow
        vec4( 0.0, 0.0, 1.0, 1.0 ),  // green
        vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
        vec4( 0.0, 0.0, 1.0, 1.0 ),  // magenta
        vec4( 0.0, 0.0, 1.0, 1.0 ),  // cyan
        vec4( 0.0, 0.0, 1.0, 1.0 ), // white
    ];

var near = -3;
var far = 3;
var radius = 1.0;
var theta  = 1.0;
var phi    = 1.0;
var dr = 5.0 * Math.PI/180.0;

var left = -2.0;
var right = 2.0;
var ytop = 2.0;
var bottom = -2.0;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var eye;

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

// quad uses first index to set color for face

function quad(a, b, c, d) {
     pointsArray.push(vertices[a]); 
     colorsArray.push(vertexColors[a]); 
     pointsArray.push(vertices[b]); 
     colorsArray.push(vertexColors[a]); 
	 
     pointsArray.push(vertices[b]); 
     colorsArray.push(vertexColors[a]); 
     pointsArray.push(vertices[c]); 
     colorsArray.push(vertexColors[a]);    
	 
     pointsArray.push(vertices[c]); 
     colorsArray.push(vertexColors[a]); 
     pointsArray.push(vertices[d]); 
     colorsArray.push(vertexColors[a]); 

     pointsArray.push(vertices[d]); 
     colorsArray.push(vertexColors[a]); 
     pointsArray.push(vertices[a]); 
     colorsArray.push(vertexColors[a]); 
}

// Each face determines two triangles

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    colorCube();

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

// buttons to change viewing parameters

    document.getElementById("Button1").onclick = function(){near  *= 1.1; far *= 1.1;};
    document.getElementById("Button2").onclick = function(){near *= 0.9; far *= 0.9;};
    document.getElementById("Button3").onclick = function(){radius *= 1.1;};
    document.getElementById("Button4").onclick = function(){radius *= 0.9;};
    document.getElementById("Button5").onclick = function(){theta += dr;};
    document.getElementById("Button6").onclick = function(){theta -= dr;};
    document.getElementById("Button7").onclick = function(){phi += dr;};
    document.getElementById("Button8").onclick = function(){phi -= dr;};
       
    render();
}


var render = function() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            
    eye = vec3(radius*Math.sin(theta)*Math.cos(phi), 
	       radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    modelViewMatrix = lookAt(eye, at , up); 
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
       
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
            
    gl.drawArrays( gl.LINES, 0, numVertices );
    requestAnimFrame(render);
    }
