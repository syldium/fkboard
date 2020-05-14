import { FkEditor } from "./FkBoard.js";

if ('customElements' in window) {
    document.querySelector('.not-supported').remove();
    new FkEditor(document.getElementById('connection'));
}