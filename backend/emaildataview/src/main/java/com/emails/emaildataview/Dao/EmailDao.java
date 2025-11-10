package com.emails.emaildataview.Dao;

import com.emails.emaildataview.DataSkeleton.Client;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmailDao extends CrudRepository<Long, Client> {

    public void save(Client client);
}
