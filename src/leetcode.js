import { LeetCode, Credential } from 'leetcode-query';

let cachedClient = null;

function normalizeStatus(status) {
  if (!status) return '';
  return String(status).toLowerCase();
}

function isAccepted(status) {
  return normalizeStatus(status).includes('accepted');
}

export async function getLeetCodeClient() {
  if (cachedClient) return cachedClient;

  const sessionCookie = process.env.LEETCODE_SESSION;
  if (!sessionCookie) {
    throw new Error('LEETCODE_SESSION is not set.');
  }

  const credential = new Credential();
  await credential.init(sessionCookie);
  cachedClient = new LeetCode(credential);
  return cachedClient;
}

function toProblemObject(question) {
  return {
    slug: question.titleSlug,
    title: question.title || question.titleSlug,
    difficulty: question.difficulty || 'Unknown',
    problemNumber: question.questionFrontendId || question.frontendQuestionId || question.questionId || '',
    url: `https://leetcode.com/problems/${question.titleSlug}/`,
    isPaidOnly: Boolean(question.isPaidOnly ?? question.paidOnly),
  };
}

export async function getUserSubmissions() {
  const client = await getLeetCodeClient();
  const submissions = await client.submissions({ limit: 1000, offset: 0 });

  return submissions.map((submission) => ({
    id: submission.id,
    slug: submission.titleSlug,
    title: submission.title || submission.titleSlug,
    timestamp: Number(submission.timestamp) || 0,
    status: submission.statusDisplay || submission.status || '',
    language: submission.lang || 'Unknown',
  }));
}

export async function getSubmissionCode(submissionId) {
  try {
    const client = await getLeetCodeClient();
    const detail = await client.submission(Number(submissionId));
    return detail?.code || '';
  } catch {
    return '';
  }
}

export async function getAllProblems() {
  const client = await getLeetCodeClient();
  const problems = [];
  let skip = 0;
  const limit = 100;
  let totalQuestions = Infinity;

  while (skip < totalQuestions) {
    const page = await client.problems({ limit, offset: skip });
    const questions = Array.isArray(page?.questions) ? page.questions : [];
    problems.push(...questions.map(toProblemObject));
    totalQuestions = page?.total || questions.length;

    if (questions.length < limit) break;
    skip += limit;
  }

  return problems;
}

export async function getUnsolvedProblems() {
  const [allProblems, submissions] = await Promise.all([getAllProblems(), getUserSubmissions()]);
  const acceptedSlugs = new Set(
    submissions.filter((submission) => isAccepted(submission.status)).map((submission) => submission.slug),
  );

  return allProblems.filter((problem) => !acceptedSlugs.has(problem.slug));
}

export async function getLastAttempt(slug) {
  const submissions = await getUserSubmissions();
  const relevant = submissions.filter((submission) => submission.slug === slug);

  if (!relevant.length) {
    return null;
  }

  relevant.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  const latest = relevant[0];
  const code = await getSubmissionCode(latest.id);

  return {
    slug,
    title: latest.title,
    status: latest.status,
    code,
    language: latest.language,
    failureReason: latest.status,
  };
}

export async function getProblemDetails(slug) {
  const client = await getLeetCodeClient();
  const detail = await client.problem(slug);

  return {
    slug,
    title: detail.title || slug,
    problemNumber: detail.questionFrontendId || detail.questionId || '',
    difficulty: detail.difficulty || 'Unknown',
    statement: detail.content || '',
    constraints: detail.constraints || '',
    examples: detail.exampleTestcases || [],
    url: `https://leetcode.com/problems/${slug}/`,
  };
}
