(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["http-with-fetch"] = factory();
	else
		root["http-with-fetch"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_RESULT__;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function () {
  'use strict';

  function fetchPonyfill(options) {
    var Promise = options && options.Promise || self.Promise;
    var XMLHttpRequest = options && options.XMLHttpRequest || self.XMLHttpRequest;
    var global = self;

    return function () {
      var self = Object.create(global, {
        fetch: {
          value: undefined,
          writable: true
        }
      });

      (function (self) {
        'use strict';

        if (self.fetch) {
          return;
        }

        var support = {
          searchParams: 'URLSearchParams' in self,
          iterable: 'Symbol' in self && 'iterator' in Symbol,
          blob: 'FileReader' in self && 'Blob' in self && function () {
            try {
              new Blob();
              return true;
            } catch (e) {
              return false;
            }
          }(),
          formData: 'FormData' in self,
          arrayBuffer: 'ArrayBuffer' in self
        };

        function normalizeName(name) {
          if (typeof name !== 'string') {
            name = String(name);
          }
          if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
            throw new TypeError('Invalid character in header field name');
          }
          return name.toLowerCase();
        }

        function normalizeValue(value) {
          if (typeof value !== 'string') {
            value = String(value);
          }
          return value;
        }

        // Build a destructive iterator for the value list
        function iteratorFor(items) {
          var iterator = {
            next: function next() {
              var value = items.shift();
              return { done: value === undefined, value: value };
            }
          };

          if (support.iterable) {
            iterator[Symbol.iterator] = function () {
              return iterator;
            };
          }

          return iterator;
        }

        function Headers(headers) {
          this.map = {};

          if (headers instanceof Headers) {
            headers.forEach(function (value, name) {
              this.append(name, value);
            }, this);
          } else if (headers) {
            Object.getOwnPropertyNames(headers).forEach(function (name) {
              this.append(name, headers[name]);
            }, this);
          }
        }

        Headers.prototype.append = function (name, value) {
          name = normalizeName(name);
          value = normalizeValue(value);
          var list = this.map[name];
          if (!list) {
            list = [];
            this.map[name] = list;
          }
          list.push(value);
        };

        Headers.prototype['delete'] = function (name) {
          delete this.map[normalizeName(name)];
        };

        Headers.prototype.get = function (name) {
          var values = this.map[normalizeName(name)];
          return values ? values[0] : null;
        };

        Headers.prototype.getAll = function (name) {
          return this.map[normalizeName(name)] || [];
        };

        Headers.prototype.has = function (name) {
          return this.map.hasOwnProperty(normalizeName(name));
        };

        Headers.prototype.set = function (name, value) {
          this.map[normalizeName(name)] = [normalizeValue(value)];
        };

        Headers.prototype.forEach = function (callback, thisArg) {
          Object.getOwnPropertyNames(this.map).forEach(function (name) {
            this.map[name].forEach(function (value) {
              callback.call(thisArg, value, name, this);
            }, this);
          }, this);
        };

        Headers.prototype.keys = function () {
          var items = [];
          this.forEach(function (value, name) {
            items.push(name);
          });
          return iteratorFor(items);
        };

        Headers.prototype.values = function () {
          var items = [];
          this.forEach(function (value) {
            items.push(value);
          });
          return iteratorFor(items);
        };

        Headers.prototype.entries = function () {
          var items = [];
          this.forEach(function (value, name) {
            items.push([name, value]);
          });
          return iteratorFor(items);
        };

        if (support.iterable) {
          Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
        }

        function consumed(body) {
          if (body.bodyUsed) {
            return Promise.reject(new TypeError('Already read'));
          }
          body.bodyUsed = true;
        }

        function fileReaderReady(reader) {
          return new Promise(function (resolve, reject) {
            reader.onload = function () {
              resolve(reader.result);
            };
            reader.onerror = function () {
              reject(reader.error);
            };
          });
        }

        function readBlobAsArrayBuffer(blob) {
          var reader = new FileReader();
          reader.readAsArrayBuffer(blob);
          return fileReaderReady(reader);
        }

        function readBlobAsText(blob) {
          var reader = new FileReader();
          reader.readAsText(blob);
          return fileReaderReady(reader);
        }

        function Body() {
          this.bodyUsed = false;

          this._initBody = function (body) {
            this._bodyInit = body;
            if (typeof body === 'string') {
              this._bodyText = body;
            } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
              this._bodyBlob = body;
            } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
              this._bodyFormData = body;
            } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
              this._bodyText = body.toString();
            } else if (!body) {
              this._bodyText = '';
            } else if (support.arrayBuffer && ArrayBuffer.prototype.isPrototypeOf(body)) {
              // Only support ArrayBuffers for POST method.
              // Receiving ArrayBuffers happens via Blobs, instead.
            } else {
              throw new Error('unsupported BodyInit type');
            }

            if (!this.headers.get('content-type')) {
              if (typeof body === 'string') {
                this.headers.set('content-type', 'text/plain;charset=UTF-8');
              } else if (this._bodyBlob && this._bodyBlob.type) {
                this.headers.set('content-type', this._bodyBlob.type);
              } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
                this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
              }
            }
          };

          if (support.blob) {
            this.blob = function () {
              var rejected = consumed(this);
              if (rejected) {
                return rejected;
              }

              if (this._bodyBlob) {
                return Promise.resolve(this._bodyBlob);
              } else if (this._bodyFormData) {
                throw new Error('could not read FormData body as blob');
              } else {
                return Promise.resolve(new Blob([this._bodyText]));
              }
            };

            this.arrayBuffer = function () {
              return this.blob().then(readBlobAsArrayBuffer);
            };

            this.text = function () {
              var rejected = consumed(this);
              if (rejected) {
                return rejected;
              }

              if (this._bodyBlob) {
                return readBlobAsText(this._bodyBlob);
              } else if (this._bodyFormData) {
                throw new Error('could not read FormData body as text');
              } else {
                return Promise.resolve(this._bodyText);
              }
            };
          } else {
            this.text = function () {
              var rejected = consumed(this);
              return rejected ? rejected : Promise.resolve(this._bodyText);
            };
          }

          if (support.formData) {
            this.formData = function () {
              return this.text().then(decode);
            };
          }

          this.json = function () {
            return this.text().then(JSON.parse);
          };

          return this;
        }

        // HTTP methods whose capitalization should be normalized
        var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

        function normalizeMethod(method) {
          var upcased = method.toUpperCase();
          return methods.indexOf(upcased) > -1 ? upcased : method;
        }

        function Request(input, options) {
          options = options || {};
          var body = options.body;
          if (Request.prototype.isPrototypeOf(input)) {
            if (input.bodyUsed) {
              throw new TypeError('Already read');
            }
            this.url = input.url;
            this.credentials = input.credentials;
            if (!options.headers) {
              this.headers = new Headers(input.headers);
            }
            this.method = input.method;
            this.mode = input.mode;
            if (!body) {
              body = input._bodyInit;
              input.bodyUsed = true;
            }
          } else {
            this.url = input;
          }

          this.credentials = options.credentials || this.credentials || 'omit';
          if (options.headers || !this.headers) {
            this.headers = new Headers(options.headers);
          }
          this.method = normalizeMethod(options.method || this.method || 'GET');
          this.mode = options.mode || this.mode || null;
          this.referrer = null;

          if ((this.method === 'GET' || this.method === 'HEAD') && body) {
            throw new TypeError('Body not allowed for GET or HEAD requests');
          }
          this._initBody(body);
        }

        Request.prototype.clone = function () {
          return new Request(this);
        };

        function decode(body) {
          var form = new FormData();
          body.trim().split('&').forEach(function (bytes) {
            if (bytes) {
              var split = bytes.split('=');
              var name = split.shift().replace(/\+/g, ' ');
              var value = split.join('=').replace(/\+/g, ' ');
              form.append(decodeURIComponent(name), decodeURIComponent(value));
            }
          });
          return form;
        }

        function headers(xhr) {
          var head = new Headers();
          var pairs = (xhr.getAllResponseHeaders() || '').trim().split('\n');
          pairs.forEach(function (header) {
            var split = header.trim().split(':');
            var key = split.shift().trim();
            var value = split.join(':').trim();
            head.append(key, value);
          });
          return head;
        }

        Body.call(Request.prototype);

        function Response(bodyInit, options) {
          if (!options) {
            options = {};
          }

          this.type = 'default';
          this.status = options.status;
          this.ok = this.status >= 200 && this.status < 300;
          this.statusText = options.statusText;
          this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers);
          this.url = options.url || '';
          this._initBody(bodyInit);
        }

        Body.call(Response.prototype);

        Response.prototype.clone = function () {
          return new Response(this._bodyInit, {
            status: this.status,
            statusText: this.statusText,
            headers: new Headers(this.headers),
            url: this.url
          });
        };

        Response.error = function () {
          var response = new Response(null, { status: 0, statusText: '' });
          response.type = 'error';
          return response;
        };

        var redirectStatuses = [301, 302, 303, 307, 308];

        Response.redirect = function (url, status) {
          if (redirectStatuses.indexOf(status) === -1) {
            throw new RangeError('Invalid status code');
          }

          return new Response(null, { status: status, headers: { location: url } });
        };

        self.Headers = Headers;
        self.Request = Request;
        self.Response = Response;

        self.fetch = function (input, init) {
          return new Promise(function (resolve, reject) {
            var request;
            if (Request.prototype.isPrototypeOf(input) && !init) {
              request = input;
            } else {
              request = new Request(input, init);
            }

            var xhr = new XMLHttpRequest();

            function responseURL() {
              if ('responseURL' in xhr) {
                return xhr.responseURL;
              }

              // Avoid security warnings on getResponseHeader when not allowed by CORS
              if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
                return xhr.getResponseHeader('X-Request-URL');
              }

              return;
            }

            xhr.onload = function () {
              var options = {
                status: xhr.status,
                statusText: xhr.statusText,
                headers: headers(xhr),
                url: responseURL()
              };
              var body = 'response' in xhr ? xhr.response : xhr.responseText;
              resolve(new Response(body, options));
            };

            xhr.onerror = function () {
              reject(new TypeError('Network request failed'));
            };

            xhr.ontimeout = function () {
              reject(new TypeError('Network request failed'));
            };

            xhr.open(request.method, request.url, true);

            if (request.credentials === 'include') {
              xhr.withCredentials = true;
            }

            if ('responseType' in xhr && support.blob) {
              xhr.responseType = 'blob';
            }

            request.headers.forEach(function (value, name) {
              xhr.setRequestHeader(name, value);
            });

            xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
          });
        };
        self.fetch.polyfill = true;
      })(typeof self !== 'undefined' ? self : this);

      return {
        fetch: self.fetch,
        Headers: self.Headers,
        Request: self.Request,
        Response: self.Response
      };
    }();
  }

  if (true) {
    !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
      return fetchPonyfill;
    }.call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') {
    module.exports = fetchPonyfill;
  } else {
    self.fetchPonyfill = fetchPonyfill;
  }
})();

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fetchPonyfill = __webpack_require__(0);

var _fetchPonyfill2 = _interopRequireDefault(_fetchPonyfill);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var http = function http() {
  var _this = this;

  var base = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  _classCallCheck(this, http);

  this.use = function (interceptor) {
    return _this.interceptors.push(interceptor);
  };

  this.add = function (key, val) {
    return function (opts) {
      opts[key] = val;
      return opts;
    };
  };

  this.get = function (url) {
    for (var _len = arguments.length, interceptors = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      interceptors[_key - 2] = arguments[_key];
    }

    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'json';
    return _this.method.apply(_this, [url, type, 'GET'].concat(interceptors));
  };

  this.post = function (url, data) {
    for (var _len2 = arguments.length, interceptors = Array(_len2 > 3 ? _len2 - 3 : 0), _key2 = 3; _key2 < _len2; _key2++) {
      interceptors[_key2 - 3] = arguments[_key2];
    }

    var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'json';
    return _this.method.apply(_this, [url, type, 'POST', _this.add('body', data)].concat(interceptors));
  };

  this.method = function (url, type, method) {
    for (var _len3 = arguments.length, interceptors = Array(_len3 > 3 ? _len3 - 3 : 0), _key3 = 3; _key3 < _len3; _key3++) {
      interceptors[_key3 - 3] = arguments[_key3];
    }

    var target = _this.base() + url;

    var opts = _this.interceptors.concat(interceptors, _this.add('method', method)).reduce(function (opts, interceptor) {
      return interceptor(opts);
    }, {});

    var valid = ['arrayBuffer', 'blob', 'formData', 'json', 'text'].indexOf(type) !== -1;

    return valid ? _this.fetch(target, opts).then(function (response) {
      return response[type]();
    }) : _this.fetch(target, opts);
  };

  var _base = base;
  this.interceptors = [];
  this.fetch = (0, _fetchPonyfill2.default)().fetch;
  this.base = function () {
    return _base;
  };
};

exports.default = http;

/***/ })
/******/ ]);
});