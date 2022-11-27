const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user) {
    response.status(400).json({  error: 'Mensagem do erro' });
  }

  request.user = user;
  next();
}

function checksExistsTodos(request, response, next) {
  const { user } = request;
  const taskId = request.params.id;

  const isTodoExists = user.todos.some(todo => todo.id === taskId);

  if(!isTodoExists) return response.status(404).json({ error: 'Todo doesnt exist' });

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
  const { user } = request;

  response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newTodo);

  response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, checksExistsTodos, (request, response) => {
  const taskId = request.params.id;
  const { title, deadline } = request.body;
  const { user } = request;
  
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

  const todoUpdated = user.todos.filter(todo => todo.id === taskId);

  response.status(200).json(todoUpdated[0]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodos, (request, response) => {
  const taskId = request.params.id;
  const { user } = request;

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

  const todoUpdated = user.todos.filter(todo => todo.id === taskId);

  response.status(200).json(todoUpdated[0]);
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodos, (request, response) => {
  const taskId = request.params.id;
  const { user } = request;

  const userTodoUpdated = user.todos.filter(todo => todo.id !== taskId);

  user.todos.splice(0, user.todos.length);
  user.todos.push(...userTodoUpdated);

  response.status(204).json({});
});

module.exports = app;