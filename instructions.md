# Welcome to Balance of Satoshis

### This is a tool for working with the balance of your satoshis on LND

**Balance of Satoshis is command-line only service; an SSH Key is required to use this service.**

## Setup

Please note: for EOS v0.3.1 and above the default ssh user has changed from "root" to "start9", you will need to add `sudo` to the beginning of each command below.

> 1. SSH into this Embassy (add a new SSH Key if needed)
>
> 2. Run the following command to enter the `balanceofsatoshis.embassy` container:
>
>    `sudo podman exec -it balanceofsatoshis.embassy /bin/bash`

**You should now be able to run Balance of Satoshis commands.**

## Run the command `bos help` for more information.

## Upgrading to 26.2.1

Updates from Marketplace 18.2.9 and Community Beta 19.5.5 retain the BOS
settings and saved nodes under `/root/.bos`. The GitHub release tagged
`v19.5.0` also appears as 19.5.5 in StartOS.

Before stopping BOS or updating LND, finish or recover any pending swaps
started with `bos swap-in` or `bos increase-inbound-liquidity`. The new
`swap-in` and `swap-out` commands cannot use those recovery codes.
Upstream specifies BOS 25.7.0 for refunding older swap-ins.
[Upstream breaking changes](https://github.com/alexbosworth/balanceofsatoshis/blob/v26.2.1/CHANGELOG.md#2601)

Back up BOS and stop it before updating. The older packages require an older
LND version. With BOS stopped, update LND to a supported release
(0.20.0–0.20.8 or 0.21.0–0.21.8), then update BOS. Start BOS once LND is
running and unlocked. Check the installed version with `bos --version` and
confirm that `bos peers` connects to the node.
