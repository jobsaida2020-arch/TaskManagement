package com.taskmanagement.backend.task.dto;

import com.taskmanagement.backend.task.Priority;

import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record TaskUpdateRequest(
        @Size(max = 255) String title,
        @Size(max = 255) String description,
        LocalDate dueDate,
        Priority priority) {
}
