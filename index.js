require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Entry = require('./models/entry')
const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    
    } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
    }
  
    next(error)
}

morgan.token('postData', (req, res) => {
    if (req.method === 'POST') {
      return JSON.stringify(req.body)
    }
    return '-'
})

app.use(express.static('dist'))
app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postData'))
app.use(errorHandler)

let entries = [
    {
      id: 1,
      name: "Arto Hellas",
      number: "040-123456"
    },
    {
      id: 2,
      name: "Ada Lovelace",
      number: "39-44-5323523"
    },
    {
      id: 3,
      name: "Dan Abramov",
      number: "12-43-234345"
    },
    {
      id: 4,
      name: "Mary Poppendick",
      number: "39-23-6423122"
    }
]

app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
})

app.get('/api/entries', (req, res, next) => {
    Entry.find({}).then(entries => {
        res.json(entries)
    })
    .catch(error => next(error))
})
  
app.post('/api/entries', (request, response, next) => {
    const body = request.body

    const entry = new Entry({
        name: body.name,
        number: body.number
    })

    entry.save()
    .then(savedEntry => {
        response.json(savedEntry)
    })
    .catch(error => {
        if (error.name === 'ValidationError') {
            response.status(400).json({ error: error.message })
        } else {
            next(error)
        }
    })
})

app.patch('/api/entries/:id', (request, response, next) => {
    const body = request.body

    if (!body.number) {
        return response.status(400).json({ 
            error: 'number missing' 
        })
    }

    const entry = {
        name: body.name,
        number: body.number
    }

    Entry.findByIdAndUpdate(request.params.id, entry, { new: true, runValidators: true, context: 'query' })
        .then(updatedEntry => {
            if (updatedEntry) {
                response.json(updatedEntry)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.get('/api/info', (req, res) => {
    const numberOfEntries = entries.length
    const dateReceived = new Date()

    const infoText = `
    <p>Phonebook has info for ${numberOfEntries} people</p>
    <p>${dateReceived}</p>
    `

    res.send(infoText)
})

app.get('/api/entries/:id', (request, response, next) => {
    Entry.findById(request.params.id)
        .then(entry => {
            if (entry) {
                response.json(entry)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.delete('/api/entries/:id', (request, response, next) => {
    Entry.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})