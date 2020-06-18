import { NodesHelper } from "../helpers/NodesHelper.js";

export const ColorCodes =
{
    '§4': '#be0000',
    '§c': '#fe3f3f',
    '§6': '#d9a334',
    '§e': '#fefe3f',
    '§2': '#00be00',
    '§a': '#3ffe3f',
    '§b': '#3ffefe',
    '§3': '#00bebe',
    '§1': '#0000be',
    '§9': '#3f3ffe',
    '§d': '#fe3ffe',
    '§5': '#be00be',
    '§f': '#ffffff',
    '§7': '#bebebe',
    '§8': '#3f3f3f',
    '§0': '#000000',
    '§l': 'bold',
    '§m': 'line-through',
    '§n': 'underline',
    '§o': 'italic'
}


export class RichTextEditor extends HTMLElement
{
    constructor(text = [''], specials = {})
    {
        super();
        this.text = text;
        this.specials = specials;
    }

    connectedCallback()
    {
        // Build color selector
        const colorsSelector = document.createElement('div');
        colorsSelector.classList.add('colors-selector');
        for (const color of Object.values(ColorCodes)) {
            if (color.charAt(0) !== '#') {
                continue;
            }
            // Build action button
            const select = document.createElement('button');
            select.classList.add('color-pick');
            select.style.backgroundColor = color;
            select.addEventListener('click', () => {
                // Create a surrounding span color
                var span = document.createElement('span');
                span.style.color = color;
                NodesHelper.surroundSelection(span);
                NodesHelper.nodeFlatten(this.div);
            });
            colorsSelector.appendChild(select);
        }
        this.appendChild(colorsSelector);

        // Create contenteditable div
        this.div = document.createElement('div');
        this.div.classList.add('scoreboard');
        this.div.spellcheck = false;
        this.div.setAttribute('contenteditable', 'true');
        this.div.addEventListener('input', () => {
            // Make sure that no line has exceeded the maximum length
            const text = this.toLegacyText();
            let tooLong = false;
            text.forEach(line => {
                if (line.length > 42) {
                    tooLong = true;
                }
            });
            tooLong = false;
            if (tooLong) {
                this.setLines(this.text);
            } else {
                this.text = text;
                this.applySpecials(this.div); // Lint specials tokens
                NodesHelper.nodeFlatten(this.div);
            }
        });
        this.setLines(this.text);
        this.appendChild(this.div);
    }

    setLines(lines)
    {
        // Remove potential previous nodes
        while (this.div.firstChild) {
            this.div.firstChild.remove();
        }
        const text = lines.length < 1 || lines[0] instanceof HTMLElement ? lines : this.fromLegacyTextLines(lines);
        text.forEach(el => this.div.appendChild(el)); // Add to DOM
        this.applySpecials(this.div); // Lint
    }

    /**
     * Convert one line with colors codes into a elements array.
     * 
     * @param {string} line 
     */
    fromLegacyText(line)
    {
        const elements = [];
        let span = document.createElement('span');
        let content = '';
        for (let i = 0; i < line.length; ++i) {
            const c = line.charAt(i);
            // Format code found
            if (c === '§') {
                ++i;
                if (i >= line.length) {
                    break;
                }

                // Determine style value
                const color = ColorCodes[c + line.charAt(i)];
                if (typeof color !== 'undefined') {
                    if (content.length > 0) {
                        let old = span;
                        span = document.createElement('span');
                        old.append(content);
                        content = '';
                        elements.push(old);
                    }

                    switch (color) {
                        case 'bold':
                            span.style.fontWeight = 'bold';
                            break;
                        case 'italic':
                            span.style.fontStyle = 'italic';
                            break;
                        case 'line-through':
                            span.style.textDecoration = 'line-through';
                            break;
                        case 'underline':
                            span.style.textDecoration = 'underline';
                            break;
                        default:
                            span.style.color = color;
                    }
                }
            } else {
                content += c;
            }
        }
        span.append(content);
        elements.push(span);
        return elements;
    }

    /**
     * Create an array of HTML elements from a list of strings with color codes
     * 
     * @param {array} text 
     */
    fromLegacyTextLines(text)
    {
        const elements = [];
        for (const line of text) {
            elements.push(...this.fromLegacyText(line));
            elements.push(document.createElement('br'));
        }
        return elements;
    }

    /**
     * Convert actual editor lines into color code translated lines list.
     */
    toLegacyText()
    {
        const lines = [];
        let format = '';
        for (const el of NodesHelper.nodeFlatten(this.div)) {
            if (el.nodeType === Node.TEXT_NODE) {
                lines[lines.length - 1] += el.textContent;
                continue;
            }

            if (el.tagName.toLowerCase() === 'br' || lines.length < 1) {
                lines.push('');
                format = '';
            }
            format = this.elementToColorCodes(el, format);
            const text = el.innerText.split('\n');
            lines[lines.length - 1] += format + text[0];
            if (text.length > 1) {
                // How did we get here ?
                lines.push(...text.filter((l, n) => n > 0));
            }
        }

        // Remove unnecessary codes
        for (let i = 0; i < lines.length; i++) {
            // White color is already the default color
            if (lines[i].startsWith('§f')) {
                lines[i] = lines[i].substring(2);
            }
            // No need at the end
            for (let c = lines[i].length - 2; c > 0; c -= 2) {
                if (lines[i].charAt(c) !== '§') {
                    break;
                }
                lines[i] = lines[i].substring(0, c);
            }
        }
        if (lines.length > 0 && lines[lines.length - 1] === '') {
            lines.pop();
        }
        return lines;
    }

    /**
     * Returns the appropriate format codes according to the style of the element.
     * 
     * @param {HTMLElement} el 
     * @param {string} currentFormat
     * @returns {string}
     */
    elementToColorCodes(el, currentFormat)
    {
        let codes = '';
        if (el.style.color !== '') {
            const color = this.getColorCode(el.style.color);
            if (color !== currentFormat) {
                codes += color;
            }
        }
        if (el.style.fontWeight === 'bold') {
            codes += '§l';
        }
        if (el.style.fontStyle === 'italic') {
            codes += '§o';
        }
        if (el.style.textDecoration === 'line-through' || el.style.textDecoration === 'underline') {
            codes += el.style.textDecoration === 'line-through' ? '§m' : '§n';
        }
        return codes;
    }

    /**
     * Returns the color code of the given CSS color.
     * 
     * @param {string} color 
     * @returns {string}
     */
    getColorCode(color)
    {
        // Sometimes hex colors are converted to rgb values, so we make sure we have hex color format
        const hex = color.charAt(0) === '#' ? color : color.match(/[0-9]+/g).reduce((a, b) => a+(b|256).toString(16).slice(1), '#');
        for (const key of Object.keys(ColorCodes)) {
            if (ColorCodes[key] === hex) {
                return key;
            }
        }
        return '';
    }

    /**
     * Lint special stuff.
     * 
     * @param {HTMLElement} container 
     */
    applySpecials(container)
    {
        for (const node of container.children) {
            if (!node.hasChildNodes() || node.firstChild.nodeType !== Node.TEXT_NODE) {
                continue;
            }
            const text = node.firstChild.textContent;
            if (node.tagName.toLowerCase() === 'label') {
                // Node content no longer have special value
                if (Object.keys(this.specials).indexOf(text) < 0) {
                    NodesHelper.unwrap(node);
                } else {
                    continue;
                }
            }
            
            // Inspect content for special keys
            for (const [special, info] of Object.entries(this.specials)) {
                if (!text.includes(special)) {
                    continue;
                }

                text.split(special).forEach((paper, i) => {
                    if (i > 0) {
                        const label = document.createElement('label');
                        label.dataset.info = info;
                        label.appendChild(document.createTextNode(special));
                        node.appendChild(label);
                    }
                    if (paper.length > 0) {
                        node.append(paper);
                    }
                });
                node.firstChild.remove();
                break;
            }
        }
    }
}

customElements.define('rich-text-editor', RichTextEditor);