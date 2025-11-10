package com.emails.emaildataview.DataSkeleton;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;

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

}
