import { useEffect, useState } from 'react'
import axios from 'axios'
import Table from '../../common/Table'
import Search from '../../common/Search'
import { styled } from '@mui/material/styles'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { columnScope } from '../../common/Variable/column'
import { useModal } from '../../../../contexts/ModalProvider'

const Container = styled(Grid)({
  marginBottom: '1.5rem',
})

const ButtonCustom = styled(Button)({
  background: '#424242',
  color: '#fff',
  border: '1px solid #636363',
  '&:hover': {
    background: '#424242',
  },
})

const Scope = () => {
  const [data, setData] = useState([])
  const { openModal } = useModal()

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_ROOT_URL}/setting/scope`)
      .then(res => {
        setData(res.data.payload)
      })
  }, [])

  const handleAddScope = () => {
    openModal({
      modal: 'scope',
      content: 'This is an example modal',
    })
  }

  return (
    <div>
      <Typography variant="h3" gutterBottom component="div">
        Scope
      </Typography>
      <Container container spacing={2}>
        <Grid item xs={10}>
          <Typography variant="h6" gutterBottom component="div">
            These are all the scope you have created
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <ButtonCustom
            variant="contained"
            size="medium"
            fullWidth
            onClick={() => handleAddScope()}
          >
            Add Scope
          </ButtonCustom>
        </Grid>
      </Container>
      <Search />
      <Table column={columnScope} data={data} />
    </div>
  )
}

export default Scope
