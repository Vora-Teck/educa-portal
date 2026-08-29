class ApiCache {
    constructor(options = {}) {
        this.storageKey = options.storageKey || "eduka_api_cache";
        this.defaultTTL = options.defaultTTL || 30 * 60 * 1000; // 1 hour
        this.maxEntries = options.maxEntries || 500;
        this.persist = options.persist !== false;

        this.cache = [];
        this.listeners = {};

        this.load();
        this.cleanup();
        window.addEventListener("storage", this.onStorageChange.bind(this));
    }

    /**
     * Stable stringify so object key order doesn't matter
     */
    static stableStringify(value) {
        if (value === null || typeof value !== "object")
            return JSON.stringify(value);

        if (Array.isArray(value))
            return "[" + value.map(ApiCache.stableStringify).join(",") + "]";

        return (
            "{" +
            Object.keys(value)
                .sort()
                .map(key => JSON.stringify(key) + ":" + ApiCache.stableStringify(value[key]))
                .join(",") +
            "}"
        );
    }

    static hash(func, params) {
        return `${func}:${ApiCache.stableStringify(params)}`;
    }

    save() {
        if (!this.persist) return;

        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.cache));
        } catch (e) {
            console.error("Unable to save cache.", e);
        }
    }

    load() {
        if (!this.persist) return;
        try {
            const stored = localStorage.getItem(this.storageKey);

            if (stored)
                this.cache = JSON.parse(stored);
        } catch {
            this.cache = [];
        }
    }

    emit(event, ...args) {
        (this.listeners[event] || []).forEach(
            listener => listener(...args)
        );
    }

    on(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }

    onStorageChange(event) {
        if (event.key !== this.storageKey)
            return;
        this.cache = JSON.parse(event.newValue || "[]");
        this.cleanup();
        this.emit("sync");
    }

    cleanup() {
        const now = Date.now();
        this.cache = this.cache.filter(item => item.expiration > now);
        this.save();
    }

    hasCache(func, params) {
        return this.getCache(func, params) !== null;
    }

    getCache(func, params) {
        const key = ApiCache.hash(func, params);
        const now = Date.now();
        const index = this.cache.findIndex(item => item.key === key);
        if (index === -1) return null;
        const item = this.cache[index];
        if (item.expiration <= now) {
            this.cache.splice(index, 1);
            this.save();
            return null;
        }
        item.lastAccessed = now;
        if(item.compressed)
            return this.decompress(item.response);
        return structuredClone(item.response);
    }

    getCacheInfo(func, params) {
        const key = ApiCache.hash(func, params);
        return this.cache.find(item => item.key === key) || null;
    }

    setCache(func, params, response, expiration = null) {
        const key = ApiCache.hash(func, params || {});
        const now = Date.now();
        const expires =
            expiration instanceof Date
                ? expiration.getTime()
                : expiration || (now + this.defaultTTL);

        const cacheObject = {
            key,
            func,
            params: structuredClone(params || {}),
            response: this.compress(response),
            compressed: true,
            createdAt: now,
            updatedAt: now,
            lastAccessed: now,
            expiration: expires
        };

        const index = this.cache.findIndex(item => item.key === key);

        if (index >= 0) {
            cacheObject.createdAt = this.cache[index].createdAt;
            this.cache[index] = cacheObject;
        } else {
            this.cache.push(cacheObject);

            while (this.cache.length > this.maxEntries)
                this.cache.shift();
        }

        this.save();

        return cacheObject;
    }

    removeCache(func, params = {}) {
        const key = ApiCache.hash(func, params);
        const before = this.cache.length;
        this.cache = this.cache.filter(item => item.key !== key);
        this.save();
        return before !== this.cache.length;
    }

    clearFunction(func) {
        const before = this.cache.length;
        this.cache = this.cache.filter(item => item.func !== func);
        this.save();
        return before - this.cache.length;
    }

    compress(data) {
        return LZString.compressToUTF16(
            JSON.stringify(data)
        )
    }

    decompress(data) {
        return JSON.parse(
            LZString.decompressFromUTF16(data)
        )
    }

    async fetchOrCache({ func, params = {}, fetcher, ttl = this.defaultTTL, staleWhileRevalidate = true }) {
        const key = ApiCache.hash(func, params);
        const entry = this.cache.find(c => c.key === key);

        if (!entry) {
            const response = await fetcher({params});
            if(response.status === "success") {
                this.setCache(func, params, response);
            }
            return response;
        }

        if (entry.expiration > Date.now()) {
            if(entry.compressed) {
                return this.decompress(entry.response)
            }
            return structuredClone(entry.response)
        }

        if (!staleWhileRevalidate)
            return await this.refresh(func, params, fetcher);

        this.refresh(func, params, fetcher);

        if(entry.compressed) {
            return this.decompress(entry.response)
        }
        return structuredClone(entry.response)
    }

    async refresh(func, params, fetcher, expiration = null) {
        const response = await fetcher({params: params || {}});
        if(response.status === "success") {
            this.setCache(func, params, response, expiration);
            this.emit("updated", func, params);
        }
        return response;
    }

    clear() {
        this.cache = [];
        this.save();
    }

    size() {
        return this.cache.length;
    }

    entries() {
        return structuredClone(this.cache);
    }
}
