FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases .yarn/releases
COPY packages ./packages

RUN yarn install

RUN yarn workspace @quizzmaster-backend/prisma run pnpify prisma generate

RUN yarn install

ARG SERVICE_NAME
ENV SERVICE_NAME=${SERVICE_NAME}

CMD ["sh", "-c", "yarn workspace @quizzmaster-backend/${SERVICE_NAME} run start"]