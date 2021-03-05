export interface PlayerDef {
    name: string;
    online: boolean;
}

export interface PlayerMoveDef {
    player: string;
    team: string;
    logged: boolean;
}

export interface RuleDef {
    help?: string;
    name: string;
    value: any;
}

export interface TeamDef {
    color: string;
    name: string;
    players: string[];
}

export interface PlayersPacket {
    rules: PlayerDef[];
}

export interface RulePacket {
    rule: string;
    value: any;
}

export interface RulesPacket {
    rules: RuleDef[];
}

export interface ScoreboardPacket {
    lines: string[];
    placeholders: { [id: string]: string };
}

export interface TeamsPacket {
    teams: TeamDef[];
}
