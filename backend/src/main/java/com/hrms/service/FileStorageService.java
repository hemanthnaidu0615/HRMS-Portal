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

    public String store(MultipartFile file, UUID employeeId) {
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("Failed to store empty file");
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String fileName = UUID.randomUUID() + extension;
            String blobPath = employeeId.toString() + "/" + fileName;

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
            blobClient.download(output);

            return new ByteArrayInputStream(output.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Azure Blob load failed", e);
        }
    }
}
