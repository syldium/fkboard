package com.github.syldium.fkboard.response;

import com.github.syldium.fkboard.FkBoard;
import org.jetbrains.annotations.NotNull;

public class ServerInfo implements Response {

    private final String pluginVersion;
    private final String serverVersion;

    public ServerInfo(@NotNull FkBoard plugin) {
        pluginVersion = plugin.getDescription().getVersion();
        serverVersion = plugin.getServer().getVersion().replaceAll("[\\w-]+ \\(MC: ([\\d.]+)\\)", "$1");
    }
}
