package com.github.syldium.fkboard.websocket.commands;

import com.github.syldium.fkboard.FkBoard;
import com.github.syldium.fkboard.websocket.WSServer;
import com.google.gson.JsonObject;
import fr.devsylone.fkpi.FkPI;
import org.java_websocket.WebSocket;

public abstract class WSCommand {

    protected final String path;
    protected final boolean needScoreboardReload;
    protected final String[] requiredJsonKeys;

    WSCommand(String path, boolean needScoreboardReload, String... requiredJsonKeys) {
        this.path = path;
        this.needScoreboardReload = needScoreboardReload;
        this.requiredJsonKeys = requiredJsonKeys;
    }

    public boolean hasRequiredJsonKeys(JsonObject json) {
        for (String key : requiredJsonKeys) {
            if (!json.has(key)) {
                return false;
            }
        }
        return true;
    }

    public abstract boolean execute(FkBoard plugin, FkPI fkpi, WSServer wsServer, WebSocket sender, JsonObject json);
}
