import OpenAI from 'openai';
import { parseJsonResponse } from './utils.js';

const MODEL_NAME = 'llama-3.3-70b-versatile';

function preferredLanguage(lastAttempt) {
  return lastAttempt?.language || 'Python';
}

export async function generateSolution(problem, lastAttempt) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set.');
  }

  const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
  });

  const language = preferredLanguage(lastAttempt);
  const diagnosis = lastAttempt
    ? 'The previous attempt likely failed because it missed an important edge case or did not preserve the intended invariant.'
    : 'No previous attempt found.';

  const prompt = `
You are a premium LeetCode tutor.
Problem title: ${problem.title}
Problem number: ${problem.problemNumber || 'Unknown'}
Problem statement: ${problem.statement}
Constraints: ${problem.constraints || 'None provided'}
Examples: ${JSON.stringify(problem.examples || [])}
Previous attempt: ${lastAttempt ? JSON.stringify(lastAttempt, null, 2) : 'None'}

Return valid JSON only in this exact structure:
{
  "diagnosis": "${diagnosis}",
  "approach": "A concise summary of the overall strategy",
  "complexity": { "time": "O(...)", "space": "O(...)" },
  "solutionCode": "Full working solution in ${language}",
  "coreIntuition": "A beginner-friendly explanation of the main insight",
  "thinkingProcess": "A clear explanation of how to reason through the problem from brute force to the optimized approach",
  "bruteForceSolution": "A description of the naive approach, its drawbacks, and its complexity",
  "optimalSolution": "A detailed explanation of the optimal approach and why it works",
  "dryRun": "A step-by-step walkthrough of the sample or a representative example",
  "edgeCases": "A list of important edge cases and why they matter",
  "timeComplexity": "A detailed explanation of why the time complexity is what it is",
  "spaceComplexity": "A detailed explanation of why the space complexity is what it is",
  "interviewTips": "Why this problem is asked in interviews, common mistakes, and likely follow-up questions",
  "keyTakeaways": ["bullet 1", "bullet 2", "bullet 3"]
}
Rules:
- If a previous attempt exists, explain why it likely failed in a supportive way.
- Otherwise say \"No previous attempt found.\"
- Do not wrap the JSON in markdown or code fences.
- Do not include any extra commentary.
`;

  try {
    const response = await client.chat.completions.create({
      model: MODEL_NAME,
      temperature: 0.2,
      response_format: {
        type: 'json_object',
      },
      messages: [
        {
          role: 'system',
          content: 'You are an expert competitive programming tutor. Always return valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const rawText = response.choices[0].message.content;
    return parseJsonResponse(rawText);
  } catch (error) {
    throw new Error(`Groq request failed: ${error.message || error}`);
  }
}
