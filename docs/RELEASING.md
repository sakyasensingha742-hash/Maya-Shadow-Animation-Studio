# Windows Release Checklist

This repository publishes a Windows x64 NSIS installer through GitHub Releases and uses `electron-updater`.

## Required release sequence

1. Update `package.json` to the intended release version and commit it to `main`.
2. Create a version tag whose suffix exactly matches `package.json` (for example, package version `1.0.1` requires tag `v1.0.1`). Never retag or force-update an existing version tag.
3. Run **Desktop Release** for the matching tag, or use **Release Windows Studio** with that existing tag.
4. Confirm the build verifies the installer, `release/latest.yml`, the metadata version, at least one `.blockmap`, packaged FFmpeg (manual workflow), and the installed-app smoke test.
5. Confirm the GitHub Release contains all three asset types: the versioned `.exe`, `latest.yml`, and the matching `.blockmap`.
6. Open the release page and verify the tag, package version, installer filename, and metadata version all agree before announcing the release.

## Important safeguards

- Do not publish from a tag whose version differs from `package.json`; CI is intended to block it.
- Do not treat a successful CI artifact upload as proof that a GitHub Release was published. Tag-triggered release publication and manual artifact checks are distinct.
- Do not reuse an old installer filename for a different app version. The installer, `latest.yml`, and blockmap must come from the same build.
- Do not delete or force-move tags to work around a failed release. Correct the release assets through a controlled release operation.

## Legacy release requiring manual review

The currently published `v1.0.0` release has an asset named `Maya-Shadow-Animation-Studio-Setup-0.2.1.exe` and does not list `latest.yml` or a `.blockmap`. This is inconsistent with the `v1.0.0` tag. Do not use that release as a validated updater release until its assets are corrected or the release is otherwise deliberately retired.

The `v0.2.1` release does contain its matching `0.2.1` installer, `latest.yml`, and blockmap. Release metadata changes for an already-published release must be made through an authorized GitHub release-management operation; CI cannot retroactively repair assets merely by building a new artifact.
