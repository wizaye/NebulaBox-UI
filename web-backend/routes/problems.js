import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { storeProblems } from '../utils/storeproblems.js';

config();
const router = Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

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
