<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Verification Preference

Do not run tests or lint commands unless the user explicitly asks for them.
After code changes, inspect the relevant source code and changed diff directly to check for obvious bugs, unused imports, broken JSX, incorrect routing assumptions, and mismatches with the requested behavior.
