import { config } from 'dotenv-flow'
config()
//@ts-ignore
import cors from '@koa/cors'
import Router from '@koa/router'
import HttpStatus from 'http-status-codes'
import Koa from 'koa'
import koaBody from 'koa-body'
import compose from 'koa-compose'
import { cacheManager } from './cacheManager'
import { database } from './database'
import { creatorToolsDatabase } from './databases/creatorTools'
import { routes } from './routes'
import { Handler, Method, Middleware } from './types'
import { initTextToSpeech } from './systems/googleTextToSpeech'
import { initFileServer } from './systems/fileServer'
import https from 'https'
import http from 'http'
import * as fs from 'fs'
import spawnPythonServer from './systems/pythonServer'
import { initWeaviateClient } from './systems/weaviateClient'
import cors_server from './cors-server'

const app: Koa = new Koa()
const router: Router = new Router()
// @ts-ignore
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

async function init() {
  // async function initLoop() {
  //   new roomManager()
  //   const expectedServerDelta = 1000 / 60
  //   let lastTime = 0

  //   // @ts-ignore
  //   globalThis.requestAnimationFrame = f => {
  //     const serverLoop = () => {
  //       const now = Date.now()
  //       if (now - lastTime >= expectedServerDelta) {
  //         lastTime = now
  //         f(now)
  //       } else {
  //         setImmediate(serverLoop)
  //       }
  //     }
  //     serverLoop()
  //   }
  // }

  // required for some current consumers (i.e Thoth)
  // to-do: standardize an allowed origin list based on env values or another source of truth?

  new database()
  await database.instance.connect()
  await creatorToolsDatabase.sequelize.sync({
    force: process.env.REFRESH_DB?.toLowerCase().trim() === 'true',
  })
  await database.instance.firstInit()

  await initFileServer()
  await initTextToSpeech()
  new cacheManager()
  await initWeaviateClient(
    process.env.WEAVIATE_IMPORT_DATA?.toLowerCase().trim() === 'true',
    process.env.CLASSIFIER_IMPORT_DATA?.toLowerCase().trim() === 'true'
  )

  if (process.env.RUN_PYTHON_SERVER === 'true') {
    spawnPythonServer()
  }

  /*const string = 'test string'
  const key = 'test_key'
  cacheManager.instance.set('global', key, string)
  cacheManager.instance.set('global', 'earth', 'earth is a planet')
  console.log(await cacheManager.instance.get('global', key))
  console.log(await cacheManager.instance.get('global', 'test key'))
  console.log(await cacheManager.instance.get('global', 'testkey'))
  console.log(await cacheManager.instance.get('global', 'TEST KEY'))
  console.log(await cacheManager.instance.get('global', 'TEST_KEY'))
  console.log(await cacheManager.instance.get('global', 'key_test'))
  console.log(await cacheManager.instance.get('global', 'key test'))
  console.log(await cacheManager.instance.get('global', 'ttes_key'))*/
  const options = {
    origin: '*',
  }
  app.use(cors(options))

  new cors_server(
    parseInt(process.env.CORS_PORT as string),
    '0.0.0.0',
    process.env.USESSL === 'true' &&
      fs.existsSync('certs/') &&
      fs.existsSync('certs/key.pem') &&
      fs.existsSync('certs/cert.pem')
  )

  process.on('unhandledRejection', (err: Error) => {
    console.error('Unhandled Rejection:' + err + ' - ' + err.stack)
  })

  // Middleware used by every request. For route-specific middleware, add it to you route middleware specification
  app.use(koaBody({ multipart: true }))

  const createRoute = (
    method: Method,
    path: string,
    middleware: Middleware[],
    handler: Handler
  ) => {
    // This gets a typescript error
    // router[method](path, compose(_middleware), handler);
    // TODO: Fix this hack:
    switch (method) {
      case 'get':
        router.get(path, compose(middleware), handler)
        break
      case 'post':
        router.post(path, compose(middleware), handler)
        break
      case 'put':
        router.put(path, compose(middleware), handler)
        break
      case 'delete':
        router.delete(path, compose(middleware), handler)
        break
      case 'head':
        router.head(path, compose(middleware), handler)
        break
      case 'patch':
        router.patch(path, compose(middleware), handler)
        break
    }
  }

  type MiddlewareParams = {
    middleware: Middleware[] | undefined
  }

  const routeMiddleware = ({ middleware = [] }: MiddlewareParams) => {
    return [...middleware]
  }

  // Create Koa routes from the routes defined in each module
  routes.forEach(route => {
    const { method, path, middleware, handler } = route
    const _middleware = routeMiddleware({ middleware })
    if (method && handler) {
      createRoute(method, path, _middleware, handler)
    }
    if (route.get) {
      createRoute('get', path, _middleware, route.get)
    }
    if (route.put) {
      createRoute('put', path, _middleware, route.put)
    }
    if (route.post) {
      createRoute('post', path, _middleware, route.post)
    }
    if (route.delete) {
      createRoute('delete', path, _middleware, route.delete)
    }
    if (route.head) {
      createRoute('head', path, _middleware, route.head)
    }
    if (route.patch) {
      createRoute('patch', path, _middleware, route.patch)
    }
  })

  app.use(router.routes()).use(router.allowedMethods())

  // generic error handling
  app.use(async (ctx: Koa.Context, next: () => Promise<any>) => {
    try {
      await next()
    } catch (error) {
      ctx.status =
        error.statusCode || error.status || HttpStatus.INTERNAL_SERVER_ERROR
      error.status = ctx.status
      ctx.body = { error }
      ctx.app.emit('error', error, ctx)
    }
  })

  const PORT: number = Number(process.env.PORT) || 8001
  const useSSL =
    process.env.USESSL === 'true' &&
    fs.existsSync('certs/') &&
    fs.existsSync('certs/key.pem') &&
    fs.existsSync('certs/cert.pem')

  var optionSsl = {
    key: useSSL ? fs.readFileSync('certs/key.pem') : '',
    cert: useSSL ? fs.readFileSync('certs/cert.pem') : '',
  }
  useSSL
    ? https
        .createServer(optionSsl, app.callback())
        .listen(PORT, '0.0.0.0', () => {
          console.log('Https Server listening on: 0.0.0.0:' + PORT)
        })
    : http.createServer(app.callback()).listen(PORT, '0.0.0.0', () => {
        console.log('Http Server listening on: 0.0.0.0:' + PORT)
      })
  // await initLoop()
}
init()
