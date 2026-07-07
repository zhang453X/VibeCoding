package com.campus.expresshelper.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("user_info")
public class User extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String openId;
    private String studentNo;
    private String username;
    private String nickname;
    private String phone;
    private String password;
    private Integer authStatus;
    private Integer courierEnabled;
    private Integer creditScore;
    private Integer greenScore;
    private Integer freezeStatus;
    private String dormitory;
    private String college;
    private String avatar;
}
