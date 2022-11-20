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

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const isUserAlreadyExists = users.find(user => user.username === username);

  if(!isUserAlreadyExists) {
    response.status(400).json({ error: "User with this username already exists" });
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

  response.status(200).send();
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const taskId = request.params.id;
  
  response.status(200).send();
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const taskId = request.params.id;
  const { username } = request.headers;

  response.status(200).send();
});

module.exports = app;