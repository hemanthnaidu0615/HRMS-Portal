package com.hrms.service;

import com.hrms.entity.Document;
import com.hrms.entity.Employee;
import com.hrms.entity.Organization;
import com.hrms.entity.User;
import com.hrms.repository.DocumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;

    public DocumentService(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    @Transactional
    public Document uploadForEmployee(Employee employee, User uploadedBy, String fileName, String filePath, String fileType) {
        Document document = new Document(employee, uploadedBy, fileName, filePath, fileType);
        return documentRepository.save(document);
    }

    public List<Document> getDocumentsForEmployee(Employee employee) {
        return documentRepository.findByEmployeeId(employee.getId());
    }

    public List<Document> getDocumentsForOrganization(Organization organization) {
        return documentRepository.findByEmployeeOrganizationId(organization.getId());
    }
}
