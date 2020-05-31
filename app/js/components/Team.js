import { TextModal } from "./Modal.js";

export class Team extends HTMLElement
{
    constructor(name, chatcolor = false, players = [])
    {
        super();
        this.dataset.name = name;
        this.name = name;
        this.players = [];
        this.buildHTML(name, chatcolor, players);
    }

    /**
     * @param {string} teamName 
     * @param {string} chatcolor 
     * @param {{name: string, online: boolean}[]} players 
     */
    buildHTML(name, chatcolor = false, players = [])
    {
        const h4 = document.createElement('h4');
        if (chatcolor !== false) {
            h4.setAttribute('chatcolor', chatcolor);
        }
        h4.appendChild(document.createTextNode(name));
        this.appendChild(h4);

        const ul = document.createElement('ul');
        players.forEach(player => {
            this.players.push(this.buildPlayerElement(player.name, player.online));
            ul.appendChild(this.players[this.players.length - 1])
        });
        this.appendChild(ul);

        const actions = document.createElement('div');
        actions.classList.add('actions');
        this.appendChild(actions);

        this.ondragover = (event) => event.preventDefault();
        this.ondrop = (event) => {
            event.preventDefault();
            this.dispatchEvent(new CustomEvent('player-move', {detail: {player: event.dataTransfer.getData('username'), team: this.dataset.name}}))
        };
    }

    /**
     * @param {string} playername 
     * @param {boolean} online 
     * @returns {HTMLLIElement}
     */
    buildPlayerElement(playername, online = false)
    {
        const li = document.createElement('li');
        li.appendChild(document.createTextNode(playername));
        if (online) {
            li.classList.add('online');
        }
        li.draggable = true;
        li.ondragstart = (event) => {
            event.dataTransfer.setData('username', event.target.innerText);
        };
        return li;
    }

    addDataActions(dataBridge)
    {
        if (this.name === '__noteam') {
            this.lastChild.appendChild(this.buildActionElement('add', () => {
                document.querySelector('body').appendChild(new TextModal({
                    text: 'Créer une équipe...',
                    placeholder: 'Nom de l\'équipe',
                    callback: (team) => dataBridge.sendTeamInsertion(team)
                }));
            }));
            return;
        }

        this.lastChild.appendChild(this.buildActionElement('user-add', () => {
            document.querySelector('body').appendChild(new TextModal({
                text: 'Ajouter un joueur...',
                placeholder: 'Nom du joueur',
                callback: (player) => dataBridge.sendTeamMovement(player, this.name)
            }));
        }));
        this.lastChild.appendChild(this.buildActionElement('edit', () => {
            document.querySelector('body').appendChild(new TextModal({
                text: 'Changer le nom de l\'équipe...',
                placeholder: 'Nom de l\'équipe',
                defaultValue: this.name,
                callback: (name) => dataBridge.sendTeamNameChange(this.name, name)
            }));
        }));
        this.lastChild.appendChild(this.buildActionElement('remove', () => {;
            if (confirm('Souhaitez-vous vraiment supprimer cette équipe ?')) {
                dataBridge.sendTeamSuppression(this.name);
            }
        }));
    }

    /**
     * @param {string} name 
     * @param {function} action
     */
    buildActionElement(name, action)
    {
        const i = document.createElement('i');
        i.classList.add(name);
        i.onclick = action;
        return i;
    }
}

customElements.define('fk-team', Team);