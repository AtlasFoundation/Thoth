import axios from 'axios'
class ClientService {
  getAll() {
    return axios.get(`${process.env.REACT_APP_API_ROOT_URL}/setting/client`)
  }
  get(id) {
    return axios.get(
      `${process.env.REACT_APP_API_ROOT_URL}/setting/client${id}`
    )
  }
  create(data) {
    return axios.post(
      `${process.env.REACT_APP_API_ROOT_URL}/setting/client`,
      data
    )
  }
  update(id, data) {
    return axios.put(
      `${process.env.REACT_APP_API_ROOT_URL}/setting/client${id}`,
      data
    )
  }
  delete(id) {
    return axios.delete(
      `${process.env.REACT_APP_API_ROOT_URL}/setting/client?id=${id}`
    )
  }
}
export default new ClientService()
