import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('https://api.example.com/users/me', () => {
    return HttpResponse.json({
      id: 0,
      firstName: 'John',
      lastName: 'Maverick',
    })
  }),
]
