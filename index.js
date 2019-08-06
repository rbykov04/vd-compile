
const fs = require('fs')
const { parse } = require('js-html-parser');
var through = require('through')

var compiler = require('./compiler.js')

module.exports = function vdify (file, options) {
  if (!/.vd$/.test(file)) {
    return through()
  }

  // compiler.loadConfig()
  // compiler.applyConfig(options)
  // compiler.applyConfig({
  //   sourceMap: options._flags.debug
  // })

  // var data = ''
  // var stream = through(write, end)
  // stream.vueify = true

  // function dependency (file) {
  //   stream.emit('file', file)
  // }

  // function emitStyle (e) {
  //   stream.emit('vueify-style', e)
  // }

  // function write (buf) {
  //   data += buf
  // }

  // function end () {
  //   stream.emit('file', file)
  //   compiler.on('dependency', dependency)
  //   compiler.on('style', emitStyle)

  //   compiler.compile(data, file, function (error, result) {
  //     compiler.removeListener('dependency', dependency)
  //     compiler.removeListener('style', emitStyle)
  //     if (error) {
  //       stream.emit('error', error)
  //       // browserify doesn't log the stack by default...
  //       console.error(error.stack.replace(/^.*?\n/, ''))
  //     }
  //     stream.queue(result)
  //     stream.queue(null)
  //   })
  // }

  // return stream;
}

// expose compiler
module.exports.compiler = compiler