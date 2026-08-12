package com.taskmanagement.backend.task;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByStatus(Status status);

    List<Task> findByPriority(Priority priority);

    List<Task> findByStatusAndPriority(Status status, Priority priority);

    List<Task> findByStatusOrderByPositionAsc(Status status);
}
