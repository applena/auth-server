'use strict';

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const User = require('./users');
const acl = require('./acl-middleware');
const basicAuth = require('./basic-auth-middleware');
const bearerAuth = require('./bearer-auth-middleware');
require('dotenv').config();
const cors = require('cors');

// middleware
app.use(cors());
app.use(express.json());
app.use(express.static('./public')); // serve front end files from the public directory

// routes
app.post('/signup', (req, res) => {
  const user = new User(req.body);
  user.save()
    .then(user => {
      console.log(user);
      res.status(200).send(user);
    })
})

app.post('/signin', basicAuth, (req, res) => {
  res.status(200).send(req.user);
})

// route that everyone can use
app.get('/allusers', bearerAuth, (req, res) => {
  res.status(200).send('OK - anyone can use this route');
});

// if you pass the bearerAuth, the user is on the request object
// the next() will send you to the acl middleware
app.post('/create', bearerAuth, acl('create'), (req, res) => {
  res.status(200).send('OK - you can create');
})

app.delete('/delete', bearerAuth, acl('delete'), (req, res) => {
  res.status(200).send('OK - you can delete');
})

app.put('/update', bearerAuth, acl('update'), (req, res) => {
  res.status(200).send('OK - you can update');
})

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(process.env.PORT, () => console.log('server up!'));
  })
  .catch(e => console.error('could not start server', e.message));