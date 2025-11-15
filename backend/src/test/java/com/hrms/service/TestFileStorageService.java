package com.hrms.service;

import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Test implementation of FileStorageService that stores files in memory
 * instead of using Azure Blob Storage. This allows tests to run without
 * external dependencies.
 */
@Service
@Profile("test")
@Primary
public class TestFileStorageService {

    private final Map<String, byte[]> storage = new ConcurrentHashMap<>();

    public String store(MultipartFile file, UUID employeeId) {
        try {
            String fileName = file.getOriginalFilename();
            String extension = "";
            if (fileName != null && fileName.contains(".")) {
                extension = fileName.substring(fileName.lastIndexOf("."));
            }

            String uniqueFileName = UUID.randomUUID() + extension;
            String filePath = employeeId.toString() + "/" + uniqueFileName;

            // Store file content in memory
            storage.put(filePath, file.getBytes());

            return filePath;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file in test storage", e);
        }
    }

    public InputStream load(String filePath) {
        byte[] content = storage.get(filePath);
        if (content == null) {
            throw new RuntimeException("File not found in test storage: " + filePath);
        }
        return new ByteArrayInputStream(content);
    }

    /**
     * Check if a file exists in test storage
     */
    public boolean exists(String filePath) {
        return storage.containsKey(filePath);
    }

    /**
     * Clear all stored files (useful for test cleanup)
     */
    public void clear() {
        storage.clear();
    }

    /**
     * Get the number of files stored
     */
    public int size() {
        return storage.size();
    }
}
