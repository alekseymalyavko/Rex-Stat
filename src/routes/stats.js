import express from 'express';
import { HTTP } from '../utils/request';
import { timer } from '../utils/all';
import { transformation } from '../controllers/index';
import { APPID, TOKEN, TOKEN_1 } from '../utils/consts';
import { DataSchema } from '../models/data';

const router = express.Router();

router
  .get('/basic', async (req, res) => {
    try {
      let R, N, S, I, q, b;

      let groupObj = {};
      let groupId = '';
      let isStatsOpen = true;

      const groupName = req.query.group;
      const dateFrom = req.query.from;
      const dateTo = req.query.to;

      const basicInfo = 
        await HTTP.get('/groups.getById', {
          params: {
            group_ids: groupName,
            access_token: TOKEN
          }
        })
        .then(res => {
          groupId = res.data.response[0].id;
          return res.data.response[0]
        })
      

      const basicInfoUsers = 
        await HTTP.get('/groups.getMembers', {
          params: {
            group_id: groupId,
            access_token: TOKEN
          }
        })
        .then(res => {
          N = res.data.response.count;
          return res.data.response
        })

      const statistics = 
        await HTTP.get('/stats.get', {
          params: {
            group_id: groupId,
            app_id: APPID,
            access_token: TOKEN_1,
            extended: 1,
            interval: 'day',
            date_from: dateFrom,
            date_to: dateTo
          }
        })
        .then(res => {
          const result = res.data.response;
          isStatsOpen = Boolean(result);
          return result
        })
      
      groupObj.basicInfo = basicInfo;
      groupObj.basicInfo.count = basicInfoUsers.count;

      groupObj.statistics = { isAvailable: 0, text: 'Statistic is unavaliable' };
      
      if (isStatsOpen) {
        const transformData = transformation(statistics, N)

        groupObj.statistics = transformData.transformedStat
        
        S = transformData.calculatedData.S;
        q = transformData.calculatedData.q;
        b = transformData.calculatedData.b;

        const pinnedPost = 
          await HTTP.get('/wall.get', {
            params: {
              owner_id: -groupId,
              extended: 1,
              access_token: TOKEN,
            }
          })
          .then(res => {
            const result = res.data.response;
            if (result) {
              const posts = result.items;
              const pinnedPost = posts[0];
              const likes = pinnedPost.likes.count;

              I = likes;
              R = N-S-I;
  
              return pinnedPost
            }
            return { isAvailable: 0, text:'Wall is unavaliable' }
          })
        
        const getMarkI = async (pinnedPost) => {
          const postId = pinnedPost.id;
          const attempts = Math.ceil(pinnedPost.likes.count / 1000);

          let markI = [];
          let offset = 1;

          const getAllLikesPinnedPost = async (postId, offset) => {
            const res = await HTTP.get('/likes.getList', {
              params: {
                type: 'post',
                owner_id: -groupId,
                item_id: postId,
                offset: 0 || offset,
                count: 1000,
                friends_only: 0,
                filter:'likes',
                extended: 1,
                access_token: TOKEN_1,
              }
            })

            let likers = res.data.response.items;
            for (let i = 0; i < likers.length; i++) {
              if (likers[i].id === undefined) {
                return
              } else {
                markI.push(likers[i].id)
              }
            }  
          }

          for (let i = 0; i < attempts; i++) {
            await getAllLikesPinnedPost(postId, offset)
            offset = offset * 1000 
            await timer(180);
          }

          return markI
        }

        const calculatedData = { R, N, S, I, q, b }
        groupObj.pinnedPost = pinnedPost;
        groupObj.calculatedData = calculatedData;
        
        groupObj.dataForMark = transformData.dataForMark;
        if (pinnedPost.isAvailable !== 0) {
          groupObj.dataForMark.markI = await getMarkI(pinnedPost);
        }

        const getMembers = async (groupId, N) => {
          const attempts = Math.ceil(N * 0.03 / 1000);
          let arrMembers = [];       
          let bots = [];       

          let offset = 1;

          const dataMembers = async (offset) => {
            const res = await HTTP.get('/groups.getMembers', {
              params: {
                group_id: groupId,
                offset: offset,
                count: 1000,
                sort: 'id_desc',
                fields: 'deactivated',
                access_token: TOKEN_1,
              }
            })
            let users = res.data.response.items;
            for (let i = 0; i < users.length; i++) {
              if (users[i].deactivated === undefined) {
                arrMembers.push(users[i].id)
              } else if (users[i].deactivated !== undefined) {
                bots.push(users[i].id)
              }
            }
          }
            
          for (let i = 0; i <= attempts; i++) {
            await dataMembers()
            offset += 1000;
          }
          return {attempts, arrMembers, bots}
        }
        groupObj.members = await getMembers(groupId, N)


        const getLastPosts = 
          await HTTP.get('/wall.get', {
            params: {
              owner_id: -groupId,
              offset: 1,
              count: 15,
              extended: 1,
              access_token: TOKEN_1,
            }
          })
          .then(res => {
            let allPosts = [];
            let postIds = res.data.response.items;
            for (let i = 0; i < postIds.length; i++) {
              allPosts.push(postIds[i]);
            }
            return allPosts
          })
        
        const activityLastPosts = async (getLastPosts) => {
          let attempts = getLastPosts.length;

          let allLikers = [];
          let allComments = [];

          const getLastPostsLikes = async (postId, offset) => {
            const res = await HTTP.get('/likes.getList', {
              params: {
                type: 'post',
                owner_id: -groupId,
                item_id: postId,
                offset: 1 || offset,
                count: 1000,
                friends_only: 0,
                filter:'likes',
                extended: 1,
                access_token: TOKEN_1,
              }
            })
            
            let likers = res.data.response.items;
            for (let i = 0; i < likers.length; i++) {
              if (likers[i].id === undefined) {
                return
              } else {
                allLikers.push(likers[i].id)
              }
            }  
          }

          const getLastPostsComments = async (postId) => {
            const res = await HTTP.get('/wall.getComments', {
              params: {
                owner_id: -groupId,
                post_id: postId,
                offset: 1,
                count: 100,
                need_likes: 0,
                extended: 0,
                access_token: TOKEN_1,
              }
            })

            let comments = res.data.response.items;
            for (let i = 0; i < comments.length-1; i++) {
              if (comments[i].id === undefined) {
                return
              }
              else {
                allComments.push(comments[i].id)
              }
            } 
          }

          for (let i = 0; i < attempts; i++) {
            const postId = getLastPosts[i].id;
            const offset = i * 1000;

            await timer(190);
            await getLastPostsLikes(postId, offset)
            await timer(190);
            await getLastPostsComments(postId)
            await timer(190);
          }
          return { attempts, allLikers, allComments }
        }
      
      groupObj.allActivity = await activityLastPosts(getLastPosts)

      }

      res.status(200).send(groupObj);
    } catch (err) {
      console.log(err)
      res.status(500).send(err);
    }
  })

  // .get('/bots', async (req, res) => {
  //   try {
  //     // const data = await DataSchema.find();
  //     res.status(200).send(data);
  //   } catch (err) {
  //     console.log(err)
  //     res.status(500).send(err);
  //   }
  // })
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
      console.log(111, req.body)
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

export default router;
