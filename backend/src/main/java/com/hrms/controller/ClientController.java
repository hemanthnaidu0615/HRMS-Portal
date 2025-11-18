package com.hrms.controller;

import com.hrms.dto.client.*;
import com.hrms.service.ClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/clients")
public class ClientController {

    @Autowired
    private ClientService clientService;

    @GetMapping
    @PreAuthorize("hasRole('ORGADMIN')")
    public ResponseEntity<List<ClientListResponse>> getAllClients(
            @RequestParam(required = false) Boolean activeOnly,
            Authentication authentication
    ) {
        String email = authentication.getName();
        List<ClientListResponse> clients = clientService.getAllClients(email, activeOnly);
        return ResponseEntity.ok(clients);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ORGADMIN')")
    public ResponseEntity<ClientDetailResponse> getClientById(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        String email = authentication.getName();
        ClientDetailResponse client = clientService.getClientById(id, email);
        return ResponseEntity.ok(client);
    }

    @PostMapping
    @PreAuthorize("hasRole('ORGADMIN')")
    public ResponseEntity<ClientDetailResponse> createClient(
            @RequestBody CreateClientRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        ClientDetailResponse client = clientService.createClient(request, email);
        return ResponseEntity.ok(client);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ORGADMIN')")
    public ResponseEntity<ClientDetailResponse> updateClient(
            @PathVariable UUID id,
            @RequestBody UpdateClientRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        ClientDetailResponse client = clientService.updateClient(id, request, email);
        return ResponseEntity.ok(client);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ORGADMIN')")
    public ResponseEntity<Void> deleteClient(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        String email = authentication.getName();
        clientService.deleteClient(id, email);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/codes/next")
    @PreAuthorize("hasRole('ORGADMIN')")
    public ResponseEntity<String> getNextClientCode(Authentication authentication) {
        String email = authentication.getName();
        String nextCode = clientService.generateNextClientCode(email);
        return ResponseEntity.ok(nextCode);
    }
}
