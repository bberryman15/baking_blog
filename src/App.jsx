import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Badge,
  Button,
  Col,
  Container,
  Form,
  Modal,
  Navbar,
  Row,
  Spinner,
} from 'react-bootstrap'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const CURRENT_YEAR = new Date().getFullYear()

const emptyForm = {
  name: '',
  dateMade: new Date().toISOString().slice(0, 10),
  imageUrl: '',
  recipeSource: '',
  recipeType: 'Bread',
  tips: '',
  thoughts: '',
  flavors: '',
  enjoymentRating: '4',
  description: '',
}

function toList(value) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

function formatDate(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function Stars({ rating }) {
  return (
    <span className="rating" aria-label={`${rating} out of 5 stars`}>
      {'★'.repeat(rating)}
      <span className="rating-muted">{'★'.repeat(5 - rating)}</span>
    </span>
  )
}

function App() {
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState(['All bakes'])
  const [activeCategory, setActiveCategory] = useState('All bakes')
  const [query, setQuery] = useState('')
  const [selectedPost, setSelectedPost] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  async function loadPosts() {
    try {
      const response = await fetch(`${API_URL}/api/posts`)
      if (!response.ok) throw new Error(`Could not load bakes (${response.status})`)
      const data = await response.json()
      setPosts(data)
      setCategories(['All bakes', ...new Set(data.map((post) => post.recipeType))])
      setError('')
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message}. Make sure the API server and PostgreSQL are running.`
          : 'Could not load bakes.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Loading the initial collection is the effect's synchronization with the API.
    // oxlint-disable-next-line react/set-state-in-effect
    loadPosts()
  }, [])

  const visiblePosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return posts.filter((post) => {
      const matchesCategory =
        activeCategory === 'All bakes' || post.recipeType === activeCategory
      const searchable = [
        post.name,
        post.description,
        post.recipeSource,
        ...post.flavors,
        ...post.thoughts,
      ]
        .join(' ')
        .toLowerCase()
      return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery))
    })
  }, [activeCategory, posts, query])

  async function handleCreate(event) {
    event.preventDefault()
    setSaving(true)
    setFormError('')
    const payload = {
      ...form,
      enjoymentRating: Number(form.enjoymentRating),
      tips: toList(form.tips),
      thoughts: toList(form.thoughts),
      flavors: form.flavors.split(',').map((item) => item.trim()).filter(Boolean),
    }

    try {
      const response = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not save this bake.')
      setPosts((current) => [result, ...current])
      setCategories((current) =>
        current.includes(result.recipeType) ? current : [...current, result.recipeType],
      )
      setActiveCategory('All bakes')
      setForm(emptyForm)
      setFormError('')
      setShowCreate(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not save this bake.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="site-shell">
      <Navbar className="topbar">
        <Container className="nav-inner">
          <a className="brand" href="#" aria-label="Blake's Bakes home">
            <span className="brand-mark">b.</span>
            <span>blake&apos;s <em>bakes</em></span>
          </a>
          <div className="nav-right">
            <a href="#journal">The journal</a>
            <Button className="new-bake-button" onClick={() => setShowCreate(true)}>
              <span aria-hidden="true">＋</span> Add a bake
            </Button>
          </div>
        </Container>
      </Navbar>

      <main>
        <section className="intro">
          <Container>
            <div className="intro-copy">
              <div className="eyebrow"><span /> A little flour, a lot of love</div>
              <h1>Made with care.<br /><em>Remembered</em> with a recipe.</h1>
              <p>
                A collection of kitchen experiments, well-loved recipes, and the
                little things I&apos;d do differently next time.
              </p>
              <a className="scroll-link" href="#journal">Wander through the journal <span>↓</span></a>
            </div>
            <div className="intro-photo">
              <img
                src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1100&q=85"
                alt="Freshly baked golden croissants on a tray"
              />
              <div className="photo-note"><span>from my kitchen</span><span>with love ♡</span></div>
              <div className="photo-stamp" aria-hidden="true">BAKED<br />SLOWLY<br /><span>✳</span></div>
            </div>
            <div className="intro-caption">A journal of the things that came out of the oven.</div>
          </Container>
        </section>

        <section className="journal-section" id="journal">
          <Container>
            <div className="section-heading">
              <div>
                <div className="eyebrow">THE GOOD STUFF</div>
                <h2>From the <em>recipe box</em></h2>
              </div>
              <p className="post-count">{posts.length} little kitchen stories <span>✳</span></p>
            </div>

            <div className="journal-controls">
              <div className="category-list" aria-label="Filter by bake type">
                {categories.map((category) => (
                  <button
                    className={`category-pill ${activeCategory === category ? 'active' : ''}`}
                    key={category}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <Form className="search-form" role="search" onSubmit={(event) => event.preventDefault()}>
                <span aria-hidden="true">⌕</span>
                <Form.Control
                  aria-label="Search bakes"
                  placeholder="Find a recipe..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                <kbd>↵</kbd>
              </Form>
            </div>

            {error && (
              <Alert variant="danger" className="app-alert">
                {error}
                {!loading && <Button variant="link" onClick={() => { setLoading(true); loadPosts() }}>Try again</Button>}
              </Alert>
            )}
            {loading ? (
              <div className="loading-state"><Spinner animation="border" /> <span>Preheating the oven...</span></div>
            ) : error ? null : visiblePosts.length ? (
              <Row className="post-grid">
                {visiblePosts.map((post, index) => (
                  <Col lg={4} md={6} key={post.id}>
                    <article className="post-card" onClick={() => setSelectedPost(post)}>
                      <button
                        className="post-image-button"
                        aria-label={`Read ${post.name}`}
                        onClick={() => setSelectedPost(post)}
                      >
                        <img src={post.imageUrl} alt={post.name} loading={index > 2 ? 'lazy' : 'eager'} />
                        <Badge className="type-badge">{post.recipeType}</Badge>
                        <span className="image-arrow" aria-hidden="true">↗</span>
                      </button>
                      <div className="post-card-body">
                        <div className="post-meta"><span>{formatDate(post.dateMade)}</span><Stars rating={post.enjoymentRating} /></div>
                        <h3>{post.name}</h3>
                        <p>{post.description}</p>
                        <div className="post-card-footer">
                          <div className="flavor-tags">
                            {post.flavors.slice(0, 3).map((flavor) => <span key={flavor}>{flavor}</span>)}
                          </div>
                          <button
                            className="read-link"
                            onClick={(event) => {
                              event.stopPropagation()
                              setSelectedPost(post)
                            }}
                          >
                            Read story <span>→</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  </Col>
                ))}
              </Row>
            ) : (
              <div className="empty-state">
                <span aria-hidden="true">⌕</span>
                <h3>No crumbs found.</h3>
                <p>Try another search or choose a different bake type.</p>
                <Button variant="link" onClick={() => { setQuery(''); setActiveCategory('All bakes') }}>
                  Clear filters
                </Button>
              </div>
            )}
          </Container>
        </section>
        <section className="closing-note">
          <Container><span>✳</span><p>Every bake has a story. Here are a few of mine.</p><span>✳</span></Container>
        </section>
      </main>

      <footer className="site-footer">
        <Container><a className="brand" href="#"><span className="brand-mark">b.</span><span>blake&apos;s <em>bakes</em></span></a><span>Made with butter & a little bit of patience.</span><span>© {CURRENT_YEAR} Blake&apos;s Bakes</span></Container>
      </footer>

      <Modal show={Boolean(selectedPost)} onHide={() => setSelectedPost(null)} size="lg" centered scrollable className="post-modal">
        {selectedPost && (
          <>
            <div className="modal-cover"><img src={selectedPost.imageUrl} alt={selectedPost.name} /></div>
            <Modal.Header closeButton>
              <div className="eyebrow">{selectedPost.recipeType} · {formatDate(selectedPost.dateMade)}</div>
              <Modal.Title>{selectedPost.name}</Modal.Title>
              <Stars rating={selectedPost.enjoymentRating} />
            </Modal.Header>
            <Modal.Body>
              <p className="modal-description">{selectedPost.description}</p>
              <div className="modal-flavors">{selectedPost.flavors.map((flavor) => <Badge key={flavor}>{flavor}</Badge>)}</div>
              <h4>The recipe</h4>
              <p className="recipe-source">{selectedPost.recipeSource || 'Recipe notes coming soon.'}</p>
              <Row>
                <Col md={6}><h4>For next time</h4><ul>{selectedPost.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul></Col>
                <Col md={6}><h4>Kitchen notes</h4><ul>{selectedPost.thoughts.map((thought) => <li key={thought}>{thought}</li>)}</ul></Col>
              </Row>
            </Modal.Body>
          </>
        )}
      </Modal>

      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered scrollable className="create-modal">
        <Modal.Header closeButton>
          <div><div className="eyebrow">ADD TO THE JOURNAL</div><Modal.Title>A new kitchen story</Modal.Title></div>
        </Modal.Header>
        <Form onSubmit={handleCreate}>
          <Modal.Body>
            {formError && <Alert variant="danger">{formError}</Alert>}
            <Form.Group className="mb-3"><Form.Label>What did you bake?</Form.Label><Form.Control required maxLength={140} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Sunday morning cinnamon rolls" /></Form.Group>
            <Row>
              <Col sm={6}><Form.Group className="mb-3"><Form.Label>Date made</Form.Label><Form.Control required type="date" value={form.dateMade} onChange={(event) => setForm({ ...form, dateMade: event.target.value })} /></Form.Group></Col>
              <Col sm={6}><Form.Group className="mb-3"><Form.Label>Bake type</Form.Label><Form.Select value={form.recipeType} onChange={(event) => setForm({ ...form, recipeType: event.target.value })}><option>Bread</option><option>Cake</option><option>Cookies</option><option>Pastry</option><option>Pie</option><option>Other</option></Form.Select></Form.Group></Col>
            </Row>
            <Form.Group className="mb-3"><Form.Label>A little about it</Form.Label><Form.Control required as="textarea" rows={2} maxLength={500} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What made this bake special?" /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Photo URL</Form.Label><Form.Control required type="url" value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} placeholder="https://..." /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Recipe source</Form.Label><Form.Control value={form.recipeSource} onChange={(event) => setForm({ ...form, recipeSource: event.target.value })} placeholder="Book, website, or your own recipe" /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Flavors <span className="field-hint">comma separated</span></Form.Label><Form.Control value={form.flavors} onChange={(event) => setForm({ ...form, flavors: event.target.value })} placeholder="Vanilla, orange, cardamom" /></Form.Group>
            <Row>
              <Col sm={6}><Form.Group className="mb-3"><Form.Label>Tips for next time <span className="field-hint">one per line</span></Form.Label><Form.Control as="textarea" rows={3} value={form.tips} onChange={(event) => setForm({ ...form, tips: event.target.value })} /></Form.Group></Col>
              <Col sm={6}><Form.Group className="mb-3"><Form.Label>Kitchen notes <span className="field-hint">one per line</span></Form.Label><Form.Control as="textarea" rows={3} value={form.thoughts} onChange={(event) => setForm({ ...form, thoughts: event.target.value })} /></Form.Group></Col>
            </Row>
            <Form.Group><Form.Label>How much did you love it?</Form.Label><Form.Select value={form.enjoymentRating} onChange={(event) => setForm({ ...form, enjoymentRating: event.target.value })}><option value="5">5 — absolutely loved it</option><option value="4">4 — would bake again</option><option value="3">3 — pretty good</option><option value="2">2 — needs work</option><option value="1">1 — a learning experience</option></Form.Select></Form.Group>
          </Modal.Body>
          <Modal.Footer><Button variant="outline-secondary" onClick={() => setShowCreate(false)}>Cancel</Button><Button type="submit" className="new-bake-button" disabled={saving}>{saving ? 'Saving...' : 'Save to the journal'}</Button></Modal.Footer>
        </Form>
      </Modal>
    </div>
  )
}

export default App
