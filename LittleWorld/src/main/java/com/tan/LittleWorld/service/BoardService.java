package com.tan.LittleWorld.service;



import com.tan.LittleWorld.dto.BoardDetailResponse;
import com.tan.LittleWorld.dto.BoardSummaryResponse;
import com.tan.LittleWorld.dto.MomentResponse;
import com.tan.LittleWorld.model.Board;
import com.tan.LittleWorld.model.Moment;
import com.tan.LittleWorld.repository.BoardRepository;
import com.tan.LittleWorld.repository.MomentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class BoardService {

    private final BoardRepository boardRepository;
    private final MomentRepository momentRepository;

    public BoardService(BoardRepository boardRepository, MomentRepository momentRepository) {
        this.boardRepository = boardRepository;
        this.momentRepository = momentRepository;
    }

    public List<BoardSummaryResponse> getAllBoards() {
        return boardRepository.findAll().stream()
                .map(b -> {
                    List<String> previews = momentRepository.findByBoardId(b.getId()).stream()
                            .limit(5)
                            .map(Moment::getImageUrl)
                            .toList();
                    return new BoardSummaryResponse(b.getId(), b.getName(), b.getMemberCount(), previews, b.getCreatedAt());
                })
                .toList();
    }

    public BoardDetailResponse getBoardDetail(UUID boardId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));

        List<Moment> members = momentRepository.findByBoardId(boardId);

        List<MomentResponse> memberResponses = members.stream()
                .map(m -> new MomentResponse(
                        m.getId(), m.getImageUrl(), m.getUserCaption(),
                        m.getStatus().name(), m.getLikeCount(), m.getCreatedAt()))
                .toList();

        return new BoardDetailResponse(board.getId(), board.getName(), board.getMemberCount(), memberResponses);
    }
}