package com.worldready.backend.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.worldready.backend.dto.DIdRequest;
import com.worldready.backend.dto.DIdResponse;
import com.worldready.backend.service.DIdService;

@RestController
@RequestMapping("/api/did")
@CrossOrigin(origins = "*")
public class DIdController {

    private final DIdService dIdService;

    public DIdController(DIdService dIdService) {
        this.dIdService = dIdService;
    }

    @PostMapping("/speak")
    public DIdResponse speak(@RequestBody DIdRequest request){
        return dIdService.speak(request.getText());
    }
}
