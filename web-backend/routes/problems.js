import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { fetchRepoContents } from '../utils/github.js';
import { config } from 'dotenv';

config();
const router = Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function storeProblems() {
  try {
    const files = await fetchRepoContents();
    const problems = [];

    for (const file of files) {
      if (file.path.endsWith('README.md')) {
        const problemId = parseInt(file.path.split('/')[0], 10);

        // Check if the problem already exists in the database
        const { data: existingProblem, error: checkError } = await supabase
          .from('problems')
          .select('id')
          .eq('id', problemId)
          .single();

        if (checkError) {
          console.error('Error checking existing problems:', checkError);
          continue; // Skip this iteration on error
        }

        // Skip if the problem already exists
        if (existingProblem) {
          console.log(`Problem ID ${problemId} already exists. Skipping...`);
          continue;
        }

        // Extract title, difficulty, description, and solutions
        const titleMatch = file.content.match(/<h2><a href="[^"]+">([^<]+)<\/a><\/h2>/);
        let title = titleMatch ? titleMatch[1] : 'Untitled';
        title = title.replace(/^\d+\.\s*/, '');

        const difficultyMatch = file.content.match(/<h3>([^<]+)<\/h3>/);
        const difficulty = difficultyMatch ? difficultyMatch[1] : 'Unknown';

        const descriptionMatch = file.content.split('<hr>');
        let description = 'Description not available.';
        if (descriptionMatch.length > 1) {
          description = descriptionMatch[1].trim();
        }

        const solutions = [];
        for (const solFile of files) {
          if (solFile.path.endsWith('.java') || solFile.path.endsWith('.py')) {
            const solProblemId = parseInt(solFile.path.split('/')[0], 10);
            if (solProblemId === problemId) {
              solutions.push({
                language: solFile.path.endsWith('.java') ? 'Java' : 'Python',
                content: solFile.content,
                commitDate: solFile.commitDate,
              });
            }
          }
        }

        const data = {
          id: problemId,
          title: title,
          difficulty: difficulty,
          description: description,
          solutions: solutions.length ? solutions : [],
          date: file.commitDate,
        };

        problems.push(data);
      }
    }

    // Insert problems into Supabase
    if (problems.length > 0) {
      const { data: insertData, error } = await supabase.from('problems').insert(problems);
      if (error) throw error;

      console.log('Problems stored successfully:', insertData);
    } else {
      console.log('No new problems to insert.');
    }
  } catch (error) {
    console.error('Error fetching problems:', error);
  }
}

// Schedule job to run every hour
setInterval(storeProblems, 3600000); // 1 hour in milliseconds

// Route to get all problems
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('problems').select('*');
    if (error) {
      return res.status(500).json({ error: 'Error fetching problems' });
    }
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching problems:', error);
    res.status(500).json({ error: 'Internal Server Error' });
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

    if (error) {
      return res.status(500).json({ error: 'Error fetching problem' });
    }
    
    if (!data) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching problem:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
