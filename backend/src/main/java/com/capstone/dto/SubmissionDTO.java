package com.capstone.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmissionDTO {
    private Long id;
    private Long deliverableId;
    private String deliverableName;
    private String submittedBy;
    private String fileName;
    private Long fileSize;
    private String fileType;
    private String status;
    private String feedback;
    private Boolean isLatest;
    private Integer versionNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
