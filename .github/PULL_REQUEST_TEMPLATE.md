## Summary
<!-- Briefly describe what this pull request changes and why. -->

## Related Issues
<!-- Reference related issues, e.g., Closes #12 -->

## Changes Made
- [ ] Core implementation updated
- [ ] Unit / regression tests added or updated
- [ ] Documentation (`README.md` / `docs/`) updated

## Verification
```bash
uv sync --extra dev
uv run ruff check src tests
uv run mypy src
uv run pytest -v
```

## Security & Compatibility Checklist
- [ ] No secrets, tokens, or PII committed
- [ ] Backward compatibility preserved (or breaking change documented in `CHANGELOG.md`)
