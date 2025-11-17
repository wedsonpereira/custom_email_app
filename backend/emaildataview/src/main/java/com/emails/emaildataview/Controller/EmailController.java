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
@Slf4j
public class EmailController {

    @Autowired
    private EmailDao emailDao;

    @GetMapping("/emails")
    public ResponseEntity<List<Client>> getAllClients() {
        try {
            log.info("=== Fetching all clients from MongoDB ===");
            List<Client> clients = emailDao.findAll();
            log.info("Found {} clients", clients.size());
            System.out.println("Clients: " + clients);
            return ResponseEntity.ok(clients);
        } catch (Exception e) {
            log.error("Error fetching clients from MongoDB", e);
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/test-db")
    public ResponseEntity<?> testDatabaseConnection() {
        try {
            log.info("=== Testing MongoDB Connection ===");
            long count = emailDao.count();
            log.info("Database connection successful. Total documents: {}", count);
            return ResponseEntity.ok("{\"status\":\"connected\",\"count\":" + count + ",\"database\":\"emailreplies\",\"collection\":\"clients\"}");
        } catch (Exception e) {
            log.error("Database connection failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("{\"status\":\"error\",\"message\":\"" + e.getMessage() + "\"}");
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
            log.info("=== Delete Contact Request Received ===");
            log.info("Request object: {}", request);
            
            if (request == null) {
                log.error("Request is null");
                return ResponseEntity.badRequest().body("{\"error\":\"Invalid request\"}");
            }
            
            String email = request.getEmail();
            log.info("Email to delete: {}", email);
            
            if (email == null || email.trim().isEmpty()) {
                log.error("Email is null or empty");
                return ResponseEntity.badRequest().body("{\"error\":\"Email is required\"}");
            }
            
            Client client = emailDao.findByEmail(email);
            
            if (client == null) {
                log.warn("Client not found with email: {}", email);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("{\"error\":\"Client not found with email: " + email + "\"}");
            }
            
            log.info("Found client with ID: {}, deleting...", client.getId());
            emailDao.delete(client);
            log.info("Successfully deleted client with email: {}", email);
            
            return ResponseEntity.ok("{\"message\":\"Client deleted successfully\"}");
        } catch (Exception e) {
            log.error("Error deleting contact", e);
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
