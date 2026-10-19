FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# Copy schema và generate Prisma Client
COPY prisma ./prisma/
RUN npx prisma generate

COPY . .

EXPOSE 3002 50051
CMD ["npm", "start"]