FROM node:20-alpine

WORKDIR /app

# Copy package files and prisma schema
COPY package*.json ./
COPY prisma ./prisma/
COPY tsconfig.json ./

# First install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client and build
RUN npm run build

# Clean up development dependencies
RUN npm prune --production

EXPOSE 3000

# Start the application
CMD ["npm", "start"]
