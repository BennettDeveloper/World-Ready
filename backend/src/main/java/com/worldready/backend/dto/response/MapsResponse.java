package com.worldready.backend.dto.response;

public class MapsResponse {
    private String city;
    private double lat;
    private double lng;

    public MapsResponse() {}

    public MapsResponse(String city, double lat, double lng) {
        this.city = city;
        this.lat = lat;
        this.lng = lng;
    }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public double getLat() { return lat; }
    public void setLat(double lat) { this.lat = lat; }

    public double getLng() { return lng; }
    public void setLng(double lng) { this.lng = lng; }
}
