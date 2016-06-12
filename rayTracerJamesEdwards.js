

var canvas;
var gl;

var numTimesToSubdivide = 5;
 
var index = 0;
//var numVertices = 36+28;

var pointsArray = [];
var normalsArray = [];
var colorsArray = [];
var texCoordsArray = [];

var vertices = [
        //vec4( -5, -5, -1, 1.0 ),
        //vec4( -5, -1, -1, 1.0 ),
        //vec4( -1, -1, -1, 1.0 ),
        //vec4( -1, -5, -1, 1.0 ),
        //vec4( -5, -5, -5, 1.0 ),
        //vec4( -5, -1, -5, 1.0 ),
        //vec4( -1, -1, -5, 1.0 ),
        //vec4( -1, -5, -5, 1.0 ),
//
        //vec4( 3,  0,  3, 1.0 ),
        //vec4( 3,  0,  0, 1.0 ),
        //vec4( 6,  0,  0, 1.0 ),
        //vec4( 6,  0,  3, 1.0 ),
        //vec4( 4.5,  2.8,  2.5, 1.0 )
    ];

var texCoord = [
		vec2(0,0),
		vec2(0,1),
		vec2(1,1),
		vec2(1,0)
];

function quad(a, b, c, d) {
     pointsArray.push(vertices[a]); 
     //colorsArray.push(vertexColors[a]); 
     texCoordsArray.push(texCoord[0]);
     normalsArray.push(vertices[a]);
	 
     pointsArray.push(vertices[b]); 
     //colorsArray.push(vertexColors[a]); 
     texCoordsArray.push(texCoord[1]);
     normalsArray.push(vertices[b]);
	 
     pointsArray.push(vertices[c]); 
     //colorsArray.push(vertexColors[a]);    
     texCoordsArray.push(texCoord[2]);
     normalsArray.push(vertices[c]);
	 
     pointsArray.push(vertices[a]); 
     //colorsArray.push(vertexColors[a]); 
     texCoordsArray.push(texCoord[0]);
     normalsArray.push(vertices[a]);

     pointsArray.push(vertices[c]); 
     //colorsArray.push(vertexColors[a]); 
     texCoordsArray.push(texCoord[2]);
     normalsArray.push(vertices[c]);

     pointsArray.push(vertices[d]); 
     //colorsArray.push(vertexColors[a]); 
     texCoordsArray.push(texCoord[3]);
     normalsArray.push(vertices[d]);

     index += 6;
}

// Each face determines two triangles

function colorCube()
{
    generateCube(-8, 8, 0);
    generateCube(-7, 8, 0);
    generateCube(-6, 8, 0);
    generateCube(-7, 7, 1);
    generateCube(-7, 6,-4);
    generateCube(-8, 5, 2);
    generateCube(-7, 5, 1);

    generateCube(-5, 4,-1);
    generateCube(-4, 4,-1);
    generateCube(-3, 4,-1);
    generateCube(-5, 3,-2);
    generateCube(-3, 3,-2);
    generateCube(-5, 2,-1);
    generateCube(-4, 2,-1);
    generateCube(-3, 2,-1);
    generateCube(-5, 1,-1);
    generateCube(-3, 1,-1);
    
    generateCube(-2, 1,-2);
    generateCube(-1, 0.5,-2);
    //generateCube( 0, 1,-2);
    generateCube( 1, 0.5,-2);
    generateCube( 2, 1,-2);
    generateCube(-2, 0,-2);
    generateCube( 0, 0,-2);
    generateCube( 2, 0,-2);
    generateCube(-2,-1,-2);
    generateCube( 0,-1,-2);
    generateCube( 2,-1,-2);


    generateCube( 3,-2, 2);
    generateCube( 4,-2, 2);
    generateCube( 5,-2, 2);
    generateCube( 3,-3, 2);
    generateCube( 4,-3.5, 2);
    generateCube( 3,-4, 2);
    generateCube( 3,-5, 2);
    generateCube( 4,-5, 2);
    generateCube( 5,-5, 2);

    generateCube( 6,-6, 2);
    generateCube( 7,-6, 2);
    generateCube( 8,-6, 2);
    generateCube( 6,-7, 2);
    generateCube( 7,-7.5, 2);
    generateCube( 8,-8, 2);
    generateCube( 6,-9, 2);
    generateCube( 7,-9, 2);
    generateCube( 8,-9, 2);


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
var radius = 1.5;
var theta  = 0.0;
var phi    = 0.0;
var dr = 30.0 * Math.PI/180.0;

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

var ctm;
var ambientColor, diffuseColor, specularColor;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var texSize = 64;
var numRows = 8;
var numCols = 8;
var myTexels = new Uint8Array(11*4*texSize*texSize);
    
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


function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {
                
        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);
                
        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);
                                
        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else { 
        triangle( a, b, c );
    }
}


function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Set up texture map
	
    //for (var w=0; w<11; w++) {
    	for (var i=0; i<texSize; i++) {
	    for (var j=0; j<texSize; j++) {
	        var patchx = Math.floor(i/(texSize/numRows));
	        var patchy = Math.floor(j/(texSize/numCols));
	        var c = (patchx%2 !== patchy%2 ? 255 : 0);
	        var loc = 4*i*texSize+4*j;// + (w*texSize*texSize);
	        myTexels[loc] = c;
	        myTexels[loc+1] = c;
	        myTexels[loc+2] = c;
	        myTexels[loc+3] = 255;
	    }
        }
    //}
    for (var c=0; c<4; c++) {
	//myTexels[11*texSize*texSize+c] = 255;
    }
    
	
    var texture = gl.createTexture();
    gl.bindTexture (gl.TEXTURE_2D, texture);
    gl.texImage2D (gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, myTexels);
    //gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    //gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    //gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    //gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    //gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    //gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.uniform1i(gl.getUniformLocation(program, "texMap"), 0);

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    colorCube();
    alert(pointsArray[0]);

    //tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
	
    var vTexCoord = gl.getAttribLocation (program, "vTexCoord");
    gl.vertexAttribPointer (vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);


    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    document.getElementById("Button0").onclick = function(){radius *= 2.0;};
    document.getElementById("Button1").onclick = function(){radius *= 0.5;};
    document.getElementById("Button2").onclick = function(){theta += dr;};
    document.getElementById("Button3").onclick = function(){theta -= dr;};
    document.getElementById("Button4").onclick = function(){phi += dr;};
    document.getElementById("Button5").onclick = function(){phi -= dr;};
    document.getElementById("Button6").onclick = function(){
        numTimesToSubdivide++; 
        index = 0;
        pointsArray = [];
        normalsArray = []; 
        init();
    };
    document.getElementById("Button7").onclick = function(){
        if(numTimesToSubdivide) numTimesToSubdivide--;
        index = 0;
        pointsArray = []; 
        normalsArray = [];
        init();
    };

    gl.uniform4fv( gl.getUniformLocation(program, 
       "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "specularProduct"),flatten(specularProduct) );	
    gl.uniform4fv( gl.getUniformLocation(program, 
       "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
       "shininess"),materialShininess );

    render();
}

function render() {
	    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	  
    eye = vec3(radius*Math.sin(theta)*Math.cos(phi), 
	       radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
			            
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
				        
    for( var i=0; i<index; i+=3) 
        gl.drawArrays( gl.TRIANGLES, i, 3 );

    requestAnimFrame(render);
}
