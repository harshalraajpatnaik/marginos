package com.marginos.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI marginosOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("MarginOS REST API")
                        .description("Financial Operating System and Business Decision-Support Platform for Indian Small Businesses.\n\n" +
                                "Supports authenticated user access via JWT Bearer tokens and automated programmatic access via workspace-scoped API keys (`X-API-Key`).")
                        .version("1.0.0")
                        .contact(new Contact().name("MarginOS Core Engineering").email("support@marginos.internal"))
                        .license(new License().name("Proprietary / MIT").url("https://github.com/harshalraajpatnaik/marginos")))
                .addSecurityItem(new SecurityRequirement().addList("BearerAuth").addList("ApiKeyAuth"))
                .components(new Components()
                        .addSecuritySchemes("BearerAuth",
                                new SecurityScheme()
                                        .name("BearerAuth")
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter your JWT token obtained from POST /api/v1/auth/login"))
                        .addSecuritySchemes("ApiKeyAuth",
                                new SecurityScheme()
                                        .name("X-API-Key")
                                        .type(SecurityScheme.Type.APIKEY)
                                        .in(SecurityScheme.In.HEADER)
                                        .description("Enter your business-scoped API key starting with `mk_live_...`")));
    }
}
