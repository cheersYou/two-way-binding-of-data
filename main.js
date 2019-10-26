const compile = function (node, vm) {
  let reg = /\{\{(.*)\}\}/;

  if (node.nodeType === 1) {
    let attr = node.attributes;

    for (let i = 0; i < attr.length; i++) {
      if (attr[i].nodeName === "v-model") {
        let name = attr[i].nodeValue;
        node.addEventListener("input", function (e) {
          vm[name] = e.target.value
        });
        node.value = vm[name];
        node.removeAttribute("v-model")
      }
    }
  }

  if (node.nodeType === 3) {
    if (reg.test(node.nodeValue)) {
      let name = RegExp.$1;
      name = name.trim();
      // node.nodeValue = vm[name];
      new Watcher(vm, name, node)
    }
  }
}

const node2DocumentFragment = function (node, vm) {
  let documentFragment = document.createDocumentFragment(),
    child;

  while (child = node.firstChild) {
    compile(child, vm);
    documentFragment.appendChild(child);
  }
  return documentFragment;
}

const observe = function (data, vm) {
  Object.keys(data).forEach(key => {
    defineReactive(vm, key, data[key])
  })
}

const defineReactive = function (vm, key, value) {
  let dep = new Dep();
  Object.defineProperty(vm, key, {
    get: function () {
      if (Dep.target) {
        dep.addSub(Dep.target)
      }
      return value;
    },
    set: function (val) {
      if (val === value) {
        return;
      }
      value = val;
      dep.notify();
    }
  })
}

function Watcher(vm, name, node) {
  Dep.target = this;
  this.vm = vm;
  this.name = name; // msg {{msg}}
  this.node = node;
  this.update();
  Dep.target = null;
}

Watcher.prototype = {
  update: function () {
    this.get();
    this.node.nodeValue = this.value;
  },
  get: function () {
    this.value = this.vm[this.name];
  }
}

function Dep() {
  this.subs = [];
}

Dep.prototype = {
  addSub: function (sub) {
    this.subs.push(sub)
  },
  notify() {
    this.subs.forEach(sub => {
      sub.update();
    })
  }
}

function Vue(options) {
  this.data = options.data;
  let el = options.el;

  observe(this.data, this);
  let dom = node2DocumentFragment(document.getElementById(el), this);

  document.getElementById(el).appendChild(dom);
}

new Vue({
  el: "app",
  data: {
    msg: "msg content"
  }
})