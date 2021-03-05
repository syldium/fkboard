package com.github.syldium.fkboard.response.serializer;

import com.github.syldium.fkboard.response.Response;
import com.github.syldium.fkboard.response.ResponseRegistry;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import fr.devsylone.fkpi.teams.Team;
import org.jetbrains.annotations.NotNull;

import java.util.function.Predicate;

public class ResponseSerializer {

    private final Gson serializer;
    private final ResponseRegistry registry;

    public ResponseSerializer(@NotNull Predicate<String> isPlayerOnline) {
        this.serializer = new GsonBuilder()
                .registerTypeAdapter(Team.class, new TeamSerializer(isPlayerOnline))
                .create();
        this.registry = new ResponseRegistry();
    }

    public @NotNull JsonObject toJsonTree(@NotNull Response response) {
        JsonObject json = this.serializer.toJsonTree(response).getAsJsonObject();
        json.addProperty("id", response.getIdentifier(this.registry));
        return json;
    }

    public @NotNull String serialize(@NotNull Response response) {
        return toJsonTree(response).toString();
    }

    public @NotNull ResponseRegistry getRegistry() {
        return this.registry;
    }
}
