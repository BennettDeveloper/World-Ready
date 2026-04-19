package com.worldready.backend.service;

import com.worldready.backend.dto.response.MapsResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class GoogleMapsService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${google.maps.api.key}")
    private String apiKey;

    public MapsResponse getLocationData(String city) {
        try {
            String url = "https://maps.googleapis.com/maps/api/geocode/json?address="
                    + city + "&key=" + apiKey;

            Map response = restTemplate.getForObject(url, Map.class);

            Map result = (Map) ((java.util.List) response.get("results")).get(0);
            Map geometry = (Map) result.get("geometry");
            Map location = (Map) geometry.get("location");

            double lat = ((Number) location.get("lat")).doubleValue();
            double lng = ((Number) location.get("lng")).doubleValue();

            return new MapsResponse(city, lat, lng);

        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch location from Google Maps");
        }
    }
}