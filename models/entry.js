const mongoose = require('mongoose')

mongoose.set('strictQuery', false)


const url = process.env.MONGODB_URI


console.log('connecting to', url)
mongoose.connect(url)

  .then(console.log('connected to MongoDB'))
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const entrySchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true
  },
  number: {
    type: String,
    required: true,
    validate: {
      validator: (value) => {
        const parts = value.split('-')
        if (parts.length !== 2) {
          return false
        }

        const [firstPart, secondPart] = parts
        const isFirstPartNumeric = /^\d+$/.test(firstPart)
        const isSecondPartNumeric = /^\d+$/.test(secondPart)

        return (
          isFirstPartNumeric &&
          isSecondPartNumeric &&
          firstPart.length >= 2 &&
          firstPart.length <= 3 &&
          value.replace('-', '').length >= 8
        )
      },
      message: 'Number must have two parts separated by \'-\', the first part being 2 or 3 numbers, and contain at least 8 numbers in total.',
    },
  },
})

entrySchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})


module.exports = mongoose.model('Entry', entrySchema)