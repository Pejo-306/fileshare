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
import org.springframework.web.servlet.ModelAndView;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Controller
public class UserController {

    @Resource(name = "validationProperties")
    private Map<String, String> validationProperties;

    @Autowired
    private UserService userService;

    @Autowired
    private SecurityService securityService;

    @Autowired
    private UserValidator userValidator;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ConfirmationTokenRepository confirmationTokenRepository;

    @Autowired
    private EmailSenderService emailSenderService;

    @GetMapping("/register")
    public String registration(Model model) {
        model.addAttribute("userForm", new User());
        return "register";
    }

    @PostMapping("/register")
    public String registration(Model model, @ModelAttribute("userForm") User userForm, BindingResult bindingResult) {
        userValidator.validate(userForm, bindingResult);
        if (bindingResult.hasErrors()) {
            List<String> errorMessages = new ArrayList<>();
            for (ObjectError err : bindingResult.getAllErrors()) {
                StringBuilder errMsg = new StringBuilder("");
                errMsg.append(((FieldError)err).getField());
                errMsg.append(": ");
                errMsg.append(validationProperties.get(err.getCode().toString()));
                errorMessages.add(errMsg.toString());
            }
            model.addAttribute("errors", errorMessages);
            return "register";
        }
        userService.save(userForm);

        ConfirmationToken confirmationToken = new ConfirmationToken(userForm);
        confirmationTokenRepository.save(confirmationToken);
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(userForm.getEmail());
        mailMessage.setSubject("Verify your registration");
        mailMessage.setFrom("noreply@pesho.com");
        mailMessage.setText("To confirm your account, please click here : "
                +"http://localhost:8080/confirm?token="+confirmationToken.getToken());
        emailSenderService.sendEmail(mailMessage);
        model.addAttribute("message", "Email verification link sent");

        // securityService.autoLogin(userForm.getUsername(), userForm.getPasswordConfirm());
        return "redirect:/home";
    }

    @RequestMapping(value="/confirm", method= {RequestMethod.GET, RequestMethod.POST})
    public ModelAndView confirmUserAccount(ModelAndView modelAndView, @RequestParam("token")String token) {
        ConfirmationToken confirmationToken = confirmationTokenRepository.findByToken(token);

        if(confirmationToken != null) {
            User user = userRepository.findByEmailIgnoreCase(confirmationToken.getUser().getEmail());
            user.setEnabled(true);
            userRepository.save(user);
            modelAndView.setViewName("accountVerified");
        } else {
            modelAndView.setViewName("accountVerificationError");
        }
        return modelAndView;
    }

    @GetMapping("/login")
    public String login(Model model, String error, String logout) {
        if (error != null) {
            model.addAttribute("error", "Your username and password is invalid.");
        }
        if (logout != null) {
            model.addAttribute("message", "You have been logged out successfully.");
        }
        return "login";
    }
}
