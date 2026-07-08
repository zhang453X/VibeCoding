package com.campus.expresshelper.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.campus.expresshelper.common.BusinessException;
import com.campus.expresshelper.domain.entity.User;
import com.campus.expresshelper.mapper.UserMapper;
import com.campus.expresshelper.util.MaskUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class UserService {
    private static final Pattern STUDENT_NO_PATTERN = Pattern.compile("^[0-9A-Za-z]{6,20}$");
    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[0-9A-Za-z_]{4,20}$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^1[3-9]\\d{9}$");

    private final UserMapper userMapper;

    @Transactional
    public User register(User input) {
        validateRegisterInput(input);
        if (input.getUsername() == null || input.getUsername().isBlank()) {
            input.setUsername(input.getStudentNo());
        }
        input.setStudentNo(input.getStudentNo().trim());
        input.setUsername(input.getUsername().trim());
        input.setNickname(input.getNickname().trim());
        input.setPhone(input.getPhone().trim());
        input.setPassword(input.getPassword().trim());

        User exist = userMapper.selectOne(new LambdaQueryWrapper<User>().eq(User::getStudentNo, input.getStudentNo()).last("limit 1"));
        if (exist != null) {
            throw new BusinessException("学号已注册");
        }
        User usernameExist = userMapper.selectOne(new LambdaQueryWrapper<User>().eq(User::getUsername, input.getUsername()).last("limit 1"));
        if (usernameExist != null) {
            throw new BusinessException("用户名已存在");
        }
        User phoneExist = userMapper.selectOne(new LambdaQueryWrapper<User>().eq(User::getPhone, input.getPhone()).last("limit 1"));
        if (phoneExist != null) {
            throw new BusinessException("手机号已注册");
        }
        input.setAuthStatus(0);
        input.setCourierEnabled(0);
        input.setCreditScore(60);
        input.setGreenScore(0);
        input.setFreezeStatus(0);
        userMapper.insert(input);
        input.setPhone(MaskUtil.phoneMask(input.getPhone()));
        input.setPassword(null);
        return input;
    }

    private void validateRegisterInput(User input) {
        if (input == null) {
            throw new BusinessException("注册信息不能为空");
        }
        if (input.getStudentNo() == null || input.getStudentNo().isBlank()) {
            throw new BusinessException("请输入学号");
        }
        String studentNo = input.getStudentNo().trim();
        if (!STUDENT_NO_PATTERN.matcher(studentNo).matches()) {
            throw new BusinessException("学号格式不正确，请输入 6-20 位字母或数字");
        }

        String username = input.getUsername() == null ? "" : input.getUsername().trim();
        if (!username.isEmpty() && !USERNAME_PATTERN.matcher(username).matches()) {
            throw new BusinessException("用户名需为 4-20 位字母、数字或下划线");
        }

        if (input.getNickname() == null || input.getNickname().isBlank()) {
            throw new BusinessException("请输入昵称");
        }
        String nickname = input.getNickname().trim();
        if (nickname.length() < 2 || nickname.length() > 20) {
            throw new BusinessException("昵称长度需为 2-20 位");
        }

        if (input.getPhone() == null || input.getPhone().isBlank()) {
            throw new BusinessException("请输入手机号");
        }
        String phone = input.getPhone().trim();
        if (!PHONE_PATTERN.matcher(phone).matches()) {
            throw new BusinessException("手机号格式不正确");
        }

        if (input.getPassword() == null || input.getPassword().isBlank()) {
            throw new BusinessException("请输入密码");
        }
        String password = input.getPassword().trim();
        if (password.length() < 6 || password.length() > 20) {
            throw new BusinessException("密码长度需为 6-20 位");
        }
    }

    public User profile(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        user.setPhone(MaskUtil.phoneMask(user.getPhone()));
        user.setPassword(null);
        return user;
    }

    public Map<String, Object> listAll(Integer page, Integer size) {
        Page<User> pageParam = new Page<>(page, size);
        Page<User> result = userMapper.selectPage(pageParam, new LambdaQueryWrapper<User>().orderByDesc(User::getCreatedAt));
        Map<String, Object> data = new HashMap<>();
        data.put("records", result.getRecords());
        data.put("total", result.getTotal());
        data.put("page", result.getCurrent());
        data.put("size", result.getSize());
        data.put("pages", result.getPages());
        return data;
    }

    public User login(String username, String password) {
        User user = userMapper.selectOne(new LambdaQueryWrapper<User>()
                .and(w -> w.eq(User::getUsername, username).or().eq(User::getStudentNo, username))
                .last("limit 1"));
        if (user == null || user.getPassword() == null || !user.getPassword().equals(password)) {
            throw new BusinessException("用户名或密码错误");
        }
        if (user.getFreezeStatus() != null && user.getFreezeStatus() == 1) {
            throw new BusinessException("账号已冻结");
        }
        return user;
    }

    @Transactional
    public void freeze(Long userId, Integer freezeStatus) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        user.setFreezeStatus(freezeStatus);
        if (freezeStatus == 1) {
            user.setCourierEnabled(0);
        }
        userMapper.updateById(user);
    }
    
    @Transactional
    public void updateProfile(Long userId, User user) {
        User exist = userMapper.selectById(userId);
        if (exist == null) {
            throw new BusinessException("用户不存在");
        }
        exist.setNickname(user.getNickname());
        exist.setPhone(user.getPhone());
        exist.setDormitory(user.getDormitory());
        exist.setCollege(user.getCollege());
        userMapper.updateById(exist);
    }
    
    @Transactional
    public void updatePassword(Long userId, String oldPassword, String newPassword) {
        User exist = userMapper.selectById(userId);
        if (exist == null) {
            throw new BusinessException("用户不存在");
        }
        if (oldPassword == null || oldPassword.isBlank()) {
            throw new BusinessException("请输入原密码");
        }
        if (newPassword == null || newPassword.isBlank()) {
            throw new BusinessException("请输入新密码");
        }

        String oldPasswordValue = oldPassword.trim();
        String newPasswordValue = newPassword.trim();

        if (exist.getPassword() == null || !exist.getPassword().equals(oldPasswordValue)) {
            throw new BusinessException("原密码错误");
        }
        if (newPasswordValue.length() < 6 || newPasswordValue.length() > 20) {
            throw new BusinessException("密码长度需为 6-20 位");
        }
        if (newPasswordValue.equals(oldPasswordValue)) {
            throw new BusinessException("新密码不能与原密码相同");
        }

        exist.setPassword(newPasswordValue);
        userMapper.updateById(exist);
    }

    @Transactional
    public void updateUser(Long userId, User user) {
        User exist = userMapper.selectById(userId);
        if (exist == null) {
            throw new BusinessException("用户不存在");
        }
        if (user.getNickname() != null) {
            exist.setNickname(user.getNickname());
        }
        if (user.getPhone() != null) {
            exist.setPhone(user.getPhone());
        }
        if (user.getDormitory() != null) {
            exist.setDormitory(user.getDormitory());
        }
        if (user.getCollege() != null) {
            exist.setCollege(user.getCollege());
        }
        if (user.getCreditScore() != null) {
            exist.setCreditScore(user.getCreditScore());
        }
        if (user.getGreenScore() != null) {
            exist.setGreenScore(user.getGreenScore());
        }
        if (user.getCourierEnabled() != null) {
            exist.setCourierEnabled(user.getCourierEnabled());
        }
        userMapper.updateById(exist);
    }

    @Transactional
    public void toggleCourierEnabled(Long userId, Integer enabled) {
        User exist = userMapper.selectById(userId);
        if (exist == null) {
            throw new BusinessException("用户不存在");
        }
        exist.setCourierEnabled(enabled);
        userMapper.updateById(exist);
    }

    @Transactional
    public void resetPassword(Long userId) {
        User exist = userMapper.selectById(userId);
        if (exist == null) {
            throw new BusinessException("用户不存在");
        }
        exist.setPassword("123456");
        userMapper.updateById(exist);
    }
}
