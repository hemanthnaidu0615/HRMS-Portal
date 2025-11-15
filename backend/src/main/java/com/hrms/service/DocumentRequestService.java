package com.hrms.service;

import com.hrms.entity.DocumentRequest;
import com.hrms.entity.Employee;
import com.hrms.entity.Organization;
import com.hrms.entity.User;
import com.hrms.repository.DocumentRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DocumentRequestService {

    private final DocumentRequestRepository documentRequestRepository;

    public DocumentRequestService(DocumentRequestRepository documentRequestRepository) {
        this.documentRequestRepository = documentRequestRepository;
    }

    @Transactional
    public DocumentRequest createRequest(User requester, Employee targetEmployee, String message) {
        DocumentRequest request = new DocumentRequest(requester, targetEmployee, message);
        return documentRequestRepository.save(request);
    }

    public List<DocumentRequest> getRequestsForEmployee(Employee employee) {
        return documentRequestRepository.findByTargetEmployeeId(employee.getId());
    }

    public List<DocumentRequest> getRequestsForRequester(User requester) {
        return documentRequestRepository.findByRequesterId(requester.getId());
    }

    public List<DocumentRequest> getRequestsForOrganization(Organization organization) {
        return documentRequestRepository.findByTargetEmployeeOrganizationId(organization.getId());
    }

    @Transactional
    public DocumentRequest markCompleted(DocumentRequest request) {
        request.setStatus("COMPLETED");
        request.setCompletedAt(LocalDateTime.now());
        return documentRequestRepository.save(request);
    }

    @Transactional
    public DocumentRequest markRejected(DocumentRequest request) {
        request.setStatus("REJECTED");
        request.setCompletedAt(LocalDateTime.now());
        return documentRequestRepository.save(request);
    }
}
