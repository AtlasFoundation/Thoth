import { useState, useEffect, Fragment } from 'react'
import DayLabels from './DayLabes'
import './calendar.css'

const LOADING_TIME = 1000

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const toStartOfDay = date => {
  const newDate = new Date(date)
  newDate.setHours(0)
  newDate.setMinutes(0)
  newDate.setSeconds(0)
  newDate.setMilliseconds(0)
  return newDate
}

const pad = input => {
  return input < 10 ? '0' + input : input
}

const dateToInputFormat = date => {
  if (!date) {
    return null
  }

  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())

  return `${date.getFullYear()}-${month}-${day}T${hours}:${minutes}`
}

const parseEvents = events => {
  return events.map(event => {
    const from = new Date(event.dateFrom)
    const to = new Date(event.dateTo)

    return {
      ...event,
      from,
      to,
    }
  })
}

const findEventsForDate = (events, date) => {
  const dateTime = date.getTime()

  return events.filter(event => {
    const eventFromTime = toStartOfDay(event.from).getTime()
    const eventToTime = toStartOfDay(event.to).getTime()

    return dateTime >= eventFromTime && dateTime <= eventToTime
  })
}

const Navigation = ({ date, setDate, setShowingEventForm }) => {
  return (
    <div className="navigation">
      <div
        className="back"
        onClick={() => {
          const newDate = new Date(date)
          newDate.setMonth(newDate.getMonth() - 1)
          setDate(newDate)
        }}
      >
        {'<'} {MONTHS[date.getMonth() === 0 ? 11 : date.getMonth() - 1]}
      </div>

      <div className="monthAndYear">
        {MONTHS[date.getMonth()]} {date.getFullYear()}
        <a onClick={() => setShowingEventForm({ visible: true })}></a>
      </div>

      <div
        className="forward"
        onClick={() => {
          const newDate = new Date(date)
          newDate.setMonth(newDate.getMonth() + 1)
          setDate(newDate)
        }}
      >
        {MONTHS[date.getMonth() === 11 ? 0 : date.getMonth() + 1]} {'>'}
      </div>
    </div>
  )
}

const MiniEvent = ({ event, setViewingEvent }) => {
  return (
    <div
      className={`miniEvent ${
        event.type ? event.type.toLowerCase() : 'standard'
      }`}
      onClick={() => setViewingEvent(event)}
    >
      {event.name}
    </div>
  )
}

const EventModal = ({
  event,
  setViewingEvent,
  setShowingEventForm,
  deleteEvent,
}) => {
  return (
    <Modal
      onClose={() => setViewingEvent(null)}
      title={`${event.name} (${event.type})`}
      className="eventModal"
    >
      <p>
        From <b>{event.dateFrom}</b> to <b>{event.dateTo}</b>
      </p>
      <p>{event.meta}</p>

      <button
        onClick={() => {
          setViewingEvent(null)
          setShowingEventForm({ visible: true, withEvent: event })
        }}
      >
        Edit event
      </button>

      <button className="red" onClick={() => deleteEvent(event)}>
        Delete event
      </button>

      <a className="close" onClick={() => setViewingEvent(null)}>
        Back to calendar
      </a>
    </Modal>
  )
}

const EventForm = ({
  setShowingEventForm,
  addEvent,
  editEvent,
  withEvent,
  setViewingEvent,
  preselectedDate,
}) => {
  const newEvent = withEvent || {}
  if (!withEvent && !!preselectedDate) {
    newEvent.dateFrom = dateToInputFormat(preselectedDate)
  }
  const [event, setEvent] = useState(newEvent)

  return (
    <Modal
      className="eventheader"
      onClose={() => setShowingEventForm({ visible: false })}
      title={`${withEvent ? 'Edit event' : 'Add a new event'}`}
    >
      <div className="form">
        <label>
          Name
          <input
            type="text"
            placeholder="ie. My Event"
            defaultValue={event.name}
            onChange={e => setEvent({ ...event, name: e.target.value })}
          />
        </label>

        <label>
          Start
          <input
            type="datetime-local"
            defaultValue={event.dateFrom || dateToInputFormat(preselectedDate)}
            onChange={e => setEvent({ ...event, dateFrom: e.target.value })}
          />
        </label>

        <label>
          End
          <input
            type="datetime-local"
            defaultValue={event.dateTo}
            onChange={e => setEvent({ ...event, dateTo: e.target.value })}
          />
        </label>

        <label>
          Type
          <select
            value={event.type ? event.type.toLowerCase() : 'standard'}
            onChange={e => setEvent({ ...event, type: e.target.value })}
          >
            <option value="standard">Standard</option>
            <option value="busy">Busy</option>
            <option value="holiday">Holiday</option>
          </select>
        </label>

        <label>
          Description
          <input
            type="text"
            placeholder="Describe the event"
            defaultValue={event.meta}
            onChange={e => setEvent({ ...event, meta: e.target.value })}
          />
        </label>

        {withEvent ? (
          <Fragment>
            <button onClick={() => editEvent(event)}>Edit event</button>
            <a
              className="close"
              onClick={() => {
                setShowingEventForm({ visible: false })
                setViewingEvent(event)
              }}
            >
              Cancel
            </a>
          </Fragment>
        ) : (
          <Fragment>
            <button onClick={() => addEvent(event)} className="Add">
              Add event
            </button>

            <button
              className="close"
              onClick={() => setShowingEventForm({ visible: false })}
            >
              Cancel
            </button>
          </Fragment>
        )}
      </div>
    </Modal>
  )
}

const Modal = ({ children, onClose, title, className }) => {
  return (
    <Fragment>
      <div className="overlay" onClick={onClose} />
      <div className={`modal ${className}`}>
        <h3>{title}</h3>
        <div className="inner">{children}</div>
      </div>
    </Fragment>
  )
}

const Loader = () => {
  return (
    <Fragment>
      <div className="overlay" />
      <div className="loader">
        <div className="lds-roller">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </Fragment>
  )
}

const Feedback = ({ message, type }) => {
  return <div className={`feedback ${type}`}>{message}</div>
}

const Grid = ({
  date,
  events,
  setViewingEvent,
  setShowingEventForm,
  actualDate,
}) => {
  const ROWS_COUNT = 6
  const currentDate = toStartOfDay(new Date())
  const startingDate = new Date(date.getFullYear(), date.getMonth(), 1)
  startingDate.setDate(startingDate.getDate() - (startingDate.getDay() - 1))

  const dates: any[] = []
  for (let i = 0; i < ROWS_COUNT * 7; i++) {
    const date = new Date(startingDate)
    dates.push({ date, events: findEventsForDate(events, date) })
    startingDate.setDate(startingDate.getDate() + 1)
  }

  return (
    <Fragment>
      {dates.map((date, index) => {
        return (
          <div
            key={index}
            className={`cell ${
              date.date.getTime() == currentDate.getTime() ? 'current' : ''
            } ${
              date.date.getMonth() != actualDate.getMonth() ? 'otherMonth' : ''
            }`}
          >
            <div className="date">
              <a
                className="addEventOnDay"
                onClick={() =>
                  setShowingEventForm({
                    visible: true,
                    preselectedDate: date.date,
                  })
                }
              >
                {date.date.getDate()}
              </a>
            </div>
            {date.events.map((event, index) => (
              <MiniEvent
                key={index}
                event={event}
                setViewingEvent={setViewingEvent}
              />
            ))}
          </div>
        )
      })}
    </Fragment>
  )
}

export const CalendarApp = ({ preloadedEvents = [] }) => {
  const [date, setDate] = useState(new Date())
  const [viewingEvent, setViewingEvent] = useState(false)
  const [showingEventForm, setShowingEventForm] = useState({
    visible: false,
    withEvent: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState([] as any)

  const parsedEvents = parseEvents(preloadedEvents)
  const [events, setEvents] = useState(parsedEvents)

  useEffect(() => {
    console.log("Events has changed... Let's load some fresh data")
  }, [date])

  const addEvent = event => {
    setIsLoading(true)
    setShowingEventForm({ visible: false, withEvent: false })
    setTimeout(() => {
      const parsedEvents = parseEvents([event])

      const updatedEvents = [...events]
      updatedEvents.push(parsedEvents[0])

      setEvents(updatedEvents)
      setIsLoading(false)
      showFeedback({ message: 'Event created successfully', type: 'success' })
    }, LOADING_TIME)
  }

  const editEvent = event => {
    setIsLoading(true)
    setShowingEventForm({ visible: false, withEvent: false })

    setTimeout(() => {
      const parsedEvent = parseEvents([event])

      const updatedEvents = [...events].map(updatedEvent => {
        return updatedEvent.id === event.id ? parsedEvent[0] : updatedEvent
      })

      setEvents(updatedEvents)
      setIsLoading(false)
      showFeedback({ message: 'Event edited successfully', type: 'success' })
    }, LOADING_TIME)
  }

  const deleteEvent = event => {
    setIsLoading(true)
    setViewingEvent(false)
    setShowingEventForm({ visible: false, withEvent: false })

    setTimeout(() => {
      const updatedEvents = [...events].filter(
        finalEvent => finalEvent.id != event.id
      )

      setEvents(updatedEvents)
      setIsLoading(false)
      showFeedback({ message: 'Event deleted successfully', type: 'success' })
    }, LOADING_TIME)
  }

  const showFeedback = ({ message, type, timeout = 2500 }) => {
    setFeedback({ message, type })
    setTimeout(() => {
      setFeedback(null)
    }, timeout)
  }

  return (
    <div className="calendar-UI">
      {isLoading && <Loader />}

      {feedback && <Feedback message={feedback.message} type={feedback.type} />}

      <Navigation
        date={date}
        setDate={setDate}
        setShowingEventForm={setShowingEventForm}
      />

      <DayLabels />

      <Grid
        date={date}
        events={events}
        setShowingEventForm={setShowingEventForm}
        setViewingEvent={setViewingEvent}
        actualDate={date}
      />

      {viewingEvent && (
        <EventModal
          event={viewingEvent}
          setShowingEventForm={setShowingEventForm}
          setViewingEvent={setViewingEvent}
          deleteEvent={deleteEvent}
        />
      )}

      {showingEventForm && showingEventForm.visible && (
        <EventForm
          withEvent={showingEventForm.withEvent}
          preselectedDate={showingEventForm.withEvent}
          setShowingEventForm={setShowingEventForm}
          addEvent={addEvent}
          editEvent={editEvent}
          setViewingEvent={setViewingEvent}
        />
      )}
    </div>
  )
}
