package com.tan.LittleWorld.event;

import java.util.UUID;

public record MomentUploadedEvent(UUID momentId, String imagePath) {
}
