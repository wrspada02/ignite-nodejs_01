const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const isUserAlreadyExists = users.find(user => user.username === username);

  if(!isUserAlreadyExists) {
    response.status(400).json({  error: 'Mensagem do erro' });
  }

  next();
}

function isUserExists(username) {
  return users.some(user => user.username === username);
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  if(isUserExists(username)) {
    response.status(400).json({  error: 'This user already exists' });
  }

  const newUser = {
    id: uuidv4(),
    name, 
    username,
    todos: []
  };

  users.push(newUser);

  response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  const user = users.find(user => user.username === username);

  user.todos.push(newTodo);

  response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const taskId = request.params.id;
  const { username } = request.headers;
  const { title, deadline } = request.body;

  const user = users.find(user => user.username === username);
  
  const userTodoUpdated = user.todos.map(todo => {
    if(todo.id === taskId) {
      return {
        ...todo,
        title,
        deadline: new Date(deadline),
      };
    }

    return todo;
  });

  user.todos.splice(0, user.todos.length);
  user.todos.push(...userTodoUpdated);

  response.status(200).json(users);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const taskId = request.params.id;

  const user = users.find(user => user.username === username);

  const todoUserUpdated = user.todos.map(todo => {
    if(todo.id === taskId) {
      return {
        ...todo,
        done: true,
      };
    }
    return todo;
  });

  user.todos.splice(0, user.todos.length);
  user.todos.push(...todoUserUpdated);
  
  response.status(200).json(users);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const taskId = request.params.id;
  const { username } = request.headers;

  const user = users.find(user => user.username === username);
  const isTodoExists = user.todos.some(todo => todo.id === taskId);

  if(!isTodoExists) return response.status(400).send();

  user.todos.filter(todo => todo.id !== taskId);

  response.status(200).send();
});

module.exports = app;