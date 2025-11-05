# Build frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build
# Debug: show what was built
RUN echo "=== Frontend build contents ===" && ls -la /app/dist/

# Build backend
FROM maven:3.8.5-openjdk-17 AS backend-build
WORKDIR /app
COPY taskmanager/pom.xml ./
COPY taskmanager/src ./src
# Copy frontend build to backend static resources
COPY --from=frontend-build /app/dist ./src/main/resources/static
# Debug: verify frontend files are copied
RUN echo "=== Backend static resources ===" && ls -la /app/src/main/resources/static/
RUN mvn clean package -DskipTests

# Final runtime image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=backend-build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
