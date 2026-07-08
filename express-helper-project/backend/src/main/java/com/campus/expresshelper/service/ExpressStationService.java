package com.campus.expresshelper.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.campus.expresshelper.common.BusinessException;
import com.campus.expresshelper.domain.entity.ExpressStation;
import com.campus.expresshelper.mapper.ExpressStationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ExpressStationService {
    private static final String AMAP_WEB_KEY = "AMAP_WEB_KEY";

    private final ExpressStationMapper expressStationMapper;
    private final SystemConfigService systemConfigService;

    public List<ExpressStation> listPublicStations() {
        return expressStationMapper.selectList(new LambdaQueryWrapper<ExpressStation>()
                .eq(ExpressStation::getDeleted, 0)
                .eq(ExpressStation::getEnabled, 1)
                .orderByAsc(ExpressStation::getSortOrder)
                .orderByAsc(ExpressStation::getId));
    }

    public Map<String, Object> publicDetail(Long id) {
        ExpressStation station = getExistingStation(id);
        if (station.getEnabled() == null || station.getEnabled() != 1) {
            throw new BusinessException("快递点暂未开放");
        }

        String amapWebKey = systemConfigService.getValue(AMAP_WEB_KEY);
        Map<String, Object> data = new HashMap<>();
        data.put("station", station);
        data.put("amapConfigured", !amapWebKey.isBlank());
        data.put("mapPreviewUrl", buildStaticMapUrl(station, amapWebKey));
        return data;
    }

    public List<ExpressStation> adminList() {
        return expressStationMapper.selectList(new LambdaQueryWrapper<ExpressStation>()
                .eq(ExpressStation::getDeleted, 0)
                .orderByAsc(ExpressStation::getSortOrder)
                .orderByAsc(ExpressStation::getId));
    }

    @Transactional
    public void save(ExpressStation station) {
        validate(station);
        if (station.getSortOrder() == null) {
            station.setSortOrder(0);
        }
        if (station.getEnabled() == null) {
            station.setEnabled(1);
        }

        if (station.getId() == null) {
            expressStationMapper.insert(station);
        } else {
            ExpressStation existing = getExistingStation(station.getId());
            station.setCreatedAt(existing.getCreatedAt());
            station.setDeleted(existing.getDeleted());
            expressStationMapper.updateById(station);
        }
    }

    @Transactional
    public void delete(Long id) {
        ExpressStation station = getExistingStation(id);
        station.setDeleted(1);
        expressStationMapper.updateById(station);
    }

    private void validate(ExpressStation station) {
        if (station.getStationName() == null || station.getStationName().isBlank()) {
            throw new BusinessException("快递点名称不能为空");
        }
        if (station.getDetailAddress() == null || station.getDetailAddress().isBlank()) {
            throw new BusinessException("详细地址不能为空");
        }
        if (station.getLongitude() == null || station.getLatitude() == null) {
            throw new BusinessException("经纬度不能为空");
        }
        if (!isLongitudeValid(station.getLongitude()) || !isLatitudeValid(station.getLatitude())) {
            throw new BusinessException("经纬度格式不正确");
        }
    }

    private ExpressStation getExistingStation(Long id) {
        ExpressStation station = expressStationMapper.selectById(id);
        if (station == null || (station.getDeleted() != null && station.getDeleted() == 1)) {
            throw new BusinessException("快递点不存在");
        }
        return station;
    }

    private boolean isLongitudeValid(BigDecimal longitude) {
        return longitude.doubleValue() >= -180 && longitude.doubleValue() <= 180;
    }

    private boolean isLatitudeValid(BigDecimal latitude) {
        return latitude.doubleValue() >= -90 && latitude.doubleValue() <= 90;
    }

    private String buildStaticMapUrl(ExpressStation station, String amapWebKey) {
        if (amapWebKey == null || amapWebKey.isBlank()) {
            return "";
        }
        return "https://restapi.amap.com/v3/staticmap?location="
                + station.getLongitude() + "," + station.getLatitude()
                + "&zoom=16&size=750*360"
                + "&key=" + amapWebKey;
    }
}
