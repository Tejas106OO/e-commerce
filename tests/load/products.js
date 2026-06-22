/**
 * k6 Load Test — Product Listing API
 * Run with: k6 run tests/load/products.js
 * Install k6: https://k6.io/docs/get-started/installation/
 */
import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate, Trend } from 'k6/metrics'

const errorRate   = new Rate('errors')
const apiDuration = new Trend('api_duration', true)

export const options = {
  stages: [
    { duration: '30s', target: 50  }, // Ramp up to 50 users
    { duration: '1m',  target: 100 }, // Hold at 100 users
    { duration: '30s', target: 200 }, // Spike to 200 users
    { duration: '30s', target: 0   }, // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'],   // 95% of requests under 500ms
    'errors':            ['rate<0.01'],   // Error rate < 1%
  },
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000'

export default function () {
  const scenarios = [
    // Product listing
    () => {
      const res = http.get(`${BASE_URL}/api/products?page=1&sort=newest`)
      check(res, {
        'products status 200': r => r.status === 200,
        'has products array':  r => JSON.parse(r.body).products?.length > 0,
      })
      apiDuration.add(res.timings.duration, { endpoint: 'products_list' })
      errorRate.add(res.status !== 200)
    },
    // Category filter
    () => {
      const res = http.get(`${BASE_URL}/api/products?category=fashion&sort=price_asc`)
      check(res, { 'category filter works': r => r.status === 200 })
      errorRate.add(res.status !== 200)
    },
    // Search
    () => {
      const res = http.get(`${BASE_URL}/api/products?search=laptop&page=1`)
      check(res, { 'search status 200': r => r.status === 200 })
      errorRate.add(res.status !== 200)
    },
    // Health check
    () => {
      const res = http.get(`${BASE_URL}/health`)
      check(res, { 'health check ok': r => r.status === 200 })
    }
  ]

  // Pick a random scenario
  scenarios[Math.floor(Math.random() * scenarios.length)]()
  sleep(Math.random() * 2 + 0.5) // 0.5–2.5s think time
}
