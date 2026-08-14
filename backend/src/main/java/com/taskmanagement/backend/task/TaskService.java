package com.taskmanagement.backend.task;

import com.taskmanagement.backend.task.dto.TaskCreateRequest;
import com.taskmanagement.backend.task.dto.TaskMoveRequest;
import com.taskmanagement.backend.task.dto.TaskUpdateRequest;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<Task> getTasks(Status status, Priority priority) {
        if (status != null && priority == null) {
            return taskRepository.findByStatusOrderByPositionAsc(status);
        }
        List<Task> tasks;
        if (status != null) {
            tasks = taskRepository.findByStatusAndPriority(status, priority);
        } else if (priority != null) {
            tasks = taskRepository.findByPriority(priority);
        } else {
            tasks = taskRepository.findAll();
        }
        return tasks.stream().sorted(Comparator.comparing(Task::getPosition)).toList();
    }

    public Optional<Task> getTask(Long id) {
        return taskRepository.findById(id);
    }

    @Transactional
    public Task createTask(TaskCreateRequest request) {
        Task task = new Task();
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setDueDate(request.dueDate());
        if (request.priority() != null) {
            task.setPriority(request.priority());
        }
        if (request.status() != null) {
            task.setStatus(request.status());
        }
        task.setPosition(nextPosition(task.getStatus()));
        return taskRepository.save(task);
    }

    @Transactional
    public Optional<Task> updateTask(Long id, TaskUpdateRequest request) {
        return taskRepository.findById(id).map(task -> {
            if (request.title() != null) {
                task.setTitle(request.title());
            }
            if (request.description() != null) {
                task.setDescription(request.description());
            }
            if (request.dueDate() != null) {
                task.setDueDate(request.dueDate());
            }
            if (request.priority() != null) {
                task.setPriority(request.priority());
            }
            return taskRepository.save(task);
        });
    }

    @Transactional
    public Optional<Task> moveTask(Long id, TaskMoveRequest request) {
        return taskRepository.findById(id).map(task -> {
            Status oldStatus = task.getStatus();
            Status newStatus = request.status();

            List<Task> oldColumn = taskRepository.findByStatusOrderByPositionAsc(oldStatus);
            oldColumn.removeIf(t -> t.getId().equals(id));

            List<Task> newColumn = oldStatus.equals(newStatus)
                    ? oldColumn
                    : taskRepository.findByStatusOrderByPositionAsc(newStatus);

            int insertIndex = Math.max(0, Math.min(request.position(), newColumn.size()));
            newColumn.add(insertIndex, task);

            task.setStatus(newStatus);
            reindex(newColumn);
            if (!oldStatus.equals(newStatus)) {
                reindex(oldColumn);
                taskRepository.saveAll(oldColumn);
            }
            taskRepository.saveAll(newColumn);
            return task;
        });
    }

    @Transactional
    public boolean deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            return false;
        }
        taskRepository.deleteById(id);
        return true;
    }

    private void reindex(List<Task> tasks) {
        for (int i = 0; i < tasks.size(); i++) {
            tasks.get(i).setPosition(i);
        }
    }

    private int nextPosition(Status status) {
        return taskRepository.findByStatusOrderByPositionAsc(status).size();
    }
}
