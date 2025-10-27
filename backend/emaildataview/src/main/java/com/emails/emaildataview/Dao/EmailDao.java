package com.emails.emaildataview.Dao;

import com.emails.emaildataview.DataSkeleton.Client;
import org.springframework.data.repository.CrudRepository;

public interface EmailDao extends CrudRepository<Long, Client> {


}
