package com.worldready.backend.dto.request;

public class MapsRequest {
    private String city;

    public MapsRequest() {}

    public MapsRequest(String city) {
        this.city = city;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }
}