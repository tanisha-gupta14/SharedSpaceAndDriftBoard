package com.tan.LittleWorld.service.ml;



import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
public class HttpNamingClient implements NamingClient {

    private final RestClient restClient;

    public HttpNamingClient(@Value("${ml.service.url}") String mlServiceUrl) {
        this.restClient = RestClient.builder().baseUrl(mlServiceUrl).build();
    }

    @Override
    public String generateName(List<String> captions) {
        NamingResponse response = restClient.post()
                .uri("/name-board")
                .body(new NamingRequest(captions))
                .retrieve()
                .body(NamingResponse.class);

        System.out.println("NAME FROM ML SERVICE: " + response.name());

        return response.name();
    }
}

record NamingRequest(List<String> captions) {}
record NamingResponse(String name) {}