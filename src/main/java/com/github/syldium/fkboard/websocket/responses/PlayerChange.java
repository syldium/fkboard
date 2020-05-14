package com.github.syldium.fkboard.websocket.responses;

import com.google.gson.JsonObject;
import fr.devsylone.fkpi.api.ITeam;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

public class PlayerChange implements Response {

    private final String player;
    private final String team;
    private final boolean logged;

    public PlayerChange(@NotNull String player, @Nullable ITeam team, boolean logged) {
        this.player = player;
        this.team = team == null ? "__noteam" : team.getName();
        this.logged = logged;
    }

    @Override
    public int getStatusCode() {
        return 1001;
    }

    @Override
    public @NotNull String toJSON() {
        JsonObject object = new JsonObject();
        object.addProperty("code", getStatusCode());
        object.addProperty("player", player);
        object.addProperty("team", team);
        object.addProperty("logged", logged);
        return object.toString();
    }
}
