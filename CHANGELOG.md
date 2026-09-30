# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/).

## [0.1.0] - 2026-09-30

### Added

- Streaming chat through an Expo API route with the AI SDK and AI Gateway
- Per-conversation model switching (Claude Sonnet 5.5, GPT-5.5, Gemini 3.5 Flash)
- Demo mode that streams through the real pipeline when no key is configured
- Request validation: model allow-list, size limits, no client system messages
- Stream-tolerant markdown rendering with copyable code blocks
- Local conversation history with automatic titles
- Read-aloud, copy and regenerate actions
- CI with format, lint, typecheck, tests with coverage thresholds, expo-doctor and web export
- Maestro end-to-end flow
