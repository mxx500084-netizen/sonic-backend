#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Sonic Backend — Git setup + push helper for Render deployment
# Run this from inside the sonic-backend/ project folder.
# ─────────────────────────────────────────────────────────────
set -e

PROJECT_DIR="$(pwd)"
REPO_NAME="sonic-backend"

echo "📁 Project: $PROJECT_DIR"

# ── 1) Sanity checks ───────────────────────────────────────
if [ ! -f "package.json" ]; then
  echo "❌ ملفpackage.json مش موجود هنا. شغّل السكريبت من جوه فولدر المشروع (اللي فيه package.json)."
  exit 1
fi

if ! command -v git &> /dev/null; then
  echo "❌ git مش متثبت. ثبته الأول: sudo apt install git -y"
  exit 1
fi

# ── 2) Init git repo if needed ─────────────────────────────
if [ ! -d ".git" ]; then
  echo "🔧 عمل git init..."
  git init
  git branch -M main
fi

# ── 3) Make sure secrets never get committed ───────────────
if [ ! -f ".gitignore" ]; then
  cat > .gitignore << 'EOF'
node_modules/
.env
uploads/*
!uploads/.gitkeep
data/
npm-debug.log
*.log
EOF
fi

# ── 4) Commit everything ───────────────────────────────────
git add .
if git diff --cached --quiet; then
  echo "ℹ️  مفيش تعديلات جديدة يتعملها commit."
else
  git commit -m "Deploy: prep for Render"
fi

# ── 5) Create GitHub repo + push ───────────────────────────
if command -v gh &> /dev/null; then
  if ! gh auth status &> /dev/null; then
    echo "🔑 محتاج تعمل login لـ GitHub CLI الأول (هيفتح المتصفح مرة واحدة بس):"
    gh auth login
  fi

  if git remote get-url origin &> /dev/null; then
    echo "🔗 الـ remote موجود بالفعل، هعمل push..."
    git push -u origin main
  else
    echo "🚀 بعمل repo جديد على GitHub وأرفع الكود..."
    gh repo create "$REPO_NAME" --private --source=. --remote=origin --push
  fi
else
  echo "⚠️  gh (GitHub CLI) مش متثبت."
  echo "   ثبته بالأمر ده (Ubuntu/Debian):"
  echo "   sudo apt install gh -y   # أو شوف: https://cli.github.com"
  echo ""
  echo "   أو لو عندك repo جاهز على GitHub بالفعل، شغّل يدويًا:"
  echo "   git remote add origin https://github.com/<username>/$REPO_NAME.git"
  echo "   git push -u origin main"
  exit 0
fi

echo ""
echo "✅ الكود اترفع على GitHub."
echo "الخطوة الأخيرة (بره التيرمنال، مرة واحدة بس):"
echo "  1. روح https://dashboard.render.com/blueprints"
echo "  2. دوس New Blueprint Instance"
echo "  3. اختار الـ repo: $REPO_NAME"
echo "  4. Render هياخد كل الإعدادات من render.yaml تلقائيًا ويعمل deploy."
