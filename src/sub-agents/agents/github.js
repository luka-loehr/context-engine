export const agentConfig = {
  id: 'github',
  name: 'GitHub',
  description: 'Git and GitHub analysis using terminal commands',
  category: 'analysis',
  icon: '🔎',
  tools: ['terminal', 'statusUpdate'],
  systemPrompt: `You analyze git repositories and GitHub data by running terminal commands.`,
  defaultInstructions: `Answer the user's question by running whatever git or gh commands you need via the terminal tool, then parse the output to give a clear answer.`
};