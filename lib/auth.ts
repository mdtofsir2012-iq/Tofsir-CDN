import { cache } from 'react'

export const getCurrentUser = cache(async () => {
  const user = {
    id: 'admin',
    name: 'Admin',
    email: 'admin@imgstorage.local',
    image: null,
    username: 'admin',
  }

  const session = {
    user: {
      id: 'admin',
      name: 'Admin',
      email: 'admin@imgstorage.local',
      image: null,
      username: 'admin',
    }
  }

  return { session, user }
})
