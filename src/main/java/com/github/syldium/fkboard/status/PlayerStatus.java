package com.github.syldium.fkboard.status;

import org.bukkit.Bukkit;
import org.jetbrains.annotations.NotNull;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class PlayerStatus {

    private final Map<String, Boolean> statutes = new ConcurrentHashMap<>();

    public void update(@NotNull String playerName, boolean online) {
        statutes.put(playerName, online);
    }

    public boolean isPlayerOnline(@NotNull String playerName) {
        return statutes.computeIfAbsent(playerName, k -> Bukkit.getPlayer(playerName) != null);
    }
}
