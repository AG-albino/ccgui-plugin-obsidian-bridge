# Obsidian Bridge 1.0.0 — by AG-albino

Created and maintained by [Artem Albino (@AG-albino)](https://github.com/AG-albino).

Adds the branded **Open in Obsidian** action between Open File and the selected editor in CC GUI's file-link context menu. Supports Unicode paths, English/Chinese/Russian labels and Windows/macOS/Linux URI launchers through the approved PluginContext process bridge.

**Draft: depends on the proposed CC GUI SDK 0.3.22 API.** Current unmodified releases cannot load this plugin. Marketplace publication is held until the host API is accepted and released. The manifest enforces the SDK minimum.

Assets are built by this repository's GitHub Actions workflow from tag `1.0.0`: `main.js`, `manifest.json`, `styles.css`, `checksums.txt` and an installable ZIP preserving the declared artwork paths. No network or storage permissions are used. Windows behavior is exercised locally; macOS/Linux launcher request generation is tested, but those operating systems have not been tested live.
