import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import pg from 'pg'

const { Pool } = pg
const app = express()
const port = Number(process.env.PORT || 3001)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(process.env.PGSSL === 'true' ? { ssl: {} } : {}),
})

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json({ limit: '32kb' }))

const postFields = `
  id,
  name,
  date_made AS "dateMade",
  image_url AS "imageUrl",
  recipe_source AS "recipeSource",
  recipe_type AS "recipeType",
  tips,
  thoughts,
  flavors,
  enjoyment_rating AS "enjoymentRating",
  description
`

const editableFields = new Set([
  'name',
  'dateMade',
  'imageUrl',
  'recipeSource',
  'recipeType',
  'tips',
  'thoughts',
  'flavors',
  'enjoymentRating',
  'description',
])

function validatePost(post) {
  const validDate = typeof post.dateMade === 'string'
    && /^\d{4}-\d{2}-\d{2}$/.test(post.dateMade)
    && !Number.isNaN(Date.parse(`${post.dateMade}T00:00:00Z`))
    && new Date(`${post.dateMade}T00:00:00Z`).toISOString().slice(0, 10) === post.dateMade

  let validImageUrl = false
  try {
    const parsedUrl = new URL(post.imageUrl)
    validImageUrl = ['http:', 'https:'].includes(parsedUrl.protocol)
  } catch {
    validImageUrl = false
  }

  const validList = (value) => Array.isArray(value)
    && value.every((item) => typeof item === 'string' && item.trim().length > 0)

  if (
    typeof post.name !== 'string' || !post.name.trim() || post.name.length > 140
    || !validDate || !validImageUrl
    || typeof post.recipeType !== 'string' || !post.recipeType.trim() || post.recipeType.length > 50
    || typeof post.recipeSource !== 'string' || post.recipeSource.length > 500
    || typeof post.description !== 'string' || !post.description.trim() || post.description.length > 500
    || !Number.isInteger(post.enjoymentRating) || post.enjoymentRating < 1 || post.enjoymentRating > 5
    || !validList(post.tips) || !validList(post.thoughts) || !validList(post.flavors)
  ) {
    return 'Please provide valid details for every required field.'
  }

  return null
}

function normalizePost(post) {
  return {
    ...post,
    name: post.name.trim(),
    imageUrl: post.imageUrl.trim(),
    recipeSource: post.recipeSource.trim(),
    recipeType: post.recipeType.trim(),
    description: post.description.trim(),
    tips: post.tips.map((item) => item.trim()),
    thoughts: post.thoughts.map((item) => item.trim()),
    flavors: post.flavors.map((item) => item.trim()),
  }
}

function validPostId(value) {
  return /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) > 0
}

function hasOnlyEditableFields(body) {
  return body && typeof body === 'object' && !Array.isArray(body)
    && Object.keys(body).every((key) => editableFields.has(key))
}

async function findPost(id) {
  const { rows } = await pool.query(
    `SELECT ${postFields} FROM baking_posts WHERE id = $1`,
    [id],
  )
  return rows[0] ?? null
}

async function updatePost(id, post) {
  const { rows } = await pool.query(
    `UPDATE baking_posts
     SET name = $1, date_made = $2, image_url = $3, recipe_source = $4,
         recipe_type = $5, tips = $6, thoughts = $7, flavors = $8,
         enjoyment_rating = $9, description = $10
     WHERE id = $11
     RETURNING ${postFields}`,
    [
      post.name,
      post.dateMade,
      post.imageUrl,
      post.recipeSource,
      post.recipeType,
      JSON.stringify(post.tips),
      JSON.stringify(post.thoughts),
      JSON.stringify(post.flavors),
      post.enjoymentRating,
      post.description,
      id,
    ],
  )
  return rows[0] ?? null
}

app.get('/api/health', async (_request, response) => {
  await pool.query('SELECT 1')
  response.json({ status: 'ok' })
})

app.get('/api/posts', async (_request, response) => {
  const { rows } = await pool.query(`
    SELECT ${postFields}
    FROM baking_posts
    ORDER BY date_made DESC, id DESC
  `)
  response.json(rows)
})

app.post('/api/posts', async (request, response) => {
  if (!hasOnlyEditableFields(request.body)) {
    return response.status(400).json({ error: 'The request body must be a JSON object containing only post fields.' })
  }

  const post = {
    ...request.body,
    recipeSource: request.body.recipeSource ?? '',
    tips: request.body.tips ?? [],
    thoughts: request.body.thoughts ?? [],
    flavors: request.body.flavors ?? [],
  }
  const validationError = validatePost(post)
  if (validationError) return response.status(400).json({ error: validationError })

  const normalizedPost = normalizePost(post)
  const { rows } = await pool.query(
    `INSERT INTO baking_posts
      (name, date_made, image_url, recipe_source, recipe_type, tips, thoughts, flavors, enjoyment_rating, description)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING ${postFields}`,
    [
      normalizedPost.name,
      normalizedPost.dateMade,
      normalizedPost.imageUrl,
      normalizedPost.recipeSource,
      normalizedPost.recipeType,
      JSON.stringify(normalizedPost.tips),
      JSON.stringify(normalizedPost.thoughts),
      JSON.stringify(normalizedPost.flavors),
      normalizedPost.enjoymentRating,
      normalizedPost.description,
    ],
  )
  response
    .location(`/api/posts/${rows[0].id}`)
    .status(201)
    .json(rows[0])
})

app.get('/api/posts/:id', async (request, response) => {
  if (!validPostId(request.params.id)) {
    return response.status(400).json({ error: 'Post ID must be a positive integer.' })
  }
  const post = await findPost(request.params.id)
  if (!post) return response.status(404).json({ error: 'Baking post not found.' })
  response.json(post)
})

app.put('/api/posts/:id', async (request, response) => {
  if (!validPostId(request.params.id)) {
    return response.status(400).json({ error: 'Post ID must be a positive integer.' })
  }
  if (!hasOnlyEditableFields(request.body)) {
    return response.status(400).json({ error: 'The request body must be a JSON object containing only post fields.' })
  }

  const post = {
    ...request.body,
    recipeSource: request.body.recipeSource ?? '',
    tips: request.body.tips ?? [],
    thoughts: request.body.thoughts ?? [],
    flavors: request.body.flavors ?? [],
  }
  const validationError = validatePost(post)
  if (validationError) return response.status(400).json({ error: validationError })

  const updatedPost = await updatePost(request.params.id, normalizePost(post))
  if (!updatedPost) return response.status(404).json({ error: 'Baking post not found.' })
  response.json(updatedPost)
})

app.patch('/api/posts/:id', async (request, response) => {
  if (!validPostId(request.params.id)) {
    return response.status(400).json({ error: 'Post ID must be a positive integer.' })
  }
  if (!hasOnlyEditableFields(request.body)) {
    return response.status(400).json({ error: 'The request body must be a JSON object containing only post fields.' })
  }

  const currentPost = await findPost(request.params.id)
  if (!currentPost) return response.status(404).json({ error: 'Baking post not found.' })

  const updatedValues = { ...currentPost, ...request.body }
  const validationError = validatePost(updatedValues)
  if (validationError) return response.status(400).json({ error: validationError })

  const updatedPost = await updatePost(request.params.id, normalizePost(updatedValues))
  if (!updatedPost) return response.status(404).json({ error: 'Baking post not found.' })
  response.json(updatedPost)
})

app.delete('/api/posts/:id', async (request, response) => {
  if (!validPostId(request.params.id)) {
    return response.status(400).json({ error: 'Post ID must be a positive integer.' })
  }
  const { rowCount } = await pool.query(
    'DELETE FROM baking_posts WHERE id = $1',
    [request.params.id],
  )
  if (rowCount === 0) return response.status(404).json({ error: 'Baking post not found.' })
  response.status(204).end()
})

app.all('/api/posts', (_request, response) => {
  response.set('Allow', 'GET, HEAD, POST, OPTIONS')
  response.status(405).json({ error: 'Method not allowed for the baking post collection.' })
})

app.all('/api/posts/:id', (_request, response) => {
  response.set('Allow', 'GET, HEAD, PUT, PATCH, DELETE, OPTIONS')
  response.status(405).json({ error: 'Method not allowed for a baking post.' })
})

app.use('/api', (_request, response) => {
  response.status(404).json({ error: 'API endpoint not found.' })
})

app.use((error, _request, response, _next) => {
  console.error(error)
  const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 500
    ? error.status
    : 500
  response.status(status).json({
    error: status < 500 ? error.message : 'An unexpected server error occurred.',
  })
})

app.listen(port, async () => {
  console.log(`Blake's Bakes API listening on http://localhost:${port}`)
  try {
    await pool.query('SELECT 1')
    console.log('Connected to PostgreSQL.')
  } catch (error) {
    console.error('PostgreSQL connection failed:', error.message)
  }
})
