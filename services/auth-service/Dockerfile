FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /app

COPY services/auth-service/package*.json ./
RUN npm install --only=production

COPY services/auth-service/prisma ./prisma/
RUN npx prisma generate

COPY services/auth-service/ .
COPY shared /shared

EXPOSE 3001
CMD ["sh", "-c", "npx prisma db push --skip-generate && npm start"]