package com.worldready.backend.controller;

import com.worldready.backend.dto.request.AnalyzeRequest;
import com.worldready.backend.dto.request.NextQuestionRequest;
import com.worldready.backend.dto.request.SessionSaveRequest;
import com.worldready.backend.dto.request.StartInterviewRequest;
import com.worldready.backend.dto.response.AnalyzeResponse;
import com.worldready.backend.dto.response.NextQuestionResponse;
import com.worldready.backend.dto.response.StartInterviewResponse;
import com.worldready.backend.model.InterviewSession;
import com.worldready.backend.service.InterviewService;
import com.worldready.backend.service.ScoringService;
import com.worldready.backend.service.SessionService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class InterviewController {

    private final InterviewService interviewService;
    private final ScoringService scoringService;
    private final SessionService sessionService;

    public InterviewController(InterviewService interviewService,
                               ScoringService scoringService,
                               SessionService sessionService) {
        this.interviewService = interviewService;
        this.scoringService = scoringService;
        this.sessionService = sessionService;
    }

    @PostMapping("/start-interview")
    public StartInterviewResponse startInterview(@RequestBody StartInterviewRequest request) {
        return interviewService.startInterview(request.getRegion(), request.getRole(), request.getTimeContext());
    }

    @PostMapping("/next-question")
    public NextQuestionResponse nextQuestion(@RequestBody NextQuestionRequest request) {
        return interviewService.nextQuestion(
                request.getRegion(),
                request.getRole(),
                request.getConversationHistory(),
                request.getQuestionNumber(),
                request.getTimeContext()
        );
    }

    @PostMapping("/analyze")
    public AnalyzeResponse analyze(@RequestBody AnalyzeRequest request) {
        return scoringService.analyze(
                request.getRegion(),
                request.getRole(),
                request.getConversationHistory(),
                request.getResumeText(),
                request.getTimeContext()
        );
    }

    @PostMapping("/session/save")
    public Map<String, String> saveSession(@RequestBody SessionSaveRequest request) {
        InterviewSession session = sessionService.getSession(request.getSessionId());

        if (session == null) {
            session = new InterviewSession();
            session.setSessionId(request.getSessionId());
        }

        session.setRegion(request.getRegion());
        session.setRole(request.getRole());
        session.setConversationHistory(request.getConversationHistory());
        session.setScores(request.getScores());

        if (request.getConversationHistory() != null) {
            session.setQuestionNumber(request.getConversationHistory().size());
        }

        sessionService.saveSession(session);
        return Map.of("status", "saved");
    }
}