import { useEffect } from 'react'
import Table from '../../common/Table'
import Search from '../../common/Search'
import { styled } from '@mui/material/styles'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { columnConfig } from '../../common/Variable/column'
import { useModal } from '../../../../contexts/ModalProvider'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { getConfig } from '../../../../state/admin/Actions/configActions'
import { Config } from '../../../../state/admin/types/types'

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

const Config = () => {
  const dispatch = useAppDispatch()
  const configData = useAppSelector(state => state.config)
  let data: Config[] = []
  const { openModal } = useModal()
  // const page = 1
  useEffect(() => {
    dispatch(getConfig())
  }, [])

  console.log(configData.config)

  const handleAdd = () => {
    openModal({
      modal: 'addconfig',
      content: 'This is an example modal',
    })
  }

  if (configData.config) {
    data = configData.config
  }

  return (
    <div>
      <Typography variant="h3" gutterBottom component="div">
        Configuration
      </Typography>
      <Container container spacing={2}>
        <Grid item xs={10}>
          <Typography variant="h6" gutterBottom component="div">
            These are all the Configurations you have created
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <ButtonCustom
            variant="contained"
            size="medium"
            fullWidth
            onClick={() => handleAdd()}
          >
            Add Config
          </ButtonCustom>
        </Grid>
      </Container>
      <Search />
      <Table column={columnConfig} data={data} />
    </div>
  )
}

export default Config
