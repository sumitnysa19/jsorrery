uniform vec3 color;
varying float intensity;

void main() {
    vec3 glow = color * intensity;
    gl_FragColor = vec4(glow, intensity);
}
