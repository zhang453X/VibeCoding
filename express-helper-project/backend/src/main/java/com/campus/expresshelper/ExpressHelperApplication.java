package com.campus.expresshelper;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@MapperScan("com.campus.expresshelper.mapper")
@SpringBootApplication
public class ExpressHelperApplication {

    public static void main(String[] args) {
        SpringApplication.run(ExpressHelperApplication.class, args);
    }
}
