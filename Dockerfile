FROM node:14
WORKDIR /usr/src/bot

RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "bot.js"]
