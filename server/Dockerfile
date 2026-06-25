# STAGE 1: Base Setup
FROM node:22-alpine AS main
WORKDIR /workstackhub/server
COPY package*.json ./
RUN npm ci

# STAGE 2: Local Development Setup
FROM main AS development
WORKDIR /workstackhub/server
COPY . .
CMD ["npm", "run", "dev"]

# STAGE 3: The Build Phase (Compile TS to JS)
FROM main AS compiling
WORKDIR /workstackhub/server
COPY . .
RUN npm run compile:ts

# STAGE 4: Final Production Phase
FROM node:22-alpine AS production
WORKDIR /workstackhub/server
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=compiling /workstackhub/server/dist ./dist
EXPOSE 4000
CMD ["npm", "run", "migrate:and:start:server"]