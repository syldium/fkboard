import "./app.css";
import "preact/debug";
import "choices.js/public/assets/styles/choices.css";
import { render } from "preact";
import { ITeam, Teams } from "./components/Team";
import { useCallback, useState } from "preact/hooks";
import { LoginForm } from "./components/LoginForm";
import {
    DataBridge,
    PlayerChangePacket,
    RulesPacket,
    TeamsPacket,
} from "./DataBridge";
import { changePlayerTeam } from "./helpers/TeamHelper";
import { IRule, Rules } from "./components/Rule";

function App() {
    const [bridge, setBridge] = useState<DataBridge | null>(null);
    const [rules, setRules] = useState<IRule[]>([]);
    const [teams, setTeams] = useState<ITeam[]>([]);

    const handleConnect = useCallback(
        function (bridge: DataBridge) {
            setBridge(bridge);
            bridge.addReceiver(1000, (packet: TeamsPacket) => {
                setTeams(packet.teams);
            });
            bridge.addReceiver(1001, (packet: PlayerChangePacket) => {
                setTeams((teams) => changePlayerTeam(teams, packet));
            });
            bridge.addReceiver(1002, (packet: RulesPacket) => {
                setRules(packet.rules);
            });
        },
        [setBridge, setTeams, setRules]
    );

    const handleRulesSubmit = useCallback(
        function (rules: IRule[]) {
            if (!bridge) return;
            rules.forEach((rule) => {
                bridge.sendRuleChange(rule.name, rule.value);
            });
        },
        [bridge]
    );

    const handlePlayerChange = useCallback(
        function () {
            return bridge?.sendTeamMovement.bind(bridge);
        },
        [bridge]
    );

    return (
        <>
            {bridge === null ? (
                <LoginForm onConnect={handleConnect} />
            ) : (
                <>
                    <Teams teams={teams} onPlayerChange={handlePlayerChange} />
                    <Rules rules={rules} onSubmit={handleRulesSubmit} />
                </>
            )}
        </>
    );
}

render(<App />, document.querySelector("section")!);
