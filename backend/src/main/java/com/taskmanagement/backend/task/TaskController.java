package com.taskmanagement.backend.task;

import com.taskmanagement.backend.exception.ResourceNotFoundException;
import com.taskmanagement.backend.task.dto.TaskCreateRequest;
import com.taskmanagement.backend.task.dto.TaskMoveRequest;
import com.taskmanagement.backend.task.dto.TaskResponse;
import com.taskmanagement.backend.task.dto.TaskUpdateRequest;

import jakarta.validation.Valid;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public List<TaskResponse> getTasks(
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) Priority priority) {
        return taskService.getTasks(status, priority).stream()
                .map(TaskResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public TaskResponse getTask(@PathVariable Long id) {
        return taskService.getTask(id)
                .map(TaskResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: id=" + id));
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody TaskCreateRequest request) {
        Task saved = taskService.createTask(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(TaskResponse.from(saved));
    }

    @PatchMapping("/{id}")
    public TaskResponse updateTask(@PathVariable Long id, @Valid @RequestBody TaskUpdateRequest request) {
        return taskService.updateTask(id, request)
                .map(TaskResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: id=" + id));
    }

    @PatchMapping("/{id}/position")
    public TaskResponse moveTask(@PathVariable Long id, @Valid @RequestBody TaskMoveRequest request) {
        return taskService.moveTask(id, request)
                .map(TaskResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: id=" + id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        if (!taskService.deleteTask(id)) {
            throw new ResourceNotFoundException("Task not found: id=" + id);
        }
        return ResponseEntity.noContent().build();
    }
}
