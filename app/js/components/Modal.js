import { RichTextEditor } from "./RichTextEditor.js";

class Modal extends HTMLElement
{
    constructor(text)
    {
        super();
        this.text = text;
        this.classList.add('modal');
        this.setAttribute('role', 'dialog');

        this.close = this.close.bind(this);
    }

    connectedCallback()
    {
        const wrapper = document.createElement('div');
        wrapper.classList.add('modal-wrapper');
        this.appendChild(wrapper);

        const text = document.createElement('p');
        text.appendChild(document.createTextNode(this.text));
        wrapper.appendChild(text);

        this.actions = document.createElement('div');
        wrapper.appendChild(this.actions); 

        const cancel = document.createElement('button');
        cancel.appendChild(document.createTextNode('Annuler'));
        cancel.addEventListener('click', this.close);
        this.actions.appendChild(cancel);

        this.setAttribute('aria-modal', 'true');
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.close();
            }
        })
    }

    disconnectedCallback()
    {
        this.querySelector('button').removeEventListener('click', this.close);
    }

    close()
    {
        this.querySelector('button').removeEventListener('click', this.close);
        this.remove();
    }
}

class BaseModal extends Modal
{
    constructor(text)
    {
        super(text);
        this.text = text;
        this.classList.add('modal');
        this.setAttribute('role', 'dialog');

        this.close = this.close.bind(this);
    }

    connectedCallback()
    {
        super.connectedCallback();
        const action = document.createElement('button');
        action.append(typeof this.action === 'undefined' ? 'Valider' : this.action);
        action.classList.add('btn-primary');
        this.actions.appendChild(action);
    }
}

export class TextModal extends BaseModal
{
    constructor({text, placeholder, defaultValue, action, callback})
    {
        super(text);
        this.placeholder = placeholder;
        this.defaultValue = defaultValue;
        this.action = action;
        this.callback = callback;
    }

    connectedCallback()
    {
        super.connectedCallback();

        const input = document.createElement('input');
        input.setAttribute('type', 'text');
        if (typeof this.placeholder !== 'undefined') {
            input.setAttribute('placeholder', this.placeholder);
        }
        if (typeof this.defaultValue !== 'undefined') {
            input.setAttribute('value', this.defaultValue);
        }
        input.setAttribute('required', 'true');
        this.firstChild.insertBefore(input, this.firstChild.lastChild);
        input.select();
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submit(input.value);
            }
        });
        this.actions.lastChild.addEventListener('click', (e) => this.submit(input.value));
    }

    submit(value)
    {
        if (value !== '') {
            this.callback(value);
        }
        this.close();
    }
}

export class ScoreboardModal extends BaseModal
{
    constructor({text, placeholders, lines, callback})
    {
        super(text);
        this.placeholders = placeholders;
        this.lines = lines;
        this.callback = callback;
    }

    connectedCallback()
    {
        super.connectedCallback();
        this.editor = new RichTextEditor(this.lines, this.placeholders);
        this.firstChild.insertBefore(this.editor, this.actions);
        this.actions.lastChild.addEventListener('click', () => this.submit());
    }

    setLines(lines)
    {
        this.lines = lines;
        this.editor.setLines(lines);
    }

    submit()
    {
        const text = this.editor.toLegacyText();
        if (text.length > 0) {
            this.callback(text);
        }
        this.close();
    }
}

customElements.define('text-modal', TextModal);
customElements.define('scoreboard-modal', ScoreboardModal);