#!/bin/bash
set -eu
bos --version

# Preserve a saved node if the operator has customized its credentials.
umask 077
mkdir -p /root/.bos/embassy
if [[ ! -e /root/.bos/embassy/credentials.json ]]; then
    cp /credentials.json /root/.bos/embassy/credentials.json
fi

while true; do
    bos peers || echo "Waiting for LND to respond" >&2
    sleep 20000
done
