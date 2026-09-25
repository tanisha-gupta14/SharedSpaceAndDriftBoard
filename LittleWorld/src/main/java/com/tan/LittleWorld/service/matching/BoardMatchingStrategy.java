package com.tan.LittleWorld.service.matching;

import com.tan.LittleWorld.model.Board;

import java.util.Optional;

public interface BoardMatchingStrategy {
    Optional<Board> findBestMatch(float[] embedding);
}