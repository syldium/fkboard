package com.github.syldium.fkboard.response;

import com.github.syldium.fkboard.response.serializer.ResponseSerializer;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import org.junit.jupiter.api.Test;

import java.util.function.Predicate;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class SerializerTest {

    private static final Predicate<String> ALWAYS_TRUE = s -> true;

    @Test
    public void serialize() {
        ResponseSerializer serializer = new ResponseSerializer(ALWAYS_TRUE);
        serializer.getRegistry().map(25, DummyResponse.class);
        DummyResponse response = new DummyResponse("A text.");

        JsonObject excepted = new JsonObject();
        excepted.addProperty("id", 25);
        excepted.addProperty("text", response.getText());

        JsonElement json = serializer.toJsonTree(response);
        assertEquals(excepted, json);
    }

    @Test
    public void serializePlayerChange() {
        ResponseSerializer serializer = new ResponseSerializer(ALWAYS_TRUE);
        Response response = new PlayerChange("playerName", null, true);

        JsonObject excepted = new JsonObject();
        excepted.addProperty("id", response.getIdentifier(serializer));
        excepted.addProperty("player", "playerName");
        excepted.addProperty("online", true);

        JsonElement json = serializer.toJsonTree(response);
        assertEquals(excepted, json);
    }

    private static class DummyResponse implements Response {

        private final String text;

        private DummyResponse(String text) {
            this.text = text;
        }

        public String getText() {
            return this.text;
        }
    }
}
