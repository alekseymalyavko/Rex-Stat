import axios from 'axios'

export const HTTP = axios.create({
  baseURL: 'https://api.vk.com/method/',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  params: {
    v: 5.75
  }
})