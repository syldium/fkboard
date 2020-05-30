import { FkEditor } from "./FkBoard.js";

if ('customElements' in window) {
    document.querySelector('.not-supported').remove();
    new FkEditor(document.querySelector('.connection'), document.querySelector('.editor'));
}