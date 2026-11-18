import { vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

const api = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}))

vi.mock('../services/api', () => ({
  api,
  getErrorMessage: () => 'The API is unavailable.',
  withAuth: (token) => ({ headers: { Authorization: `Bearer ${token}` } }),
}))

import App from './index'

const job = {
  id: 1,
  title: 'Software Engineer',
  department: 'Engineering',
  employment_type: 'Full-time',
  experience: '2–5 years',
  location: 'Kolhapur, Maharashtra',
  summary: 'An illustrative profile for route validation.',
  description: 'This illustrative profile is used for testing career routes.',
  responsibilities: 'Build reliable workflows',
  skills: 'Python, SQL',
  qualification: 'Relevant degree',
  availability_note: 'Illustrative profile only; no vacancy verified.',
  listing_status: 'illustrative',
  listing_source: null,
  listing_date: null,
  is_published: true,
}

describe('React route smoke tests', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    )
    api.get.mockImplementation(async (path) => ({
      data: path === '/jobs' ? [job] : job,
    }))
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it.each([
    ['/', 'Banking, built around'],
    ['/about', 'Technology with a'],
    ['/solutions', 'Technology for the'],
    ['/banking-technology', 'One banking platform'],
    ['/careers', 'Build technology'],
    ['/careers/1', 'Software Engineer'],
    ['/careers/1/apply', 'Tell us a little'],
    ['/contact', 'Good conversations'],
    ['/admin/login', 'Welcome back'],
    ['/admin/dashboard', 'Welcome back'],
    ['/not-found', 'This page took a wrong turn'],
  ])('renders %s without falling through to an error page', async (path, expectedHeading) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>,
    )

    const heading = await screen.findByRole('heading', { level: 1 })
    expect(heading.textContent).toContain(expectedHeading)
  })
})
