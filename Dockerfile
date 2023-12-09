FROM oven/bun:1 AS builder
WORKDIR /app
COPY . .
RUN bun install
RUN bun build

FROM builder
COPY --from=builder dist dist
 
CMD ["node", "dist/main.js"]