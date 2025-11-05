varying float intensity;
varying vec3 vNormal;

void main() {
    vNormal = normalize(normalMatrix * normal);
    vec3 vNorm = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
    intensity = pow(0.6 - dot(vNormal, vNorm), 3.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
