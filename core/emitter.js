import EventEmitter from 'eventemitter3';
import logger from './logger';

let debug = logger('quill:events');

const EVENTS = ['selectionchange', 'mousedown', 'mouseup', 'click'];
const EMITTERS = new Set();

EVENTS.forEach(function(eventName) {
  document.addEventListener(eventName, (...args) => {
    for (let em of EMITTERS) {
      em.handleDOM(...args);
    }
  });
});


class Emitter extends EventEmitter {
  constructor() {
    super();
    this.listeners = {};
    EMITTERS.add(this);
    this.on('error', debug.error);
  }

  emit() {
    debug.log.apply(debug, arguments);
    super.emit.apply(this, arguments);
  }

  handleDOM(event, ...args) {
    const target = (event.composedPath ? event.composedPath()[0] : event.target);

    (this.listeners[event.type] || []).forEach(function({ node, handler }) {
      if (target === node || node.contains(target)) {
        handler(event, ...args);
      }
    });
  }

  listenDOM(eventName, node, handler) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push({ node, handler })
  }
}

Emitter.events = {
  EDITOR_CHANGE        : 'editor-change',
  SCROLL_BEFORE_UPDATE : 'scroll-before-update',
  SCROLL_OPTIMIZE      : 'scroll-optimize',
  SCROLL_UPDATE        : 'scroll-update',
  SELECTION_CHANGE     : 'selection-change',
  TEXT_CHANGE          : 'text-change'
};
Emitter.sources = {
  API    : 'api',
  SILENT : 'silent',
  USER   : 'user'
};


export default Emitter;
