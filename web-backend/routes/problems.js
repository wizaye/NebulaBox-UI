import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { fetchRepoContents } from '../utils/github.js';
import { config } from 'dotenv';

config();
const router = Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Helper function to extract problem details from README.md
function extractProblemDetails(fileContent, filePath, commitDate) {
  const problemId = parseInt(filePath.split('/')[0], 10);
  
  const titleMatch = fileContent.match(/<h2><a href="[^"]+">([^<]+)<\/a><\/h2>/);
  const title = titleMatch ? titleMatch[1].replace(/^\d+\.\s*/, '') : 'Untitled';

  const difficultyMatch = fileContent.match(/<h3>([^<]+)<\/h3>/);
  const difficulty = difficultyMatch ? difficultyMatch[1] : 'Unknown';

  const descriptionMatch = fileContent.split('<hr>');
  const description = descriptionMatch.length > 1 ? descriptionMatch[1].trim() : 'Description not available.';

  return { problemId, title, difficulty, description, commitDate };
}

// Function to store problems in Supabase
// async function storeProblems() {
//   try {
//     // Get the latest commit date from the database to fetch only newer problems
//     const { data: lastProblem, error: lastError } = await supabase
//       .from('problems')
//       .select('date')
//       .order('date', { ascending: false })
//       .limit(1)
//       .single();

//     const since = lastError ? null : new Date(lastProblem.date);
//     const files = await fetchRepoContents(since);

//     const problems = [];
//     const solutionMap = new Map();

//     // Pre-process files to map solutions
//     for (const file of files) {
//       if (file.path.endsWith('.java') || file.path.endsWith('.py')) {
//         const solProblemId = parseInt(file.path.split('/')[0], 10);
//         solutionMap.set(solProblemId, solutionMap.get(solProblemId) || []);
//         solutionMap.get(solProblemId).push({
//           language: file.path.endsWith('.java') ? 'Java' : 'Python',
//           content: file.content,
//           commitDate: file.commitDate,
//         });
//       }
//     }

//     // Process each README.md file to extract problems
//     for (const file of files) {
//       if (file.path.endsWith('README.md')) {
//         const { problemId, title, difficulty, description, commitDate } = extractProblemDetails(file.content, file.path, file.commitDate);
//         const solutions = solutionMap.get(problemId) || [];

//         problems.push({
//           id: problemId,
//           title,
//           difficulty,
//           description,
//           solutions,
//           date: commitDate,
//         });
//       }
//     }

//     // Batch insert new problems, using upsert to handle duplicates
//     if (problems.length > 0) {
//       const { data: insertData, error } = await supabase.from('problems').upsert(problems);
//       if (error) throw error;

//       console.log('Problems stored successfully:', insertData);
//     } else {
//       console.log('No new problems to insert.');
//     }
//   } catch (error) {
//     console.error('Error fetching problems:', error);
//   }
// }
async function storeProblems() {
  try {
    // Get the latest commit date from the database to fetch only newer problems
    const { data: lastProblem, error: lastError } = await supabase
      .from('problems')
      .select('date')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    const since = lastError ? null : new Date(lastProblem.date);
    const files = await fetchRepoContents(since);

    const problems = [];
    const solutionMap = new Map();

    // Pre-process files to map solutions
    for (const file of files) {
      if (file.path.endsWith('.java') || file.path.endsWith('.py')) {
        const solProblemId = parseInt(file.path.split('/')[0], 10);
        solutionMap.set(solProblemId, solutionMap.get(solProblemId) || []);
        solutionMap.get(solProblemId).push({
          language: file.path.endsWith('.java') ? 'Java' : 'Python',
          content: file.content,
          commitDate: file.commitDate,
        });
      }
    }

    // Process each README.md file to extract problems
    for (const file of files) {
      if (file.path.endsWith('README.md')) {
        const { problemId, title, difficulty, description, commitDate } = extractProblemDetails(file.content, file.path, file.commitDate);
        const solutions = solutionMap.get(problemId) || [];

        problems.push({
          id: problemId,
          title,
          difficulty,
          description,
          solutions,
          date: commitDate,
        });
      }
    }

    // Only proceed to upsert if there are new problems to insert
    if (problems.length > 0) {
      const { data: existingProblems, error: fetchError } = await supabase
        .from('problems')
        .select('id');

      if (fetchError) throw fetchError;

      // Filter out existing problems to avoid unnecessary updates
      const newProblems = problems.filter(p => !existingProblems.some(ep => ep.id === p.id));

      if (newProblems.length > 0) {
        const { data: insertData, error } = await supabase.from('problems').upsert(newProblems);
        if (error) throw error;

        console.log('New problems stored successfully:', insertData);
      } else {
        console.log('No new problems to insert.');
      }
    } else {
      console.log('No new problems to insert.');
    }
  } catch (error) {
    console.error('Error fetching problems:', error);
  }
}


// Store problems immediately
storeProblems();

// Route to get all problems
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('problems').select('*');
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching problems:', error);
    res.status(500).json({ error: 'Error fetching problems' });
  }
});

// Route to get a specific problem by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('problems')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching problem:', error);
    res.status(500).json({ error: 'Error fetching problem' });
  }
});

export default router;
