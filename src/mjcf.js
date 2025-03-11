import * as THREE from 'three';

export class mjsLight {
    constructor() {
        this.name = "";
        this.pos = new THREE.Vector3(0, 0, 0);
        this.dir = new THREE.Vector3(0, 0, -1);
        this.directional = false;
        this.castshadow = true;
        this.attenuation = new THREE.Vector3(1, 0, 0);
        this.cutoff = 45.0;
        this.exponent = 10.0;
        this.ambient = new THREE.Color(0, 0, 0);
        this.diffuse = new THREE.Color(0.7, 0.7, 0.7);
        this.specular = new THREE.Color(0.3, 0.3, 0.3);
        this.class = "";
        this.parent = null;
    }
}

export class mjsGeom {
    constructor() {
        this.name = "";
        this.type = "";
        this.pos = new THREE.Vector3();
        this.quat = new THREE.Quaternion();
        this.size = [0, 0, 0];
        this.material = "";
        this.rgba = new THREE.Vector4(0.5, 0.5, 0.5, 1);
        this.group = 0;
        this.hfieldname = "";
        this.meshname = "";
        this.class = "";
        this.parent = null;
    }
}

export class mjsJoint {
    constructor() {
        this.name = "";
        this.class = "";
        this.type = "hinge";
        this.group = 0;
        this.pos = new THREE.Vector3();
        this.axis = new THREE.Vector3(0, 0, 1);
        this.stiffness = 0.0;
        this.range = new THREE.Vector2(0, 0);
        this.limited = "auto";
        this.parent = null;
    }
}

export class mjsBody {
    constructor() {
        this.name = "";
        this.childclass = "";
        this.pos = new THREE.Vector3();
        this.quat = new THREE.Quaternion();
        /** @type {mjsGeom[]} */
        this.geoms = [];
        /** @type {mjsJoint[]} */
        this.joints = [];
        /** @type {mjsLight[]} */
        this.lights = [];
        /** @type {mjsBody[]} */
        this.bodies = [];
        this.parent = null;
    }
}

export class mjsTexture {

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

export class mjsMesh {

    constructor() {
        this.name = "";
        this.class = "";
        this.content_type = "";
        this.file = "";
        this.scale = new THREE.Vector3(1, 1, 1);
        this.inertia = "legacy";
        this.smoothnormal = false;
        this.maxhullvert = -1;
        this.vertex = [];
        this.normal = [];
        this.texcoord = [];
        this.face = [];
        this.refpos = new THREE.Vector3();
        this.refquat = new THREE.Quaternion();
    }
};

export class mjsMaterial {

    constructor() {
        this.name = "";
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

export class mjsWorldbody {

    constructor() {
        this.children = [];
    }
};

export class mjsDefault {

    /**
     * @param {string} name The name of the class for this default
     */
    constructor(name) {
        this.name = name;
        this.geom = null;
        this.light = null;
        this.camera = null;
        this.joint = null;
        this.body = null;
        this.material = null;

        this.parent = null;
        this.children = [];
    }
};

export class mjSpec {

    constructor(modelName) {
        this.modelName = modelName;
        this.defaults = { "main": new mjsDefault("main") };
        this.textures = {};
        this.materials = {};
        this.meshes = {};
        this.bodies = [];
        this.worldbody = null;
    }
};




