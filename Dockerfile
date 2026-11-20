FROM node:24-alpine

ARG BOS_VERSION=25.0.0
ARG BOS_SHA256=c8dc6145b65a6202c25b6cef4feac697d5194888c1f964c5fe14089ddef1ed5b

RUN apk add --no-cache --upgrade bash

ENV BOS_DEFAULT_SAVED_NODE=embassy

RUN set -eu; \
    TARBALL="balanceofsatoshis-${BOS_VERSION}.tgz"; \
    wget -qO "/tmp/${TARBALL}" "https://registry.npmjs.org/balanceofsatoshis/-/${TARBALL}"; \
    echo "${BOS_SHA256}  /tmp/${TARBALL}" | sha256sum -c -; \
    npm install -g "/tmp/${TARBALL}"; \
    rm "/tmp/${TARBALL}"

WORKDIR /root
