

var canvas;
var gl;

var pointsArray = [];
var colorsArray = [];
var normalsArray = []; //each element is [ vec4normal, vec4point ]
var minMaxArray = []; //each element is [ minx, maxx, miny, maxy, minz, maxz ]
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

    var diff1 = subtract(vertices[a],vertices[b]);
    var diff2 = subtract(vertices[a],vertices[c]);
    var norm = vec4(cross(diff2, diff1),0.0);
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

function colorCube() {
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function findIntersectionTime(rs, rv) {
    /*
    p1, p2, p3, rs, rv
    var diff1 = subtract(p2,p1);
    var diff2 = subtract(p3,p1);
    var norm = vec4(cross(diff2, diff1),0.0);
    var subt = subtract(p1,rs);
    var t = dot(norm,subt)/dot(norm,rv);
    return t;
    */
    var min_i = 1000;
    var min_t = 1000;

    for(var i=0; i<normalsArray.length; i++) {
        var subt = subtract(normalsArray[i][1],rs);
	var t = dot(normalsArray[i][0],subt)/dot(normalsArray[i][0],rv);
	var p = add(rs, scale(t,rv)); //point of potential intersection
	if (p[0] >= minMaxArray[i][0] && p[0] <= minMaxArray[i][1] && 
            p[1] >= minMaxArray[i][2] && p[1] <= minMaxArray[i][3] &&
            p[2] >= minMaxArray[i][4] && p[2] <= minMaxArray[i][5]) {
            //inside actual object plane
	    if (t < min_t && t > 0) {
		//intersects first and actually intersects
	        min_t = t;
		min_i = i;
	    }
	}
    }
    return [min_i, min_t];
}

function findReflectionVector(i, rv) {
    /*
    p1, p2, p3, rv
    var diff1 = subtract(p2,p1);
    var diff2 = subtract(p3,p2);
    var norm = vec4(cross(diff1, diff2), 0.0);
    var rvnorm = normalize(rv, true);
    var normnorm = normalize(norm, true);
    return scale(-1,subtract(scale(2*dot(rvnorm,normnorm), normnorm), rvnorm));
    */
    var rvnorm = normalize(rv, true);
    var normnorm = normalize(normalsArray[i][0], true);
    return scale(-1,subtract(scale(2*dot(rvnorm,normnorm), normnorm), rvnorm));
}

function traceRays(rs) {

    var rs_new;
    //var rs = vec4(-3.0,-3.0,-1.0, 1.0); //ray position
    var rv = vec4( 1.0, 0.2, 0.1, 0.0); //ray velocity
    var rc = 5; //ray "segment count"
    var step = 25;
    var hasIntersected = 10;

    
    /*
    var t = findIntersectionTime(vertices[2],vertices[3],vertices[6],rs,rv);
    var p = add(rs, scale(t,rv));
    var rv_new = findReflectionVector(vertices[2],vertices[3],vertices[6],rv);
    var rs_end = add(p, scale(t,rv_new));
    */
    var ret = findIntersectionTime(rs,rv);
    alert(ret);
    if (ret[1] < 999) {
        var p = add(rs, scale(ret[1],rv)); //point of potential intersection
        var rv_new = findReflectionVector(ret[0],rv);
        var rs_end = add(p, scale(ret[1],rv_new));
	pointsArray.push(rs);
	pointsArray.push(p);
	colorsArray.push(vec4(0,0,0,1)); colorsArray.push(vec4(0,0,0,1));
	pointsArray.push(p);
	pointsArray.push(rs_end);
	colorsArray.push(vec4(1,0,0,1)); colorsArray.push(vec4(1,0,0,1));
    }

    /*
    for (var i=0; i<step; i++) {
	rs_new = add(rs, scale(rc/step,rv));
	pointsArray.push(rs);
	pointsArray.push(rs_new);
	if (i*rc/step<t) {
	    colorsArray.push(vec4(0,0,0,1)); colorsArray.push(vec4(0,0,0,1));
	} else {
	    colorsArray.push(vec4(1,0,0,1)); colorsArray.push(vec4(1,0,0,1));
	}
        rs = rs_new;
    }
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
    //computeNormalsAndSuch();
    traceRays(vec4(-3.0,-3.0,-1.0, 1.0));
    traceRays(vec4(-3.0,-2.0,-2.0, 1.0));
    traceRays(vec4(-3.0, 0.0,-1.0, 1.0));

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
