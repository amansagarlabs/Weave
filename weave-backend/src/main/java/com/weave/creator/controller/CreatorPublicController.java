package com.weave.creator.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/creator/public")
public class CreatorPublicController {
    @GetMapping("/health")
    Map<String, String> health() { return Map.of("service", "creator", "status", "ready"); }
}
