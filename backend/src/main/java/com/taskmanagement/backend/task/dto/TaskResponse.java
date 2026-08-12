package com.taskmanagement.backend.task.dto;

import com.taskmanagement.backend.task.Priority;
import com.taskmanagement.backend.task.Status;
import com.taskmanagement.backend.task.Task;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record TaskResponse(
        Long id,
        String title,
        String description,
        LocalDate dueDate,
        Priority priority,
        Status status,
        Integer position,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {

    public static TaskResponse from(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getDueDate(),
                task.getPriority(),
                task.getStatus(),
                task.getPosition(),
                task.getCreatedAt(),
                task.getUpdatedAt());
    }
}
