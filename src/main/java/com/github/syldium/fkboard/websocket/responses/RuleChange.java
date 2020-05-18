package com.github.syldium.fkboard.websocket.responses;

import com.google.gson.JsonObject;
import fr.devsylone.fkpi.rules.Rule;
import org.jetbrains.annotations.NotNull;

public class RuleChange implements Response {

    private final String rule;
    private final String value;

    public <T> RuleChange(@NotNull Rule<T> rule, @NotNull T value) {
        this.rule = rule.getName();
        this.value = value.toString();
    }

    @Override
    public int getStatusCode() {
        return 1003;
    }

    @Override
    public @NotNull String toJSON() {
        JsonObject object = new JsonObject();
        object.addProperty("code", getStatusCode());
        object.addProperty("rule", rule);
        object.addProperty("value", value);
        return object.toString();
    }
}
