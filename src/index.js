let add = (key, val) => opts =>
  Object.assign({}, opts, {
    [key]:
      typeof val === "string" ? val : Object.assign({}, opts[key] || {}, val)
  });

export function HTTP(base = "") {
  globalFns = [];
  this.add = add;

  this.use = fn => globalFns.push(fn);

  this.get = (url, type = "json", ...fns) =>
    this.method(url, type, "GET", ...fns);

  this.post = (url, data, type = "json", ...fns) =>
    this.method(url, type, "POST", add("body", data), ...fns);

  this.method = (url, type, method, ...fns) => {
    let target = base + url;
    let opts = globalFns
      .concat(fns, add("method", method))
      .reduce((opts, fn) => fn(opts), {});

    let valid = ["arrayBuffer", "blob", "formData", "json", "text"].includes(
      type
    );

    return valid
      ? window.fetch(target, opts).then(response => response[type]())
      : window.fetch(target, opts);
  };
}
