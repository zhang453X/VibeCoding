package com.campus.expresshelper.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("real_name_auth")
public class RealNameAuth extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private String studentNo;
    private String realName;
    private String idCardFrontUrl;
    private String idCardBackUrl;
    private String idCardWithStudentCardUrl;
    private String status;
    private String rejectReason;
}
