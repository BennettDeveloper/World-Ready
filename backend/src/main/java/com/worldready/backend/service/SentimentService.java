package com.worldready.backend.service;

import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class SentimentService {
    public Map<String, Object> analyzeSentiment(String text) {
        return Map.of(
                "sentiment", "confident",
                "score", 0.82,
                "summary", "Response sounded mostly confident and composed."
        );
    }
}