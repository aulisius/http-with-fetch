let add = (key, val) => opts =>
  Object.assign({}, opts, {
    [key]:
      typeof val === "string" ? val : Object.assign({}, opts[key] || {}, val)
  });

export function HTTP(base = "") {
  globalFns = [];
  this.add = add;

  this.use = fn => globalFns.push(fn);

  this.get = (url, ...fns) => this.method(url, "GET", ...fns);

  this.post = (url, data, ...fns) =>
    this.method(url, "POST", add("body", data), ...fns);

  this.method = (url, method, ...fns) => {
    let opts = globalFns
      .concat(fns, add("method", method))
      .reduce((opts, fn) => fn(opts), {});
    return fetch(base + url, opts);
  };
}
