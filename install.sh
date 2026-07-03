#!/usr/bin/env sh
set -eu

if [ "${A47_RELEASE_BASE_URL:-}" = "" ]; then
  echo "Set A47_RELEASE_BASE_URL to the release asset base URL before running this installer."
  echo "Example: A47_RELEASE_BASE_URL=https://github.com/OWNER/a47-p2p/releases/latest/download ./install.sh"
  exit 1
fi

install_dir="${A47_INSTALL_DIR:-$HOME/.local/bin}"
platform="$(uname -s)"
architecture="$(uname -m)"

case "$platform:$architecture" in
  Linux:x86_64)
    asset_name="a47-linux-x64"
    ;;
  Darwin:x86_64)
    asset_name="a47-macos-x64"
    ;;
  Darwin:arm64)
    asset_name="a47-macos-arm64"
    ;;
  *)
    echo "Unsupported platform: $platform $architecture"
    exit 1
    ;;
esac

mkdir -p "$install_dir"
curl -fsSL "$A47_RELEASE_BASE_URL/$asset_name" -o "$install_dir/a47"
chmod +x "$install_dir/a47"

echo "A47 installed at $install_dir/a47"
echo "Make sure $install_dir is in your PATH."
