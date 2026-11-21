# STRIKE 5 — Mobile FPS Playtest

Original experimental 5v5 bot shooter prototype (12 Indian operators, 17 fictional weapons). iOS: PWA. Android: debug APK via GitHub Actions (not yet built). This is not an official COD product.

Live iOS PWA: https://strike5-playtest.addachai03.workers.dev/

## Android test build
Workflow `.github/workflows/android-debug-apk.yml` will install Node 22 / Android tools and generate `app-debug.apk` as an Actions artifact. Debug build is NOT a production-signed release.

**Limitations:** bot-only, placeholder models, CDN-dependent Babylon engine, no verified iPhone or Android FPS numbers, no real 5v5 network multiplayer.
