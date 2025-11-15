package com.hrms.repository;

import com.hrms.entity.DocumentRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DocumentRequestRepository extends JpaRepository<DocumentRequest, UUID> {
    List<DocumentRequest> findByTargetEmployeeId(UUID employeeId);
    List<DocumentRequest> findByRequesterId(UUID requesterId);
    List<DocumentRequest> findByTargetEmployeeOrganizationId(UUID organizationId);
}
