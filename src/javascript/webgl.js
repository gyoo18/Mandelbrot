document.addEventListener("DOMContentLoaded", main);

var type_fractale = "default.glsl";
var ressources;
var toile;
var gl;

function main(){

    toile = document.getElementById("toile-webgl");
    gl = toile.getContext("webgl2");

    if (gl == null) {
        alert("[ERREUR] WebGL2 n'a pas pus être initialisé. Peut-être que votre navigateur ne le supporte pas.");
    } else {
        console.log("WebGL2 correctement initialisé.");
        var version = gl.getParameter(gl.VERSION);
        var nuaversion = gl.getParameter(gl.SHADING_LANGUAGE_VERSION);
        console.log("WebGL version : " + version);
        console.log("GLSLES version : " + nuaversion);
    }

    chargerRessources();
    initialiserVAO();
    var glErreur = gl.getError();
    dessiner();

    new ResizeObserver(surChangementFenêtre).observe(toile);
    surChangementFenêtre();
    gl.viewport(0,0, gl.canvas.width, gl.canvas.height);

    //requestAnimationFrame(function(temps){dessiner(gl,temps);});
}

function chargerRessources(){
    ressources = {};

    ressources["default.vert"] = 
        `#version 300 es
        precision mediump float;
        
        in vec3 pos;
        
        void main(){
            gl_Position = vec4(pos,1.0);
        }`;
    ressources["default.frag"] = 
        `#version 300 es
        precision mediump float;

        out vec4 Fragment;

        void main(){
            Fragment = vec4(1.0,0.0,1.0,1.0);
        }
        `;
    faireNuanceur("default.frag");

    var mandelbrot_vert = new XMLHttpRequest();
    mandelbrot_vert.onreadystatechange = function(){
        if (mandelbrot_vert.readyState == 4 && mandelbrot_vert.status == 200) {
            var source = mandelbrot_vert.responseText
            ressources["mandelbrot.vert"] = source;
            faireNuanceur("mandelbrot.vert");
        }
    }
    mandelbrot_vert.open("GET", "glsl/mandelbrot.vert");
    mandelbrot_vert.send();

    var mandelbrot_frag = new XMLHttpRequest();
    mandelbrot_frag.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
            var source = this.responseText
            ressources["mandelbrot.frag"] = source;
            faireNuanceur("mandelbrot.frag");
        }
    }
    mandelbrot_frag.open("GET", "glsl/mandelbrot.frag");
    mandelbrot_frag.send();
}

function initialiserVAO(){
    var positions = [
        -1,-1,0,
         1,-1,0,
        -1, 1,0,
         1, 1,0
    ];

    var VAO = gl.createVertexArray();
    gl.bindVertexArray(VAO);

    var VBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,VBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    ressources["VAO"] = VAO;
}

function faireNuanceur(source){
    nom = source.split(".")[0];
    type = source.split(".")[1];
    if ( (type == "vert" && (source.replace(".vert",".frag")) in ressources) || (type == "frag" && (source.replace(".frag",".vert")) in ressources) ) {
        
        var somsource  = ressources[nom+".vert"];
        var fragsource = ressources[nom+".frag"];

        var nuasom = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(nuasom,somsource);
        gl.compileShader(nuasom);
        var messageErreur = gl.getShaderInfoLog(nuasom);
        if (messageErreur.length > 0) {
            console.error("[ERREUR] La compilation du nuanceur de sommets a échoué.");
            lignes = somsource.split("\n");
            messagesErreurs = messageErreur.split("\n");
            for (var i = 0; i < messagesErreurs.length; i++){
                if (messagesErreurs[i].length == 0){
                    continue;
                }
                ligne = Number(messagesErreurs[i].split(" ")[1].split(":")[1])-1;
                codesource = (
                    (ligne > 0 ? ligne+":"+lignes[ligne-1]+"\n" : "") + 
                    (ligne+1)+":"+somsource.split("\n")[ligne]+"\n" + 
                    (ligne+1 < lignes.length ? (ligne+2)+":"+lignes[ligne+1]+"\n" : "")
                );
                console.error(codesource+messagesErreurs[i]);
            }
        }
    
        var nuafrag = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(nuafrag,fragsource);
        gl.compileShader(nuafrag);
        messageErreur = gl.getShaderInfoLog(nuafrag);
        if (messageErreur.length > 0) {
            console.error("[ERREUR] La compilation du nuanceur de fragments a échoué.");
            lignes = somsource.split("\n");
            messagesErreurs = messageErreur.split("\n");
            for (var i = 0; i < messagesErreurs.length; i++){
                if (messagesErreurs[i].length == 0){
                    continue;
                }
                ligne = Number(messagesErreurs[i].split(" ")[1].split(":")[1])-1;
                codesource = (
                    (ligne > 0 ? ligne+":"+lignes[ligne-1]+"\n" : "") + 
                    (ligne+1)+":"+somsource.split("\n")[ligne]+"\n" + 
                    (ligne+1 < lignes.length ? (ligne+2)+":"+lignes[ligne+1]+"\n" : "")
                );
                console.error(codesource+messagesErreurs[i]);
            }
        }
    
        var programme = gl.createProgram();
        gl.attachShader(programme, nuasom);
        gl.attachShader(programme, nuafrag);
        gl.linkProgram(programme);
        messageErreur = gl.getProgramInfoLog(programme);
        if (messageErreur.length > 0){
            console.error("[ERREUR] La liaison des programmes a échoué.");
            console.error(messageErreur);
        }

        gl.bindAttribLocation(programme, 0, "pos");

        ressources[nom + ".glsl"] = programme;
    }

}

function dessiner(temps){
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var VAO = ressources["VAO"];
    gl.useProgram(ressources[type_fractale]);
    gl.bindVertexArray(VAO);
    gl.enableVertexAttribArray(0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    //requestAnimationFrame(function(temps){dessiner(gl,temps)});
}

function chargerMandelbrot(){
    type_fractale = "mandelbrot.glsl";
    dessiner(0);
}

function surChangementFenêtre(){
    toile.width = toile.clientWidth;
    toile.height = toile.clientHeight;
    gl.viewport(0,0,toile.width,toile.height);
    dessiner(0);
}