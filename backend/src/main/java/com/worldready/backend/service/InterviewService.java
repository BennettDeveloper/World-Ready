package com.worldready.backend.service;

import com.worldready.backend.dto.NextQuestionResponse;
import com.worldready.backend.dto.StartInterviewResponse;
import com.worldready.backend.model.InterviewMessage;
import com.worldready.backend.model.Persona;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InterviewService {

    private final PersonaService personaService;
    private final ClaudeService claudeService;

    public InterviewService(PersonaService personaService, ClaudeService claudeService) {
        this.personaService = personaService;
        this.claudeService = claudeService;
    }

    public StartInterviewResponse startInterview(String region, String role) {
        Persona persona = personaService.getPersona(region);

        String userPrompt = """
                You are interviewing a candidate for a %s position.
                Ask your first interview question.
                Return only the question, nothing else.
                """.formatted(role);

        String question = claudeService.sendPrompt(persona.getPrompt(), userPrompt);

        return new StartInterviewResponse(question, persona.getName(), persona.getStyle());
    }

    public NextQuestionResponse nextQuestion(String region, String role, List<InterviewMessage> history, int questionNumber) {
        if (questionNumber >= 3) {
            return new NextQuestionResponse(null, true);
        }

        Persona persona = personaService.getPersona(region);

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

        String question = claudeService.sendPrompt(persona.getPrompt(), userPrompt);

        return new NextQuestionResponse(question, false);
    }
}