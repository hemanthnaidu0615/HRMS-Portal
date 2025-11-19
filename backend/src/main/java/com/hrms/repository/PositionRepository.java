package com.hrms.repository;

import com.hrms.entity.Organization;
import com.hrms.entity.Position;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PositionRepository extends JpaRepository<Position, UUID> {
    List<Position> findByOrganization(Organization organization);
    Optional<Position> findByOrganizationAndName(Organization organization, String name);

    // Demo data cleanup methods
    int deleteByOrganization(Organization organization);
    long countByOrganization(Organization organization);
}
