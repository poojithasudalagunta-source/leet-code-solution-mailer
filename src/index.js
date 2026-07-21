import 'dotenv/config';
import { getUnsolvedProblems, getProblemDetails, getLastAttempt } from './leetcode.js';
import { getNextUnsentProblem, loadProgress, markAsSent } from './tracker.js';
import { generateSolution } from './agent.js';
import { sendCompletionEmail, sendEmail } from './email.js';

async function ensureRequiredEnv() {
  const required = ['LEETCODE_SESSION', 'GROQ_API_KEY', 'RESEND_API_KEY', 'MY_EMAIL'];
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

async function main() {
  try {
    await ensureRequiredEnv();
    console.log('Starting...');

    const progress = await loadProgress();
    console.log(`Loaded progress with ${progress.sentSlugs?.length || 0} previously emailed problems.`);

    const unsolvedProblems = await getUnsolvedProblems();
    console.log(`Fetched ${unsolvedProblems.length} unsolved problems.`);

    const nextProblem = await getNextUnsentProblem(unsolvedProblems);
    if (!nextProblem) {
      console.log('No remaining unsent problems. Sending congratulatory email.');
      await sendCompletionEmail();
      console.log('Completion email sent.');
      return;
    }

    console.log(`Next problem: ${nextProblem.slug}`);

    const [problemDetails, lastAttempt] = await Promise.all([
      getProblemDetails(nextProblem.slug),
      getLastAttempt(nextProblem.slug),
    ]);

    console.log('Generating explanation...');
    const result = await generateSolution(problemDetails, lastAttempt);

    console.log('Sending email...');
    await sendEmail(problemDetails, result, lastAttempt);
    await markAsSent(nextProblem.slug);

    console.log('Success');
    console.log(`Progress updated for ${nextProblem.slug}.`);
 } catch (error) {
  console.error("Full error:");
  console.error(error);
  console.error(error.stack);
  process.exitCode = 1;
}
}

main();
