# Stage 1: build
FROM public.ecr.aws/docker/library/node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Stage 2: runtime — Next.js standalone output
FROM public.ecr.aws/docker/library/node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=8181

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

# Optional runtime env: NEXT_PUBLIC_PORTAL_URL (baked at build; defaults to http://localhost:8180)
EXPOSE 8181
CMD ["node", "server.js"]
