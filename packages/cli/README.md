# @fledge/cli

CLI and shared tooling for [Fledge](https://github.com/fledge-build/fledge-build) skill packages. Provides the `fledge` binary used by skill packages to install themselves into consuming projects.

## Usage

This package is not installed directly. Skill packages (e.g. `@fledge/vue`) declare it as a dependency and call it from their `postinstall` script:

```json
{
  "dependencies": {
    "@fledge/cli": "..."
  },
  "scripts": {
    "postinstall": "fledge install-skill"
  }
}
```

## Commands

### `fledge install-skill [packageDirectory]`

Copies the `skill/` directory from a skill package into the consuming project's skills directory, namespaced by package name. A `.gitignore` is written so the installed files are not committed.

| Option     | Description                                       |
| ---------- | ------------------------------------------------- |
| `--global` | Install to the home directory instead of the project |
