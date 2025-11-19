package com.hrms.repository;

import com.hrms.entity.Employee;
import com.hrms.entity.NotificationPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, UUID> {

    List<NotificationPreference> findByEmployee(Employee employee);

    Optional<NotificationPreference> findByEmployeeAndNotificationType(Employee employee, String notificationType);

    boolean existsByEmployeeAndNotificationType(Employee employee, String notificationType);
}
