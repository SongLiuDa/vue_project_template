import axios from '@/utils/request'

export function demoGet(params) {
  return axios({
    url: 'demoGet',
    method: 'get',
    params
  })
}

export function demoPost(data) {
  return axios({
    url: 'demoPost',
    method: 'post',
    data
  })
}
