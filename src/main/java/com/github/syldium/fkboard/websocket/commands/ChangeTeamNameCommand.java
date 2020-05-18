package com.github.syldium.fkboard.websocket.commands;

import com.github.syldium.fkboard.FkBoard;
import com.github.syldium.fkboard.websocket.WSServer;
import com.google.gson.JsonObject;
import fr.devsylone.fkpi.FkPI;
import fr.devsylone.fkpi.api.ITeam;
import org.java_websocket.WebSocket;

class ChangeTeamNameCommand extends WSCommand {

    ChangeTeamNameCommand() {
        super("change team name", true, "previous", "newName");
    }

    @Override
    public boolean execute(FkBoard plugin, FkPI fkpi, WSServer wsServer, WebSocket sender, JsonObject json) {
        ITeam team_ = fkpi.getTeamManager().getTeam(json.get("previous").getAsString());
        team_.setName(json.get("newName").getAsString());
        return true;
    }
}
