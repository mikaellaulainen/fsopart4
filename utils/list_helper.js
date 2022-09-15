const dummy = (blog) => {
  console.log(blog)
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((prevVal,{ likes }) => prevVal+likes,0)
}

module.exports= {
  dummy,
  totalLikes
}