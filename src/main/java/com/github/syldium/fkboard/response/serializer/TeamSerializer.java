package com.github.syldium.fkboard.response.serializer;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;
import fr.devsylone.fkpi.teams.Team;
import org.jetbrains.annotations.NotNull;

import java.lang.reflect.Type;
import java.util.function.Predicate;

class TeamSerializer implements JsonSerializer<Team> {

    private final Predicate<String> isPlayerOnline;

    TeamSerializer(@NotNull Predicate<String> isPlayerOnline) {
        this.isPlayerOnline = isPlayerOnline;
    }

    @Override
    public @NotNull JsonElement serialize(@NotNull Team team, @NotNull Type type, @NotNull JsonSerializationContext context) {
        JsonObject object = new JsonObject();
        object.addProperty("name", team.getName());
        object.addProperty("color", team.getColor().getHexString());
        JsonArray players = new JsonArray();
        for (String playerName : team.getPlayers()) {
            JsonObject player = new JsonObject();
            player.addProperty("name", playerName);
            player.addProperty("online", this.isPlayerOnline.test(playerName));
            players.add(player);
        }
        object.add("players", players);
        return object;
    }
}
