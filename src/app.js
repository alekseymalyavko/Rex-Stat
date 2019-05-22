import '@babel/polyfill';
import './utils/dotenv';
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import routes from './routes';
import cors from 'cors';

const app = express();

process.env.CONNECTION_STRING = "mongodb+srv://aleksmal:qwerty1234@cluster0-olbqv.mongodb.net/test?retryWrites=true"

mongoose.connect(process.env.CONNECTION_STRING, { useNewUrlParser: true });

// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, PUT, POST, DELETE, PATCH');
//   next();
// });
app.use(cors());
app.options('*', (req, res) => res.end());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', routes);

const server = app.listen(process.env.PORT || 3333, () => {
  console.log(`Server listening on port ${server.address().port}`);
});
