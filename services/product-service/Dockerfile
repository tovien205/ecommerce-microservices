FROM node:20-alpine
WORKDIR /app
COPY services/product-service/package*.json ./
RUN npm ci --only=production
COPY shared /shared
COPY shared ./shared
COPY services/product-service/ .
EXPOSE 3003 50052
CMD ["npm", "start"]
