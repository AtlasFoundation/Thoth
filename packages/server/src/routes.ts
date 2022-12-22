import { entities } from './routes/entities'
import { spells } from './routes/spells'
import { Route } from './types'

export const routes: Route[] = [
  ...spells,
  ...entities,
]
