package com.emails.emaildataview.Controller;

import com.emails.emaildataview.DataSkeleton.Client;
import com.emails.emaildataview.Dao.EmailDao;
import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(value = "*")
@Slf4j
public class EmailController {

    @Autowired
    private EmailDao emailDao;

    @GetMapping("/emails")
    public ResponseEntity<List<Client>> getAllClients() {
        try {
            List<Client> clients = emailDao.findAll();
            System.out.println(clients);
            return ResponseEntity.ok(clients);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

// give this API to the frontend of the thumbeja Publicity Website
    @PostMapping("/contact")
    public ResponseEntity<Client> submitContacts(@RequestBody Client client) {
        try {
            System.out.println("=== Contact Form Submission ===");
            System.out.println("Name: " + client.getName());
            System.out.println("Email: " + client.getEmail());
            System.out.println("Business: " + client.getBusiness());
            System.out.println("Contact: " + client.getContact());
            System.out.println("Message: " + client.getMessage());
            
            client.setTimestamp();
            Client savedClient = emailDao.save(client);
            
            System.out.println("Successfully saved with ID: " + savedClient.getId());
            System.out.println("Date: " + savedClient.getDate() + ", Time: " + savedClient.getTime());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(savedClient);
        } catch (Exception e) {
            System.err.println("Error saving contact: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/contactdelete")
    public ResponseEntity<?> deleteContactByEmail(@RequestBody EmailDeleteRequest request) {
        try {
            String email = request.getEmail();
            
            if (email == null || email.trim().isEmpty()) {
                System.out.println("Error: Email is required");
                return ResponseEntity.badRequest().body("{\"error\":\"Email is required\"}");
            }
            
            System.out.println("=== Delete Contact Request ===");
            System.out.println("Email to delete: " + email);
            
            Client client = emailDao.findByEmail(email);
            
            if (client == null) {
                System.out.println("Client not found with email: " + email);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("{\"error\":\"Client not found with email: " + email + "\"}");
            }
            
            emailDao.delete(client);
            System.out.println("Successfully deleted client with email: " + email);
            
            return ResponseEntity.ok("{\"message\":\"Client deleted successfully\"}");
        } catch (Exception e) {
            System.err.println("Error deleting contact: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("{\"error\":\"Failed to delete client: " + e.getMessage() + "\"}");
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

// DTO for delete request
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
class EmailDeleteRequest {
    private String email;
}
