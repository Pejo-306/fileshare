package com.pesho.fileshare.validators;

import com.pesho.fileshare.models.User;
import com.pesho.fileshare.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.validation.Errors;
import org.springframework.validation.ValidationUtils;
import org.springframework.validation.Validator;

@Component
public class UserValidator implements Validator {

    @Autowired
    private UserService userService;

    @Override
    public boolean supports(Class<?> aClass) {
        return User.class.equals(aClass);
    }

    @Override
    public void validate(Object o, Errors errors) {
        User user = (User) o;

        // Reject empty username
        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "username", "validationErrors.NotEmpty");
        // Reject duplicate username
        if (userService.findByUsername(user.getUsername()) != null) {
            errors.rejectValue("username", "validationErrors.Duplicate.userForm.username");
        }

        // Reject empty email
        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "email", "validationErrors.NotEmpty");
        // Reject duplicate email
        if (userService.findByEmail(user.getEmail()) != null) {
            errors.rejectValue("email", "validationErrors.Duplicate.userForm.email");
        }

        // Reject empty password
        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "password", "validationErrors.NotEmpty");
        // Reject passwords with length smaller than 8
        if (user.getPassword().length() < 8) {
            errors.rejectValue("password", "validationErrors.Size.userForm.password");
        }
        // Reject if password confirmation does not equal password
        if (!user.getPasswordConfirm().equals(user.getPassword())) {
            errors.rejectValue("passwordConfirm", "validationErrors.Diff.userForm.passwordConfirm");
        }
    }
}
