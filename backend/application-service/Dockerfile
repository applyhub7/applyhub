FROM node:18-alpine

WORKDIR /app

COPY package*.json .

RUN npm ci --omit=dev

COPY src ./src

EXPOSE 4003

# CMD ["npm", "start"]
#####test-releas3