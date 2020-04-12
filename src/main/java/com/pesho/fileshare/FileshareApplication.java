package com.pesho.fileshare;

import org.springframework.beans.factory.config.PropertiesFactoryBean;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.core.io.ClassPathResource;

@SpringBootApplication
public class FileshareApplication {

	public static void main(String[] args) {
		SpringApplication.run(FileshareApplication.class, args);
	}

	@Bean(name = "validationProperties")
	public static PropertiesFactoryBean mapper() {
		PropertiesFactoryBean bean = new PropertiesFactoryBean();
		bean.setLocation(new ClassPathResource("validation.properties"));
		return bean;
	}
}
