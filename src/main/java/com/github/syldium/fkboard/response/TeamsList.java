package com.github.syldium.fkboard.response;

import com.github.syldium.fkboard.status.PlayerStatus;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import fr.devsylone.fkpi.api.ITeam;
import fr.devsylone.fkpi.teams.Team;
import org.jetbrains.annotations.NotNull;

import java.util.List;
import java.util.stream.Collectors;

public class TeamsList implements Response {

    private final JsonArray teams;

    public TeamsList(@NotNull List<? extends ITeam> teams, @NotNull PlayerStatus playerStatus) {
        this.teams = new Gson().toJsonTree(teams.stream().map(team -> {
            JsonObject object = new JsonObject();
            object.addProperty("name", team.getName());
            object.addProperty("color", ((Team) team).getColor().getHexString());
            JsonArray players = new JsonArray();
            for (String playerName : team.getPlayers()) {
                JsonObject player = new JsonObject();
                player.addProperty("name", playerName);
                player.addProperty("online", playerStatus.isPlayerOnline(playerName));
                players.add(player);
            }
            object.add("players", players);
            return object;
        }).collect(Collectors.toList())).getAsJsonArray();
    }
}