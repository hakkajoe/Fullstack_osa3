require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Entry = require('./models/entry')

morgan.token('postData', (req, res) => {
    if (req.method === 'POST') {
      return JSON.stringify(req.body)
    }
    return '-'
})

app.use(express.static('build'))
app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postData'))

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

app.get('/api/entries', (req, res) => {
    Entry.find({}).then(entries => {
        res.json(entries)
    })
})

const generateId = () => {
    const maxId = Math.floor(Math.random() * (9999999 - 10 + 1)) + 10
    return maxId
}
  
app.post('/api/entries', (request, response) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({ 
            error: 'name or number missing' 
        })
    }

    if (entries.some(entry => entry.name === body.name)) {
        return response.status(400).json({ 
            error: 'name must be unique' 
        })
    }

    const entry = new Entry({
        id: generateId(),
        name: body.name,
        number: body.number
    })

    entry.save().then(savedEntry => {
        response.json(savedEntry)
    })
})

app.get('/api/info', (req, res) => {
    const entries = entries.length
    const dateReceived = new Date()

    const infoText = `
    <p>Phonebook has info for ${entries} people</p>
    <p>${dateReceived}</p>
    `

    res.send(infoText)
})

app.get('/api/entries/:id', (request, response) => {
    Entry.findById(request.params.id).then(entry => {
        response.json(entry)
    })
})

app.delete('/api/entries/:id', (request, response) => {
    const id = Number(request.params.id)
    entries = entries.filter(entry => entry.id !== id)
  
    response.status(204).end()
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})