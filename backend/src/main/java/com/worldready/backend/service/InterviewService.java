package com.worldready.backend.service;

import com.worldready.backend.dto.response.NextQuestionResponse;
import com.worldready.backend.dto.response.StartInterviewResponse;
import com.worldready.backend.model.InterviewMessage;
import com.worldready.backend.model.InterviewSession;
import com.worldready.backend.model.Persona;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InterviewService {

    private final PersonaService personaService;
    private final ClaudeService claudeService;
    private final SessionService sessionService;

    public InterviewService(PersonaService personaService,
                            ClaudeService claudeService,
                            SessionService sessionService) {
        this.personaService = personaService;
        this.claudeService = claudeService;
        this.sessionService = sessionService;
    }

    public StartInterviewResponse startInterview(String region, String role, String timeContext) {
        Persona persona = personaService.getPersona(region);

        InterviewSession session = sessionService.createSession(region, role);

        String systemPrompt = (timeContext != null && !timeContext.isBlank())
                ? "IMPORTANT CONTEXT: " + timeContext + " Adjust your interviewer persona's mood, patience level, and energy accordingly.\n\n" + persona.getPrompt()
                : persona.getPrompt();

        String userPrompt = """
                You are interviewing a candidate for a %s position.
                Ask your first interview question.
                Return only the question, nothing else.
                """.formatted(role);

        String question = claudeService.sendPrompt(systemPrompt, userPrompt);

        session.getConversationHistory().add(new InterviewMessage("AI", question));
        session.setQuestionNumber(1);
        sessionService.saveSession(session);

        return new StartInterviewResponse(
                session.getSessionId(),
                question,
                persona.getName(),
                persona.getStyle()
        );
    }

    public NextQuestionResponse nextQuestion(String region, String role, List<InterviewMessage> history, int questionNumber, String timeContext) {
        if (questionNumber >= 3) {
            return new NextQuestionResponse(null, true);
        }

        Persona persona = personaService.getPersona(region);

        String systemPrompt = (timeContext != null && !timeContext.isBlank())
                ? "IMPORTANT CONTEXT: " + timeContext + " Adjust your interviewer persona's mood, patience level, and energy accordingly.\n\n" + persona.getPrompt()
                : persona.getPrompt();

        String historyText = history == null ? "" : history.stream()
                .map(msg -> msg.getSender() + ": " + msg.getText())
                .collect(Collectors.joining("\n"));

        String userPrompt = """
                You are interviewing a candidate for a %s position.
                Here is the conversation so far:
                %s

                Ask the next interview question.
                Keep your regional style consistent.
                Return only the question, nothing else.
                """.formatted(role, historyText);

        String question = claudeService.sendPrompt(systemPrompt, userPrompt);

        return new NextQuestionResponse(question, false);
    }
}