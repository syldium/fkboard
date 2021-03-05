import { ITeam } from "./components/Team";
import { IRule } from "./components/Rule";

interface Packet {
    id: number;
}
export interface PlayerChangePacket extends Packet {
    player: string;
    team?: string;
    online: boolean;
}
export interface RulesPacket extends Packet {
    rules: IRule[];
}
export interface ServerInfoPacket extends Packet {
    pluginVersion: string;
    serverVersion: string;
}
export interface TeamsPacket extends Packet {
    teams: ITeam[];
}

export class DataBridge {
    private ws: WebSocket;
    private receivers: { [id: number]: <T extends Packet>(json: T) => any };
    logged: boolean;
    serverVersion?: string;
    resolve: (bridge: DataBridge) => any;

    constructor(
        ws: WebSocket,
        password: string,
        resolve: (bridge: DataBridge) => void,
        reject: (event: Event) => void
    ) {
        this.ws = ws;
        this.ws.onerror = reject.bind(this);
        this.ws.onopen = () => this.login(password);
        this.ws.onmessage = this.handleMessage.bind(this);
        this.receivers = {
            401: () => {
                reject(new CustomEvent("invalid"));
            },
            // @ts-expect-error
            999: (json: ServerInfoPacket) => {
                this.serverVersion = json.serverVersion;
                this.askRulesList();
                resolve(this);
            },
        };
        this.resolve = resolve;
        this.logged = false;
    }

    /**
     * Add receiver for the given code.
     */
    addReceiver<T extends Packet>(code: number, callback: (json: T) => void) {
        // @ts-expect-error
        this.receivers[code] = callback;
    }

    /**
     * Send password to the server.
     */
    login(password: string) {
        this.ws.send(JSON.stringify({ action: `LOGIN ${password}` }));
    }

    /**
     * Inform the server that client wants to make a team change.
     */
    sendTeamMovement(playerName: string, teamName: string) {
        this.ws.send(
            JSON.stringify({
                code: 2001,
                action: `MOVE`,
                player: playerName,
                team: teamName,
            })
        );
    }

    /**
     * Send a team insertion request.
     */
    sendTeamInsertion(teamName: string) {
        this.ws.send(
            JSON.stringify({
                code: 2002,
                action: `INSERT TEAM`,
                team: teamName,
            })
        );
    }

    /**
     * Send a request for team name change.
     */
    sendTeamNameChange(previousName: string, newName: string) {
        this.ws.send(
            JSON.stringify({
                code: 2003,
                action: `CHANGE TEAM NAME`,
                previous: previousName,
                newName,
            })
        );
    }

    /**
     * Send a team deletion request.
     */
    sendTeamSuppression(teamName: string) {
        if (typeof teamName === "undefined") {
            return;
        }
        this.ws.send(
            JSON.stringify({
                code: 2005,
                action: `DELETE TEAM`,
                team: teamName,
            })
        );
    }

    askRulesList() {
        this.ws.send(JSON.stringify({ code: 2006, action: `LIST RULES` }));
    }

    /**
     * Send a rule change.
     */
    sendRuleChange(rule: string, value: any) {
        this.ws.send(
            JSON.stringify({ code: 2007, action: `EDIT RULE`, rule, value })
        );
    }

    fetchScoreboardContent() {
        this.ws.send(
            JSON.stringify({ code: 2008, action: `FETCH SCOREBOARD` })
        );
    }

    updateScoreboard(lines: string[]) {
        this.ws.send(
            JSON.stringify({ code: 2009, action: `UPDATE SCOREBOARD`, lines })
        );
    }

    private handleMessage(event: MessageEvent) {
        try {
            const json = JSON.parse(event.data);
            if ("id" in json) {
                if (json.id in this.receivers) {
                    this.receivers[json.id](json);
                } else {
                    console.log("Received", json);
                }
            } else {
                console.error("Invalid packet received.", json);
            }
        } catch (ex) {
            console.error(ex);
        }
    }
}
