# Weave backend

Spring Boot modular monolith for the Weave connector platform.

## Local development

1. Start PostgreSQL with `docker compose up -d postgres`.
2. Run `mvn spring-boot:run` with Java 21 installed.
3. The API is available at `http://localhost:8080`.

The application uses Flyway migrations and validates the JPA schema at startup. Domain modules are intentionally kept inside one deployable application.
