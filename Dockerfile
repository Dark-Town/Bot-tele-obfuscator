FROM node:lts-buster

RUN npm install -g yarn && yarn install

# Copy the rest of the application code
COPY . .

# Expose the port your application runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "bot.js"]
