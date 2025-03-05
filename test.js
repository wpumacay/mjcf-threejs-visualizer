import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

var scene = null;
var camera = null;
var renderer = null;
var controls = null;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x333333);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(1.0, 1.0, 3.0);

    const grid = new THREE.GridHelper(10, 10, 0x444444, 0x888888);
    scene.add(grid);

    renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    // const light = new THREE.PointLight(0xffffff, 1.0);
    // light.position.set(1.5, 1.5, 1.5);
    // scene.add(light);
    // scene.add(new THREE.PointLightHelper(light));

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(3.0, 4.0, 5.0);
    light.castShadow = true;
    scene.add(light);
    scene.add(new THREE.DirectionalLightHelper(light));

    // const light = new THREE.SpotLight(0xffffff, 100);
    // light.position.set(3.0, 4.0, 5.0);
    // scene.add(light);
    // scene.add(new THREE.SpotLightHelper(light));

    scene.add(new THREE.AmbientLight(0x777777));

    const plane_geometry = new THREE.PlaneGeometry(10, 10);
    const plane_material = new THREE.MeshPhongMaterial({
        color: 0x55ff55,
        specular: 0xffffff,
        shininess: 250,
        side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(plane_geometry, plane_material);
    plane.receiveShadow = true;
    scene.add(plane);

    const geometry = new THREE.BoxGeometry(0.2, 0.4, 0.6);
    const material = new THREE.MeshPhongMaterial({ 
        color: 0xff7f4f,
        specular: 0xffffff,
        shininess: 250,
        side: THREE.DoubleSide,
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 0, 1);
    cube.castShadow = true;
    scene.add(cube);
}


function animate() {
    requestAnimationFrame(animate);

    controls.update();

    renderer.render(scene, camera);
}

init();
animate();
