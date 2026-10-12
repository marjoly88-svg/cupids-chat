#!/bin/bash
# Cloudflare Pages のビルド。配信してよいものだけを dist に入れる
set -e
rm -rf dist && mkdir dist
cp *.html *.js *.png manifest.json dist/
rm -f dist/build.sh
