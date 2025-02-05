import { serve } from '@hono/node-server'
import { Hono } from 'hono'

import { logger } from 'hono/logger';
import { scrapeRoute } from './routes/scrape.js';
import { serveStatic } from 'hono/serve-static';

const app = new Hono()

app.use(logger())

const apiRoutes = app.basePath("/api")
  .route("/scrape", scrapeRoute)

// app.get('*', serveStatic({ root: './frontend/dist' }))
// app.get('*', serveStatic({ path: './frontend/dist/index.html' }))

const port = 3000
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})
