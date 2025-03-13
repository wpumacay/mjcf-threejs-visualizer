import * as THREE from 'three';
import { mjsLight, mjSpec, mjsWorldbody, mjsGeom, mjsBody } from './mjcf.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

class AssetsManager {

    /**
     * @param {string} basedir
     */
    constructor(basedir) {
        this.basedir = basedir;
        this.objloader = new OBJLoader();
        this.texloader = new THREE.TextureLoader();

        this.num_meshes_to_load = 0;
        this.num_textures_to_load = 0;

        this.num_meshes_loaded = 0;
        this.num_textures_loaded = 0;

        this.meshes = {};
        this.textures = {};
        this.materials = {};
    }

    /**
     * @param {mjSpec} spec
     */
    load(spec) {
        this.num_meshes_to_load = 0;
        this.num_meshes_loaded = 0;
        this.num_textures_to_load = 0;
        this.num_textures_loaded = 0;

        for (const texture_id in spec.textures) {
            const texture_uri = this.basedir + "/" + spec.textures[texture_id].file;
            const texture = this.texloader.load(texture_uri);
            this.textures[texture_id] = texture;
            this.num_textures_to_load++;
            this.num_textures_loaded++;
        }

        for (const material_id in spec.materials) {
            const specMaterial = spec.materials[material_id];
            const parameters = {
                color: new THREE.Color(
                    specMaterial.rgba.x,
                    specMaterial.rgba.y,
                    specMaterial.rgba.z,
                ),
                shininess: specMaterial.shininess * 128,
                opacity: specMaterial.rgba.w,
            };
            if ((specMaterial.texture != "") && (specMaterial.texture in this.textures)) {
                parameters["map"] = this.textures[specMaterial.texture];
            }

            const material = new THREE.MeshPhongMaterial(parameters);
            this.materials[material_id] = material;
        }
    }

}


export class Visualizer {

    /**
     * @param {number} width
     * @param {number} height
     */
    constructor(width, height) {
        this.spec = null;
        this.uri = "";
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0.15, 0.25, 0.35);
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);

        this.scene.add(new THREE.AmbientLight(0x777777));

        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);

        this.textures = {};
        this.meshes = {};

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(width, height);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.update();

        this.camera.position.set(1, 1, 2);

        /** @type {AssetsManager} */
        this.assetsManager = null;

        this.objLoader = new OBJLoader();
    }

    /**
     * @param {mjSpec} spec
     * @param {string} uri
     */
    initFromSpec(spec, uri) {
        this.spec = spec;
        this.uri = uri;

        this.basedir = this.uri.substring(0, this.uri.lastIndexOf("/"));
        this.assetsManager = new AssetsManager(this.basedir);

        this.assetsManager.load(spec);

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
                    light = new THREE.DirectionalLight(node.diffuse.getHex());
                }
                light.name = node.name;
                light.castShadow = node.castshadow;
                light.position.copy(node.pos);

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
                        const mesh_name = node.meshname;
                        if (mesh_name in this.spec.meshes) {
                            const mesh_spec = this.spec.meshes[mesh_name];
                            const mesh_uri = this.basedir + "/" + mesh_spec.file;
                            const self = this;
                            this.objLoader.load(
                                mesh_uri,
                                function (object) {
                                    object.scale.copy(mesh_spec.scale);
                                    object.traverse((child) => {
                                        if (child.isMesh) {
                                            if (node.material in self.assetsManager.materials) {
                                                child.material = self.assetsManager.materials[node.material];
                                            }
                                            else {
                                                child.material = new MeshPhongMaterial(
                                                    {color: new THREE.Color(
                                                        node.rgba.x,
                                                        node.rgba.y,
                                                        node.rgba.z,
                                                    )}
                                                );
                                            }
                                        }
                                    });
                                    parent.add(object)
                                },
                                null,
                                function (error) {
                                    console.error("An error occurred while loading object " + mesh_uri);
                                }
                            )
                        }
                        // if (mesh_name in this.spec.meshes) {
                        //     const mesh_spec = this.spec.meshes[mesh_name];
                        //     const filename = mesh_spec.file.replace(/\.[^/.]+$/, "");
                        //     const mesh_uri = this.basedir + "/" + mesh_spec.file;
                        //     const mesh_mtl_uri = this.basedir + "/" + filename + ".mtl";
                        //     const mtlloader = new MTLLoader();
                        //     mtlloader.load(
                        //         mesh_mtl_uri,
                        //         (mtl) => {
                        //             mtl.preload();
                        //             const objloader = new OBJLoader();
                        //             objloader.setMaterials(mtl);
                        //             objloader.load(
                        //                 mesh_uri,
                        //                 (object) => {
                        //                     parent.add(object);
                        //                 }
                        //             )
                        //         }
                        //     )
                        // }
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
                    mesh.castshadow = true;
                    mesh.receiveShadow = true;

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
                    stack.push({ node: geom, parent: body_obj });
                }
                for (const joint of node.joints) {
                    stack.push({ node: joint, parent: body_obj });
                }
                for (const light of node.lights) {
                    stack.push({ node: light, parent: body_obj });
                }
                for (const body of node.bodies) {
                    stack.push({ node: body, parent: body_obj });
                }
            }
        }
        if (this.spec.lights.length < 1) {
            const default_light = new THREE.DirectionalLight();
            default_light.position.set(1, 1, 1);
            this.scene.add(default_light);
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


