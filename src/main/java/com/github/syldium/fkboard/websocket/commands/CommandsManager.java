package com.github.syldium.fkboard.websocket.commands;


import com.github.syldium.fkboard.FkBoard;
import com.github.syldium.fkboard.websocket.WSServer;
import com.google.common.collect.ImmutableList;
import com.google.gson.JsonObject;
import fr.devsylone.fkpi.FkPI;
import org.java_websocket.WebSocket;

import java.util.List;

public class CommandsManager {
    private final List<WSCommand> commands;

    public CommandsManager() {
        this.commands = ImmutableList.<WSCommand>builder()
                .add(new ChangeTeamNameCommand())
                .add(new DeleteTeamCommand())
                .add(new EditRuleCommand())
                .add(new FetchScoreboardCommand())
                .add(new InsertTeamCommand())
                .add(new ListRulesCommand())
                .add(new MoveCommand())
                .add(new UpdateScoreboardCommand())
                .build();
    }

    public boolean executeCommand(FkBoard plugin, FkPI fkpi, WSServer wsServer, WebSocket sender, String action, JsonObject json) {
        WSCommand cmd = commands.stream()
                .filter(node -> node.path.equalsIgnoreCase(action))
                .findFirst()
                .orElse(null);

        if (cmd == null || !cmd.hasRequiredJsonKeys(json)) {
            return false;
        }
        boolean result = cmd.execute(plugin, fkpi, wsServer, sender, json);
        if (result && cmd.needScoreboardReload) {
            wsServer.runSync(p -> wsServer.getFk().getScoreboardManager().recreateAllScoreboards());
        }
        return result;
    }
}
