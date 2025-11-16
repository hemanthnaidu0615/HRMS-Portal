package com.hrms.service;

import org.passay.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class PasswordValidationService {

    private final PasswordValidator validator;

    public PasswordValidationService() {
        List<Rule> rules = Arrays.asList(
            // Length rule: 12-128 characters
            new LengthRule(12, 128),

            // Character rules
            new CharacterRule(EnglishCharacterData.UpperCase, 1),
            new CharacterRule(EnglishCharacterData.LowerCase, 1),
            new CharacterRule(EnglishCharacterData.Digit, 1),
            new CharacterRule(EnglishCharacterData.Special, 1),

            // No whitespace
            new WhitespaceRule()
        );

        this.validator = new PasswordValidator(rules);
    }

    public void validatePassword(String password) {
        RuleResult result = validator.validate(new PasswordData(password));

        if (!result.isValid()) {
            List<String> messages = new ArrayList<>();
            for (String msg : validator.getMessages(result)) {
                messages.add(msg);
            }
            throw new IllegalArgumentException(
                "Password does not meet security requirements: " + String.join(", ", messages)
            );
        }
    }

    public boolean isPasswordValid(String password) {
        try {
            validatePassword(password);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}
