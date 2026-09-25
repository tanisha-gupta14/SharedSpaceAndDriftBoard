package com.tan.LittleWorld.repository;

import com.tan.LittleWorld.model.Board;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BoardRepository extends JpaRepository<Board, java.util.UUID> {
}
