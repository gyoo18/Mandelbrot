#version 300 es
precision highp float;

in vec3 pos_O;

out vec4 Fragment;

void main(){
    vec2 c = -pos_O.xy*10.0;
    vec2 z = c;
    bool est_infini = false;
    for (int i = 0; i < 100; i++){
        if (length(c) >= 2.0){
            est_infini = true;
            break;
        }
        z = vec2(z.x*z.x-z.y*z.y,2.0*z.x*z.y);
    }
    if (est_infini){
        Fragment = vec4(1.0);
    }else{
        Fragment = vec4(0.0,0.0,0.0,1.0);
    }
}