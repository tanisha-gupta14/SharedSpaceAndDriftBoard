package com.tan.LittleWorld.controller;



import com.tan.LittleWorld.dto.BoardDetailResponse;
import com.tan.LittleWorld.dto.BoardSummaryResponse;
import com.tan.LittleWorld.service.BoardService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/boards")
public class BoardController {

    private final BoardService boardService;

    public BoardController(BoardService boardService) {
        this.boardService = boardService;
    }

    @GetMapping
    public List<BoardSummaryResponse> getAllBoards() {
        return boardService.getAllBoards();
    }

    @GetMapping("/{id}")
    public BoardDetailResponse getBoardDetail(@PathVariable UUID id) {
        return boardService.getBoardDetail(id);
    }
}
