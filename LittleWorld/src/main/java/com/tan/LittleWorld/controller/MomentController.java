package com.tan.LittleWorld.controller;


import com.tan.LittleWorld.dto.MomentResponse;
import com.tan.LittleWorld.model.Moment;
import com.tan.LittleWorld.service.MomentService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/moments")
public class MomentController {

    private final MomentService momentService;

    public MomentController(MomentService momentService) {
        this.momentService = momentService;
    }

    @PostMapping(consumes = "multipart/form-data")
    public MomentResponse upload(@RequestParam("file") MultipartFile file,
                                 @RequestParam(required = false) String caption) {
        Moment moment = momentService.upload(file, caption);
        return toResponse(moment);
    }

    @PostMapping("/{id}/like")
    public MomentResponse like(@PathVariable UUID id) {
        Moment moment = momentService.likeMoment(id);
        return toResponse(moment);
    }

    // add to MomentController
    @GetMapping("/recent")
    public List<MomentResponse> recent() {
        return momentService.getRecent(20).stream()
                .map(this::toResponse)
                .toList();
    }

    private MomentResponse toResponse(Moment moment) {
        return new MomentResponse(
                moment.getId(),
                moment.getImageUrl(),
                moment.getUserCaption(),
                moment.getStatus().name(),
                moment.getLikeCount(),
                moment.getCreatedAt()
        );
    }
}
