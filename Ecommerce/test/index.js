const axios = require('axios')

const ENDPOINT = 'http://localhost:3000/orders'

const accessTokenUser1 = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgsImRldmljZUlkIjoxMTMsInJvbGVJZCI6Mywicm9sZU5hbWUiOiJTRUxMRVIiLCJ1dWlkIjoiYmRkZGI0YWEtY2E3NC00YjMxLWI4ZDctYjA4ODBmOWFlNzMxIiwiaWF0IjoxNzY4MjEwNzYxLCJleHAiOjE3NjgyMTQzNjF9.SSntnYg7_4kk-Limf6oVApxXKTOozbz3E8LJdHC-0fE`
const accessTokenUser2 = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImRldmljZUlkIjoxMTQsInJvbGVJZCI6Mywicm9sZU5hbWUiOiJTRUxMRVIiLCJ1dWlkIjoiZGU0MGU2MDQtNTBmMS00ODc4LTkzMjItNTBkMjM3YzQ3Nzg2IiwiaWF0IjoxNzY4MjEwODA0LCJleHAiOjE3NjgyMTQ0MDR9.5dCz9QN2vwoa5wlfScbqFV_lSqPUa06B765AYGUXpKg`

const baseHeaders = {
  'Content-Type': 'application/json'
}

const headers1 = {
  ...baseHeaders,
  Authorization: `Bearer ${accessTokenUser1}`
}

const headers2 = {
  ...baseHeaders,
  Authorization: `Bearer ${accessTokenUser2}`
}

const orderBody1 = [
  {
    shopId: 5,
    cartItemIds: [45],
    receiver: {
      name: 'Lucian',
      phone: '0905123456',
      address: 'Ha noi'
    }
  }
]

const orderBody2 = [
  {
    shopId: 5,
    cartItemIds: [43],
    receiver: {
      name: 'Lucian',
      phone: '0905123456',
      address: 'Ha noi'
    }
  }
]

// const order1$ =

// const order2$ =

Promise.all([
  axios
    .post(ENDPOINT, orderBody1, { headers: headers1 })
    .then((res) => {
      console.log('Order 1 response:', res.data)
    })
    .catch((e) => {
      console.log('Error in order 1:', e.response.data)
    }),
  axios
    .post(ENDPOINT, orderBody2, { headers: headers2 })
    .then((res) => {
      console.log('Order 2 response:', res.data)
    })
    .catch((e) => {
      console.log('Error in order 2:', e.response.data)
    })
])