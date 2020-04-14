import axios from 'axios'
import store from '@/store'
import { getToken } from '@/utils/auth'

const http = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

let ShowErr
// 请求拦截
http.interceptors.request.use(
  config => {
    ShowErr = true
    if (store.getters.token) {
      config.headers['Authorization'] = getToken()
    }
    // console.log('准备请求了', config)
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截
http.interceptors.response.use(
  data => {
    // console.log('请求拦截', data)
    const res = data.data
    if (res.meta.ack !== 'true') {
      // 接口错误处理错误
      return Promise.reject(res)
    } else {
      return Promise.resolve(res)
    }
  },
  err => {
    if (err.code === 'ECONNABORTED' && err.message.indexOf('timeout') !== -1) {
      console.log('timeout')
      if (!ShowErr) return Promise.reject(err)
      ShowErr = false
      // 请求超时处理
      return Promise.reject(err)
    }
    if (err.response) {
      switch (err.response.status) {
        case 404:
          break
        case 500:
          break
      }
    }
    return Promise.reject(err)
  }
)

export default http
