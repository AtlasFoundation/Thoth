import { useEffect } from 'react'
import Table from '../../common/Table'
import Search from '../../common/Search'
import { styled } from '@mui/material/styles'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { columnClientSetting } from '../../common/Variable/column'
import { useModal } from '../../../../contexts/ModalProvider'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  retrieveClient,
  ClientRes,
  deleteClient,
} from '../../../../state/admin/clientS/clientState'

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

const ClientSetting = () => {
  const dispatch = useAppDispatch()
  const { client, success, deleteSuccess } = useAppSelector(
    state => state.client
  )
  let data: ClientRes = { message: '', payload: { data: [], pages: '' } }
  const { openModal } = useModal()

  useEffect(() => {
    dispatch(retrieveClient())
  }, [dispatch, deleteSuccess])

  const handleAddSetting = () => {
    openModal({
      modal: 'clientSettings',
      content: 'This is an example modal',
    })
  }

  if (success) {
    data = client.payload[0].data
  }

  const handledeleteClient = id => {
    dispatch(deleteClient(id))
  }
  return (
    <div>
      <Typography variant="h3" gutterBottom component="div">
        Client Settings
      </Typography>
      <Container container spacing={2}>
        <Grid item xs={10}>
          <Typography variant="h6" gutterBottom component="div">
            These are all the Client settings you have created
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <ButtonCustom
            variant="contained"
            size="medium"
            fullWidth
            onClick={() => handleAddSetting()}
          >
            Add Setting
          </ButtonCustom>
        </Grid>
      </Container>
      <Search />
      <Table
        column={columnClientSetting}
        data={data}
        deletehandle={handledeleteClient}
      />
    </div>
  )
}

export default ClientSetting
