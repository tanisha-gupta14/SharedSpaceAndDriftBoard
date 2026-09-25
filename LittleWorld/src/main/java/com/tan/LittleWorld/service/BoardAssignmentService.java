package com.tan.LittleWorld.service;

import com.tan.LittleWorld.event.BoardUpdatedEvent;
import com.tan.LittleWorld.model.Board;
import com.tan.LittleWorld.model.Moment;
import com.tan.LittleWorld.repository.BoardRepository;
import com.tan.LittleWorld.repository.MomentRepository;
import com.tan.LittleWorld.service.matching.BoardMatchingStrategy;
import com.tan.LittleWorld.service.ml.NamingClient;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class BoardAssignmentService {

    private static final int MAX_NAMING_CAPTIONS = 5;

    private final BoardRepository boardRepository;
    private final MomentRepository momentRepository;
    private final BoardMatchingStrategy matchingStrategy;
    private final NamingClient namingClient;
    private final ApplicationEventPublisher publisher;

    public BoardAssignmentService(BoardRepository boardRepository,
                                  MomentRepository momentRepository,
                                  BoardMatchingStrategy matchingStrategy,
                                  NamingClient namingClient,
                                  ApplicationEventPublisher publisher) {
        this.boardRepository = boardRepository;
        this.momentRepository = momentRepository;
        this.matchingStrategy = matchingStrategy;
        this.namingClient = namingClient;
        this.publisher = publisher;
    }

    public void assign(Moment moment) {
        float[] embedding = moment.getEmbedding();

        Optional<Board> match = matchingStrategy.findBestMatch(embedding);

        if (match.isPresent()) {
            addToBoard(match.get(), embedding, moment);
            boardRepository.save(match.get());
        } else {
            createNewBoard(embedding, moment);
        }
    }

    private void createNewBoard(float[] embedding, Moment moment) {
        Board board = new Board(embedding);

        String caption = moment.getGeneratedCaption();
        if (caption != null) {
            String name = namingClient.generateName(List.of(caption));
            board.setName(name);
        }

        boardRepository.save(board);
        moment.setBoard(board);
        publisher.publishEvent(new BoardUpdatedEvent(board.getId()));
    }

    private void addToBoard(Board board, float[] newEmbedding, Moment moment) {
        int n = board.getMemberCount();
        float[] centroid = board.getCentroid();
        float[] updated = new float[centroid.length];

        for (int i = 0; i < centroid.length; i++) {
            updated[i] = (centroid[i] * n + newEmbedding[i]) / (n + 1);
        }

        double norm = 0;
        for (float v : updated) norm += v * v;
        norm = Math.sqrt(norm);
        for (int i = 0; i < updated.length; i++) {
            updated[i] = (float) (updated[i] / norm);
        }

        board.setCentroid(updated);
        board.setMemberCount(n + 1);
        moment.setBoard(board);

        if (shouldRenameBoard(board.getMemberCount())) {
            renameBoard(board);
        }

        publisher.publishEvent(new BoardUpdatedEvent(board.getId()));
    }

    private boolean shouldRenameBoard(int memberCount) {
        // rename at 3, then every doubling after: 4, 8, 16...
        return memberCount == 3 || (memberCount >= 4 && (memberCount & (memberCount - 1)) == 0);
    }

    private void renameBoard(Board board) {
        List<Moment> members = momentRepository.findByBoardId(board.getId());
        float[] centroid = board.getCentroid();

        List<String> captions = members.stream()
                .filter(m -> m.getGeneratedCaption() != null && m.getEmbedding() != null)
                .sorted((a, b) -> Double.compare(
                        cosineSimilarity(b.getEmbedding(), centroid),
                        cosineSimilarity(a.getEmbedding(), centroid)
                ))
                .limit(MAX_NAMING_CAPTIONS)
                .map(Moment::getGeneratedCaption)
                .toList();

        if (captions.isEmpty()) return;

        String newName = namingClient.generateName(captions);
        board.setName(newName);
    }

    private double cosineSimilarity(float[] a, float[] b) {
        double dot = 0;
        for (int i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
        }
        return dot;
    }
}