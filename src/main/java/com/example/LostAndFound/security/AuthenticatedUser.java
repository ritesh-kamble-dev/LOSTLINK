package com.example.LostAndFound.security;

public record AuthenticatedUser(Long userId, String username, String role) { }
