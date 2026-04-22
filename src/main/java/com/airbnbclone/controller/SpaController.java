package com.airbnbclone.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {
    // Forward SPA routes (no file extension) to index.html
    @GetMapping(value = {"/{path:[^\\.]*}", "/{path:[^\\.]*}/{sub:[^\\.]*}"})
    public String spa() {
        return "forward:/index.html";
    }
}
