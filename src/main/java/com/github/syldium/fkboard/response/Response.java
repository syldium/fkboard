package com.github.syldium.fkboard.response;

import com.github.syldium.fkboard.response.serializer.ResponseSerializer;
import org.jetbrains.annotations.NotNull;

/**
 * A server response.
 */
public interface Response {

    /**
     * Gets the unique code of this response.
     *
     * @return The response ID.
     */
    default int getIdentifier(@NotNull ResponseRegistry registry) {
        return registry.getIdentifier(this);
    }

    /**
     * Gets the unique code of this response.
     *
     * @return The response ID.
     */
    default int getIdentifier(@NotNull ResponseSerializer serializer) {
        return getIdentifier(serializer.getRegistry());
    }
}