package com.worldready.backend.dto.request;

import com.worldready.backend.model.InterviewMessage;
import java.util.List;
import java.util.Map;

public class SessionSaveRequest {
    private String sessionId;
    private String region;
    private String role;
    private List<InterviewMessage> conversationHistory;
    private Map<String, Integer> scores;

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public List<InterviewMessage> getConversationHistory() { return conversationHistory; }
    public void setConversationHistory(List<InterviewMessage> conversationHistory) { this.conversationHistory = conversationHistory; }

    public Map<String, Integer> getScores() { return scores; }
    public void setScores(Map<String, Integer> scores) { this.scores = scores; }
}