import { Resend } from 'resend';
import { escapeHtml, stripHtml } from './utils.js';

function renderExamples(examples) {
  if (!Array.isArray(examples) || !examples.length) {
    return '<p>No examples were provided.</p>';
  }

  return examples
    .map((example) => `<div style="margin-bottom: 12px;"><p><strong>Example</strong></p><pre style="background:#f8fafc;padding:12px;border-radius:8px;overflow:auto;">${escapeHtml(example)}</pre></div>`)
    .join('');
}

function renderStatement(statement) {
  return `<p>${escapeHtml(stripHtml(statement) || 'No statement available.')}</p>`;
}

function renderKeyTakeaways(items) {
  if (!Array.isArray(items) || !items.length) {
    return '<p>No key takeaways were generated.</p>';
  }

  const list = items.map((item) => `<li style="margin-bottom: 8px;">${escapeHtml(item)}</li>`).join('');
  return `<ul style="padding-left: 20px;">${list}</ul>`;
}

export async function sendEmail(problem, result, lastAttempt) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not set.');
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const subject = `LeetCode Mailer: ${problem.title}`;
  const attemptBlock = lastAttempt
    ? `
      <section style="margin-bottom: 24px;">
        <h3 style="margin-bottom: 8px;">My Previous Submission</h3>
        <p><strong>Status:</strong> ${escapeHtml(lastAttempt.status || 'Unknown')}</p>
        <pre style="background:#f8fafc;padding:12px;border-radius:8px;overflow:auto;"><code>${escapeHtml(lastAttempt.code || 'No code available')}</code></pre>
      </section>
    `
    : '<section style="margin-bottom: 24px;"><h3>My Previous Submission</h3><p>No previous submission found.</p></section>';

  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827; background:#f8fafc; padding:24px;">
        <div style="max-width: 860px; margin: 0 auto; background:white; border-radius: 12px; padding: 24px; box-shadow: 0 8px 24px rgba(0,0,0,0.06);">
          <h2 style="margin-top: 0;">LeetCode Mailer</h2>
          <p><strong>#${escapeHtml(problem.problemNumber || '')}</strong> · <strong>${escapeHtml(problem.title)}</strong> · ${escapeHtml(problem.difficulty || 'Unknown')} · <a href="${problem.url}">Open problem</a></p>
          <section style="margin-bottom: 24px;">
            <h3 style="margin-bottom: 8px;">Problem Statement</h3>
            ${renderStatement(problem.statement)}
          </section>
          <section style="margin-bottom: 24px;">
            <h3 style="margin-bottom: 8px;">Examples</h3>
            ${renderExamples(problem.examples || [])}
          </section>
          <section style="margin-bottom: 24px;">
            <h3 style="margin-bottom: 8px;">Constraints</h3>
            <p>${escapeHtml(stripHtml(problem.constraints) || 'No constraints provided.')}</p>
          </section>
          ${attemptBlock}
          <section style="margin-bottom: 24px;">
            <h3 style="margin-bottom: 8px;">Core Intuition</h3>
            <p>${escapeHtml(result.coreIntuition || result.approach || 'No explanation generated.')}</p>
          </section>
          <section style="margin-bottom: 24px;">
            <h3 style="margin-bottom: 8px;">How to Think About Solving It</h3>
            <p>${escapeHtml(result.thinkingProcess || 'No explanation generated.')}</p>
          </section>
          <section style="margin-bottom: 24px;">
            <h3 style="margin-bottom: 8px;">Brute Force Solution</h3>
            <p>${escapeHtml(result.bruteForceSolution || 'No explanation generated.')}</p>
          </section>
          <section style="margin-bottom: 24px;">
            <h3 style="margin-bottom: 8px;">Optimal Solution</h3>
            <p>${escapeHtml(result.optimalSolution || 'No explanation generated.')}</p>
          </section>
          <section style="margin-bottom: 24px;">
            <h3 style="margin-bottom: 8px;">Dry Run</h3>
            <p>${escapeHtml(result.dryRun || 'No dry run generated.')}</p>
          </section>
          <section style="margin-bottom: 24px;">
            <h3 style="margin-bottom: 8px;">Edge Cases</h3>
            <p>${escapeHtml(result.edgeCases || 'No edge cases generated.')}</p>
          </section>
          <section style="margin-bottom: 24px;">
            <h3 style="margin-bottom: 8px;">Time Complexity</h3>
            <p>${escapeHtml(result.timeComplexity || result.complexity?.time || 'Not provided')}</p>
          </section>
          <section style="margin-bottom: 24px;">
            <h3 style="margin-bottom: 8px;">Space Complexity</h3>
            <p>${escapeHtml(result.spaceComplexity || result.complexity?.space || 'Not provided')}</p>
          </section>
          <section style="margin-bottom: 24px;">
            <h3 style="margin-bottom: 8px;">Interview Tips</h3>
            <p>${escapeHtml(result.interviewTips || 'No interview tips generated.')}</p>
          </section>
          <section style="margin-bottom: 24px;">
            <h3 style="margin-bottom: 8px;">Final Code</h3>
            <pre style="background:#0f172a;padding:16px;border-radius:8px;overflow:auto;color:#f8fafc;"><code>${escapeHtml(result.solutionCode || '')}</code></pre>
          </section>
          <section>
            <h3 style="margin-bottom: 8px;">Key Takeaways</h3>
            ${renderKeyTakeaways(result.keyTakeaways || [])}
          </section>
        </div>
      </body>
    </html>
  `;

  return resend.emails.send({
    from: process.env.FROM_EMAIL || process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
    to: [process.env.MY_EMAIL],
    subject,
    html,
  });
}

export async function sendCompletionEmail() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not set.');
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827; padding:24px;">
        <div style="max-width: 640px; margin: 0 auto; background:white; border-radius: 12px; padding: 24px;">
          <h2>LeetCode Mailer</h2>
          <p>Congratulations! 🎉 You have completed every currently unsolved LeetCode problem in your personalized learning plan.</p>
        </div>
      </body>
    </html>
  `;

  return resend.emails.send({
    from: process.env.FROM_EMAIL || process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
    to: [process.env.MY_EMAIL],
    subject: 'LeetCode Mailer: No unsolved problems remaining',
    html,
  });
}
