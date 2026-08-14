package com.taskmanagement.backend.task.dto;

import com.taskmanagement.backend.task.Priority;
import com.taskmanagement.backend.task.Status;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record TaskCreateRequest(
        @NotBlank(message = "title is required") @Size(max = 255) String title,
        @Size(max = 255) String description,
        LocalDate dueDate,
        Priority priority,
        Status status) {
}
