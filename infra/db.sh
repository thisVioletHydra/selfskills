#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$ROOT/infra/docker-compose.yml"
CMD="${1:-}"

require() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "❌ не найден $1"
    exit 1
  fi
}

usage() {
  echo "usage: pnpm db <up|down|destroy>"
  exit 1
}

[[ -n "$CMD" ]] || usage

require docker-compose

case "$CMD" in
  up)
    require colima
    if ! colima status >/dev/null 2>&1; then
      echo "→ colima start"
      colima start
    else
      echo "→ colima уже running"
    fi

    echo "→ postgres foreground (Ctrl+C = stop)"
    trap 'echo ""; echo "→ postgres stopped"' INT
    docker-compose -f "$COMPOSE_FILE" up
    ;;

  down)
    echo "→ postgres down"
    docker-compose -f "$COMPOSE_FILE" down
    echo "✓ done"
    ;;

  destroy)
    echo "→ postgres destroy (volume wipe, данные под ноль)"
    docker-compose -f "$COMPOSE_FILE" down -v
    echo "✓ done"
    ;;

  *)
    usage
    ;;
esac
