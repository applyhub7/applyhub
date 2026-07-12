FROM node:18-alpine

WORKDIR /app

COPY package*.json .

RUN npm ci --omit=dev

COPY src ./src

EXPOSE 4001

CMD ["npm", "start"]

##