package com.github.syldium.fkboard.websocket.responses;

import com.google.gson.JsonObject;
import org.jetbrains.annotations.NotNull;

public class LoginRequired implements Response {

    private final boolean logged;

    public LoginRequired(boolean logged) {
        this.logged = logged;
    }

    @Override
    public int getStatusCode() {
        return logged ? 200 : 401;
    }

    @Override
    public @NotNull String toJSON() {
        JsonObject object = new JsonObject();
        object.addProperty("code", getStatusCode());
        object.addProperty("content", logged ? "Logged in" : "Authentication required");
        return object.toString();
    }
}
