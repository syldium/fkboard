package com.github.syldium.fkboard.websocket.commands;

import com.github.syldium.fkboard.FkBoard;
import com.github.syldium.fkboard.websocket.WSServer;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import fr.devsylone.fallenkingdom.commands.abstraction.AbstractCommand;
import fr.devsylone.fallenkingdom.commands.rules.FkRuleCommand;
import fr.devsylone.fallenkingdom.exception.ArgumentParseException;
import fr.devsylone.fallenkingdom.exception.FkLightException;
import fr.devsylone.fkpi.FkPI;
import fr.devsylone.fkpi.api.event.RuleChangeEvent;
import fr.devsylone.fkpi.rules.AllowedBlocks;
import fr.devsylone.fkpi.rules.DisabledPotions;
import fr.devsylone.fkpi.rules.Rule;
import fr.devsylone.fkpi.util.XPotionData;
import org.bukkit.Bukkit;
import org.bukkit.Material;
import org.bukkit.potion.PotionType;
import org.java_websocket.WebSocket;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

class EditRuleCommand extends WSCommand {

    EditRuleCommand() {
        super("edit rule", true, "rule", "value");
    }

    @Override
    public boolean execute(FkBoard plugin, FkPI fkpi, WSServer wsServer, WebSocket sender, JsonObject json) {
        Rule<?> rule = Rule.getByName(json.get("rule").getAsString());
        if (rule == null) {
            return false;
        }

        switch (rule.getName()) {
            case "AllowedBlocks":
                if (!json.get("value").isJsonArray()) {
                    return false;
                }
                AllowedBlocks allowedBlocks = fkpi.getRulesManager().getRule(Rule.ALLOWED_BLOCKS);
                allowedBlocks.fillWithDefaultValue();
                for (Material material : parseAllowedBlocks(json.get("value").getAsJsonArray())) {
                    allowedBlocks.add(material);
                }
                Bukkit.getPluginManager().callEvent(new RuleChangeEvent<>(Rule.ALLOWED_BLOCKS, allowedBlocks));
                return true;
            case "DisabledPotions":
                if (!json.get("value").isJsonArray()) {
                    return false;
                }
                DisabledPotions disabledPotions = fkpi.getRulesManager().getRule(Rule.DISABLED_POTIONS);
                disabledPotions.getValue().clear();
                for (XPotionData potion : parseDisabledPotions(json.get("value").getAsJsonArray())) {
                    disabledPotions.disablePotion(potion);
                }
                return true;
            default:
                List<String> args = new ArrayList<>();
                args.add(json.get("rule").getAsString());
                args.addAll(Arrays.asList(json.get("value").getAsString().split(" ")));
                FkRuleCommand command = (FkRuleCommand) wsServer.getFk().getCommandManager().search(FkRuleCommand.class).orElseThrow(() -> new RuntimeException("Can't get rule"));
                AbstractCommand c = command.get(args);
                if (c.equals(command) || !c.isValidExecutor(Bukkit.getConsoleSender())) {
                    return false;
                }
                try {
                    c.execute(wsServer.getFk(), Bukkit.getConsoleSender(), args, "FkBoard");
                } catch (ArgumentParseException e) {
                    plugin.getLogger().warning("Invalid rule data sent by " + sender.getRemoteSocketAddress() + " (" + e.getMessage() + ")");
                } catch (FkLightException e) {
                    plugin.getLogger().warning("Cannot change " + rule.getName() + " rule (" + e.getMessage() + ")");
                }
                return true;
        }
    }

    private List<Material> parseAllowedBlocks(JsonArray value) {
        List<Material> allowedBlocks = new ArrayList<>();
        for (JsonElement block : value) {
            Material material = Material.matchMaterial(block.getAsString());
            if (material != null) {
                allowedBlocks.add(material);
            }
        }
        return allowedBlocks;
    }

    private List<XPotionData> parseDisabledPotions(JsonArray value) {
        List<XPotionData> disabledPotions = new ArrayList<>();
        for (JsonElement potion : value) {
            try {
                disabledPotions.add(new XPotionData(PotionType.valueOf(potion.getAsString()), false, false));
            } catch (IllegalArgumentException ignored) {

            }
        }
        return disabledPotions;
    }
}
