#!/bin/bash
# ==============================================================================
# TASK CONTROL — VPS Deployment & Online Update Automation Script
# ==============================================================================

set -e

APP_DIR="/opt/taskmanager"
REPO_URL="https://github.com/azamatsharipov1992-crypto/taskmanager.git"

echo "=========================================================="
echo "🚀 TASK CONTROL — Server Deployment & Online Update"
echo "=========================================================="

case "$1" in
  install)
    echo "📦 Yangi serverga o'rnatish boshlanmoqda..."
    sudo apt-get update
    sudo apt-get install -y docker.io docker-compose git curl nginx certbot python3-certbot-nginx
    sudo systemctl enable --now docker

    if [ ! -d "$APP_DIR" ]; then
      sudo git clone "$REPO_URL" "$APP_DIR"
      sudo chown -R $USER:$USER "$APP_DIR"
    fi

    cd "$APP_DIR"
    if [ ! -f "backend/.env" ]; then
      cp backend/.env.example backend/.env
      echo "⚠️ backend/.env namunadan yaratildi. Sozlamalarni tekshiring!"
    fi

    docker-compose down || true
    docker-compose up --build -d
    echo "✅ Tizim muvaffaqiyatli ishga tushirildi!"
    ;;

  update)
    echo "🔄 Loyihani onlayn yangilash (Online Update)..."
    cd "$APP_DIR"
    git fetch origin
    git reset --hard origin/main
    docker-compose down
    docker-compose up --build -d
    echo "✅ Loyiha eng so'nggi versiyaga yangilandi va konteynerlar qayta ishga tushirildi!"
    ;;

  status)
    echo "📊 Konteynerlar holati:"
    cd "$APP_DIR"
    docker-compose ps
    ;;

  logs)
    cd "$APP_DIR"
    docker-compose logs -f --tail=100
    ;;

  *)
    echo "Foydalanish: $0 {install|update|status|logs}"
    echo "  install : Serverga Docker va tizimni to'liq o'rnatish"
    echo "  update  : Git-dan yangi kodni tortib olib, onlayn yangilash"
    echo "  status  : Ishlayotgan xizmatlar holatini ko'rish"
    echo "  logs    : Jonli loglarni kuzatish"
    exit 1
    ;;
esac
