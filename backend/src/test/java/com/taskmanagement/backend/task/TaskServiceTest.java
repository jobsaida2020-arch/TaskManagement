package com.taskmanagement.backend.task;

import com.taskmanagement.backend.task.dto.TaskCreateRequest;
import com.taskmanagement.backend.task.dto.TaskMoveRequest;
import com.taskmanagement.backend.task.dto.TaskUpdateRequest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private TaskService taskService;

    private Task task(Long id, Status status, int position) {
        Task task = new Task();
        task.setTitle("task-" + id);
        task.setStatus(status);
        task.setPosition(position);
        setId(task, id);
        return task;
    }

    private void setId(Task task, Long id) {
        try {
            var field = Task.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(task, id);
        } catch (ReflectiveOperationException e) {
            throw new RuntimeException(e);
        }
    }

    @BeforeEach
    void setUp() {
    }

    @Test
    void createTask_採番されたpositionでタスクが保存される() {
        when(taskRepository.findByStatusOrderByPositionAsc(Status.NOT_STARTED))
                .thenReturn(List.of(task(1L, Status.NOT_STARTED, 0), task(2L, Status.NOT_STARTED, 1)));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Task created = taskService.createTask(new TaskCreateRequest("新規タスク", null, null, null, null));

        assertThat(created.getTitle()).isEqualTo("新規タスク");
        assertThat(created.getStatus()).isEqualTo(Status.NOT_STARTED);
        assertThat(created.getPosition()).isEqualTo(2);
    }

    @Test
    void createTask_statusを指定するとその列のpositionで採番される() {
        when(taskRepository.findByStatusOrderByPositionAsc(Status.IN_PROGRESS))
                .thenReturn(List.of(task(1L, Status.IN_PROGRESS, 0)));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Task created = taskService.createTask(
                new TaskCreateRequest("進行中タスク", null, null, null, Status.IN_PROGRESS));

        assertThat(created.getStatus()).isEqualTo(Status.IN_PROGRESS);
        assertThat(created.getPosition()).isEqualTo(1);
    }

    @Test
    void updateTask_nullのフィールドは更新されない() {
        Task existing = task(1L, Status.NOT_STARTED, 0);
        existing.setDescription("元の説明");
        existing.setPriority(Priority.LOW);
        when(taskRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Optional<Task> updated = taskService.updateTask(1L,
                new TaskUpdateRequest("新しいタイトル", null, null, null));

        assertThat(updated).isPresent();
        assertThat(updated.get().getTitle()).isEqualTo("新しいタイトル");
        assertThat(updated.get().getDescription()).isEqualTo("元の説明");
        assertThat(updated.get().getPriority()).isEqualTo(Priority.LOW);
    }

    @Test
    void updateTask_存在しないIDの場合は空を返す() {
        when(taskRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<Task> updated = taskService.updateTask(99L,
                new TaskUpdateRequest("title", null, null, null));

        assertThat(updated).isEmpty();
    }

    @Test
    void moveTask_同一列内で末尾に移動すると各positionが振り直される() {
        Task moving = task(1L, Status.NOT_STARTED, 0);
        Task other = task(2L, Status.NOT_STARTED, 1);
        List<Task> column = new ArrayList<>(List.of(moving, other));

        when(taskRepository.findById(1L)).thenReturn(Optional.of(moving));
        when(taskRepository.findByStatusOrderByPositionAsc(Status.NOT_STARTED)).thenReturn(column);
        when(taskRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        Optional<Task> result = taskService.moveTask(1L, new TaskMoveRequest(Status.NOT_STARTED, 1));

        assertThat(result).isPresent();
        assertThat(result.get().getPosition()).isEqualTo(1);
        assertThat(other.getPosition()).isEqualTo(0);
    }

    @Test
    void moveTask_別の列へ移動すると両方の列が再採番される() {
        Task moving = task(1L, Status.NOT_STARTED, 0);
        List<Task> oldColumn = new ArrayList<>(List.of(moving));
        List<Task> newColumn = new ArrayList<>(List.of(task(2L, Status.DONE, 0)));

        when(taskRepository.findById(1L)).thenReturn(Optional.of(moving));
        when(taskRepository.findByStatusOrderByPositionAsc(Status.NOT_STARTED)).thenReturn(oldColumn);
        when(taskRepository.findByStatusOrderByPositionAsc(Status.DONE)).thenReturn(newColumn);
        when(taskRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        Optional<Task> result = taskService.moveTask(1L, new TaskMoveRequest(Status.DONE, 0));

        assertThat(result).isPresent();
        assertThat(result.get().getStatus()).isEqualTo(Status.DONE);
        assertThat(result.get().getPosition()).isEqualTo(0);
    }

    @Test
    void deleteTask_存在する場合はtrueを返す() {
        when(taskRepository.existsById(1L)).thenReturn(true);

        boolean deleted = taskService.deleteTask(1L);

        assertThat(deleted).isTrue();
    }

    @Test
    void deleteTask_存在しない場合はfalseを返す() {
        when(taskRepository.existsById(99L)).thenReturn(false);

        boolean deleted = taskService.deleteTask(99L);

        assertThat(deleted).isFalse();
    }
}
