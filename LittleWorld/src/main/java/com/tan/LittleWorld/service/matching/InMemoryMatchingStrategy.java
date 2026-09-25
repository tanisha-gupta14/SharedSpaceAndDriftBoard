package com.tan.LittleWorld.service.matching;



import com.tan.LittleWorld.model.Board;
import com.tan.LittleWorld.repository.BoardRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class InMemoryMatchingStrategy implements BoardMatchingStrategy {

    private static final double THRESHOLD = 0.55;

    private final BoardRepository boardRepository;

    public InMemoryMatchingStrategy(BoardRepository boardRepository) {
        this.boardRepository = boardRepository;
    }

    @Override
    public Optional<Board> findBestMatch(float[] embedding) {
        List<Board> boards = boardRepository.findAll();

        Board best = null;
        double bestSim = -1;

        for (Board board : boards) {
            double sim = cosineSimilarity(embedding, board.getCentroid());
            if (sim > bestSim) {
                bestSim = sim;
                best = board;
            }
        }

        if (best != null && bestSim >= THRESHOLD) {
            return Optional.of(best);
        }
        return Optional.empty();
    }

    private double cosineSimilarity(float[] a, float[] b) {
        double dot = 0;
        for (int i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
        }
        return dot;
    }
}
