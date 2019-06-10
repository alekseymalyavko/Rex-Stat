import '@babel/polyfill';
import './utils/dotenv';
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import routes from './routes';
import cors from 'cors';
import json2xls from 'json2xls';

const app = express();

const urlDb = "mongodb+srv://aleksmal:qwerty1234@cluster0-ezzur.mongodb.net/test?retryWrites=true"

mongoose.connect(process.env.CONNECTION_STRING || urlDb, { useNewUrlParser: true });

app.use(json2xls.middleware);
app.use(cors());
app.options('*', (req, res) => res.end());

app.use(bodyParser.json({limit: '10mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}))
app.use('/', routes);

app.get('/', function(req, res) {
  res.send('<h1>Server is running...</h1>');
});

const server = app.listen(process.env.PORT || 3001, () => {
  console.log(`Server listening on port ${server.address().port}`);
});
