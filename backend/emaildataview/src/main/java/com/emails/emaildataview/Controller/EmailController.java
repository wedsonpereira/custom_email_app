package com.emails.emaildataview.Controller;

import com.emails.emaildataview.DataSkeleton.Client;
import com.emails.emaildataview.Dao.EmailDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/emails")
public class EmailController {

    @Autowired
    private EmailDao emailDao;

    @GetMapping("/")
    public ResponseEntity<List<Client>> getAllClients() {
        try {
            List<Client> clients = emailDao.findAll();
            return ResponseEntity.ok(clients);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

// give this API to the frontend of the thumbeja Publicity Website
    @PostMapping("/contact")
    public ResponseEntity<Client> submitContacts(@RequestBody Client client) {
        try {
            Client savedClient = emailDao.save(client);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedClient);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Client> getClientById(@PathVariable String id) {
        try {
            return emailDao.findById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
