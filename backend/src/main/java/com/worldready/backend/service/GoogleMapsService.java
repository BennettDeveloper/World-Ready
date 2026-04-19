package com.worldready.backend.service;

import com.worldready.backend.dto.response.MapsResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
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

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            @SuppressWarnings("unchecked")
            Map<String, Object> result = (Map<String, Object>) ((List<?>) response.get("results")).get(0);
            @SuppressWarnings("unchecked")
            Map<String, Object> geometry = (Map<String, Object>) result.get("geometry");
            @SuppressWarnings("unchecked")
            Map<String, Object> location = (Map<String, Object>) geometry.get("location");

            double lat = ((Number) location.get("lat")).doubleValue();
            double lng = ((Number) location.get("lng")).doubleValue();

            return new MapsResponse(city, lat, lng);

        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch location from Google Maps");
        }
    }
}