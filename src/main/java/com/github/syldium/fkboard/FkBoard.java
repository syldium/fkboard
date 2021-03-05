package com.github.syldium.fkboard;

import com.github.syldium.fkboard.listener.FallenKingdomListener;
import com.github.syldium.fkboard.listener.JoinLeftListener;
import com.github.syldium.fkboard.status.PlayerStatus;
import com.github.syldium.fkboard.websocket.WSServer;
import org.bukkit.plugin.java.JavaPlugin;

import java.io.IOException;
import java.net.InetSocketAddress;

import static java.util.Objects.requireNonNull;

public final class FkBoard extends JavaPlugin {

    private WSServer server;
    private Thread wsThread;

    @Override
    public void onEnable() {
        saveDefaultConfig();

        getServer().getPluginManager().registerEvents(new JoinLeftListener(this), this);
        getServer().getPluginManager().registerEvents(new FallenKingdomListener(this), this);

        InetSocketAddress address = new InetSocketAddress(requireNonNull(getConfig().getString("host", "0.0.0.0")), getConfig().getInt("port", 50000));
        server = new WSServer(this, address);
        wsThread = new Thread(() -> server.run());
        wsThread.start();
    }

    @Override
    public void onDisable() {
        try {
            server.stop();
            wsThread = null;
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }

    public PlayerStatus getPlayerStatus() {
        return server.getPlayerStatus();
    }

    public WSServer getWSServer() {
        return server;
    }
}
