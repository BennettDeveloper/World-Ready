package com.worldready.backend.model;

import java.util.Map;

public class LeaderboardEntry {
    private String sessionId;
    private String region;
    private String role;
    private Map<String, Integer> scores;

    public LeaderboardEntry() {}

    public LeaderboardEntry(String sessionId, String region, String role, Map<String, Integer> scores) {
        this.sessionId = sessionId;
        this.region = region;
        this.role = role;
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

    public Map<String, Integer> getScores() {
        return scores;
    }

    public void setScores(Map<String, Integer> scores) {
        this.scores = scores;
    }
}