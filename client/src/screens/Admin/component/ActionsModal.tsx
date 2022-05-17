import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

export default function ActionModal({ anchorEl, open, handleClose, id }) {
  const handleDelete = () => {
    handleClose()
  }

  const handleEdit = () => {
    console.log(id)

    handleClose()
  }

  return (
    <Menu
      id="demo-positioned-menu"
      aria-labelledby="demo-positioned-button"
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
    >
      <MenuItem onClick={() => handleDelete()}>Edit</MenuItem>
      <MenuItem onClick={() => handleEdit()}>Delete</MenuItem>
    </Menu>
  )
}
