const mongoose = require('mongoose')

if (process.argv.length !== 3 && process.argv.length !== 5) {
  console.log('undefined command')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url =
  `mongodb+srv://joelhakkarainen95:${password}@cluster0.y2ksupn.mongodb.net/phonebookApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const entrySchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Entry = mongoose.model('Entry', entrySchema)

if (process.argv.length === 5) {
  const name = process.argv[3]
  const number = process.argv[4]

  const entry = new Entry({
    name: name,
    number: number,
  })

  entry.save().then(result => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
} else if (process.argv.length === 3) {
  Entry.find({}).then(result => {
    console.log('phonebook:')
    result.forEach(entry => {
      console.log(entry.name, entry.number)
    })
    mongoose.connection.close()
  })
}