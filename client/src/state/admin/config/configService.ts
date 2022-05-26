import axios from 'axios'
class ConfigService {
  getAll() {
    return axios.get(
      `${process.env.REACT_APP_API_ROOT_URL}/setting/configuration`
    )
  }
  get(id) {
    return axios.get(
      `${process.env.REACT_APP_API_ROOT_URL}/setting/configuration${id}`
    )
  }
  create(data) {
    return axios.post(
      `${process.env.REACT_APP_API_ROOT_URL}/setting/configuration`,
      data
    )
  }
  update(id, data) {
    return axios.put(
      `${process.env.REACT_APP_API_ROOT_URL}/setting/configuration${id}`,
      data
    )
  }
  delete(id: number) {
    return axios.delete(
      `${process.env.REACT_APP_API_ROOT_URL}/setting/configuration?id=${id}`
    )
  }
}
export default new ConfigService()
