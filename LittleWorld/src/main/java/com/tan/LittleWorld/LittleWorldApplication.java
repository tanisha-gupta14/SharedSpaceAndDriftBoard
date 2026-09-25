package com.tan.LittleWorld;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class LittleWorldApplication {

	public static void main(String[] args) {
		SpringApplication.run(LittleWorldApplication.class, args);
	}

}
