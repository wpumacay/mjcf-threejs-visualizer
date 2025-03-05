import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as MjParser from './src/parser';

var scene = null;
var camera = null;
var renderer = null;
var controls = null;

var NUM_BODIES = 0;
var NUM_GEOMS = 0;
var NUM_LIGHTS = 0;
var NUM_JOINTS = 0;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const grid = new THREE.GridHelper(10, 10, 0x444444, 0x888888);
    scene.add(grid);

    const ambientLight = new THREE.AmbientLight(0x777777);
    scene.add(ambientLight);

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    camera.position.z = 5;

    fetch("./assets/test.xml")
        .then(response => response.text())
        .then(xml_str => {
            const parser = new DOMParser();
            const xml_doc = parser.parseFromString(xml_str, "text/xml");

            // Parse the mjcf file (worldbody section)
            const worldbody_elms = xml_doc.getElementsByTagName("worldbody");
            const stack = [];
            if (worldbody_elms.length > 0) {
                stack.push({ "xml": worldbody_elms[0], "parent": scene, "transform": new THREE.Matrix4() });
                while (stack.length > 0) {
                    const tuple = stack.shift();
                    const parent = tuple["parent"];
                    const xml = tuple["xml"];
                    const transform = tuple["transform"];

                    switch (xml.tagName) {
                        case "worldbody": {
                            const worldbody_object = new THREE.Group();
                            // worldbody_object.rotation.x = -Math.PI * 0.5;
                            parent.add(worldbody_object);
                            for (const child_xml of xml.children) {
                                stack.push({
                                    "xml": child_xml,
                                    "parent": worldbody_object,
                                    "transform": transform.clone(),
                                });
                            }
                            break;
                        }

                        case "light": {
                            const light = MjParser.safe_parse_light(xml, scene);
                            if (light != null) {
                                const pos = MjParser.safe_parse_vector3(xml, "pos", new THREE.Vector3());
                                const local_tf = new THREE.Matrix4();
                                local_tf.setPosition(pos.x, pos.y, pos.z);
                                const world_tf = transform.multiply(local_tf);

                                light.name = MjParser.safe_parse_string(xml, "name", "light-" + NUM_LIGHTS.toString());
                                light.matrix.copy(local_tf);
                                light.matrixWorld.copy(world_tf);

                                scene.add(light);
                                if (light.target && (light.isDirectionalLight || light.isSpotLight)) {
                                    scene.add(light.target);
                                }
                            }

                            NUM_LIGHTS++;
                            // Branch stops here as this is a leaf node
                            break;
                        }

                        case "joint": {
                            NUM_JOINTS++;
                            // Do nothing for now
                            break;
                        }

                        case "geom": {
                            const mesh_obj = MjParser.safe_parse_geom(xml);
                            if (mesh_obj != null) {
                                const local_tf = MjParser.safe_parse_transform(xml);
                                const world_tf = transform.multiply(local_tf);

                                mesh_obj.name = MjParser.safe_parse_string(xml, "name", "geom-" + NUM_GEOMS.toString());
                                let position = new THREE.Vector3();
                                let quaternion = new THREE.Quaternion();
                                let scale = new THREE.Vector3(1, 1, 1);
                                local_tf.decompose(position, quaternion, scale);
                                mesh_obj.position.copy(position);
                                mesh_obj.quaternion.copy(quaternion);
                                // mesh_obj.matrixWorld.copy(world_tf);

                                parent.add(mesh_obj);
                            }
                        }

                        case "body": {
                            const body_obj = new THREE.Object3D();
                            const local_tf = MjParser.safe_parse_transform(xml);
                            const world_tf = transform.multiply(local_tf);

                            body_obj.name = MjParser.safe_parse_string(xml, "name", "body-" + NUM_BODIES.toString());
                            let position = new THREE.Vector3();
                            let quaternion = new THREE.Quaternion();
                            let scale = new THREE.Vector3(1, 1, 1);
                            local_tf.decompose(position, quaternion, scale);
                            body_obj.position.copy(position);
                            body_obj.quaternion.copy(quaternion);
                            // body_obj.matrixWorld.copy(world_tf);

                            parent.add(body_obj);

                            for (const child_xml of xml.children) {
                                stack.push({
                                    "xml": child_xml,
                                    "parent": body_obj,
                                    "transform": world_tf.clone(),
                                });
                            }

                            NUM_BODIES++;
                            break;
                        }
                    }
                }
            }

            console.info("Finished parsing XML file");
        });
}

function animate() {
    requestAnimationFrame(animate);

    controls.update();

    renderer.render(scene, camera);
}

init();
animate();


