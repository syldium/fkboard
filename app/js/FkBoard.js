import { DataBridge } from "./DataBridge.js";
import { Team } from "./components/Team.js";

export class FkEditor
{
    /**
     * @param {HTMLFormElement} form 
     */
    constructor(form)
    {
        this.form = form;
        form.onsubmit = () => {
            const adress = document.getElementById('adress').value;
            const port = document.getElementById('port').value;
            const password = document.getElementById('pass').value;
            this.connect(adress, port, password);
            return false;
        };
        this.teamsDiv = document.getElementById('teams');
        this.players = {};
    }

    /**
     * Init DataBridge
     * 
     * @param {string} adress 
     * @param {string} port 
     * @param {string} password 
     */
    connect(adress, port, password)
    {
        this.dataBridge = new DataBridge(new WebSocket(`ws://${adress}:${port}/socket`), password);
        this.dataBridge.addReceiver(1000, this.loadTeams.bind(this));
        this.dataBridge.addReceiver(1001, this.playerMove.bind(this));
        this.dataBridge.addReceiver(401, () => {
            if (this.dataBridge.authSent) {
                alert('Mot de passe incorrect');
            }
        });
    }

    /**
     * Handle teams list messages.
     * 
     * @param {object} json 
     */
    loadTeams(json)
    {
        // Hide connection form
        if (this.form.style.display !== 'none') {
            this.form.style.display = 'none';
        }
        // Remove previous nodes, except __noteam
        Array.from(this.teamsDiv.children)
            .filter(team => team.dataset.name !== '__noteam')
            .forEach(team => team.remove());
        // Create teams elements
        Object.values(json.teams).forEach(team => {
            const element = this.createTeamElement(team.name, team.chatcolor, Object.values(team.players));
            this.teamsDiv.prepend(element);
        });
        // Add __noteam if not exist
        if (!this.teamsDiv.hasChildNodes() || this.teamsDiv.hasChildNodes() && this.teamsDiv.lastElementChild.dataset.name !== '__noteam') {
            this.teamsDiv.appendChild(this.createTeamElement("__noteam"));
        }
    }

    /**
     * Handle players' movements.
     * 
     * @param {{player: string, team: string, logged: boolean}} json 
     */
    playerMove(json)
    {
        if (!(json.player in this.players)) {
            this.players[json.player] = this.createLiPlayerElement(json.player);
        }
        const playerElement = this.players[json.player];
        if (json.logged) {
            playerElement.classList.add('online');
        } else {
            playerElement.classList.remove('online');
        }
        this.getTeamPlayersListElement(json.team).lastChild.previousSibling.appendChild(playerElement);
    }

    /**
     * Create a li element for the given player name.
     * 
     * @param {string} playername 
     * @param {boolean} online 
     * @returns {HTMLLIElement}
     */
    createLiPlayerElement(playername, online = false)
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

    getTeamPlayersListElement(teamName)
    {
        let team = this.teamsDiv.querySelector(`fk-team[data-name="${teamName}"`);
        if (team !== null) {
            return team;
        }
        team = this.createTeamElement(teamName);
        this.teamsDiv.appendChild(team);
        return team;
    }

    /**
     * Create a div for the given team name.
     * 
     * @param {string} teamName 
     * @param {string} chatcolor 
     * @param {{name: string, online: boolean}[]} players 
     * @returns {HTMLDivElement}
     */
    createTeamElement(teamName, chatcolor = false, players = [])
    {
        const teamElement = new Team(teamName, chatcolor, players);
        teamElement.players.forEach(player => this.players[player.innerText] = player);
        teamElement.addEventListener('player-move', e => this.dataBridge.sendTeamMovement(e.detail.player, e.detail.team));
        if (teamName !== '__noteam') {
            teamElement.addDataActions(this.dataBridge);
        }
        return teamElement;
    }
}