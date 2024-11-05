import { Octokit } from '@octokit/rest';

export async function fetchRepoContents(since = null) {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN, 
  });

  const files = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
    owner: 'wizaye',
    repo: 'NebulaBox',
    path: '',
    ref: 'main',
    headers: {
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  const fileContents = [];
  const filePromises = files.data.map(async (file) => {
    if (file.type === 'dir') {
      return fetchDirectoryContents(octokit, file.path, since);
    }
  });

  // Wait for all directory fetch promises to complete
  const results = await Promise.all(filePromises);
  
  // Flatten the results into the main fileContents array
  results.forEach(result => {
    if (result) fileContents.push(...result);
  });

  return fileContents.filter(content => content); // Filter out any undefined contents
}

async function fetchDirectoryContents(octokit, dirPath, since) {
  const dirContents = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
    owner: 'wizaye',
    repo: 'NebulaBox',
    path: dirPath,
    headers: { 'X-GitHub-Api-Version': '2022-11-28' },
  });

  const filePromises = dirContents.data.map(async (dirFile) => {
    const commitData = await octokit.request('GET /repos/{owner}/{repo}/commits', {
      owner: 'wizaye',
      repo: 'NebulaBox',
      path: dirFile.path,
      headers: { 'X-GitHub-Api-Version': '2022-11-28' },
      per_page: 1,
    });

    const latestCommit = commitData.data[0];
    if (!latestCommit) return null; // Skip if no commits found

    const commitDate = new Date(latestCommit.commit.committer.date);
    
    // Skip files older than 'since' date
    if (since && commitDate <= since) return null;

    const fileContent = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner: 'wizaye',
      repo: 'NebulaBox',
      path: dirFile.path,
      headers: { 'X-GitHub-Api-Version': '2022-11-28' },
    });

    return {
      path: dirFile.path,
      content: Buffer.from(fileContent.data.content, 'base64').toString('utf8'),
      commitDate: latestCommit.commit.committer.date,
    };
  });

  // Wait for all file promises to complete
  const fileContents = await Promise.all(filePromises);
  return fileContents.filter(content => content); // Filter out any null values
}
