package com.worldready.backend.dto;

public class DIdResponse {
    private boolean success;
    private String videoUrl;
    private String message;

    public DIdResponse() {}

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
