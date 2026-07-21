
import 'dotenv/config';

const query = `
  query submissionList($offset: Int!, $limit: Int!) {
    submissionList(offset: $offset, limit: $limit) {
      lastKey
      hasNext
      submissions {
        id
        statusDisplay
        lang
        timestamp
        title
        titleSlug
      }
    }
  }
`;

const response = await fetch('https://leetcode.com/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': `LEETCODE_SESSION=${process.env.LEETCODE_SESSION}`,
    'Referer': 'https://leetcode.com',
  },
  body: JSON.stringify({ query, variables: { offset: 0, limit: 20 } }),
});

const data = await response.json();
console.log(JSON.stringify(data, null, 2));
