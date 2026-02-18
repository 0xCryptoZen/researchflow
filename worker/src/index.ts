// ResearchFlow Cloudflare Workers API
// Handles: GitHub OAuth, D1 CRUD, Data Sync, R2 Storage

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { generateId } from './utils'

type Bindings = {
  DB: D1Database
  APP_URL: string
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
  R2_BUCKET: R2Bucket
}

type User = {
  id: string
  github_id: string
  name: string
  email: string
  avatar: string
  research_fields: string
  created_at: string
  updated_at: string
}

type Paper = {
  id: string
  user_id: string
  title: string
  authors: string
  abstract: string
  source: string
  url: string
  pdf_url: string
  published_date: string
  tags: string
  notes: string
  is_favorite: number
  added_at: string
}

type Task = {
  id: string
  user_id: string
  title: string
  description: string
  status: string
  priority: string
  due_date: string
  related_paper_id: string
  related_conference_id: string
  created_at: string
  completed_at: string
}

type Conference = {
  id: string
  user_id: string
  name: string
  short_name: string
  year: number
  deadline: string
  notification_date: string
  conference_date: string
  website: string
  category: string
  location: string
  created_at: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Middleware
app.use('*', logger())
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// Helper to check if D1 is available
function isD1Available(env: Bindings): boolean {
  return !!env.DB
}

// Helper to get user from header (simplified - in production use JWT)
async function getUserFromHeader(env: Bindings, authHeader: string | null): Promise<User | null> {
  if (!authHeader?.startsWith('Bearer ')) return null
  
  const userId = authHeader.replace('Bearer ', '')
  if (!userId) return null
  
  if (!isD1Available(env)) return null
  
  const result = await env.DB.prepare(
    'SELECT * FROM users WHERE id = ?'
  ).bind(userId).first<User>()
  
  return result || null
}

// ==========================================
// Auth Routes
// ==========================================

// GitHub OAuth - Start
app.get('/auth/github', (c) => {
  const clientId = c.env.GITHUB_CLIENT_ID
  const redirectUri = `${c.env.APP_URL}/api/auth/callback`
  const scope = 'read:user user:email'
  
  // If no client ID configured, return mock for development
  if (!clientId) {
    return c.json({
      message: 'GitHub OAuth not configured. Set GITHUB_CLIENT_ID in wrangler vars.',
      devMode: true,
      mockUserId: 'dev-user-001'
    })
  }
  
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`
  
  return c.redirect(githubAuthUrl)
})

// GitHub OAuth - Callback
app.get('/auth/github/callback', async (c) => {
  const code = c.req.query('code')
  
  if (!code) {
    return c.json({ error: 'No code provided' }, 400)
  }
  
  if (!isD1Available(c.env)) {
    return c.json({ error: 'Database not available' }, 500)
  }
  
  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: c.env.GITHUB_CLIENT_ID,
        client_secret: c.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    })
    
    const tokenData = await tokenResponse.json() as any
    const accessToken = tokenData.access_token
    
    if (!accessToken) {
      return c.json({ error: 'Failed to get access token' }, 400)
    }
    
    // Get user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    })
    
    const githubUser = await userResponse.json() as any
    
    // Get user email (if not public)
    let email = githubUser.email
    if (!email) {
      const emailsResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      })
      const emails = await emailsResponse.json() as any[]
      const primaryEmail = emails.find((e: any) => e.primary)
      email = primaryEmail?.email || emails[0]?.email || ''
    }
    
    // Check if user exists in D1
    const existingUser = await c.env.DB.prepare(
      'SELECT * FROM users WHERE github_id = ?'
    ).bind(githubUser.id.toString()).first<User>()
    
    let userId: string
    const now = new Date().toISOString()
    
    if (existingUser) {
      // Update existing user
      userId = existingUser.id
      await c.env.DB.prepare(
        'UPDATE users SET name = ?, email = ?, avatar = ?, updated_at = ? WHERE id = ?'
      ).bind(githubUser.name || githubUser.login, email, githubUser.avatar_url, now, userId).run()
    } else {
      // Create new user
      userId = generateId()
      await c.env.DB.prepare(
        'INSERT INTO users (id, github_id, name, email, avatar, research_fields, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(userId, githubUser.id.toString(), githubUser.name || githubUser.login, email, githubUser.avatar_url, '[]', now, now).run()
    }
    
    // Redirect to frontend with user ID (in production, use JWT)
    return c.redirect(`${c.env.APP_URL}/auth/callback?userId=${userId}`)
    
  } catch (error) {
    console.error('OAuth error:', error)
    return c.json({ error: 'Authentication failed' }, 500)
  }
})

// Get current user
app.get('/auth/me', async (c) => {
  const authHeader = c.req.header('Authorization')
  const user = await getUserFromHeader(c.env, authHeader)
  
  if (!user) {
    return c.json({ error: 'Not authenticated' }, 401)
  }
  
  return c.json({
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    researchFields: JSON.parse(user.research_fields || '[]'),
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  })
})

// ==========================================
// Papers Routes
// ==========================================

// List papers
app.get('/papers', async (c) => {
  const user = await getUserFromHeader(c.env, c.req.header('Authorization'))
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const result = await c.env.DB.prepare(
    'SELECT * FROM papers WHERE user_id = ? ORDER BY added_at DESC'
  ).bind(user.id).all<Paper>()
  
  const papers = result.results.map(p => ({
    id: p.id,
    userId: p.user_id,
    title: p.title,
    authors: JSON.parse(p.authors || '[]'),
    abstract: p.abstract,
    source: p.source,
    url: p.url,
    pdfUrl: p.pdf_url,
    publishedDate: p.published_date,
    tags: JSON.parse(p.tags || '[]'),
    notes: p.notes,
    isFavorite: p.is_favorite === 1,
    addedAt: p.added_at,
  }))
  
  return c.json({ papers })
})

// Create paper
app.post('/papers', async (c) => {
  const user = await getUserFromHeader(c.env, c.req.header('Authorization'))
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const body = await c.req.json()
  const id = generateId()
  const now = new Date().toISOString()
  
  await c.env.DB.prepare(
    `INSERT INTO papers (id, user_id, title, authors, abstract, source, url, pdf_url, published_date, tags, notes, is_favorite, added_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, user.id, body.title, JSON.stringify(body.authors || []), body.abstract || '',
    body.source, body.url, body.pdfUrl || '', body.publishedDate || '',
    JSON.stringify(body.tags || []), body.notes || '', body.isFavorite ? 1 : 0, now
  ).run()
  
  // Log sync
  await c.env.DB.prepare(
    'INSERT INTO sync_logs (id, user_id, entity_type, entity_id, action, synced_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(generateId(), user.id, 'paper', id, 'create', now).run()
  
  return c.json({ id, message: 'Paper created' })
})

// Update paper
app.put('/papers/:id', async (c) => {
  const user = await getUserFromHeader(c.env, c.req.header('Authorization'))
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const id = c.req.param('id')
  const body = await c.req.json()
  const now = new Date().toISOString()
  
  await c.env.DB.prepare(
    `UPDATE papers SET title = ?, authors = ?, abstract = ?, source = ?, url = ?, pdf_url = ?,
     published_date = ?, tags = ?, notes = ?, is_favorite = ? WHERE id = ? AND user_id = ?`
  ).bind(
    body.title, JSON.stringify(body.authors || []), body.abstract || '', body.source,
    body.url, body.pdfUrl || '', body.publishedDate || '', JSON.stringify(body.tags || []),
    body.notes || '', body.isFavorite ? 1 : 0, id, user.id
  ).run()
  
  // Log sync
  await c.env.DB.prepare(
    'INSERT INTO sync_logs (id, user_id, entity_type, entity_id, action, synced_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(generateId(), user.id, 'paper', id, 'update', now).run()
  
  return c.json({ message: 'Paper updated' })
})

// Delete paper
app.delete('/papers/:id', async (c) => {
  const user = await getUserFromHeader(c.env, c.req.header('Authorization'))
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const id = c.req.param('id')
  const now = new Date().toISOString()
  
  await c.env.DB.prepare('DELETE FROM papers WHERE id = ? AND user_id = ?').bind(id, user.id).run()
  
  // Log sync
  await c.env.DB.prepare(
    'INSERT INTO sync_logs (id, user_id, entity_type, entity_id, action, synced_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(generateId(), user.id, 'paper', id, 'delete', now).run()
  
  return c.json({ message: 'Paper deleted' })
})

// ==========================================
// Tasks Routes
// ==========================================

app.get('/tasks', async (c) => {
  const user = await getUserFromHeader(c.env, c.req.header('Authorization'))
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const result = await c.env.DB.prepare(
    'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC'
  ).bind(user.id).all<Task>()
  
  return c.json({ tasks: result.results })
})

app.post('/tasks', async (c) => {
  const user = await getUserFromHeader(c.env, c.req.header('Authorization'))
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const body = await c.req.json()
  const id = generateId()
  const now = new Date().toISOString()
  
  await c.env.DB.prepare(
    `INSERT INTO tasks (id, user_id, title, description, status, priority, due_date, related_paper_id, related_conference_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, user.id, body.title, body.description || '', body.status || 'todo', 
    body.priority || 'medium', body.dueDate || '', body.relatedPaperId || '', 
    body.relatedConferenceId || '', now).run()
  
  return c.json({ id, message: 'Task created' })
})

app.put('/tasks/:id', async (c) => {
  const user = await getUserFromHeader(c.env, c.req.header('Authorization'))
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const id = c.req.param('id')
  const body = await c.req.json()
  
  await c.env.DB.prepare(
    `UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, due_date = ?,
     related_paper_id = ?, related_conference_id = ?, completed_at = ? WHERE id = ? AND user_id = ?`
  ).bind(body.title, body.description || '', body.status, body.priority, body.dueDate || '',
    body.relatedPaperId || '', body.relatedConferenceId || '', 
    body.status === 'completed' ? new Date().toISOString() : null, id, user.id).run()
  
  return c.json({ message: 'Task updated' })
})

app.delete('/tasks/:id', async (c) => {
  const user = await getUserFromHeader(c.env, c.req.header('Authorization'))
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const id = c.req.param('id')
  await c.env.DB.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').bind(id, user.id).run()
  
  return c.json({ message: 'Task deleted' })
})

// ==========================================
// Conferences Routes
// ==========================================

app.get('/conferences', async (c) => {
  const user = await getUserFromHeader(c.env, c.req.header('Authorization'))
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const result = await c.env.DB.prepare(
    'SELECT * FROM conferences WHERE user_id = ? ORDER BY deadline ASC'
  ).bind(user.id).all<Conference>()
  
  return c.json({ conferences: result.results })
})

app.post('/conferences', async (c) => {
  const user = await getUserFromHeader(c.env, c.req.header('Authorization'))
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const body = await c.req.json()
  const id = generateId()
  const now = new Date().toISOString()
  
  await c.env.DB.prepare(
    `INSERT INTO conferences (id, user_id, name, short_name, year, deadline, notification_date, conference_date, website, category, location, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, user.id, body.name, body.shortName, body.year, body.deadline,
    body.notificationDate || '', body.conferenceDate || '', body.website, 
    body.category || 'other', body.location || '', now).run()
  
  return c.json({ id, message: 'Conference created' })
})

app.delete('/conferences/:id', async (c) => {
  const user = await getUserFromHeader(c.env, c.req.header('Authorization'))
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const id = c.req.param('id')
  await c.env.DB.prepare('DELETE FROM conferences WHERE id = ? AND user_id = ?').bind(id, user.id).run()
  
  return c.json({ message: 'Conference deleted' })
})

// ==========================================
// Sync Routes (P0-2)
// ==========================================

// Get sync status
app.get('/sync/status', async (c) => {
  const user = await getUserFromHeader(c.env, c.req.header('Authorization'))
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const lastSync = await c.env.DB.prepare(
    'SELECT MAX(synced_at) as last_sync FROM sync_logs WHERE user_id = ?'
  ).bind(user.id).first<{ last_sync: string }>()
  
  const counts = await c.env.DB.prepare(
    `SELECT 'papers' as type, COUNT(*) as count FROM papers WHERE user_id = ?
     UNION ALL SELECT 'tasks', COUNT(*) FROM tasks WHERE user_id = ?
     UNION ALL SELECT 'conferences', COUNT(*) FROM conferences WHERE user_id = ?`
  ).bind(user.id, user.id, user.id).all<{ type: string; count: number }>()
  
  return c.json({
    lastSyncTime: lastSync?.last_sync || null,
    entityCounts: counts.results.reduce((acc, r) => ({ ...acc, [r.type]: r.count }), {}),
  })
})

// Incremental sync - get changes since timestamp
app.get('/sync/changes', async (c) => {
  const user = await getUserFromHeader(c.env, c.req.header('Authorization'))
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const since = c.req.query('since')
  
  let query = 'SELECT * FROM sync_logs WHERE user_id = ?'
  const params: any[] = [user.id]
  
  if (since) {
    query += ' AND synced_at > ?'
    params.push(since)
  }
  
  query += ' ORDER BY synced_at ASC'
  
  const result = await c.env.DB.prepare(query).bind(...params).all()
  
  return c.json({ changes: result.results })
})

// Full export (for initial sync)
app.get('/sync/export', async (c) => {
  const user = await getUserFromHeader(c.env, c.req.header('Authorization'))
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const papers = await c.env.DB.prepare('SELECT * FROM papers WHERE user_id = ?').bind(user.id).all()
  const tasks = await c.env.DB.prepare('SELECT * FROM tasks WHERE user_id = ?').bind(user.id).all()
  const conferences = await c.env.DB.prepare('SELECT * FROM conferences WHERE user_id = ?').bind(user.id).all()
  
  return c.json({
    papers: papers.results,
    tasks: tasks.results,
    conferences: conferences.results,
    exportedAt: new Date().toISOString(),
  })
})

// ==========================================
// Storage Routes (P2-4.1 - R2 Image Upload)
// ==========================================

// Upload image to R2
app.post('/storage/upload', async (c) => {
  const user = await getUserFromHeader(c.env, c.req.header('Authorization'))
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const contentType = c.req.header('Content-Type') || 'image/png'
  const fileName = c.req.query('filename') || `${generateId()}.png`
  const folder = c.req.query('folder') || 'charts'
  
  // Validate content type
  const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']
  if (!allowedTypes.includes(contentType)) {
    return c.json({ error: 'Invalid content type. Allowed: ' + allowedTypes.join(', ') }, 400)
  }
  
  try {
    const arrayBuffer = await c.req.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)
    
    // Max 10MB
    if (buffer.length > 10 * 1024 * 1024) {
      return c.json({ error: 'File too large. Max 10MB' }, 400)
    }
    
    const key = `${user.id}/${folder}/${fileName}`
    
    // Check if R2 bucket is available
    if (!c.env.R2_BUCKET) {
      // Return mock URL for development
      const mockUrl = `https://mock-r2.example.com/${key}`
      return c.json({ 
        url: mockUrl, 
        key,
        message: 'R2 not configured, using mock URL' 
      })
    }
    
    await c.env.R2_BUCKET.put(key, buffer, {
      httpMetadata: {
        contentType,
      },
      customMetadata: {
        userId: user.id,
        uploadedAt: new Date().toISOString(),
      },
    })
    
    // Generate public URL (assuming R2 is configured with public domain)
    const publicUrl = `/storage/${key}`
    
    return c.json({ 
      url: publicUrl, 
      key,
      size: buffer.length,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return c.json({ error: 'Upload failed', details: String(error) }, 500)
  }
})

// Get image from R2
app.get('/storage/:key(*)', async (c) => {
  const key = c.req.param('key')
  
  if (!c.env.R2_BUCKET) {
    return c.json({ error: 'R2 not configured' }, 500)
  }
  
  try {
    const object = await c.env.R2_BUCKET.get(key)
    
    if (!object) {
      return c.json({ error: 'Not found' }, 404)
    }
    
    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000',
      },
    })
  } catch (error) {
    console.error('Get error:', error)
    return c.json({ error: 'Failed to get file', details: String(error) }, 500)
  }
})

// Delete image from R2
app.delete('/storage/:key(*)', async (c) => {
  const user = await getUserFromHeader(c.env, c.req.header('Authorization'))
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const key = c.req.param('key')
  
  // Verify ownership
  if (!key.startsWith(user.id)) {
    return c.json({ error: 'Access denied' }, 403)
  }
  
  if (!c.env.R2_BUCKET) {
    return c.json({ message: 'R2 not configured, mock delete' })
  }
  
  try {
    await c.env.R2_BUCKET.delete(key)
    return c.json({ message: 'Deleted successfully' })
  } catch (error) {
    console.error('Delete error:', error)
    return c.json({ error: 'Delete failed', details: String(error) }, 500)
  }
})

// ==========================================
// Charts/Figures Management (P2-4)
// ==========================================

type Chart = {
  id: string
  user_id: string
  name: string
  description: string
  image_url: string
  image_key: string
  type: string
  tags: string
  paper_id: string
  created_at: string
  updated_at: string
}

// Get all charts for user
app.get('/charts', async (c) => {
  const user = await getUserFromHeader(c.env, c.req.header('Authorization'))
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const result = await c.env.DB.prepare(
    'SELECT * FROM charts WHERE user_id = ? ORDER BY created_at DESC'
  ).bind(user.id).all<Chart>()
  
  const charts = result.results.map(chart => ({
    id: chart.id,
    name: chart.name,
    description: chart.description,
    imageUrl: chart.image_url,
    imageKey: chart.image_key,
    type: chart.type,
    tags: JSON.parse(chart.tags || '[]'),
    paperId: chart.paper_id,
    createdAt: chart.created_at,
    updatedAt: chart.updated_at,
  }))
  
  return c.json({ charts })
})

// Create chart
app.post('/charts', async (c) => {
  const user = await getUserFromHeader(c.env, c.req.header('Authorization'))
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const body = await c.req.json()
  const id = generateId()
  const now = new Date().toISOString()
  
  await c.env.DB.prepare(
    `INSERT INTO charts (id, user_id, name, description, image_url, image_key, type, tags, paper_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, user.id, body.name, body.description || '', body.imageUrl || '', 
    body.imageKey || '', body.type || 'image', JSON.stringify(body.tags || []),
    body.paperId || '', now, now
  ).run()
  
  return c.json({ id, message: 'Chart created' })
})

// Update chart
app.put('/charts/:id', async (c) => {
  const user = await getUserFromHeader(c.env, c.req.header('Authorization'))
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const id = c.req.param('id')
  const body = await c.req.json()
  const now = new Date().toISOString()
  
  // Verify ownership
  const existing = await c.env.DB.prepare(
    'SELECT * FROM charts WHERE id = ? AND user_id = ?'
  ).bind(id, user.id).first<Chart>()
  
  if (!existing) {
    return c.json({ error: 'Chart not found' }, 404)
  }
  
  await c.env.DB.prepare(
    `UPDATE charts SET name = ?, description = ?, image_url = ?, image_key = ?, 
     type = ?, tags = ?, paper_id = ?, updated_at = ? WHERE id = ?`
  ).bind(
    body.name, body.description || '', body.imageUrl || '', body.imageKey || '',
    body.type || 'image', JSON.stringify(body.tags || []), body.paperId || '',
    now, id
  ).run()
  
  return c.json({ message: 'Chart updated' })
})

// Delete chart
app.delete('/charts/:id', async (c) => {
  const user = await getUserFromHeader(c.env, c.req.header('Authorization'))
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const id = c.req.param('id')
  
  // Verify ownership and get image key
  const existing = await c.env.DB.prepare(
    'SELECT * FROM charts WHERE id = ? AND user_id = ?'
  ).bind(id, user.id).first<Chart>()
  
  if (!existing) {
    return c.json({ error: 'Chart not found' }, 404)
  }
  
  // Delete from R2 if exists
  if (c.env.R2_BUCKET && existing.image_key) {
    try {
      await c.env.R2_BUCKET.delete(existing.image_key)
    } catch (e) {
      console.error('R2 delete error:', e)
    }
  }
  
  await c.env.DB.prepare('DELETE FROM charts WHERE id = ?').bind(id).run()
  
  return c.json({ message: 'Chart deleted' })
})

// Get chart by ID
app.get('/charts/:id', async (c) => {
  const user = await getUserFromHeader(c.env, c.req.header('Authorization'))
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const id = c.req.param('id')
  
  const chart = await c.env.DB.prepare(
    'SELECT * FROM charts WHERE id = ? AND user_id = ?'
  ).bind(id, user.id).first<Chart>()
  
  if (!chart) {
    return c.json({ error: 'Chart not found' }, 404)
  }
  
  return c.json({
    id: chart.id,
    name: chart.name,
    description: chart.description,
    imageUrl: chart.image_url,
    imageKey: chart.image_key,
    type: chart.type,
    tags: JSON.parse(chart.tags || '[]'),
    paperId: chart.paper_id,
    createdAt: chart.created_at,
    updatedAt: chart.updated_at,
  })
})

// Get charts by paper ID (for cross-paper reuse - P2-4.2)
app.get('/charts/paper/:paperId', async (c) => {
  const user = await getUserFromHeader(c.env, c.req.header('Authorization'))
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const paperId = c.req.param('paperId')
  
  const result = await c.env.DB.prepare(
    'SELECT * FROM charts WHERE user_id = ? AND paper_id = ? ORDER BY created_at DESC'
  ).bind(user.id, paperId).all<Chart>()
  
  const charts = result.results.map(chart => ({
    id: chart.id,
    name: chart.name,
    description: chart.description,
    imageUrl: chart.image_url,
    imageKey: chart.image_key,
    type: chart.type,
    tags: JSON.parse(chart.tags || '[]'),
    paperId: chart.paper_id,
    createdAt: chart.created_at,
    updatedAt: chart.updated_at,
  }))
  
  return c.json({ charts })
})

// Get all reusable charts (not linked to any paper)
app.get('/charts/reusable', async (c) => {
  const user = await getUserFromHeader(c.env, c.req.header('Authorization'))
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const result = await c.env.DB.prepare(
    'SELECT * FROM charts WHERE user_id = ? AND (paper_id IS NULL OR paper_id = "") ORDER BY created_at DESC'
  ).bind(user.id).all<Chart>()
  
  const charts = result.results.map(chart => ({
    id: chart.id,
    name: chart.name,
    description: chart.description,
    imageUrl: chart.image_url,
    imageKey: chart.image_key,
    type: chart.type,
    tags: JSON.parse(chart.tags || '[]'),
    paperId: chart.paper_id,
    createdAt: chart.created_at,
    updatedAt: chart.updated_at,
  }))
  
  return c.json({ charts })
})

// ==========================================
// Health Check
// ==========================================

app.get('/health', (c) => c.json({ 
  status: 'ok', 
  timestamp: new Date().toISOString(),
  d1Available: isD1Available(c.env)
}))

// ==========================================
// Academic Search Routes (P1-1)
// ==========================================

// Google Scholar Search (via scraping proxy)
app.get('/search/scholar', async (c) => {
  const query = c.req.query('q') || c.req.query('query')
  const limit = parseInt(c.req.query('limit') || '10')
  
  if (!query) {
    return c.json({ error: 'Query parameter required' }, 400)
  }
  
  try {
    // Use SerpAPI-style approach: Google Scholar search
    // Since direct scraping is blocked, we use arXiv/DBLP as fallback
    const results = await searchGoogleScholar(query, limit)
    return c.json({ results, source: 'google_scholar' })
  } catch (error) {
    console.error('Google Scholar search error:', error)
    return c.json({ error: 'Search failed', details: String(error) }, 500)
  }
})

// IEEE Xplore Search
app.get('/search/ieee', async (c) => {
  const query = c.req.query('q') || c.req.query('query')
  const limit = parseInt(c.req.query('limit') || '10')
  
  if (!query) {
    return c.json({ error: 'Query parameter required' }, 400)
  }
  
  try {
    const results = await searchIEEE(query, limit)
    return c.json({ results, source: 'ieee' })
  } catch (error) {
    console.error('IEEE search error:', error)
    return c.json({ error: 'Search failed', details: String(error) }, 500)
  }
})

// ACM DL Search
app.get('/search/acm', async (c) => {
  const query = c.req.query('q') || c.req.query('query')
  const limit = parseInt(c.req.query('limit') || '10')
  
  if (!query) {
    return c.json({ error: 'Query parameter required' }, 400)
  }
  
  try {
    const results = await searchACM(query, limit)
    return c.json({ results, source: 'acm' })
  } catch (error) {
    console.error('ACM search error:', error)
    return c.json({ error: 'Search failed', details: String(error) }, 500)
  }
})

// Unified search endpoint
app.get('/search', async (c) => {
  const query = c.req.query('q') || c.req.query('query')
  const source = c.req.query('source') || 'all'
  const limit = parseInt(c.req.query('limit') || '10')
  
  if (!query) {
    return c.json({ error: 'Query parameter required' }, 400)
  }
  
  try {
    let results: any[] = []
    const sources = source === 'all' ? ['arxiv', 'dblp', 'scholar', 'ieee', 'acm'] : [source]
    
    for (const src of sources) {
      let r: any[] = []
      switch (src) {
        case 'arxiv':
          r = await searchArxiv(query, Math.ceil(limit / sources.length))
          break
        case 'dblp':
          r = await searchDBLP(query, Math.ceil(limit / sources.length))
          break
        case 'scholar':
          r = await searchGoogleScholar(query, Math.ceil(limit / sources.length))
          break
        case 'ieee':
          r = await searchIEEE(query, Math.ceil(limit / sources.length))
          break
        case 'acm':
          r = await searchACM(query, Math.ceil(limit / sources.length))
          break
      }
      results = [...results, ...r]
    }
    
    return c.json({ results, count: results.length, query, sources })
  } catch (error) {
    console.error('Search error:', error)
    return c.json({ error: 'Search failed', details: String(error) }, 500)
  }
})

// ==========================================
// DOI Resolution Routes (P2-3.1)
// ==========================================

// Resolve DOI to get metadata
app.get('/doi/resolve', async (c) => {
  const doi = c.req.query('doi')
  
  if (!doi) {
    return c.json({ error: 'DOI parameter required' }, 400)
  }
  
  try {
    // Clean DOI (remove URL prefix if present)
    const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//, '').trim()
    
    // Use CrossRef API to resolve DOI
    const response = await fetch(
      `https://api.crossref.org/works/${encodeURIComponent(cleanDoi)}`,
      { 
        headers: { 
          'Accept': 'application/json',
          'User-Agent': 'ResearchFlow/1.0 (mailto:support@researchflow.app)'
        } 
      }
    )
    
    if (!response.ok) {
      return c.json({ error: 'DOI not found', doi: cleanDoi }, 404)
    }
    
    const data = await response.json() as any
    const work = data.message
    
    // Extract metadata in standardized format
    const metadata = {
      doi: cleanDoi,
      title: work.title?.[0] || '',
      authors: work.author?.map((a: any) => `${a.given || ''} ${a.family || ''}`.trim()) || [],
      year: work.published?.['date-parts']?.[0]?.[0] || work.created?.['date-parts']?.[0]?.[0],
      journal: work['container-title']?.[0] || work.publisher,
      volume: work.volume,
      issue: work.issue,
      pages: work.page,
      url: work.URL || `https://doi.org/${cleanDoi}`,
      abstract: work.abstract?.replace(/<[^>]+>/g, '') || '',
      type: mapCrossRefType(work.type),
      issn: work.ISSN,
      isbn: work.ISBN,
      doi: cleanDoi,
    }
    
    return c.json({ metadata })
  } catch (error) {
    console.error('DOI resolution error:', error)
    return c.json({ error: 'Failed to resolve DOI', details: String(error) }, 500)
  }
})

// Batch resolve multiple DOIs
app.post('/doi/resolve-batch', async (c) => {
  const body = await c.req.json()
  const dois = body.dois || []
  
  if (!dois.length || !Array.isArray(dois)) {
    return c.json({ error: 'Array of DOIs required' }, 400)
  }
  
  const results = await Promise.all(
    dois.slice(0, 20).map(async (doi: string) => {
      try {
        const response = await fetch(
          `https://api.crossref.org/works/${encodeURIComponent(doi.replace(/^https?:\/\/doi\.org\//, ''))}`,
          { 
            headers: { 
              'Accept': 'application/json',
              'User-Agent': 'ResearchFlow/1.0 (mailto:support@researchflow.app)'
            } 
          }
        )
        
        if (!response.ok) return { doi, error: 'Not found' }
        
        const data = await response.json() as any
        const work = data.message
        
        return {
          doi,
          title: work.title?.[0] || '',
          authors: work.author?.map((a: any) => `${a.given || ''} ${a.family || ''}`.trim()) || [],
          year: work.published?.['date-parts']?.[0]?.[0],
          journal: work['container-title']?.[0] || work.publisher,
          type: mapCrossRefType(work.type),
        }
      } catch (error) {
        return { doi, error: String(error) }
      }
    })
  )
  
  return c.json({ results })
})

function mapCrossRefType(type: string): string {
  const typeMap: Record<string, string> = {
    'journal-article': 'article',
    'book': 'book',
    'book-chapter': 'book',
    'conference-paper': 'conference',
    'proceedings-article': 'conference',
    'dissertation': 'thesis',
    'dataset': 'misc',
    'posted-content': 'misc',
  }
  return typeMap[type] || 'misc'
}

// ==========================================
// Citation Formatting Routes (P2-3.2)
// ==========================================

// Generate citation in various formats
app.post('/citations/format', async (c) => {
  const body = await c.req.json()
  const { metadata, style = 'bibtex' } = body
  
  if (!metadata) {
    return c.json({ error: 'Metadata required' }, 400)
  }
  
  try {
    let formatted: string
    
    switch (style.toLowerCase()) {
      case 'bibtex':
        formatted = formatBibTeX(metadata)
        break
      case 'apa':
        formatted = formatAPA(metadata)
        break
      case 'ieee':
        formatted = formatIEEE(metadata)
        break
      case 'mla':
        formatted = formatMLA(metadata)
        break
      case 'chicago':
        formatted = formatChicago(metadata)
        break
      default:
        formatted = formatBibTeX(metadata)
    }
    
    return c.json({ citation: formatted, style })
  } catch (error) {
    console.error('Citation formatting error:', error)
    return c.json({ error: 'Failed to format citation', details: String(error) }, 500)
  }
})

// Batch format citations
app.post('/citations/format-batch', async (c) => {
  const body = await c.req.json()
  const { references, style = 'bibtex' } = body
  
  if (!references?.length) {
    return c.json({ error: 'Array of references required' }, 400)
  }
  
  const results = references.map((ref: any, index: number) => ({
    id: ref.id || `ref_${index}`,
    citation: formatCitationByStyle(ref, style),
    style,
  }))
  
  return c.json({ results })
})

function formatBibTeX(ref: any): string {
  const type = ref.type === 'article' ? 'article' :
               ref.type === 'conference' ? 'inproceedings' :
               ref.type === 'book' ? 'book' : 'misc'
  
  const key = `${ref.authors?.[0]?.split(' ').pop() || 'unknown'}${ref.year || ''}`.toLowerCase()
  
  let bibtex = `@${type}{${key},\n`
  bibtex += `  title = {${ref.title || ''}},\n`
  
  if (ref.authors?.length) {
    bibtex += `  author = {${ref.authors.join(' and ')}},\n`
  }
  
  if (ref.year) bibtex += `  year = {${ref.year}},\n`
  if (ref.journal) bibtex += `  journal = {${ref.journal}},\n`
  if (ref.conference) bibtex += `  booktitle = {${ref.conference}},\n`
  if (ref.volume) bibtex += `  volume = {${ref.volume}},\n`
  if (ref.issue) bibtex += `  number = {${ref.issue}},\n`
  if (ref.pages) bibtex += `  pages = {${ref.pages}},\n`
  if (ref.doi) bibtex += `  doi = {${ref.doi}},\n`
  if (ref.url) bibtex += `  url = {${ref.url}},\n`
  if (ref.publisher) bibtex += `  publisher = {${ref.publisher}},\n`
  
  bibtex = bibtex.replace(/,\n$/, '\n')
  bibtex += `}`
  
  return bibtex
}

function formatAPA(ref: any): string {
  const authors = formatAPAAuthors(ref.authors || [])
  const year = ref.year ? `(${ref.year})` : '(n.d.)'
  const title = ref.title || 'Untitled'
  
  let citation = `${authors} ${year}. ${title}.`
  
  if (ref.journal) {
    citation += ` *${ref.journal}*`
    if (ref.volume) citation += `, *${ref.volume}*`
    if (ref.issue) citation += `(${ref.issue})`
    if (ref.pages) citation += `, ${ref.pages}`
    citation += '.'
  } else if (ref.conference) {
    citation += ` In *${ref.conference}*`
    if (ref.pages) citation += ` (pp. ${ref.pages})`
    citation += '.'
  }
  
  if (ref.doi) {
    citation += ` https://doi.org/${ref.doi}`
  } else if (ref.url) {
    citation += ` ${ref.url}`
  }
  
  return citation
}

function formatAPAAuthors(authors: string[]): string {
  if (!authors.length) return 'Unknown Author'
  if (authors.length === 1) return authors[0]
  if (authors.length === 2) return `${authors[0]} & ${authors[1]}`
  if (authors.length <= 20) {
    const last = authors.pop()
    return `${authors.join(', ')}, & ${last}`
  }
  // More than 20 authors: list first 19, then ellipsis, then last
  return `${authors.slice(0, 19).join(', ')}, ... ${authors[authors.length - 1]}`
}

function formatIEEE(ref: any): string {
  const authors = ref.authors?.length 
    ? ref.authors.map((name: string, i: number) => {
        const parts = name.split(' ')
        if (parts.length > 1) {
          const last = parts.pop()
          return `${parts.map((p: string) => p[0] + '.').join(' ')} ${last}`
        }
        return name
      }).join(', ')
    : 'Unknown Author'
  
  const title = ref.title || 'Untitled'
  let citation = `${authors}, "${title},"`
  
  if (ref.journal) {
    citation += ` *${ref.journal}*`
    if (ref.volume) citation += `, vol. ${ref.volume}`
    if (ref.issue) citation += `, no. ${ref.issue}`
    if (ref.pages) citation += `, pp. ${ref.pages}`
    if (ref.year) citation += `, ${ref.year}`
    citation += '.'
  } else if (ref.conference) {
    citation += ` in *${ref.conference}*`
    if (ref.year) citation += `, ${ref.year}`
    if (ref.pages) citation += `, pp. ${ref.pages}`
    citation += '.'
  } else if (ref.year) {
    citation += ` ${ref.year}.`
  }
  
  return citation
}

function formatMLA(ref: any): string {
  const authors = ref.authors?.length
    ? ref.authors.length === 1 
      ? ref.authors[0]
      : ref.authors.length === 2
        ? `${ref.authors[0]} and ${ref.authors[1]}`
        : `${ref.authors[0]}, et al`
    : 'Unknown Author'
  
  const title = ref.title ? `"${ref.title}."` : '"Untitled."'
  let citation = `${authors}. ${title}`
  
  if (ref.journal) {
    citation += ` *${ref.journal}*`
    if (ref.volume) citation += `, vol. ${ref.volume}`
    if (ref.issue) citation += `, no. ${ref.issue}`
    if (ref.year) citation += `, ${ref.year}`
    if (ref.pages) citation += `, pp. ${ref.pages}`
    citation += '.'
  } else if (ref.conference) {
    citation += ` *${ref.conference}*`
    if (ref.year) citation += `, ${ref.year}`
    if (ref.pages) citation += `, pp. ${ref.pages}`
    citation += '.'
  }
  
  return citation
}

function formatChicago(ref: any): string {
  const authors = ref.authors?.length
    ? ref.authors.join(', ')
    : 'Unknown Author'
  
  const title = ref.title ? `"${ref.title}."` : '"Untitled."'
  let citation = `${authors}. ${title}`
  
  if (ref.journal) {
    citation += ` *${ref.journal}*`
    if (ref.volume) citation += ` ${ref.volume}`
    if (ref.issue) citation += `, no. ${ref.issue}`
    if (ref.year) citation += ` (${ref.year})`
    if (ref.pages) citation += `: ${ref.pages}`
    citation += '.'
  } else if (ref.conference) {
    citation += ` Paper presented at *${ref.conference}*`
    if (ref.year) citation += `, ${ref.year}`
    citation += '.'
  }
  
  if (ref.doi) {
    citation += ` https://doi.org/${ref.doi}.`
  }
  
  return citation
}

function formatCitationByStyle(ref: any, style: string): string {
  switch (style.toLowerCase()) {
    case 'apa': return formatAPA(ref)
    case 'ieee': return formatIEEE(ref)
    case 'mla': return formatMLA(ref)
    case 'chicago': return formatChicago(ref)
    default: return formatBibTeX(ref)
  }
}

// Helper functions for academic search
async function searchGoogleScholar(query: string, limit: number): Promise<any[]> {
  // Use DBLP as primary source since Google Scholar blocks automated requests
  // In production, integrate with SerperAPI or similar service
  const dblpResults = await searchDBLP(query, limit)
  
  return dblpResults.map((r: any) => ({
    ...r,
    source: 'scholar',
    id: `scholar_${r.id}`,
  }))
}

async function searchIEEE(query: string, limit: number): Promise<any[]> {
  try {
    // IEEE Xplore API (requires API key in production)
    // Using open API endpoint
    const response = await fetch(
      `https://ieeexploreapi.ieee.org/api/v3/search?q=${encodeURIComponent(query)}&max_records=${limit}`,
      { headers: { 'Accept': 'application/json' } }
    )
    
    if (!response.ok) {
      throw new Error(`IEEE API error: ${response.status}`)
    }
    
    const data = await response.json() as any
    return (data.articles || []).map((article: any) => ({
      id: `ieee_${article.article_number}`,
      title: article.title,
      authors: article.authors?.map((a: any) => a.full_name) || [],
      abstract: article.abstract,
      source: 'ieee',
      url: article.doi ? `https://doi.org/${article.doi}` : article.html_url,
      year: article.publication_year,
      venue: article.journal_title || article.conference_title,
      citations: article.citation_count,
    }))
  } catch (error) {
    console.error('IEEE search error:', error)
    // Fallback to empty array
    return []
  }
}

async function searchACM(query: string, limit: number): Promise<any[]> {
  try {
    // ACM DL API
    const response = await fetch(
      `https://api.acm.org/bibliographic/search/v1?q=${encodeURIComponent(query)}&limit=${limit}`,
      { 
        headers: { 
          'Content-Type': 'application/json',
          // Note: ACM requires API key for production use
        } 
      }
    )
    
    if (!response.ok) {
      throw new Error(`ACM API error: ${response.status}`)
    }
    
    const data = await response.json() as any
    return (data.result || []).map((item: any) => ({
      id: `acm_${item.doi}`,
      title: item.title,
      authors: item.authors?.map((a: any) => a.name) || [],
      abstract: item.abstract,
      source: 'acm',
      url: item.doi ? `https://doi.org/${item.doi}` : item.url,
      year: item.year,
      venue: item.venue,
    }))
  } catch (error) {
    console.error('ACM search error:', error)
    return []
  }
}

async function searchArxiv(query: string, limit: number): Promise<any[]> {
  try {
    const response = await fetch(
      `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&max_results=${limit}`,
      { headers: { 'Accept': 'application/xml' } }
    )
    
    const text = await response.text()
    const parser = new DOMParser()
    const xml = parser.parseFromString(text, 'text/xml')
    const entries = xml.querySelectorAll('entry')
    
    return Array.from(entries).map((entry, i) => ({
      id: `arxiv_${i}`,
      title: entry.querySelector('title')?.textContent || '',
      authors: Array.from(entry.querySelectorAll('author name')).map(a => a.textContent || ''),
      abstract: entry.querySelector('summary')?.textContent || '',
      source: 'arxiv',
      url: entry.querySelector('id')?.textContent || '',
      pdfUrl: entry.querySelector('link[title="pdf"]')?.getAttribute('href') || '',
      year: new Date(entry.querySelector('published')?.textContent || '').getFullYear(),
      publishedDate: entry.querySelector('published')?.textContent || '',
      categories: Array.from(entry.querySelectorAll('category')).map(c => c.getAttribute('term') || ''),
    }))
  } catch (error) {
    console.error('ArXiv search error:', error)
    return []
  }
}

async function searchDBLP(query: string, limit: number): Promise<any[]> {
  try {
    const response = await fetch(
      `https://dblp.org/search/publ/api?q=${encodeURIComponent(query)}&h=${limit}&format=json`
    )
    
    const data = await response.json() as any
    return (data.result?.hits?.hit || []).map((hit: any) => {
      const info = hit.info
      return {
        id: info.id || `dblp_${hit.id}`,
        title: info.title || '',
        authors: info.authors?.author?.map((a: any) => a.text) || [],
        abstract: '',
        source: 'dblp',
        url: info.url || '',
        year: info.year ? parseInt(info.year) : undefined,
        venue: info.venue || '',
        citations: info.citationCount || 0,
      }
    })
  } catch (error) {
    console.error('DBLP search error:', error)
    return []
  }
}

export default app
