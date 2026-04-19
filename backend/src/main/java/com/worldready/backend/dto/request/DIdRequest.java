package com.worldready.backend.dto.request;

public class DIdRequest {
    private String text;

    public DIdRequest() {}

    public DIdRequest(String text) { this.text = text; }

    public String getText() { return text; }

    public void setText(String text) { this.text = text; }
}
