package com.taskmanager.controller;

import com.taskmanager.dto.TaskRequest;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class TaskController {
    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getUserTasks(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(taskService.getUserTasks(username));
    }

    @GetMapping("/filter")
    public ResponseEntity<List<TaskResponse>> getTasksByStatus(
            @RequestParam(required = false) Boolean completed,
            Authentication authentication) {
        String username = authentication.getName();
        List<TaskResponse> tasks;

        if (completed != null) {
            tasks = taskService.getUserTasksByStatus(username, completed);
        } else {
            tasks = taskService.getUserTasks(username);
        }

        return ResponseEntity.ok(tasks);
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(@RequestBody TaskRequest request, Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(taskService.createTask(request, username));
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable Long taskId,
            @RequestBody TaskRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(taskService.updateTask(taskId, request, username));
    }

    @PatchMapping("/{taskId}/toggle")
    public ResponseEntity<TaskResponse> toggleTaskCompletion(
            @PathVariable Long taskId,
            Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(taskService.toggleTaskCompletion(taskId, username));
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long taskId, Authentication authentication) {
        String username = authentication.getName();
        taskService.deleteTask(taskId, username);
        return ResponseEntity.ok().build();
    }
}