import { FkEditor } from "./FkBoard.js";

if ('customElements' in window) {
    document.querySelector('.not-supported').remove();
    new FkEditor(document.querySelector('.connection'), document.querySelector('.editor'));

    const address = document.getElementById('address');
    const port = document.getElementById('port');
    address.addEventListener('input', () => {
        const sel = address.selectionStart;
        const sep = address.value.lastIndexOf(':');
        if (sep > -1) {
            if (sel > sep) {
                port.focus();
            }
            port.value = address.value.substring(sep + 1);
            address.value = address.value.substring(0, sep);
        }
    });
}