FROM node:24-alpine

# arm64 or amd64
ARG PLATFORM
ARG ARCH

RUN apk add --no-cache --upgrade bash

ENV BOS_DEFAULT_SAVED_NODE=embassy
ARG BOS_VERSION=26.2.1
ARG BOS_SHA256=00674840bc6a520fc9a490ca083382c1b750be7f9ebe4270142ae55f0ed4e2c3
RUN set -eu; \
    tarball="/tmp/balanceofsatoshis-${BOS_VERSION}.tgz"; \
    wget -qO "$tarball" "https://registry.npmjs.org/balanceofsatoshis/-/balanceofsatoshis-${BOS_VERSION}.tgz"; \
    echo "${BOS_SHA256}  ${tarball}" | sha256sum -c -; \
    npm install -g "$tarball"; \
    test "$(bos --version)" = "$BOS_VERSION"; \
    rm "$tarball"

WORKDIR /balanceofsatoshis/

ADD credentials.json /credentials.json
ADD ./docker_entrypoint.sh /usr/local/bin/docker_entrypoint.sh
ADD check-cmd.sh /usr/local/bin/check-cmd.sh
RUN chmod a+x /usr/local/bin/*.sh
