package com.github.syldium.fkboard.response;

import io.github.classgraph.ClassGraph;
import io.github.classgraph.ClassInfo;
import io.github.classgraph.ScanResult;
import it.unimi.dsi.fastutil.ints.IntOpenHashSet;
import it.unimi.dsi.fastutil.ints.IntSet;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.fail;

public class ResponseRegistryTest {

    @Test @SuppressWarnings("unchecked")
    public void uniqueIdentifier() {
        String packageName = Response.class.getPackage().getName();
        ResponseRegistry registry = new ResponseRegistry();
        IntSet ids = new IntOpenHashSet();

        try (ScanResult scanResult = new ClassGraph().enableClassInfo().acceptPackages(packageName).scan()) {
            for (ClassInfo classInfo : scanResult.getClassesImplementing(Response.class.getName())) {
                Class<? extends Response> responseType = (Class<? extends Response>) classInfo.loadClass();
                int identifier = registry.getIdentifier(responseType);
                if (identifier < 1) {
                    fail("The response should have an identifier.");
                }

                if (!ids.add(identifier)) {
                    fail("The response identifier should be unique.");
                }
            }
        }
    }
}
