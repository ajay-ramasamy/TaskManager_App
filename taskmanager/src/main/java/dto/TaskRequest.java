package com.taskmanager.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class TaskRequest {
    private String name;
    private String description;
    private Boolean completed;
    private LocalDate dueDate;
}