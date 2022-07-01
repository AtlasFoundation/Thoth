import Koa from 'koa'

import { searchWikipedia } from "./helpers";
import { noAuth } from '../../middleware/auth';
import { Route } from "../../types";
import { CustomError } from "../../utils/CustomError";

const getWikipediaSummary = async (ctx: Koa.Context) => {
  console.log("GETTING WIKIPEDIA SUMMARY")
  const { keyword } = ctx.query

  console.log('query params', keyword)

  if (!keyword) throw new CustomError('input-failed', 'No keyword supplied in params')


  let start = Date.now()
  //gets the info from the wikipedia article, if the agent name can't be found it returns null, in order to send the default agent
  let out = null
  try {
    out = await searchWikipedia(keyword as string) as any
  } catch (e) {
    console.error(e)
    throw new CustomError('server-error', 'Error in getting wikipedia summary')
  }

  let stop = Date.now()
  console.log(
    `Time Taken to execute loaded data from wikipedia = ${(stop - start) / 1000
    } seconds`
  )
  start = Date.now()

  //const type = await namedEntityRecognition(out.result.title);

  // create a constant called name which uses the value of nameRaw but removes all punctuation
  // const name = nameRaw.replace(/[^\w\s]/gi, '');
  console.log('out is ', out)

  if (out.result.extract == '' || out.result.extract == null) {
    return console.log(
      "Error, couldn't find anything on wikiedia about " + name
    )
  }

  ctx.body = {
    result: out.result
  }
}

export const wikipedia: Route[] = [
  {
    path: '/wikipediaSummary',
    access: noAuth,
    get: getWikipediaSummary
  }
]