package com.worldready.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class ClaudeService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${anthropic.api.key:}")
    private String apiKey;

    @Value("${anthropic.api.url:}")
    private String apiUrl;

    @Value("${anthropic.model:}")
    private String model;

    public ClaudeService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String sendPrompt(String systemPrompt, String userPrompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-api-key", apiKey);
            headers.set("anthropic-version", "2023-06-01");

            Map<String, Object> body = Map.of(
                    "model", model,
                    "max_tokens", 500,
                    "system", systemPrompt,
                    "messages", List.of(
                            Map.of(
                                    "role", "user",
                                    "content", userPrompt
                            )
                    )
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, request, String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode content = root.path("content");

            if (content.isArray() && !content.isEmpty()) {
                return content.get(0).path("text").asText();
            }

            throw new RuntimeException("Unexpected Claude response format");
        } catch (Exception e) {
            throw new RuntimeException("Claude API call failed: " + e.getMessage(), e);
        }
    }
}