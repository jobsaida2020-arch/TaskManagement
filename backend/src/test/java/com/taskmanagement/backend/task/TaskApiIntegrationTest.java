package com.taskmanagement.backend.task;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@ActiveProfiles("test")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class TaskApiIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    private String url(String path) {
        return "http://localhost:" + port + path;
    }

    @Test
    void タスクの作成から削除までの一連の操作が行える() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        ResponseEntity<Map> created = restTemplate.postForEntity(
                url("/api/tasks"),
                new HttpEntity<>(Map.of("title", "統合テストタスク"), headers),
                Map.class);
        assertThat(created.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        Number id = (Number) created.getBody().get("id");
        assertThat(created.getBody().get("status")).isEqualTo("NOT_STARTED");

        ResponseEntity<Map> fetched = restTemplate.getForEntity(url("/api/tasks/" + id), Map.class);
        assertThat(fetched.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(fetched.getBody().get("title")).isEqualTo("統合テストタスク");

        Map<?, ?> updated = restTemplate.patchForObject(
                url("/api/tasks/" + id),
                new HttpEntity<>(Map.of("title", "更新後タイトル"), headers),
                Map.class);
        assertThat(updated.get("title")).isEqualTo("更新後タイトル");

        Map<?, ?> moved = restTemplate.patchForObject(
                url("/api/tasks/" + id + "/position"),
                new HttpEntity<>(Map.of("status", "DONE", "position", 0), headers),
                Map.class);
        assertThat(moved.get("status")).isEqualTo("DONE");

        restTemplate.delete(url("/api/tasks/" + id));

        ResponseEntity<Map> afterDelete = restTemplate.getForEntity(url("/api/tasks/" + id), Map.class);
        assertThat(afterDelete.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void タスク作成時にstatusを指定するとその列に直接追加される() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        ResponseEntity<Map> created = restTemplate.postForEntity(
                url("/api/tasks"),
                new HttpEntity<>(Map.of("title", "進行中で作成", "status", "IN_PROGRESS"), headers),
                Map.class);

        assertThat(created.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(created.getBody().get("status")).isEqualTo("IN_PROGRESS");
        assertThat(created.getBody().get("position")).isEqualTo(0);
    }
}
