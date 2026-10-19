FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY prisma ./prisma/
RUN npx prisma generate
COPY . .
EXPOSE 3001
CMD ["sh", "-c", "npx prisma db push --skip-generate && npm start"]
