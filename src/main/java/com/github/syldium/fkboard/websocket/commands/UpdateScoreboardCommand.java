package com.github.syldium.fkboard.websocket.commands;

import com.github.syldium.fkboard.FkBoard;
import com.github.syldium.fkboard.websocket.WSServer;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import fr.devsylone.fallenkingdom.display.GlobalDisplayService;
import fr.devsylone.fallenkingdom.version.Version;
import fr.devsylone.fkpi.FkPI;
import org.bukkit.ChatColor;
import org.java_websocket.WebSocket;

import java.util.ArrayList;
import java.util.List;

class UpdateScoreboardCommand extends WSCommand {

    UpdateScoreboardCommand() {
        super("update scoreboard", true, "lines");
    }

    @Override
    public boolean execute(FkBoard plugin, FkPI fkpi, WSServer wsServer, WebSocket sender, JsonObject json) {
        if (!json.get("lines").isJsonArray()) {
            return false;
        }
        GlobalDisplayService displayService = wsServer.getFk().getDisplayService();
        List<String> lines = new ArrayList<>();
        for (JsonElement lineElement : json.get("lines").getAsJsonArray()) {
            String line = lineElement.getAsString();
            if ((Version.VersionType.V1_13.isHigherOrEqual() && line.length() <= 64) || line.length() <= 32) {
                lines.add(line);
            } else {
                lines.add(ChatColor.ITALIC + "invalid");
            }
        }
        displayService.setScoreboard(displayService.scoreboard().withLines(lines));
        return true;
    }
}
