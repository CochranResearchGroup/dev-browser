#!/usr/bin/env python3
"""Validate active policy wiring, identities, and the bounded planning contract."""
import json
from pathlib import Path
import re
import subprocess
import sys

root = Path(__file__).resolve().parents[1]
selector = root / '.agents/skills/repo-policy-selector'
policies = sorted((root / 'docs/dev/policies').glob('*.md'))
text = (root / 'AGENTS.md').read_text()
identities = [re.sub(r'^\d+-', '', p.stem) for p in policies]
assert len(identities) == len(set(identities)), 'Duplicate policy identity'
for policy in policies:
    relative = policy.relative_to(root).as_posix()
    assert text.count(relative) == 1, f'Policy must be wired exactly once: {relative}'
for pointer in re.findall(r'\]\((docs/dev/policies/[^)]+)\)', text):
    assert (root / pointer).is_file(), f'Missing policy: {pointer}'
for options in [[], ['--active-only']]:
    subprocess.run([sys.executable, str(selector / 'scripts/audit_planning_contract.py'),
                    '--repo-root', str(root), *options, '--json'], check=True)
selection = json.loads(subprocess.check_output([
    sys.executable, str(selector / 'scripts/select_policy.py'), '--repo-root', str(root),
    '--policy-root', str(selector / 'policy-library'), '--json'], text=True))
assert not selection.get('validation_problems'), selection.get('validation_problems')
assert selection['memory_discovery']['repo_default'] == 'use'
print(f'PASS: {len(policies)} uniquely wired policies; full/active planning audits; Graphiti routing')
