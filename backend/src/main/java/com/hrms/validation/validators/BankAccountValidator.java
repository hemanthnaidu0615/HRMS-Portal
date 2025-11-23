package com.hrms.validation.validators;

import com.hrms.validation.constraints.ValidBankAccount;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;

import java.math.BigInteger;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Validates bank account information based on country
 * Supports: USA (Routing/Account), India (IFSC), UK (Sort Code), Canada (Transit/Institution), Australia (BSB)
 */
public class BankAccountValidator implements ConstraintValidator<ValidBankAccount, Object> {

    // Country-specific routing patterns
    private static final Map<String, Pattern> ROUTING_PATTERNS = Map.of(
            "USA", Pattern.compile("^\\d{9}$"),           // ABA Routing Number
            "IND", Pattern.compile("^[A-Z]{4}0[A-Z0-9]{6}$"),  // IFSC Code
            "GBR", Pattern.compile("^\\d{6}$"),           // Sort Code
            "CAN", Pattern.compile("^\\d{5}$"),           // Transit Number
            "AUS", Pattern.compile("^\\d{6}$")            // BSB Code
    );

    private static final Pattern IBAN_PATTERN = Pattern.compile("^[A-Z]{2}\\d{2}[A-Z0-9]{1,30}$");
    private static final Pattern SWIFT_PATTERN = Pattern.compile("^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$");

    @Override
    public void initialize(ValidBankAccount constraintAnnotation) {
    }

    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }

        try {
            BeanWrapper wrapper = new BeanWrapperImpl(value);

            String countryCode = getStringProperty(wrapper, "bankCountryCode");
            if (countryCode == null || countryCode.isEmpty()) {
                countryCode = getStringProperty(wrapper, "bank_country_code");
            }

            // Validate based on country
            if (countryCode != null) {
                return switch (countryCode.toUpperCase()) {
                    case "USA" -> validateUSBank(wrapper, context);
                    case "IND" -> validateIndianBank(wrapper, context);
                    case "GBR" -> validateUKBank(wrapper, context);
                    case "CAN" -> validateCanadianBank(wrapper, context);
                    case "AUS" -> validateAustralianBank(wrapper, context);
                    default -> validateGenericBank(wrapper, context);
                };
            }

            return validateGenericBank(wrapper, context);
        } catch (Exception e) {
            return true; // Let other validation handle errors
        }
    }

    private boolean validateUSBank(BeanWrapper wrapper, ConstraintValidatorContext context) {
        String routingNumber = getStringProperty(wrapper, "routingNumber");
        String accountNumber = getStringProperty(wrapper, "accountNumber");

        // Validate routing number
        if (routingNumber != null && !routingNumber.isEmpty()) {
            if (!ROUTING_PATTERNS.get("USA").matcher(routingNumber).matches()) {
                setMessage(context, "Invalid US routing number format (must be 9 digits)");
                return false;
            }

            // ABA checksum validation
            if (!validateABAChecksum(routingNumber)) {
                setMessage(context, "Invalid US routing number: Checksum failed");
                return false;
            }
        }

        // Validate account number length
        if (accountNumber != null && !accountNumber.isEmpty()) {
            if (accountNumber.length() < 4 || accountNumber.length() > 17) {
                setMessage(context, "US account number must be between 4 and 17 digits");
                return false;
            }
        }

        return true;
    }

    private boolean validateIndianBank(BeanWrapper wrapper, ConstraintValidatorContext context) {
        String ifscCode = getStringProperty(wrapper, "ifscCode");
        String accountNumber = getStringProperty(wrapper, "accountNumber");

        if (ifscCode != null && !ifscCode.isEmpty()) {
            if (!ROUTING_PATTERNS.get("IND").matcher(ifscCode.toUpperCase()).matches()) {
                setMessage(context, "Invalid IFSC code format (e.g., ABCD0123456)");
                return false;
            }

            // Fifth character must be 0
            if (ifscCode.charAt(4) != '0') {
                setMessage(context, "Invalid IFSC code: Fifth character must be 0");
                return false;
            }
        }

        if (accountNumber != null && !accountNumber.isEmpty()) {
            if (accountNumber.length() < 9 || accountNumber.length() > 18) {
                setMessage(context, "Indian account number must be between 9 and 18 digits");
                return false;
            }
        }

        return true;
    }

    private boolean validateUKBank(BeanWrapper wrapper, ConstraintValidatorContext context) {
        String sortCode = getStringProperty(wrapper, "sortCode");
        String accountNumber = getStringProperty(wrapper, "accountNumber");

        if (sortCode != null && !sortCode.isEmpty()) {
            String normalized = sortCode.replaceAll("-", "");
            if (!ROUTING_PATTERNS.get("GBR").matcher(normalized).matches()) {
                setMessage(context, "Invalid UK sort code format (must be 6 digits)");
                return false;
            }
        }

        if (accountNumber != null && !accountNumber.isEmpty()) {
            if (accountNumber.length() != 8) {
                setMessage(context, "UK account number must be exactly 8 digits");
                return false;
            }
        }

        return true;
    }

    private boolean validateCanadianBank(BeanWrapper wrapper, ConstraintValidatorContext context) {
        String transitNumber = getStringProperty(wrapper, "transitNumber");
        String institutionNumber = getStringProperty(wrapper, "institutionNumber");
        String accountNumber = getStringProperty(wrapper, "accountNumber");

        if (transitNumber != null && !transitNumber.isEmpty()) {
            if (!ROUTING_PATTERNS.get("CAN").matcher(transitNumber).matches()) {
                setMessage(context, "Invalid Canadian transit number (must be 5 digits)");
                return false;
            }
        }

        if (institutionNumber != null && !institutionNumber.isEmpty()) {
            if (!institutionNumber.matches("^\\d{3}$")) {
                setMessage(context, "Invalid Canadian institution number (must be 3 digits)");
                return false;
            }
        }

        if (accountNumber != null && !accountNumber.isEmpty()) {
            if (accountNumber.length() < 7 || accountNumber.length() > 12) {
                setMessage(context, "Canadian account number must be between 7 and 12 digits");
                return false;
            }
        }

        return true;
    }

    private boolean validateAustralianBank(BeanWrapper wrapper, ConstraintValidatorContext context) {
        String bsbCode = getStringProperty(wrapper, "bsbCode");
        String accountNumber = getStringProperty(wrapper, "accountNumber");

        if (bsbCode != null && !bsbCode.isEmpty()) {
            String normalized = bsbCode.replaceAll("-", "");
            if (!ROUTING_PATTERNS.get("AUS").matcher(normalized).matches()) {
                setMessage(context, "Invalid Australian BSB code (must be 6 digits)");
                return false;
            }
        }

        if (accountNumber != null && !accountNumber.isEmpty()) {
            if (accountNumber.length() < 6 || accountNumber.length() > 10) {
                setMessage(context, "Australian account number must be between 6 and 10 digits");
                return false;
            }
        }

        return true;
    }

    private boolean validateGenericBank(BeanWrapper wrapper, ConstraintValidatorContext context) {
        String iban = getStringProperty(wrapper, "iban");
        String swiftCode = getStringProperty(wrapper, "swiftCode");

        // Validate IBAN if provided
        if (iban != null && !iban.isEmpty()) {
            String normalized = iban.replaceAll("\\s", "").toUpperCase();
            if (!IBAN_PATTERN.matcher(normalized).matches()) {
                setMessage(context, "Invalid IBAN format");
                return false;
            }

            if (!validateIBANChecksum(normalized)) {
                setMessage(context, "Invalid IBAN: Checksum failed");
                return false;
            }
        }

        // Validate SWIFT code if provided
        if (swiftCode != null && !swiftCode.isEmpty()) {
            if (!SWIFT_PATTERN.matcher(swiftCode.toUpperCase()).matches()) {
                setMessage(context, "Invalid SWIFT/BIC code format");
                return false;
            }
        }

        return true;
    }

    /**
     * Validates ABA routing number checksum
     */
    private boolean validateABAChecksum(String routing) {
        if (routing.length() != 9) return false;

        int[] weights = {3, 7, 1, 3, 7, 1, 3, 7, 1};
        int sum = 0;
        for (int i = 0; i < 9; i++) {
            sum += Character.getNumericValue(routing.charAt(i)) * weights[i];
        }
        return sum % 10 == 0;
    }

    /**
     * Validates IBAN checksum using ISO 7064 Mod 97-10
     */
    private boolean validateIBANChecksum(String iban) {
        // Move first 4 chars to end
        String rearranged = iban.substring(4) + iban.substring(0, 4);

        // Replace letters with numbers (A=10, B=11, etc.)
        StringBuilder numeric = new StringBuilder();
        for (char c : rearranged.toCharArray()) {
            if (Character.isLetter(c)) {
                numeric.append(c - 'A' + 10);
            } else {
                numeric.append(c);
            }
        }

        // Check mod 97
        BigInteger value = new BigInteger(numeric.toString());
        return value.mod(BigInteger.valueOf(97)).equals(BigInteger.ONE);
    }

    private String getStringProperty(BeanWrapper wrapper, String propertyName) {
        try {
            Object value = wrapper.getPropertyValue(propertyName);
            return value != null ? value.toString() : null;
        } catch (Exception e) {
            return null;
        }
    }

    private void setMessage(ConstraintValidatorContext context, String message) {
        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(message).addConstraintViolation();
    }
}
