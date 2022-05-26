import axios from 'axios'
class ScopeService {
  getAll() {
    return axios.get(`${process.env.REACT_APP_API_ROOT_URL}/setting/scope`)
  }
  get(id) {
    return axios.get(`${process.env.REACT_APP_API_ROOT_URL}/setting/scope${id}`)
  }
  create(data) {
    return axios.post(
      `${process.env.REACT_APP_API_ROOT_URL}/setting/scope`,
      data
    )
  }
  update(id, data) {
    return axios.put(
      `${process.env.REACT_APP_API_ROOT_URL}/setting/scope${id}`,
      data
    )
  }
  delete(id) {
    return axios.delete(
      `${process.env.REACT_APP_API_ROOT_URL}/setting/scope?id=${id}`
    )
  }
}
export default new ScopeService()
