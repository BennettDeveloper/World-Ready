package com.worldready.backend.service;

import com.worldready.backend.model.InterviewSession;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SessionService {
    private final Map<String, InterviewSession> sessions = new ConcurrentHashMap<>();

    public InterviewSession createSession(String region, String role) {
        InterviewSession session = new InterviewSession();
        session.setSessionId(UUID.randomUUID().toString());
        session.setRegion(region);
        session.setRole(role);
        session.setQuestionNumber(1);
        sessions.put(session.getSessionId(), session);
        return session;
    }

    public InterviewSession getSession(String sessionId) {
        return sessions.get(sessionId);
    }

    public void saveSession(InterviewSession session) {
        sessions.put(session.getSessionId(), session);
    }

    public List<InterviewSession> getAllSessions() {
        return new ArrayList<>(sessions.values());
    }
}