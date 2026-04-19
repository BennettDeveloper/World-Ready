package com.worldready.backend.dto;


public class StartInterviewResponse {
    private String question;
    private String interviewerName;
    private String interviewerStyle;

    public StartInterviewResponse() {}

    public StartInterviewResponse(String question, String interviewerName, String interviewerStyle) {
        this.question = question;
        this.interviewerName = interviewerName;
        this.interviewerStyle = interviewerStyle;
    }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getInterviewerName() { return interviewerName; }
    public void setInterviewerName(String interviewerName) { this.interviewerName = interviewerName; }

    public String getInterviewerStyle() { return interviewerStyle; }
    public void setInterviewerStyle(String interviewerStyle) { this.interviewerStyle = interviewerStyle; }
}