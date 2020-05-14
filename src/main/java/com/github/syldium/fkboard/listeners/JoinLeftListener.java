package com.github.syldium.fkboard.listeners;

import com.github.syldium.fkboard.FkBoard;
import com.github.syldium.fkboard.websocket.responses.PlayerChange;
import fr.devsylone.fkpi.FkPI;
import fr.devsylone.fkpi.api.ITeam;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.event.player.PlayerQuitEvent;

public class JoinLeftListener implements Listener {

    private final FkBoard plugin;

    public JoinLeftListener(FkBoard plugin) {
        this.plugin = plugin;
    }

    @EventHandler
    public void onPlayerJoin(PlayerJoinEvent event) {
        plugin.getPlayerStatus().update(event.getPlayer().getName(),true);
        broadcastPlayerChange(event.getPlayer(), true);
    }

    @EventHandler
    public void onPlayerQuit(PlayerQuitEvent event) {
        plugin.getPlayerStatus().update(event.getPlayer().getName(),false);
        broadcastPlayerChange(event.getPlayer(), false);
    }

    private void broadcastPlayerChange(Player player, boolean online) {
        ITeam team = FkPI.getInstance().getTeamManager().getPlayerTeam(player);
        PlayerChange playerChange = new PlayerChange(player.getName(), team, online);
        plugin.getWSServer().broadcast(playerChange);
    }
}
