import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Modal from '../Modal/Modal'
import css from './modalForms.module.css'
import { Select, MenuItem } from '@material-ui/core'
import { useAppDispatch } from '@/state/hooks'
import { createScope } from '../../state/admin/scope/scopeState'

const AddScope = ({ closeModal }) => {
  const dispatch = useAppDispatch()
  const labels = ['Gb', 'Mb', 'Kb', 'Bytes']
  const [formData, setFormData] = useState({
    tables: '',
    fullTableSize: {
      label: '',
      value: '',
    },
    tableSize: {
      label: 'mb',
      value: '',
    },
    recordCount: '',
  })

  const {
    handleSubmit,
    // formState: { errors },
  } = useForm()

  const onSubmit = handleSubmit(async () => {
    dispatch(createScope(formData))
    closeModal()
  })
  const options = [
    {
      className: `${css['loginButton']} primary`,
      label: 'save',
      onClick: onSubmit,
    },
  ]

  return (
    <Modal title="Add Scope" options={options} icon="info">
      <div className={css['login-container']}>
        {/* {error && <span className={css['error-message']}>{error}</span>} */}
        <form>
          <div className={css['input-container']}>
            <label className={css['label']} htmlFor="">
              Tables
            </label>
            <input
              type="text"
              className={css['input']}
              value={formData.tables}
              onChange={e =>
                setFormData({ ...formData, tables: e.target.value })
              }
            />
          </div>
          <div className={css['input-container']}>
            <label className={css['label']} htmlFor="">
              Full Table Size
            </label>
            <input
              type="text"
              className={css['input']}
              value={formData.fullTableSize.value}
              onChange={e =>
                setFormData({
                  ...formData,
                  fullTableSize: {
                    ...formData.fullTableSize,
                    value: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className={css['input-container']}>
            <label className={css['label']} htmlFor="">
              Size
            </label>
            <Select
              value={formData.fullTableSize.label}
              onChange={(e: any) =>
                setFormData({
                  ...formData,
                  fullTableSize: {
                    ...formData.fullTableSize,
                    label: e.target.value,
                  },
                })
              }
              className={css['input']}
            >
              {labels.map((value, index) => {
                return (
                  <MenuItem value={value} className={css['select']}>
                    {value}
                  </MenuItem>
                )
              })}
            </Select>
          </div>
          <div className={css['input-container']}>
            <label className={css['label']} htmlFor="">
              Table Size
            </label>
            <input
              type="text"
              className={css['input']}
              value={formData.tableSize.value}
              onChange={e =>
                setFormData({
                  ...formData,
                  tableSize: { ...formData.tableSize, value: e.target.value },
                })
              }
            />
          </div>
          <div className={css['input-container']}>
            <label className={css['label']} htmlFor="">
              Size
            </label>
            <Select
              value={formData.tableSize.label}
              onChange={(e: any) =>
                setFormData({
                  ...formData,
                  tableSize: {
                    ...formData.tableSize,
                    label: e.target.value,
                  },
                })
              }
              className={css['input']}
            >
              {labels.map((value, index) => {
                return (
                  <MenuItem value={value} className={css['select']}>
                    {value}
                  </MenuItem>
                )
              })}
            </Select>
          </div>
          <div className={css['input-container']}>
            <label className={css['label']} htmlFor="">
              Record Count
            </label>
            <input
              type="text"
              className={css['input']}
              value={formData.recordCount}
              onChange={e =>
                setFormData({ ...formData, recordCount: e.target.value })
              }
            />
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default AddScope
