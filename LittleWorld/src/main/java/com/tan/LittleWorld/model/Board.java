package com.tan.LittleWorld.model;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Array;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "boards")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Board {

    @Id
    @GeneratedValue
    private UUID id;

    private String name; // null until enough captions exist to name it

    @JdbcTypeCode(SqlTypes.VECTOR)
    @Array(length = 512)
    private float[] centroid;

    @OneToMany(mappedBy = "board")
    private List<Moment> members = new ArrayList<>();

    private int memberCount = 0;

    private Instant createdAt = Instant.now();

    public Board(float[] initialEmbedding) {
        this.centroid = initialEmbedding;
        this.memberCount = 1;
    }
}
