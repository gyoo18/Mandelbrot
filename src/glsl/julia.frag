#version 300 es
precision highp float;

in vec3 pos_O;

uniform vec2 decalage;
uniform float zoom;
uniform vec2 ratio;
uniform int iterations;
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

void main(){
    vec2 c = (pos_O.xy*ratio*zoom-decalage);
    vec2 z = c;
    bool est_infini = false;
    int bonds = 0;
    for (int i = 0; i < iterations; i++){
        if (length(z) > 2.0){
            bonds = i+1;
            est_infini = true;
            break;
        }
        z = vec2(z.x*z.x-z.y*z.y, 2.0*z.x*z.y)+pointParam;
    }
    if (est_infini){
        float lum = float(bonds)/float(iterations);
        vec3 col = hsv2rgb( vec3( cos((lum + 5.0)*50.0)*0.5 + 0.5, sin(lum*100.0)*0.25 + 0.5, sin(lum*100.0)*0.25 + 0.5 ) );
        Fragment = vec4(col,1.0);
    }else{
        Fragment = vec4(0.0,0.0,0.0,1.0);
    }
}