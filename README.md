# http-with-fetch
A tiny (< 1 kb) abstraction over building complex wrappers over the `fetch` API.

## Description

`http-with-fetch` provides an easier way to write APIs using `fetch`.

## Installation

```sh
npm i http-with-fetch
```

## Usage

Intended to be used as a ES6 module ( `import` ) or using `require`.

```js
import { HTTP } from 'http-with-fetch'
let userService = new HTTP('/users')
```

## Motivation

Consider the following code
```js
let options = { mode: 'cors' }

fetch('/resource/point1', options)

fetch('/resource/point2', options)

fetch('/resource/point3', options)
  
fetch('/resource/point4', options)
```

If you were to do a POST at `/resource/point3`, then you can't reuse `options` in the fetch call and the code would then become

```js
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

```js
const { HTTP } = require('http-with-fetch')

let http = new HTTP('/resource/')

const data = { 'some': 'data' }

http.use(http.add('mode', 'cors'))

http.get('point1')

http.get('point2')

http.method('point3', "POST",
  http.add('body', JSON.stringify(data)),
  http.add('headers', {'content-type': 'application/json'})
)

http.get('point4')
```

# API

## HTTP(base?: string)

Creates a new object.

| Arguments | Description                   |
| --------- | ----------------------------- |
| base      | The base url of the resource. Default is `""` |

## add(key: string, value: string | Record<string, string>)

Helper method to create interceptors.

## use(interceptor: function)

Adds an common interceptor. All requests will be intercepted by this.

## method(url: string, method: string, ...interceptors?: function[])

Make a request.

| Arguments    | Description                                        |
| ------------ | -------------------------------------------------- |
| url          | The url of the resource (relative to the base URL) |
| method       | HTTP method to use. Uppercase only.                |
| interceptors | Interceptors specific to this request.             |

## get(url: string, ...interceptors?: function[])

An alias for `method` with `verb=GET`
