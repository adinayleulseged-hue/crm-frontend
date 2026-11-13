package com.insa.crm.dto;
import lombok.*;
import java.time.LocalDateTime;
import java.util.Map;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private String timestamp;
    private Map<String, String> errors;
    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder().success(true).message(message).data(data).timestamp(LocalDateTime.now().toString()).build();
    }
    public static <T> ApiResponse<T> success(T data) { return success(data, "Success"); }
    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder().success(false).message(message).timestamp(LocalDateTime.now().toString()).build();
    }
    public static <T> ApiResponse<T> error(String message, Map<String, String> errors) {
        return ApiResponse.<T>builder().success(false).message(message).errors(errors).timestamp(LocalDateTime.now().toString()).build();
    }
}
