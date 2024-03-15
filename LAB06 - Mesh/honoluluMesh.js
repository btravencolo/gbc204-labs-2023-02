
var gl;

var pointsArray = [];

var fColor;

var near = -2;
var far = 2;
var radius = 1.0;
var theta  = -0.33;
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

var scale = 7.0;

var modeViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var scaleLoc;

var data = data256;

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

    loadPoints(256);
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

    document.getElementById("Res64").onclick = function() {
        //nRows = 64;
        //nColumns = 64;
        data = data64;
        pointsArray = [];
        loadPoints(64);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(pointsArray));
      };


      document.getElementById("Res128").onclick = function() {
          //nRows = 128;
          //nColumns = 128;
          data = data128;
          pointsArray = [];
          loadPoints(128);
          gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(pointsArray));
        };


        document.getElementById("Res256").onclick = function() {
            //nRows = 256;
            //nColumns = 256;
            data = data256;
            pointsArray = [];
            loadPoints(256);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(pointsArray));
          };

    render();

}


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var eye = vec3( radius*Math.sin(theta)*Math.cos(phi),
                    radius*Math.sin(theta)*Math.sin(phi),
                    radius*Math.cos(theta));

    //var eye = vec3(1, 1, 1);

    gl.uniform1f(scaleLoc, scale);

    modelViewMatrix = lookAt( eye, at, up );
    projectionMatrix = ortho( left, right, bottom, ytop, near, far );

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

    // draw each quad as two filled red triangles
    // and then as two black line loops

    for(var i=0; i<pointsArray.length; i+=4) {
        gl.uniform4fv(fColor, flatten(red));
        gl.drawArrays( gl.TRIANGLE_FAN, i, 4 );
        gl.uniform4fv(fColor, flatten(black));
        gl.drawArrays( gl.LINE_LOOP, i, 4 );
    }


    requestAnimFrame(render);
}
