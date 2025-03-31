var type_fractale = "default.glsl";
var ressources;
var toile;
var gl;

var est_souris_pressée = false;
var souris_pos = [0,0];

var décalage = [0.5,0];
var zoom = 3.0;
var ratio = [0,1];
var itérations = 1000;
var paramA = 2;
var pointParam = [0,0];
var DÉCALAGE = {};
var ZOOM = {};
var RATIO = {};
var ITERATIONS = {};
var PARAM_A = {};
var POINT_PARAM = {};

document.addEventListener("DOMContentLoaded", main);
document.addEventListener("wheel", (event)=>{
    zoom = zoom*Math.pow(0.5,-event.deltaY/toile.height);
    dessiner(0);
});
document.addEventListener("mousedown", ()=>{
    est_souris_pressée = true;
});
document.addEventListener("mouseup", ()=>{est_souris_pressée = false;});
document.addEventListener("mousemove", (event)=>{
    if(est_souris_pressée && event.ctrlKey){
        pointParam[0] -= ((souris_pos[0]-event.clientX)/toile.width)*zoom;
        pointParam[1] += ((souris_pos[1]-event.clientY)/toile.height)*zoom;
        dessiner(0);
    } else if (est_souris_pressée && !event.ctrlKey){
        décalage[0] -= ((souris_pos[0]-event.clientX)/toile.width)*zoom;
        décalage[1] += ((souris_pos[1]-event.clientY)/toile.height)*zoom;
        dessiner(0);
    }
    souris_pos[0] = event.clientX;
    souris_pos[1] = event.clientY;
});

function main(){

    toile = document.getElementById("toile-webgl");
    gl = toile.getContext("webgl2",{powerPreference:"high-performance"});
    console.log(gl.getParameter(gl.RENDERER));

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
            Fragment = vec4(0.15,0.15,0.2,1.0);
        }
        `;
    faireNuanceur("default.frag");

    var mandelbrot_vert = new XMLHttpRequest();
    mandelbrot_vert.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
            var source = this.responseText
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

    var sierpinski_vert = new XMLHttpRequest();
    sierpinski_vert.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
            var source = this.responseText
            ressources["sierpinski.vert"] = source;
            faireNuanceur("sierpinski.vert");
        }
    }
    sierpinski_vert.open("GET", "glsl/sierpinski.vert");
    sierpinski_vert.send();

    var sierpinski_frag = new XMLHttpRequest();
    sierpinski_frag.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
            var source = this.responseText
            ressources["sierpinski.frag"] = source;
            faireNuanceur("sierpinski.frag");
        }
    }
    sierpinski_frag.open("GET", "glsl/sierpinski.frag");
    sierpinski_frag.send();

    var julia_vert = new XMLHttpRequest();
    julia_vert.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
            var source = this.responseText
            ressources["julia.vert"] = source;
            faireNuanceur("julia.vert");
        }
    }
    julia_vert.open("GET", "glsl/julia.vert");
    julia_vert.send();

    var julia_frag = new XMLHttpRequest();
    julia_frag.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
            var source = this.responseText
            ressources["julia.frag"] = source;
            faireNuanceur("julia.frag");
        }
    }
    julia_frag.open("GET", "glsl/julia.frag");
    julia_frag.send();
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

        DÉCALAGE[nom+".glsl"] = gl.getUniformLocation(programme,"decalage");
        ZOOM[nom+".glsl"] = gl.getUniformLocation(programme,"zoom");
        RATIO[nom+".glsl"] = gl.getUniformLocation(programme,"ratio");
        ITERATIONS[nom+".glsl"] = gl.getUniformLocation(programme,"iterations");
        PARAM_A[nom+".glsl"] = gl.getUniformLocation(programme,"paramA");
        POINT_PARAM[nom+".glsl"] = gl.getUniformLocation(programme,"pointParam");

        ressources[nom + ".glsl"] = programme;
    }

}

function dessiner(temps){
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(ressources[type_fractale]);
    gl.uniform2f(DÉCALAGE[type_fractale],décalage[0],décalage[1]);
    gl.uniform1f(ZOOM[type_fractale],zoom);
    gl.uniform2f(RATIO[type_fractale],ratio[0],ratio[1]);
    gl.uniform1i(ITERATIONS[type_fractale],itérations);
    gl.uniform1i(PARAM_A[type_fractale],paramA);
    gl.uniform2f(POINT_PARAM[type_fractale],pointParam[0],pointParam[1]);

    var VAO = ressources["VAO"];
    gl.bindVertexArray(VAO);
    gl.enableVertexAttribArray(0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    //requestAnimationFrame(function(temps){dessiner(gl,temps)});
}

function chargerMandelbrot(){
    document.getElementById("Itérations").value = 400;
    itérations = 200;
    document.getElementById("explications").innerHTML =`
        <h1>L'ensemble de Mandelbrot</h1>
        <p>Se calcule avec la formule suivante :</p>
        <p>z = z² + c</p>
        <p>
            Où z est un nombre complexe sur lequel on itère la formule précédente et c un nombre complexe initial du plan.
            La plupart des valeurs initiales c tendent vers l'infini, mais celles qui restent stables font partie de l'ensemble
            de Mandelbrot et sont ici colorés en noir. Il est possible d'affirmer qu'un nombre ne fait pas partie de l'ensemble
            dès que la suite d'itération fait en sorte que sa norme dépasse 2. Les couleurs indiquent alors combien d'itérations
            ont été nécessaires pour atteindre cette barrière.
        </p>
        <h3>Contrôles : </h3>
        <p>Cliquez et bougez la souris pour vous déplacer.</p>
        <p>Glissez la mollette pour zoomer/dézoomer.</p>
        `;
    type_fractale = "mandelbrot.glsl";
    dessiner(0);
}

function chargerSierpinski(){
    document.getElementById("explications").innerHTML = 
    `<h1>Le triangle de Sierpinski</h1>
    <p>
        Le triangle se construit de manière triviale en découpant de manière successive un triangle inversé de chaque triangle plein.
        Cependant, cette approche ne se prette pas bien à un programme sur GPU. Ainsi, ce programme reflète les coordonées uvs récursivement
        pour ensuite construire un triangle sur dans chaque reflet. Cette approche a l'avantage de pouvoir facilement trouver la distance depuis
        les bords du triangle et de facilement être adaptable pour d'autres formes.
    </p>
    <h3>Contrôles</h3>
    <p>Cliquez et bougez la souris pour vous déplacer.</p>
    <p>Tournez la mollette pour zoomer/dézoomer.</p>`;
    document.getElementById("Itérations").value = 5;
    itérations = 5;
    type_fractale = "sierpinski.glsl";
    dessiner(0);
}

function chargerJulia(){
    document.getElementById("explications").innerHTML =
    `<h1>L'ensemble de Julia</h1>
    <p>Se calcule avec la formule suivante :</p>
    <p>
        z = x
        z = z² + c
    </p>
    <p>
        Où z est un nombre complexe sur lequel on itère la formule précédente, c un nombre complexe arbitraire et x un nombre
        complexe initial du plan. La plupart des valeurs initiales x tendent vers l'infini, mais celles qui restent stables 
        font partie de l'ensemble de Julia et sont ici colorés en noir. Il est possible d'affirmer qu'un nombre ne fait pas 
        partie de l'ensemble dès que la suite d'itération fait en sorte que sa norme dépasse 2. Les couleurs indiquent alors 
        combien d'itérations ont été nécessaires pour atteindre cette barrière.
    </p>
    <h3>Contrôles : </h3>
    <p>Cliquez et bougez la souris pour vous déplacer.</p>
    <p>Glissez la mollette pour zoomer/dézoomer.</p>
    <p>Ctrl+clic et bougez la souris pour déplacer le point c et obtenir différentes versions de l'ensemble de Julia.</p
    `;
    document.getElementById("Itérations").value = 400;
    itérations = 200;
    type_fractale = "julia.glsl";
    dessiner(0);
}

function surChangementFenêtre(){
    toile.width = toile.clientWidth;
    toile.height = toile.clientHeight;
    gl.viewport(0,0,toile.width,toile.height);
    var ratio_f = toile.height / toile.width;
    ratio = [1.0, ratio_f];
    dessiner(0);
}

function changerIterations(i){
    itérations = Number(document.getElementById("Itérations").value);
    dessiner(0);
}

function réinitialiser(){
    décalage = [0.5,0];
    zoom = 3.0;
    pointParam = [0,0];
    dessiner(0);
}