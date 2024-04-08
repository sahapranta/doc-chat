let Cache = function () {
  this.cache = new Map();
};

Cache.prototype.set = function (key, value, duration) {
  const valueInCache = this.cache.get(key);
  if (valueInCache) {
    clearTimeout(valueInCache.timeout);
  }
  const timeout = setTimeout(() => this.cache.delete(key), duration);
  this.cache.set(key, { value, timeout });
  return Boolean(valueInCache);
};

Cache.prototype.get = function (key) {
  return this.cache.has(key) ? this.cache.get(key).value : -1;
};

Cache.prototype.has = function (key) {
  return this.cache.has(key);
};

Cache.prototype.count = function () {
  return this.cache.size;
};

export default Cache;
