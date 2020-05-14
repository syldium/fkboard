package com.github.syldium.fkboard.websocket.responses;

import org.jetbrains.annotations.NotNull;

public interface Response {

    int getStatusCode();

    @NotNull
    String toJSON();
}