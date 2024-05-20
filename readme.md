# HTTP load test branchmark POC

## Description

This is a simple POC to test the performance of a fastify package using the `k6` tool for this [issue](https://github.com/nodesource/nodejs-package-benchmark/issues/7)

## How to run

1. Clone the repository
2. Run `npm install`
3. Run `node server`
4. Run `TEST=smoke npx k6 run test.js`

## Environment variables

- `TEST`: The test to run. The options are `smoke`, `load` or `stress`


## Running with docker-compose(recommended)

1. Clone the repository
2. Run `docker-compose up --build` (you dont need to specify envs)

## Results

The results are in the `results` folder

## undestanding the test

Take a look into test.js, there have commtents explaining almost all lines




