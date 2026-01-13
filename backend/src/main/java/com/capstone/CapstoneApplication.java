package com.capstone;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import jakarta.annotation.PostConstruct;

@SpringBootApplication
@EnableScheduling
public class CapstoneApplication {

    private static final Logger log = LoggerFactory.getLogger(CapstoneApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(CapstoneApplication.class, args);
        log.info("===================================");
        log.info("Capstone Backend - Module 2 Started");
        log.info("Deliverable Tracker Module Active");
        log.info("===================================");
    }

    @PostConstruct
    public void debugDb() {
        log.info("DB URL = {}", System.getenv("SPRING_DATASOURCE_URL"));
        log.info("DB USER = {}", System.getenv("SPRING_DATASOURCE_USERNAME"));
        log.info("Google Sheets API Key Configured: {}", 
                 System.getenv("GOOGLE_SHEETS_API_KEY") != null ? "Yes" : "No");
    }
}
