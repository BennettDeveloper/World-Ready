package com.worldready.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class VoiceService {
    private final RestTemplate restTemplate;

    @Value("${elevenlabs.api.key:}")
    private String elevenApiKey;

    @Value("${elevenlabs.voice.id:}")
    private String voiceId;

    public VoiceService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Map<String, Object> synthesize(String text) {
        if (elevenApiKey == null || elevenApiKey.isBlank()) {
            return Map.of("success", false, "message", "ElevenLabs not configured");
        }

        return Map.of(
                "success", true,
                "message", "Wire ElevenLabs response here",
                "text", text
        );
    }

    public Map<String, Object> transcribe(String audioUrl) {
        return Map.of(
                "success", true,
                "transcript", "Mock transcript until Deepgram is connected",
                "audioUrl", audioUrl
        );
    }
}