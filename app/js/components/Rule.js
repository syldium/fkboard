export class Rule extends HTMLElement
{
    constructor(name, value, help)
    {
        super();
        this.dataset.name = name;
        this.name = name;
        const label = document.createElement('label');
        label.appendChild(document.createTextNode(name));
        label.setAttribute('for', name);
        if (typeof help !== 'undefined') {
            label.dataset.info = help;
        }
        this.appendChild(label)
        this.appendChild(document.createTextNode(' : '));

        this.input = document.createElement('input');
        this.input.id = name;
        this.value = value;
        this.appendChild(this.input);
    }

    connectedCallback()
    {
        this.updateValue(this.value);
    }

    getNewValue()
    {
        if (this.input.type === 'checkbox') {
            return this.input.checked ? 'true' : 'false';
        }
        if (this.input instanceof Choices) {
            return this.input.getValue(true).join(',');
        }
        return this.input.value;
    }

    updateValue(value)
    {
        value = this.getMainValue(value);
        if (value == 'true' || value == 'false') {
            this.input.type = 'checkbox';
            this.input.checked = value == 'true';
        } else if (this.name === 'AllowedBlocks' || this.name === 'DisabledPotions') {
            this.input.value = value;
            if (typeof this.actual === 'undefined') {
                this.input = new Choices(this.input, {
                    removeItems: true,
                    removeItemButton: true,
                    addItemText: (value) => {
                        return `Appuyez sur Entrée pour ajouter<br><b>"${value}"</b>`;
                    }
                });
            } else {
                this.input.clearStore();
                this.input.setValue(value);
            }
        } else if (isNaN(value)) {
            this.input.type = 'text';
            this.input.value = value;
        } else {
            this.input.type = 'number';
            this.input.value = value;
        }
        this.actual = value;
    }

    static scoreOf(json)
    {
        let score = 0;
        if (json.value == 'true' || json.value == 'false') {
            score += 5;
        }
        if (!isNaN(json.value)) {
            score += 1;
        }
        if (json.name.indexOf('Cap') > -1) {
            score += 10;
        }
        if (json.name === 'AllowedBlocks' || json.name === 'DisabledPotions') {
            score -= 5;
        }
        return score;
    }

    getMainValue(value)
    {
        switch (this.name) {
            case 'AllowedBlocks':
                return value.replace(/Blocks\[(.*)\]/, '$1').split(',');
            case 'ChargedCreepers':
                return value.replace(/\[([0-9]+), ([0-9]+), ([0-9]+)\]/, '$1 $2 $3');
            case 'DisabledPotions':
                return value.replace(/\[(.*)\]/, '$1')
                    .split('], ')
                    .map(e => {
                        const part = e.split(',')[0];
                        return part.substring(part.indexOf('=') + 1);
                    });
            case 'PlaceBlockInCave':
                return value.split('(')[0];
            default:
                return value;
        }
    }


    addInputListener(modifiedList, triggerSaveButton)
    {
        if (this.name === 'AllowedBlocks' || this.name === 'DisabledPotions') {
            this.input.addEventListener('change', () => this.onInput(modifiedList, triggerSaveButton));
        } else {
            this.oninput = () => this.onInput(modifiedList, triggerSaveButton);
        }
    }

    /**
     * @private
     */
    onInput(modifiedList, triggerSaveButton)
    {
        const index = modifiedList.indexOf(this);
        if (this.getNewValue() === this.actual) {
            if (index > -1) {
                modifiedList.splice(index, 1);
                triggerSaveButton();
            }
        } else if (index < 0) {
            modifiedList.push(this);
            triggerSaveButton();
        }
    }
}

customElements.define('fk-rule', Rule);