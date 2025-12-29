FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY . .

# Expose port (default 3001 as set in app.js)
EXPOSE 3001

# Start the app
CMD [ "npm", "start" ]
