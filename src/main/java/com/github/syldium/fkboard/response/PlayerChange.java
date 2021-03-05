package com.github.syldium.fkboard.response;

import fr.devsylone.fkpi.api.ITeam;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

public class PlayerChange implements Response {

    private final String player;
    private final @Nullable String team;
    private final boolean online;

    public PlayerChange(@NotNull String playerName, @Nullable ITeam team, boolean online) {
        this.player = playerName;
        this.team = team == null ? null : team.getName();
        this.online = online;
    }

    public String getPlayerName() {
        return this.player;
    }

    public String getTeamName() {
        return this.team;
    }

    public boolean isOnline() {
        return this.online;
    }
}
