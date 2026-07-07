package com.campus.expresshelper.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.campus.expresshelper.common.ApiResponse;
import com.campus.expresshelper.domain.entity.User;
import com.campus.expresshelper.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class TestController {
    private final UserMapper userMapper;

    @GetMapping("/users")
    public ApiResponse<Object> testUsers() {
        List<User> users = userMapper.selectList(new LambdaQueryWrapper<>());
        return ApiResponse.ok("查询到 " + users.size() + " 条用户记录", users);
    }

    @GetMapping("/users-all")
    public ApiResponse<Object> testUsersAll() {
        List<User> users = userMapper.selectList(new LambdaQueryWrapper<User>().last("OR deleted = 1"));
        return ApiResponse.ok("查询到所有用户记录（包括已删除）" + users.size() + " 条", users);
    }
}
