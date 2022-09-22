
const mongoose = require('mongoose')

const url= `mongodb+srv://hostmikke:hustlers1205@cluster0.jxozvxz.mongodb.net/testbloglist?retryWrites=true&w=majority`

mongoose.connect(url)

const blogSchema = mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number
})

const Person = mongoose.model('person', personShema)


if(process.argv.length === 3){
  console.log('Phonebook:')
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(person.name, person.number)
    })
    mongoose.connection.close()
    process.exit(1)
  })
}
if(process.argv.length === 5){
  const person= new Person({
    name : process.argv[3],
    number: process.argv[4],
    id : Math.floor(Math.random() * 10000)
  })

  person.save().then(() => {
    console.log(`Added ${person.name} number ${person.number} to phonebook`)
    mongoose.connection.close()
  })
}


const mongoose = require('mongoose')



module.exports = mongoose.model('Blog', blogSchema)