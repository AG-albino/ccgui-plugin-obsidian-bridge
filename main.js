// Obsidian Bridge for CC GUI. Created and maintained by Artem Albino (@AG-albino).
// MIT licensed source. No runtime imports, host internals, network or storage.

const LABELS = {
  en: 'Open in Obsidian',
  zh: '在 Obsidian 中打开',
  ru: 'Открыть в Obsidian',
};

export function createObsidianUri(path) {
  if (typeof path !== 'string' || !/^(?:[A-Za-z]:[\\/]|\/|\\\\)/.test(path)) {
    throw new Error('Obsidian Bridge requires an absolute file path.');
  }
  // Apostrophes are allowed by encodeURIComponent, but must remain encoded
  // when the resulting URI is handed to the Windows launcher.
  return `obsidian://open?path=${encodeURIComponent(path).replace(/'/g, '%27')}`;
}

export function createLaunchRequest(platform, uri) {
  if (!/^obsidian:\/\/open\?path=[A-Za-z0-9%_.!~*()-]+$/.test(uri)) {
    throw new Error('Obsidian Bridge received an invalid open URI.');
  }
  if (/^win/i.test(platform)) {
    // The script contains only fixed ASCII plus a strictly encoded URI.
    // PowerShell -EncodedCommand expects UTF-16LE, not UTF-8.
    const script = `Start-Process -FilePath '${uri}' -ErrorAction Stop`;
    const encoded = btoa(Array.from(script, character => character + '\0').join(''));
    return {
      bin: 'powershell',
      args: ['-NoProfile', '-NonInteractive', '-WindowStyle', 'Hidden', '-EncodedCommand', encoded],
    };
  }
  if (/mac|darwin/i.test(platform)) return { bin: 'open', args: [uri] };
  if (/linux/i.test(platform)) return { bin: 'xdg-open', args: [uri] };
  throw new Error('Obsidian Bridge does not support this operating system.');
}

// Embedded Obsidian brand asset; its attributed source is in docs/obsidian.png.
const OBSIDIAN_ICON = 'data:image/png;base64,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';

export default function activate(ctx, environment = {}) {
  if (typeof ctx.ui.registerFileLinkMenuItem !== 'function') {
    throw new Error('Obsidian Bridge requires CC GUI SDK 0.3.22 with registerFileLinkMenuItem. The upstream API is pending.');
  }
  const platform = environment.platform ?? globalThis.navigator?.platform ?? '';
  const language = () => (environment.language ?? ctx.host.locale ?? 'en').toLowerCase().split(/[-_]/)[0];
  const h = ctx.react.createElement;
  function ObsidianIcon({className}) {
    return h('img', {src: OBSIDIAN_ICON, alt: '', className, 'aria-hidden': true});
  }
  // The host owns resolving paths, placement, dismissal and unregistering.
  ctx.ui.registerFileLinkMenuItem({
    key: 'open',
    label: () => LABELS[language()] ?? LABELS.en,
    icon: ObsidianIcon,
    visible: () => !ctx.host.isWeb,
    order: 0,
    async run(target) {
      if (!target.resolvedPath) throw new Error('Obsidian Bridge requires a resolved file path.');
      const request = createLaunchRequest(platform, createObsidianUri(target.resolvedPath));
      // A GUI application must outlive the launcher and the plugin. exec_run
      // owns and reaps its process tree, so use the explicit detached bridge.
      await ctx.bridge.invoke('plugin_exec_spawn', {...request, lifecycle: 'detached'});
    },
  });
}
