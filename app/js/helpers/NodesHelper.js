export class NodesHelper
{
    /**
     * Remove wrapper element while keeping child elements.
     * 
     * @param {HTMLElement} wrapper 
     */
    static unwrap(wrapper)
    {
        const fragment = document.createDocumentFragment();
        while (wrapper.firstChild) {
            const child = wrapper.removeChild(wrapper.firstChild);
            fragment.appendChild(child);
        }
        wrapper.parentNode.replaceChild(fragment, wrapper);
    }

    /**
     * Make the element wrap the currently selected text.
     * 
     * @param {HTMLElement} element 
     */
    static surroundSelection(element)
    {
        const sel = window.getSelection();
        if (sel.rangeCount) {
            const range = sel.getRangeAt(0).cloneRange();
            try {
                range.surroundContents(element);
            } catch (nonTextNodeError) {
                const selectedText = range.extractContents();
                for (const node of selectedText.children) {
                    if (node.tagName.toLowerCase() === 'br') {
                        alert('Impossible de changer le formatage sur plusieurs lignes.');
                        range.commonAncestorContainer.appendChild(selectedText);
                        return;
                    }
                }
                element.appendChild(selectedText);
                range.insertNode(element);
                return;
            }
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }

    /**
     * Flatten children elements of a container.
     * 
     * @param {HTMLElement} container 
     * @returns {HTMLCollection}
     */
    static nodeFlatten(container)
    {
        for (const el of Array.from(container.children)) {
            if (el.tagName.toLowerCase() === 'br' || !el.firstElementChild) {
                continue;
            }
            if (el.tagName.toLowerCase() === 'div') {
                if (el.lastElementChild.tagName.toLowerCase() === 'br') {
                    container.insertBefore(el.lastElementChild, el);
                    const range = document.createRange();
                    const sel = window.getSelection();
                    range.setStart(el, 0);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }

            for (const node of NodesHelper.nodeFlattenArray(el)) {
                container.insertBefore(node, el);
            }
            if (el.parentNode !== container || !el.hasChildNodes()) {
                el.remove();
            }
        }
        return container.childNodes;
    }

    /**
     * Return the list of elements contained.
     * 
     * @param {HTMLElement} element
     * @returns {HTMLElement[]}
     */
    static nodeFlattenArray(element)
    {
        const nodes = [];
        for (const el of Array.from(element.childNodes)) {
            if (el.nodeType === Node.TEXT_NODE) {
                // Empty text node
                if (el.textContent.length < 1) {
                    continue;
                }

                // Create a new span element and copy styles
                const span = element.cloneNode(false);
                const computedStyle = window.getComputedStyle(element, null);
                for (const key of ['color', 'font-weight', 'font-style', 'text-decoration']) {
                    span.style.setProperty(key, computedStyle.getPropertyValue(key), computedStyle.getPropertyPriority(key));
                }
                span.append(el);
                nodes.push(span);
            } else if (el.nodeType === Node.ELEMENT_NODE) {
                nodes.push(...NodesHelper.nodeFlattenArray(el).filter(el => el.hasChildNodes()));
            }
        }
        return nodes;
    }
}