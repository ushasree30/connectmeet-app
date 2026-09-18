FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY . .

RUN mvn clean package -DskipTests

EXPOSE 8081

CMD ["sh", "-c", "java -Dserver.port=${PORT:-8081} -jar target/*.jar"]