# Maya Shadow Animation Studio

A professional 2D/2.5D animation production workspace inspired by modern animation workflows.

## Vision

Maya Shadow Animation Studio is being built as an all-in-one creative application for:

- 2D/2.5D character animation
- Character creation and reusable rigs
- Automatic rig mapping with manual correction
- Professional eye, mouth and facial expression systems
- Drawing and illustration workflows
- Background and asset creation
- Audio and video production
- AI-assisted character and asset workflows
- Timeline-based animation and scene management

## Development roadmap

Beast-mode CI validation is active for the full production pipeline, including feature contracts, web build, Windows installer, FFmpeg runtime, installed-app smoke test, and the one-minute production demo artifact.

## QA gate

Every main-branch production change must pass the automated feature contract, micro source QA, application build, production-demo render/integrity checks, packaged FFmpeg verification, Windows installer verification, and installed-app smoke test before release certification.

## Windows release status

Use the [validated v0.2.1 release](https://github.com/sakyasensingha742-hash/Maya-Shadow-Animation-Studio/releases/tag/v0.2.1) for the currently verified installer and auto-update assets. It contains the version-matched Windows installer, `latest.yml`, and the matching `.blockmap`.

**Caution:** The legacy [v1.0.0 release](https://github.com/sakyasensingha742-hash/Maya-Shadow-Animation-Studio/releases/tag/v1.0.0) currently contains an installer named for version `0.2.1` and is missing `latest.yml` and the `.blockmap`. Do not treat that release as a verified update source until its assets are deliberately corrected. Never retag or force-move an existing release tag to work around this mismatch.

See [the release checklist](docs/RELEASING.md) for the required validation and publication sequence.
