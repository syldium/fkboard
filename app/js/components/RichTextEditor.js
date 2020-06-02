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
    constructor(text = [''])
    {
        super();
        this.text = text;
    }

    connectedCallback()
    {
        const colorsSelector = document.createElement('div');
        colorsSelector.classList.add('colors-selector');
        for (const color of Object.values(ColorCodes)) {
            if (color.charAt(0) !== '#') {
                continue;
            }
            const select = document.createElement('button');
            select.classList.add('color-pick');
            select.style.backgroundColor = color;
            select.addEventListener('click', (e) => {
                var span = document.createElement("span");
                span.style.color = color;
                this.surroundSelection(span);
                this.removeDepth(this.div);
            });
            colorsSelector.appendChild(select);
        }
        this.appendChild(colorsSelector);
        this.div = document.createElement('div');
        this.div.classList.add('scoreboard');
        this.div.spellcheck = false;
        this.div.setAttribute('contenteditable', 'true');
        this.div.addEventListener('input', (e) => {
            const text = this.toLegacyText();
            let tooLong = false;
            text.forEach(line => {
                if (line.length > 36) {
                    tooLong = true;
                }
            });
            if (tooLong) {
                this.setLines(this.text);
            } else {
                this.text = text;
            }
        });
        this.setLines(this.text);
        this.appendChild(this.div);
    }

    setLines(lines)
    {
        while (this.div.firstChild) {
            this.div.firstChild.remove();
        }
        const text = lines.length < 1 || lines[0] instanceof HTMLElement ? lines : this.fromLegacyTextLines(lines);
        text.forEach(el => this.div.appendChild(el));
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
            if (c === '§') {
                ++i;
                if (i >= line.length) {
                    break;
                }

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

    toLegacyText()
    {
        //this.removeDepth(this.div);
        const lines = [''];
        for (const el of Array.from(this.div.childNodes)) {
            if (el.nodeType === Node.TEXT_NODE) {
                lines[lines.length - 1] += el.textContent;
                continue;
            }
            if (el.tagName.toLowerCase() === 'br' || el.tagName.toLowerCase() === 'div') {
                lines.push('');
            } else {
                lines[lines.length - 1] += this.elementToColorCodes(el) + el.innerText;
            }
        }
        lines.pop();
        return lines;
    }

    elementToColorCodes(el)
    {
        let codes = '';
        if (el.style.color !== null && el.style.color !== '') {
            codes += this.getColorCode(el.style.color);
        }
        if (el.style.fontWeight !== null && el.style.fontWeight !== '') {
            codes += '§l';
        }
        if (el.style.fontStyle !== null && el.style.fontStyle !== '') {
            codes += '§o';
        }
        if (el.style.textDecoration !== null && el.style.textDecoration !== '') {
            codes += el.style.textDecoration === 'line-through' ? '§m' : '§n';
        }
        return codes;
    }

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

    surroundSelection(element)
    {
        if (window.getSelection) {
            var sel = window.getSelection();
            if (sel.rangeCount) {
                var range = sel.getRangeAt(0).cloneRange();
                range.surroundContents(element);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    }

    removeDepth(container)
    {
        /**
         * BEFORE :
         * <div>
         *     <span class="a">
         *         Col<span class="b">or</span> is amazing
         *     </span>
         * </div>
         * AFTER :
         * <div>
         *     <span class="a">Col</span> 
         *     <span class="b">or</span> 
         *     <span class="a">is amazing</span>
         * </div>
         */
        for (const el of container.children) {
            /// Remove <div> formatting from browser
            if (el.tagName.toLowerCase() === 'div') {
                if (el !== container.firstChild) {
                    container.insertBefore(document.createElement('br'), el);
                }
                this.unwrap(el);
            }
            // Split <span>
            if (!!el.firstElementChild) {
                for (const node of el.childNodes) {
                    if (node.nodeType === Node.TEXT_NODE) {
                        if (node.textContent !== '') {
                            const span = el.cloneNode();
                            span.append(node.textContent);
                            container.insertBefore(span, el);
                        }
                    } else {
                        container.insertBefore(node, el);
                    }
                }
                el.remove();
            }
        }
    }

    unwrap(wrapper)
    {
        const fragment = document.createDocumentFragment();
        while (wrapper.firstChild) {
            const child = wrapper.removeChild(wrapper.firstChild);
            fragment.appendChild(child);
        }
        wrapper.parentNode.replaceChild(fragment, wrapper);
    }
}

customElements.define('rich-text-editor', RichTextEditor);