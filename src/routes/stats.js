import express from 'express';
import { HTTP } from '../utils/request';
import { APPID, TOKEN, TOKEN_1 } from '../utils/consts';
import { DataSchema } from '../models/data';

const router = express.Router();

router
  .get('/basic', async (req, res) => {
    try {
      let groupObj = {};
      let groupId = ''

      const groupName = req.query.group;

      const basicInfo = 
        await HTTP.get('/groups.getById', {
          params: {
            group_ids: groupName,
            access_token: TOKEN
          }
        })
      
      groupId = basicInfo.data.response[0].id

      const basicInfoUsers = 
        await HTTP.get('/groups.getMembers', {
          params: {
            group_id: groupId,
            access_token: TOKEN
          }
        })
      
      groupObj.basicInfo = basicInfo.data.response[0];
      groupObj.basicInfoUsers = basicInfoUsers.data.response;

      res.status(200).send(groupObj);
    } catch (err) {
      console.log(err)
      res.status(500).send(err);
    }
  })
  .get('/bots', async (req, res) => {
    try {
      // const data = await DataSchema.find();
      res.status(200).send(data);
    } catch (err) {
      console.log(err)
      res.status(500).send(err);
    }
  })
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
