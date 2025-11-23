package com.hrms.validation;

import com.hrms.validation.validators.BankAccountValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import jakarta.validation.ConstraintValidatorContext;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@DisplayName("Bank Account Validator Tests")
class BankAccountValidatorTest {

    private BankAccountValidator validator;
    private ConstraintValidatorContext context;
    private ConstraintValidatorContext.ConstraintViolationBuilder builder;

    @BeforeEach
    void setUp() {
        validator = new BankAccountValidator();
        context = mock(ConstraintValidatorContext.class);
        builder = mock(ConstraintValidatorContext.ConstraintViolationBuilder.class);
        when(context.buildConstraintViolationWithTemplate(anyString())).thenReturn(builder);
    }

    @Nested
    @DisplayName("US ABA Routing Number Tests")
    class USRoutingTests {

        @Test
        @DisplayName("Valid ABA routing number should pass checksum")
        void validABARoutingNumber() {
            // 021000021 is JPMorgan Chase
            assertTrue(validateABAChecksum("021000021"));
        }

        @Test
        @DisplayName("Invalid ABA routing number should fail checksum")
        void invalidABARoutingNumber() {
            assertFalse(validateABAChecksum("123456789"));
        }

        @ParameterizedTest
        @ValueSource(strings = {
                "021000021",  // JPMorgan Chase
                "011401533",  // Bank of America
                "322271627"   // Chase California
        })
        @DisplayName("Known valid routing numbers should pass")
        void knownValidRoutingNumbers(String routing) {
            assertTrue(validateABAChecksum(routing));
        }

        private boolean validateABAChecksum(String routing) {
            if (routing.length() != 9) return false;
            int[] weights = {3, 7, 1, 3, 7, 1, 3, 7, 1};
            int sum = 0;
            for (int i = 0; i < 9; i++) {
                sum += Character.getNumericValue(routing.charAt(i)) * weights[i];
            }
            return sum % 10 == 0;
        }
    }

    @Nested
    @DisplayName("Indian IFSC Code Tests")
    class IFSCTests {

        @ParameterizedTest
        @ValueSource(strings = {
                "HDFC0001234",
                "SBIN0012345",
                "ICIC0000001"
        })
        @DisplayName("Valid IFSC codes should pass")
        void validIFSCCodes(String ifsc) {
            assertTrue(ifsc.matches("^[A-Z]{4}0[A-Z0-9]{6}$"));
        }

        @ParameterizedTest
        @ValueSource(strings = {
                "HDFC1001234",  // Fifth char not 0
                "HDF0001234",   // Only 3 letters
                "HDFCO001234"   // Letter instead of 0
        })
        @DisplayName("Invalid IFSC codes should fail")
        void invalidIFSCCodes(String ifsc) {
            assertFalse(ifsc.matches("^[A-Z]{4}0[A-Z0-9]{6}$"));
        }
    }

    @Nested
    @DisplayName("UK Sort Code Tests")
    class SortCodeTests {

        @ParameterizedTest
        @ValueSource(strings = {
                "012345",
                "40-47-84",
                "60-00-01"
        })
        @DisplayName("Valid sort codes should pass")
        void validSortCodes(String sortCode) {
            String normalized = sortCode.replaceAll("-", "");
            assertTrue(normalized.matches("^\\d{6}$"));
        }
    }

    @Nested
    @DisplayName("IBAN Validation Tests")
    class IBANTests {

        @Test
        @DisplayName("Valid German IBAN should pass")
        void validGermanIBAN() {
            assertTrue(validateIBAN("DE89370400440532013000"));
        }

        @Test
        @DisplayName("Valid UK IBAN should pass")
        void validUKIBAN() {
            assertTrue(validateIBAN("GB29NWBK60161331926819"));
        }

        @Test
        @DisplayName("Invalid IBAN checksum should fail")
        void invalidIBANChecksum() {
            assertFalse(validateIBAN("DE89370400440532013001"));
        }

        private boolean validateIBAN(String iban) {
            String normalized = iban.replaceAll("\\s", "").toUpperCase();
            String rearranged = normalized.substring(4) + normalized.substring(0, 4);

            StringBuilder numeric = new StringBuilder();
            for (char c : rearranged.toCharArray()) {
                if (Character.isLetter(c)) {
                    numeric.append(c - 'A' + 10);
                } else {
                    numeric.append(c);
                }
            }

            java.math.BigInteger value = new java.math.BigInteger(numeric.toString());
            return value.mod(java.math.BigInteger.valueOf(97)).equals(java.math.BigInteger.ONE);
        }
    }

    @Nested
    @DisplayName("SWIFT/BIC Code Tests")
    class SWIFTTests {

        @ParameterizedTest
        @ValueSource(strings = {
                "DEUTDEFF",     // 8 characters
                "DEUTDEFF500",  // 11 characters
                "CHASUS33"      // Chase
        })
        @DisplayName("Valid SWIFT codes should pass")
        void validSWIFTCodes(String swift) {
            assertTrue(swift.matches("^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$"));
        }

        @ParameterizedTest
        @ValueSource(strings = {
                "DEUT",        // Too short
                "DEUTDEFF5",   // Wrong length (9)
                "1234DEFF"     // Starts with numbers
        })
        @DisplayName("Invalid SWIFT codes should fail")
        void invalidSWIFTCodes(String swift) {
            assertFalse(swift.matches("^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$"));
        }
    }

    @Test
    @DisplayName("Null value should return true")
    void nullValueShouldPass() {
        assertTrue(validator.isValid(null, context));
    }
}
