/*
  Given a string `substr`, getMovieTitles() must perform the following tasks:
    1. Query https://jsonmock.hackerrank.com/api/movies/search/?Title=substr (replace substr). 
    2. Initialize the titles array to store total string elements. Store the Title of each movie meeting the search criterion in the titles array.
    3. Sort titles in ascending order and return it as your answer.
*/

const https = require('https')
const log = console.log

function getTotalPages(url, callback) {
  https.get(url, res => {
    let data = ''

    res.on('data', chunk => data += chunk)

    res.on('end', () => {
      return callback(null, JSON.parse(data).total_pages)
    })
  }).on('error', err => {
    return callback(err, null)
  })
}

function getMovieTitlesHelper(urls, callback) {
  let titles = [];
  let counter = 1

  urls.forEach(url => {
    https.get(url, res => {
      let data = ''

      res.on('data', chunk => data += chunk)

      res.on('end', () => {
        const movies = JSON.parse(data).data

        movies.forEach(movie => titles.push(movie.Title))

        if (counter === urls.length) {
          return callback(null, titles)
        }
        counter++
      })
    }).on('error', err => {
      return callback(err, null)
    })
  })
}

/*
 * Complete the function below.
 * Use console.log to print the result, you should not return from the function.
 */
const getMovieTitles = substr => {
  if (substr === '') {
    return null;
  }

  const url = `https://jsonmock.hackerrank.com/api/movies/search/?Title=${substr}`
  getTotalPages(url, (err, totalPages) => {
    if (err) {
      log('Error getting total number of available pages:', err)
    } else {
      const urls = [];
      for (let pageNo = 1; pageNo <= totalPages; pageNo++) {
        urls.push(`${url}&page=${pageNo}`)
      }
      getMovieTitles(urls, (err, titles) => {
        if (err) {
          log('Error retrieving movies titles:', err)
        } else {
          titles.sort().forEach(title => log(title))
        }
      })
    }
  })
}

getMovieTitles('spiderman')