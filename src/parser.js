import * as THREE from 'three';
import { z2quat } from './math';

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

    const transform = new THREE.Matrix4();
    transform.compose(pos, quat, new THREE.Vector3(1.0, 1.0, 1.0));
    return transform;
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


class AssetTexture {

    constructor() {
        this.name = "";
        this.type = "2d";
        this.file = "";
        this.builtin = "none"; // one of: none, gradient, checker, flat
        this.rgb1 = new THREE.Color(0.8, 0.8, 0.8);
        this.rgb2 = new THREE.Color(0.5, 0.5, 0.5);
        this.mark = "none"; // one of: none, edge, cross, random
        this.markrgb = new THREE.Color(0, 0, 0);
        this.random = 0.01;
        this.width = 0;
        this.height = 0;
        this.hflip = false;
        this.vflip = false;
    }
};

class AssetMaterial {

    /**
     * @param {string} name A required string representing the material's name
     */
    constructor(name) {
        this.name = name;
        this.class = "";
        this.texture = "";
        this.texuniform = false;
        this.texrepeat = new THREE.Vector2(1, 1);
        this.emission = 0.0;
        this.specular = 0.5;
        this.shininess = 0.5;
        this.reflectance = 0.0;
        this.metallic = 0.0;
        this.roughness = 1.0;
        this.rgba = new THREE.Vector4(1, 1, 1, 1);
    }
};



class ParserCtx {

    constructor() {
        /** @type {Object.<string, AssetTexture>} */
        this.textures = {}
        /** @type {Object.<string, AssetMaterial>} */
        this.materials = {}
    }


}



/**
 * @param {Element} xml_element 
 */
export function parse_asset_section(xml_element) {
    /** @type {AssetTexture[]} */
    const textures = [];
    const xml_textures = xml_element.getElementsByTagName("texture");
    for (const xml_texture of xml_textures) {
        textures.push(parse_one_texture(xml_texture));
    }

    /** @type {AssetMaterial[]} */
    const materials = [];
    const xml_materials = xml_element.getElementsByTagName("material");
    for (const xml_material of xml_materials) {
        materials.push(parse_one_material(xml_material));
    }
}

/**
 * @param {Element} xml_element 
 * @return {AssetTexture}
 */
export function parse_one_texture(xml_element) {
    const asset_texture = new AssetTexture();
    asset_texture.name = safe_parse_string(xml_element, "name", "texture-" + NUM_TEXTURES.toString());
    asset_texture.type = safe_parse_string(xml_element, "type", "cube");
    asset_texture.file = safe_parse_string(xml_element, "file", "");
    asset_texture.builtin = safe_parse_string(xml_element, "builtin", "none");
    asset_texture.rgb1 = safe_parse_rgb(xml_element, "rgb1", new THREE.Color(0.8, 0.8, 0.8));
    asset_texture.rgb2 = safe_parse_rgb(xml_element, "rgb2", new THREE.Color(0.5, 0.5, 0.5));
    asset_texture.mark = safe_parse_string(xml_element, "mark", "none");
    asset_texture.markrgb = safe_parse_rgb(xml_element, "markrgb", new THREE.Color(0, 0, 0));
    asset_texture.random = safe_parse_float(xml_element, "random", 0.01);
    asset_texture.width = safe_parse_int(xml_element, "width", 0);
    asset_texture.height = safe_parse_int(xml_element, "height", 0);
    asset_texture.hflip = safe_parse_boolean(xml_element, "hflip", false);
    asset_texture.vflip = safe_parse_boolean(xml_element, "vflip", false);

    if (!xml_element.hasAttribute("name")) {
        // Get texture name from file name
        asset_texture.name = asset_texture.file.replace(/^.*[\\/]/, "");
    }

    NUM_TEXTURES++;
    return asset_texture;
}

/**
 * @param {Element} xml_element 
 * @return {AssetMaterial}
 */
export function parse_one_material(xml_element) {
    const name = xml_element.getAttribute("name");
    const asset_material = new AssetMaterial(name);
    asset_material.class = safe_parse_string(xml_element, "class", "");
    asset_material.texture = safe_parse_string(xml_element, "texture", "");
    asset_material.texuniform = safe_parse_boolean(xml_element, "texuniform", false);
    asset_material.texrepeat = safe_parse_vector2(xml_element, "texrepeat", new THREE.Vector2(1, 1));
    asset_material.emission = safe_parse_float(xml_element, "emission", 0.0);
    asset_material.specular = safe_parse_float(xml_element, "specular", 0.5);
    asset_material.shininess = safe_parse_float(xml_element, "shininess", 0.5);
    asset_material.reflectance = safe_parse_float(xml_element, "reflectance", 0.0);
    asset_material.metallic = safe_parse_float(xml_element, "metallic", 0.0);
    asset_material.roughness = safe_parse_float(xml_element, "roughness", 1.0);
    asset_material.rgba = safe_parse_vector4(xml_element, "rgba", new THREE.Vector4(1, 1, 1, 1));

    return asset_material;
}





