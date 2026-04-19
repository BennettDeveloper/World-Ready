package com.worldready.backend.controller;

import com.worldready.backend.dto.request.VoiceSynthesizeRequest;
import com.worldready.backend.dto.request.VoiceTranscribeRequest;
import com.worldready.backend.service.VoiceService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/voice")
@CrossOrigin(origins = "*")
public class VoiceController {

    private final VoiceService voiceService;

    public VoiceController(VoiceService voiceService) {
        this.voiceService = voiceService;
    }

    @PostMapping("/synthesize")
    public Map<String, Object> synthesize(@RequestBody VoiceSynthesizeRequest request) {
        return voiceService.synthesize(request.getText());
    }

    @PostMapping("/transcribe")
    public Map<String, Object> transcribe(@RequestBody VoiceTranscribeRequest request) {
        return voiceService.transcribe(request.getAudioUrl());
    }
}