package com.worldready.backend.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.worldready.backend.dto.DIdResponse;

@Service
public class DIdService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${did.api.key:}")
    private String apiKey;

    @Value("${did.api.url:}")
    private String apiUrl;

    @Value("${did.avatar.id:}")
    private String avatarId;

    public DIdService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public DIdResponse speak(String text){
        DIdResponse r = new DIdResponse();
        if(apiKey == null || apiKey.isBlank() || apiUrl == null || apiUrl.isBlank()){
            r.setSuccess(false);
            r.setMessage("D-ID not configured on the backend. This is a mocked response: " + (text == null ? "" : "\""+text+"\""));
            r.setVideoUrl(null);
            return r;
        }

        try{
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization","Bearer " + apiKey);

            Map<String,Object> body = new HashMap<>();
            body.put("text", text);
            if(avatarId != null && !avatarId.isBlank()) body.put("avatar_id", avatarId);

            HttpEntity<Map<String,Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> resp = restTemplate.postForEntity(apiUrl, request, String.class);

            JsonNode root = objectMapper.readTree(resp.getBody());
            String videoUrl = null;
            if(root.has("result_url")) videoUrl = root.get("result_url").asText();
            else if(root.has("video_url")) videoUrl = root.get("video_url").asText();

            r.setSuccess(true);
            r.setVideoUrl(videoUrl);
            r.setMessage("OK");
            return r;
        }catch(Exception e){
            r.setSuccess(false);
            r.setMessage("D-ID call failed: " + e.getMessage());
            r.setVideoUrl(null);
            return r;
        }
    }
}
