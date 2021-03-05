package com.github.syldium.fkboard.websocket.commands;

import com.github.syldium.fkboard.FkBoard;
import com.github.syldium.fkboard.websocket.WSServer;
import com.github.syldium.fkboard.response.ScoreboardContent;
import com.google.gson.JsonObject;
import fr.devsylone.fallenkingdom.scoreboard.PlaceHolder;
import fr.devsylone.fkpi.FkPI;
import org.java_websocket.WebSocket;

class FetchScoreboardCommand extends WSCommand {

    FetchScoreboardCommand() {
        super("fetch scoreboard", false);
    }

    @Override
    public boolean execute(FkBoard plugin, FkPI fkpi, WSServer wsServer, WebSocket sender, JsonObject json) {
        ScoreboardContent response = new ScoreboardContent(PlaceHolder.values(), wsServer.getFk().getScoreboardManager().getSidebar());
        sender.send(wsServer.getSerializer().serialize(response));
        return true;
    }
}
