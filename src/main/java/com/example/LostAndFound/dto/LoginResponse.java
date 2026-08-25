package com.example.LostAndFound.dto;

public record LoginResponse(Long userId, String username, String userType, String token) { }
