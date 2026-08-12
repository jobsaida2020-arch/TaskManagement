package com.taskmanagement.backend.task.dto;

import com.taskmanagement.backend.task.Status;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record TaskMoveRequest(
        @NotNull Status status,
        @NotNull @PositiveOrZero Integer position) {
}
