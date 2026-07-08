package com.campus.expresshelper.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.campus.expresshelper.config.JwtProperties;
import com.campus.expresshelper.common.BusinessException;
import com.campus.expresshelper.domain.dto.AuthSubmitRequest;
import com.campus.expresshelper.domain.dto.LoginRequest;
import com.campus.expresshelper.domain.entity.RealNameAuth;
import com.campus.expresshelper.domain.entity.User;
import com.campus.expresshelper.mapper.RealNameAuthMapper;
import com.campus.expresshelper.mapper.UserMapper;
import com.campus.expresshelper.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final RealNameAuthMapper realNameAuthMapper;
    private final UserMapper userMapper;
    private final NoticeService noticeService;
    private final CreditService creditService;
    private final CreditRuleService creditRuleService;
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final JwtProperties jwtProperties;

    @Transactional
    public void submit(AuthSubmitRequest request) {
        User user = userMapper.selectById(request.getUserId());
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        RealNameAuth old = realNameAuthMapper.selectOne(new LambdaQueryWrapper<RealNameAuth>()
                .eq(RealNameAuth::getUserId, request.getUserId())
                .orderByDesc(RealNameAuth::getCreatedAt)
                .last("limit 1"));
        if (old != null && "PENDING".equals(old.getStatus())) {
            throw new BusinessException("已有待审核记录");
        }
        RealNameAuth auth = new RealNameAuth();
        auth.setUserId(request.getUserId());
        auth.setStudentNo(request.getStudentNo());
        auth.setRealName(request.getRealName());
        auth.setIdCardFrontUrl(request.getIdCardFrontUrl());
        auth.setIdCardBackUrl(request.getIdCardBackUrl());
        auth.setIdCardWithStudentCardUrl(request.getIdCardWithStudentCardUrl());
        auth.setStatus("PENDING");
        realNameAuthMapper.insert(auth);
        noticeService.send(request.getUserId(), "AUTH", "实名认证已提交", "请等待管理员审核");
    }

    @Transactional
    public void approve(Long authId) {
        RealNameAuth auth = realNameAuthMapper.selectById(authId);
        if (auth == null) {
            throw new BusinessException("认证记录不存在");
        }
        auth.setStatus("APPROVED");
        realNameAuthMapper.updateById(auth);
        User user = userMapper.selectById(auth.getUserId());
        if (user != null) {
            user.setAuthStatus(1);
            user.setCourierEnabled(1);
            user.setUsername(auth.getRealName());
            userMapper.updateById(user);
            int change = creditRuleService.rule("CREDIT_RULE_AUTH_PASS", 5);
            creditService.addCredit(user.getId(), change, "实名认证通过加分", "CREDIT", null);
        }
        noticeService.send(auth.getUserId(), "AUTH", "实名认证通过", "你已获得代取员权限");
    }

    @Transactional
    public void reject(Long authId, String reason) {
        RealNameAuth auth = realNameAuthMapper.selectById(authId);
        if (auth == null) {
            throw new BusinessException("认证记录不存在");
        }
        auth.setStatus("REJECTED");
        auth.setRejectReason(reason);
        realNameAuthMapper.updateById(auth);
        noticeService.send(auth.getUserId(), "AUTH", "实名认证驳回", reason);
    }

    public Object latestByUser(Long userId) {
        return realNameAuthMapper.selectOne(new LambdaQueryWrapper<RealNameAuth>()
                .eq(RealNameAuth::getUserId, userId)
                .orderByDesc(RealNameAuth::getCreatedAt)
                .last("limit 1"));
    }

    public Object pendingList() {
        return realNameAuthMapper.selectList(new LambdaQueryWrapper<RealNameAuth>()
                .eq(RealNameAuth::getStatus, "PENDING")
                .orderByAsc(RealNameAuth::getCreatedAt));
    }

    public Object allList() {
        return realNameAuthMapper.selectList(new LambdaQueryWrapper<RealNameAuth>()
                .orderByDesc(RealNameAuth::getCreatedAt));
    }

    public Map<String, Object> allList(Integer page, Integer size) {
        Page<RealNameAuth> pageParam = new Page<>(page, size);
        Page<RealNameAuth> result = realNameAuthMapper.selectPage(pageParam, 
            new LambdaQueryWrapper<RealNameAuth>().orderByDesc(RealNameAuth::getCreatedAt));
        Map<String, Object> data = new HashMap<>();
        data.put("records", result.getRecords());
        data.put("total", result.getTotal());
        data.put("page", result.getCurrent());
        data.put("size", result.getSize());
        data.put("pages", result.getPages());
        return data;
    }

    public Map<String, Object> login(LoginRequest request) {
        Map<String, Object> claims = new HashMap<>();
        Map<String, Object> result = new HashMap<>();
        if ("ADMIN".equalsIgnoreCase(request.getRole())) {
            if (!jwtProperties.getAdminUsername().equals(request.getUsername()) || !jwtProperties.getAdminPassword().equals(request.getPassword())) {
                throw new BusinessException("管理员账号或密码错误");
            }
            claims.put("role", "ADMIN");
            claims.put("userId", 0L);
            String token = jwtUtil.createToken(claims);
            result.put("token", token);
            result.put("role", "ADMIN");
            result.put("userId", 0L);
            return result;
        }
        User user = userService.login(request.getUsername(), request.getPassword());
        claims.put("role", "USER");
        claims.put("userId", user.getId());
        String token = jwtUtil.createToken(claims);
        result.put("token", token);
        result.put("role", "USER");
        result.put("userId", user.getId());
        result.put("nickname", user.getNickname());
        return result;
    }
}
