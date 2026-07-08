package com.campus.expresshelper.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("order_info")
public class OrderInfo extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long publisherId;
    private Long courierId;
    private String expressCompany;
    private String expressNo;
    private String pickupCode;
    private String pickupCodeMasked;
    private String stationName;
    private String expressType;
    private String pickupTimeRange;
    private String deliveryLocation;
    private String remark;
    private BigDecimal fee;
    private Integer allowBargain;
    private String status;
    private LocalDateTime expireAt;
    @TableField(value = "`version`")
    private Integer version;
    private String cancelReason;
    private String cancelType;
    private Integer hasReview;
    private Integer republished;
    private String contactPhone;
    private LocalDateTime deliveryCompletedAt;
}
