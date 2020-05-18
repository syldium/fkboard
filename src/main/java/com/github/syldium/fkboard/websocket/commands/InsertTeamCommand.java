package com.github.syldium.fkboard.websocket.commands;

import com.github.syldium.fkboard.FkBoard;
import com.github.syldium.fkboard.websocket.WSServer;
import com.google.gson.JsonObject;
import fr.devsylone.fkpi.FkPI;
import org.java_websocket.WebSocket;

class InsertTeamCommand extends WSCommand {

    InsertTeamCommand() {
        super("insert team", true, "team");
    }

    @Override
    public boolean execute(FkBoard plugin, FkPI fkpi, WSServer wsServer, WebSocket sender, JsonObject json) {
        fkpi.getTeamManager().createTeam(json.get("team").getAsString());
        return true;
    }
}
