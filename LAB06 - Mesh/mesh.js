

var numVertices  = (nRows-1)*(nColumns-1);

var colorLoc;

var pointsArray = new Array(numVertices);

var canvas;
var gl;




var zNear = -10;
var zFar = 10;
var radius = 6.0;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var left = -3.0;
var right = 3.0;
var ytop =3.0;
var bottom = -3.0;

var  fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect = 1.0;       // Viewport aspect ratio

var mvMatrix, pMatrix;
var modelViewId, projectionId;
var eye, at, up;

var black, white;

window.onload = init;


var Index = 0;


function init() {



    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    white = vec4.create([1.0, 1.0, 1.0, 1.0]);
    black = vec4.create([0.0, 0.0, 0.0, 1.0]);

    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    aspect =  canvas.width/canvas.height;
    
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1.0, 2.0);
    
    mvMatrix = mat4.create();
    pMatrix = mat4.create();
    

    at = vec3.create([0.0, 0.0, 0.0]);
    up = vec3.create([0.0, 1.0, 0.0]);
    
    
        for(var i=0; i<nRows-1; i++) for(var j=0; j<nColumns-1;j++) 
    {
 
        pointsArray[Index] = vec4.create([2*i/nRows-1, data[i][j], 2*j/nColumns-1, 1.0]);
        Index++;
 
        pointsArray[Index] = vec4.create([2*(i+1)/nRows-1, data[i+1][j], 2*j/nColumns-1, 1.0]);
        Index++;
        
        pointsArray[Index] = vec4.create([2*(i+1)/nRows-1, data[i+1][j+1], 2*(j+1)/nColumns-1, 1.0]);
        Index++;
        
        pointsArray[Index] = vec4.create([2*i/nRows-1, data[i][j+1], 2*(j+1)/nColumns-1, 1.0]);
        Index++;
    }
//console.log(Index);
    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    

    var vBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    var vPos = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPos, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPos );
    
    colorLoc = gl.getUniformLocation(program, "color");
 
    modelViewId = gl.getUniformLocation( program, "model_view" );
    projectionId = gl.getUniformLocation( program, "projection" );

    gl.uniformMatrix4fv( modelViewId, false, mvMatrix );
    gl.uniformMatrix4fv( projectionId, false, pMatrix );

var b1 = document.getElementById("Button1")
b1.addEventListener("click", function(){zNear  *= 1.1; zFar *= 1.1;}, false);
var b2 = document.getElementById("Button2")
b2.addEventListener("click", function(){zNear *= 0.9; zFar *= 0.9;}, false);
var b3 = document.getElementById("Button3")
b3.addEventListener("click", function(){radius *= 2.0;}, false);
var b4 = document.getElementById("Button4")
b4.addEventListener("click", function(){radius *= 0.5;}, false);
var b5 = document.getElementById("Button5")
b5.addEventListener("click", function(){theta += dr;}, false);
var b6 = document.getElementById("Button6")
b6.addEventListener("click", function(){theta -= dr;}, false);
var b7 = document.getElementById("Button7")
b7.addEventListener("click", function(){phi += dr;}, false);
var b8 = document.getElementById("Button8")
b8.addEventListener("click", function(){phi -= dr;}, false);
var b9 = document.getElementById("Button9")
b9.addEventListener("click", function(){left  *= 0.9; right *= 0.9;}, false);
var b10 = document.getElementById("Button10")
b10.addEventListener("click", function(){left *= 1.1; right *= 1.1;}, false);
var b11 = document.getElementById("Button11")
b11.addEventListener("click", function(){ytop  *= 0.9; bottom *= 0.9;}, false);
var b12 = document.getElementById("Button12")
b12.addEventListener("click", function(){ytop *= 1.1; bottom *= 1.1;}, false);
var b13 = document.getElementById("Button13")
b13.addEventListener("click", function(){console.log(theta, phi, right, ytop);}, false);
       
    render();
 
}


var render = function() {
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        




            
        eye = vec3.create([radius*Math.sin(theta)*Math.cos(phi), 
            radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta)]);

        mvMatrix = mat4.lookAt(eye, at , up);
            
        mat4.ortho(left, right, bottom, ytop, zNear, zFar, pMatrix);
            
        gl.uniformMatrix4fv( modelViewId, false, mvMatrix );
        gl.uniformMatrix4fv( projectionId, false, pMatrix );
        
  
        for(var i=0; i<Index; i+=4) { 
            gl.uniform4fv(colorLoc, white);
            gl.drawArrays( gl.TRIANGLE_FAN, i, 4 );

            gl.uniform4fv(colorLoc, black);
            gl.drawArrays( gl.LINE_LOOP, i, 4 );
        }
               

        requestAnimFrame(render);
    }
