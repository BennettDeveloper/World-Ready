package com.worldready.backend.model;

public class Persona {
    private String key;
    private String name;
    private String style;
    private String prompt;

    public Persona() {}

    public Persona(String key, String name, String style, String prompt) {
        this.key = key;
        this.name = name;
        this.style = style;
        this.prompt = prompt;
    }

    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getStyle() { return style; }
    public void setStyle(String style) { this.style = style; }

    public String getPrompt() { return prompt; }
    public void setPrompt(String prompt) { this.prompt = prompt; }
}