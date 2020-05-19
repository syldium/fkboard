package com.github.syldium.fkboard.websocket.responses;

import com.github.syldium.fkboard.FkBoard;
import com.google.gson.JsonObject;
import org.jetbrains.annotations.NotNull;

public class ServerInfo implements Response {

    private final String pluginVersion;
    private final String serverVersion;

    public ServerInfo(@NotNull FkBoard plugin) {
        pluginVersion = plugin.getDescription().getVersion();
        serverVersion = plugin.getServer().getVersion().replaceAll("[\\w-]+ \\(MC: ([\\d.]+)\\)", "$1");
    }

    @Override
    public int getStatusCode() {
        return 999;
    }

    @Override
    public @NotNull String toJSON() {
        JsonObject object = new JsonObject();
        object.addProperty("code", getStatusCode());
        object.addProperty("pluginVersion", pluginVersion);
        object.addProperty("serverVersion", serverVersion);
        return object.toString();
    }
}
