import { mjXReader } from './src/parser.js';
import { Visualizer } from './src/visualizer.js';

/** @type {Visualizer} */
var visualizer = null;

function init() {
    visualizer = new Visualizer(window.innerWidth, window.innerHeight);

    window.addEventListener("resize", resize);

    // const model_uri = "./assets/mustard_bottle/model.xml";
    const model_uri = "./assets/kitchen/kitchen.xml";
    // const model_uri = "./assets/robothor/robothor.xml";
    // const model_uri = "./assets/elements/wall_2.xml";

    fetch(model_uri)
        .then(response => response.text())
        .then(xml_str => {
            const parser = new DOMParser();
            const xml_doc = parser.parseFromString(xml_str, "text/xml");

            const mjreader = new mjXReader();
            mjreader.parse(xml_doc.children[0]);

            visualizer.initFromSpec(mjreader.spec, model_uri);
        });
}

function animate() {
    requestAnimationFrame(animate);
    visualizer.update();
}

function resize() {
    visualizer.onResize(window.innerWidth, window.innerHeight);
}

init();
animate();


