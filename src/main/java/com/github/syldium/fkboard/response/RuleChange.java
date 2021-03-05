package com.github.syldium.fkboard.response;

import com.google.gson.JsonObject;
import fr.devsylone.fkpi.rules.Rule;
import fr.devsylone.fkpi.rules.RuleValue;
import org.jetbrains.annotations.NotNull;

public class RuleChange implements Response {

    private final JsonObject rule;

    public <T> RuleChange(@NotNull Rule<T> rule, @NotNull T value) {
        this.rule = new JsonObject();
        this.rule.addProperty("rule", rule.getName());
        if (value instanceof RuleValue) {
            this.rule.add("value", ((RuleValue) value).toJSON());
        } else {
            this.rule.addProperty("value", value.toString());
        }
    }
}
