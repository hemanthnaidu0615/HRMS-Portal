package com.hrms.service;

import com.azure.storage.blob.*;
import com.azure.storage.blob.models.BlobHttpHeaders;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    @Value("${storage.azure.connection-string}")
    private String connectionString;

    @Value("${storage.azure.container}")
    private String containerName;

    private BlobContainerClient getContainer() {
        BlobContainerClient containerClient =
                new BlobContainerClientBuilder()
                        .connectionString(connectionString)
                        .containerName(containerName)
                        .buildClient();

        containerClient.createIfNotExists();
        return containerClient;
    }

    public String store(MultipartFile file, UUID employeeId, UUID organizationId) {
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("Failed to store empty file");
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            LocalDateTime now = LocalDateTime.now();
            String year = now.format(DateTimeFormatter.ofPattern("yyyy"));
            String month = now.format(DateTimeFormatter.ofPattern("MM"));

            String sanitizedFilename = originalFilename != null ?
                originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_") :
                "document" + extension;

            String fileName = UUID.randomUUID() + "_" + sanitizedFilename;
            String blobPath = String.format("org/%s/employee/%s/%s/%s/%s",
                organizationId, employeeId, year, month, fileName);

            BlobContainerClient container = getContainer();
            BlobClient blobClient = container.getBlobClient(blobPath);

            blobClient.upload(file.getInputStream(), file.getSize(), true);

            BlobHttpHeaders headers = new BlobHttpHeaders()
                    .setContentType(file.getContentType());
            blobClient.setHttpHeaders(headers);

            return blobPath;

        } catch (Exception e) {
            throw new RuntimeException("Azure Blob upload failed", e);
        }
    }

    public InputStream load(String storedPath) {
        try {
            BlobContainerClient container = getContainer();
            BlobClient blobClient = container.getBlobClient(storedPath);

            ByteArrayOutputStream output = new ByteArrayOutputStream();
            blobClient.downloadStream(output);

            return new ByteArrayInputStream(output.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Azure Blob load failed", e);
        }
    }
}
