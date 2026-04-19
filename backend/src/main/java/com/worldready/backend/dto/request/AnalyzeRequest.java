package com.worldready.backend.dto.request;


import com.worldready.backend.model.InterviewMessage;

import java.util.List;

public class AnalyzeRequest {
    private String region;
    private String role;
    private List<InterviewMessage> conversationHistory;

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public List<InterviewMessage> getConversationHistory() { return conversationHistory; }
    public void setConversationHistory(List<InterviewMessage> conversationHistory) { this.conversationHistory = conversationHistory; }
}