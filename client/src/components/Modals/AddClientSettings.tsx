import { useState } from 'react'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import Modal from '../Modal/Modal'
import css from './modalForms.module.css'

const AddClientSettings = ({ closeModal, name, tab }) => {
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    client: '',
    name: '',
    type: '',
    defaultValue: '',
  })

  const {
    handleSubmit,
    // formState: { errors },
  } = useForm()

  const onSubmit = handleSubmit(async () => {
    await axios
      .post(`${process.env.REACT_APP_API_ROOT_URL}/setting/client`, formData)
      .then(function (response) {
        closeModal()
      })
      .catch(function (error) {
        setError('unable to Client Setting')
        console.log(error)
      })
  })

  const options = [
    {
      className: `${css['loginButton']} primary`,
      label: 'save',
      onClick: onSubmit,
    },
  ]

  return (
    <Modal title="Add Client Settings" options={options} icon="info">
      <div className={css['login-container']}>
        {error && <span className={css['error-message']}>{error}</span>}
        <form>
          <div className={css['input-container']}>
            <label className={css['label']} htmlFor="">
              Client
            </label>
            <input
              type="text"
              className={css['input']}
              value={formData.client}
              onChange={e =>
                setFormData({ ...formData, client: e.target.value })
              }
            />
          </div>
          <div className={css['input-container']}>
            <label className={css['label']} htmlFor="">
              Name
            </label>
            <input
              type="text"
              className={css['input']}
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className={css['input-container']}>
            <label className={css['label']} htmlFor="">
              Type
            </label>
            <input
              type="text"
              className={css['input']}
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value })}
            />
          </div>
          <div className={css['input-container']}>
            <label className={css['label']} htmlFor="">
              Default Value
            </label>
            <input
              type="text"
              className={css['input']}
              value={formData.defaultValue}
              onChange={e =>
                setFormData({ ...formData, defaultValue: e.target.value })
              }
            />
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default AddClientSettings
