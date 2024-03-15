
var gl;

var pointsArray = [];

var fColor;

var near = -2;
var far = 2;
var radius = 1.0;
var theta  = -0.33; //good intital view 
var phi    = -1.4;
var dr = 5.0 * Math.PI/180.0;

const black = vec4(0.0, 0.0, 0.0, 1.0);
const red = vec4(1.0, 0.0, 0.0, 1.0);

const at = vec3(0, 0, 0);
const up = vec3(0.0, 1.0, 0.0);

var left = -1.2;
var right = 1.2;
var ytop = 1.0;
var bottom = -1.0;

// initial scale factor for heights

var scale = 7.0;

var modeViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var scaleLoc;

// function to put data for an n x n version into an array of triangle fans

loadPoints = function(n) {
  for(var i=0; i<n-1; i++) {
      for(var j=0; j<n-1;j++) {
          pointsArray.push( vec4(2*i/n-1, 2*data[i*n+j]-1, 2*j/n-1, 1.0));
          pointsArray.push( vec4(2*(i+1)/n-1, 2*data[(i+1)*n+j]-1, 2*j/n-1, 1.0));
          pointsArray.push( vec4(2*(i+1)/n-1, 2*data[(i+1)*n+j+1]-1, 2*(j+1)/n-1, 1.0));
          pointsArray.push( vec4(2*i/n-1, 2*data[i*n+j+1]-1, 2*(j+1)/n-1, 1.0) );
      }
    }
}

// form a single array with 256 x 256 data
//followed by 128 x 128 data followed by 64 x 64 data

var data = data256;
loadPoints(256);
var l1 = pointsArray.length;
data = data128;
loadPoints(128);
var l2 = pointsArray.length;
data = data64;
loadPoints(64);
var l3 = pointsArray.length;

// default resolution

var resolution = 256;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );

    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    // enable depth testing and polygon offset
    // so lines will be in front of filled triangles

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1.0, 2.0);

// vertex array of nRows*nColumns quadrilaterals
// (two triangles/quad) from data
    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    var vBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    fColor = gl.getUniformLocation(program, "fColor");

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    scaleLoc = gl.getUniformLocation(program, "scale");

// buttons for moving viewer and changing size


    document.getElementById("Button3").onclick = function(){radius *= 1.1;};
    document.getElementById("Button4").onclick = function(){radius *= 0.9;};
    document.getElementById("Button5").onclick = function(){theta += dr;};
    document.getElementById("Button6").onclick = function(){theta -= dr;};
    document.getElementById("Button7").onclick = function(){phi += dr;};
    document.getElementById("Button8").onclick = function(){phi -= dr;};

    document.getElementById("Button11").onclick = function(){scale  *= 0.9};
    document.getElementById("Button12").onclick = function() {scale *= 1.1};

    document.getElementById("Res64").onclick = function() {resolution = 64};
    document.getElementById("Res128").onclick = function() {resolution = 128};
    document.getElementById("Res256").onclick = function() {resolution = 256};

    render();

}


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var eye = vec3( radius*Math.sin(theta)*Math.cos(phi),
                    radius*Math.sin(theta)*Math.sin(phi),
                    radius*Math.cos(theta));


    gl.uniform1f(scaleLoc, scale);

    modelViewMatrix = lookAt( eye, at, up );
    projectionMatrix = ortho( left, right, bottom, ytop, near, far );

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

    // draw each quad as two filled red triangles
    // and then as two black line loops

    switch(resolution) {
      case 256:
        for(var i=0; i<l1; i+=4) {
          gl.uniform4fv(fColor, flatten(red));
          gl.drawArrays( gl.TRIANGLE_FAN, i, 4 );
          gl.uniform4fv(fColor, flatten(black));
          gl.drawArrays( gl.LINE_LOOP, i, 4 );
        }
        break;
      case 128:
        for(var i=l1; i<l2; i+=4) {
          gl.uniform4fv(fColor, flatten(red));
          gl.drawArrays( gl.TRIANGLE_FAN, i, 4 );
          gl.uniform4fv(fColor, flatten(black));
          gl.drawArrays( gl.LINE_LOOP, i, 4 );
        }
          break;
      case 64:
        for(var i=l2; i<l3; i+=4) {
          gl.uniform4fv(fColor, flatten(red));
          gl.drawArrays( gl.TRIANGLE_FAN, i, 4 );
          gl.uniform4fv(fColor, flatten(black));
          gl.drawArrays( gl.LINE_LOOP, i, 4 );
        }
          break;
    }


    requestAnimFrame(render);
}
