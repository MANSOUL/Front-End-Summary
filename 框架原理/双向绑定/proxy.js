const $input = document.querySelector('input')
const $displaer = document.querySelector('.displayer')
const obj = {}

const newObj = new Proxy(obj,  {
  set: function (target, key, value, receiver) {
    console.log(target, key, value, receiver, receiver === newObj)
    if (key === 'text') {
      $input.value = value
      $displaer.textContent = value
    }
    return Reflect.set(target, key, value, receiver)
  },
  get: function (target, key, receiver) {
    return Reflect.get(target, key, receiver)
  },
  has: function (target, key) {
    console.log(target, key)
  }
})

$input.addEventListener('input', function (e) {
  newObj.text = e.target.value
  console.log(newObj.hasOwnProperty('text'))
})

// constructor -> getDerivedStateFromProps -> render -> componentDidMount
// getDerivedStateFromProps -> shouldComponentUpdate -> render -> getSnapshoteforeUpdate -> componentDidUpdate
// componentWillUnmount