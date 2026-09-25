package com.tan.LittleWorld.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record BoardSummaryResponse(
        UUID id,
        String name,
        int memberCount,
        List<String> previewImageUrls,
        Instant createdAt
) {}