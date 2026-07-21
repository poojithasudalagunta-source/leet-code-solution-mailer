# leetcode-mailer

A production-ready Node.js learning agent that sends one new unsolved LeetCode problem each run, along with a beginner-friendly explanation, complexity analysis, and a working solution.

## Installation

```bash
npm install
```

## Environment variables

Copy [.env.example](.env.example) to `.env` and fill in the values:

```env
LEETCODE_SESSION=your_leetcode_session_cookie
GROQ_API_KEY=your_groq_api_key
RESEND_API_KEY=your_resend_api_key
MY_EMAIL=you@example.com
FROM_EMAIL=verified_sender@example.com
```

## Getting your LeetCode session cookie

- Sign in to LeetCode in your browser.
- Open Developer Tools and inspect the `LEETCODE_SESSION` cookie value.
- Paste the cookie value into `.env`.

## Creating a Resend API key

- Create an account at https://resend.com.
- Generate an API key and put it in `RESEND_API_KEY`.
- Verify a sender email address and set `FROM_EMAIL` to that verified address.

## Creating a Groq API key

- Sign up at https://console.groq.com.
- Create an API key and place it in `GROQ_API_KEY`.

## GitHub Actions secrets

Add these repository secrets in GitHub:

- `LEETCODE_SESSION`
- `GROQ_API_KEY`
- `RESEND_API_KEY`
- `MY_EMAIL`
- `FROM_EMAIL`

## Running locally

```bash
npm start
```

The workflow in [.github/workflows/daily-run.yml](.github/workflows/daily-run.yml) will run daily and commit the updated progress state in [data/progress.json](data/progress.json).
