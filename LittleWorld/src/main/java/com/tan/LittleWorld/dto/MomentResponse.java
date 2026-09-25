package com.tan.LittleWorld.dto;

public record MomentResponse(
        java.util.UUID id,
        String imageUrl,
        String userCaption,
        String status,
        int likeCount,
        java.time.Instant createdAt
) {
}
