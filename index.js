class Vue {
  constructor(options){
    this.$options = options
    // 数据劫持
    observer(this, this.$options.data)
    // nodeToFragment
    const app = document.getElementById('app')
    const fragment = nodeToFragment(app)
    compile(fragment, this)

    app.appendChild(fragment)
  }
}
// 数据劫持
function observer(vm, data) {
  for (const key in data) {
    defineReactive(vm, key, data)
  }
}

// 定义属性
function defineReactive(obj, key , target) {
  const dep = new Dep()
  Object.defineProperty(obj, key, {
    get() {
      Dep.target && dep.addSub(Dep.target)
      return target[key]
    },
    set(newVal) {
      if (newVal === target[key]) return
      target[key] = newVal
      dep.notify()
    }
  })
}

// 消息订阅器，用来收集订阅者
class Dep{
  constructor() {
    this.subs = []
  }
  addSub(sub) {
    this.subs.push(sub) // 添加订阅者
  }
  notify() { // 广播通知，触发订阅者更新
    this.subs.forEach(sub => sub.update())
  }
}

class Watcher {
  constructor(node, key, vm) {
    Dep.target = this
    this.node = node
    this.vm = vm
    this.key = key
    this.get()
    Dep.target = null
  }
  get() {
    this.value = this.vm[this.key]
    this.update()
  }
  update() {
    this.node.nodeValue = this.vm[this.key]
  }
}

function nodeToFragment(node) {
  const fragment = document.createDocumentFragment()
  let child
  while (child = node.firstChild) {
    fragment.appendChild(child)
  }
  return fragment
}

function compile(node, vm) {
  const childNodes = node.childNodes
  const reg = /\{\{(.+)\}\}/
  childNodes.forEach(node => {
    switch (node.nodeType) {
      case 1:
        if (node.tagName.toLowerCase() === 'input') {
          if (node.hasAttribute('v-model')) {
            node.addEventListener('input', function(e) {
              vm[node.getAttribute('v-model')] = e.target.value
            })
          }
        }
        compile(node, vm)
        break
      case 2:
        break
      case 3:
        if (reg.test(node.nodeValue)) {
          // node.nodeValue = vm[RegExp.$1]
          new Watcher(node, RegExp.$1, vm)
        }
        break
      default:
        console.log('未定义指令')
    }
  })
}
