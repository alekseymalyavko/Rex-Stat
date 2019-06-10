import express from 'express';
import { transformation } from '../controllers/transform';
import { getBasicInfo, getStatistics, getMarkI, getMembers, getAllActivity, getPinnedPost } from '../controllers/stats';
import { DataSchema } from '../models/data';

import json2xls from 'json2xls';
import fs from 'fs';

const router = express.Router();

router
  .get('/basic', async (req, res) => {
    try {
      let R, N, S, I, q, b;

      let groupObj = {};
      let groupId = null;
      let isStatsOpen = true;

      const groupName = req.query.group;
      const dateFrom = req.query.from;
      const dateTo = req.query.to;

      const basicInfo = await getBasicInfo(groupName);
      N = basicInfo.count;

      groupId = basicInfo.id;
      groupObj.basicInfo = basicInfo;

      const statistics = await getStatistics(groupId, dateFrom, dateTo);
      isStatsOpen = Boolean(statistics);
      
      groupObj.statistics = { isAvailable: 0, text: 'Statistic is unavaliable' };
      
      if (isStatsOpen) {
        const transformData = transformation(statistics, N)

        groupObj.statistics = transformData.transformedStat
        
        S = transformData.calculatedData.S;
        q = transformData.calculatedData.q;
        b = transformData.calculatedData.b;

        const pinnedPost = await getPinnedPost(groupId);
        if (pinnedPost.likes) {
          I = pinnedPost.likes.count;
          R = N-S-I;
        }
        groupObj.pinnedPost = pinnedPost;

        const calculatedData = { R, N, S, I, q, b }
        groupObj.calculatedData = calculatedData;
        groupObj.dataForMark = transformData.dataForMark;

        if (pinnedPost.isAvailable !== 0) {
          const markI = await getMarkI(pinnedPost, groupId);
          groupObj.dataForMark.markI = markI
        }

        const members = await getMembers(groupId, N)
        groupObj.members = members

        const allActivity = await getAllActivity(groupId)
        groupObj.allActivity = allActivity

      }

      res.status(200).send(groupObj);
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
  .delete('/', async (req, res) => {
    try {
      const groupId = req.body.id;
      const group = await DataSchema.deleteOne({ _id: groupId })

      res.status(200).send(group);
    } catch (err) {
      console.log(err)
      res.status(500).send(err);
    }
  })
  .post('/', async (req, res) => {
    try {
      const groupInfo = req.body;
      const data = await new DataSchema(groupInfo).save();

      res.status(200).send(data);
    } catch (err) {
      res.status(500).send(err);
    }
  })

  .post('/excel', async (req, res) => {
    try {
      const activity = req.body;
      console.log(activity)
      var json = [
        {
          attemps: 123,
        },
        {
          allLikers: 3123,
          allComments: 124,
        },
        {
          allLikers: 3123,
          allComments: 124,
        },
      ]
      
      var xls = json2xls(json);
        
      const path = 'data.xlsx'
      fs.writeFileSync(path, xls, 'binary');
      
      res.download(path);
    } catch (err) {
      console.log(err)
      res.status(500).send(err);
    }
  })

export default router;
