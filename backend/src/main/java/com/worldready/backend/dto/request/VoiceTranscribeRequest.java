package com.worldready.backend.dto.request;


public class VoiceTranscribeRequest {
    private String audioUrl;
    public String getAudioUrl() { return audioUrl; }
    public void setAudioUrl(String audioUrl) { this.audioUrl = audioUrl; }
}