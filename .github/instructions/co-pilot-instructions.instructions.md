# Copilot Instructions

## General
- Be concise and practical.
- Do not explain code unless asked.
- Before making changes, inspect only the files relevant to the task.
- Do not scan the entire repository unless necessary.
- Reuse existing code and components instead of creating duplicates.
- Do not install new packages unless required.
- Do not rewrite working code unnecessarily.

## Changes
- Make the smallest change that fully solves the problem.
- Preserve the existing architecture and functionality.
- Do not modify unrelated files.
- If the requested change is unclear, ask one concise question before coding.
- Prefer fixing the root cause rather than adding workarounds.

## Debugging
- Identify the likely cause first.
- Inspect relevant files, configuration, and error messages only.
- Make one focused fix at a time.
- Do not refactor unrelated code.

## Testing
- Run the most relevant existing test/build/lint command after changes.
- Do not create new tests unless necessary or requested.
- If a command fails, fix the specific issue rather than changing unrelated code.

## Response
- Briefly state what you changed.
- List modified files.
- Mention any remaining issue.
- Do not provide long explanations unless requested.

## Context Efficiency
- Prefer targeted file searches over reading large files.
- Do not repeatedly reread files already inspected.
- Do not include unnecessary code in responses.
- Keep responses concise.