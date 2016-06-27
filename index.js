let http = Object.create(Function), ptype = http.prototype

ptype.base = ''

ptype._interceptors = []

ptype.add = (key, val) => options => {
        options[key] = val
        return options
}

ptype.use = interceptor => http._interceptors.push(interceptor)

ptype.get = (url, type = 'json', ...interceptors) => http.method(url, type, 'GET', ...interceptors) 

ptype.post = (url, data, type = 'json', ...interceptors) => http.method(url, type, 'POST', http.add('body', data), ...interceptors) 

ptype.method = function(url, type, method, ...interceptors) {
    let target = ''
    if(this.base.trim().length === 0) target += this.base 
    target += url

    const options = this._interceptors.concat(interceptors, http.add('method', method)).reduce((options, interceptor) => interceptor(options), {})

    return fetch(target, options).then(res => res[type]())
}

module.exports = http