package com.taskmanager.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class TaskResponse {
    private Long id;
    private String name;
    private String description;
    private Boolean completed;
    private LocalDate dueDate;
    private LocalDate createdDate;
    private String username;
}