#!/bin/bash
cd "$(dirname "$0")"
git add .
if [ -n "$1" ]; then
  git commit -m "$1"
else
  git commit -m "Update blog"
fi
git push
