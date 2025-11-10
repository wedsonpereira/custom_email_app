package com.emails.emaildataview.Dao;

import com.emails.emaildataview.DataSkeleton.Client;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface EmailDao extends MongoRepository<Client, String> {

}
