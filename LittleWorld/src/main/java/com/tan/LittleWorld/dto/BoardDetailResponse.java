package com.tan.LittleWorld.dto;

import java.util.List;
import java.util.UUID;

public record BoardDetailResponse(
        UUID id,
        String name,
        int memberCount,
        List<MomentResponse> members
) {}