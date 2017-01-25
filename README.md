# http-with-fetch
A tiny abstraction over the `fetch` API.

## Description

`http-with-fetch` provides an easier way to write APIs using `fetch`.

## Installation

```
npm i http-with-fetch --save
bower install http-with-fetch
```

## Note

This library uses the native `fetch` if supported. You can also pass a `fetch` polyfill if you are using this in an environment where native `fetch` isn't supported (for ex. node, old browsers)

## Usage

Intended to be used as a ES6 module ( `import` ) or using `require`.

```
import HTTP from 'http-with-fetch'
let userService = new HTTP('/users', some-fetch-polyfill)
```

## Motivation

Consider the following code
```
let options = { mode: 'cors' }

fetch('/resource/point1', options)

fetch('/resource/point2', options)

fetch('/resource/point3', options)
  
fetch('/resource/point4', options)
```

If you were to do a POST at `/resource/point3`, then you can't reuse `options` in the fetch call and the code would then become

```
let options = { mode: 'cors' }

let data = { 'some': 'data' }

fetch('/resource/point1', options)

fetch('/resource/point2', options)

fetch('/resource/point3', {
  mode: 'cors',
  method: 'POST',
  headers: {
    'content-type': 'application/json'
  }
  body: JSON.stringify(data)
})
  
fetch('/resource/point4', options)
```

This problem increases when each `fetch` does some common things and also its own specific stuff.

With `http-with-fetch` it can be rewritten as,

```
const HTTP = require('http-with-fetch')

let http = new HTTP('/resource/')

const data = { 'some': 'data' }

http.use(http.add('mode', 'cors'))

http.get('point1')

http.get('point2')

http.post('point3', JSON.stringify(data), http.add('headers', {'content-type': 'application/json'}))

http.get('point4')
```

# API

## constructor(base: String, fetch: Fetch?)

Creates a new object.

| Arguments | Description |
|---|---|
| base | The base url of the resource. |
| fetch | A Fetch polyfill. Only needed if the environment doesn't support `fetch` by default.|

## add(key: String, val: String | Object)

Helper method to create interceptors.

## use(interceptor: Function)

Adds an common interceptor. All requests will be intercepted by this.

## method(url: String, type: String, verb: String, ...interceptors: Function[])

Make a request.

| Arguments | Description |
|---|---|
| url | The url of the resource (relative to the base URL) |
| type | The response type. Can be one of `['json', 'text', 'formData', 'blob', 'arrayBuffer', 'none']`. Default is `json` |
| verb  | HTTP method to use. Uppercase only. |
| interceptors  | Interceptors specific to this request. |

## get(url: String, type: String, ...interceptors: Function[])

An alias for `method` with `verb=GET`

## post(url: String, data: Body, type: String, ...interceptors: Function[])

An alias for `method` with `verb=POST`

| Arguments | Description |
|---|---|
| data | The body of the POST request |
