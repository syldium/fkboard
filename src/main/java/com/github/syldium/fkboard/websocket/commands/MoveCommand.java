package com.github.syldium.fkboard.websocket.commands;

import com.github.syldium.fkboard.FkBoard;
import com.github.syldium.fkboard.websocket.WSServer;
import com.google.gson.JsonObject;
import fr.devsylone.fkpi.FkPI;
import org.java_websocket.WebSocket;

class MoveCommand extends WSCommand {

    MoveCommand() {
        super("move", true, "player", "team");
    }

    @Override
    public boolean execute(FkBoard plugin, FkPI fkpi, WSServer wsServer, WebSocket sender, JsonObject json) {
        String player = json.get("player").getAsString();
        String team = json.get("team").getAsString();
        if (fkpi.getTeamManager().getPlayerTeam(player) != null) {
            fkpi.getTeamManager().removePlayerOfHisTeam(player);
        }
        if (!team.equals("__noteam")) {
            fkpi.getTeamManager().addPlayer(player, team);
        }
        return true;
    }
}
