// Import necessary modules from k6 for making HTTP requests and defining metrics.
import http from 'k6/http'
import { check, sleep } from 'k6'
import { Counter, Gauge, Rate, Trend } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js'

// configuration for each test schenario
const scenarios = {
  smoke: {
    executor: 'constant-vus',
    vus: 1,  // Constant number of virtual users.
    duration: '30s',  // Duration of the test.
  },
  load: {
    executor: 'ramping-vus',
    startVUs: 0,  // Start with 0 virtual users.
    stages: [
      { duration: '2s', target: 100 },  // Ramp up to 100 virtual users in 2 seconds.
      { duration: '5m', target: 100 },  // Maintain 100 virtual users for 5 minutes.
      { duration: '1m', target: 0 },  // Ramp down to 0 virtual users in 1 minute.
    ],
  },
  stress: {
    executor: 'constant-arrival-rate',
    rate: 200,  // 200 iterations per second.
    timeUnit: '1s',  // Time unit for the rate.
    duration: '1m',  // Duration of the test.
    preAllocatedVUs: 50,  // Initial pool of virtual users.
    maxVUs: 100,  // Maximum pool of virtual users.
  },
}

// Define the options for the test, including smoke, load, and stress scenarios.
export const options = {
  scenarios: { [__ENV.TEST]: scenarios[__ENV.TEST] }
}


// Custom metrics
const myReqCounter = new Counter('my_req_counter');
const myReqGauge = new Gauge('my_gauge');
const myReqRate = new Rate('my_rate');
const myReqTrend = new Trend('my_trend');

const checks = {
  helloWordCheck: (res) => check(res, { 
    'status was 200': (r) => r.status == 200,
    'network latency within acceptable range': (r) => r.timings.waiting < 100,
  }),
  resourceCheck: (res) => check(res, { 
    'System CPU usage is below 123': (r) => JSON.parse(r.body).cpu.system < 999999999, // random value
    'HeapUsed Memory usage is below 321': (r) => JSON.parse(r.body).memory.heapUsed < 999999999 // random value
  }),
}


export function handleSummary (data) {
  return {
    [`./results/${__ENV.TEST}.html`]: htmlReport(data),
    [`./results/${__ENV.TEST}.json`]: JSON.stringify(data, null, 2),
  }
}


// Function to perform standard request checks
export default function () {
  const baseAddress = 'http://localhost:3000'
  // Perform basic checks on HTTP responses
  const res1 = http.get(`${baseAddress}/`);
  const res2 = http.get(`${baseAddress}/schema`);
  [res1, res2].forEach((res) => {
    checks.helloWordCheck(res)
    // Custom metrics recording
    myReqGauge.add(res.timings.duration);
    myReqRate.add(res.status === 200);
    myReqTrend.add(res.timings.duration);
    myReqCounter.add(1)
  })
  
  // Resource check example
  const res3 = http.get(`${baseAddress}/resource`);
  checks.resourceCheck(res3);


  // Record additional custom metrics if needed
  const resourceData = JSON.parse(res3.body);
  myReqGauge.add(resourceData.cpu.system, { metric: 'system', group: 'cpu'});
  myReqGauge.add(resourceData.memory.heapUsed, { metric: 'heapUsed', group: 'memory'});

  myReqCounter.add(1)
  
  // Sleep for 1 second to simulate a pause between requests
  sleep(1);
}


