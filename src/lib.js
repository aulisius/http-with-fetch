import Fetch from 'fetch-ponyfill'
export default class http {
  constructor (base = '') {
    let _base = base
    this.interceptors = []
    this.fetch = Fetch().fetch
    this.base = () => _base
  }

  use = (interceptor) => this.interceptors.push(interceptor)

  add = (key, val) => (opts) => {
    opts[key] = val
    return opts
  }

  get = (url, type = 'json', ...interceptors) => this.method(url, type, 'GET', ...interceptors)

  post = (url, data, type = 'json', ...interceptors) => this.method(url, type, 'POST', this.add('body', data), ...interceptors)

  method = (url, type, method, ...interceptors) => {
    const target = this.base() + url

    const opts = this.interceptors.concat(interceptors, this.add('method', method)).reduce((opts, interceptor) => interceptor(opts), {})

    const valid = ['arrayBuffer', 'blob', 'formData', 'json', 'text'].indexOf(type) !== -1

    return valid
    ? this.fetch(target, opts).then(response => response[type]())
    : this.fetch(target, opts)
  }
}
