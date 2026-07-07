package com.campus.expresshelper.controller;

import com.campus.expresshelper.common.ApiResponse;
import com.campus.expresshelper.service.ExpressStationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {
    private final ExpressStationService expressStationService;

    @GetMapping("/express-stations")
    public ApiResponse<Object> listStations() {
        return ApiResponse.ok(expressStationService.listPublicStations());
    }

    @GetMapping("/express-stations/{id}")
    public ApiResponse<Object> stationDetail(@PathVariable Long id) {
        return ApiResponse.ok(expressStationService.publicDetail(id));
    }
}
