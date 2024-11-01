import { Octokit } from '@octokit/rest';

export async function fetchRepoContents() {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN, // Use your GitHub token here
  });

  const files = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
    owner: 'wizaye',
    repo: 'NebulaBox',
    path: '',
    headers: {
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  const fileContents = [];

  for (const file of files.data) {
    if (file.type === 'dir') {
      const dirContents = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: 'wizaye',
        repo: 'NebulaBox',
        path: file.path,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });

      for (const dirFile of dirContents.data) {
        // Fetch file content
        const fileContent = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
          owner: 'wizaye',
          repo: 'NebulaBox',
          path: dirFile.path,
          headers: {
            'X-GitHub-Api-Version': '2022-11-28',
          },
        });

        const content = Buffer.from(fileContent.data.content, 'base64').toString('utf8'); // Decode base64 content

        // Get the commit date for the specific file
        const commitData = await octokit.request('GET /repos/{owner}/{repo}/commits?path={path}', {
          owner: 'wizaye',
          repo: 'NebulaBox',
          path: dirFile.path,
          headers: {
            'X-GitHub-Api-Version': '2022-11-28',
          },
        });

        // Get the most recent commit date
        const commitDate = commitData.data.length > 0 ? commitData.data[0].commit.committer.date : null;

        fileContents.push({
          path: dirFile.path,
          content: content,
          commitDate: commitDate, // Store commit date for each file
        });
      }
    }
  }

  return fileContents;
}
