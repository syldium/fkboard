package com.github.syldium.fkboard.status;

import it.unimi.dsi.fastutil.objects.Object2BooleanMap;
import it.unimi.dsi.fastutil.objects.Object2BooleanMaps;
import it.unimi.dsi.fastutil.objects.Object2BooleanOpenHashMap;
import org.jetbrains.annotations.NotNull;

public class PlayerStatus {

    private final Object2BooleanMap<String> statutes = Object2BooleanMaps.synchronize(new Object2BooleanOpenHashMap<>());

    public void update(@NotNull String playerName, boolean online) {
        statutes.put(playerName, online);
    }

    public boolean isPlayerOnline(@NotNull String playerName) {
        return statutes.getBoolean(playerName);
    }
}
