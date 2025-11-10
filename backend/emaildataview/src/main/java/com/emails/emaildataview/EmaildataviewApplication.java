package com.emails.emaildataview;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import javax.sql.DataSource;
import java.sql.Connection; 

@SpringBootApplication
public class EmaildataviewApplication {

	public static void main(String[] args) {
		SpringApplication.run(EmaildataviewApplication.class, args);
	}
//
//    @Bean
//    public CommandLineRunner checkDatabaseConnection(final DataSource dataSource) {
//        return args -> {
//            try (Connection conn=dataSource.getConnection()) {
//                System.out.println("✅ Successfully connected to the database.");
//            } catch (Exception e) {
//                System.err.println("❌ Failed to connect to the database:");
//                e.printStackTrace();
//            }
//        };
//    }

}
