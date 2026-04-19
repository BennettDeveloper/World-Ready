package com.worldready.backend.dto;

public class StartInterviewRequest {
    private String region;
    private String role;

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}