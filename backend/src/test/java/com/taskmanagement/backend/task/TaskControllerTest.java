package com.taskmanagement.backend.task;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanagement.backend.task.dto.TaskMoveRequest;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TaskController.class)
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TaskService taskService;

    private Task task(Long id) {
        Task task = new Task();
        task.setTitle("サンプルタスク");
        task.setStatus(Status.NOT_STARTED);
        task.setPriority(Priority.MEDIUM);
        task.setPosition(0);
        try {
            var field = Task.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(task, id);
        } catch (ReflectiveOperationException e) {
            throw new RuntimeException(e);
        }
        return task;
    }

    @Test
    void getTasks_タスク一覧を返す() throws Exception {
        when(taskService.getTasks(null, null)).thenReturn(List.of(task(1L)));

        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].title").value("サンプルタスク"));
    }

    @Test
    void getTask_存在しないIDの場合は404を返す() throws Exception {
        when(taskService.getTask(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/tasks/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void createTask_titleが空の場合は400を返す() throws Exception {
        mockMvc.perform(post("/api/tasks")
                        .contentType("application/json")
                        .content("{\"title\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.title").exists());
    }

    @Test
    void createTask_正常な入力は201を返す() throws Exception {
        when(taskService.createTask(any())).thenReturn(task(1L));

        mockMvc.perform(post("/api/tasks")
                        .contentType("application/json")
                        .content("{\"title\":\"新規タスク\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void moveTask_存在しないIDの場合は404を返す() throws Exception {
        when(taskService.moveTask(anyLong(), any(TaskMoveRequest.class))).thenReturn(Optional.empty());

        mockMvc.perform(patch("/api/tasks/99/position")
                        .contentType("application/json")
                        .content("{\"status\":\"DONE\",\"position\":0}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteTask_存在する場合は204を返す() throws Exception {
        when(taskService.deleteTask(1L)).thenReturn(true);

        mockMvc.perform(delete("/api/tasks/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteTask_存在しない場合は404を返す() throws Exception {
        when(taskService.deleteTask(99L)).thenReturn(false);

        mockMvc.perform(delete("/api/tasks/99"))
                .andExpect(status().isNotFound());
    }
}
