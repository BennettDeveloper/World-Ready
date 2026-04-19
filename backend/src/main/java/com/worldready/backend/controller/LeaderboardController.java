package com.worldready.backend.controller;

import com.worldready.backend.dto.response.LeaderboardEntryResponse;
import com.worldready.backend.service.SessionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class LeaderboardController {

    private final SessionService sessionService;

    public LeaderboardController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @GetMapping("/leaderboard")
    public List<LeaderboardEntryResponse> leaderboard() {
        return sessionService.getAllSessions().stream()
                .filter(s -> s.getScores() != null)
                .sorted((a, b) -> Integer.compare(
                        b.getScores().getOrDefault("confidence", 0),
                        a.getScores().getOrDefault("confidence", 0)
                ))
                .map(s -> new LeaderboardEntryResponse(
                        s.getSessionId(),
                        s.getRegion(),
                        s.getRole(),
                        s.getScores()
                ))
                .collect(Collectors.toList());
    }
}