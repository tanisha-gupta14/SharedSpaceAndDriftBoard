package com.tan.LittleWorld.service;



import com.tan.LittleWorld.dto.BoardSummaryResponse;
import com.tan.LittleWorld.dto.MomentResponse;
import com.tan.LittleWorld.event.BoardUpdatedEvent;
import com.tan.LittleWorld.event.MomentLikedEvent;
import com.tan.LittleWorld.event.MomentProcessedEvent;
import com.tan.LittleWorld.event.MomentUploadedEvent;
import com.tan.LittleWorld.model.Board;
import com.tan.LittleWorld.model.Moment;
import com.tan.LittleWorld.repository.BoardRepository;
import com.tan.LittleWorld.repository.MomentRepository;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class BroadcastService {

    private final MomentRepository momentRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final BoardRepository boardRepository;

    public BroadcastService(MomentRepository momentRepository, SimpMessagingTemplate messagingTemplate, BoardRepository boardRepository) {
        this.momentRepository = momentRepository;
        this.messagingTemplate = messagingTemplate;
        this.boardRepository = boardRepository;
    }

    @EventListener
    public void onMomentUploaded(MomentUploadedEvent event) {
        broadcastMoment(event.momentId());
    }

    @EventListener
    public void onMomentProcessed(MomentProcessedEvent event) {
        broadcastMoment(event.momentId());
    }

    @EventListener
    public void onMomentLiked(MomentLikedEvent event) {
        broadcastMoment(event.momentId());
    }

    @EventListener
    public void onBoardUpdated(BoardUpdatedEvent event) {
        Board board = boardRepository.findById(event.boardId()).orElseThrow();

        List<String> previews = momentRepository.findByBoardId(board.getId()).stream()
                .limit(5)
                .map(Moment::getImageUrl)
                .toList();

        BoardSummaryResponse response = new BoardSummaryResponse(
                board.getId(), board.getName(), board.getMemberCount(), previews, board.getCreatedAt()
        );

        messagingTemplate.convertAndSend("/topic/boards", response);
    }

    private void broadcastMoment(UUID momentId) {
        Moment moment = momentRepository.findById(momentId).orElseThrow();

        MomentResponse response = new MomentResponse(
                moment.getId(),
                moment.getImageUrl(),
                moment.getUserCaption(),
                moment.getStatus().name(),
                moment.getLikeCount(),
                moment.getCreatedAt()
        );

        messagingTemplate.convertAndSend("/topic/space", response);
    }
}
