package com.lfclothing.lfclothing.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/loja")
public class LojaController {

    @Value("${loja.whatsapp}")
    private String whatsapp;

    @GetMapping("/config")
    public ResponseEntity<Map<String, String>> getConfig() {
        return ResponseEntity.ok(Map.of("whatsapp", whatsapp));
    }
}
