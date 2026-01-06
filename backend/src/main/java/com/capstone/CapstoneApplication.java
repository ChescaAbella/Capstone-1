package com.capstone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import jakarta.annotation.PostConstruct;

@SpringBootApplication
public class CapstoneApplication {
    public static void main(String[] args) {
        SpringApplication.run(CapstoneApplication.class, args);
    }
    @PostConstruct
    public void debugDb() {
        System.out.println("DB URL = " + System.getenv("SPRING_DATASOURCE_URL"));
        System.out.println("DB USER = " + System.getenv("SPRING_DATASOURCE_USERNAME"));
    }
}