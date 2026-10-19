FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /app
COPY services/order-service/package*.json ./
RUN npm ci --only=production
COPY shared /shared
COPY shared ./shared
COPY services/order-service/prisma ./prisma/
RUN npx prisma generate
COPY services/order-service/ .
EXPOSE 3004
CMD ["sh", "-c", "npx prisma db push --skip-generate && npm start"]
