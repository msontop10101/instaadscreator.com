FROM node:24-alpine
WORKDIR /app
# lockfile intentionally excluded: npm 11 lockfiles written on macOS trip an
# arborist "Invalid Version" bug when resolving sharp's platform optionals in
# alpine. Container resolves fresh from package.json ranges instead.
COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund
COPY . .
ENV NODE_ENV=production DATA_DIR=/data
EXPOSE 4000
CMD ["node", "server.js"]
