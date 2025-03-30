#version 300 es
precision mediump float;

in vec3 pos;

out vec3 pos_O;

void main(){
    pos_O = pos;
    gl_Position = vec4(pos, 1.0);
}