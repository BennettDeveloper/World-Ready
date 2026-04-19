package com.worldready.backend.dto.request;

public class SentimentRequest {
    private String text;

    public SentimentRequest() {}

    public SentimentRequest(String text) {
        this.text = text;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
}