import 'dotenv/config';

const query = `
  query globalData {
    userStatus {
      isSignedIn
      username
      realName
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
  body: JSON.stringify({ query }),
});

const data = await response.json();
console.log(JSON.stringify(data, null, 2));