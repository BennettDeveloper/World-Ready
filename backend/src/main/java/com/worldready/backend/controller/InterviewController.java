package com.worldready.backend.controller;

import com.worldready.backend.dto.*;
import com.worldready.backend.service.InterviewService;
import com.worldready.backend.service.ScoringService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class InterviewController {

    private final InterviewService interviewService;
    private final ScoringService scoringService;

    public InterviewController(InterviewService interviewService, ScoringService scoringService) {
        this.interviewService = interviewService;
        this.scoringService = scoringService;
    }

    @PostMapping("/start-interview")
    public StartInterviewResponse startInterview(@RequestBody StartInterviewRequest request) {
        return interviewService.startInterview(request.getRegion(), request.getRole());
    }

    @PostMapping("/next-question")
    public NextQuestionResponse nextQuestion(@RequestBody NextQuestionRequest request) {
        return interviewService.nextQuestion(
                request.getRegion(),
                request.getRole(),
                request.getConversationHistory(),
                request.getQuestionNumber()
        );
    }

    @PostMapping("/analyze")
    public AnalyzeResponse analyze(@RequestBody AnalyzeRequest request) {
        return scoringService.analyze(
                request.getRegion(),
                request.getRole(),
                request.getConversationHistory(),
                request.getResumeText()
        );
    }
}