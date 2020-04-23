package com.pesho.fileshare.controllers;

import com.pesho.fileshare.models.ConfirmationToken;
import com.pesho.fileshare.models.DBFile;
import com.pesho.fileshare.models.DBFileType;
import com.pesho.fileshare.models.User;
import com.pesho.fileshare.repositories.ConfirmationTokenRepository;
import com.pesho.fileshare.repositories.DBFileRepository;
import com.pesho.fileshare.repositories.UserRepository;
import com.pesho.fileshare.services.EmailSenderService;
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
import javax.servlet.http.HttpServletRequest;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Controller
public class UserController {

    @Resource(name = "validationProperties")
    private Map<String, String> validationProperties;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ConfirmationTokenRepository confirmationTokenRepository;

    @Autowired
    private DBFileRepository fileRepository;

    @Autowired
    private UserService userService;

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
    public String registration(HttpServletRequest request, Model model, @ModelAttribute("user") User user,
                               BindingResult bindingResult) throws MalformedURLException {
        // Validate the user's input and format the appropriate error messages, if any
        userValidator.validate(user, bindingResult);
        if (bindingResult.hasErrors()) {
            model.addAttribute("errors", getErrorMessages(bindingResult));
            return "register";
        }
        userService.save(user);

        // Create a new root folder for the user
        DBFile rootFolder = new DBFile(DBFileType.DIRECTORY, "root", user, null, null);
        fileRepository.save(rootFolder);

        // Generate an email confirmation token and send it to the newly registered user
        ConfirmationToken confirmationToken = new ConfirmationToken(user);
        confirmationTokenRepository.save(confirmationToken);
        emailSenderService.sendEmail(generateVerificationEmail(user.getEmail(), confirmationToken, request.getRequestURL().toString()));

        return "redirect:/home";
    }

    @RequestMapping(value = "/confirm", method = RequestMethod.GET)
    public String confirmUserAccount(Model model, @RequestParam("token") String token) {
        Optional<ConfirmationToken> confirmationTokenOpt = confirmationTokenRepository.findByToken(token);

        if(confirmationTokenOpt.isPresent()) {
            ConfirmationToken confirmationToken = confirmationTokenOpt.get();
            User user = confirmationToken.getUser();

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

    private SimpleMailMessage generateVerificationEmail(String email, ConfirmationToken confirmationToken,
                                                        String requestURL) throws MalformedURLException {
        // Build the verification URL
        URL url = new URL(requestURL);
        StringBuilder verificationLink = new StringBuilder();
        verificationLink.append("http://localhost:");
        verificationLink.append(url.getPort());
        verificationLink.append("/confirm?token=");
        verificationLink.append(confirmationToken.getToken());

        // Build the mail message with the verification link
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(email);
        mailMessage.setSubject("Verify your registration");
        mailMessage.setText("To confirm your account, please click here : " + verificationLink.toString());
        return mailMessage;
    }

    private List<String> getErrorMessages(BindingResult bindingResult) {
        List<String> errorMessages = new ArrayList<>();

        for (ObjectError err : bindingResult.getAllErrors()) {
            StringBuilder errMsg = new StringBuilder();

            errMsg.append(((FieldError)err).getField());
            errMsg.append(": ");
            errMsg.append(validationProperties.get(err.getCode()));
            errorMessages.add(errMsg.toString());
        }
        return errorMessages;
    }
}
