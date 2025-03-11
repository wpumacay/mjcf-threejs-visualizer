import * as THREE from 'three';
import { mjXReader } from './src/parser';
import { Visualizer } from './src/visualizer';

/** @type {Visualizer} */
var visualizer = null;

function init() {
    visualizer = new Visualizer(window.innerWidth, window.innerHeight);

    window.addEventListener("resize", resize);

    fetch("./assets/humanoid.xml")
        .then(response => response.text())
        .then(xml_str => {
            const parser = new DOMParser();
            const xml_doc = parser.parseFromString(xml_str, "text/xml");

            const mjreader = new mjXReader();
            mjreader.parse(xml_doc.children[0]);

            visualizer.initFromSpec(mjreader.spec);
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


