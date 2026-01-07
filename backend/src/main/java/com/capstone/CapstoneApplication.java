package com.capstone;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import jakarta.annotation.PostConstruct;

@SpringBootApplication
public class CapstoneApplication {

    private static final Logger log = LoggerFactory.getLogger(CapstoneApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(CapstoneApplication.class, args);
    }

    @PostConstruct
    public void debugDb() {
        log.info("DB URL = {}", System.getenv("SPRING_DATASOURCE_URL"));
        log.info("DB USER = {}", System.getenv("SPRING_DATASOURCE_USERNAME"));
    }
}
