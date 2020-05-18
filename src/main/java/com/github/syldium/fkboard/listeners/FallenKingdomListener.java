package com.github.syldium.fkboard.listeners;

import com.github.syldium.fkboard.FkBoard;
import com.github.syldium.fkboard.websocket.responses.PlayerChange;
import com.github.syldium.fkboard.websocket.responses.RuleChange;
import com.github.syldium.fkboard.websocket.responses.TeamsList;
import fr.devsylone.fkpi.FkPI;
import fr.devsylone.fkpi.api.event.PlayerTeamChangeEvent;
import fr.devsylone.fkpi.api.event.RuleChangeEvent;
import fr.devsylone.fkpi.api.event.TeamUpdateEvent;
import org.bukkit.Bukkit;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;

public class FallenKingdomListener implements Listener {

    private final FkBoard plugin;

    public FallenKingdomListener(FkBoard plugin) {
        this.plugin = plugin;
    }

    @EventHandler
    public void onPlayerTeamChange(PlayerTeamChangeEvent event) {
        PlayerChange playerChange = new PlayerChange(event.getPlayerName(), event.getTeam(), Bukkit.getPlayer(event.getPlayerName()) != null);
        plugin.getWSServer().broadcast(playerChange);
    }

    @EventHandler
    public void onTeamChange(TeamUpdateEvent event) {
        if (event.getUpdateType().equals(TeamUpdateEvent.TeamUpdate.SET_BASE)) {
            return;
        }
        plugin.getServer().getScheduler().runTaskLaterAsynchronously(plugin, () -> {
            TeamsList teamsList = new TeamsList(FkPI.getInstance().getTeamManager().getTeams(), plugin.getPlayerStatus());
            plugin.getWSServer().broadcast(teamsList);
        }, 1L);
    }

    @EventHandler
    public <T> void onRuleChange(RuleChangeEvent<T> event) {
        plugin.getServer().getScheduler().runTaskLaterAsynchronously(plugin, () -> {
            RuleChange ruleChange = new RuleChange(event.getRule(), event.getValue());
            plugin.getWSServer().broadcast(ruleChange);
        }, 1L);
    }
}
