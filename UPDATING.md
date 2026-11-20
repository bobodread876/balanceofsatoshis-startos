# Updating the upstream version

Balance of Satoshis is installed into the image at build time from its npm release tarball, which `Dockerfile` checks against a pinned SHA-256 before `npm install -g`. There is no `dockerTag` in the manifest — the image is built fresh from `Dockerfile`.

## Determining the upstream version

- **npm** ([balanceofsatoshis](https://www.npmjs.com/package/balanceofsatoshis)) — what the Dockerfile's `npm install` actually resolves against:
  ```
  npm view balanceofsatoshis version
  ```
- **GitHub tags** ([alexbosworth/balanceofsatoshis](https://github.com/alexbosworth/balanceofsatoshis)) — upstream tags the npm publish corresponds to (no GitHub Releases are cut; tags are the only source-side signal):
  ```
  gh api repos/alexbosworth/balanceofsatoshis/tags --jq '.[0].name'
  ```

The pin is the `BOS_VERSION` and `BOS_SHA256` args at the top of `Dockerfile`.

## Applying the bump

- `Dockerfile` — set `BOS_VERSION` to the new version (drop any `v` prefix from the GitHub tag; npm versions are bare).
- `Dockerfile` — set `BOS_SHA256` to the SHA-256 of that version's registry tarball. Download it, hash it, and check it against the integrity npm publishes before pinning:
  ```
  curl -fsSLO https://registry.npmjs.org/balanceofsatoshis/-/balanceofsatoshis-<version>.tgz
  sha256sum balanceofsatoshis-<version>.tgz
  npm view balanceofsatoshis@<version> dist.integrity   # must equal the next line's output
  echo "sha512-$(openssl dgst -sha512 -binary balanceofsatoshis-<version>.tgz | base64 -w0)"
  ```
