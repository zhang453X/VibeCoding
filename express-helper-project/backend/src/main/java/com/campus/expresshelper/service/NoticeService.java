package com.campus.expresshelper.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.campus.expresshelper.common.BusinessException;
import com.campus.expresshelper.domain.entity.NoticeInfo;
import com.campus.expresshelper.mapper.NoticeInfoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NoticeService {
    private final NoticeInfoMapper noticeInfoMapper;

    public void send(Long userId, String type, String title, String content) {
        NoticeInfo notice = new NoticeInfo();
        notice.setUserId(userId);
        notice.setNoticeType(type);
        notice.setTitle(title);
        notice.setContent(content);
        notice.setReadFlag(0);
        noticeInfoMapper.insert(notice);
    }

    public Object userNotices(Long userId) {
        return noticeInfoMapper.selectList(new LambdaQueryWrapper<NoticeInfo>()
                .eq(NoticeInfo::getUserId, userId)
                .eq(NoticeInfo::getDeleted, 0)
                .orderByDesc(NoticeInfo::getCreatedAt));
    }

    public Long unreadCount(Long userId) {
        return noticeInfoMapper.selectCount(new LambdaQueryWrapper<NoticeInfo>()
                .eq(NoticeInfo::getUserId, userId)
                .eq(NoticeInfo::getReadFlag, 0)
                .eq(NoticeInfo::getDeleted, 0));
    }

    @Transactional
    public void readOne(Long userId, Long noticeId) {
        NoticeInfo notice = noticeInfoMapper.selectById(noticeId);
        if (notice == null || !userId.equals(notice.getUserId())) {
            throw new BusinessException("消息不存在");
        }
        notice.setReadFlag(1);
        noticeInfoMapper.updateById(notice);
    }

    @Transactional
    public void unreadOne(Long userId, Long noticeId) {
        NoticeInfo notice = noticeInfoMapper.selectById(noticeId);
        if (notice == null || !userId.equals(notice.getUserId())) {
            throw new BusinessException("消息不存在");
        }
        notice.setReadFlag(0);
        noticeInfoMapper.updateById(notice);
    }

    @Transactional
    public void readAll(Long userId) {
        noticeInfoMapper.update(null, new LambdaUpdateWrapper<NoticeInfo>()
                .eq(NoticeInfo::getUserId, userId)
                .eq(NoticeInfo::getReadFlag, 0)
                .set(NoticeInfo::getReadFlag, 1));
    }

    @Transactional
    public void deleteOne(Long userId, Long noticeId) {
        NoticeInfo notice = noticeInfoMapper.selectById(noticeId);
        if (notice == null || !userId.equals(notice.getUserId())) {
            throw new BusinessException("消息不存在");
        }
        noticeInfoMapper.deleteById(noticeId);
    }
}
