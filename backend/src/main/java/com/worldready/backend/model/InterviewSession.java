package com.worldready.backend.model;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class InterviewSession {
    private String sessionId;
    private String region;
    private String role;
    private int questionNumber;
    private List<InterviewMessage> conversationHistory = new ArrayList<>();
    private Map<String, Integer> scores;

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public int getQuestionNumber() { return questionNumber; }
    public void setQuestionNumber(int questionNumber) { this.questionNumber = questionNumber; }

    public List<InterviewMessage> getConversationHistory() { return conversationHistory; }
    public void setConversationHistory(List<InterviewMessage> conversationHistory) { this.conversationHistory = conversationHistory; }

    public Map<String, Integer> getScores() { return scores; }
    public void setScores(Map<String, Integer> scores) { this.scores = scores; }
}