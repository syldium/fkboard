package com.github.syldium.fkboard.websocket;

import com.github.syldium.fkboard.FkBoard;
import com.github.syldium.fkboard.status.PlayerStatus;
import com.github.syldium.fkboard.websocket.commands.CommandsManager;
import com.github.syldium.fkboard.response.InvalidLogin;
import com.github.syldium.fkboard.response.Response;
import com.github.syldium.fkboard.response.ServerInfo;
import com.github.syldium.fkboard.response.TeamsList;
import com.github.syldium.fkboard.response.serializer.ResponseSerializer;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonSyntaxException;
import fr.devsylone.fallenkingdom.Fk;
import fr.devsylone.fkpi.FkPI;
import org.bukkit.Bukkit;
import org.bukkit.scheduler.BukkitTask;
import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.server.WebSocketServer;
import org.jetbrains.annotations.NotNull;

import java.net.InetSocketAddress;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

public final class WSServer extends WebSocketServer {

    private final FkBoard plugin;
    private final Fk fk;
    private final FkPI fkpi;
    private final List<InetSocketAddress> loggedInUsers = new ArrayList<>();
    private final PlayerStatus playerStatus = new PlayerStatus();
    private final CommandsManager commandsManager = new CommandsManager();
    private final ResponseSerializer serializer = new ResponseSerializer(this.playerStatus::isPlayerOnline);
    private final String serializedServerInfo;

    public WSServer(FkBoard plugin, InetSocketAddress address) {
        super(address);
        this.plugin = plugin;
        this.fk = (Fk) Bukkit.getPluginManager().getPlugin("FallenKingdom");
        assert this.fk != null;
        this.fkpi = this.fk.getFkPI();
        this.serializedServerInfo = this.serializer.serialize(new ServerInfo(plugin));
    }

    @Override
    public void onOpen(WebSocket conn, ClientHandshake handshake) {
        if (this.loggedInUsers.contains(conn.getRemoteSocketAddress())) {
            this.plugin.getLogger().info("Resumed" + conn.getRemoteSocketAddress());
        }
    }

    @Override
    public void onClose(WebSocket conn, int code, String reason, boolean remote) {
        this.loggedInUsers.remove(conn.getRemoteSocketAddress());
    }

    @Override
    public void onMessage(WebSocket conn, String message) {
        JsonElement element;
        try {
            element = new JsonParser().parse(message);
        } catch (JsonSyntaxException exception) {
            return;
        }
        JsonObject json = element.getAsJsonObject();
        String action = json.get("action").getAsString();
        if (!this.loggedInUsers.contains(conn.getRemoteSocketAddress())) {
            if (action.equals("LOGIN " + this.plugin.getConfig().get("password", "fk"))) {
                this.loggedInUsers.add(conn.getRemoteSocketAddress());
                this.plugin.getLogger().info(conn.getRemoteSocketAddress() + " logged in.");
                conn.send(this.serializedServerInfo);
                conn.send(this.serializer.serialize(new TeamsList(FkPI.getInstance().getTeamManager().getTeams(), this.playerStatus)));
            } else {
                conn.send(this.serializer.serialize(new InvalidLogin()));
            }
            return;
        }

        this.plugin.getLogger().info("Got message: " + message);
        this.commandsManager.executeCommand(this.plugin, this.fkpi, this, conn, action, json);
    }

    @Override
    public void onError(WebSocket conn, Exception ex) {

    }

    @Override
    public void onStart() {
        this.plugin.getLogger().info("Starting websocket server");
    }

    public void runSync(Consumer<BukkitTask> task) {
        this.plugin.getServer().getScheduler().runTask(this.plugin, task);
    }

    public void broadcast(Response response) {
        for (WebSocket c : getConnections()) {
            if (this.loggedInUsers.contains(c.getRemoteSocketAddress())) {
                c.send(this.serializer.serialize(response));
            }
        }
    }

    public @NotNull PlayerStatus getPlayerStatus() {
        return this.playerStatus;
    }

    public @NotNull ResponseSerializer getSerializer() {
        return this.serializer;
    }

    public @NotNull Fk getFk() {
        return this.fk;
    }
}
