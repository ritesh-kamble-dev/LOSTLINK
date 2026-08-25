package com.example.LostAndFound.dto;

import java.time.LocalDateTime;

public record ItemDetailsResponse(
        Long itemId,
        String itemName,
        String itemType,
        String description,
        String location,
        String status,
        LocalDateTime dateReported,
        Long reporterId,
        String reportedBy,
        String reporterEmail) {
}
