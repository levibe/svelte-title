# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2025-10-10

### Fixed

- SSR requests no longer leak title data between different users/requests
- Override mode can now be toggled on and off without getting stuck
- Empty string titles now properly clear instead of showing stale values
- Mixing explicit and auto-assigned hierarchy levels no longer causes conflicts

### Added

- New `clearTitleState()` function for custom SSR cleanup scenarios
- New `DEFAULT_SEPARATOR` constant for consistent separator usage

## [1.1.1] - 2025-07-24

### Fixed

- Titles now update correctly during client-side navigation between routes

### Added

- Better error messages when invalid props are provided

## [1.1.0] - 2025-07-24

### Added

- Server-Side Rendering (SSR) support for SvelteKit apps

## [1.0.0] - 2025-07-23

### Added

- Initial release
- Cascading title management (e.g., "Page • Section • App")
- Automatic hierarchy detection based on render order
- Override mode for standalone page titles
- Custom separator support
- Reactive title updates
- TypeScript support
