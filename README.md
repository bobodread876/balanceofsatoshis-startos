<p align="center">
  <img src="icon.png" alt="Balance of Satoshis Logo" width="21%">
</p>

# Balance of Satoshis on StartOS

> Everything not listed in this document should behave the same as upstream
> Balance of Satoshis. If a feature, setting, or behavior is not mentioned
> here, the upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[Balance of Satoshis](https://github.com/alexbosworth/balanceofsatoshis) (BoS) is a command-line tool for operating a self-hosted LND Lightning node — balanced channel opens, fee management, HTLC inspection, and a large set of routing and liquidity operations. This package installs the CLI, wires it to the LND on the same server, and adds an optional Telegram bot. **There is no web interface**: day-to-day use is a shell inside the container.

- **Upstream repo:** <https://github.com/alexbosworth/balanceofsatoshis>
- **Wrapper repo:** <https://github.com/Start9-Community/balanceofsatoshis-startos>

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

One image, built here rather than pulled — upstream publishes no Docker image, so the package downloads the npm release tarball, checks it against the SHA-256 pinned in the `Dockerfile`, and installs it into a Node Alpine base.

| Property      | Value                                   |
| ------------- | --------------------------------------- |
| Image         | Built from this repo's `Dockerfile`     |
| Architectures | x86_64, aarch64                         |
| Command       | `tail -f /dev/null` for the idle daemon |

| Subcontainer            | Purpose                                                                     |
| ----------------------- | --------------------------------------------------------------------------- |
| `balanceofsatoshis-sub` | Both daemons — the one to `attach` to for a `bos` shell                     |
| `bos-<command>`         | One temporary container per reporting action, named for the command it runs |

**The `primary` daemon does no work.** It runs `tail -f /dev/null` purely to keep the subcontainer alive so a user can attach a shell to it; the actual functionality is whatever `bos` command they then type. Its readiness check is the useful part — see [Health Checks](#health-checks).

BoS runs as **root** in the container. That is required, not incidental: LND's `admin.macaroon` is root-owned and not world-readable on a read-only mount, so it cannot be re-permissioned from this side.

The image's `BOS_DEFAULT_SAVED_NODE` is baked into the `Dockerfile`, not set by StartOS — the package passes no environment to the daemon at all.

## Volume and Data Layout

One volume, mounted as the container's home directory, plus a read-only view of the `admin/` tier of LND's `public` volume.

| Volume              | Mount Point | Purpose                                                          |
| ------------------- | ----------- | ---------------------------------------------------------------- |
| `main`              | `/root`     | BoS's whole home — saved nodes, tags, notes, and package state   |
| LND's `public` (ro) | `/mnt/lnd`  | Only LND's `admin/` tier: its TLS certificate and admin macaroon |

Mounting `main` at `/root` is what makes BoS's own conventions work unchanged: everything it expects under `~/.bos` is on the volume, and therefore in every backup, without the package having to relocate anything.

| Path on `main`                  | Holds                                                 |
| ------------------------------- | ----------------------------------------------------- |
| `.bos/embassy/credentials.json` | How BoS reaches LND — package-managed                 |
| `.bos/telegram_bot_api_key`     | The Telegram bot token — package-managed, read by BoS |
| `.startos/store.json`           | Package state: Telegram connect code and on/off flag  |

The saved node keeps its original name, `embassy`, so existing backups and command snippets continue to work.

## File Models

Three models, and the split between them is deliberate: two are files **BoS itself reads**, one is state only StartOS reads.

| File                            | Format | Modelled                  | Written by                             |
| ------------------------------- | ------ | ------------------------- | -------------------------------------- |
| `.bos/embassy/credentials.json` | JSON   | Yes — `FileHelper.json`   | Init and `main`                        |
| `.bos/telegram_bot_api_key`     | text   | Yes — `FileHelper.string` | The Set Telegram API Key action        |
| `.startos/store.json`           | JSON   | Yes — `FileHelper.json`   | The Connect and Enable/Disable actions |

### `credentials.json` — the package owns it, entirely

`cert_path` and `macaroon_path` are `z.literal(...).catch(...)`, so a hand-edited value is not merely overwritten on the next write — it is **repaired on read**. Point them elsewhere and they come back. This is intentional: they can only ever be the mount points of the LND dependency.

`socket` is resolved reactively rather than written once. `main` asks StartOS for LND's gRPC bridge address and chains `.const()` on the result, so the service re-runs exactly when that address changes — on LND install, uninstall, or a port reassignment — and **not** on an LND update, nor on the lock/unlock cycles that leave the binding and its assigned port intact.

When LND is absent, or present but never yet unlocked, that address resolves to nothing. The package then **clears** `socket` rather than writing a placeholder, so the failure is visible as "not ready" instead of as a connection to an address that does not exist. When LND's gRPC appears, `main` heals with a single restart.

### The Telegram files

The API key is a plain one-line file because that is what BoS reads; the connect code and the on/off flag are package state and live in `store.json`. They are split for that reason and not by preference — putting the key in `store.json` would mean writing it out to BoS's location anyway.

All three are read by `main` through `.const()`, which is what makes every Telegram action take effect without a manual restart: writing the file re-runs `main`, and `main` rebuilds the daemon set.

An absent `telegramEnabled` counts as **enabled**, so the bot starts as soon as a key exists rather than needing a second action.

## Dependencies

One, and it is required.

| Dependency | Required | Health checks required | Mounted                                           | Why                      |
| ---------- | -------- | ---------------------- | ------------------------------------------------- | ------------------------ |
| LND        | Yes      | `lnd`                  | `public` (`admin/` tier), read-only at `/mnt/lnd` | The node BoS operates on |

BoS uses LND's **admin** macaroon, so every destructive operation LND offers is available to anyone who can run `bos` here. Treat shell access to this service as equivalent to full control of the node.

The dependency is declared `kind: 'running'`, so StartOS reports it unmet unless LND is running and its `lnd` health check passes.

## Network Access and Interfaces

**None.** `setInterfaces` returns an empty array: the package binds no port and publishes no address, on LAN, Tor, or clearnet.

When upgrading a legacy installation, the package migration retires the old `main` host and frees its port.

Traffic still leaves the container in two directions — gRPC to LND over the private bridge, and, if the bot is configured, outbound HTTPS to Telegram's API. Neither is an inbound interface, so there is nothing to expose or to secure at the network layer.

Access is therefore SSH to the server plus `start-cli package attach`.

## Installation and First-Run Flow

Install seeds `credentials.json` with its fixed paths and nothing else. There is no wizard, no credential to record, and no task.

What matters is the **order**: LND must exist and have been unlocked at least once before BoS has an address to connect to. A BoS installed first is not broken — it comes up, reports not-ready, and heals on its own once LND's gRPC binding appears.

Because there is no interface, the first genuinely useful step happens outside the StartOS UI: attach a shell and run `bos peers`. An SSH key configured on the server is a prerequisite for using this package at all.

## Actions

Sixteen actions in four groups. Thirteen are read-only reporting shortcuts; three configure the Telegram bot.

### Reporting actions

**Balance & Liquidity:** Show Balance, Show Inbound Liquidity, Show Outbound Liquidity, Show Report.
**Forwards & Earnings:** Show Forwards, Show Fees Earned, Show Payments Received.
**On-chain Inspection:** Show Peers, Show UTXOs, Show Chain Fees, Show Closed Channels.
**Ungrouped:** Show Version, Show Help.

Each runs one `bos` command in a temporary container and prints its output.

- **When to run them:** to glance at node state without attaching a shell. They are a convenience, not a replacement for the CLI — every other `bos` capability is shell-only.
- **What they change:** nothing. The volume is mounted **read-only** for these, so they cannot write even by accident.
- **Cost:** one container start each, seconds. All but Show Version and Show Help are `only-running`, because they need LND.
- **Repeat safety:** fully idempotent.
- **Output shape:** the command's stdout in a read-only monospace field that keeps its line breaks, with a copy button and a download as `bos-<command>.txt`. Show Version is a single copyable line.

### Set Telegram API Key

Stores the bot token from BotFather. Run it first — the other two Telegram actions do nothing without it.

- **What it changes:** writes `~/.bos/telegram_bot_api_key`, which starts the bot daemon.
- **Repeat safety:** idempotent; the last token wins. Re-running with a different token repoints the bot.
- **What happens next:** the bot comes up unconnected, so you can message it `/connect` and receive a code.

### Connect Telegram

Saves the numeric code the bot replies with. Run it after Set Telegram API Key.

- **What it changes:** `telegramConnectCode` in the store, which restarts the bot with `--connect`.
- **Why the package stores it at all:** BoS does not persist the pairing itself, so without this the bot would need re-connecting by hand after every restart.
- **Repeat safety:** idempotent; re-runnable if you re-pair.

### Enable / Disable Telegram

One action that reads its own name from current state, so it presents as whichever the opposite of the present setting is. It asks for confirmation before it runs, naming whether the bot stops or starts.

- **Hidden until an API key exists** — there is nothing to toggle before that.
- **What it changes:** `telegramEnabled` in the store, adding or removing the bot daemon.
- **What it does not change:** the API key and connect code are kept, so re-enabling is one click rather than a re-pairing.

## Tasks

None. This package raises no tasks, so the service is never held on a prompt and its ordinary controls are always available.

## Health Checks

Two checks, and the second exists only when the bot does.

| Check      | Displayed as   | Method                                | Grace Period |
| ---------- | -------------- | ------------------------------------- | ------------ |
| `primary`  | "Command Line" | `bos peers` exits 0 in the container  | 15s          |
| `telegram` | "Telegram Bot" | `pgrep -f telegram` finds the process | 30s          |

**"Command Line" is really an LND-reachability check.** `bos peers` only succeeds if the credentials resolve and LND answers, so a failure means one of: LND not installed, LND never unlocked, or LND unreachable — not that the CLI is broken. It reports `loading` rather than `failure` in that case, so the service is not restarted while it waits for LND.

The Telegram check appears only when an API key is set and the bot is enabled. Its absence is a configuration state, not a fault.

## Backups and Restore

The `main` volume is copied wholesale — `sdk.Backups.ofVolumes('main')`. That covers saved nodes, tags, notes, the Telegram credentials, and `credentials.json`.

**BoS holds no funds.** Every satoshi is LND's; this package only operates on them. A backup of BoS restores your working setup, not your money — LND's backup is what protects the node.

A restored instance self-corrects its connection: `credentials.json` re-validates its fixed paths on read, and `socket` is re-resolved from whatever address LND has on the new box. Nothing needs re-entering, including the Telegram pairing.

## Limitations and Differences

1. **No web interface and no network interface.** The package declares none, so there is nothing to open from the StartOS UI. Everything is CLI over SSH.
2. **Root inside the container, with LND's admin macaroon.** Shell access here is full control of the Lightning node.
3. **The saved node name is fixed** as `embassy`, for backwards compatibility with the previous package generation. Additional saved nodes can be created by hand under `~/.bos/`, but the package manages only this one.
4. **The reporting actions cover a fraction of `bos`.** They are shortcuts for common read-only commands; anything else needs the shell.

---

## Quick Reference for AI Consumers

```yaml
package_id: balanceofsatoshis
image: built from ./Dockerfile # node alpine + npm balanceofsatoshis
architectures:
  - x86_64
  - aarch64
subcontainers:
  - balanceofsatoshis-sub # both daemons
  - bos-* # one temporary container per reporting action
volumes:
  main: /root # BoS home; LND's public admin/ tier is mounted read-only at /mnt/lnd
file_models:
  - .bos/embassy/credentials.json
  - .bos/telegram_bot_api_key
  - .startos/store.json
startos_managed_env_vars: [] # BOS_DEFAULT_SAVED_NODE is baked into the image
dependencies:
  - lnd # required, kind: running
interfaces: {} # none declared
actions:
  - show-balance
  - show-inbound-liquidity
  - show-outbound-liquidity
  - show-report
  - show-forwards
  - show-fees-earned
  - show-payments-received
  - show-peers
  - show-utxos
  - show-chain-fees
  - show-closed-channels
  - telegram-api-key
  - telegram-connect
  - telegram-toggle # hidden until an API key is set
  - show-version
  - show-help
tasks: []
health_checks:
  - primary # displayed "Command Line"; runs `bos peers`
  - telegram # displayed "Telegram Bot"; present only when the bot is configured
```
