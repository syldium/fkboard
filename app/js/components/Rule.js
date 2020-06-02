export class Rule extends HTMLElement
{
    constructor(name, value, help, blocksList)
    {
        super();
        this.blocksList = blocksList;
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
        if (name === 'AllowedBlocks') {
            this.input = document.createElement('select');
            this.input.multiple = true;
        }
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
            return this.input.getValue(true);
        }
        if (this.input === 'DayDuration') {
            return this.input.value * 1200;
        }
        return this.input.value;
    }

    async updateValue(value)
    {
        value = Rule.getMainValue(this.name, value);
        if (value === true || value === false) {
            this.input.type = 'checkbox';
            this.input.checked = value;
        } else if (this.name === 'AllowedBlocks' || this.name === 'DisabledPotions') {
            this.input.value = value;
            if (typeof this.actual === 'undefined') {
                this.input = new Choices(this.input, {
                    removeItems: true,
                    removeItemButton: true,
                    duplicateItemsAllowed: false
                });
                if (this.name === 'AllowedBlocks') {
                    this.input.setChoices(this.blocksList.filter(b => b.boundingBox !== 'empty').map(b => {return {label: b.displayName, value: b.name}}));
                }
            } else if (this.name === 'DisabledPotions') {
                this.input.clearStore();
                this.input.setValue(value);
            }
            if (this.name === 'AllowedBlocks') {
                this.input.removeActiveItems();
                this.input.setChoiceByValue(value.map(b => b.toLowerCase()));
            }
        } else if (isNaN(value)) {
            this.input.type = 'text';
            this.input.value = value;
        } else {
            this.input.type = 'number';
            this.input.value = value;
            this.input.min = this.name.toLowerCase().indexOf('limit') > -1 ? 0 : 1;
        }
        this.actual = value;
    }

    static scoreOf(json)
    {
        const value = Rule.getMainValue(json.name, json.value);
        let score = 0;
        if (value === true || value === false) {
            score += 5;
        }
        if (value.length > 0 && !isNaN(value)) {
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

    static getMainValue(name, value)
    {
        switch (name) {
            case 'ChargedCreepers':
                return Object.values(value).join(' ');
            case 'DayDuration':
                return value / 1200;
            case 'DisabledPotions':
                return value.map(p => p.type);
            case 'PlaceBlockInCave':
                return value.active;
            default:
                if (value === 'true' || value === 'false') {
                    return value === 'true';
                }
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