package com.taskmanagement.backend.task.dto;

import com.taskmanagement.backend.task.Priority;

import java.time.LocalDate;

public record TaskUpdateRequest(
        String title,
        String description,
        LocalDate dueDate,
        Priority priority) {
}
