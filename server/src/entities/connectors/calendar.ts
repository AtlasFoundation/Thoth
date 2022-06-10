// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import fs from 'fs'

import google from 'googleapis'
import path from 'path'
import DiscordClient from './discord'

import { getRelativeDate, isValidArray } from '../../utils/utils'

const discord_client = new DiscordClient()

const { sendMessageToChannel } = discord_client

export const testData = {
  summary: 'Google I/O 2015',
  location: '800 Howard St., San Francisco, CA 94103',
  description: "A chance to hear more about Google's developer products.",
  start: {
    dateTime: getRelativeDate({ daysOffset: 0, hour: 15 }).toJSON(),
    timeZone: 'America/Los_Angeles',
  },
  end: {
    dateTime: getRelativeDate({ daysOffset: 0, hour: 16 }).toJSON(),
    timeZone: 'America/Los_Angeles',
  },
  recurrence: ['RRULE:FREQ=DAILY;COUNT=2'],
}

// to generate a google token for dev mode,
// you can use https://developers.google.com/oauthplayground/

const rootDir = path.resolve(path.dirname(''))

// If modifying these scopes, delete token.json.
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
]
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = rootDir + '/credentials/token.json'

export const initCalendar = async () => {
  // Load client secrets from a local file.
  const content: any = await fs.promises.readFile(
    rootDir + '/credentials/credentials.json',
    'binary'
  )
  // Authorize a client with credentials, then call the Google Calendar API.
  // authorize(JSON.parse(content), getCalendarEvents)
  // authorize(JSON.parse(content), deleteCalendarEvent)
  // authorize(JSON.parse(content), addCalendarEvent)
  return JSON.parse(content)
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
export const authorize = async (credentials: object, callback?: function) => {
  const { client_secret, client_id, redirect_uris } = credentials.installed
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  )

  // Check if we have previously stored a token.
  const token = await fs.promises.readFile(TOKEN_PATH, 'binary')

  if (!token) return callback('Token Couln`t find', null)
  oAuth2Client.setCredentials(JSON.parse(token))

  return oAuth2Client
}

/**
 * Add the calendar event in the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param {object} eventDetails An authorized OAuth2 client.
 */
export const addCalendarEvent = async (
  auth: google.auth.OAuth2,
  eventDetails: object
) => {
  return await new Promise(async (resolve, reject) => {
    if (!auth) return console.log('Missing Token')

    const { summary, description, start, end, calendarId } = eventDetails

    const calendar = google.calendar({ version: 'v3', auth })
    return await calendar.events.insert(
      {
        calendarId: 'primary',
        resource: {
          summary: summary,
          description: description,
          start: {
            dateTime: start,
          },
          end: {
            dateTime: end,
          },
          ...eventDetails,
        },
      },
      callable
    )

    async function callable(err, res) {
      if (err) {
        console.log('There was an error contacting the Calendar service:', err)
        return resolve(null)
      }

      try {
        const config: any = await database.instance.getConfig()
        const channle_name: string = config['discord_calendar_channel']

        sendMessageToChannel(
          channle_name,
          res.summary + ' has been added to your calendar'
        )
      } catch (error) {
        console.log(error)
        resolve(null)
      }

      resolve(res)
    }
  })
}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
export const getCalendarEvents = async (auth: google.auth.OAuth2) => {
  return await new Promise(async (resolve, reject) => {
    if (!auth) return console.log('Missing Token')

    const calendar = google.calendar({ version: 'v3', auth })

    calendar.events.list(
      {
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      },
      async (err, res) => {
        if (err) {
          console.log('The API returned an error: ' + err)
          resolve(null)
        }

        const eventsList = res.items

        if (isValidArray(eventsList)) {
          const updatedEvent = await eventsList
            .map((event, i) => {
              const eventDate = new Date(
                event.start.dateTime || event.start.date
              )
              const now = new Date()
              if (eventDate > now) {
                const diffMs = eventDate - now
                const diffMins = Math.round(
                  ((diffMs % 86400000) % 3600000) / 60000
                )
                if (diffMins <= 60 && diffMins > 0) {
                  console.log(
                    'Event',
                    i + 1,
                    ':',
                    event.summary,
                    'in',
                    diffMins,
                    'minutes'
                  )
                  return event
                }
                return null
              }
            })
            .filter(e => e)

          resolve(updatedEvent)
        }

        resolve(null)
      }
    )
  })
}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2, eventId} auth  An authorized OAuth2 client.
 */

export const deleteCalendarEvent = async (
  auth: google.auth.OAuth2,
  eventId: string
) => {
  return await new Promise(async (resolve, reject) => {
    if (!auth) return console.log('Missing Token')

    const calendar = google.calendar({ version: 'v3', auth })

    return await calendar.events.delete(
      {
        calendarId: 'primary',
        eventId: eventId,
      },
      async (err, res) => {
        if (err) {
          console.log('The API returned an error: ' + err)
          resolve(null)
        }

        try {
          const config: any = await database.instance.getConfig()
          const channle_name: string = config['discord_calendar_channel']
          sendMessageToChannel(channle_name, 'Event deleted')
        } catch (error) {
          console.log(error)
          resolve(null)
        }

        resolve(true)
      }
    )
  })
}
