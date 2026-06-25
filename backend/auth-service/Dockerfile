FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install 
COPY src ./src

EXPOSE 4001
CMD ["npm", "start"]