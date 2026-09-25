package com.tan.LittleWorld.service.ml;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.io.File;

@Component
public class HttpEmbeddingClient implements EmbeddingClient{

    private final RestClient restClient;

    public HttpEmbeddingClient(@Value("${ml.service.url}") String mlServiceUrl) {
        this.restClient = RestClient.builder().baseUrl(mlServiceUrl).build();
    }


    @Override
    public float[] embed(String imageUrl) {
        // imageUrl here is actually a local file path on disk for now
        File imageFile = new File(imageUrl);

        EmbeddingResponse response = restClient.post()
                .uri("/embed")
                .body(new org.springframework.util.LinkedMultiValueMap<String, Object>() {{
                    add("file", new org.springframework.core.io.FileSystemResource(imageFile));
                }})
                .retrieve()
                .body(EmbeddingResponse.class);

        float[] embedding = new float[response.embedding().size()];
        for (int i = 0; i < embedding.length; i++) {
            embedding[i] = response.embedding().get(i);
        }
        return embedding;
    }
}

record EmbeddingResponse(java.util.List<Float> embedding) {}
