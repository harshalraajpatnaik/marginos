# MarginOS — Docker & Production Deployment Guide

## 1. Quickstart with Docker Compose

MarginOS includes pre-configured Docker Compose infrastructure in the repository root.

### Services:
1. **`marginos-postgres`**: PostgreSQL 16 Alpine
   - Host Port: `5435` (mapped to container port `5432` to avoid host port collisions)
   - Persistent Volume: `marginos_pg_data`
   - Healthcheck: `pg_isready -U marginos -d marginos`
2. **`marginos-mailpit`**: Mailpit SMTP Server & Web UI
   - SMTP Port: `1026` (mapped to container port `1025`)
   - Web UI Port: `8026` (mapped to container port `8025`)

### Starting Infrastructure:
```bash
docker compose up -d
```

Verify container status:
```bash
docker compose ps
```

---

## 2. Running Backend (Spring Boot 3.4.3)

### Prerequisites:
- Java OpenJDK 17 LTS
- Maven 3.9+

### Build & Run:
```bash
cd marginos-backend

# Package standalone executable JAR
mvn clean package -DskipTests

# Run with local dev profile
java -jar target/marginos-backend-1.0.0.jar
```

The backend starts on port **`8085`** (configurable via `PORT=8085`).
- Actuator Healthcheck: `http://localhost:8085/actuator/health`
- Swagger UI Documentation: `http://localhost:8085/swagger-ui.html`

---

## 3. Running Frontend (Angular 19 Standalone)

### Prerequisites:
- Node.js 20+
- npm 10+

### Development Serve:
```bash
cd marginos-frontend

# Install dependencies
npm install

# Start development server with proxy forwarding to port 8085
npm start
```
Access in browser: `http://localhost:4200`

### Production Build:
```bash
npm run build
```
Generates optimized, tree-shaken static assets in `dist/marginos-frontend`.

---

## 4. Environment Variables Reference

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `8085` | Backend HTTP server port |
| `POSTGRES_HOST` | `localhost` | PostgreSQL host |
| `POSTGRES_PORT` | `5435` | PostgreSQL port |
| `POSTGRES_DB` | `marginos` | Database name |
| `POSTGRES_USER` | `marginos` | Database username |
| `POSTGRES_PASSWORD` | `marginos_secure_password_dev` | Database password |
| `JWT_SECRET` | *(64-byte hex string)* | HS512 cryptographic key for JWT signing |
| `JWT_ACCESS_EXPIRY_SECONDS` | `900` | Access token lifespan (15 minutes) |
| `JWT_REFRESH_EXPIRY_SECONDS` | `604800` | Refresh token lifespan (7 days) |
| `MAIL_HOST` | `localhost` | SMTP host |
| `MAIL_PORT` | `1026` | SMTP port |
| `FRONTEND_URL` | `http://localhost:4200` | Allowed CORS origin |
