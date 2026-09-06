# Security

## Reporting

Open a private security advisory on this repository, or email shailesh93602@gmail.com.

## Known unfixed advisories

`npm audit` on this repo currently reports **4 high advisories, all in the `prisma` CLI
package**. They are left unfixed deliberately. What they are, and why:

| Advisory                                                                                                          | Path                                         | Reachable at runtime?                                                                                                                                                   |
| ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`mysql2`](https://github.com/advisories/GHSA-3f6p-5ww8-9rcr) — auth-plugin downgrade leaks plaintext credentials | `prisma` → `mysql2`                          | **No.** This app is PostgreSQL (`provider = "postgresql"`, `@prisma/adapter-pg`). `mysql2` is bundled by the Prisma CLI for its MySQL support and is never loaded here. |
| [`mysql2`](https://github.com/advisories/GHSA-rgwj-5xj2-c3m3) — decompression-bomb DoS                            | `prisma` → `mysql2`                          | **No.** Same reason.                                                                                                                                                    |
| [`deepmerge-ts`](https://github.com/advisories/GHSA-ggr8-5vv4-36mx) — stack exhaustion on recursive object graphs | `prisma` → `@prisma/config` → `deepmerge-ts` | **No.** Reached only when the Prisma CLI parses `prisma.config.ts` at build/dev time, over a config file that is committed to this repo — not attacker-controlled.      |
| `@prisma/config` / `prisma`                                                                                       | aggregates of the two above                  | **No.**                                                                                                                                                                 |

**Why they are not fixed:** the advisory range for `prisma` is `>=6.13.0-dev.1` with no upper
bound, so no patched 7.x release exists. `npm audit fix --force` proposes `prisma@6.19.3`, which is
a **major downgrade** of the ORM and incompatible with the `@prisma/client@^7.5.0` this app runs
against. Downgrading a working, current ORM to silence a CLI-only advisory would make the app less
safe, not more. These clear when Prisma ships a patched 7.x.

**What runs in production:** `@prisma/client` + `@prisma/adapter-pg`, neither of which carries an
advisory. The `prisma` package is a build-time tool here (`postinstall: prisma generate`); it is
never imported by application code.

## Everything else

All other advisories are fixed as of this commit — including the previously-reported critical
(`vitest` UI arbitrary file read) and the `next` / `postcss` / `sharp` highs.
