//@ts-nocheck
import { SearchSchema } from 'src/types'
import weaviate from 'weaviate-client'
import * as fs from 'fs'
import { classifyText } from '../../../core/src/utils/textClassifier'
import path from 'path'
import { database } from '../database'

let client: weaviate.client
export async function initWeaviateClient(_train: boolean) {
  client = weaviate.client({
    scheme: process.env.WEAVIATE_CLIENT_SCHEME,
    host: process.env.WEAVIATE_CLIENT_HOST,
  })

  if (_train) {
    await train(
      JSON.parse(
        fs.readFileSync(
          path.join(__dirname, '..', '..', '/weaviate/test_data.json'),
          'utf-8'
        )
      )
    )
  }
}

async function train(data: SearchSchema[]) {
  if (!client) {
    initWeaviateClient(false)
  }

  if (!data || data === undefined) {
    return
  }

  for (let i = 0; i < data.length; i++) {
    const object: SearchSchema = {
      title: data[i].title,
      description: data[i].description,
    }
    const topic = await classifyText(data[i].description)
    if (!topic || topic === undefined || topic.length <= 0) {
      continue
    }

    const res = await client.data
      .creator()
      .withClassName(topic)
      .withProperties(object)
      .do()

    console.log(res)
  }

  const documents = await database.instance.getAllDocuments()
  if (documents && documents.length > 0) {
    for (let i = 0; i < documents.length; i++) {
      const object = {
        title: 'Document',
        description: documents[i].description,
      }
      const topic = await classifyText(documents[i].description)
      if (!topic || topic === undefined || topic.length <= 0) {
        continue
      }

      const res = await client.data
        .creator()
        .withClassName(topic)
        .withProperties(object)
        .do()
      console.log(res)
    }
  }

  console.log('trained client')
}
export async function singleTrain(data: SearchSchema) {
  if (!client) {
    initWeaviateClient(false)
  }

  if (!data || data === undefined) {
    return
  }

  console.log('singleTrain data:', data)
  const object: SearchSchema = {
    title: data.title,
    description: data.description,
  }
  const topic = await classifyText(object.description)
  if (!topic || topic === undefined || topic.length <= 0) {
    return
  }

  const res = await client.data
    .creator()
    .withClassName(topic)
    .withProperties(object)
    .do()

  console.log(res)
}
export async function updateDocument() {
  await train(
    JSON.parse(
      fs.readFileSync(
        path.join(__dirname, '..', '..', '/weaviate/test_data.json'),
        'utf-8'
      )
    )
  )
}
export async function deleteDocument() {
  await train(
    JSON.parse(
      fs.readFileSync(
        path.join(__dirname, '..', '..', '/weaviate/test_data.json'),
        'utf-8'
      )
    )
  )
}

export async function search(query: string): SearchSchema {
  if (!client || client === undefined) {
    return { title: '', description: '' }
  }

  const topic = await classifyText(query)

  const info = await client.graphql
    .get()
    .withClassName(topic)
    .withFields(['title', 'description'])
    .withNearText({
      concepts: [query],
      certainty: 0.7,
    })
    .do()

  if (info.errors) {
    console.log(info.errors)
    return { title: '', description: '' }
  }

  if (
    info['data'] &&
    info['data']['Get'] &&
    info['data']['Get'][topic] &&
    info['data']['Get'][topic].length > 0
  ) {
    const data = info['data']['Get'][topic][0]

    return {
      title: data.title,
      description: data.description,
    }
  } else {
    return { title: '', description: '' }
  }
}
