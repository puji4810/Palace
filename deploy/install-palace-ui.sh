#!/usr/bin/env bash
# Install the Palace UI client plugin into a DSH profile.
#
#   ./deploy/install-palace-ui.sh                 # profile "web", $DSH_HOME (default ~/.dsh)
#   ./deploy/install-palace-ui.sh --profile palace --dsh-home /home/puji/Palace/state
#
# The script is idempotent: it only adds the link dependency and the bundle row
# when they are missing, then refreshes the profile's node_modules. A running
# DSH instance must be restarted before the plugin is served.
set -euo pipefail

ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
PLUGIN_DIR="$ROOT/plugins/palace-ui"
PROFILE="web"
DSH_HOME_DIR="${DSH_HOME:-$HOME/.dsh}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --profile) PROFILE="$2"; shift 2 ;;
    --dsh-home) DSH_HOME_DIR="$2"; shift 2 ;;
    -h|--help) sed -n '2,10p' "$0"; exit 0 ;;
    *) echo "unknown argument: $1" >&2; exit 2 ;;
  esac
done

PROFILE_DIR="$DSH_HOME_DIR/profiles/$PROFILE"
[[ -d "$PROFILE_DIR" ]] || { echo "no such profile: $PROFILE_DIR" >&2; exit 1; }
[[ -f "$PLUGIN_DIR/client.js" ]] || {
  echo "Palace UI is not built: run 'node plugins/palace-ui/scripts/build.mjs'" >&2
  exit 1
}

echo "==> installing @local/palace-ui into $PROFILE_DIR"
node - "$PROFILE_DIR/package.json" "$PLUGIN_DIR" <<'NODE'
const fs = require('node:fs');
const [manifestPath, pluginDir] = process.argv.slice(2);
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
manifest.dependencies = manifest.dependencies || {};
manifest.dependencies['@local/palace-ui'] = `link:${pluginDir}`;
manifest.dsh = manifest.dsh || {};
manifest.dsh.profile = manifest.dsh.profile || {};
const bundles = (manifest.dsh.profile.bundles = manifest.dsh.profile.bundles || []);
if (!bundles.includes('@local/palace-ui')) bundles.push('@local/palace-ui');
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`dependencies["@local/palace-ui"] = link:${pluginDir}`);
console.log(`bundles += @local/palace-ui (${bundles.length} total)`);
NODE

echo "==> refreshing profile node_modules"
(cd "$PROFILE_DIR" && pnpm install --ignore-scripts >/dev/null)

echo
echo "Installed. Restart the DSH web process that serves this profile to load Palace UI:"
echo "  # stop the old process, then"
echo "  DSH_HOME=\"$DSH_HOME_DIR\" dsh --profile $PROFILE --port <port>"
echo
echo "Local test instance:  ./deploy/local-dev.sh restart   (profile palace, port 3082)"
