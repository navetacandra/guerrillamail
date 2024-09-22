class EventEmitter {
  #events = {};
  constructor() {}

  on(eventName = "", listener = (data) => {}) {
    if (!this.#events[eventName]) {
      this.#events[eventName] = [];
    }
    this.#events[eventName].push(listener);
  }

  off(eventName = "", listener = (data) => {}) {
    if (!!this.#events[eventName]) {
      this.#events[eventName].splice(
        this.#events[eventName].indexOf(listener),
        1,
      );
    }
  }

  emit(eventName = "", data = undefined) {
    if (!!this.#events[eventName]) {
      this.#events[eventName].forEach((listener) => {
        listener(data);
      });
    }
  }
}

exports.EventEmitter = EventEmitter;
