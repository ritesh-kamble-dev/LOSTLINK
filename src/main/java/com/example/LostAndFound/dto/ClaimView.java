package com.example.LostAndFound.dto;

import java.time.LocalDateTime;

public record ClaimView(Long claimId, String claimantName, String claimType,
        String answers, String status, LocalDateTime claimDate) { }
