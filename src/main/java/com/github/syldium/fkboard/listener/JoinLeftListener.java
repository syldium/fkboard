package com.github.syldium.fkboard.listener;

import com.github.syldium.fkboard.FkBoard;
import com.github.syldium.fkboard.response.PlayerChange;
import fr.devsylone.fkpi.FkPI;
import fr.devsylone.fkpi.api.ITeam;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.event.player.PlayerQuitEvent;
import org.jetbrains.annotations.NotNull;

public class JoinLeftListener implements Listener {

    private final FkBoard plugin;

    public JoinLeftListener(FkBoard plugin) {
        this.plugin = plugin;
    }

    @EventHandler
    public void onPlayerJoin(PlayerJoinEvent event) {
        broadcastPlayerChange(event.getPlayer(), true);
    }

    @EventHandler
    public void onPlayerQuit(PlayerQuitEvent event) {
        broadcastPlayerChange(event.getPlayer(), false);
    }

    private void broadcastPlayerChange(@NotNull Player player, boolean online) {
        plugin.getPlayerStatus().update(player.getName(), online);
        ITeam team = FkPI.getInstance().getTeamManager().getPlayerTeam(player);
        PlayerChange playerChange = new PlayerChange(player.getName(), team, online);
        plugin.getWSServer().broadcast(playerChange);
    }
}
