package com.example.volunteerhub.config;

import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;
import java.nio.file.Path;

@Configuration
public class AppConfig implements WebMvcConfigurer {
    @Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }

    @Value("${upload.dir:uploads}")
    private String uploadDir; // use configured upload.dir (relative by default)

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path base = Path.of(uploadDir).toAbsolutePath().normalize();
        String resourceLocation = "file:" + base.toString() + (base.toString().endsWith(File.separator) ? "" : File.separator);
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(resourceLocation);
        System.out.println("[AppConfig] serving /uploads/** from -> " + resourceLocation);
    }

    // Use Jackson2ObjectMapperBuilderCustomizer to register JavaTimeModule and keep Spring Boot defaults
    @Bean
    public Jackson2ObjectMapperBuilderCustomizer jacksonCustomizer() {
        return builder -> {
            builder.modules(new JavaTimeModule());
            builder.featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        };
    }
}
