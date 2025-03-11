import * as THREE from 'three';
import { mjsLight, mjSpec, mjsWorldbody, mjsGeom, mjsBody } from './mjcf';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class Visualizer {

    /**
     * @param {number} width
     * @param {number} height
     */
    constructor(width, height) {
        this.spec = null;
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0.15, 0.25, 0.35);
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);

        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(width, height);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.update();

        this.camera.position.set(1, 1, 2);
    }

    /**
     * @param {mjSpec} spec
     */
    initFromSpec(spec) {
        this.spec = spec;

        const stack = [{ node: this.spec.worldbody, parent: null }];
        while (stack.length > 0) {
            const tuple = stack.shift();
            const node = tuple.node;
            const parent = tuple.parent;
            if (node instanceof mjsWorldbody) {
                const worldbody_object = new THREE.Group();
                worldbody_object.rotation.x = -Math.PI * 0.5;
                this.scene.add(worldbody_object);

                for (const child of node.children) {
                    stack.push({ node: child, parent: worldbody_object });
                }
            }
            else if (node instanceof mjsLight) {
                let light = null;
                if (node.directional) {
                    light = new THREE.DirectionalLight(node.diffuse.getHex());
                }
                else {
                    light = new THREE.SpotLight(node.diffuse.getHex());
                }
                light.name = node.name;
                light.castShadow = node.castshadow;

                parent.add(light);
            }
            else if (node instanceof mjsGeom) {
                let geometry = null;
                switch (node.type) {
                    case "sphere": {
                        geometry = new THREE.SphereGeometry(node.size[0]);
                        break;
                    }
                    case "plane": {
                        geometry = new THREE.PlaneGeometry(
                            2 * node.size[0],
                            2 * node.size[1],
                            2 * node.size[0] / node.size[2],
                            2 * node.size[1] / node.size[2],
                        );
                        break;
                    }
                    case "box": {
                        geometry = new THREE.BoxGeometry(
                            2 * node.size[0],
                            2 * node.size[1],
                            2 * node.size[2],
                        )
                        break;
                    }
                    case "ellipsoid": {
                        geometry = new THREE.SphereGeometry(1.0);
                        geometry.scale(node.size[0], node.size[1], node.size[2]);
                        break;
                    }
                    case "cylinder": {
                        geometry = new THREE.CylinderGeometry(node.size[0], 2 * node.size[1]);
                        break;
                    }
                    case "capsule": {
                        geometry = new THREE.CapsuleGeometry(node.size[0], 2 * node.size[1]);
                        break;
                    }
                    case "hfield": {
                        console.error("Heighfield geoms are not supported yet");
                        break;
                    }
                    case "mesh": {
                        console.error("Mesh geoms are not supported yet");
                        break;
                    }
                    default:
                        console.error("Shouldn't get here. Something went wrong");
                    break;
                }

                if (geometry != null) {
                    const rgba = (node.material == "") ? node.rgba : this.spec.materials[node.material].rgba;
                    const material = new THREE.MeshPhongMaterial(
                        {
                            color: new THREE.Color(rgba.x, rgba.y, rgba.z),
                            opacity: rgba.w,
                            side: THREE.DoubleSide,

                        }
                    );

                    const mesh = new THREE.Mesh(geometry, material);
                    mesh.position.copy(node.pos);
                    mesh.quaternion.copy(node.quat);
                    mesh.name = node.name;

                    if (node.type == "cylinder" || node.type == "capsule") {
                        mesh.rotateX(-Math.PI * 0.5);
                    }
                    parent.add(mesh);
                }
            }
            else if (node instanceof mjsBody) {
                const body_obj = new THREE.Object3D();
                body_obj.name = node.name;
                body_obj.position.copy(node.pos);
                body_obj.quaternion.copy(node.quat);

                parent.add(body_obj);

                for (const geom of node.geoms) {
                    stack.push({node: geom, parent: body_obj});
                }
                for (const joint of node.joints) {
                    stack.push({node: joint, parent: body_obj});
                }
                for (const light of node.lights) {
                    stack.push({node: light, parent: body_obj});
                }
                for (const body of node.bodies) {
                    stack.push({node: body, parent: body_obj});
                }
            }
        }
    }

    update() {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * @param {number} newWidth
     * @param {number} newHeight
     */
    onResize(newWidth, newHeight) {
        this.camera.aspect = newWidth / newHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(newWidth, newHeight);
    }
};


