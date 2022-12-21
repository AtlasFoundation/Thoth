import { Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthProvider'

const defaultGroups = ['internal', 'thoth', 'creator-tester']

const RequireAuth = (props: Record<string, any>) => {
  // const { user, loginRedirect } = useAuth()
  // const groups = props?.access
  //   ? [...props?.access, ...defaultGroups]
  //   : defaultGroups

  // const authorized =
  //   user &&
  //   !user.groups.includes('public') &&
  //   user.groups.some(g => groups.includes(g))

  return <Outlet />
}

export default RequireAuth
