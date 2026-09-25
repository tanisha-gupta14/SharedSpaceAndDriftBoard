package com.tan.LittleWorld.service.ml;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.io.File;

@Component
public class HttpCaptioningClient implements CaptioningClient {

    private final RestClient restClient;

    public HttpCaptioningClient(@Value("${ml.service.url}") String mlServiceUrl) {
        this.restClient = RestClient.builder().baseUrl(mlServiceUrl).build();
    }

    @Override
    public String caption(String imageUrl) {
        File imageFile = new File(imageUrl);

        CaptionResponse response = restClient.post()
                .uri("/caption")
                .body(new org.springframework.util.LinkedMultiValueMap<String, Object>() {{
                    add("file", new org.springframework.core.io.FileSystemResource(imageFile));
                }})
                .retrieve()
                .body(CaptionResponse.class);

        return response.name(); // matches your NamingResponse schema field
    }
}

record CaptionResponse(String name) {}