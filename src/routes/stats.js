import express from 'express';
import { DataSchema } from '../models/data';

const router = express.Router();

router
  .get('/', async (req, res) => {
    try {
      const data = await DataSchema.find();
      res.status(200).send(data);
    } catch (err) {
      console.log(err)
      res.status(500).send(err);
    }
  })
  .post('/', async (req, res) => {
    try {
      const { name } = req.body;
      //тут запрос на вк апи
      const data = await new DataSchema({ name }).save();
      res.status(200).send(data);
    } catch (err) {
      res.status(500).send(err);
    }
  })

export default router;
