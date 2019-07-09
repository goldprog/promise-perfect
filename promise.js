class MyPromise {
  constructor(excution) {
    this.value = void 0
    this.fullFilled = []
    this.rejected = []
    this.status = 'PENDING'

    const resolvedFn = val => {
      if (this.status !== 'PENDING') return
      this.timer = setTimeout(() => {
        this.status = 'FULLFILLED'
        this.value = val
        this.fullFilled.forEach(fn => fn(this.value))
      }, 0);
    }
    const rejectedFn = reason => {
      if (this.status !== 'PENDING') return
      this.timer = setTimeout(() => {
        this.status = 'REJECTED'
        this.value = reason
        this.rejected.forEach(fn => fn(this.value))
      }, 0);
    }

    try {
      excution(resolvedFn, rejectedFn)
    } catch (error) {
      rejectedFn(error)
    }
  }
  then(resolvedCallback, rejectedCallback) {
    resolvedCallback = typeof resolvedCallback !== 'function' ? res => res : resolvedCallback
    rejectedCallback = typeof rejectedCallback !== 'function' ? function () { throw new Error('must be a function') } : rejectedCallback
    return new MyPromise((resolve, reject) => {
      this.fullFilled.push(() => {
        try {
          let x = resolvedCallback(this.value)
          x instanceof MyPromise ? x.then(resolve, reject) : resolve(x)
        } catch (error) {
          reject(error)
        }
      })

      this.rejected.push(() => {
        try {
          let x = rejectedCallback(this.value)
          x instanceof MyPromise ? x.then(resolve, reject) : reject(x)
        } catch (error) {
          reject(error)
        }
      })
    })
  }
  static all(promises) {
    if (Object.prototype.toString.call(promises) !== '[object Array]') {
      throw new Error('arguments must be an Array')
    }
    let length = promises.length
    let result = []
    let index = 0
    return new MyPromise((resolve, reject) => {
      for (let i = 0; i < length; i++) {
        promises[i].then(res => {
          index++;
          result.push(res)
          if (index === length) {
            resolve(result)
          }
        }, reject)
      }
    })
  }
  static race(promises) {
    promises = Array.from(promises)
    return new MyPromise((resolve, reject) => {
      if(promises.length === 0) {

      } else {
        for(let i =0; i< promises.length; i++) {
          promises[i].then(res => {
            resolve(res)
          })
        }
      }
    })
  }
}