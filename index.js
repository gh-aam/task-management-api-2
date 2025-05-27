// index.js
require('dotenv').config();  // Load environment variables from .env file
const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 3000;

// PostgreSQL connection configuration
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

// Test the database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err);
  } else {
    console.log('Connected to PostgreSQL:', res.rows[0].now);
  }
});

app.use(express.json());  // Middleware to parse JSON request bodies

// Title field validation middleware
const isTitlePresent = (req, res, next) => {
  const { title } = req.body;
  
  if (!title) {
    return res.status(400).json({ message: 'Title required' });
  }
  
  next();
};

// GET /: Root route
app.get('/', (req, res) => {
  res.send('Welcome to Task Management API 2!');
});

// POST /tasks: Create a new task
app.post('/tasks', isTitlePresent, async (req, res) => {
  const { title, description } = req.body;
  
  try {
    const query = 'INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING *';
    const values = [title, description];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// GET /tasks: Get all tasks with pagination and search
app.get('/tasks', async (req, res) => {
  // Parse query parameters or set defaults
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';
  
  try {
    const query = 'SELECT * FROM tasks WHERE title ILIKE $1 OR description ILIKE $1 ORDER BY id LIMIT $2 OFFSET $3';
    const values = [`%${search}%`, limit, offset];
    const result = await pool.query(query, values);  // Fetch paginated tasks with search
    
    // Get total matched task count for metadata
    const countQuery = 'SELECT COUNT(*) FROM tasks WHERE title ILIKE $1 OR description ILIKE $1';
    const countResult = await pool.query(countQuery, [`%${search}%`]);
    const totalTasks = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalTasks / limit);
    
    res.json({
      page,
      limit,
      totalTasks,
      totalPages,
      tasks: result.rows
    });
  } catch (err) {
    console.error('Error getting tasks:', err);
    res.status(500).json({ error: 'Failed to get tasks' });
  }
});

// GET /tasks/:id: Get a single task by ID
app.get('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error getting task:', err);
    res.status(500).json({ error: 'Failed to get task' });
  }
});

// PUT /tasks/:id: Update a task by ID
app.put('/tasks/:id', isTitlePresent, async (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;
  
  try {
    const query = 'UPDATE tasks SET title = $1, description = $2, completed = $3, updated_at = NOW() WHERE id = $4 RETURNING *';
    const values = [title, description, completed, id];
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /tasks/:id: Delete a task by ID
app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});