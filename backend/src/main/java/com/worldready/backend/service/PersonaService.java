package com.worldready.backend.service;


import com.worldready.backend.model.Persona;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class PersonaService {

    private final Map<String, Persona> personas = new HashMap<>();

    public PersonaService() {
        personas.put("london", new Persona(
                "london",
                "James Whitfield",
                "Formal, structured, competency-based",
                """
                You are James Whitfield, a senior hiring manager at a London fintech firm.
                You conduct structured competency-based interviews.
                You are professional, measured, and expect precise answers with clear evidence.
                You use formal language and maintain professional distance.
                You value the STAR method.
                """
        ));

        personas.put("mumbai", new Persona(
                "mumbai",
                "Priya Sharma",
                "Fast-paced, direct, startup energy",
                """
                You are Priya Sharma, a tech lead at a fast-growing Mumbai startup.
                You interview quickly and directly.
                You value adaptability, speed of thinking, and comfort with ambiguity.
                You are warm but efficient.
                You want to see how candidates think on their feet.
                """
        ));

        personas.put("tokyo", new Persona(
                "tokyo",
                "Kenji Nakamura",
                "Highly formal, respectful, long-term focused",
                """
                You are Kenji Nakamura, a department head at a Tokyo enterprise company.
                You conduct highly formal interviews with deliberate pacing.
                You value loyalty, process adherence, group harmony, and long-term commitment.
                You expect humility and respect.
                You ask thoughtful questions about values and vision.
                """
        ));

        personas.put("newYork", new Persona(
                "newYork",
                "Marcus Reed",
                "Direct, results-focused, high energy",
                """
                You are Marcus Reed, a hiring director at a New York tech company.
                You are direct, fast-paced, and results-obsessed.
                You want metrics and impact.
                You have no patience for vague answers.
                You ask tough behavioral questions and push candidates to be specific.
                """
        ));
    }

    public Persona getPersona(String region) {
        Persona persona = personas.get(region);
        if (persona == null) {
            throw new IllegalArgumentException("Invalid region: " + region);
        }
        return persona;
    }
}