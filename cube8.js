

var canvas;
var gl;

var pointsArray = [];
var colorsArray = [];
var texCoordsArray = [];

var vertices = [
        vec4( -3, -3,  0, 1.0 ),
        vec4( -3,  0,  0, 1.0 ),
        vec4( 0,  0,  0, 1.0 ),
        vec4( 0, -3,  0, 1.0 ),
        vec4( -3, -3, -3, 1.0 ),
        vec4( -3,  0, -3, 1.0 ),
        vec4( 0,  0, -3, 1.0 ),
        vec4( 0, -3, -3, 1.0 ),
    ];


var near = -7;
var far = 7;
var radius = 1.0;
var theta  = 1.0;
var phi    = 1.0;
var dr = 30.0 * Math.PI/180.0;

var left = -5.0;
var right = 5.0;
var ytop = 5.0;
var bottom = -5.0;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var eye;

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

// quad uses first index to set color for face

function quad(a, b, c, d) {
     pointsArray.push(vertices[a]); 
     colorsArray.push(vec4( 0.0, 0.0, 0.0, 1.0 ));   // black
     pointsArray.push(vertices[b]); 
     colorsArray.push(vec4( 0.0, 0.0, 0.0, 1.0 ));   // black
	 
     pointsArray.push(vertices[b]); 
     colorsArray.push(vec4( 0.0, 0.0, 0.0, 1.0 ));   // black
     pointsArray.push(vertices[c]); 
     colorsArray.push(vec4( 0.0, 0.0, 0.0, 1.0 ));   // black
	 
     pointsArray.push(vertices[c]); 
     colorsArray.push(vec4( 0.0, 0.0, 0.0, 1.0 ));   // black
     pointsArray.push(vertices[d]); 
     colorsArray.push(vec4( 0.0, 0.0, 0.0, 1.0 ));   // black

     pointsArray.push(vertices[d]); 
     colorsArray.push(vec4( 0.0, 0.0, 0.0, 1.0 ));   // black
     pointsArray.push(vertices[a]); 
     colorsArray.push(vec4( 0.0, 0.0, 0.0, 1.0 ));   // black
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

function findIntersectionTime(p1, p2, p3, rs, rv) {
    
    var diff1 = subtract(p1,p2);
    var diff2 = subtract(p1,p3);
    var norm = vec4(cross(diff1, diff2),0.0);
    var subt = subtract(p1,rs);
    var t = dot(norm,subt)/dot(norm,rv);
    return t;
}

function traceRays() {

    var rs_new;
    var rs = vec4(-3.0,-3.0,-1.0, 1.0); //ray position
    var rv = vec4( 1.0, 0.2, 0.0, 0.0); //ray velocity
    var rc = 5; //ray "segment count"
    var step = 25;
    var hasIntersected = 10;

    
    var t = findIntersectionTime(vertices[2],vertices[3],vertices[6],rs,rv);
    for (var i=0; i<step; i++) {
	rs_new = add(rs, scale(rc/step,rv));
	pointsArray.push(rs);
	pointsArray.push(rs_new);
	if (i*rc/step<t) {
	    colorsArray.push(vec4(0,0,0,1));
	    colorsArray.push(vec4(0,0,0,1));
	} else {
	    colorsArray.push(vec4(1,0,0,1));
	    colorsArray.push(vec4(1,0,0,1));
	}
        rs = rs_new;
    }

    /*
    var t = findIntersectionTime(vertices[2],vertices[3],vertices[6],rs,rv);
    var rend = add(rs, scale(t, rv));
    alert(rend);
    pointsArray.push(rs);
    pointsArray.push(rend);
    colorsArray.push(vec4(1,0,0,1));
    colorsArray.push(vec4(0,1,0,1));
    */







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
    traceRays();

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
    //document.getElementById("Button1").onclick = function(){near  *= 1.1; far *= 1.1;};
    //document.getElementById("Button2").onclick = function(){near *= 0.9; far *= 0.9;};
    //document.getElementById("Button3").onclick = function(){radius *= 1.1;};
    //document.getElementById("Button4").onclick = function(){radius *= 0.9;};
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
            
    gl.drawArrays( gl.LINES, 0, pointsArray.length );
    requestAnimFrame(render);
    }
