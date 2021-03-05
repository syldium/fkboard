package com.github.syldium.fkboard.response;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import fr.devsylone.fallenkingdom.utils.Messages;
import fr.devsylone.fkpi.rules.Rule;
import fr.devsylone.fkpi.rules.RuleValue;
import org.jetbrains.annotations.NotNull;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public class RulesList implements Response {

    private static final Map<Rule<?>, Messages> RULE_MESSAGES_MAP = new HashMap<>();

    private final JsonArray rules;

    public RulesList(@NotNull Map<Rule<?>, Object> rules) {
        this.rules = new Gson().toJsonTree(rules.entrySet().stream().map(rule -> {
            JsonObject object = new JsonObject();
            object.addProperty("name", rule.getKey().getName());
            try {
                object.addProperty("help", getHelpValue(rule.getKey()));
            } catch (IllegalArgumentException ignored) {

            }
            if (rule.getValue() instanceof RuleValue) {
                object.add("value", ((RuleValue) rule.getValue()).toJSON());
            } else {
                object.addProperty("value", rule.getValue().toString());
            }
            return object;
        }).collect(Collectors.toList())).getAsJsonArray();
    }

    private String getHelpValue(Rule<?> rule) throws IllegalArgumentException {
        return RULE_MESSAGES_MAP.get(rule).getMessage();
    }

    static {
        Pattern pattern = Pattern.compile("(.)([A-Z])");
        for (Rule<?> rule : Rule.values()) {
            Messages message;
            if (rule == Rule.ALLOWED_BLOCKS) {
                message = Messages.CMD_MAP_RULES_ALLOW_BLOCK;
            } else {
                message = Messages.valueOf("CMD_MAP_RULES_" + pattern.matcher(rule.getName()).replaceAll("$1_$2").toUpperCase());
            }
            RULE_MESSAGES_MAP.put(rule, message);
        }
    }
}
