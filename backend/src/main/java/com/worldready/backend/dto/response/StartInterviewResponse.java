package com.worldready.backend.dto.response;

public class StartInterviewResponse {
    private String sessionId;
    private String question;
    private String interviewerName;
    private String interviewerStyle;

    public StartInterviewResponse() {}

    public StartInterviewResponse(String sessionId, String question, String interviewerName, String interviewerStyle) {
        this.sessionId = sessionId;
        this.question = question;
        this.interviewerName = interviewerName;
        this.interviewerStyle = interviewerStyle;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getInterviewerName() {
        return interviewerName;
    }

    public void setInterviewerName(String interviewerName) {
        this.interviewerName = interviewerName;
    }

    public String getInterviewerStyle() {
        return interviewerStyle;
    }

    public void setInterviewerStyle(String interviewerStyle) {
        this.interviewerStyle = interviewerStyle;
    }
}