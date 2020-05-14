package com.github.syldium.fkboard.websocket;

import com.github.syldium.fkboard.FkBoard;
import com.github.syldium.fkboard.status.PlayerStatus;
import com.github.syldium.fkboard.websocket.responses.LoginRequired;
import com.github.syldium.fkboard.websocket.responses.Response;
import com.github.syldium.fkboard.websocket.responses.TeamsList;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonSyntaxException;
import fr.devsylone.fallenkingdom.Fk;
import fr.devsylone.fkpi.FkPI;
import fr.devsylone.fkpi.api.ITeam;
import org.bukkit.scheduler.BukkitTask;
import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.server.WebSocketServer;

import java.net.InetSocketAddress;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

public class WSServer extends WebSocketServer {

    private final FkBoard plugin;
    private final Fk fk;
    private final FkPI fkpi;
    private final List<InetSocketAddress> loggedInUsers = new ArrayList<>();
    private final PlayerStatus playerStatus = new PlayerStatus();

    public WSServer(FkBoard plugin, InetSocketAddress address) {
        super(address);
        this.plugin = plugin;
        this.fk = FkBoard.getPlugin(Fk.class);
        this.fkpi = this.fk.getFkPI();
    }

    @Override
    public void onOpen(WebSocket conn, ClientHandshake handshake) {
        if (loggedInUsers.contains(conn.getRemoteSocketAddress())) {
            plugin.getLogger().info("Resumed" + conn.getRemoteSocketAddress());
        }
    }

    @Override
    public void onClose(WebSocket conn, int code, String reason, boolean remote) {
        loggedInUsers.remove(conn.getRemoteSocketAddress());
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
        if (!loggedInUsers.contains(conn.getRemoteSocketAddress())) {
            if (action.equals("LOGIN " + plugin.getConfig().get("password", "fk"))) {
                loggedInUsers.add(conn.getRemoteSocketAddress());
                plugin.getLogger().info(conn.getRemoteSocketAddress() + " logged in.");
                conn.send(new LoginRequired(true).toJSON());
                conn.send(new TeamsList(FkPI.getInstance().getTeamManager().getTeams(), playerStatus).toJSON());
            } else {
                conn.send(new LoginRequired(false).toJSON());
            }
            return;
        }

        plugin.getLogger().info("Got message: " + message);
        receive(action, json);
    }

    @Override
    public void onError(WebSocket conn, Exception ex) {

    }

    @Override
    public void onStart() {
        plugin.getLogger().info("Starting websocket server");
    }

    private void receive(String action, JsonObject json) {
        switch (action.toLowerCase()) {
            case "move":
                if (!json.has("player") || !json.has("team")) {
                    return;
                }
                String player = json.get("player").getAsString();
                String team = json.get("team").getAsString();
                if (fkpi.getTeamManager().getPlayerTeam(player) != null) {
                    fkpi.getTeamManager().removePlayerOfHisTeam(player);
                }
                if (!team.equals("__noteam")) {
                    fkpi.getTeamManager().addPlayer(player, team);
                }
                runSync(task -> fk.getScoreboardManager().recreateAllScoreboards());
                break;
            case "insert team":
                if (!json.has("team")) {
                    return;
                }
                fkpi.getTeamManager().createTeam(json.get("team").getAsString());
                runSync(task -> fk.getScoreboardManager().recreateAllScoreboards());
                break;
            case "change team name":
                if (!json.has("previous") || !json.has("newName")) {
                    return;
                }
                ITeam team_ = fkpi.getTeamManager().getTeam(json.get("previous").getAsString());
                team_.setName(json.get("newName").getAsString());
                runSync(task -> fk.getScoreboardManager().recreateAllScoreboards());
                break;
            case "delete team":
                if (!json.has("team")) {
                    return;
                }
                fkpi.getTeamManager().removeTeam(json.get("team").getAsString());
                runSync(task -> fk.getScoreboardManager().recreateAllScoreboards());
                break;
        }
    }

    private void runSync(Consumer<BukkitTask> task) {
        plugin.getServer().getScheduler().runTaskLater(plugin, task, 1L);
    }

    public void broadcast(Response response) {
        for (WebSocket c : getConnections()) {
            if (loggedInUsers.contains(c.getRemoteSocketAddress())) {
                c.send(response.toJSON());
            }
        }
    }

    public PlayerStatus getPlayerStatus() {
        return playerStatus;
    }
}
