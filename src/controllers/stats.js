import { APPID, TOKEN, TOKEN_1 } from '../utils/consts';
import { HTTP } from '../utils/request';
import { timer } from '../utils/all';

export async function getBasicInfo(groupName) {
  let groupId = null;
  let basicInfo = null;

  const res = 
    await HTTP.get('/groups.getById', {
      params: {
        group_ids: groupName,
        access_token: TOKEN
      }
    })

  groupId = res.data.response[0].id;
  basicInfo = res.data.response[0];

  const res1 = 
    await HTTP.get('/groups.getMembers', {
      params: {
        group_id: groupId,
        access_token: TOKEN
      }
    })
  
  basicInfo.count = res1.data.response.count;

  return basicInfo
}

export async function getStatistics(groupId, dateFrom, dateTo) {
  let statistics = null;

  const res = 
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
  
  statistics = res.data.response;

  return statistics
}

export async function getMarkI(pinnedPost, groupId) {
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
        offset: offset,
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
    offset += 1000 
    await timer(180);
  }

  return markI
}

export async function getMembers(groupId, N) {
  const attempts = Math.ceil(N * 0.03 / 1000);
  let arrMembers = [];       
  let bots = [];       

  let offset = 1;

  const dataMembers = async () => {
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
    if (users) { 
      for (let i = 0; i < users.length; i++) {
        if (users[i].deactivated === undefined) {
          arrMembers.push(users[i].id)
        } else if (users[i].deactivated !== undefined) {
          bots.push(users[i].id)
        }
      }
    }

  }
    
  for (let i = 0; i <= attempts; i++) {
    await dataMembers()
    offset += 1000;
  }

  return { attempts, arrMembers, bots }
}

export async function getPinnedPost(groupId) {
  let pinnedPost = null;

  const res = 
    await HTTP.get('/wall.get', {
      params: {
        owner_id: -groupId,
        extended: 1,
        access_token: TOKEN,
      }
    })

    if (res.data.response) {
      pinnedPost = res.data.response.items[0];
      return pinnedPost
    }
    else {
      return { isAvailable: 0, text: 'Wall is unavaliable' }
    }
}

export async function getAllActivity(groupId) {
  const res = 
    await HTTP.get('/wall.get', {
      params: {
        owner_id: -groupId,
        offset: 1,
        count: 15,
        extended: 1,
        access_token: TOKEN_1,
      }
    })

  let getLastPosts = res.data.response.items;


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