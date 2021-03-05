package com.github.syldium.fkboard.response;

import fr.devsylone.fallenkingdom.scoreboard.PlaceHolder;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ScoreboardContent implements Response {

    private final Map<String, String> placeholders;
    private final List<String> lines;

    public ScoreboardContent(Map<String, String> placeholders, List<String> lines) {
        this.placeholders = placeholders;
        this.lines = lines;
    }

    public ScoreboardContent(PlaceHolder[] placeholders, List<String> lines) {
        Map<String, String> placeholdersMap = new HashMap<>();
        for (PlaceHolder placeholder : placeholders) {
            placeholdersMap.put(placeholder.getShortestKey(), placeholder.getDescription());
        }
        this.placeholders = placeholdersMap;
        this.lines = lines;
    }
}
