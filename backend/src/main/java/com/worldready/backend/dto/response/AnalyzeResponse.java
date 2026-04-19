package com.worldready.backend.dto.response;

import java.util.Map;

public class AnalyzeResponse {
    private Map<String, Integer> scores;
    private FeedbackResponse feedback;
    private String regionBadge;

    public Map<String, Integer> getScores() { return scores; }
    public void setScores(Map<String, Integer> scores) { this.scores = scores; }

    public FeedbackResponse getFeedback() { return feedback; }
    public void setFeedback(FeedbackResponse feedback) { this.feedback = feedback; }

    public String getRegionBadge() { return regionBadge; }
    public void setRegionBadge(String regionBadge) { this.regionBadge = regionBadge; }
}