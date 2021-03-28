const fetch = require('node-fetch')

module.exports.pokemon = async (event) => {
  const {
    url = process.env.url,
    start = process.env.start, 
    end = process.env.end
  } = event,
  promises = [],
  pokes = [],
  averages = [], 
  toAvg = {},
  output = {}

if (Number.isInteger(+start) && Number.isInteger(+end) && new URL(url)) {
    for (let i = +start; i <= +end; i++) {
      try {
        promises.push(
        fetch(`${url}${i}`)
        .then(res => res.json())
        .then(json => {
          pokes.push({
            name: json.name,
            stats: json.stats.map(s => { 
              toAvg[s.stat.name] = toAvg[s.stat.name] || [] // add the stat if it's not there
              toAvg[s.stat.name].push(s.base_stat) // add stat to running avg object for later
              return {name: s.stat.name, stat: s.base_stat} 
            })
          })

        })
        )
    } catch (e) {
      console.log('Error: ', e)
    }
}
} else {
  throw 'some good error'
}

await Promise.all(promises).then(() => {
  pokes.sort((a, b) => (a.name > b.name) ?  1 : -1)
  for (const [key, value] of Object.entries(toAvg)) {
    averages.push( {'name': key, 'stat': value.reduce((a, b) => a + b) / value.length})
  }
})

  return {
      'pokemon': pokes,
      'averages': averages
  }
}
