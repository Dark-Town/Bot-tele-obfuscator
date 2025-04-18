FROM node:14
WORKDIR /usr/src/bot
COPY package*.json ./
RUN yarn install
COPY . .
EXPOSE 3000
CMD ["node", "bot.js"]
