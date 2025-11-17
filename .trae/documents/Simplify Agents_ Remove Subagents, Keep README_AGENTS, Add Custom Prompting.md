## Goal
- Keep `AGENTS.md` and `README.md` subagents unchanged
- Allow main agent to call them with user-provided custom instructions
- Remove the interactive agents menu and the agent-creator

## Changes
- Remove menu and creator:
  - Delete `src/commands/agents-menu.js`
  - Delete `src/sub-agents/agents/agent-creator.js`
  - Delete `src/sub-agents/agents/marker-file-creator.js`
  - Remove menu exports from `src/sub-agents/index.js` (lines `src/sub-agents/index.js:8-9`)
  - Update `src/constants/prompts.js` to remove `/agents` references (lines `src/constants/prompts.js:70-85`)

- Expose subagent tools to main agent:
  - In `src/commands/chat.js`, combine tools:
    - Replace `const tools = getToolsForContext('main')` (`src/commands/chat.js:62`) with `const tools = [...getToolsForContext('main'), ...getAllSubAgentTools()]`
  - Handle subagent tool calls:
    - On tool names `run_<agentId>`, fetch config via `autoAgentRegistry.getAgent(agentId)` and execute:
      - `genericAgentExecutor.execute(agentConfig, { projectContext: session.fullProjectContext, modelInfo: currentModelInfo, apiKey: currentApiKey }, parameters.customInstructions)`
    - Preserve concurrent execution path using `SubAgentManager` when multiple subagent tools are called together

- Pass user context (custom instructions):
  - Ensure the `parameters.customInstructions` from the tool call is forwarded exactly to `genericAgentExecutor.execute(...)` (see injection point around `src/commands/chat.js:216-224` in current batching logic; adapt single-call path at `src/commands/chat.js:274-276`)

## Validation
- Type a user message: "Create a README; keep it really short" and confirm the model calls `run_readme_md` with `customInstructions: "keep it really short"`, and the subagent writes `README.md`
- Repeat for `AGENTS.md` with a custom instruction (e.g., repeat "luka" 10 times)
- Confirm no menu or creator references remain

## Notes
- Subagents used as-is:
  - `src/sub-agents/agents/readme-md.js`
  - `src/sub-agents/agents/agents-md.js`
- No changes to their prompts; only wiring to pass `customInstructions` from main agent calls