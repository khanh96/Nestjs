const axios = require('axios')

const ENDPOINT = 'http://localhost:3000/orders'

const accessTokenUser1 = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgsImRldmljZUlkIjoxMTEsInJvbGVJZCI6Mywicm9sZU5hbWUiOiJTRUxMRVIiLCJ1dWlkIjoiMWY4Mjc4YmItNDM0MC00MzQ2LTg5ODAtM2RjM2M5ZTI2MzIwIiwiaWF0IjoxNzY3OTUyMzQ3LCJleHAiOjE3Njc5NTU5NDd9.b0CyKGO00fjsBQQI6EgaoAZePvbDFfROrWGN1gKDI4g`
const accessTokenUser2 = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImRldmljZUlkIjoxMTIsInJvbGVJZCI6Mywicm9sZU5hbWUiOiJTRUxMRVIiLCJ1dWlkIjoiM2JiMTViMjEtNGFmOS00Yjc4LTg3NWItMTNjMmYwMjBmYmZlIiwiaWF0IjoxNzY3OTUyNDY0LCJleHAiOjE3Njc5NTYwNjR9.OJHVvGSniyui_-8GJ1zdnujSuwMc_H6Y1RZdWxjLZgY`

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
    cartItemIds: [40],
    receiver: {
      name: 'Lucian',
      phone: '0947836128',
      address: "HN"
    }
  }
]

const orderBody2 = [
  {
    shopId: 5,
    cartItemIds: [39],
    receiver: {
      name: 'Lucian',
      phone: '0947836128',
      address: "HN"
    }
  }
]

const order1$ = axios
  .post(ENDPOINT, orderBody1, { headers: headers1 })
  .catch((e) => {
    console.log('Error in order1:', e)
  })
const order2$ = axios
  .post(ENDPOINT, orderBody2, { headers: headers2 })
  .catch((e) => {
    console.log('Error in order2:', e)
  })

Promise.all([order1$, order2$]).then(([res1, res2]) => {
  console.log('Order 1 response:', res1.data)
  console.log('Order 2 response:', res2.data)
})