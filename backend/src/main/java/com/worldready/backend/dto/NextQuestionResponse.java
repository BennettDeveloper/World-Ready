package com.worldready.backend.dto;

public class NextQuestionResponse {
    private String question;
    private boolean complete;

    public NextQuestionResponse() {}

    public NextQuestionResponse(String question, boolean complete) {
        this.question = question;
        this.complete = complete;
    }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public boolean isComplete() { return complete; }
    public void setComplete(boolean complete) { this.complete = complete; }
}