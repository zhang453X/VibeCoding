package com.campus.expresshelper.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.campus.expresshelper.common.BusinessException;
import com.campus.expresshelper.domain.entity.SystemConfig;
import com.campus.expresshelper.mapper.SystemConfigMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SystemConfigService {
    private final SystemConfigMapper systemConfigMapper;

    public Object list() {
        return systemConfigMapper.selectList(new LambdaQueryWrapper<SystemConfig>()
                .eq(SystemConfig::getDeleted, 0)
                .orderByAsc(SystemConfig::getConfigKey));
    }

    public String getValue(String key) {
        SystemConfig config = systemConfigMapper.selectOne(new LambdaQueryWrapper<SystemConfig>()
                .eq(SystemConfig::getConfigKey, key)
                .eq(SystemConfig::getDeleted, 0)
                .eq(SystemConfig::getEnabled, 1)
                .last("limit 1"));
        return config == null ? "" : (config.getConfigValue() == null ? "" : config.getConfigValue().trim());
    }

    @Transactional
    public void save(SystemConfig config) {
        if (config.getConfigKey() == null || config.getConfigKey().isBlank()) {
            throw new BusinessException("参数键不能为空");
        }
        config.setConfigKey(config.getConfigKey().trim());
        if (config.getEnabled() == null) {
            config.setEnabled(1);
        }
        if (config.getId() == null) {
            List<SystemConfig> exists = systemConfigMapper.selectList(new LambdaQueryWrapper<SystemConfig>()
                    .eq(SystemConfig::getConfigKey, config.getConfigKey())
                    .eq(SystemConfig::getDeleted, 0));
            if (!exists.isEmpty()) {
                throw new BusinessException("参数键已存在");
            }
            systemConfigMapper.insert(config);
        } else {
            List<SystemConfig> exists = systemConfigMapper.selectList(new LambdaQueryWrapper<SystemConfig>()
                    .eq(SystemConfig::getConfigKey, config.getConfigKey())
                    .eq(SystemConfig::getDeleted, 0)
                    .ne(SystemConfig::getId, config.getId()));
            if (!exists.isEmpty()) {
                throw new BusinessException("参数键已存在");
            }
            systemConfigMapper.updateById(config);
        }
    }

    @Transactional
    public void delete(Long id) {
        SystemConfig config = getExistingConfig(id);
        config.setDeleted(1);
        systemConfigMapper.updateById(config);
    }

    private SystemConfig getExistingConfig(Long id) {
        SystemConfig config = systemConfigMapper.selectById(id);
        if (config == null || (config.getDeleted() != null && config.getDeleted() == 1)) {
            throw new BusinessException("系统参数不存在");
        }
        return config;
    }
}
