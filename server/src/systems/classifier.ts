import * as fs from 'fs'
import path from 'path'
import { ClassifierSchema } from '../types'
//@ts-ignore
import weaviate from 'weaviate-client'

let client: weaviate.client
export async function initWeaviateClassifier(_train: boolean) {
  client = weaviate.client({
    scheme: process.env.CLASSIFIER_CLIENT_SCHEME,
    host: process.env.CLASSIFIER_CLIENT_HOST,
  })

  console.log('classifier inited')
  if (_train) {
    await train(
      JSON.parse(
        fs.readFileSync(
          path.join(__dirname, '..', '..', '/classifier/data.json'),
          'utf-8'
        )
      )
    )
  }
}

async function train(data: ClassifierSchema[]) {
  if (!client) {
    initWeaviateClassifier(false)
  }

  if (!data || data === undefined) {
    return
  }

  for (let i = 0; i < data.length; i++) {
    if (Array.isArray(data[i].examples)) {
      data[i].examples = (data[i].examples as string[]).join(', ')
    }

    console.log(typeof data[i].examples, data[i].examples)

    const res = await client.data
      .creator()
      .withClassName(data[i].type)
      .withProperties(data[i])
      .do()

    console.log(res)
  }
}

export async function classify(query: string): Promise<string> {
  return ''
  /*if (!client || client === undefined) {
    return ''
  }

  const info = await client.graphql
    .get()
    .withClassName('emotion')
    .withFields(['className', 'keywords', 'info'])
    .withNearText({
      concepts: [query],
      certainty: 0.7,
    })
    .do()

  if (info.errors) {
    console.log(info.errors)
    return ''
  }

  if (
    info['data'] &&
    info['data']['Get'] &&
    info['data']['Get']['classifier'] &&
    info['data']['Get']['classifier'].length > 0
  ) {
    const data = info['data']['Get']['classifier'][0]

    return data.className
  } else {
    return ''
  }*/
}
