FROM node:24-alpine

ARG BOS_VERSION=26.2.1
ARG BOS_SHA256=00674840bc6a520fc9a490ca083382c1b750be7f9ebe4270142ae55f0ed4e2c3

RUN apk add --no-cache --upgrade bash

ENV BOS_DEFAULT_SAVED_NODE=embassy

RUN set -eu; \
    TARBALL="balanceofsatoshis-${BOS_VERSION}.tgz"; \
    wget -qO "/tmp/${TARBALL}" "https://registry.npmjs.org/balanceofsatoshis/-/${TARBALL}"; \
    echo "${BOS_SHA256}  /tmp/${TARBALL}" | sha256sum -c -; \
    npm install -g "/tmp/${TARBALL}"; \
    rm "/tmp/${TARBALL}"

WORKDIR /root
