package com.tan.LittleWorld.repository;

import com.tan.LittleWorld.model.Moment;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MomentRepository  extends JpaRepository<Moment,UUID> {
    List<Moment> findByBoardId(UUID boardId);
    long countByBoardId(UUID boardId);

    List<Moment> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
