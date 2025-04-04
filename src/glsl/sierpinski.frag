#version 300 es
precision highp float;

in vec3 pos_O;

uniform vec2 decalage;
uniform float zoom;
uniform vec2 ratio;
uniform int iterations;
uniform float paramA;
uniform vec2 pointParam;

out vec4 Fragment;

//////////////////////////////////////////////////////////////////////////////////////////////*/
// Copié de Sam Hocevar sur stack overflow                                                    //
// Source : https://stackoverflow.com/questions/15095909/from-rgb-to-hsv-in-opengl-glsl       //
// Source originale : http://lolengine.net/blog/2013/07/27/rgb-to-hsv-in-glsl.à               //
// Liscence : WTFPL.                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////*/

// All components are in the range [0…1], including hue.
vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

// All components are in the range [0…1], including hue.
vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

//////////////////////////////////////////////*/
// Fin du code copié de sam Hocevar           //
//////////////////////////////////////////////*/

float PI = 3.141592653589793238;

vec2 mirroir(vec2 uv, vec2 pos, float rot){
    mat2 rotMat = mat2(cos(rot),-sin(rot),sin(rot),cos(rot));
    mat2 rotMati = mat2(cos(-rot),-sin(-rot),sin(-rot),cos(-rot));
    uv = rotMat*(uv-pos);
    uv.y = abs(uv.y);
    uv = rotMati*uv + pos;
    return uv;
}

void main(){
    vec2 pos = (pos_O.xy*ratio*zoom - decalage);
    bool est_triangle = false;
    mat2 rotA = mat2(cos(120.0*PI/180.0),-sin(120.0*PI/180.0),sin(120.0*PI/180.0),cos(120.0*PI/180.0));
    mat2 rotB = mat2(cos(240.0*PI/180.0),-sin(240.0*PI/180.0),sin(240.0*PI/180.0),cos(240.0*PI/180.0));
    pos *= pow(2.0,float(iterations));
    pos -= vec2(0.0,pow(2.0,float(iterations)) - 1.0);
    float dist = 0.0;
    for (int i = iterations; i > 0; i--){
        float facteur = pow(2.0,float(i))-1.0;
        pos = mirroir(pos, vec2(facteur*cos(PI/6.0),-facteur*sin(PI/6.0)), 30.0*PI/180.0);
        pos = mirroir(pos, vec2(-facteur*cos(PI/6.0),-facteur*sin(PI/6.0)), -30.0*PI/180.0);
    }
    if (pos.y > -sin(PI/6.0) && (rotA*pos).y > -sin(PI/6.0) && (rotB*pos).y > -sin(PI/6.0)){
        est_triangle = true;
    }else{
        dist = -min(pos.y,min((rotA*pos).y,(rotB*pos).y));
    }

    if (est_triangle){
        Fragment = vec4(1.0);
    }else{
        vec3 col = hsv2rgb( vec3( cos(-log2((dist*10.0)))*0.5 + 0.5, sin(-log2(dist*5.0))*0.25 + 0.5, sin(-log2(dist*20.0))*0.25 + 0.5 ) );
        Fragment = vec4(col,1.0);
    }
}