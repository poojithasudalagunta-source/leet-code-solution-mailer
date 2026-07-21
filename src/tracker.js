import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const progressPath = path.resolve(__dirname, '..', 'data', 'progress.json');

function defaultProgress() {
  return { sentSlugs: [] };
}

export async function loadProgress() {
  try {
    await mkdir(path.dirname(progressPath), { recursive: true });
    const raw = await readFile(progressPath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') {
      const initialProgress = defaultProgress();
      await saveProgress(initialProgress);
      return initialProgress;
    }
    throw error;
  }
}

export async function saveProgress(progress) {
  await mkdir(path.dirname(progressPath), { recursive: true });
  await writeFile(progressPath, JSON.stringify(progress, null, 2));
}

export async function getNextUnsentProblem(unsolvedList) {
  const progress = await loadProgress();
  const sentSlugs = new Set(progress.sentSlugs || []);
  return unsolvedList.find((problem) => !sentSlugs.has(problem.slug)) || null;
}

export async function markAsSent(slug) {
  const progress = await loadProgress();
  const sentSlugs = Array.from(new Set([...(progress.sentSlugs || []), slug]));
  await saveProgress({ ...progress, sentSlugs });
}
