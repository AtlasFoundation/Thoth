import { entities } from './routes/entities'
import { spells } from './routes/spells'
import { wikipedia } from './routes/wikipedia'
import { Route } from './types'

export const routes: Route[] = [
  ...wikipedia,
  ...spells,
  ...entities,
]
