export default class http {
    constructor(base = '') {
        this.base = base
        this.interceptors = []

        this.use = this.use.bind(this)
        this.add = this.add.bind(this)
        this.get = this.get.bind(this)
        this.post = this.post.bind(this)
        this.method = this.method.bind(this)
    }

    use(interceptor) {
        this.interceptors.push(interceptor)
    }

    add(key, val) {
        return (opts) => {
            opts[key] = val
            return opts
        }
    }

    get(url, type = 'json', ...interceptors) {
        return this.method(url, type, 'GET', ...interceptors)
    }

    post(url, data, type = 'json', ...interceptors) {
        return this.method(url, type, 'POST', this.add('body', data), ...interceptors)
    }

    method(url, type, method, ...interceptors) {
        const target = this.base + url

        const opts = this.interceptors
            .concat(interceptors, this.add('method', method))
            .reduce((opts, interceptor) => interceptor(opts), {})

        return fetch(target, opts).then(response => response[type]())
    }
}
