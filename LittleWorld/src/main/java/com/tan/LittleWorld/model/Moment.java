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
import java.util.UUID;

@Entity
@Table(name="moments")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Moment {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String imageUrl;

    private String userCaption;
    private  String generatedCaption;

    @Enumerated(EnumType.STRING)
    private MomentStatus status=MomentStatus.PENDING;

    @JdbcTypeCode(SqlTypes.VECTOR)
    @Array(length = 512)
    private float[] embedding;

    @ManyToOne
    @JoinColumn(name = "board_id")
    private Board board;

    private int likeCount=0;

    private Instant createdAt=Instant.now();

    public Moment(String imageUrl, String userCaption) {
        this.imageUrl = imageUrl;
        this.userCaption = userCaption;
    }

}
