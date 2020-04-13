package com.pesho.fileshare.controllers;

import com.pesho.fileshare.models.ConfirmationToken;
import com.pesho.fileshare.models.User;
import com.pesho.fileshare.repositories.ConfirmationTokenRepository;
import com.pesho.fileshare.repositories.UserRepository;
import com.pesho.fileshare.services.EmailSenderService;
import com.pesho.fileshare.services.SecurityService;
import com.pesho.fileshare.services.UserService;
import com.pesho.fileshare.validators.UserValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Controller
public class UserController {

    @Resource(name = "validationProperties")
    private Map<String, String> validationProperties;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ConfirmationTokenRepository confirmationTokenRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private SecurityService securityService;

    @Autowired
    private EmailSenderService emailSenderService;

    @Autowired
    private UserValidator userValidator;

    @RequestMapping(value = "/register", method = RequestMethod.GET)
    public String registration(Model model) {
        model.addAttribute("user", new User());
        return "register";
    }

    @RequestMapping(value = "/register", method = RequestMethod.POST)
    public String registration(Model model, @ModelAttribute("user") User user, BindingResult bindingResult) {
        // Validate the user's input
        // and format the appropriate error messages, if any
        userValidator.validate(user, bindingResult);
        if (bindingResult.hasErrors()) {
            model.addAttribute("errors", getErrorMessages(bindingResult));
            return "register";
        }
        userService.save(user);

        // Generate an email confirmation token and send it to the newly registered user
        ConfirmationToken confirmationToken = new ConfirmationToken(user);
        confirmationTokenRepository.save(confirmationToken);
        emailSenderService.sendEmail(generateVerificationEmail(user.getEmail(), confirmationToken));

        return "redirect:/home";
    }

    @RequestMapping(value = "/confirm", method = { RequestMethod.GET, RequestMethod.POST })
    public String confirmUserAccount(Model model, @RequestParam("token") String token) {
        ConfirmationToken confirmationToken = confirmationTokenRepository.findByToken(token);
        if(confirmationToken != null) {
            User user = userRepository.findByEmailIgnoreCase(confirmationToken.getUser().getEmail());
            user.setEnabled(true);
            userRepository.save(user);
            return "account-verified";
        } else {
            return "account-verification-error";
        }
    }

    @RequestMapping(value = "/login", method = RequestMethod.GET)
    public String login(Model model, String error, String logout) {
        if (error != null) {
            model.addAttribute("error", "Your username and password is invalid.");
        }
        if (logout != null) {
            model.addAttribute("message", "You have been logged out successfully.");
        }
        return "login";
    }

    private SimpleMailMessage generateVerificationEmail(String email, ConfirmationToken confirmationToken) {
        SimpleMailMessage mailMessage = new SimpleMailMessage();

        mailMessage.setTo(email);
        mailMessage.setSubject("Verify your registration");
        mailMessage.setFrom("noreply@pesho.com");
        mailMessage.setText("To confirm your account, please click here : "
                + "http://localhost:8080/confirm?token=" + confirmationToken.getToken());
        return mailMessage;
    }

    private List<String> getErrorMessages(BindingResult bindingResult) {
        List<String> errorMessages = new ArrayList<>();

        for (ObjectError err : bindingResult.getAllErrors()) {
            StringBuilder errMsg = new StringBuilder("");
            errMsg.append(((FieldError)err).getField());
            errMsg.append(": ");
            errMsg.append(validationProperties.get(err.getCode().toString()));
            errorMessages.add(errMsg.toString());
        }
        return errorMessages;
    }
}
