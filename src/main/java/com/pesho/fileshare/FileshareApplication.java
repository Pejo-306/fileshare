package com.pesho.fileshare;

import org.springframework.beans.factory.config.PropertiesFactoryBean;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.core.io.ClassPathResource;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.extras.springsecurity4.dialect.SpringSecurityDialect;
import org.thymeleaf.spring5.SpringTemplateEngine;

@SpringBootApplication
public class FileshareApplication {

	public static void main(String[] args) {
		SpringApplication.run(FileshareApplication.class, args);
	}

	@Bean(name = "validationProperties")
	public static PropertiesFactoryBean validationPropertiesMapper() {
		PropertiesFactoryBean bean = new PropertiesFactoryBean();
		bean.setLocation(new ClassPathResource("validation.properties"));
		return bean;
	}

	@Bean
	public TemplateEngine myTemplateEngine() {
		SpringTemplateEngine engine = new SpringTemplateEngine();
		engine.addDialect(new SpringSecurityDialect());
		engine.setEnableSpringELCompiler(true);
		return engine;
	}

	@Bean
	public SpringSecurityDialect springSecurityDialect() {
		return new SpringSecurityDialect();
	}
}
