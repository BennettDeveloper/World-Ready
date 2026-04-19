package com.worldready.backend.controller;

import com.worldready.backend.dto.request.SentimentRequest;
import com.worldready.backend.service.SentimentService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class SentimentController {

    private final SentimentService sentimentService;

    public SentimentController(SentimentService sentimentService) {
        this.sentimentService = sentimentService;
    }

    @PostMapping("/sentiment")
    public Map<String, Object> sentiment(@RequestBody SentimentRequest request) {
        return sentimentService.analyzeSentiment(request.getText());
    }
}