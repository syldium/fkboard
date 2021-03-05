package com.github.syldium.fkboard.websocket.commands;

import com.github.syldium.fkboard.FkBoard;
import com.github.syldium.fkboard.websocket.WSServer;
import com.github.syldium.fkboard.response.RulesList;
import com.google.gson.JsonObject;
import fr.devsylone.fkpi.FkPI;
import org.java_websocket.WebSocket;

class ListRulesCommand extends WSCommand {

    ListRulesCommand() {
        super("list rules", false);
    }

    @Override
    public boolean execute(FkBoard plugin, FkPI fkpi, WSServer wsServer, WebSocket sender, JsonObject json) {
        sender.send(wsServer.getSerializer().serialize(new RulesList(fkpi.getRulesManager().getRulesList())));
        return true;
    }
}
