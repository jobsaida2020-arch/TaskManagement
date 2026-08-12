package com.taskmanagement.backend.task;

import java.time.LocalDate;

public record TaskUpdateRequest(
        String title,
        String description,
        LocalDate dueDate,
        Priority priority) {
}
