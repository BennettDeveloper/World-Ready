package com.worldready.backend.dto.response;

public class FeedbackResponse {
    private String confidence;
    private String fillerControl;
    private String answerStructure;
    private String culturalAlignment;
    private String followUpHandling;

    public String getConfidence() { return confidence; }
    public void setConfidence(String confidence) { this.confidence = confidence; }

    public String getFillerControl() { return fillerControl; }
    public void setFillerControl(String fillerControl) { this.fillerControl = fillerControl; }

    public String getAnswerStructure() { return answerStructure; }
    public void setAnswerStructure(String answerStructure) { this.answerStructure = answerStructure; }

    public String getCulturalAlignment() { return culturalAlignment; }
    public void setCulturalAlignment(String culturalAlignment) { this.culturalAlignment = culturalAlignment; }

    public String getFollowUpHandling() { return followUpHandling; }
    public void setFollowUpHandling(String followUpHandling) { this.followUpHandling = followUpHandling; }
}