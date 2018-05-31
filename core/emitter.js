import EventEmitter from 'eventemitter3';
import logger from './logger';

let debug = logger('quill:events');

const EVENTS = ['selectionchange', 'mousedown', 'mouseup', 'click'];

function registerDOMListeners (dom) {
  EVENTS.forEach(function(eventName) {
    dom.addEventListener(eventName, (...args) => {
      if (dom.__quill && dom.__quill.emitter) {
        dom.__quill.emitter.handleDOM(...args);
      }
    });
  });
}


class Emitter extends EventEmitter {
  constructor(dom = null) {
    super();
    this.listeners = {};
    this.on('error', debug.error);
    this.dom = dom

    if (this.dom) {
      registerDOMListeners(this.dom)
    }
  }

  emit() {
    debug.log.apply(debug, arguments);
    super.emit.apply(this, arguments);
  }

  handleDOM(event, ...args) {
    (this.listeners[event.type] || []).forEach(function({ node, handler }) {
      if (event.target === node || node.contains(event.target)) {
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
