# Security Policy

Security updates apply to the latest code on `main`. Use GitHub private vulnerability reporting for command injection, argument-validation bypasses, credential exposure, unsafe destructive actions, dependency compromise, or sensitive-data persistence. Do not open a public issue until a coordinated fix is available.

Include the affected revision, operating system, redacted reproduction steps, potential impact, and a mitigation if known. Never include tokens, secret values, private repository data, or unredacted local paths.

GitHub CLI Manager delegates authentication to the local `gh` installation and must not store GitHub credentials. The Electron renderer is untrusted relative to the main process; all commands must be allowlisted, validated, previewed, and executed as argument arrays without a shell. Destructive actions require explicit confirmation, and Activity records must omit secrets and sensitive environment data.
