# task-management-api-2
A simple and robust Task Management RESTful API built with **Express.js** and **PostgreSQL**. This API allows users to create, read, update, delete, and search tasks with support for pagination and filtering.

## Features
- Create tasks
- Fetch all tasks with pagination and search
- Retrieve tasks by ID
- Update tasks by ID
- Delete tasks by ID
- Built-in input validation middleware
- Uses environment variables for database configuration
- Database connection test

## Technologies Used
- Node.js
- Express.js
- PostgreSQL
- pg (node-postgres)
- dotenv

## Installation
Clone the repository:
```bash
git clone https://github.com/gh-aam/task-management-api-2.git
```
Go to project directory:
```bash
cd task-management-api-2
```
Install dependencies:
```bash
npm install
```
Create a `.env` file in the root directory and configure your **PostgreSQL** credentials:
```bash
PGUSER=your_postgres_username
PGHOST=localhost
PGDATABASE=your_posgres_database_name
PGPASSWORD=your_postgres_password
PGPORT=5432
```
Create the `tasks` table in your PostgreSQL database:
```bash
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```
Start the server:
```bash
npm start
```
Visit [http://localhost:3000](http://localhost:3000) to verify the server is running.

## API Endpoints
`GET /` - Welcome message   
`POST /tasks` - Create a new task   
`GET /tasks` - Get all tasks with pagination and search   
`GET /tasks/:id` - Get a single task by ID   
`PUT /tasks/:id` - Update a task by ID   
`DELETE /tasks/:id` - Delete a task by ID
