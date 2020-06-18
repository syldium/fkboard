package com.github.syldium.fkboard.websocket.commands;

import com.github.syldium.fkboard.FkBoard;
import com.github.syldium.fkboard.websocket.WSServer;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import fr.devsylone.fallenkingdom.manager.saveable.ScoreboardManager;
import fr.devsylone.fallenkingdom.utils.Version;
import fr.devsylone.fkpi.FkPI;
import org.bukkit.ChatColor;
import org.java_websocket.WebSocket;

class UpdateScoreboardCommand extends WSCommand {

    UpdateScoreboardCommand() {
        super("update scoreboard", true, "lines");
    }

    @Override
    public boolean execute(FkBoard plugin, FkPI fkpi, WSServer wsServer, WebSocket sender, JsonObject json) {
        if (!json.get("lines").isJsonArray()) {
            return false;
        }
        wsServer.getFk().getScoreboardManager().getSidebar().clear();
        for (JsonElement lineElement : json.get("lines").getAsJsonArray()) {
            String line = lineElement.getAsString();
            if (line.length() < 5) {
                line += ScoreboardManager.randomFakeEmpty();
            }
            if ((Version.VersionType.V1_13.isHigherOrEqual() && line.length() <= 64) || line.length() <= 32) {
                wsServer.getFk().getScoreboardManager().getSidebar().add(line);
            } else {
                wsServer.getFk().getScoreboardManager().getSidebar().add(ChatColor.ITALIC + "invalid");
            }
        }
        return true;
    }
}
