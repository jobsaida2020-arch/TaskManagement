package com.taskmanagement.backend.task.dto;

import com.taskmanagement.backend.task.Priority;

import java.time.LocalDate;

public record TaskCreateRequest(
        String title,
        String description,
        LocalDate dueDate,
        Priority priority) {
}
