package com.worldready.backend.controller;

import com.worldready.backend.dto.request.MapsRequest;
import com.worldready.backend.dto.response.MapsResponse;
import com.worldready.backend.service.GoogleMapsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/maps")
@CrossOrigin(origins = "*")
public class MapsController {

    private final GoogleMapsService mapsService;

    public MapsController(GoogleMapsService mapsService) {
        this.mapsService = mapsService;
    }

    @PostMapping("/location")
    public MapsResponse getLocation(@RequestBody MapsRequest request) {
        return mapsService.getLocationData(request.getCity());
    }
}