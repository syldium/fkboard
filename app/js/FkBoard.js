import { DataBridge } from "./DataBridge.js";
import { Team } from "./components/Team.js";
import { Rule } from "./components/Rule.js";
import { getBlocksList } from "./BlocksList.js";
import { ScoreboardModal } from "./components/Modal.js";

export class FkEditor
{
    /**
     * @param {HTMLElement} connection 
     * @param {HTMLElement} editor
     */
    constructor(connection, editor)
    {
        this.connection = connection;
        connection.lastElementChild.onsubmit = () => {
            const address = document.getElementById('address').value;
            const port = document.getElementById('port').value;
            const password = document.getElementById('pass').value;
            this.connect(address, port, password);
            return false;
        };
        this.editor = editor;
        editor.setAttribute('hidden', 'hidden');

        this.scoreboardModal = null;
        this.players = {}; // References to players elements
        this.modifiedRules = [];
        this.teamsDiv = editor.querySelector('.teams');
        this.rulesDiv = editor.querySelector('.rules');
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
        this.dataBridge.addReceiver(1002, this.loadRules.bind(this));
        this.dataBridge.addReceiver(1003, this.changeRule.bind(this));
        this.dataBridge.addReceiver(1004, this.editScoreboard.bind(this));
        this.dataBridge.addReceiver(401, () => {
            if (this.dataBridge.authSent) {
                alert('Mot de passe incorrect');
            }
        });
        this.dataBridge.addReceiver(200, () => {
            document.querySelector('.scoreboard-btn').addEventListener('click', () => {
                this.dataBridge.fetchScoreboardContent();
            });
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
        if (this.connection.getAttribute('hidden') !== 'hidden') {
            this.connection.setAttribute('hidden', 'hidden');
            this.editor.removeAttribute('hidden');
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

    async loadRules(json)
    {
        const blocks = await getBlocksList(this.dataBridge);
        Object.values(json.rules).sort((r1, r2) => Rule.scoreOf(r2) - Rule.scoreOf(r1)).forEach((rule_, i, rules) => {
            const element = new Rule(rule_.name, rule_.value, rule_.help, blocks);
            element.addInputListener(this.modifiedRules, () => {
                if (this.modifiedRules.length > 0) {
                    this.saveButton.classList.remove('invisible');
                } else {
                    this.saveButton.classList.add('invisible');
                }
            });
            if (i > 0) {
                if (Rule.scoreOf(rules[i - 1]) !== Rule.scoreOf(rule_)) {
                    this.rulesDiv.appendChild(document.createElement('hr'));
                    this.rulesDiv.appendChild(document.createElement('div'));
                }
            } else  {
                this.rulesDiv.appendChild(document.createElement('div'));
            }
            this.rulesDiv.lastChild.appendChild(element);
        });
        this.saveButton = document.createElement('button')
        this.saveButton.appendChild(document.createTextNode('Enregistrer'));
        this.saveButton.classList.add('invisible', 'save-btn');
        this.saveButton.onclick = () => {
            this.modifiedRules.forEach(rule => {
                this.dataBridge.sendRuleChange(rule.name, rule.getNewValue());
            });
        }
        this.rulesDiv.appendChild(this.saveButton);
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

    changeRule(json)
    {
        const element = this.rulesDiv.querySelector(`fk-rule[data-name="${json.rule}"]`);
        element.updateValue(json.value);
        const index = this.modifiedRules.indexOf(element);
        if (index > -1) {
            this.modifiedRules.splice(index, 1);
        }
        if (this.modifiedRules.length > 0) {
            this.saveButton.classList.remove('invisible');
        } else {
            this.saveButton.classList.add('invisible');
        }
    }

    editScoreboard(json)
    {
        if (this.scoreboardModal !== null && this.scoreboardModal.parentNode !== null) {
            this.scoreboardModal.setLines(json.lines);
            return;
        }
        this.scoreboardModal = new ScoreboardModal({
            placeholders: json.placeholders,
            lines: json.lines,
            text: 'Éditer le scoreboard',
            callback: (lines) => this.dataBridge.updateScoreboard(lines)
        });
        document.querySelector('body').appendChild(this.scoreboardModal);
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
        teamElement.addDataActions(this.dataBridge);
        return teamElement;
    }
}