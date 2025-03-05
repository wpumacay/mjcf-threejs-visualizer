import * as THREE from 'three';

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

        light.position.set(-dir.x, -dir.y, -dir.z);
        // const target_position = new THREE.Vector3();
        // target_position.addVectors(light.position, dir);
        // light.target.position.copy(target_position);

        //// // Parse remaining attributes
        //// const cast_shadow = safe_parse_boolean(xml_element, "castshadow", true);
        //// const attenuation = safe_parse_vector3(xml_element, "attenuation", new THREE.Vector3(1, 0, 0));

        light.castShadow = true;
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
        }
    );

    // Construct the mesh that will represents this geom
    if (geometry == null || material == null) {
        return null;
    }
    return new THREE.Mesh(geometry, material);
}

