# Build stage
FROM node:20-bookworm AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runtime stage
FROM node:20-bookworm-slim
WORKDIR /app

RUN addgroup --system nr31 && adduser --system --ingroup nr31 nr31

RUN npm install -g serve

USER nr31:nr31

COPY --from=builder --chown=nr31:nr31 /app/dist ./dist

ENTRYPOINT ["serve", "-s", "dist", "-l", "3000"]
