//@ts-nocheck
import { SearchSchema } from 'src/types'
import weaviate from 'weaviate-client'
import * as fs from 'fs'
import { classifyText } from '../../../core/src/utils/textClassifier'
import path from 'path'
import { database } from '../database'
import axios from 'axios'

let client: weaviate.client
export async function initWeaviateClient(_train: boolean) {
  client = weaviate.client({
    scheme: process.env.WEAVIATE_CLIENT_SCHEME,
    host: process.env.WEAVIATE_CLIENT_HOST,
  })

  if (_train) {
    console.time('test')

    const data = await trainFromUrl(
      'https://www.toptal.com/developers/feed2json/convert?url=https%3A%2F%2Ffeeds.simplecast.com%2F54nAGcIl'
    )
    const data2 = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, '..', '..', '/weaviate/test_data.json'),
        'utf-8'
      )
    )
    for (let i = 0; i < data2.length; i++) {
      data.push(data2[i])
    }

    await train(data)
    console.timeEnd('test')
  }

  await getDocumentId('', '')
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

async function trainFromUrl(url: string): Promise<SearchSchema[]> {
  if (!url || url.length <= 0) {
    return []
  }

  const res = await axios.get(url)
  const data = res.data
  if (!data || data === undefined) {
    return []
  }

  const items = data.items
  if (!items || items === undefined) {
    return []
  }

  const _data: SearchSchema[] = []
  for (let i = 0; i < items.length; i++) {
    const object: SearchSchema = {
      title: items[i].title,
      description: items[i].content_html
        .replace('<br>', '\\n')
        .replace('</p>', '\\n')
        .replace(/<[^>]*>?/gm, ''),
    }
    _data.push(object)
  }

  return _data
}

export async function singleTrain(data: SearchSchema) {
  if (!client) {
    initWeaviateClient(false)
  }

  if (!data || data === undefined) {
    return
  }

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

async function getDocumentId(
  title: string,
  description: string
): Promise<string> {
  if (!client) {
    await initWeaviateClient(false)
  }

  const docs = await client.data.getter().do()
  for (let i = 0; i < docs.objects.length; i++) {
    if (
      docs.objects[i].properties.title == title &&
      docs.objects[i].properties.description == description
    ) {
      return docs.objects[i].id
    }
  }

  return ''
}

export async function updateDocument(
  oldTitle: string,
  newTitle: string,
  oldDescription: string,
  newDescription: string
) {
  if (!client) {
    await initWeaviateClient(false)
  }

  if (
    !oldTitle ||
    oldTitle.length <= 0 ||
    !newTitle ||
    newTitle.length <= 0 ||
    !oldDescription ||
    oldDescription.length <= 0 ||
    !newDescription ||
    newDescription.length <= 0
  ) {
    return
  }

  if (oldTitle === newTitle && oldDescription === newDescription) {
    return
  }

  const id = await getDocumentId(oldTitle, oldDescription)
  if (id && id.length > 0) {
    client.data
      .getterById()
      .withId(id)
      .do()
      .then(res => {
        console.log('RES:', res)
        const _class = res.class
        const schema = res.properties
        schema.title = newTitle
        schema.description = newDescription

        return client.data
          .updater()
          .withId(id)
          .withClassName(_class)
          .withProperties(schema)
          .do()
      })
      .then(res => {
        console.log(res)
      })
      .catch(err => {
        console.log(err)
      })
  }
}
export async function deleteDocument(title: string, description: string) {
  if (!client) {
    await initWeaviateClient(false)
  }

  if (!title || title.length <= 0 || !description || description.length <= 0) {
    return
  }

  const id = await getDocumentId(title, description)
  if (id && id.length > 0) {
    client.data
      .deleter()
      .withId(id)
      .do()
      .then(res => {
        console.log(res)
      })
      .catch(err => {
        console.error(err)
      })
  }
}
