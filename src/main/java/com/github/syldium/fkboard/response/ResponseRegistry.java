package com.github.syldium.fkboard.response;

import it.unimi.dsi.fastutil.objects.Object2IntMap;
import it.unimi.dsi.fastutil.objects.Object2IntOpenHashMap;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.VisibleForTesting;

public final class ResponseRegistry {

    private final Object2IntMap<Class<? extends Response>> registry = new Object2IntOpenHashMap<>();

    public ResponseRegistry() {
        this
                .map(401, InvalidLogin.class)
                .map(999, ServerInfo.class)
                .map(1000, TeamsList.class)
                .map(1001, PlayerChange.class)
                .map(1002, RulesList.class)
                .map(1003, RuleChange.class)
                .map(1004, ScoreboardContent.class);
    }

    public int getIdentifier(@NotNull Class<? extends Response> responseType) {
        return this.registry.getInt(responseType);
    }

    public int getIdentifier(@NotNull Response response) {
        return this.getIdentifier(response.getClass());
    }

    @VisibleForTesting
    @NotNull ResponseRegistry map(int identifier, @NotNull Class<? extends Response> response) {
        this.registry.put(response, identifier);
        return this;
    }
}
