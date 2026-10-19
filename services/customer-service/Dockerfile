FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /app
COPY services/customer-service/package*.json ./
RUN npm ci --only=production
COPY shared /shared
COPY shared ./shared
COPY services/customer-service/prisma ./prisma/
RUN npx prisma generate
COPY services/customer-service/ .
EXPOSE 3002 50051
CMD ["sh", "-c", "npx prisma db push --skip-generate && npm start"]
