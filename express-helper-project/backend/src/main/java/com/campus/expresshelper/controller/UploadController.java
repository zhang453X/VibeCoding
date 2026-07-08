package com.campus.expresshelper.controller;

import com.campus.expresshelper.common.ApiResponse;
import com.campus.expresshelper.domain.entity.User;
import com.campus.expresshelper.mapper.UserMapper;
import com.campus.expresshelper.security.AuthContext;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    @Value("${upload.path:./uploads}")
    private String uploadPath;
    
    private final UserMapper userMapper;

    @PostMapping("/avatar")
    @Transactional
    public ApiResponse<Map<String, String>> uploadAvatar(@RequestParam("file") MultipartFile file, HttpServletRequest request) throws IOException {
        ApiResponse<Map<String, String>> result = uploadFile(file, "avatar", request);
        if (result.getCode() == 0) {
            String avatarUrl = result.getData().get("url");
            Long userId = AuthContext.userId();
            if (userId != null && userId > 0) {
                User user = userMapper.selectById(userId);
                if (user != null) {
                    user.setAvatar(avatarUrl);
                    userMapper.updateById(user);
                }
            }
        }
        return result;
    }

    @PostMapping("/auth")
    public ApiResponse<Map<String, String>> uploadAuthImage(@RequestParam("file") MultipartFile file, HttpServletRequest request) throws IOException {
        return uploadFile(file, "auth", request);
    }

    private ApiResponse<Map<String, String>> uploadFile(MultipartFile file, String subDir, HttpServletRequest request) throws IOException {
        if (file.isEmpty()) {
            return ApiResponse.fail("文件不能为空");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null ? originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
        String newFilename = UUID.randomUUID().toString() + extension;

        Path directoryPath = Paths.get(uploadPath, subDir);
        if (!Files.exists(directoryPath)) {
            Files.createDirectories(directoryPath);
        }

        Path filePath = directoryPath.resolve(newFilename);
        Files.copy(file.getInputStream(), filePath);

        String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();
        String fileUrl = baseUrl + "/uploads/" + subDir + "/" + newFilename;
        Map<String, String> result = new HashMap<>();
        result.put("url", fileUrl);

        return ApiResponse.ok(result);
    }
}
