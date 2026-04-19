package com.worldready.backend.service;

import com.worldready.backend.dto.response.AnalyzeResponse;
import com.worldready.backend.dto.response.FeedbackResponse;
import com.worldready.backend.model.InterviewMessage;
import com.worldready.backend.model.Persona;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ScoringService {

    private final PersonaService personaService;
    private final ClaudeService claudeService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ScoringService(PersonaService personaService, ClaudeService claudeService) {
        this.personaService = personaService;
        this.claudeService = claudeService;
    }

    public AnalyzeResponse analyze(String region, String role, List<InterviewMessage> history) {
        return analyze(region, role, history, null);
    }

    public AnalyzeResponse analyze(String region, String role, List<InterviewMessage> history, String resumeText) {
        Persona persona = personaService.getPersona(region);

        String historyText = history == null ? "" : history.stream()
                .map(msg -> msg.getSender() + ": " + msg.getText())
                .collect(Collectors.joining("\n"));

        String systemPrompt = persona.getPrompt() + """
                
                Analyze this interview and return ONLY valid JSON.
                No markdown. No explanation. No code fences.
                """;

        String resumeSection = (resumeText != null && !resumeText.isBlank())
                ? "\n\nCandidate Resume:\n" + resumeText
                : "";

        String userPrompt = """
                Analyze this %s interview conversation for a %s role.%s

                Conversation:
                %s

                Return exactly this JSON shape:
                {
                  "scores": {
                    "confidence": 0,
                    "fillerControl": 0,
                    "answerStructure": 0,
                    "culturalAlignment": 0,
                    "followUpHandling": 0
                  },
                  "feedback": {
                    "confidence": "one sentence",
                    "fillerControl": "one sentence",
                    "answerStructure": "one sentence",
                    "culturalAlignment": "one sentence",
                    "followUpHandling": "one sentence"
                  }
                }
                """.formatted(region, role, resumeSection, historyText);

        try {
            String raw = claudeService.sendPrompt(systemPrompt, userPrompt);
            JsonNode root = objectMapper.readTree(raw);

            Map<String, Integer> scores = new HashMap<>();
            JsonNode scoresNode = root.path("scores");
            scores.put("confidence", scoresNode.path("confidence").asInt());
            scores.put("fillerControl", scoresNode.path("fillerControl").asInt());
            scores.put("answerStructure", scoresNode.path("answerStructure").asInt());
            scores.put("culturalAlignment", scoresNode.path("culturalAlignment").asInt());
            scores.put("followUpHandling", scoresNode.path("followUpHandling").asInt());

            JsonNode feedbackNode = root.path("feedback");
            FeedbackResponse feedback = new FeedbackResponse();
            feedback.setConfidence(feedbackNode.path("confidence").asText());
            feedback.setFillerControl(feedbackNode.path("fillerControl").asText());
            feedback.setAnswerStructure(feedbackNode.path("answerStructure").asText());
            feedback.setCulturalAlignment(feedbackNode.path("culturalAlignment").asText());
            feedback.setFollowUpHandling(feedbackNode.path("followUpHandling").asText());

            AnalyzeResponse response = new AnalyzeResponse();
            response.setScores(scores);
            response.setFeedback(feedback);
            response.setRegionBadge(persona.getName());
            return response;

        } catch (Exception e) {
            throw new RuntimeException("Failed to parse analyze response: " + e.getMessage(), e);
        }
    }
}