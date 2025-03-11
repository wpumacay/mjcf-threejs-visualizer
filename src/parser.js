import * as THREE from 'three';
import { z2quat } from './math';
import { mjSpec, mjsDefault, mjsLight, mjsGeom, mjsBody, mjsTexture, mjsMaterial, mjsMesh, mjsJoint, mjsWorldbody } from './mjcf';

var NUM_TEXTURES = 0;
var NUM_MATERIALS = 0;

/**
 * @param {Element} xml_element 
 * @param {string} attribute 
 * @param {number} default_value 
 * @returns {number}
 */
export function safe_parse_int(xml_element, attribute, default_value) {
    if (xml_element.hasAttribute(attribute)) {
        return parseInt(xml_element.getAttribute(attribute), 10);
    }
    return default_value;
}

/**
 * @param {Element} xml_element 
 * @param {string} attribute 
 * @param {number} default_value 
 * @returns {number}
 */
export function safe_parse_float(xml_element, attribute, default_value) {
    if (xml_element.hasAttribute(attribute)) {
        return parseFloat(xml_element.getAttribute(attribute));
    }
    return default_value;
}

/**
 * @param {Element} xml_element The XML element from which to get the attribute
 * @param {string} attribute The attribute to look for in the XML element
 * @param {string} default_value The default value in case attribute not found
 */
export function safe_parse_string(xml_element, attribute, default_value) {
    if (xml_element.hasAttribute(attribute)) {
        return xml_element.getAttribute(attribute);
    }
    return default_value;
}

/**
 * @param {Element} xml_element The XML element from which to get the attribute
 * @param {string} attribute The attribute to look for in the XML element
 * @param {boolean} def_value The default value in case attribute not found
 */
export function safe_parse_boolean(xml_element, attribute, def_value) {
    if (xml_element.hasAttribute(attribute)) {
        return xml_element.getAttribute(attribute) == "true";
    }
    return def_value;
}

/**
 * @param {Element} xml_element The XML element from which to get the attribute
 * @param {string} attribute The attribute to look for in the XML element
 * @param {THREE.Vector2} def_value The default value in case attribute not found
 */
export function safe_parse_vector2(xml_element, attribute, def_value) {
    if (xml_element.hasAttribute(attribute)) {
        const arr_elms = xml_element.getAttribute(attribute).split(" ");
        if (arr_elms.length != 2) {
            return def_value;
        }
        return new THREE.Vector2(
            parseFloat(arr_elms[0]),
            parseFloat(arr_elms[1]),
        )
    }
    return def_value;
}

/**
 * @param {Element} xml_element The XML element from which to get the attribute
 * @param {string} attribute The attribute to look for in the XML element
 * @param {THREE.Vector3} def_value The default value in case attribute not found
 */
export function safe_parse_vector3(xml_element, attribute, def_value) {
    if (xml_element.hasAttribute(attribute)) {
        const arr_elms = xml_element.getAttribute(attribute).split(" ");
        if (arr_elms.length != 3) {
            return def_value;
        }
        return new THREE.Vector3(
            parseFloat(arr_elms[0]),
            parseFloat(arr_elms[1]),
            parseFloat(arr_elms[2]),
        )
    }
    return def_value;
}

/**
 * @param {Element} xml_element The XML element from which to get the attribute
 * @param {string} attribute The attribute to look for in the XML element
 * @param {THREE.Vector4} def_value The default value in case attribute not found
 */
export function safe_parse_vector4(xml_element, attribute, def_value) {
    if (xml_element.hasAttribute(attribute)) {
        const arr_elms = xml_element.getAttribute(attribute).split(" ");
        if (arr_elms.length != 4) {
            return def_value;
        }
        return new THREE.Vector4(
            parseFloat(arr_elms[0]),
            parseFloat(arr_elms[1]),
            parseFloat(arr_elms[2]),
            parseFloat(arr_elms[3]),
        );
    }
    return def_value;
}

/**
 * @param {Element} xml_element The XML element from which to get the attribute
 * @returns {[THREE.Vector3, THREE.Vector3]}
 */
export function safe_parse_fromto(xml_element) {
    if (!xml_element.hasAttribute("fromto")) {
        console.error("Can't parse fromto if not present");
        return [new THREE.Vector3(), new THREE.Vector3()];
    }
    const arr_elms = xml_element.getAttribute("fromto").split(" ");
    if (arr_elms.length != 6) {
        console.error("Given fromto doesn't have 6 elements");
        return [new THREE.Vector3(), new THREE.Vector3()];
    }
    const from = new THREE.Vector3(
        parseFloat(arr_elms[0]),
        parseFloat(arr_elms[1]),
        parseFloat(arr_elms[2]),
    );
    const to = new THREE.Vector3(
        parseFloat(arr_elms[3]),
        parseFloat(arr_elms[4]),
        parseFloat(arr_elms[5]),
    );
    return [from, to];
}

/**
 * @param {Element} xml_element The XML element from which to get the attribute
 * @param {string} attribute The attribute to look for in the XML element
 * @param {THREE.Color} def_value The default value in case attribute not found
 */
export function safe_parse_rgb(xml_element, attribute, def_value) {
    const color_vec = safe_parse_vector3(
        xml_element, attribute,
        new THREE.Vector3(def_value.r, def_value.g, def_value.b)
    );
    return new THREE.Color(
        Math.max(0, Math.min(1, color_vec.x)),
        Math.max(0, Math.min(1, color_vec.y)),
        Math.max(0, Math.min(1, color_vec.z)),
    );
}

/**
 * @param {Element} xml_element The XML element from which to get the attribute
 * @param {THREE.Quaternion} def_value The default value in case attribute not found
 */
export function safe_parse_quaternion(xml_element, def_value) {
    if (xml_element.hasAttribute("quat")) {
        const arr_elms = xml_element.getAttribute("quat").split(" ");
        if (arr_elms.length != 4) {
            return def_value;
        }
        return new THREE.Quaternion(
            parseFloat(arr_elms[1]),
            parseFloat(arr_elms[2]),
            parseFloat(arr_elms[3]),
            parseFloat(arr_elms[0]),
        );
    }
    return def_value;
}

/**
 * @param {Element} xml_element The XML element from which to get the attribute
 * @param {THREE.Euler} def_value The default value in case attribute not found
 */
export function safe_parse_euler(xml_element, def_value) {
    if (xml_element.hasAttribute("euler")) {
        const arr_elms = xml_element.getAttribute("euler").split(" ");
        if (arr_elms.length != 3) {
            return def_value;
        }
        return new THREE.Euler(
            parseFloat(arr_elms[0]),
            parseFloat(arr_elms[1]),
            parseFloat(arr_elms[2]),
        );
    }
    return def_value;
}

/**
 * @param {Element} xml_element The XML element from which to get the attribute
 * @returns {THREE.Matrix4}
 */
export function safe_parse_transform(xml_element) {
    const pos = safe_parse_vector3(xml_element, "pos", new THREE.Vector3());
    let quat = new THREE.Quaternion();
    if (xml_element.hasAttribute("quat")) {
        quat = safe_parse_quaternion(xml_element, new THREE.Quaternion());
    }
    else if (xml_element.hasAttribute("euler")) {
        const euler = safe_parse_euler(xml_element, new THREE.Euler());
        quat.setFromEuler(euler);
    }
    else if (xml_element.hasAttribute("axisangle")) {
        console.error("Orientation by 'axisangle' is not supported yet");
    }
    else if (xml_element.hasAttribute("xyaxes")) {
        console.error("Orientation by 'xyaxes' is not supported yet");
    }
    else if (xml_element.hasAttribute("zaxis")) {
        console.error("Orientation by 'zaxis' is not supported yet");
    }

    const transform = new THREE.Matrix4();
    transform.compose(pos, quat, new THREE.Vector3(1.0, 1.0, 1.0));
    return transform;
}

/**
 * @param {Element} xml_element
 * @returns {[THREE.Vector3, THREE.Quaternion]}
 */
export function safe_parse_pose(xml_element) {
    const pos = safe_parse_vector3(xml_element, "pos", new THREE.Vector3());
    let quat = new THREE.Quaternion();
    if (xml_element.hasAttribute("quat")) {
        quat = safe_parse_quaternion(xml_element, new THREE.Quaternion());
    }
    else if (xml_element.hasAttribute("euler")) {
        const euler = safe_parse_euler(xml_element, new THREE.Euler());
        quat.setFromEuler(euler);
    }
    else if (xml_element.hasAttribute("axisangle")) {
        console.error("Orientation by 'axisangle' is not supported yet");
    }
    else if (xml_element.hasAttribute("xyaxes")) {
        console.error("Orientation by 'xyaxes' is not supported yet");
    }
    else if (xml_element.hasAttribute("zaxis")) {
        console.error("Orientation by 'zaxis' is not supported yet");
    }

    return [pos, quat];
}

/**
 * @param {Element} xml_element The XML element from which to get the attribute
 * @param {THREE.Scene} scene The scene on which this camera will be added
 * @returns {THREE.Light}
 */
export function safe_parse_light(xml_element, scene) {
    const is_directional = safe_parse_boolean(xml_element, "directional", false);
    const diffuse = safe_parse_rgb(xml_element, "diffuse", new THREE.Color(0.7, 0.7, 0.7));

    let light = null;
    if (is_directional) {
        light = new THREE.DirectionalLight(diffuse.getHex(), 3);
        const light_helper = new THREE.DirectionalLightHelper(light);
        scene.add(light_helper);
    }
    else {
        light = new THREE.SpotLight(diffuse.getHex(), 3);
        const light_helper = new THREE.SpotLightHelper(light);
        scene.add(light_helper);
    }

    if (light !== null) {
        // Set the direction of the light
        const dir = safe_parse_vector3(xml_element, "dir", new THREE.Vector3(0, 0, -1));
        dir.normalize();

        const target_position = new THREE.Vector3();
        target_position.addVectors(light.position, dir);
        light.target.position.copy(target_position);
        scene.add(light.target);

        // Parse remaining attributes
        const cast_shadow = safe_parse_boolean(xml_element, "castshadow", true);
        const attenuation = safe_parse_vector3(xml_element, "attenuation", new THREE.Vector3(1, 0, 0));

        light.penumbra = 0.5;
        light.castShadow = cast_shadow;
    }

    return light;
}

export class mjXReader {

    constructor() {
        this.readingDefaults = false;
        this.spec = null;

        this._numLights = 0;
        this._numGeoms = 0;
        this._numJoints = 0;
        this._numBodies = 0;
        this._numTextures = 0;
        this._numMaterials = 0;
        this._numMeshes = 0;
    }

    /**
     * @param {Element} root 
     */
    parse(root) {
        const modelName = safe_parse_string(root, "model", "");
        this.spec = new mjSpec(modelName);
        this.readingDefaults = false;

        this._numLights = 0;
        this._numGeoms = 0;
        this._numJoints = 0;
        this._numBodies = 0;
        this._numTextures = 0;
        this._numMaterials = 0;
        this._numMeshes = 0;

        for (const elem of root.children) {
            if (elem.tagName == "default") {
                this.readingDefaults = true;
                this.parse_default(elem, this.spec.defaults['main']);
                this.readingDefaults = false;
            }
            else if (elem.tagName == "asset") {
                this.parse_assets_section(elem);
            }
            else if (elem.tagName == "worldbody") {
                this.parse_worldbody_section(elem);
            }
        }

        this.replace_defaults();
    }

    /**
     * @param {Element} elem
     * @param {mjsDefault} def
     */
    parse_default(elem, def) {
        for (const child_elem of elem.children) {
            switch (child_elem.tagName) {
                case "light": {
                    def.light = this.parse_one_light(child_elem);
                    break;
                }
                case "geom": {
                    def.geom = this.parse_one_geom(child_elem);
                    break;
                }
                case "joint": {
                    def.joint = this.parse_one_joint(child_elem);
                    break;
                }
                case "body": {
                    def.body = this.parse_one_body(child_elem);
                    break;
                }
                case "material": {
                    def.material = this.parse_one_material(child_elem);
                    break;
                }
                case "default": {
                    const class_name = safe_parse_string(child_elem, "class", "");
                    if (class_name == "") {
                        console.warn("Found a default without a class name");
                    }
                    const child_def = new mjsDefault(class_name);
                    child_def.parent = def;
                    def.children.push(child_def);
                    this.spec.defaults[child_def.name] = child_def;
                    this.parse_default(child_elem, child_def);
                    break;
                }
            }
        }
    }

    /**
     * @param {Element} elem
     */
    parse_assets_section(elem) {
        for (const child_elem of elem.children) {
            switch (child_elem.tagName) {
                case "texture": {
                    const texture = this.parse_one_texture(child_elem);
                    this.spec.textures[texture.name] = texture;
                    break;
                }
                case "material": {
                    const material = this.parse_one_material(child_elem);
                    this.spec.materials[material.name] = material;
                    break;
                }
                case "mesh": {
                    const mesh = this.parse_one_mesh(child_elem);
                    this.spec.meshes[mesh.name] = mesh;
                    break;
                }
            }
        }
    }

    /**
     * @param {Element} elem
     */
    parse_worldbody_section(elem) {
        const stack = [{ "xml": elem, "parent": null }];
        while (stack.length > 0) {
            const tuple = stack.shift();
            const xml = tuple["xml"];
            const parent = tuple["parent"];
            switch (xml.tagName) {
                case "worldbody": {
                    const worldbody = new mjsWorldbody();
                    for (const child_elem of xml.children) {
                        stack.push({"xml": child_elem, "parent": worldbody});
                    }
                    this.spec.worldbody = worldbody;
                    break;
                }
                case "body": {
                    const body = this.parse_one_body(xml);
                    for (const child_elem of xml.children) {
                        stack.push({"xml": child_elem, "parent": body});
                    }
                    this.spec.bodies.push(body);
                    if (parent != null) {
                        body.parent = parent;
                        if (parent instanceof mjsWorldbody) {
                            parent.children.push(body);
                        }
                        else if (parent instanceof mjsBody) {
                            parent.bodies.push(body);
                        }
                    }
                    break;
                }
                case "light": {
                    const light = this.parse_one_light(xml);
                    if (parent != null) {
                        light.parent = parent;
                        if (parent instanceof mjsWorldbody) {
                            parent.children.push(light);
                        }
                        else if (parent instanceof mjsBody) {
                            parent.lights.push(light);
                        }
                        else {
                            console.error("Light object can only have 'body' and 'worldbody' as parents");
                        }
                    }
                    break;
                }
                case "geom": {
                    const geom = this.parse_one_geom(xml);
                    if (parent != null) {
                        geom.parent = parent;
                        if (parent instanceof mjsWorldbody) {
                            parent.children.push(geom);
                        }
                        else if (parent instanceof mjsBody) {
                            parent.geoms.push(geom);
                        }
                        else {
                            console.error("Geom object can only have 'body' and 'worldbody' as parents");
                        }
                    }
                    break;
                }
                case "joint": {
                    const joint = this.parse_one_joint(xml);
                    if (parent != null) {
                        joint.parent = parent;
                        if (parent instanceof mjsBody) {
                            parent.joints.push(joint);
                        }
                        else {
                            console.error("Joint object can only have 'body' as parent");
                        }
                    }
                    break;
                }
            }
        }
    }

    /**
     * @param {Element} elem 
     * @returns {mjsLight}
     */
    parse_one_light(elem) {
        const light = new mjsLight();
        light.name = safe_parse_string(elem, "name", "light-" + this._numLights.toString());
        light.pos = safe_parse_vector3(elem, "pos", new THREE.Vector3(0, 0, 0));
        light.dir = safe_parse_vector3(elem, "dir", new THREE.Vector3(0, 0, -1));
        light.directional = safe_parse_boolean(elem, "directional", false);
        light.castshadow = safe_parse_boolean(elem, "castshadow", true);
        light.attenuation = safe_parse_vector3(elem, "attenuation", new THREE.Vector3(1, 0, 0));
        light.cutoff = safe_parse_float(elem, "cutoff", 45.0);
        light.exponent = safe_parse_float(elem, "exponent", 10.0);
        light.ambient = safe_parse_rgb(elem, "ambient", new THREE.Color(0, 0, 0));
        light.diffuse = safe_parse_rgb(elem, "diffuse", new THREE.Color(0.7, 0.7, 0.7));
        light.specular = safe_parse_rgb(elem, "specular", new THREE.Color(0.3, 0.3, 0.3));
        light.class = safe_parse_string(elem, "class", "");
        if (!this.readingDefaults) {
            this._numLights++;
        }
        return light;
    }

    /**
     * @param {Element} elem 
     * @returns {mjsGeom}
     */
    parse_one_geom(elem) {
        const geom = new mjsGeom();
        geom.name = safe_parse_string(elem, "name", "geom-" + this._numGeoms.toString());
        geom.type = safe_parse_string(elem, "type", "");
        const [pos, quat] = safe_parse_pose(elem);
        geom.pos.copy(pos);
        geom.quat.copy(quat);
        if (elem.hasAttribute("size")) {
            const size_arr = elem.getAttribute("size").split(" ");
            for (let i = 0; i < size_arr.length; i++) {
                geom.size[i] = parseFloat(size_arr[i]);
            }
        }
//         switch (geom.type) {
//             case "sphere": {
//                 if (elem.hasAttribute("size")) {
//                     const radius = safe_parse_float(elem, "size", 0.1);
//                     geom.size.set(radius, radius, radius);
//                 }
//                 break;
//             }
//             case "plane": {
//                 geom.size = safe_parse_vector3(elem, "size", new THREE.Vector3(1, 1, 0.1));
//                 break;
//             }
//             case "box": {
//                 if (elem.hasAttribute("fromto")) {
//                     const space = safe_parse_float(elem, "size", 0.05);
//                     const [v_from, v_to] = safe_parse_fromto(elem);
//                     const vec = v_to.sub(v_from);
//                     const length = vec.length();
// 
//                     // Save half-sizes for the box
//                     geom.size.set(space, length / 2, space);
//                     geom.pos.copy(v_to.add(v_from).multiplyScalar(0.5));
//                     geom.quat.copy(z2quat(vec));
//                 }
//                 else {
//                     if (elem.hasAttribute("size")) {
//                         geom.size = safe_parse_vector3(elem, "size", new THREE.Vector3(0.1, 0.1, 0.1));
//                     }
//                 }
//                 break;
//             }
//             case "ellipsoid": {
//                 if (elem.hasAttribute("fromto")) {
//                     console.error("Got 'fromto' in ellipsoid geom, which is not supported yet");
//                 }
//                 else {
//                     if (elem.hasAttribute("size")) {
//                         geom.size = safe_parse_vector3(elem, "size", new THREE.Vector3(0.1, 0.2, 0.3));
//                     }
//                 }
//                 break;
//             }
//             case "cylinder":
//             case "capsule": {
//                 if (elem.hasAttribute("fromto")) {
//                     const radius = safe_parse_float(elem, "size", 0.05);
//                     const [v_from, v_to] = safe_parse_fromto(elem);
//                     const vec = v_to.sub(v_from);
//                     const length = vec.length();
// 
//                     // Save radius + half-length
//                     geom.size.set(radius, length / 2, radius);
//                     geom.pos.copy(v_to.add(v_from).multiplyScalar(0.5));
//                     geom.quat.copy(z2quat(vec));
//                 }
//                 else {
//                     if (elem.hasAttribute("size")) {
//                         const size_arr = elem.getAttribute("size").split(" ");
//                         const radius = parseFloat(size_arr[0]);
//                         const half_length = parseFloat(size_arr[1]);
//                         geom.size.set(radius, half_length, radius);
//                         console.info("geom.size: " + geom.size);
//                     }
//                 }
//                 break;
//             }
// 
//             default:
//                 break;
//         }

        geom.material = safe_parse_string(elem, "material", "");
        geom.rgba = safe_parse_vector4(elem, "rgba", new THREE.Vector4(0.5, 0.5, 0.5, 1.0));
        geom.group = safe_parse_int(elem, "group", 0);
        geom.hfieldname = safe_parse_string(elem, "hfieldname", "");
        geom.meshname = safe_parse_string(elem, "meshname", "");
        geom.class = safe_parse_string(elem, "class", "");
        if (!this.readingDefaults) {
            this._numGeoms++;
        }
        return geom;
    }

    /**
     * @param {Element} elem
     * @return {mjsJoint}
     */
    parse_one_joint(elem) {
        const joint = new mjsJoint();
        joint.name = safe_parse_string(elem, "name", "joint-" + this._numJoints.toString());
        joint.class = safe_parse_string(elem, "class", "");
        joint.type = safe_parse_string(elem, "type", "hinge");
        joint.group = safe_parse_int(elem, "group", 0);
        joint.pos = safe_parse_vector3(elem, "pos", new THREE.Vector3(0, 0, 0));
        joint.axis = safe_parse_vector3(elem, "axis", new THREE.Vector3(0, 0, 1));
        joint.stiffness = safe_parse_float(elem, "stiffness", 0.0);
        joint.range = safe_parse_vector2(elem, "range", new THREE.Vector2(0, 0));
        joint.limited = safe_parse_string(elem, "limited", "auto");
        if (!this.readingDefaults) {
            this._numJoints++;
        }
        return joint;
    }

    /**
     * @param {Element} elem 
     * @returns {mjsBody}
     */
    parse_one_body(elem) {
        const body = new mjsBody();
        body.name = safe_parse_string(elem, "name", "body-" + this._numBodies.toString());
        body.childclass = safe_parse_string(elem, "childclass", "");
        const [pos, quat] = safe_parse_pose(elem);
        body.pos.copy(pos);
        body.quat.copy(quat);
        if (!this.readingDefaults) {
            this._numBodies++;
        }
        return body;
    }

    /**
     * @param {Element} elem
     * @return {mjsTexture}
     */
    parse_one_texture(elem) {
        const texture = new mjsTexture();
        texture.name = safe_parse_string(elem, "name", "texture-" + this._numTextures.toString());
        texture.type = safe_parse_string(elem, "type", "cube");
        texture.file = safe_parse_string(elem, "file", "");
        texture.builtin = safe_parse_string(elem, "builtin", "none");
        texture.rgb1 = safe_parse_rgb(elem, "rgb1", new THREE.Color(0.8, 0.8, 0.8));
        texture.rgb2 = safe_parse_rgb(elem, "rgb2", new THREE.Color(0.5, 0.5, 0.5));
        texture.mark = safe_parse_string(elem, "mark", "none");
        texture.markrgb = safe_parse_rgb(elem, "markrgb", new THREE.Color(0, 0, 0));
        texture.random = safe_parse_float(elem, "random", 0.01);
        texture.width = safe_parse_int(elem, "width", 0);
        texture.height = safe_parse_int(elem, "height", 0);
        texture.hflip = safe_parse_boolean(elem, "hflip", false);
        texture.vflip = safe_parse_boolean(elem, "vflip", false);
        if (!elem.hasAttribute("name")) {
            // Get texture name from file name
            texture.name = texture.file.replace(/^.*[\\/]/, "");
        }
        if (!this.readingDefaults) {
            this._numTextures++;
        }
        return texture;
    }

    /**
     * @param {Element} elem
     * @return {mjsMaterial}
     */
    parse_one_material(elem) {
        const material = new mjsMaterial();
        material.name = safe_parse_string(elem, "name", "");
        material.class = safe_parse_string(elem, "class", "");
        material.texture = safe_parse_string(elem, "texture", "");
        material.texuniform = safe_parse_boolean(elem, "texuniform", false);
        material.texrepeat = safe_parse_vector2(elem, "texrepeat", new THREE.Vector2(1, 1));
        material.emission = safe_parse_float(elem, "emission", 0.0);
        material.specular = safe_parse_float(elem, "specular", 0.5);
        material.shininess = safe_parse_float(elem, "shininess", 0.5);
        material.reflectance = safe_parse_float(elem, "reflectance", 0.0);
        material.metallic = safe_parse_float(elem, "metallic", 0.0);
        material.roughness = safe_parse_float(elem, "roughness", 1.0);
        material.rgba = safe_parse_vector4(elem, "rgba", new THREE.Vector4(1, 1, 1, 1));
        if (!this.readingDefaults) {
            this._numMaterials++;
        }
        return material;
    }

    /**
     * @param {Element} elem
     * @return {mjsMesh}
     */
    parse_one_mesh(elem) {
        const mesh = new mjsMesh();
        mesh.name = safe_parse_string(elem, "name", "");
        mesh.class = safe_parse_string(elem, "class", "");
        mesh.content_type = safe_parse_string(elem, "content_type", "");
        mesh.file = safe_parse_string(elem, "file", "");
        mesh.scale = safe_parse_vector3(elem, "scale", new THREE.Vector3(1, 1, 1));
        mesh.inertia = safe_parse_string(elem, "inertia", "legacy");
        mesh.smoothnormal = safe_parse_boolean(elem, "smoothnormal", false);
        mesh.maxhullvert = safe_parse_int(elem, "maxhullvert", -1);
        //// mesh.vertex = [];
        //// mesh.normal = [];
        //// mesh.texcoord = [];
        //// mesh.face = [];
        mesh.refpos = safe_parse_vector3(elem, "refpos", new THREE.Vector3());
        mesh.refquat = safe_parse_quaternion(elem, "refquat", new THREE.Quaternion());
        if (!elem.hasAttribute("name")) {
            // Get mesh name from file name
            mesh.name = mesh.file.replace(/^.*[\\/]/, "");
        }
        if (!this.readingDefaults) {
            this._numMeshes++;
        }
        return mesh;
    }

    replace_defaults() {
        const stack = [{"node": this.spec.worldbody, "class": "", "childclass": ""}];
        while (stack.length > 0) {
            const tuple = stack.shift();
            const node = tuple["node"];
            const cls = tuple["class"];
            const childclass = tuple["childclass"];
            if (node instanceof mjsWorldbody) {
                for (const child of node.children) {
                    stack.push({"node": child, "class": "", "childclass": ""});
                }
            }
            else if (node instanceof mjsBody) {
                for (const geom of node.geoms) {
                    stack.push({"node": geom, "class": node.childclass == "" ? geom.class : node.childclass, "childclass": node.childclass == "" ? childclass : node.childclass});
                }
                for (const joint of node.joints) {
                    stack.push({"node": joint, "class": node.childclass == "" ? joint.class : node.childclass, "childclass": node.childclass});
                }
                for (const light of node.lights) {
                    stack.push({"node": light, "class": node.childclass == "" ? light.class : node.childclass, "childclass": node.childclass});
                }
                for (const body of node.bodies) {
                    stack.push({"node": body, "class": body.childclass, "childclass": body.childclass != "" ? body.childclass : (node.childclass != "" ? node.childclass : childclass)});
                }
            }
            else if (node instanceof mjsGeom) {
                if (node.type == "") {
                    this.replace_one_geom(node, "type", cls, childclass);
                }
                if (node.size[0] == 0 && node.size[1] == 0 && node.size[2] == 0) {
                    this.replace_one_geom(node, "size", cls, childclass);
                }
                if (node.material == "") {
                    this.replace_one_geom(node, "material", cls, childclass);
                }
                if (node.rgba.x == 0.5 && node.rgba.y == 0.5 && node.rgba.z == 0.5 && node.rgba.w == 1) {
                    this.replace_one_geom(node, "rgba", cls, childclass);
                }
                if (node.group == 0) {
                    this.replace_one_geom(node, "group", cls, childclass);
                }
            }
        }
    }

    /**
     * 
     * @param {mjsGeom} node 
     * @param {string} attribute
     * @param {string} cls 
     * @param {string} childclass 
     */
    replace_one_geom(node, attribute, cls, childclass) {
        if (cls != "") {
            if (this.spec.defaults[cls].geom != null) {
                node[attribute] = this.spec.defaults[cls].geom[attribute];
            }
        }
        else if (childclass != "") {
            if (this.spec.defaults[childclass].geom != null) {
                node[attribute] = this.spec.defaults[childclass].geom[attribute];
            }
        }
        else {
            if (this.spec.defaults["main"].geom != null) {
                node[attribute] = this.spec.defaults["main"].geom[attribute];
            }
        }
    }
}





/**
 * @param {Element} xml_element The XML element from which to get the attribute
 * @returns {THREE.Mesh}
 */
export function safe_parse_geom(xml_element) {
    const type = safe_parse_string(xml_element, "type", "sphere");
    // Parse the geometric-related data
    let geometry = null;
    let pos = null;
    let quat = null;
    switch (type) {
        case "sphere": {
            const radius = parseFloat(xml_element.getAttribute("size"));
            geometry = new THREE.SphereGeometry(radius);
            break;
        }

        case "plane": {
            const size_arr = xml_element.getAttribute("size").split(" ");
            const size_x = 2 * parseFloat(size_arr[0]);
            const size_y = 2 * parseFloat(size_arr[1]);
            const grid_spacing = parseFloat(size_arr[2]);
            geometry = new THREE.PlaneGeometry(
                size_x,
                size_y,
                size_x / grid_spacing,
                size_y / grid_spacing,
            );
            break;
        }

        case "box": {
            const size_arr = xml_element.getAttribute("size").split(" ");
            const size_x = 2 * parseFloat(size_arr[0]);
            const size_y = 2 * parseFloat(size_arr[1]);
            const size_z = 2 * parseFloat(size_arr[2]);
            geometry = new THREE.BoxGeometry(size_x, size_y, size_z);
            break;
        }

        case "ellipsoid": {
            const size_arr = xml_element.getAttribute("size").split(" ");
            const radius_x = parseFloat(size_arr[0]);
            const radius_y = parseFloat(size_arr[1]);
            const radius_z = parseFloat(size_arr[2]);
            geometry = new THREE.SphereGeometry(1.0);
            geometry.scale(radius_x, radius_y, radius_z);
            break;
        }

        case "cylinder": {
            const has_fromto = xml_element.hasAttribute("fromto");
            if (has_fromto) {
                const radius = parseFloat(xml_element.getAttribute("size"));
                const [v_from, v_to] = safe_parse_fromto(xml_element);
                const vec = v_to.sub(v_from);
                const length = vec.length();
                geometry = new THREE.CylinderGeometry(radius, radius, length);

                pos = v_to.add(v_from).multiplyScalar(0.5);
                quat = z2quat(vec);
            }
            else {
                const size_arr = xml_element.getAttribute("size").split(" ");
                const radius = parseFloat(size_arr[0]);
                const length = 2 * parseFloat(size_arr[1]);
                geometry = new THREE.CylinderGeometry(radius, radius, length);
            }
            break;
        }

        case "capsule": {
            const has_fromto = xml_element.hasAttribute("fromto");
            if (has_fromto) {
                const radius = parseFloat(xml_element.getAttribute("size"));
                const [v_from, v_to] = safe_parse_fromto(xml_element);
                const vec = v_to.sub(v_from);
                const length = vec.length();
                geometry = new THREE.CapsuleGeometry(radius, length);

                pos = v_to.add(v_from).multiplyScalar(0.5);
                quat = z2quat(vec);
            }
            else {
                const size_arr = xml_element.getAttribute("size").split(" ");
                const radius = parseFloat(size_arr[0]);
                const length = 2 * parseFloat(size_arr[1]);
                geometry = new THREE.CapsuleGeometry(radius, length);
            }
            break;
        }

        case "hfield": {


            break;
        }

        case "mesh": {


            break;
        }

        default:
            break;
    }

    if (geometry != null) {
        geometry.castShadow = true;
        geometry.receiveShadow = true;
    }

    // Parse the material-related data
    const rgba = safe_parse_vector4(xml_element, "rgba", new THREE.Vector4(0.5, 0.5, 0.5, 1));
    const color = new THREE.Color(rgba.x, rgba.y, rgba.z);
    const alpha = rgba.w;

    const material = new THREE.MeshPhongMaterial(
        {
            "color": color,
            "opacity": alpha,
            "side": THREE.DoubleSide,
        }
    );

    // Construct the mesh that will represent this geom
    if (geometry == null || material == null) {
        return null;
    }
    const mesh = new THREE.Mesh(geometry, material);
    const local_tf = safe_parse_transform(xml_element);
    if (pos != null && quat != null) {
        local_tf.compose(pos, quat, new THREE.Vector3(1, 1, 1));
    }

    let position = new THREE.Vector3();
    let quaternion = new THREE.Quaternion();
    let scale = new THREE.Vector3(1, 1, 1);
    local_tf.decompose(position, quaternion, scale);
    mesh.position.copy(position);
    mesh.quaternion.copy(quaternion);

    if (type == "cylinder" || type == "capsule") {
        mesh.rotateX(-Math.PI * 0.5);
    }

    return mesh;
}



