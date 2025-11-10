package com.emails.emaildataview;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
    public class EmaildataviewApplication {

	public static void main(String[] args) {
		SpringApplication.run(EmaildataviewApplication.class, args);
	}

}
