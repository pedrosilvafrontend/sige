#!/bin/sh
set -eu

OUTPUT_FILE="public/version.json"

read_existing_field() {
  field="$1"
  if [ -f "$OUTPUT_FILE" ]; then
    sed -n "s/.*\"$field\"[[:space:]]*:[[:space:]]*\"\\([^\"]*\\)\".*/\\1/p" "$OUTPUT_FILE" | head -n 1
  fi
}

RELEASE_VERSION="${RELEASE_VERSION:-}"
if [ -z "$RELEASE_VERSION" ]; then
  RELEASE_VERSION="$(git describe --tags --abbrev=0 2>/dev/null || true)"
fi
if [ -z "$RELEASE_VERSION" ]; then
  RELEASE_VERSION="$(read_existing_field version)"
fi
if [ -z "$RELEASE_VERSION" ]; then
  RELEASE_VERSION="0.0.0-dev"
fi

COMMIT_SHA="${COMMIT_SHA:-${GITHUB_SHA:-}}"
if [ -z "$COMMIT_SHA" ]; then
  COMMIT_SHA="$(git rev-parse --short HEAD 2>/dev/null || true)"
fi
if [ -z "$COMMIT_SHA" ]; then
  COMMIT_SHA="$(read_existing_field commit)"
fi
if [ -z "$COMMIT_SHA" ]; then
  COMMIT_SHA="unknown"
fi
COMMIT_SHA="$(printf '%s' "$COMMIT_SHA" | cut -c1-7)"

BUILD_TIME_UTC="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

cat > "$OUTPUT_FILE" <<EOF
{
  "version": "$RELEASE_VERSION",
  "commit": "$COMMIT_SHA",
  "builtAt": "$BUILD_TIME_UTC"
}
EOF

echo "Generated $OUTPUT_FILE with version=$RELEASE_VERSION commit=$COMMIT_SHA"
