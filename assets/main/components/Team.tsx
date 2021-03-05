import { useCallback } from "preact/hooks";

export interface ITeam {
    color: string;
    name: string;
    players: IPlayer[];
}
export interface IPlayer {
    name: string;
    online: boolean;
}

export interface TeamsProps {
    teams: ITeam[];
    onPlayerChange: (playerName: string, teamName: string) => void;
}
export function Teams({ teams, onPlayerChange }: TeamsProps) {
    return (
        <div className="teams">
            {teams.map((team) => (
                <Team onPlayerChange={onPlayerChange} {...team} />
            ))}
        </div>
    );
}

interface TeamProps {
    color: string;
    name: string;
    players: IPlayer[];
    onPlayerChange: (playerName: string, teamName: string) => void;
}
function Team({ color, name, players, onPlayerChange }: TeamProps) {
    const handleDragStart = useCallback(function (event: DragEvent) {
        event.dataTransfer?.setData(
            "text/plain",
            (event.target as HTMLLIElement).innerText
        );
    }, []);
    const handleDragOver = useCallback(function (event: DragEvent) {
        event.preventDefault();
        event.dataTransfer!.dropEffect = "move";
    }, []);
    const handleDrop = useCallback(
        function (event: DragEvent) {
            event.preventDefault();
            const playerName = event.dataTransfer?.getData("text/plain");
            if (playerName) {
                onPlayerChange(playerName, name);
            }
        },
        [name, onPlayerChange]
    );

    return (
        <div className="team" onDragOver={handleDragOver} onDrop={handleDrop}>
            <h4 style={{ backgroundColor: color }}>{name}</h4>
            <ul>
                {players.map((player) => (
                    <li
                        class={player.online ? "online" : ""}
                        draggable={true}
                        onDragStart={handleDragStart}
                    >
                        {player.name}
                    </li>
                ))}
            </ul>
        </div>
    );
}
