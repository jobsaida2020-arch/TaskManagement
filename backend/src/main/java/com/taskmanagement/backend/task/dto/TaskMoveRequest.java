package com.taskmanagement.backend.task.dto;

import com.taskmanagement.backend.task.Status;

public record TaskMoveRequest(Status status, int position) {
}
