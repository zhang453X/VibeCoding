package com.campus.expresshelper.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("express_station_info")
public class ExpressStation extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String stationName;
    private String campusArea;
    private String detailAddress;
    private BigDecimal longitude;
    private BigDecimal latitude;
    private String amapPoiId;
    private String contactName;
    private String contactPhone;
    private String serviceTime;
    private Integer sortOrder;
    private Integer enabled;
    private String description;
}
