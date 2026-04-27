# Use official Node.js image
FROM node:20-slim

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy app source
COPY . .

# Expose port
EXPOSE 8080

# Environment variables
ENV PORT=8080
ENV NODE_ENV=production

# Start the application
CMD [ "node", "server.js" ]
