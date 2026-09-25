package com.tan.LittleWorld.service;

import com.tan.LittleWorld.model.Moment;
import com.tan.LittleWorld.repository.MomentRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.tan.LittleWorld.event.MomentLikedEvent;
import com.tan.LittleWorld.event.MomentUploadedEvent;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

@Service
public class MomentService {
    private final MomentRepository momentRepository;
    private final ApplicationEventPublisher publisher;
    private static final String UPLOAD_DIR = "uploads";

    public MomentService(MomentRepository momentRepository, ApplicationEventPublisher publisher) {
        this.momentRepository = momentRepository;
        this.publisher = publisher;
        new File(UPLOAD_DIR).mkdirs();
    }

    public Moment upload(MultipartFile file, String userCaption) {
        String webPath = saveFile(file); // e.g. /uploads/abc123_photo.jpg
        String diskPath = "uploads/" + webPath.substring("/uploads/".length()); // e.g. uploads/abc123_photo.jpg

        Moment moment = new Moment(webPath, userCaption);
        momentRepository.save(moment);

        publisher.publishEvent(new MomentUploadedEvent(moment.getId(), diskPath));

        return moment;
    }

    public Moment likeMoment(UUID momentId) {
        Moment moment = momentRepository.findById(momentId)
                .orElseThrow(() -> new RuntimeException("Moment not found"));
        moment.setLikeCount(moment.getLikeCount() + 1);
        Moment saved = momentRepository.save(moment);
        publisher.publishEvent(new MomentLikedEvent(saved.getId()));
        return saved;
    }

    public List<Moment> getRecent(int limit) {
        return momentRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, limit));
    }

    private String saveFile(MultipartFile file) {
        try {
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path destination = Path.of(UPLOAD_DIR, filename);
            Files.copy(file.getInputStream(), destination);
            return "/uploads/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to save uploaded file", e);
        }
    }
}