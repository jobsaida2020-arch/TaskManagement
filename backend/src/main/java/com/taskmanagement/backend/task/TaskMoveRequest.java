package com.taskmanagement.backend.task;

public record TaskMoveRequest(Status status, int position) {
}
