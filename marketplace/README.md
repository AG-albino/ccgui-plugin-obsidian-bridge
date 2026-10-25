# Marketplace submission — prepared, not submitted

Author: [Artem Albino (@AG-albino)](https://github.com/AG-albino).

The files in this folder pin the actual three runtime artifacts built by the successful GitHub Actions release run for tag `1.0.0`. They are prepared for [ccgui-plugins](https://github.com/zhukunpenglinyutong/ccgui-plugins), not a claim that the plugin is listed or compatible with current released hosts.

Publication is held until [desktop-cc-gui PR #1429](https://github.com/zhukunpenglinyutong/desktop-cc-gui/pull/1429) is accepted **and its host API is released**. The marketplace validator must also accept `ui:file-link-menu`; the minimal proposed contract update is included as `validator-contract.patch`.

## Prepared files

- `community-row.json`: append this row to `community-plugins.json`, sorted by id.
- `obsidian-bridge.json`: place this at `plugins/obsidian-bridge.json`.
- `validator-contract.patch`: the corresponding permission whitelist and capability scan updates; coordinate these with upstream rather than bypassing its checks.

The pinned hashes were computed from downloaded Action-generated assets, verified against the release checksums and GitHub asset digests. The installable ZIP was independently checked with Python's ZIP reader. Schema and permission/code checks passed against a local checkout of the index validator with the proposed contract update.

## After the host release

1. Confirm the final SDK number and supported host release. If upstream renumbers the API, update the plugin manifest and compatibility text, rerun tests and create a new matching version/tag through the release workflow; recompute this metadata from that Action's artifacts.
2. Exercise installation and the file-link menu in that released desktop host. Windows is the live-tested OS; macOS/Linux still need live verification.
3. Publish the prepared draft release only after compatibility is confirmed. The assets are already attached by Actions; do not replace them with local builds.
4. Add the final release timestamp as `updatedAt` if desired, then open the central-index PR. Run its full remote validation and wait for maintainer review/merge.

No recurring watcher or automatic marketplace publication has been configured.
