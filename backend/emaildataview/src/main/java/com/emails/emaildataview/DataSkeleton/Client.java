package com.emails.emaildataview.DataSkeleton;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener;
import org.springframework.data.mongodb.core.mapping.event.BeforeConvertEvent;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Document(collection = "clients")
public class Client {

    @Id
    private String id;

    private String name;

    private String email;

    private String business;

    private String contact;

    private String message;

    private String date;

    private String time;

    public void setTimestamp() {
        LocalDateTime now = LocalDateTime.now();
        this.date = now.toLocalDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        this.time = now.toLocalTime().format(DateTimeFormatter.ofPattern("HH:mm:ss"));
    }

}
