package com.tan.LittleWorld.service;


import com.tan.LittleWorld.event.MomentProcessedEvent;
import com.tan.LittleWorld.event.MomentUploadedEvent;
import com.tan.LittleWorld.model.Moment;
import com.tan.LittleWorld.model.MomentStatus;
import com.tan.LittleWorld.repository.MomentRepository;
import com.tan.LittleWorld.service.ml.CaptioningClient;
import com.tan.LittleWorld.service.ml.EmbeddingClient;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class MomentProcessingService {

    private final MomentRepository momentRepository;
    private final EmbeddingClient embeddingClient;
    private final CaptioningClient captioningClient;
    private final BoardAssignmentService boardAssignmentService;
    private final ApplicationEventPublisher publisher;

    public MomentProcessingService(MomentRepository momentRepository,
                                   EmbeddingClient embeddingClient,
                                   CaptioningClient captioningClient, BoardAssignmentService boardAssignmentService,
                                   ApplicationEventPublisher publisher) {
        this.momentRepository = momentRepository;
        this.embeddingClient = embeddingClient;
        this.captioningClient = captioningClient;
        this.boardAssignmentService = boardAssignmentService;
        this.publisher = publisher;
    }

    @Async
    @EventListener
    public void handleUploaded(MomentUploadedEvent event) {
        Moment moment = momentRepository.findById(event.momentId())
                .orElseThrow();

        try {
            String generatedCaption = captioningClient.caption(event.imagePath());
            moment.setGeneratedCaption(generatedCaption);
            moment.setStatus(MomentStatus.PROCESSED);

            float[] embedding = embeddingClient.embed(event.imagePath());
            System.out.println("Got embedding of length: " + embedding.length);
            // board assignment comes in a later step — for now just proving this works
            moment.setEmbedding(embedding);
            boardAssignmentService.assign(moment);
        } catch (Exception e) {
            moment.setStatus(MomentStatus.FAILED);
            System.err.println("ML processing failed for moment " + moment.getId() + ": " + e.getMessage());
        }

        momentRepository.save(moment);
        publisher.publishEvent(new MomentProcessedEvent(moment.getId()));
    }
}