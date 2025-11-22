package com.hrms.dto.onboarding;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class OnboardingChecklistItemDto {

    private UUID id;

    @NotNull(message = "Item order is required")
    private Integer itemOrder;

    @NotBlank(message = "Item name is required")
    private String itemName;

    private String itemDescription;

    @NotBlank(message = "Item type is required")
    private String itemType;

    private String relatedField;
    private String relatedTable;
    private String requiredDocumentType;
    private String acknowledgementText;
    private Boolean requiresSignature = false;
    private Boolean isRequired = true;
    private String validationRule;
    private String minValue;
    private String maxValue;
    private String regexPattern;
    private String helpText;
    private String exampleText;
    private String helpUrl;
}
