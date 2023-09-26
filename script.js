class CustomPromise {
  constructor(executor) {
    this.status = 'pending';
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
      if (this.status === 'pending') {
        this.status = 'fulfilled';
        this.value = value;
        this.onFulfilledCallbacks.forEach((callback) => callback(this.value));
      }
    };

    const reject = (reason) => {
      if (this.status === 'pending') {
        this.status = 'rejected';
        this.reason = reason;
        this.onRejectedCallbacks.forEach((callback) => callback(this.reason));
      }
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : (value) => value;
    onRejected = typeof onRejected === 'function' ? onRejected : (reason) => { throw reason; };

    const promise2 = new CustomPromise((resolve, reject) => {
      if (this.status === 'fulfilled') {
        setTimeout(() => {
          try {
            const result = onFulfilled(this.value);
            this.resolvePromise(promise2, result, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }

      if (this.status === 'rejected') {
        setTimeout(() => {
          try {
            const result = onRejected(this.reason);
            this.resolvePromise(promise2, result, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }

      if (this.status === 'pending') {
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              const result = onFulfilled(this.value);
              this.resolvePromise(promise2, result, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });

        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              const result = onRejected(this.reason);
              this.resolvePromise(promise2, result, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
      }
    });

    return promise2;
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  finally(onFinally) {
    return this.then(
      (value) => CustomPromise.resolve(onFinally()).then(() => value),
      (reason) =>
        CustomPromise.resolve(onFinally()).then(() => {
          throw reason;
        })
    );
  }

  resolvePromise(promise, x, resolve, reject) {
    if (promise === x) {
      reject(new TypeError('Chaining cycle detected'));
      return;
    }

    if (x instanceof CustomPromise) {
      x.then(
        (value) => {
          this.resolvePromise(promise, value, resolve, reject);
        },
        (reason) => {
          reject(reason);
        }
      );
    } else if (typeof x === 'object' || typeof x === 'function') {
      if (x === null) {
        resolve(x);
      }

      let then;
      try {
        then = x.then;
      } catch (error) {
        reject(error);
        return;
      }

      if (typeof then === 'function') {
        let called = false;
        try {
          then.call(
            x,
            (y) => {
              if (called) return;
              called = true;
              this.resolvePromise(promise, y, resolve, reject);
            },
            (r) => {
              if (called) return;
              called = true;
              reject(r);
            }
          );
        } catch (error) {
          if (!called) {
            reject(error);
          }
        }
      } else {
        resolve(x);
      }
    } else {
      resolve(x);
    }
  }

  static resolve(value) {
    return new CustomPromise((resolve) => {
      resolve(value);
    });
  }

  static reject(reason) {
    return new CustomPromise((_, reject) => {
      reject(reason);
    });
  }

  static all(promises) {
    return new CustomPromise((resolve, reject) => {
      const results = [];
      let count = 0;

      const processResult = (index, value) => {
        results[index] = value;
        count++;

        if (count === promises.length) {
          resolve(results);
        }
      };

      promises.forEach((promise, index) => {
        CustomPromise.resolve(promise).then(
          (value) => {
            processResult(index, value);
          },
          (reason) => {
            reject(reason);
          }
        );
      });
    });
  }

  static race(promises) {
    return new CustomPromise((resolve, reject) => {
      promises.forEach((promise) => {
        CustomPromise.resolve(promise).then(
          (value) => {
            resolve(value);
          },
          (reason) => {
            reject(reason);
          }
        );
      });
    });
  }
}
