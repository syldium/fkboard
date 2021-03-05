import { ITeam } from "../components/Team";
import { PlayerChangePacket } from "../DataBridge";

export function changePlayerTeam(
    teams: ITeam[],
    change: PlayerChangePacket
): ITeam[] {
    if (!("team" in change)) {
        return teams;
    }
    for (const team of teams) {
        if (!team.players.some((player) => player.name === change.player)) {
            continue;
        }

        if (team.name === change.team) {
            team.players = team.players.map((player) => {
                if (player.name === change.player) {
                    return { ...player, online: change.online };
                }
                return player;
            });
            return [...teams];
        }
        team.players = team.players.filter(
            (player) => player.name !== change.player
        );
        const newTeam = teams.find((team) => team.name === change.team);
        if (newTeam) {
            newTeam.players.push({
                name: change.player,
                online: change.online,
            });
            return [...teams];
        }
    }
    return [...teams];
}
