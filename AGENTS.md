# AGENTS.md

## Project overview
- Backend: Java 17, Maven, Spring Boot / Spring Cloud
- Frontend: Vue3 + pnpm
- DB: MySQL
- Registry/config: Nacos

## Rules
- Do not change package structure unless required
- Prefer incremental changes
- Keep old APIs backward compatible
- Add tests for new service logic when possible
- Never modify production config files directly

## Common commands
- Backend build: mvn -q -DskipTests package
- Backend test: mvn test
- Frontend install: pnpm install
- Frontend build: pnpm build

## Scope rules
- For backend tasks, change only affected modules
- For frontend tasks, do not redesign unrelated pages