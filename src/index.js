import './io'
import server from './server'
import { HOST, PORT } from './config'

server.listen(PORT, () => {
  console.log('Server listening at:', `http://${HOST}:${PORT}`)
})
