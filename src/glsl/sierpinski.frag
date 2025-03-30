#version 300 es
precision highp float;

in vec3 pos_O;

uniform vec2 decalage;
uniform float zoom;
uniform vec2 ratio;
uniform int iterations;
uniform float paramA;

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
    Fragment = vec4(pos_O,1.0);
}