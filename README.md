# Promiseland

In the futuristic city of Promiseland, a group of software engineers are working on a `terminal-based project` that involves a series of `asynchronous tasks`. These tasks are critical for maintaining the city's infrastructure and ensuring the smooth operation of various essential services. To effectively handle these tasks, the engineers need a `custom Promise implementation` with methods for `resolving`, `rejecting`, and `chaining` promises (i.e., then, catch, and finally).
As an engineer in Promiseland, you are assigned the task of implementing this custom Promise solution for the terminal-based program.

## Instructions

1. Create a custom Promise class called `CustomPromise` with the following methods:

- `resolve(value)`: Resolve the promise with the specified value.
- `reject(reason)`: Reject the promise with the specified reason.
- `then(onFulfilled, onRejected)`: Add a fulfillment and rejection handler to the promise. The fulfillment handler should be called when the promise is resolved, and the rejection handler should be called when the promise is rejected.
- `catch(onRejected)`: Add a rejection handler to the promise. This is a shorthand for calling then(null, onRejected).
- `finally(onFinally)`: Add a handler that is called when the promise is settled, whether it's resolved or rejected.
