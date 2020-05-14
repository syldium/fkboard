package com.github.syldium.fkboard.listeners;

import com.github.syldium.fkboard.FkBoard;
import com.github.syldium.fkboard.websocket.responses.PlayerChange;
import com.github.syldium.fkboard.websocket.responses.TeamsList;
import fr.devsylone.fkpi.FkPI;
import fr.devsylone.fkpi.api.event.PlayerTeamChangeEvent;
import fr.devsylone.fkpi.api.event.TeamUpdateEvent;
import org.bukkit.Bukkit;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.scheduler.BukkitRunnable;

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
        new BukkitRunnable() {
            @Override
            public void run() {
                TeamsList teamsList = new TeamsList(FkPI.getInstance().getTeamManager().getTeams(), plugin.getPlayerStatus());
                plugin.getWSServer().broadcast(teamsList);
            }
        }.runTaskLaterAsynchronously(plugin, 1L);
    }
}
