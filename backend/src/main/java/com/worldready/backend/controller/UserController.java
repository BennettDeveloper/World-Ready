package com.worldready.backend.controller;

import com.worldready.backend.dto.response.UserHistoryResponse;
import com.worldready.backend.service.SessionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    private final SessionService sessionService;

    public UserController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @GetMapping("/history")
    public List<UserHistoryResponse> history() {
        return sessionService.getAllSessions().stream()
                .map(s -> new UserHistoryResponse(
                        s.getSessionId(),
                        s.getRegion(),
                        s.getRole(),
                        s.getQuestionNumber(),
                        s.getScores()
                ))
                .collect(Collectors.toList());
    }
}