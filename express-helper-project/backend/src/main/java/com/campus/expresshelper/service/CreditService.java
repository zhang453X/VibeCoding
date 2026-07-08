package com.campus.expresshelper.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.campus.expresshelper.domain.entity.CreditRecord;
import com.campus.expresshelper.domain.entity.User;
import com.campus.expresshelper.mapper.CreditRecordMapper;
import com.campus.expresshelper.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CreditService {
    private final UserMapper userMapper;
    private final CreditRecordMapper creditRecordMapper;

    @Transactional
    public void addCredit(Long userId, Integer change, String reason, String type, Long relatedOrderId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            return;
        }
        int currentScore = user.getCreditScore() == null ? 0 : user.getCreditScore();
        int newScore = currentScore + change;
        if (newScore > 100) {
            newScore = 100;
        }
        if (newScore < 0) {
            newScore = 0;
        }
        user.setCreditScore(newScore);
        userMapper.updateById(user);

        CreditRecord record = new CreditRecord();
        record.setUserId(userId);
        record.setScoreChange(change);
        record.setReason(reason);
        record.setType(type);
        record.setRelatedOrderId(relatedOrderId);
        creditRecordMapper.insert(record);
    }

    @Transactional
    public void addGreenScore(Long userId, Integer change, String reason, String type, Long relatedOrderId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            return;
        }
        user.setGreenScore((user.getGreenScore() == null ? 0 : user.getGreenScore()) + change);
        userMapper.updateById(user);

        CreditRecord record = new CreditRecord();
        record.setUserId(userId);
        record.setScoreChange(change);
        record.setReason(reason);
        record.setType(type);
        record.setRelatedOrderId(relatedOrderId);
        creditRecordMapper.insert(record);
    }

    public Object listUserCredits(Long userId) {
        return creditRecordMapper.selectList(new LambdaQueryWrapper<CreditRecord>()
                .eq(CreditRecord::getUserId, userId)
                .orderByDesc(CreditRecord::getCreatedAt));
    }
}
