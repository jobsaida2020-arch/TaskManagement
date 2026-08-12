package com.taskmanagement.backend.task;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public Task createTask(Task task) {
        task.setPosition(nextPosition(task.getStatus()));
        return taskRepository.save(task);
    }

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
