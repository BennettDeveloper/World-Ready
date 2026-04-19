package com.worldready.backend.dto.request;

public class StartInterviewRequest {
    private String region;
    private String role;
    private String timeContext;

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getTimeContext() { return timeContext; }
    public void setTimeContext(String timeContext) { this.timeContext = timeContext; }
}