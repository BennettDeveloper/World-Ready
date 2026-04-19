package com.worldready.backend.dto.response;

import java.util.Map;

public class UserHistoryResponse {
    private String sessionId;
    private String region;
    private String role;
    private int questionNumber;
    private Map<String, Integer> scores;

    public UserHistoryResponse() {}

    public UserHistoryResponse(String sessionId, String region, String role, int questionNumber, Map<String, Integer> scores) {
        this.sessionId = sessionId;
        this.region = region;
        this.role = role;
        this.questionNumber = questionNumber;
        this.scores = scores;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public int getQuestionNumber() {
        return questionNumber;
    }

    public void setQuestionNumber(int questionNumber) {
        this.questionNumber = questionNumber;
    }

    public Map<String, Integer> getScores() {
        return scores;
    }

    public void setScores(Map<String, Integer> scores) {
        this.scores = scores;
    }
}