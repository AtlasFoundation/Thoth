import Table from '../../common/Table'
import Search from '../../common/Search'
import { styled } from '@mui/material/styles'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { columnScope } from '../../common/Variable/column'

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
          <ButtonCustom variant="contained" size="medium" fullWidth>
            Add Scope
          </ButtonCustom>
        </Grid>
      </Container>
      <Search />
      <Table column={columnScope} />
    </div>
  )
}

export default Scope
