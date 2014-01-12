// Note: Some Emscripten settings will significantly limit the speed of the generated code.
// Note: Some Emscripten settings may limit the speed of the generated code.
// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');
// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}
// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };
  var nodeFS = require('fs');
  var nodePath = require('path');
  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };
  Module['readBinary'] = function readBinary(filename) { return Module['read'](filename, true) };
  Module['load'] = function load(f) {
    globalEval(read(f));
  };
  Module['arguments'] = process['argv'].slice(2);
  module['exports'] = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm
  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }
  Module['readBinary'] = function readBinary(f) {
    return read(f, 'binary');
  };
  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }
  this['Module'] = Module;
  eval("if (typeof gc === 'function' && gc.toString().indexOf('[native code]') > 0) var gc = undefined"); // wipe out the SpiderMonkey shell 'gc' function, which can confuse closure (uses it as a minified name, and it is then initted to a non-falsey value unexpectedly)
}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };
  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }
  if (typeof console !== 'undefined') {
    Module['print'] = function print(x) {
      console.log(x);
    };
    Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }
  if (ENVIRONMENT_IS_WEB) {
    this['Module'] = Module;
  } else {
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}
function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***
// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];
// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];
// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}
// === Auto-generated preamble library stuff ===
//========================================
// Runtime code shared with compiler
//========================================
var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      return '(((' +target + ')+' + (quantum-1) + ')&' + -quantum + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (vararg) return 8;
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else if (field[0] === '<') {
        // vector type
        size = alignSize = Types.types[field].flatSize; // fully aligned
      } else if (field[0] === 'i') {
        // illegal integer field, that could not be legalized because it is an internal structure field
        // it is ok to have such fields, if we just use them as markers of field size and nothing more complex
        size = alignSize = parseInt(field.substr(1))/8;
        assert(size % 1 === 0, 'cannot handle non-byte-size field ' + field);
      } else {
        assert(false, 'invalid type for calculateStructAlignment');
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    if (type.name_ && type.name_[0] === '[') {
      // arrays have 2 elements, so we get the proper difference. then we scale here. that way we avoid
      // allocating a potentially huge array for [999999 x i8] etc.
      type.flatSize = parseInt(type.name_.substr(1))*type.flatSize/2;
    }
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2*(1 + i);
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  getAsmConst: function (code, numArgs) {
    // code is a constant string on the heap, so we can cache these
    if (!Runtime.asmConstCache) Runtime.asmConstCache = {};
    var func = Runtime.asmConstCache[code];
    if (func) return func;
    var args = [];
    for (var i = 0; i < numArgs; i++) {
      args.push(String.fromCharCode(36) + i); // $0, $1 etc
    }
    return Runtime.asmConstCache[code] = eval('(function(' + args.join(',') + '){ ' + Pointer_stringify(code) + ' })'); // new Function does not allow upvars in node
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;
      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }
      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }
      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function processJSString(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+((low>>>0)))+((+((high>>>0)))*(+4294967296))) : ((+((low>>>0)))+((+((high|0)))*(+4294967296)))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}
//========================================
// Runtime essentials
//========================================
var __THREW__ = 0; // Used in checking for thrown exceptions.
var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;
var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}
var globalScope = this;
// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;
// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}
// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      value = intArrayFromString(value);
      type = 'array';
    }
    if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}
// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;
// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;
// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;
var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;
// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }
  var singleType = typeof types === 'string' ? types : null;
  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }
  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }
  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }
  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];
    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }
    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later
    setValue(ret+i, curr, type);
    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }
  return ret;
}
Module['allocate'] = allocate;
function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;
  var ret = '';
  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;
// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF16ToString(ptr) {
  var i = 0;
  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;
// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0;
}
Module['stringToUTF16'] = stringToUTF16;
// Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF32ToString(ptr) {
  var i = 0;
  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;
// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
// but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit;
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0;
}
Module['stringToUTF32'] = stringToUTF32;
function demangle(func) {
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    var i = 3;
    // params, etc.
    var basicTypes = {
      'v': 'void',
      'b': 'bool',
      'c': 'char',
      's': 'short',
      'i': 'int',
      'l': 'long',
      'f': 'float',
      'd': 'double',
      'w': 'wchar_t',
      'a': 'signed char',
      'h': 'unsigned char',
      't': 'unsigned short',
      'j': 'unsigned int',
      'm': 'unsigned long',
      'x': 'long long',
      'y': 'unsigned long long',
      'z': '...'
    };
    function dump(x) {
      //return;
      if (x) Module.print(x);
      Module.print(func);
      var pre = '';
      for (var a = 0; a < i; a++) pre += ' ';
      Module.print (pre + '^');
    }
    var subs = [];
    function parseNested() {
      i++;
      if (func[i] === 'K') i++; // ignore const
      var parts = [];
      while (func[i] !== 'E') {
        if (func[i] === 'S') { // substitution
          i++;
          var next = func.indexOf('_', i);
          var num = func.substring(i, next) || 0;
          parts.push(subs[num] || '?');
          i = next+1;
          continue;
        }
        if (func[i] === 'C') { // constructor
          parts.push(parts[parts.length-1]);
          i += 2;
          continue;
        }
        var size = parseInt(func.substr(i));
        var pre = size.toString().length;
        if (!size || !pre) { i--; break; } // counter i++ below us
        var curr = func.substr(i + pre, size);
        parts.push(curr);
        subs.push(curr);
        i += pre + size;
      }
      i++; // skip E
      return parts;
    }
    var first = true;
    function parse(rawList, limit, allowVoid) { // main parser
      limit = limit || Infinity;
      var ret = '', list = [];
      function flushList() {
        return '(' + list.join(', ') + ')';
      }
      var name;
      if (func[i] === 'N') {
        // namespaced N-E
        name = parseNested().join('::');
        limit--;
        if (limit === 0) return rawList ? [name] : name;
      } else {
        // not namespaced
        if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
        var size = parseInt(func.substr(i));
        if (size) {
          var pre = size.toString().length;
          name = func.substr(i + pre, size);
          i += pre + size;
        }
      }
      first = false;
      if (func[i] === 'I') {
        i++;
        var iList = parse(true);
        var iRet = parse(true, 1, true);
        ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
      } else {
        ret = name;
      }
      paramLoop: while (i < func.length && limit-- > 0) {
        //dump('paramLoop');
        var c = func[i++];
        if (c in basicTypes) {
          list.push(basicTypes[c]);
        } else {
          switch (c) {
            case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
            case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
            case 'L': { // literal
              i++; // skip basic type
              var end = func.indexOf('E', i);
              var size = end - i;
              list.push(func.substr(i, size));
              i += size + 2; // size + 'EE'
              break;
            }
            case 'A': { // array
              var size = parseInt(func.substr(i));
              i += size.toString().length;
              if (func[i] !== '_') throw '?';
              i++; // skip _
              list.push(parse(true, 1, true)[0] + ' [' + size + ']');
              break;
            }
            case 'E': break paramLoop;
            default: ret += '?' + c; break paramLoop;
          }
        }
      }
      if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
      return rawList ? list : ret + flushList();
    }
    return parse();
  } catch(e) {
    return func;
  }
}
function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}
function stackTrace() {
  var stack = new Error().stack;
  return stack ? demangleAll(stack) : '(no stack trace available)'; // Stack trace is not available at least on IE10 and Safari 6.
}
// Memory management
var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return (x+4095)&-4096;
}
var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk
function enlargeMemory() {
  abort('Cannot enlarge memory arrays in asm.js. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', or (2) set Module.TOTAL_MEMORY before the program runs.');
}
var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;
var totalMemory = 4096;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2*TOTAL_STACK) {
  if (totalMemory < 16*1024*1024) {
    totalMemory *= 2;
  } else {
    totalMemory += 16*1024*1024
  }
}
if (totalMemory !== TOTAL_MEMORY) {
  Module.printErr('increasing TOTAL_MEMORY to ' + totalMemory + ' to be more reasonable');
  TOTAL_MEMORY = totalMemory;
}
// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'Cannot fallback to non-typed array case: Code is too specialized');
var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);
// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');
Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;
function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}
var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited
var runtimeInitialized = false;
function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}
function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}
function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}
function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;
function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;
function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;
function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;
function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;
// Tools
// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;
function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;
// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr;
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;
function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))|0)]=0;
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;
function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}
if (!Math['imul']) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];
var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;
Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data
var memoryInitializer = null;
// === Body ===
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 41560;
var _stdout;
var _stdout=_stdout=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var _stdin;
var _stdin=_stdin=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var _stderr;
var _stderr=_stderr=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } },{ func: function() { __GLOBAL__I_a() } });
var ___fsmu8;
var ___dso_handle;
var ___dso_handle=___dso_handle=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var __ZTVN10__cxxabiv120__si_class_type_infoE;
__ZTVN10__cxxabiv120__si_class_type_infoE=allocate([0,0,0,0,104,123,0,0,40,1,0,0,216,0,0,0,48,0,0,0,128,1,0,0,6,0,0,0,4,0,0,0,22,0,0,0,22,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var __ZTVN10__cxxabiv119__pointer_type_infoE;
__ZTVN10__cxxabiv119__pointer_type_infoE=allocate([0,0,0,0,120,123,0,0,40,1,0,0,180,0,0,0,48,0,0,0,128,1,0,0,62,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var __ZTVN10__cxxabiv117__class_type_infoE;
__ZTVN10__cxxabiv117__class_type_infoE=allocate([0,0,0,0,152,123,0,0,40,1,0,0,146,0,0,0,48,0,0,0,128,1,0,0,6,0,0,0,14,0,0,0,6,0,0,0,48,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var __ZTIc;
__ZTIc=allocate([184,86,0,0,16,87,0,0], "i8", ALLOC_STATIC);
var __ZN4Sass7ContextC1ENS0_4DataE;
var __ZN4Sass7ContextD1Ev;
var __ZN4Sass13ContextualizeC1ERNS_7ContextEPNS_4EvalEPNS_11EnvironmentIPNS_8AST_NodeEEEPNS_9BacktraceEPNS_8SelectorESD_;
var __ZN4Sass13ContextualizeD1Ev;
var __ZN4Sass5ErrorC1ENS0_4TypeENSt3__112basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEENS_8PositionES8_;
var __ZN4Sass4EvalC1ERNS_7ContextEPNS_11EnvironmentIPNS_8AST_NodeEEEPNS_9BacktraceE;
var __ZN4Sass4EvalD1Ev;
var __ZN4Sass6ExpandC1ERNS_7ContextEPNS_4EvalEPNS_13ContextualizeEPNS_11EnvironmentIPNS_8AST_NodeEEEPNS_9BacktraceE;
var __ZN4Sass6ExtendC1ERNS_7ContextERNSt3__18multimapINS_17Compound_SelectorEPNS_16Complex_SelectorENS3_4lessIS5_EENS3_9allocatorINS3_4pairIKS5_S7_EEEEEERNS_10Subset_MapINS3_12basic_stringIcNS3_11char_traitsIcEENSA_IcEEEENSB_IS7_PS5_EEEEPNS_9BacktraceE;
var __ZN4Sass7InspectC1EPNS_7ContextE;
var __ZN4Sass7InspectD1Ev;
var __ZN4Sass17Output_CompressedC1EPNS_7ContextE;
var __ZN4Sass17Output_CompressedD1Ev;
var __ZN4Sass13Output_NestedC1EbPNS_7ContextE;
var __ZN4Sass13Output_NestedD1Ev;
var __ZN4Sass9SourceMapC1ERKNSt3__112basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE;
var __ZN4Sass9To_StringC1EPNS_7ContextE;
var __ZN4Sass9To_StringD1Ev;
var __ZNSt13runtime_errorC1EPKc;
var __ZNSt13runtime_errorD1Ev;
var __ZNSt12length_errorD1Ev;
var __ZNSt12out_of_rangeD1Ev;
var __ZNSt3__16localeC1Ev;
var __ZNSt3__16localeC1ERKS0_;
var __ZNSt3__16localeD1Ev;
var __ZNSt8bad_castC1Ev;
var __ZNSt8bad_castD1Ev;
/* memory initializer */ allocate([0,0,0,0,0,0,36,64,0,0,0,0,0,0,89,64,0,0,0,0,0,136,195,64,0,0,0,0,132,215,151,65,0,128,224,55,121,195,65,67,23,110,5,181,181,184,147,70,245,249,63,233,3,79,56,77,50,29,48,249,72,119,130,90,60,191,115,127,221,79,21,117,117,110,115,117,112,112,111,114,116,101,100,32,108,111,99,97,108,101,32,102,111,114,32,115,116,97,110,100,97,114,100,32,105,110,112,117,116,0,0,0,36,118,97,108,117,101,115,0,74,117,108,0,0,0,0,0,109,111,99,99,97,115,105,110,0,0,0,0,0,0,0,0,99,111,109,112,97,99,116,40,36,118,97,108,117,101,115,46,46,46,41,0,0,0,0,0,74,117,110,0,0,0,0,0,109,105,115,116,121,114,111,115,101,0,0,0,0,0,0,0,36,108,105,115,116,115,0,0,65,112,114,0,0,0,0,0,109,105,110,116,99,114,101,97,109,0,0,0,0,0,0,0,102,105,108,101,32,116,111,32,105,109,112,111,114,116,32,110,111,116,32,102,111,117,110,100,32,111,114,32,117,110,114,101,97,100,97,98,108,101,58,32,0,0,0,0,0,0,0,0,122,105,112,40,36,108,105,115,116,115,46,46,46,41,0,0,77,97,114,0,0,0,0,0,109,105,100,110,105,103,104,116,98,108,117,101,0,0,0,0,32,33,100,101,102,97,117,108,116,0,0,0,0,0,0,0,70,101,98,0,0,0,0,0,105,110,0,0,0,0,0,0,109,101,100,105,117,109,118,105,111,108,101,116,114,101,100,0,97,112,112,101,110,100,40,36,108,105,115,116,44,32,36,118,97,108,44,32,36,115,101,112,97,114,97,116,111,114,58,32,97,117,116,111,41,0,0,0,74,97,110,0,0,0,0,0,109,101,100,105,117,109,116,117,114,113,117,111,105,115,101,0,98,108,117,101,0,0,0,0,96,32,109,117,115,116,32,98,101,32,96,115,112,97,99,101,96,44,32,96,99,111,109,109,97,96,44,32,111,114,32,96,97,117,116,111,96,0,0,0,68,101,99,101,109,98,101,114,0,0,0,0,0,0,0,0,109,101,100,105,117,109,115,112,114,105,110,103,103,114,101,101,110,0,0,0,0,0,0,0,36,98,108,117,101,0,0,0,97,114,103,117,109,101,110,116,32,96,36,115,101,112,97,114,97,116,111,114,96,32,111,102,32,96,0,0,0,0,0,0,91,109,93,0,0,0,0,0,78,111,118,101,109,98,101,114,0,0,0,0,0,0,0,0,99,97,110,110,111,116,32,98,101,32,117,115,101,100,32,97,115,32,110,97,109,101,100,32,97,114,103,117,109,101,110,116,0,0,0,0,0,0,0,0,109,101,100,105,117,109,115,108,97,116,101,98,108,117,101,0,32,100,105,100,32,110,111,116,32,114,101,116,117,114,110,32,97,32,118,97,108,117,101,0,97,117,116,111,0,0,0,0,79,99,116,111,98,101,114,0,109,101,100,105,117,109,115,101,97,103,114,101,101,110,0,0,99,111,109,109,97,0,0,0,83,101,112,116,101,109,98,101,114,0,0,0,0,0,0,0,109,101,100,105,117,109,112,117,114,112,108,101,0,0,0,0,58,102,105,114,115,116,45,108,101,116,116,101,114,0,0,0,115,112,97,99,101,0,0,0,65,117,103,117,115,116,0,0,109,101,100,105,117,109,111,114,99,104,105,100,0,0,0,0,36,115,101,112,97,114,97,116,111,114,0,0,0,0,0,0,74,117,108,121,0,0,0,0,109,101,100,105,117,109,98,108,117,101,0,0,0,0,0,0,118,97,114,105,97,98,108,101,45,108,101,110,103,116,104,32,112,97,114,97,109,101,116,101,114,32,109,97,121,32,110,111,116,32,104,97,118,101,32,97,32,100,101,102,97,117,108,116,32,118,97,108,117,101,0,0,36,108,105,115,116,50,0,0,74,117,110,101,0,0,0,0,109,101,100,105,117,109,97,113,117,97,109,97,114,105,110,101,0,0,0,0,0,0,0,0,117,114,108,0,0,0,0,0,36,108,105,115,116,49,0,0,44,0,0,0,0,0,0,0,77,97,121,0,0,0,0,0,109,97,114,111,111,110,0,0,32,33,105,109,112,111,114,116,97,110,116,0,0,0,0,0,106,111,105,110,40,36,108,105,115,116,49,44,32,36,108,105,115,116,50,44,32,36,115,101,112,97,114,97,116,111,114,58,32,97,117,116,111,41,0,0,65,112,114,105,108,0,0,0,109,97,103,101,110,116,97,0,105,110,100,101,120,40,36,108,105,115,116,44,32,36,118,97,108,117,101,41,0,0,0,0,77,97,114,99,104,0,0,0,108,105,110,101,110,0,0,0,105,110,100,101,120,32,111,117,116,32,111,102,32,98,111,117,110,100,115,32,102,111,114,32,96,0,0,0,0,0,0,0,98,108,97,110,99,104,101,100,97,108,109,111,110,100,0,0,70,101,98,114,117,97,114,121,0,0,0,0,0,0,0,0,108,105,109,101,103,114,101,101,110,0,0,0,0,0,0,0,36,103,114,101,101,110,0,0,96,32,109,117,115,116,32,110,111,116,32,98,101,32,101,109,112,116,121,0,0,0,0,0,110,101,115,116,101,100,32,115,101,108,101,99,116,111,114,115,32,109,97,121,32,110,111,116,32,98,101,32,101,120,116,101,110,100,101,100,0,0,0,0,74,97,110,117,97,114,121,0,108,105,109,101,0,0,0,0,98,97,115,105,99,95,115,116,114,105,110,103,0,0,0,0,32,111,102,32,0,0,0,0,96,0,0,0,0,0,0,0,97,114,103,117,109,101,110,116,32,96,36,108,105,115,116,96,32,111,102,32,96,0,0,0,108,105,103,104,116,121,101,108,108,111,119,0,0,0,0,0,68,0,0,0,101,0,0,0,99,0,0,0,0,0,0,0,108,105,103,104,116,115,116,101,101,108,98,108,117,101,0,0,58,58,102,105,114,115,116,45,108,105,110,101,0,0,0,0,111,110,108,121,32,85,84,70,45,56,32,100,111,99,117,109,101,110,116,115,32,97,114,101,32,99,117,114,114,101,110,116,108,121,32,115,117,112,112,111,114,116,101,100,59,32,121,111,117,114,32,100,111,99,117,109,101,110,116,32,97,112,112,101,97,114,115,32,116,111,32,98,101,32,0,0,0,0,0,0,110,116,104,40,36,108,105,115,116,44,32,36,110,41,0,0,78,0,0,0,111,0,0,0,118,0,0,0,0,0,0,0,108,105,103,104,116,115,108,97,116,101,103,114,101,121,0,0,71,66,45,49,56,48,51,48,0,0,0,0,0,0,0,0,36,108,105,115,116,0,0,0,79,0,0,0,99,0,0,0,116,0,0,0,0,0,0,0,108,105,103,104,116,115,108,97,116,101,103,114,97,121,0,0,66,79,67,85,45,49,0,0,108,101,110,103,116,104,40,36,108,105,115,116,41,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,0,0,0,0,108,105,103,104,116,115,107,121,98,108,117,101,0,0,0,0,83,67,83,85,0,0,0,0,64,109,101,100,105,97,32,0,109,97,120,40,36,120,50,44,32,36,120,50,46,46,46,41,0,0,0,0,0,0,0,0,33,105,109,112,111,114,116,97,110,116,0,0,0,0,0,0,65,0,0,0,117,0,0,0,103,0,0,0,0,0,0,0,108,105,103,104,116,115,101,97,103,114,101,101,110,0,0,0,85,84,70,45,69,66,67,68,73,67,0,0,0,0,0,0,96,32,111,110,108,121,32,116,97,107,101,115,32,110,117,109,101,114,105,99,32,97,114,103,117,109,101,110,116,115,0,0,74,0,0,0,117,0,0,0,108,0,0,0,0,0,0,0,108,105,103,104,116,115,97,108,109,111,110,0,0,0,0,0,85,84,70,45,49,0,0,0,96,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,108,105,103,104,116,112,105,110,107,0,0,0,0,0,0,0,85,84,70,45,55,0,0,0,36,120,50,0,0,0,0,0,98,108,97,99,107,0,0,0,77,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,108,105,103,104,116,103,114,101,101,110,0,0,0,0,0,0,85,84,70,45,51,50,32,40,98,105,103,32,101,110,100,105,97,110,41,0,0,0,0,0,36,120,49,0,0,0,0,0,115,101,108,101,99,116,111,114,32,103,114,111,117,112,115,32,109,97,121,32,110,111,116,32,98,101,32,101,120,116,101,110,100,101,100,0,0,0,0,0,65,0,0,0,112,0,0,0,114,0,0,0,0,0,0,0,108,105,103,104,116,103,114,101,121,0,0,0,0,0,0,0,97,114,103,117,109,101,110,116,32,0,0,0,0,0,0,0,44,32,105,110,32,102,117,110,99,116,105,111,110,32,96,0,85,84,70,45,51,50,32,40,108,105,116,116,108,101,32,101,110,100,105,97,110,41,0,0,109,105,110,40,36,120,49,44,32,36,120,50,46,46,46,41,0,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,114,0,0,0,0,0,0,0,108,105,103,104,116,103,114,97,121,0,0,0,0,0,0,0,85,84,70,45,49,54,32,40,108,105,116,116,108,101,32,101,110,100,105,97,110,41,0,0,97,98,115,40,36,118,97,108,117,101,41,0,0,0,0,0,70,0,0,0,101,0,0,0,98,0,0,0,0,0,0,0,108,105,103,104,116,103,111,108,100,101,110,114,111,100,121,101,108,108,111,119,0,0,0,0,58,102,105,114,115,116,45,108,105,110,101,0,0,0,0,0,85,84,70,45,49,54,32,40,98,105,103,32,101,110,100,105,97,110,41,0,0,0,0,0,102,108,111,111,114,40,36,118,97,108,117,101,41,0,0,0,74,0,0,0,97,0,0,0,110,0,0,0,0,0,0,0,108,105,103,104,116,99,121,97,110,0,0,0,0,0,0,0,85,84,70,45,56,0,0,0,99,101,105,108,40,36,118,97,108,117,101,41,0,0,0,0,68,0,0,0,101,0,0,0,99,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,108,105,103,104,116,99,111,114,97,108,0,0,0,0,0,0,117,110,99,108,111,115,101,100,32,112,97,114,101,110,116,104,101,115,105,115,32,105,110,32,109,101,100,105,97,32,113,117,101,114,121,32,101,120,112,114,101,115,115,105,111,110,0,0,114,111,117,110,100,40,36,118,97,108,117,101,41,0,0,0,78,0,0,0,111,0,0,0,118,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,108,105,103,104,116,98,108,117,101,0,0,0,0,0,0,0,109,101,100,105,97,32,102,101,97,116,117,114,101,32,114,101,113,117,105,114,101,100,32,105,110,32,109,101,100,105,97,32,113,117,101,114,121,32,101,120,112,114,101,115,115,105,111,110,0,0,0,0,0,0,0,0,46,99,115,115,0,0,0,0,32,125,10,0,0,0,0,0,96,32,109,117,115,116,32,98,101,32,117,110,105,116,108,101,115,115,0,0,0,0,0,0,79,0,0,0,99,0,0,0,116,0,0,0,111,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,108,101,109,111,110,99,104,105,102,102,111,110,0,0,0,0,32,0,0,0,0,0,0,0,109,101,100,105,97,32,113,117,101,114,121,32,101,120,112,114,101,115,115,105,111,110,32,109,117,115,116,32,98,101,103,105,110,32,119,105,116,104,32,39,40,39,0,0,0,0,0,0,97,114,103,117,109,101,110,116,32,36,118,97,108,117,101,32,111,102,32,96,0,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,116,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,116,111,112,45,108,101,118,101,108,32,64,105,109,112,111,114,116,32,100,105,114,101,99,116,105,118,101,32,109,117,115,116,32,98,101,32,116,101,114,109,105,110,97,116,101,100,32,98,121,32,39,59,39,0,0,0,108,97,119,110,103,114,101,101,110,0,0,0,0,0,0,0,101,120,112,101,99,116,101,100,32,39,123,39,32,105,110,32,109,101,100,105,97,32,113,117,101,114,121,0,0,0,0,0,36,118,97,108,117,101,0,0,65,0,0,0,117,0,0,0,103,0,0,0,117,0,0,0,115,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,108,97,118,101,110,100,101,114,98,108,117,115,104,0,0,0,101,120,112,101,99,116,101,100,32,39,123,39,32,97,102,116,101,114,32,116,104,101,32,117,112,112,101,114,32,98,111,117,110,100,32,105,110,32,64,101,97,99,104,32,100,105,114,101,99,116,105,118,101,0,0,0,112,101,114,99,101,110,116,97,103,101,40,36,118,97,108,117,101,41,0,0,0,0,0,0,74,0,0,0,117,0,0,0,108,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,98,105,115,113,117,101,0,0,108,97,118,101,110,100,101,114,0,0,0,0,0,0,0,0,114,103,98,40,36,114,101,100,44,32,36,103,114,101,101,110,44,32,36,98,108,117,101,41,0,0,0,0,0,0,0,0,101,120,112,101,99,116,101,100,32,39,105,110,39,32,107,101,121,119,111,114,100,32,105,110,32,64,101,97,99,104,32,100,105,114,101,99,116,105,118,101,0,0,0,0,0,0,0,0,113,117,111,116,101,40,36,115,116,114,105,110,103,41,0,0,64,114,101,116,117,114,110,32,109,97,121,32,111,110,108,121,32,98,101,32,117,115,101,100,32,119,105,116,104,105,110,32,97,32,102,117,110,99,116,105,111,110,0,0,0,0,0,0,74,0,0,0,117,0,0,0,110,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,107,104,97,107,105,0,0,0,102,117,110,99,116,105,111,110,32,0,0,0,0,0,0,0,64,101,97,99,104,32,100,105,114,101,99,116,105,118,101,32,114,101,113,117,105,114,101,115,32,97,110,32,105,116,101,114,97,116,105,111,110,32,118,97,114,105,97,98,108,101,0,0,32,104,97,115,32,110,111,32,112,97,114,97,109,101,116,101,114,32,110,97,109,101,100,32,0,0,0,0,0,0,0,0,36,115,116,114,105,110,103,0,105,118,111,114,121,0,0,0,101,120,112,101,99,116,101,100,32,39,123,39,32,97,102,116,101,114,32,116,104,101,32,117,112,112,101,114,32,98,111,117,110,100,32,105,110,32,64,102,111,114,32,100,105,114,101,99,116,105,118,101,0,0,0,0,117,110,113,117,111,116,101,40,36,115,116,114,105,110,103,41,0,0,0,0,0,0,0,0,65,0,0,0,112,0,0,0,114,0,0,0,105,0,0,0,108,0,0,0,0,0,0,0,105,110,100,105,103,111,0,0,58,58,97,102,116,101,114,0,101,120,112,101,99,116,101,100,32,39,116,104,114,111,117,103,104,39,32,111,114,32,39,116,111,39,32,107,101,121,119,111,100,32,105,110,32,64,102,111,114,32,100,105,114,101,99,116,105,118,101,0,0,0,0,0,112,120,0,0,0,0,0,0,105,101,45,104,101,120,45,115,116,114,40,36,99,111,108,111,114,41,0,0,0,0,0,0,77,0,0,0,97,0,0,0,114,0,0,0,99,0,0,0,104,0,0,0,0,0,0,0,105,110,100,105,97,110,114,101,100,0,0,0,0,0,0,0,101,120,112,101,99,116,101,100,32,39,102,114,111,109,39,32,107,101,121,119,111,114,100,32,105,110,32,64,102,111,114,32,100,105,114,101,99,116,105,118,101,0,0,0,0,0,0,0,110,111,116,32,101,110,111,117,103,104,32,97,114,103,117,109,101,110,116,115,32,102,111,114,32,96,99,104,97,110,103,101,45,99,111,108,111,114,96,0,70,0,0,0,101,0,0,0,98,0,0,0,114,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,104,111,116,112,105,110,107,0,64,102,111,114,32,100,105,114,101,99,116,105,118,101,32,114,101,113,117,105,114,101,115,32,97,110,32,105,116,101,114,97,116,105,111,110,32,118,97,114,105,97,98,108,101,0,0,0,58,110,111,116,40,0,0,0,99,97,110,110,111,116,32,115,112,101,99,105,102,121,32,98,111,116,104,32,82,71,66,32,97,110,100,32,72,83,76,32,118,97,108,117,101,115,32,102,111,114,32,96,99,104,97,110,103,101,45,99,111,108,111,114,96,0,0,0,0,0,0,0,74,0,0,0,97,0,0,0,110,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,104,111,110,101,121,100,101,119,0,0,0,0,0,0,0,0,101,120,112,101,99,116,101,100,32,39,123,39,32,97,102,116,101,114,32,64,101,108,115,101,0,0,0,0,0,0,0,0,105,110,118,97,108,105,100,32,116,111,112,45,108,101,118,101,108,32,101,120,112,114,101,115,115,105,111,110,0,0,0,0,32,123,10,0,0,0,0,0,99,104,97,110,103,101,45,99,111,108,111,114,40,36,99,111,108,111,114,44,32,36,114,101,100,58,32,102,97,108,115,101,44,32,36,103,114,101,101,110,58,32,102,97,108,115,101,44,32,36,98,108,117,101,58,32,102,97,108,115,101,44,32,36,104,117,101,58,32,102,97,108,115,101,44,32,36,115,97,116,117,114,97,116,105,111,110,58,32,102,97,108,115,101,44,32,36,108,105,103,104,116,110,101,115,115,58,32,102,97,108,115,101,44,32,36,97,108,112,104,97,58,32,102,97,108,115,101,41,0,0,0,0,0,0,0,103,114,101,101,110,121,101,108,108,111,119,0,0,0,0,0,64,109,101,100,105,97,32,0,101,120,112,101,99,116,101,100,32,39,123,39,32,97,102,116,101,114,32,116,104,101,32,112,114,101,100,105,99,97,116,101,32,102,111,114,32,64,105,102,0,0,0,0,0,0,0,0,110,111,116,32,101,110,111,117,103,104,32,97,114,103,117,109,101,110,116,115,32,102,111,114,32,96,115,99,97,108,101,45,99,111,108,111,114,96,0,0,80,77,0,0,0,0,0,0,103,114,101,101,110,0,0,0,117,110,116,101,114,109,105,110,97,116,101,100,32,105,110,116,101,114,112,111,108,97,110,116,32,105,110,115,105,100,101,32,105,110,116,101,114,112,111,108,97,116,101,100,32,105,100,101,110,116,105,102,105,101,114,32,0,0,0,0,0,0,0,0,99,97,110,110,111,116,32,115,112,101,99,105,102,121,32,98,111,116,104,32,82,71,66,32,97,110,100,32,72,83,76,32,118,97,108,117,101,115,32,102,111,114,32,96,115,99,97,108,101,45,99,111,108,111,114,96,0,0,0,0,0,0,0,0,65,77,0,0,0,0,0,0,103,114,101,121,0,0,0,0,101,114,114,111,114,32,112,97,114,115,105,110,103,32,105,110,116,101,114,112,111,108,97,116,101,100,32,117,114,108,0,0,46,46,46,0,0,0,0,0,115,99,97,108,101,45,99,111,108,111,114,40,36,99,111,108,111,114,44,32,36,114,101,100,58,32,102,97,108,115,101,44,32,36,103,114,101,101,110,58,32,102,97,108,115,101,44,32,36,98,108,117,101,58,32,102,97,108,115,101,44,32,36,104,117,101,58,32,102,97,108,115,101,44,32,36,115,97,116,117,114,97,116,105,111,110,58,32,102,97,108,115,101,44,32,36,108,105,103,104,116,110,101,115,115,58,32,102,97,108,115,101,44,32,36,97,108,112,104,97,58,32,102,97,108,115,101,41,0,0,0,0,0,0,0,0,98,101,105,103,101,0,0,0,103,114,97,121,0,0,0,0,32,97,110,100,32,0,0,0,101,114,114,111,114,32,112,97,114,115,105,110,103,32,105,110,116,101,114,112,111,108,97,116,101,100,32,118,97,108,117,101,0,0,0,0,0,0,0,0,110,111,116,32,101,110,111,117,103,104,32,97,114,103,117,109,101,110,116,115,32,102,111,114,32,96,97,100,106,117,115,116,45,99,111,108,111,114,96,0,80,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,103,111,108,100,101,110,114,111,100,0,0,0,0,0,0,0,91,102,93,0,0,0,0,0,117,110,116,101,114,109,105,110,97,116,101,100,32,105,110,116,101,114,112,111,108,97,110,116,32,105,110,115,105,100,101,32,73,69,32,102,117,110,99,116,105,111,110,32,0,0,0,0,58,0,0,0,0,0,0,0,32,112,114,111,118,105,100,101,100,32,109,111,114,101,32,116,104,97,110,32,111,110,99,101,32,105,110,32,99,97,108,108,32,116,111,32,0,0,0,0,99,97,110,110,111,116,32,115,112,101,99,105,102,121,32,98,111,116,104,32,82,71,66,32,97,110,100,32,72,83,76,32,118,97,108,117,101,115,32,102,111,114,32,96,97,100,106,117,115,116,45,99,111,108,111,114,96,0,0,0,0,0,0,0,65,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,103,111,108,100,0,0,0,0,117,110,116,101,114,109,105,110,97,116,101,100,32,105,110,116,101,114,112,111,108,97,110,116,32,105,110,115,105,100,101,32,115,116,114,105,110,103,32,99,111,110,115,116,97,110,116,32,0,0,0,0,0,0,0,0,97,100,106,117,115,116,45,99,111,108,111,114,40,36,99,111,108,111,114,44,32,36,114,101,100,58,32,102,97,108,115,101,44,32,36,103,114,101,101,110,58,32,102,97,108,115,101,44,32,36,98,108,117,101,58,32,102,97,108,115,101,44,32,36,104,117,101,58,32,102,97,108,115,101,44,32,36,115,97,116,117,114,97,116,105,111,110,58,32,102,97,108,115,101,44,32,36,108,105,103,104,116,110,101,115,115,58,32,102,97,108,115,101,44,32,36,97,108,112,104,97,58,32,102,97,108,115,101,41,0,0,0,0,0,0,0,103,104,111,115,116,119,104,105,116,101,0,0,0,0,0,0,58,97,102,116,101,114,0,0,101,114,114,111,114,32,114,101,97,100,105,110,103,32,118,97,108,117,101,115,32,97,102,116,101,114,32,0,0,0,0,0,111,110,108,121,32,0,0,0,112,116,0,0,0,0,0,0,102,97,100,101,45,111,117,116,40,36,99,111,108,111,114,44,32,36,97,109,111,117,110,116,41,0,0,0,0,0,0,0,103,97,105,110,115,98,111,114,111,0,0,0,0,0,0,0,33,105,109,112,111,114,116,97,110,116,0,0,0,0,0,0,116,114,97,110,115,112,97,114,101,110,116,105,122,101,40,36,99,111,108,111,114,44,32,36,97,109,111,117,110,116,41,0,102,117,99,104,115,105,97,0,117,110,97,98,108,101,32,116,111,32,112,97,114,115,101,32,85,82,76,0,0,0,0,0,102,97,100,101,45,105,110,40,36,99,111,108,111,114,44,32,36,97,109,111,117,110,116,41,0,0,0,0,0,0,0,0,102,111,114,101,115,116,103,114,101,101,110,0,0,0,0,0,85,82,73,32,105,115,32,109,105,115,115,105,110,103,32,39,41,39,0,0,0,0,0,0,102,97,108,115,101,0,0,0,116,111,112,45,108,101,118,101,108,32,100,105,114,101,99,116,105,118,101,32,109,117,115,116,32,98,101,32,116,101,114,109,105,110,97,116,101,100,32,98,121,32,39,59,39,0,0,0,32,42,47,0,0,0,0,0,111,112,97,99,105,102,121,40,36,99,111,108,111,114,44,32,36,97,109,111,117,110,116,41,0,0,0,0,0,0,0,0,32,0,0,0,0,0,0,0,102,108,111,114,97,108,119,104,105,116,101,0,0,0,0,0,117,110,99,108,111,115,101,100,32,112,97,114,101,110,116,104,101,115,105,115,0,0,0,0,116,114,117,101,0,0,0,0,41,0,0,0,0,0,0,0,102,105,114,101,98,114,105,99,107,0,0,0,0,0,0,0,47,0,0,0,0,0,0,0,114,103,98,97,40,0,0,0,97,108,112,104,97,40,0,0,100,111,100,103,101,114,98,108,117,101,0,0,0,0,0,0,42,0,0,0,0,0,0,0,32,105,115,32,110,111,116,32,97,32,118,97,108,105,100,32,67,83,83,32,118,97,108,117,101,0,0,0,0,0,0,0,111,112,97,99,105,116,121,40,36,99,111,108,111,114,41,0,97,122,117,114,101,0,0,0,100,105,109,103,114,101,121,0,96,32,109,117,115,116,32,98,101,32,98,101,116,119,101,101,110,32,0,0,0,0,0,0,43,0,0,0,0,0,0,0,97,108,112,104,97,40,36,99,111,108,111,114,41,0,0,0,117,112,112,101,114,32,98,111,117,110,100,32,111,102,32,96,64,102,111,114,96,32,100,105,114,101,99,116,105,118,101,32,109,117,115,116,32,98,101,32,110,117,109,101,114,105,99,0,100,105,109,103,114,97,121,0,99,97,108,99,0,0,0,0,115,116,121,108,101,32,100,101,99,108,97,114,97,116,105,111,110,32,109,117,115,116,32,99,111,110,116,97,105,110,32,97,32,118,97,108,117,101,0,0,32,0,0,0,0,0,0,0,112,97,114,97,109,101,116,101,114,32,0,0,0,0,0,0,105,110,118,101,114,116,40,36,99,111,108,111,114,41,0,0,100,101,101,112,115,107,121,98,108,117,101,0,0,0,0,0,34,32,109,117,115,116,32,98,101,32,102,111,108,108,111,119,101,100,32,98,121,32,97,32,39,58,39,0,0,0,0,0,32,37,32,0,0,0,0,0,99,111,109,112,108,101,109,101,110,116,40,36,99,111,108,111,114,41,0,0,0,0,0,0,100,101,101,112,112,105,110,107,0,0,0,0,0,0,0,0,58,58,98,101,102,111,114,101,0,0,0,0,0,0,0,0,112,114,111,112,101,114,116,121,32,34,0,0,0,0,0,0,109,109,0,0,0,0,0,0,103,114,97,121,115,99,97,108,101,40,36,99,111,108,111,114,41,0,0,0,0,0,0,0,108,111,99,97,108,101,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,0,0,0,115,116,114,105,110,103,0,0,58,32,101,114,114,111,114,58,32,0,0,0,0,0,0,0,100,97,114,107,118,105,111,108,101,116,0,0,0,0,0,0,105,110,118,97,108,105,100,32,112,114,111,112,101,114,116,121,32,110,97,109,101,0,0,0,32,42,32,0,0,0,0,0,100,101,115,97,116,117,114,97,116,101,40,36,99,111,108,111,114,44,32,36,97,109,111,117,110,116,41,0,0,0,0,0,100,97,114,107,116,117,114,113,117,111,105,115,101,0,0,0,105,110,118,97,108,105,100,32,115,101,108,101,99,116,111,114,32,102,111,114,32,64,101,120,116,101,110,100,0,0,0,0,32,45,32,0,0,0,0,0,115,97,116,117,114,97,116,101,40,36,99,111,108,111,114,44,32,36,97,109,111,117,110,116,41,0,0,0,0,0,0,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,0,0,0,0,100,97,114,107,115,108,97,116,101,103,114,101,121,0,0,0,64,99,111,110,116,101,110,116,32,109,97,121,32,111,110,108,121,32,98,101,32,117,115,101,100,32,119,105,116,104,105,110,32,97,32,109,105,120,105,110,0,0,0,0,0,0,0,0,32,43,32,0,0,0,0,0,116,111,112,45,108,101,118,101,108,32,64,119,97,114,110,32,100,105,114,101,99,116,105,118,101,32,109,117,115,116,32,98,101,32,116,101,114,109,105,110,97,116,101,100,32,98,121,32,39,59,39,0,0,0,0,0,44,32,0,0,0,0,0,0,100,97,114,107,101,110,40,36,99,111,108,111,114,44,32,36,97,109,111,117,110,116,41,0,64,109,101,100,105,97,32,0,111,114,100,105,110,97,108,32,97,114,103,117,109,101,110,116,115,32,109,117,115,116,32,112,114,101,99,101,100,101,32,110,97,109,101,100,32,97,114,103,117,109,101,110,116,115,0,0,37,73,58,37,77,58,37,83,32,37,112,0,0,0,0,0,100,97,114,107,115,108,97,116,101,103,114,97,121,0,0,0,111,110,108,121,32,118,97,114,105,97,98,108,101,32,100,101,99,108,97,114,97,116,105,111,110,115,32,97,110,100,32,99,111,110,116,114,111,108,32,100,105,114,101,99,116,105,118,101,115,32,97,114,101,32,97,108,108,111,119,101,100,32,105,110,115,105,100,101,32,102,117,110,99,116,105,111,110,115,0,0,36,97,109,111,117,110,116,0,111,114,100,105,110,97,108,32,97,114,103,117,109,101,110,116,115,32,109,117,115,116,32,112,114,101,99,101,100,101,32,118,97,114,105,97,98,108,101,45,108,101,110,103,116,104,32,97,114,103,117,109,101,110,116,115,0,0,0,0,0,0,0,0,37,0,0,0,97,0,0,0,32,0,0,0,37,0,0,0,98,0,0,0,32,0,0,0,37,0,0,0,100,0,0,0,32,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,89,0,0,0,0,0,0,0,0,0,0,0,100,97,114,107,115,108,97,116,101,98,108,117,101,0,0,0,64,105,109,112,111,114,116,32,100,105,114,101,99,116,105,118,101,115,32,97,114,101,32,110,111,116,32,97,108,108,111,119,101,100,32,105,110,115,105,100,101,32,109,105,120,105,110,115,32,97,110,100,32,102,117,110,99,116,105,111,110,115,0,0,32,60,32,0,0,0,0,0,108,105,103,104,116,101,110,40,36,99,111,108,111,114,44,32,36,97,109,111,117,110,116,41,0,0,0,0,0,0,0,0,102,117,110,99,116,105,111,110,115,32,97,110,100,32,109,105,120,105,110,115,32,109,97,121,32,110,111,116,32,98,101,32,99,97,108,108,101,100,32,119,105,116,104,32,98,111,116,104,32,110,97,109,101,100,32,97,114,103,117,109,101,110,116,115,32,97,110,100,32,118,97,114,105,97,98,108,101,45,108,101,110,103,116,104,32,97,114,103,117,109,101,110,116,115,0,0,37,97,32,37,98,32,37,100,32,37,72,58,37,77,58,37,83,32,37,89,0,0,0,0,100,97,114,107,115,101,97,103,114,101,101,110,0,0,0,0,110,111,110,45,116,101,114,109,105,110,97,108,32,115,116,97,116,101,109,101,110,116,32,111,114,32,100,101,99,108,97,114,97,116,105,111,110,32,109,117,115,116,32,101,110,100,32,119,105,116,104,32,39,59,39,0,102,117,110,99,116,105,111,110,115,32,97,110,100,32,109,105,120,105,110,115,32,109,97,121,32,111,110,108,121,32,98,101,32,99,97,108,108,101,100,32,119,105,116,104,32,111,110,101,32,118,97,114,105,97,98,108,101,45,108,101,110,103,116,104,32,97,114,103,117,109,101,110,116,0,0,0,0,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,0,0,0,0,0,0,0,0,100,97,114,107,115,97,108,109,111,110,0,0,0,0,0,0,97,113,117,97,109,97,114,105,110,101,0,0,0,0,0,0,96,32,111,102,32,96,0,0,117,110,116,101,114,109,105,110,97,116,101,100,32,97,116,116,114,105,98,117,116,101,32,115,101,108,101,99,116,111,114,32,102,111,114,32,0,0,0,0,32,62,32,0,0,0,0,0,46,115,99,115,115,0,0,0,97,100,106,117,115,116,45,104,117,101,40,36,99,111,108,111,114,44,32,36,100,101,103,114,101,101,115,41,0,0,0,0,108,111,119,101,114,32,98,111,117,110,100,32,111,102,32,96,64,102,111,114,96,32,100,105,114,101,99,116,105,118,101,32,109,117,115,116,32,98,101,32,110,117,109,101,114,105,99,0,110,97,109,101,100,32,97,114,103,117,109,101,110,116,115,32,109,117,115,116,32,112,114,101,99,101,100,101,32,118,97,114,105,97,98,108,101,45,108,101,110,103,116,104,32,97,114,103,117,109,101,110,116,0,0,0,37,72,58,37,77,58,37,83,0,0,0,0,0,0,0,0,100,97,114,107,114,101,100,0,87,65,82,78,73,78,71,58,32,0,0,0,0,0,0,0,101,120,112,101,99,116,101,100,32,97,32,115,116,114,105,110,103,32,99,111,110,115,116,97,110,116,32,111,114,32,105,100,101,110,116,105,102,105,101,114,32,105,110,32,97,116,116,114,105,98,117,116,101,32,115,101,108,101,99,116,111,114,32,102,111,114,32,0,0,0,0,0,9,0,0,0,0,0,0,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,0,108,105,103,104,116,110,101,115,115,40,36,99,111,108,111,114,41,0,0,0,0,0,0,0,114,101,113,117,105,114,101,100,32,112,97,114,97,109,101,116,101,114,115,32,109,117,115,116,32,112,114,101,99,101,100,101,32,111,112,116,105,111,110,97,108,32,112,97,114,97,109,101,116,101,114,115,0,0,0,0,110,117,109,98,101,114,0,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,100,97,114,107,111,114,99,104,105,100,0,0,0,0,0,0,105,110,118,97,108,105,100,32,111,112,101,114,97,116,111,114,32,105,110,32,97,116,116,114,105,98,117,116,101,32,115,101,108,101,99,116,111,114,32,102,111,114,32,0,0,0,0,0,114,101,113,117,105,114,101,100,32,112,97,114,97,109,101,116,101,114,115,32,109,117,115,116,32,112,114,101,99,101,100,101,32,118,97,114,105,97,98,108,101,45,108,101,110,103,116,104,32,112,97,114,97,109,101,116,101,114,115,0,0,0,0,0,37,109,47,37,100,47,37,121,0,0,0,0,0,0,0,0,100,97,114,107,111,114,97,110,103,101,0,0,0,0,0,0,58,98,101,102,111,114,101,0,105,110,118,97,108,105,100,32,97,116,116,114,105,98,117,116,101,32,110,97,109,101,32,105,110,32,97,116,116,114,105,98,117,116,101,32,115,101,108,101,99,116,111,114,0,0,0,0,112,99,0,0,0,0,0,0,115,97,116,117,114,97,116,105,111,110,40,36,99,111,108,111,114,41,0,0,0,0,0,0,102,117,110,99,116,105,111,110,115,32,97,110,100,32,109,105,120,105,110,115,32,99,97,110,110,111,116,32,104,97,118,101,32,109,111,114,101,32,116,104,97,110,32,111,110,101,32,118,97,114,105,97,98,108,101,45,108,101,110,103,116,104,32,112,97,114,97,109,101,116,101,114,0,0,0,0,0,0,0,0,58,0,0,0,0,0,0,0,100,97,114,107,111,108,105,118,101,103,114,101,101,110,0,0,117,110,114,101,99,111,103,110,105,122,101,100,32,112,115,101,117,100,111,45,99,108,97,115,115,32,111,114,32,112,115,101,117,100,111,45,101,108,101,109,101,110,116,0,0,0,0,0,32,97,110,100,32,0,0,0,100,101,103,0,0,0,0,0,111,112,116,105,111,110,97,108,32,112,97,114,97,109,101,116,101,114,115,32,109,97,121,32,110,111,116,32,98,101,32,99,111,109,98,105,110,101,100,32,119,105,116,104,32,118,97,114,105,97,98,108,101,45,108,101,110,103,116,104,32,112,97,114,97,109,101,116,101,114,115,0,102,0,0,0,97,0,0,0,108,0,0,0,115,0,0,0,101,0,0,0,0,0,0,0,100,97,114,107,109,97,103,101,110,116,97,0,0,0,0,0,117,110,116,101,114,109,105,110,97,116,101,100,32,97,114,103,117,109,101,110,116,32,116,111,32,0,0,0,0,0,0,0,44,32,0,0,0,0,0,0,37,112,0,0,0,0,0,0,104,117,101,40,36,99,111,108,111,114,41,0,0,0,0,0,102,97,108,115,101,0,0,0,101,114,114,111,114,32,105,110,32,67,32,102,117,110,99,116,105,111,110,58,32,0,0,0,91,98,117,105,108,116,45,105,110,32,102,117,110,99,116,105,111,110,93,0,0,0,0,0,100,97,114,107,107,104,97,107,105,0,0,0,0,0,0,0,46,46,46,41,0,0,0,0,64,99,111,110,116,101,110,116,59,0,0,0,0,0,0,0,116,111,112,45,108,101,118,101,108,32,64,105,110,99,108,117,100,101,32,100,105,114,101,99,116,105,118,101,32,109,117,115,116,32,98,101,32,116,101,114,109,105,110,97,116,101,100,32,98,121,32,39,59,39,0,0,100,97,114,107,103,114,101,101,110,0,0,0,0,0,0,0,47,42,32,108,105,110,101,32,0,0,0,0,0,0,0,0,104,115,108,97,40,36,104,117,101,44,32,36,115,97,116,117,114,97,116,105,111,110,44,32,36,108,105,103,104,116,110,101,115,115,44,32,36,97,108,112,104,97,41,0,0,0,0,0,116,0,0,0,114,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,105,110,118,97,108,105,100,32,111,112,101,114,97,110,100,115,32,102,111,114,32,109,111,100,117,108,111,0,0,0,0,0,97,108,105,99,101,98,108,117,101,0,0,0,0,0,0,0,105,110,118,97,108,105,100,32,97,114,103,117,109,101,110,116,32,116,111,32,0,0,0,0,64,105,110,99,108,117,100,101,32,0,0,0,0,0,0,0,36,108,105,103,104,116,110,101,115,115,0,0,0,0,0,0,116,114,117,101,0,0,0,0,105,110,118,97,108,105,100,32,111,112,101,114,97,110,100,115,32,102,111,114,32,109,117,108,116,105,112,108,105,99,97,116,105,111,110,0,0,0,0,0,100,97,114,107,103,114,101,121,0,0,0,0,0,0,0,0,110,101,103,97,116,101,100,32,115,101,108,101,99,116,111,114,32,105,115,32,109,105,115,115,105,110,103,32,39,41,39,0,64,102,117,110,99,116,105,111,110,32,0,0,0,0,0,0,36,115,97,116,117,114,97,116,105,111,110,0,0,0,0,0,97,108,112,104,97,32,99,104,97,110,110,101,108,115,32,109,117,115,116,32,98,101,32,101,113,117,97,108,32,119,104,101,110,32,99,111,109,98,105,110,105,110,103,32,99,111,108,111,114,115,0,0,0,0,0,0,58,32,0,0,0,0,0,0,100,97,114,107,103,114,97,121,0,0,0,0,0,0,0,0,105,110,118,97,108,105,100,32,115,101,108,101,99,116,111,114,32,97,102,116,101,114,32,0,64,109,105,120,105,110,32,0,99,97,110,110,111,116,32,100,105,118,105,100,101,32,97,32,110,117,109,98,101,114,32,98,121,32,97,32,99,111,108,111,114,0,0,0,0,0,0,0,100,97,114,107,103,111,108,100,101,110,114,111,100,0,0,0,97,113,117,97,0,0,0,0,97,114,103,117,109,101,110,116,32,96,0,0,0,0,0,0,101,120,112,101,99,116,101,100,32,97,32,39,123,39,32,97,102,116,101,114,32,116,104,101,32,115,101,108,101,99,116,111,114,0,0,0,0,0,0,0,100,97,114,107,99,121,97,110,0,0,0,0,0,0,0,0,104,115,108,40,36,104,117,101,44,32,36,115,97,116,117,114,97,116,105,111,110,44,32,36,108,105,103,104,116,110,101,115,115,41,0,0,0,0,0,0,99,111,110,116,101,110,116,115,32,111,102,32,110,97,109,101,115,112,97,99,101,100,32,112,114,111,112,101,114,116,105,101,115,32,109,117,115,116,32,114,101,115,117,108,116,32,105,110,32,115,116,121,108,101,32,100,101,99,108,97,114,97,116,105,111,110,115,32,111,110,108,121,0,0,0,0,0,0,0,0,47,0,0,0,0,0,0,0,59,0,0,0,0,0,0,0,101,120,112,101,99,116,101,100,32,97,32,39,123,39,32,97,102,116,101,114,32,110,97,109,101,115,112,97,99,101,100,32,112,114,111,112,101,114,116,121,0,0,0,0,0,0,0,0,66,97,99,107,116,114,97,99,101,58,0,0,0,0,0,0,103,105,118,101,110,32,0,0,105,111,115,95,98,97,115,101,58,58,99,108,101,97,114,0,36,119,101,105,103,104,116,0,105,110,116,101,114,110,97,108,32,101,114,114,111,114,58,32,115,117,98,115,101,116,32,109,97,112,32,107,101,121,115,32,109,97,121,32,110,111,116,32,98,101,32,101,109,112,116,121,0,0,0,0,0,0,0,0,45,0,0,0,0,0,0,0,100,97,114,107,98,108,117,101,0,0,0,0,0,0,0,0,32,105,110,32,97,115,115,105,103,110,109,101,110,116,32,115,116,97,116,101,109,101,110,116,0,0,0,0,0,0,0,0,64,119,104,105,108,101,32,0,99,97,110,110,111,116,32,97,100,100,32,111,114,32,115,117,98,116,114,97,99,116,32,110,117,109,98,101,114,115,32,119,105,116,104,32,105,110,99,111,109,112,97,116,105,98,108,101,32,117,110,105,116,115,0,0,99,121,97,110,0,0,0,0,101,120,112,101,99,116,101,100,32,39,58,39,32,97,102,116,101,114,32,0,0,0,0,0,99,109,0,0,0,0,0,0,100,105,118,105,115,105,111,110,32,98,121,32,122,101,114,111,0,0,0,0,0,0,0,0,85,110,97,98,108,101,32,116,111,32,97,108,108,111,99,97,116,101,32,109,101,109,111,114,121,58,32,0,0,0,0,0,99,114,105,109,115,111,110,0,105,110,118,97,108,105,100,32,110,97,109,101,32,105,110,32,64,105,110,99,108,117,100,101,32,100,105,114,101,99,116,105,118,101,0,0,0,0,0,0,64,101,97,99,104,32,0,0,109,105,120,40,36,99,111,108,111,114,45,49,44,32,36,99,111,108,111,114,45,50,44,32,36,119,101,105,103,104,116,58,32,53,48,37,41,0,0,0,96,69,120,112,97,110,100,96,32,100,111,101,115,110,39,116,32,104,97,110,100,108,101,32,0,0,0,0,0,0,0,0,73,110,102,105,110,105,116,121,0,0,0,0,0,0,0,0,99,111,114,110,115,105,108,107,0,0,0,0,0,0,0,0,101,120,112,101,99,116,101,100,32,97,32,118,97,114,105,97,98,108,101,32,110,97,109,101,32,40,101,46,103,46,32,36,120,41,32,111,114,32,39,41,39,32,102,111,114,32,116,104,101,32,112,97,114,97,109,101,116,101,114,32,108,105,115,116,32,102,111,114,32,0,0,0,32,116,111,32,0,0,0,0,99,111,114,110,102,108,111,119,101,114,98,108,117,101,0,0,98,108,117,101,40,36,99,111,108,111,114,41,0,0,0,0,67,0,0,0,0,0,0,0,117,110,107,110,111,119,110,32,105,110,116,101,114,110,97,108,32,101,114,114,111,114,59,32,112,108,101,97,115,101,32,99,111,110,116,97,99,116,32,116,104,101,32,76,105,98,83,97,115,115,32,109,97,105,110,116,97,105,110,101,114,115,0,0,99,97,110,110,111,116,32,99,111,109,112,97,114,101,32,110,117,109,98,101,114,115,32,119,105,116,104,32,105,110,99,111,109,112,97,116,105,98,108,101,32,117,110,105,116,115,0,0,108,105,115,116,0,0,0,0,108,111,119,101,114,32,98,111,117,110,100,32,111,102,32,96,64,102,111,114,96,32,100,105,114,101,99,116,105,118,101,32,109,117,115,116,32,98,101,32,110,117,109,101,114,105,99,0,32,109,117,115,116,32,98,101,103,105,110,32,119,105,116,104,32,97,32,39,123,39,0,0,32,116,104,114,111,117,103,104,32,0,0,0,0,0,0,0,116,111,112,45,108,101,118,101,108,32,118,97,114,105,97,98,108,101,32,98,105,110,100,105,110,103,32,109,117,115,116,32,98,101,32,116,101,114,109,105,110,97,116,101,100,32,98,121,32,39,59,39,0,0,0,0,99,111,114,97,108,0,0,0,103,114,101,101,110,40,36,99,111,108,111,114,41,0,0,0,118,101,99,116,111,114,0,0,109,105,120,105,110,32,0,0,109,97,121,32,111,110,108,121,32,99,111,109,112,97,114,101,32,110,117,109,98,101,114,115,0,0,0,0,0,0,0,0,97,114,103,108,105,115,116,0,32,123,10,0,0,0,0,0,99,111,108,111,114,0,0,0,32,0,0,0,0,0,0,0,32,102,114,111,109,32,0,0,99,104,111,99,111,108,97,116,101,0,0,0,0,0,0,0,91,98,117,105,108,116,45,105,110,32,102,117,110,99,116,105,111,110,93,0,0,0,0,0,91,102,93,0,0,0,0,0,114,101,100,40,36,99,111,108,111,114,41,0,0,0,0,0,37,46,48,76,102,0,0,0,64,99,111,110,116,101,110,116,91,109,93,0,0,0,0,0,115,111,117,114,99,101,32,115,116,114,105,110,103,0,0,0,32,42,47,0,0,0,0,0,47,42,35,32,115,111,117,114,99,101,77,97,112,112,105,110,103,85,82,76,61,0,0,0,118,97,114,105,97,98,108,101].concat([45,108,101,110,103,116,104,32,97,114,103,117,109,101,110,116,32,109,97,121,32,110,111,116,32,98,101,32,112,97,115,115,101,100,32,98,121,32,110,97,109,101,0,0,0,0,0,0,91,67,79,76,79,82,32,84,65,66,76,69,93,0,0,0,98,111,100,121,32,102,111,114,32,0,0,0,0,0,0,0,64,102,111,114,32,0,0,0,121,101,108,108,111,119,103,114,101,101,110,0,0,0,0,0,121,101,108,108,111,119,0,0,99,104,97,114,116,114,101,117,115,101,0,0,0,0,0,0,119,104,105,116,101,115,109,111,107,101,0,0,0,0,0,0,119,104,105,116,101,0,0,0,36,99,111,108,111,114,0,0,109,111,110,101,121,95,103,101,116,32,101,114,114,111,114,0,119,104,101,97,116,0,0,0,117,110,98,111,117,110,100,32,118,97,114,105,97,98,108,101,32,0,0,0,0,0,0,0,118,105,111,108,101,116,0,0,116,117,114,113,117,111,105,115,101,0,0,0,0,0,0,0,116,111,109,97,116,111,0,0,116,104,105,115,116,108,101,0,116,101,97,108,0,0,0,0,32,100,101,102,105,110,105,116,105,111,110,0,0,0,0,0,116,97,110,0,0,0,0,0,115,116,101,101,108,98,108,117,101,0,0,0,0,0,0,0,83,97,116,0,0,0,0,0,115,112,114,105,110,103,103,114,101,101,110,0,0,0,0,0,99,97,100,101,116,98,108,117,101,0,0,0,0,0,0,0,115,116,100,58,58,98,97,100,95,99,97,115,116,0,0,0,70,114,105,0,0,0,0,0,105,111,115,116,114,101,97,109,0,0,0,0,0,0,0,0,115,110,111,119,0,0,0,0,114,103,98,97,40,36,99,111,108,111,114,44,32,36,97,108,112,104,97,41,0,0,0,0,37,76,102,0,0,0,0,0,96,0,0,0,0,0,0,0,84,104,117,0,0,0,0,0,115,108,97,116,101,103,114,101,121,0,0,0,0,0,0,0,96,32,103,105,118,101,110,32,119,114,111,110,103,32,110,117,109,98,101,114,32,111,102,32,97,114,103,117,109,101,110,116,115,0,0,0,0,0,0,0,87,101,100,0,0,0,0,0,115,108,97,116,101,103,114,97,121,0,0,0,0,0,0,0,84,117,101,0,0,0,0,0,115,108,97,116,101,98,108,117,101,0,0,0,0,0,0,0,77,111,110,0,0,0,0,0,115,107,121,98,108,117,101,0,83,117,110,0,0,0,0,0,115,105,108,118,101,114,0,0,115,105,101,110,110,97,0,0,83,97,116,117,114,100,97,121,0,0,0,0,0,0,0,0,97,110,116,105,113,117,101,119,104,105,116,101,0,0,0,0,105,110,118,97,108,105,100,32,110,97,109,101,32,105,110,32,0,0,0,0,0,0,0,0,70,114,105,100,97,121,0,0,115,101,97,115,104,101,108,108,0,0,0,0,0,0,0,0,46,46,47,0,0,0,0,0,84,104,117,114,115,100,97,121,0,0,0,0,0,0,0,0,115,101,97,103,114,101,101,110,0,0,0,0,0,0,0,0,87,101,100,110,101,115,100,97,121,0,0,0,0,0,0,0,115,97,110,100,121,98,114,111,119,110,0,0,0,0,0,0,98,117,114,108,121,119,111,111,100,0,0,0,0,0,0,0,110,117,109,98,101,114,0,0,84,117,101,115,100,97,121,0,115,97,108,109,111,110,0,0,36,97,108,112,104,97,0,0,114,98,0,0,0,0,0,0,44,32,105,110,32,109,105,120,105,110,32,96,0,0,0,0,32,105,115,32,109,105,115,115,105,110,103,32,105,110,32,99,97,108,108,32,116,111,32,0,77,111,110,100,97,121,0,0,45,0,0,0,0,0,0,0,115,97,100,100,108,101,98,114,111,119,110,0,0,0,0,0,111,118,101,114,108,111,97,100,101,100,32,102,117,110,99,116,105,111,110,32,96,0,0,0,83,117,110,100,97,121,0,0,114,111,121,97,108,98,108,117,101,0,0,0,0,0,0,0,115,116,114,105,110,103,0,0,114,111,115,121,98,114,111,119,110,0,0,0,0,0,0,0,32,111,110,108,121,32,116,97,107,101,115,32,0,0,0,0,96,32,109,117,115,116,32,98,101,32,97,32,0,0,0,0,83,0,0,0,97,0,0,0,116,0,0,0,0,0,0,0,114,101,100,0,0,0,0,0,70,0,0,0,114,0,0,0,105,0,0,0,0,0,0,0,112,117,114,112,108,101,0,0,84,0,0,0,104,0,0,0,117,0,0,0,0,0,0,0,112,111,119,100,101,114,98,108,117,101,0,0,0,0,0,0,117,112,112,101,114,32,98,111,117,110,100,32,111,102,32,96,64,102,111,114,96,32,100,105,114,101,99,116,105,118,101,32,109,117,115,116,32,98,101,32,110,117,109,101,114,105,99,0,101,120,112,101,99,116,105,110,103,32,97,110,111,116,104,101,114,32,117,114,108,32,111,114,32,113,117,111,116,101,100,32,112,97,116,104,32,105,110,32,64,105,109,112,111,114,116,32,108,105,115,116,0,0,0,0,47,0,0,0,0,0,0,0,46,46,46,0,0,0,0,0,87,0,0,0,101,0,0,0,100,0,0,0,0,0,0,0,112,108,117,109,0,0,0,0,64,119,97,114,110,32,0,0,36,111,110,108,121,45,112,97,116,104,0,0,0,0,0,0,84,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,112,105,110,107,0,0,0,0,36,112,97,116,104,0,0,0,77,0,0,0,111,0,0,0,110,0,0,0,0,0,0,0,112,101,114,117,0,0,0,0,98,114,111,119,110,0,0,0,105,109,97,103,101,45,117,114,108,40,36,112,97,116,104,44,32,36,111,110,108,121,45,112,97,116,104,58,32,102,97,108,115,101,44,32,36,99,97,99,104,101,45,98,117,115,116,101,114,58,32,102,97,108,115,101,41,0,0,0,0,0,0,0,112,101,97,99,104,112,117,102,102,0,0,0,0,0,0,0,117,110,115,112,101,99,105,102,105,101,100,32,105,111,115,116,114,101,97,109,95,99,97,116,101,103,111,114,121,32,101,114,114,111,114,0,0,0,0,0,83,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,32,97,114,103,117,109,101,110,116,115,59,32,0,0,0,0,114,103,98,97,40,36,114,101,100,44,32,36,103,114,101,101,110,44,32,36,98,108,117,101,44,32,36,97,108,112,104,97,41,0,0,0,0,0,0,0,110,111,32,109,105,120,105,110,32,110,97,109,101,100,32,0,114,101,113,117,105,114,101,100,32,112,97,114,97,109,101,116,101,114,32,0,0,0,0,0,83,0,0,0,97,0,0,0,116,0,0,0,117,0,0,0,114,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,112,97,112,97,121,97,119,104,105,112,0,0,0,0,0,0,58,32,0,0,0,0,0,0,36,105,102,45,102,97,108,115,101,0,0,0,0,0,0,0,70,0,0,0,114,0,0,0,105,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,112,97,108,101,118,105,111,108,101,116,114,101,100,0,0,0,36,99,111,110,100,105,116,105,111,110,0,0,0,0,0,0,84,0,0,0,104,0,0,0,117,0,0,0,114,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,112,97,108,101,116,117,114,113,117,111,105,115,101,0,0,0,105,102,40,36,99,111,110,100,105,116,105,111,110,44,32,36,105,102,45,116,114,117,101,44,32,36,105,102,45,102,97,108,115,101,41,0,0,0,0,0,87,0,0,0,101,0,0,0,100,0,0,0,110,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,112,97,108,101,103,114,101,101,110,0,0,0,0,0,0,0,110,111,116,40,36,118,97,108,117,101,41,0,0,0,0,0,84,0,0,0,117,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,112,97,108,101,103,111,108,100,101,110,114,111,100,0,0,0,36,110,117,109,98,101,114,45,50,0,0,0,0,0,0,0,77,0,0,0,111,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,111,114,99,104,105,100,0,0,64,105,109,112,111,114,116,32,100,105,114,101,99,116,105,118,101,32,114,101,113,117,105,114,101,115,32,97,32,117,114,108,32,111,114,32,113,117,111,116,101,100,32,112,97,116,104,0,36,110,117,109,98,101,114,45,49,0,0,0,0,0,0,0,83,0,0,0,117,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,111,114,97,110,103,101,114,101,100,0,0,0,0,0,0,0,99,111,109,112,97,114,97,98,108,101,40,36,110,117,109,98,101,114,45,49,44,32,36,110,117,109,98,101,114,45,50,41,0,0,0,0,0,0,0,0,111,114,97,110,103,101,0,0,117,110,105,116,108,101,115,115,40,36,110,117,109,98,101,114,41,0,0,0,0,0,0,0,68,101,99,0,0,0,0,0,111,108,105,118,101,100,114,97,98,0,0,0,0,0,0,0,98,108,117,101,118,105,111,108,101,116,0,0,0,0,0,0,36,110,117,109,98,101,114,0,78,111,118,0,0,0,0,0,111,108,105,118,101,0,0,0,117,110,105,116,40,36,110,117,109,98,101,114,41,0,0,0,91,102,93,0,0,0,0,0,79,99,116,0,0,0,0,0,112,114,111,118,105,100,101,100,32,109,111,114,101,32,116,104,97,110,32,111,110,99,101,32,105,110,32,99,97,108,108,32,116,111,32,0,0,0,0,0,111,108,100,108,97,99,101,0,101,114,114,111,114,32,105,110,32,67,32,102,117,110,99,116,105,111,110,32,0,0,0,0,99,111,108,111,114,0,0,0,83,101,112,0,0,0,0,0,110,97,118,121,0,0,0,0,116,121,112,101,45,111,102,40,36,118,97,108,117,101,41,0,65,117,103,0,0,0,0,0,110,97,118,97,106,111,119,104,105,116,101,0,0,0,0,0,58,58,102,105,114,115,116,45,108,101,116,116,101,114,0,0,42,0,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,37,0,0,0,89,0,0,0,45,0,0,0,37,0,0,0,109,0,0,0,45,0,0,0,37,0,0,0,100,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,0,0,0,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,0,0,0,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,37,72,58,37,77,58,37,83,37,72,58,37,77,0,0,0,37,73,58,37,77,58,37,83,32,37,112,0,0,0,0,0,37,89,45,37,109,45,37,100,37,109,47,37,100,47,37,121,37,72,58,37,77,58,37,83,37,0,0,0,0,0,0,0,37,112,0,0,0,0,0,0,0,0,0,0,56,111,0,0,214,1,0,0,106,1,0,0,38,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,111,0,0,158,1,0,0,238,0,0,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,111,0,0,56,0,0,0,46,1,0,0,102,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,111,0,0,196,0,0,0,158,0,0,0,224,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,111,0,0,196,0,0,0,50,1,0,0,224,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,111,0,0,196,0,0,0,208,1,0,0,224,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,111,0,0,118,0,0,0,192,0,0,0,34,0,0,0,4,0,0,0,44,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,111,0,0,42,1,0,0,154,1,0,0,34,0,0,0,2,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,111,0,0,114,0,0,0,252,0,0,0,34,0,0,0,18,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,112,0,0,90,2,0,0,226,0,0,0,34,0,0,0,12,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,112,0,0,192,1,0,0,92,1,0,0,34,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,112,0,0,240,0,0,0,76,0,0,0,34,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,112,0,0,64,1,0,0,208,0,0,0,34,0,0,0,84,0,0,0,62,0,0,0,92,0,0,0,42,0,0,0,6,0,0,0,26,0,0,0,4,0,0,0,248,255,255,255,240,112,0,0,226,0,0,0,6,0,0,0,98,0,0,0,10,0,0,0,2,0,0,0,252,0,0,0,86,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,113,0,0,144,0,0,0,84,2,0,0,34,0,0,0,20,0,0,0,66,0,0,0,96,0,0,0,50,0,0,0,68,0,0,0,2,0,0,0,2,0,0,0,248,255,255,255,24,113,0,0,60,0,0,0,214,0,0,0,46,1,0,0,228,0,0,0,74,0,0,0,254,0,0,0,106,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,113,0,0,190,0,0,0,52,2,0,0,34,0,0,0,42,0,0,0,32,0,0,0,246,0,0,0,244,1,0,0,198,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,113,0,0,198,0,0,0,50,0,0,0,34,0,0,0,174,0,0,0,4,0,0,0,0,1,0,0,84,1,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,113,0,0,190,1,0,0,2,0,0,0,34,0,0,0,58,0,0,0,64,0,0,0,156,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,113,0,0,70,1,0,0,172,1,0,0,34,0,0,0,18,0,0,0,62,0,0,0,8,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,113,0,0,16,1,0,0,16,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,113,0,0,162,0,0,0,224,0,0,0,102,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,113,0,0,36,0,0,0,144,1,0,0,34,0,0,0,52,0,0,0,50,0,0,0,84,0,0,0,40,0,0,0,82,0,0,0,8,0,0,0,6,0,0,0,54,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,113,0,0,28,0,0,0,68,0,0,0,34,0,0,0,42,0,0,0,46,0,0,0,76,0,0,0,44,0,0,0,74,0,0,0,4,0,0,0,2,0,0,0,60,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,113,0,0,220,1,0,0,54,1,0,0,34,0,0,0,18,0,0,0,16,0,0,0,10,0,0,0,12,0,0,0,90,0,0,0,14,0,0,0,8,0,0,0,24,0,0,0,22,0,0,0,20,0,0,0,72,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,114,0,0,54,2,0,0,198,1,0,0,34,0,0,0,94,0,0,0,54,0,0,0,30,0,0,0,32,0,0,0,60,0,0,0,34,0,0,0,28,0,0,0,40,0,0,0,38,0,0,0,36,0,0,0,78,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,114,0,0,58,0,0,0,8,0,0,0,34,0,0,0,24,0,0,0,12,0,0,0,54,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,114,0,0,22,0,0,0,246,0,0,0,34,0,0,0,4,0,0,0,18,0,0,0,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,114,0,0,176,1,0,0,50,2,0,0,34,0,0,0,12,0,0,0,16,0,0,0,30,0,0,0,50,1,0,0,132,0,0,0,10,0,0,0,220,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,114,0,0,148,1,0,0,220,0,0,0,34,0,0,0,8,0,0,0,4,0,0,0,28,0,0,0,182,0,0,0,236,0,0,0,8,0,0,0,180,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,114,0,0,148,1,0,0,14,0,0,0,34,0,0,0,10,0,0,0,14,0,0,0,18,0,0,0,130,0,0,0,110,0,0,0,14,0,0,0,58,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,114,0,0,148,1,0,0,12,2,0,0,34,0,0,0,2,0,0,0,6,0,0,0,22,0,0,0,250,0,0,0,158,0,0,0,12,0,0,0,152,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,114,0,0,148,1,0,0,218,1,0,0,34,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,114,0,0,238,1,0,0,232,0,0,0,34,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,114,0,0,148,1,0,0,80,1,0,0,34,0,0,0,8,0,0,0,14,0,0,0,8,0,0,0,12,0,0,0,242,1,0,0,36,0,0,0,12,3,0,0,44,0,0,0,182,2,0,0,36,0,0,0,26,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,115,0,0,150,0,0,0,60,1,0,0,34,0,0,0,158,2,0,0,48,0,0,0,246,2,0,0,64,0,0,0,246,0,0,0,42,0,0,0,10,0,0,0,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,115,0,0,186,0,0,0,88,1,0,0,64,0,0,0,92,1,0,0,80,0,0,0,16,0,0,0,216,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,96,115,0,0,166,1,0,0,86,2,0,0,56,0,0,0,248,255,255,255,96,115,0,0,228,1,0,0,44,0,0,0,192,255,255,255,192,255,255,255,96,115,0,0,66,2,0,0,168,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,115,0,0,148,1,0,0,62,0,0,0,34,0,0,0,2,0,0,0,6,0,0,0,22,0,0,0,250,0,0,0,158,0,0,0,12,0,0,0,152,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,115,0,0,148,1,0,0,88,2,0,0,34,0,0,0,2,0,0,0,6,0,0,0,22,0,0,0,250,0,0,0,158,0,0,0,12,0,0,0,152,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,115,0,0,230,1,0,0,80,2,0,0,144,0,0,0,90,0,0,0,26,0,0,0,20,0,0,0,178,0,0,0,198,0,0,0,82,0,0,0,54,1,0,0,156,0,0,0,136,1,0,0,56,0,0,0,32,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,115,0,0,90,0,0,0,184,1,0,0,12,1,0,0,28,0,0,0,10,0,0,0,14,0,0,0,70,0,0,0,80,0,0,0,88,0,0,0,28,0,0,0,242,0,0,0,250,0,0,0,94,0,0,0,62,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,115,0,0,202,1,0,0,212,0,0,0,144,0,0,0,90,0,0,0,20,0,0,0,26,0,0,0,178,0,0,0,198,0,0,0,82,0,0,0,232,0,0,0,156,0,0,0,120,2,0,0,56,0,0,0,30,3,0,0,0,0,0,0,0,0,0,0,108,0,0,0,0,0,0,0,216,115,0,0,138,1,0,0,10,1,0,0,148,255,255,255,148,255,255,255,216,115,0,0,94,1,0,0,116,1,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,8,116,0,0,66,1,0,0,170,1,0,0,252,255,255,255,252,255,255,255,8,116,0,0,106,0,0,0,22,2,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,32,116,0,0,18,1,0,0,186,1,0,0,252,255,255,255,252,255,255,255,32,116,0,0,104,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,56,116,0,0,194,0,0,0,92,2,0,0,248,255,255,255,248,255,255,255,56,116,0,0,46,2,0,0,138,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,80,116,0,0,14,2,0,0,6,1,0,0,248,255,255,255,248,255,255,255,80,116,0,0,28,2,0,0,170,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,116,0,0,76,2,0,0,244,1,0,0,186,2,0,0,76,0,0,0,32,0,0,0,34,0,0,0,0,1,0,0,198,0,0,0,82,0,0,0,202,0,0,0,156,0,0,0,238,2,0,0,56,0,0,0,32,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,116,0,0,2,1,0,0,82,2,0,0,102,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,116,0,0,36,1,0,0,150,1,0,0,10,0,0,0,28,0,0,0,10,0,0,0,14,0,0,0,6,1,0,0,80,0,0,0,88,0,0,0,28,0,0,0,242,0,0,0,250,0,0,0,14,0,0,0,124,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,116,0,0,136,1,0,0,120,0,0,0,96,0,0,0,90,0,0,0,20,0,0,0,26,0,0,0,12,0,0,0,198,0,0,0,82,0,0,0,232,0,0,0,156,0,0,0,120,2,0,0,92,0,0,0,10,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,116,0,0,26,1,0,0,120,1,0,0,34,0,0,0,58,0,0,0,146,0,0,0,116,0,0,0,210,0,0,0,160,1,0,0,40,1,0,0,104,0,0,0,140,2,0,0,170,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,117,0,0,206,0,0,0,38,0,0,0,34,0,0,0,218,0,0,0,144,0,0,0,112,1,0,0,74,2,0,0,138,1,0,0,70,0,0,0,44,1,0,0,16,2,0,0,176,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,117,0,0,0,2,0,0,210,0,0,0,34,0,0,0,16,0,0,0,108,0,0,0,8,2,0,0,0,2,0,0,88,2,0,0,128,0,0,0,72,0,0,0,86,1,0,0,132,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,117,0,0,252,1,0,0,142,1,0,0,34,0,0,0,212,0,0,0,216,0,0,0,218,1,0,0,180,0,0,0,24,1,0,0,136,2,0,0,124,0,0,0,220,2,0,0,120,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,117,0,0,90,1,0,0,206,1,0,0,22,0,0,0,28,0,0,0,10,0,0,0,14,0,0,0,70,0,0,0,80,0,0,0,88,0,0,0,190,0,0,0,126,0,0,0,198,2,0,0,94,0,0,0,62,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,117,0,0,12,0,0,0,178,1,0,0,14,1,0,0,90,0,0,0,20,0,0,0,26,0,0,0,178,0,0,0,198,0,0,0,82,0,0,0,208,0,0,0,22,0,0,0,188,1,0,0,56,0,0,0,30,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,117,0,0,130,0,0,0,188,1,0,0,108,0,0,0,120,1,0,0,52,0,0,0,224,0,0,0,26,0,0,0,178,0,0,0,88,0,0,0,76,0,0,0,100,0,0,0,60,0,0,0,8,1,0,0,82,1,0,0,126,1,0,0,136,0,0,0,204,1,0,0,170,0,0,0,166,0,0,0,116,0,0,0,138,0,0,0,72,1,0,0,10,0,0,0,46,1,0,0,202,0,0,0,74,1,0,0,230,0,0,0,190,1,0,0,208,0,0,0,128,0,0,0,38,1,0,0,132,0,0,0,44,0,0,0,150,0,0,0,246,0,0,0,50,1,0,0,244,0,0,0,100,1,0,0,170,1,0,0,128,1,0,0,12,0,0,0,180,1,0,0,174,1,0,0,122,0,0,0,48,1,0,0,196,0,0,0,24,1,0,0,80,1,0,0,178,1,0,0,202,1,0,0,34,0,0,0,124,1,0,0,30,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,117,0,0,8,0,0,0,8,0,0,0,184,1,0,0,16,2,0,0,10,0,0,0,170,0,0,0,186,0,0,0,140,1,0,0,86,0,0,0,76,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,117,0,0,122,1,0,0,200,0,0,0,150,0,0,0,38,0,0,0,80,2,0,0,60,2,0,0,138,0,0,0,186,1,0,0,70,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,118,0,0,8,0,0,0,8,0,0,0,184,1,0,0,16,2,0,0,10,0,0,0,170,0,0,0,186,0,0,0,140,1,0,0,86,0,0,0,76,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,118,0,0,32,1,0,0,146,1,0,0,156,1,0,0,20,3,0,0,2,2,0,0,238,0,0,0,206,1,0,0,80,0,0,0,106,0,0,0,76,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,118,0,0,82,0,0,0,228,0,0,0,136,0,0,0,52,2,0,0,160,1,0,0,40,2,0,0,16,3,0,0,2,1,0,0,198,0,0,0,184,0,0,0,2,2,0,0,94,0,0,0,114,0,0,0,166,2,0,0,220,255,255,255,48,118,0,0,108,2,0,0,244,0,0,0,240,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,118,0,0,2,2,0,0,72,0,0,0,144,1,0,0,166,0,0,0,190,2,0,0,4,0,0,0,114,2,0,0,184,0,0,0,20,0,0,0,184,0,0,0,2,2,0,0,94,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,118,0,0,8,0,0,0,8,0,0,0,184,1,0,0,16,2,0,0,10,0,0,0,170,0,0,0,186,0,0,0,140,1,0,0,86,0,0,0,96,0,0,0,118,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,118,0,0,56,1,0,0,204,0,0,0,138,0,0,0,8,3,0,0,32,0,0,0,166,2,0,0,194,2,0,0,206,1,0,0,62,1,0,0,184,0,0,0,2,2,0,0,94,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,118,0,0,8,0,0,0,8,0,0,0,184,1,0,0,16,2,0,0,10,0,0,0,170,0,0,0,186,0,0,0,140,1,0,0,86,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,118,0,0,70,0,0,0,250,1,0,0,236,1,0,0,20,1,0,0,168,1,0,0,88,2,0,0,98,0,0,0,164,1,0,0,42,1,0,0,76,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,118,0,0,174,1,0,0,26,2,0,0,160,0,0,0,90,2,0,0,244,1,0,0,188,2,0,0,82,1,0,0,136,1,0,0,16,1,0,0,184,0,0,0,2,2,0,0,94,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,118,0,0,126,1,0,0,226,1,0,0,236,0,0,0,62,0,0,0,40,0,0,0,96,2,0,0,70,0,0,0,190,0,0,0,210,1,0,0,204,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,118,0,0,100,1,0,0,20,2,0,0,130,0,0,0,34,1,0,0,86,1,0,0,142,0,0,0,158,0,0,0,42,0,0,0,108,0,0,0,76,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,118,0,0,42,0,0,0,110,1,0,0,162,1,0,0,50,0,0,0,44,0,0,0,216,0,0,0,140,1,0,0,120,2,0,0,102,0,0,0,78,0,0,0,104,1,0,0,56,2,0,0,82,2,0,0,228,2,0,0,56,1,0,0,168,2,0,0,166,0,0,0,96,2,0,0,124,2,0,0,240,1,0,0,214,2,0,0,192,0,0,0,228,0,0,0,192,2,0,0,28,0,0,0,4,1,0,0,6,1,0,0,174,2,0,0,206,0,0,0,230,2,0,0,60,2,0,0,74,0,0,0,212,1,0,0,20,0,0,0,240,2,0,0,172,1,0,0,202,2,0,0,80,1,0,0,128,2,0,0,40,2,0,0,146,0,0,0,250,2,0,0,152,2,0,0,112,0,0,0,52,1,0,0,44,1,0,0,112,2,0,0,194,2,0,0,168,0,0,0,62,0,0,0,106,1,0,0,4,2,0,0,68,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,118,0,0,24,1,0,0,42,0,0,0,160,2,0,0,100,1,0,0,12,2,0,0,122,1,0,0,194,0,0,0,222,0,0,0,126,0,0,0,76,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,118,0,0,76,1,0,0,236,0,0,0,178,1,0,0,200,0,0,0,40,3,0,0,208,2,0,0,2,1,0,0,176,0,0,0,172,0,0,0,76,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,118,0,0,62,2,0,0,234,1,0,0,230,1,0,0,204,1,0,0,210,2,0,0,236,2,0,0,170,2,0,0,192,0,0,0,162,0,0,0,112,0,0,0,138,2,0,0,94,0,0,0,30,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,119,0,0,200,1,0,0,38,1,0,0,180,2,0,0,188,0,0,0,130,0,0,0,76,2,0,0,52,1,0,0,242,0,0,0,196,1,0,0,76,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,119,0,0,8,0,0,0,8,0,0,0,98,2,0,0,4,3,0,0,212,1,0,0,220,2,0,0,170,1,0,0,4,0,0,0,156,0,0,0,184,0,0,0,2,2,0,0,94,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,119,0,0,68,1,0,0,142,0,0,0,210,2,0,0,160,2,0,0,184,0,0,0,12,0,0,0,116,1,0,0,26,1,0,0,210,0,0,0,76,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,119,0,0,224,1,0,0,72,2,0,0,86,0,0,0,74,0,0,0,146,0,0,0,104,2,0,0,22,3,0,0,218,1,0,0,48,0,0,0,184,0,0,0,122,2,0,0,94,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,119,0,0,234,0,0,0,136,0,0,0,16,0,0,0,0,2,0,0,98,1,0,0,226,0,0,0,152,1,0,0,40,1,0,0,240,0,0,0,76,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,119,0,0,90,2,0,0,148,0,0,0,60,0,0,0,226,1,0,0,236,2,0,0,224,2,0,0,184,2,0,0,38,2,0,0,100,1,0,0,194,1,0,0,168,1,0,0,238,1,0,0,68,0,0,0,232,2,0,0,218,0,0,0,40,0,0,0,244,2,0,0,176,0,0,0,32,0,0,0,126,0,0,0,174,1,0,0,44,2,0,0,134,0,0,0,186,0,0,0,94,2,0,0,84,2,0,0,156,2,0,0,150,1,0,0,154,2,0,0,126,1,0,0,100,0,0,0,224,0,0,0,176,2,0,0,196,1,0,0,114,0,0,0,226,0,0,0,238,2,0,0,244,0,0,0,142,0,0,0,58,1,0,0,248,2,0,0,222,0,0,0,164,0,0,0,230,0,0,0,2,3,0,0,252,2,0,0,162,0,0,0,62,2,0,0,132,1,0,0,106,2,0,0,110,1,0,0,208,0,0,0,78,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,119,0,0,216,0,0,0,180,1,0,0,72,1,0,0,174,0,0,0,246,1,0,0,16,0,0,0,94,0,0,0,250,2,0,0,28,3,0,0,134,1,0,0,116,2,0,0,24,3,0,0,192,0,0,0,38,2,0,0,140,2,0,0,14,0,0,0,106,1,0,0,154,1,0,0,124,1,0,0,176,0,0,0,156,0,0,0,28,2,0,0,180,2,0,0,218,0,0,0,234,0,0,0,84,2,0,0,154,0,0,0,82,2,0,0,136,2,0,0,134,0,0,0,234,1,0,0,104,1,0,0,116,0,0,0,12,1,0,0,48,1,0,0,106,2,0,0,40,1,0,0,118,0,0,0,150,2,0,0,88,0,0,0,46,2,0,0,120,0,0,0,14,1,0,0,46,1,0,0,220,1,0,0,168,2,0,0,64,1,0,0,66,0,0,0,178,1,0,0,204,0,0,0,224,0,0,0,132,0,0,0,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,119,0,0,114,1,0,0,32,2,0,0,30,2,0,0,22,0,0,0,146,1,0,0,128,0,0,0,54,2,0,0,74,0,0,0,52,1,0,0,76,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,119,0,0,152,0,0,0,74,0,0,0,42,2,0,0,122,0,0,0,198,1,0,0,112,1,0,0,112,2,0,0,134,1,0,0,140,0,0,0,184,0,0,0,88,1,0,0,94,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,119,0,0,230,0,0,0,74,1,0,0,48,0,0,0,108,2,0,0,68,1,0,0,96,1,0,0,224,2,0,0,232,0,0,0,64,1,0,0,76,0,0,0,20,1,0,0,190,1,0,0,228,255,255,255,160,119,0,0,66,2,0,0,78,0,0,0,214,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,119,0,0,218,0,0,0,176,0,0,0,94,0,0,0,102,1,0,0,112,0,0,0,32,0,0,0,114,1,0,0,176,1,0,0,66,0,0,0,180,0,0,0,160,1,0,0,236,0,0,0,98,1,0,0,194,1,0,0,94,0,0,0,96,1,0,0,84,1,0,0,160,0,0,0,184,1,0,0,154,0,0,0,248,0,0,0,84,0,0,0,206,0,0,0,144,1,0,0,226,0,0,0,72,0,0,0,182,1,0,0,144,0,0,0,188,1,0,0,28,1,0,0,106,1,0,0,228,0,0,0,192,1,0,0,98,0,0,0,124,0,0,0,152,0,0,0,228,1,0,0,168,0,0,0,146,1,0,0,58,0,0,0,158,0,0,0,68,1,0,0,64,0,0,0,96,0,0,0,168,1,0,0,148,0,0,0,18,1,0,0,58,1,0,0,182,0,0,0,220,0,0,0,66,1,0,0,86,1,0,0,152,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,119,0,0,112,1,0,0,30,2,0,0,172,2,0,0,14,3,0,0,42,1,0,0,132,2,0,0,66,2,0,0,250,0,0,0,22,1,0,0,134,0,0,0,110,0,0,0,16,1,0,0,194,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,119,0,0,118,1,0,0,36,2,0,0,54,0,0,0,50,0,0,0,64,2,0,0,158,1,0,0,128,2,0,0,212,1,0,0,76,1,0,0,184,0,0,0,70,2,0,0,238,0,0,0,114,0,0,0,220,255,255,255,224,119,0,0,2,1,0,0,160,0,0,0,4,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,0,0,56,2,0,0,172,0,0,0,82,1,0,0,126,0,0,0,194,1,0,0,18,3,0,0,222,1,0,0,232,1,0,0,10,2,0,0,196,0,0,0,162,1,0,0,60,0,0,0,86,0,0,0,14,2,0,0,176,1,0,0,118,1,0,0,196,2,0,0,224,1,0,0,102,1,0,0,164,1,0,0,22,1,0,0,222,2,0,0,212,0,0,0,20,0,0,0,134,2,0,0,4,1,0,0,62,1,0,0,184,1,0,0,162,2,0,0,192,1,0,0,186,2,0,0,244,2,0,0,96,0,0,0,84,0,0,0,248,0,0,0,100,0,0,0,38,3,0,0,84,1,0,0,6,3,0,0,70,1,0,0,10,3,0,0,216,1,0,0,210,0,0,0,228,2,0,0,24,0,0,0,118,2,0,0,252,1,0,0,92,0,0,0,230,2,0,0,44,1,0,0,110,1,0,0,44,2,0,0,148,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,120,0,0,98,0,0,0,58,1,0,0,198,0,0,0,126,2,0,0,178,2,0,0,0,1,0,0,90,1,0,0,222,1,0,0,220,1,0,0,76,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,120,0,0,168,0,0,0,12,1,0,0,140,0,0,0,202,1,0,0,128,1,0,0,236,0,0,0,168,0,0,0,134,0,0,0,78,0,0,0,76,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,120,0,0,112,0,0,0,250,0,0,0,158,1,0,0,148,0,0,0,48,0,0,0,34,3,0,0,150,1,0,0,38,0,0,0,104,1,0,0,76,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,120,0,0,96,0,0,0,68,2,0,0,80,2,0,0,164,2,0,0,78,2,0,0,6,0,0,0,242,2,0,0,214,0,0,0,212,0,0,0,184,0,0,0,2,2,0,0,94,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,120,0,0,132,1,0,0,64,2,0,0,150,2,0,0,70,2,0,0,86,2,0,0,74,1,0,0,156,1,0,0,104,0,0,0,130,1,0,0,34,1,0,0,118,0,0,0,46,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,120,0,0,202,0,0,0,66,0,0,0,144,2,0,0,230,0,0,0,126,1,0,0,232,2,0,0,102,0,0,0,188,0,0,0,44,1,0,0,184,0,0,0,2,2,0,0,94,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,120,0,0,56,2,0,0,108,1,0,0,30,1,0,0,254,2,0,0,252,2,0,0,226,1,0,0,226,2,0,0,102,0,0,0,12,1,0,0,96,0,0,0,140,0,0,0,46,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,120,0,0,130,0,0,0,58,2,0,0,174,0,0,0,58,1,0,0,174,2,0,0,100,2,0,0,36,2,0,0,150,1,0,0,108,1,0,0,96,0,0,0,188,0,0,0,40,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,120,0,0,248,1,0,0,64,0,0,0,76,1,0,0,76,0,0,0,200,1,0,0,20,2,0,0,42,0,0,0,0,1,0,0,234,0,0,0,96,0,0,0,118,0,0,0,46,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,120,0,0,6,2,0,0,254,0,0,0,40,2,0,0,246,1,0,0,250,0,0,0,120,0,0,0,124,1,0,0,134,1,0,0,238,0,0,0,164,1,0,0,188,2,0,0,172,0,0,0,90,0,0,0,130,2,0,0,114,1,0,0,64,1,0,0,142,2,0,0,34,0,0,0,158,2,0,0,136,1,0,0,148,0,0,0,204,0,0,0,124,0,0,0,36,1,0,0,152,1,0,0,22,2,0,0,232,1,0,0,196,2,0,0,98,1,0,0,42,1,0,0,178,0,0,0,80,0,0,0,82,1,0,0,214,1,0,0,182,1,0,0,18,1,0,0,86,2,0,0,52,0,0,0,204,2,0,0,208,1,0,0,116,2,0,0,12,2,0,0,252,0,0,0,118,2,0,0,18,2,0,0,114,2,0,0,240,0,0,0,66,1,0,0,234,2,0,0,36,0,0,0,46,0,0,0,74,1,0,0,192,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,120,0,0,248,0,0,0,116,0,0,0,186,1,0,0,44,0,0,0,26,1,0,0,8,0,0,0,244,0,0,0,8,0,0,0,94,1,0,0,164,0,0,0,240,0,0,0,190,0,0,0,224,255,255,255,176,120,0,0,242,2,0,0,130,1,0,0,218,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,120,0,0,20,0,0,0,126,0,0,0,54,1,0,0,50,1,0,0,220,0,0,0,240,0,0,0,138,1,0,0,54,0,0,0,110,1,0,0,184,0,0,0,2,2,0,0,94,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,120,0,0,80,0,0,0,48,1,0,0,232,0,0,0,30,2,0,0,208,1,0,0,252,0,0,0,34,2,0,0,194,0,0,0,32,1,0,0,184,0,0,0,2,2,0,0,94,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,120,0,0,174,0,0,0,22,1,0,0,200,1,0,0,140,1,0,0,216,2,0,0,156,2,0,0,154,2,0,0,56,1,0,0,110,0,0,0,96,0,0,0,118,0,0,0,46,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,121,0,0,8,2,0,0,152,1,0,0,54,2,0,0,42,3,0,0,190,1,0,0,74,2,0,0,206,2,0,0,112,1,0,0,6,0,0,0,34,0,0,0,222,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,121,0,0,232,1,0,0,46,0,0,0,224,1,0,0,2,3,0,0,56,0,0,0,110,2,0,0,108,0,0,0,36,0,0,0,28,0,0,0,184,0,0,0,32,2,0,0,94,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,121,0,0,8,0,0,0,8,0,0,0,184,1,0,0,16,2,0,0,10,0,0,0,170,0,0,0,186,0,0,0,140,1,0,0,86,0,0,0,96,0,0,0,118,0,0,0,46,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,121,0,0,134,0,0,0,70,2,0,0,210,1,0,0,92,2,0,0,94,1,0,0,254,0,0,0,232,0,0,0,230,1,0,0,198,1,0,0,96,0,0,0,118,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
.concat([0,0,0,0,64,121,0,0,110,0,0,0,166,0,0,0,58,0,0,0,204,2,0,0,72,2,0,0,166,1,0,0,114,1,0,0,88,1,0,0,138,1,0,0,96,0,0,0,32,1,0,0,66,0,0,0,40,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,121,0,0,98,1,0,0,210,1,0,0,196,0,0,0,8,2,0,0,152,0,0,0,92,1,0,0,18,0,0,0,232,1,0,0,70,1,0,0,96,0,0,0,26,0,0,0,38,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,121,0,0,38,2,0,0,124,0,0,0,220,0,0,0,218,1,0,0,124,0,0,0,26,3,0,0,132,1,0,0,120,0,0,0,10,1,0,0,184,0,0,0,50,2,0,0,94,0,0,0,114,0,0,0,216,255,255,255,240,121,0,0,2,1,0,0,10,2,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,122,0,0,48,2,0,0,78,1,0,0,30,0,0,0,228,0,0,0,184,2,0,0,38,1,0,0,30,1,0,0,162,1,0,0,60,1,0,0,56,0,0,0,160,0,0,0,10,2,0,0,224,255,255,255,16,122,0,0,64,0,0,0,178,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,122,0,0,66,0,0,0,182,1,0,0,164,1,0,0,2,0,0,0,234,1,0,0,24,0,0,0,60,1,0,0,78,1,0,0,154,1,0,0,82,0,0,0,104,0,0,0,154,0,0,0,18,0,0,0,162,2,0,0,118,0,0,0,206,2,0,0,72,1,0,0,202,0,0,0,162,1,0,0,198,1,0,0,46,1,0,0,166,1,0,0,24,2,0,0,254,1,0,0,76,2,0,0,32,1,0,0,134,2,0,0,46,2,0,0,56,0,0,0,200,2,0,0,152,0,0,0,246,2,0,0,60,0,0,0,52,2,0,0,188,1,0,0,220,1,0,0,252,1,0,0,148,2,0,0,20,2,0,0,218,2,0,0,194,0,0,0,146,1,0,0,90,1,0,0,190,2,0,0,122,0,0,0,212,2,0,0,208,2,0,0,94,1,0,0,202,1,0,0,188,0,0,0,92,0,0,0,48,1,0,0,146,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,122,0,0,164,0,0,0,8,1,0,0,92,2,0,0,190,0,0,0,46,0,0,0,6,2,0,0,34,0,0,0,186,0,0,0,62,0,0,0,184,0,0,0,2,2,0,0,94,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,122,0,0,160,0,0,0,24,0,0,0,122,0,0,0,36,1,0,0,240,2,0,0,80,1,0,0,54,0,0,0,254,1,0,0,94,2,0,0,186,1,0,0,212,2,0,0,180,0,0,0,150,0,0,0,248,2,0,0,102,2,0,0,58,2,0,0,210,1,0,0,18,2,0,0,24,1,0,0,28,0,0,0,18,1,0,0,144,2,0,0,174,1,0,0,112,0,0,0,110,0,0,0,182,0,0,0,82,0,0,0,214,1,0,0,234,2,0,0,76,1,0,0,236,1,0,0,214,0,0,0,196,1,0,0,44,3,0,0,148,1,0,0,228,1,0,0,72,0,0,0,60,1,0,0,8,1,0,0,214,2,0,0,140,0,0,0,130,1,0,0,192,2,0,0,30,0,0,0,0,3,0,0,28,1,0,0,104,0,0,0,172,1,0,0,78,0,0,0,202,0,0,0,130,2,0,0,108,1,0,0,206,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,122,0,0,212,1,0,0,32,0,0,0,38,0,0,0,146,2,0,0,152,2,0,0,98,2,0,0,250,1,0,0,254,0,0,0,40,0,0,0,184,0,0,0,2,2,0,0,94,0,0,0,114,0,0,0,220,255,255,255,96,122,0,0,170,1,0,0,26,0,0,0,188,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,122,0,0,128,0,0,0,242,1,0,0,110,2,0,0,78,1,0,0,26,2,0,0,66,1,0,0,208,0,0,0,14,1,0,0,114,0,0,0,60,1,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,122,0,0,124,1,0,0,246,1,0,0,76,0,0,0,172,2,0,0,64,0,0,0,202,2,0,0,240,1,0,0,54,1,0,0,118,0,0,0,76,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,122,0,0,92,0,0,0,18,2,0,0,212,0,0,0,22,2,0,0,50,2,0,0,182,1,0,0,36,0,0,0,234,1,0,0,16,0,0,0,76,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,122,0,0,130,1,0,0,8,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,122,0,0,226,2,0,0,8,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,122,0,0,94,0,0,0,8,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,122,0,0,170,1,0,0,8,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,122,0,0,118,1,0,0,8,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,122,0,0,170,0,0,0,8,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,122,0,0,2,1,0,0,8,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,122,0,0,134,1,0,0,30,0,0,0,182,2,0,0,142,2,0,0,48,2,0,0,4,2,0,0,16,1,0,0,226,1,0,0,50,0,0,0,96,1,0,0,228,255,255,255,232,122,0,0,50,1,0,0,60,2,0,0,132,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,123,0,0,102,0,0,0,74,2,0,0,180,1,0,0,142,1,0,0,218,2,0,0,180,1,0,0,32,2,0,0,90,1,0,0,6,1,0,0,76,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,123,0,0,8,0,0,0,8,0,0,0,184,1,0,0,16,2,0,0,10,0,0,0,170,0,0,0,186,0,0,0,140,1,0,0,86,0,0,0,184,0,0,0,2,2,0,0,94,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,123,0,0,4,2,0,0,182,0,0,0,8,0,0,0,176,2,0,0,136,0,0,0,58,0,0,0,230,1,0,0,158,1,0,0,18,0,0,0,76,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,123,0,0,28,1,0,0,194,1,0,0,164,2,0,0,162,0,0,0,138,2,0,0,144,1,0,0,2,0,0,0,34,1,0,0,122,1,0,0,76,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,123,0,0,40,1,0,0,86,1,0,0,48,0,0,0,128,1,0,0,86,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,123,0,0,40,1,0,0,160,1,0,0,48,0,0,0,128,1,0,0,6,0,0,0,30,0,0,0,30,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,118,0,0,0,0,0,0,0,99,0,0,0,0,0,0,0,83,116,57,116,121,112,101,95,105,110,102,111,0,0,0,0,83,116,57,101,120,99,101,112,116,105,111,110,0,0,0,0,83,116,57,98,97,100,95,97,108,108,111,99,0,0,0,0,83,116,56,98,97,100,95,99,97,115,116,0,0,0,0,0,83,116,49,51,114,117,110,116,105,109,101,95,101,114,114,111,114,0,0,0,0,0,0,0,83,116,49,50,111,117,116,95,111,102,95,114,97,110,103,101,0,0,0,0,0,0,0,0,83,116,49,50,108,101,110,103,116,104,95,101,114,114,111,114,0,0,0,0,0,0,0,0,83,116,49,49,108,111,103,105,99,95,101,114,114,111,114,0,80,75,99,0,0,0,0,0,78,83,116,51,95,95,49,57,116,105,109,101,95,98,97,115,101,69,0,0,0,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111,115,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111,115,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,119,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,99,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,119,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,99,69,69,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,119,69,69,0,0,0,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,99,69,69,0,0,0,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,119,69,69,0,0,0,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,99,69,69,0,0,0,0,78,83,116,51,95,95,49,56,105,111,115,95,98,97,115,101,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,56,105,111,115,95,98,97,115,101,55,102,97,105,108,117,114,101,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,119,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,99,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,119,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,99,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,115,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,105,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,102,97,99,101,116,69,0,0,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,95,95,105,109,112,69,0,0,0,78,83,116,51,95,95,49,53,99,116,121,112,101,73,119,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,53,99,116,121,112,101,73,99,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,50,49,95,95,98,97,115,105,99,95,115,116,114,105,110,103,95,99,111,109,109,111,110,73,76,98,49,69,69,69,0,0,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,119,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,99,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,57,95,95,105,111,115,116,114,101,97,109,95,99,97,116,101,103,111,114,121,69,0,0,0,78,83,116,51,95,95,49,49,56,98,97,115,105,99,95,115,116,114,105,110,103,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,99,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,49,55,95,95,119,105,100,101,110,95,102,114,111,109,95,117,116,102,56,73,76,106,51,50,69,69,69,0,0,0,0,0,0,78,83,116,51,95,95,49,49,54,95,95,110,97,114,114,111,119,95,116,111,95,117,116,102,56,73,76,106,51,50,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,105,110,103,98,117,102,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,99,69,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,101,114,114,111,114,95,99,97,116,101,103,111,114,121,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,98,97,115,105,99,95,105,111,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,78,83,116,51,95,95,49,49,52,98,97,115,105,99,95,105,102,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,78,83,116,51,95,95,49,49,52,95,95,115,104,97,114,101,100,95,99,111,117,110,116,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,112,117,116,95,98,97,115,101,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,103,101,116,95,98,97,115,101,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,51,109,101,115,115,97,103,101,115,95,98,97,115,101,69,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,102,105,108,101,98,117,102,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,50,115,121,115,116,101,109,95,101,114,114,111,114,69,0,0,78,83,116,51,95,95,49,49,50,99,111,100,101,99,118,116,95,98,97,115,101,69,0,0,78,83,116,51,95,95,49,49,50,98,97,115,105,99,95,115,116,114,105,110,103,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,50,95,95,100,111,95,109,101,115,115,97,103,101,69,0,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,49,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,48,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,49,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,48,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,95,98,97,115,101,69,0,0,0,0,78,83,116,51,95,95,49,49,48,99,116,121,112,101,95,98,97,115,101,69,0,0,0,0,78,83,116,51,95,95,49,49,48,95,95,116,105,109,101,95,112,117,116,69,0,0,0,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,119,69,69,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,99,69,69,0,78,52,83,97,115,115,57,84,111,95,83,116,114,105,110,103,69,0,0,0,0,0,0,0,78,52,83,97,115,115,57,83,116,97,116,101,109,101,110,116,69,0,0,0,0,0,0,0,78,52,83,97,115,115,57,80,97,114,97,109,101,116,101,114,69,0,0,0,0,0,0,0,78,52,83,97,115,115,57,79,112,101,114,97,116,105,111,110,73,118,69,69,0,0,0,0,78,52,83,97,115,115,57,79,112,101,114,97,116,105,111,110,73,80,78,83,95,57,83,116,97,116,101,109,101,110,116,69,69,69,0,0,0,0,0,0,78,52,83,97,115,115,57,79,112,101,114,97,116,105,111,110,73,80,78,83,95,56,83,101,108,101,99,116,111,114,69,69,69,0,0,0,0,0,0,0,78,52,83,97,115,115,57,79,112,101,114,97,116,105,111,110,73,80,78,83,95,49,48,69,120,112,114,101,115,115,105,111,110,69,69,69,0,0,0,0,78,52,83,97,115,115,57,79,112,101,114,97,116,105,111,110,73,78,83,116,51,95,95,49,49,50,98,97,115,105,99,95,115,116,114,105,110,103,73,99,78,83,49,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,78,83,49,95,57,97,108,108,111,99,97,116,111,114,73,99,69,69,69,69,69,69,0,0,0,0,0,78,52,83,97,115,115,57,79,112,101,114,97,116,105,111,110,73,49,48,83,97,115,115,95,86,97,108,117,101,69,69,0,78,52,83,97,115,115,57,72,97,115,95,66,108,111,99,107,69,0,0,0,0,0,0,0,78,52,83,97,115,115,57,69,120,116,101,110,115,105,111,110,69,0,0,0,0,0,0,0,78,52,83,97,115,115,57,65,114,103,117,109,101,110,116,115,69,0,0,0,0,0,0,0,78,52,83,97,115,115,56,86,97,114,105,97,98,108,101,69,0,0,0,0,0,0,0,0,78,52,83,97,115,115,56,83,101,108,101,99,116,111,114,69,0,0,0,0,0,0,0,0,78,52,83,97,115,115,56,65,114,103,117,109,101,110,116,69,0,0,0,0,0,0,0,0,78,52,83,97,115,115,56,65,83,84,95,78,111,100,101,69,0,0,0,0,0,0,0,0,78,52,83,97,115,115,55,87,97,114,110,105,110,103,69,0,78,52,83,97,115,115,55,84,101,120,116,117,97,108,69,0,78,52,83,97,115,115,55,82,117,108,101,115,101,116,69,0,78,52,83,97,115,115,55,80,114,111,112,115,101,116,69,0,78,52,83,97,115,115,55,73,110,115,112,101,99,116,69,0,78,52,83,97,115,115,55,67,111,110,116,101,110,116,69,0,78,52,83,97,115,115,55,67,111,109,109,101,110,116,69,0,78,52,83,97,115,115,55,66,111,111,108,101,97,110,69,0,78,52,83,97,115,115,55,65,116,95,82,117,108,101,69,0,78,52,83,97,115,115,54,83,116,114,105,110,103,69,0,0,78,52,83,97,115,115,54,82,101,116,117,114,110,69,0,0,78,52,83,97,115,115,54,78,117,109,98,101,114,69,0,0,78,52,83,97,115,115,54,73,109,112,111,114,116,69,0,0,78,52,83,97,115,115,54,69,120,116,101,110,100,69,0,0,78,52,83,97,115,115,54,69,120,112,97,110,100,69,0,0,78,52,83,97,115,115,53,87,104,105,108,101,69,0,0,0,78,52,83,97,115,115,53,69,114,114,111,114,69,0,0,0,78,52,83,97,115,115,53,67,111,108,111,114,69,0,0,0,78,52,83,97,115,115,53,66,108,111,99,107,69,0,0,0,78,52,83,97,115,115,52,84,111,95,67,69,0,0,0,0,78,52,83,97,115,115,52,78,117,108,108,69,0,0,0,0,78,52,83,97,115,115,52,76,105,115,116,69,0,0,0,0,78,52,83,97,115,115,52,69,118,97,108,69,0,0,0,0,78,52,83,97,115,115,52,69,97,99,104,69,0,0,0,0,78,52,83,97,115,115,51,70,111,114,69,0,0,0,0,0,78,52,83,97,115,115,50,73,102,69,0,0,0,0,0,0,78,52,83,97,115,115,50,50,77,101,100,105,97,95,81,117,101,114,121,95,69,120,112,114,101,115,115,105,111,110,69,0,78,52,83,97,115,115,50,48,83,101,108,101,99,116,111,114,95,80,108,97,99,101,104,111,108,100,101,114,69,0,0,0,78,52,83,97,115,115,50,48,70,117,110,99,116,105,111,110,95,67,97,108,108,95,83,99,104,101,109,97,69,0,0,0,78,52,83,97,115,115,49,56,83,101,108,101,99,116,111,114,95,82,101,102,101,114,101,110,99,101,69,0,0,0,0,0,78,52,83,97,115,115,49,56,83,101,108,101,99,116,111,114,95,81,117,97,108,105,102,105,101,114,69,0,0,0,0,0,78,52,83,97,115,115,49,56,65,116,116,114,105,98,117,116,101,95,83,101,108,101,99,116,111,114,69,0,0,0,0,0,78,52,83,97,115,115,49,55,79,117,116,112,117,116,95,67,111,109,112,114,101,115,115,101,100,69,0,0,0,0,0,0,78,52,83,97,115,115,49,55,67,111,109,112,111,117,110,100,95,83,101,108,101,99,116,111,114,69,0,0,0,0,0,0,78,52,83,97,115,115,49,55,66,105,110,97,114,121,95,69,120,112,114,101,115,115,105,111,110,69,0,0,0,0,0,0,78,52,83,97,115,115,49,54,85,110,97,114,121,95,69,120,112,114,101,115,115,105,111,110,69,0,0,0,0,0,0,0,78,52,83,97,115,115,49,54,78,101,103,97,116,101,100,95,83,101,108,101,99,116,111,114,69,0,0,0,0,0,0,0,78,52,83,97,115,115,49,54,67,111,109,112,108,101,120,95,83,101,108,101,99,116,111,114,69,0,0,0,0,0,0,0,78,52,83,97,115,115,49,53,83,116,114,105,110,103,95,67,111,110,115,116,97,110,116,69,0,0,0,0,0,0,0,0,78,52,83,97,115,115,49,53,83,105,109,112,108,101,95,83,101,108,101,99,116,111,114,69,0,0,0,0,0,0,0,0,78,52,83,97,115,115,49,53,83,101,108,101,99,116,111,114,95,83,99,104,101,109,97,69,0,0,0,0,0,0,0,0,78,52,83,97,115,115,49,53,80,115,101,117,100,111,95,83,101,108,101,99,116,111,114,69,0,0,0,0,0,0,0,0,78,52,83,97,115,115,49,52,79,112,101,114,97,116,105,111,110,95,67,82,84,80,73,118,78,83,95,55,73,110,115,112,101,99,116,69,69,69,0,0,78,52,83,97,115,115,49,52,79,112,101,114,97,116,105,111,110,95,67,82,84,80,73,118,78,83,95,54,69,120,116,101,110,100,69,69,69,0,0,0,78,52,83,97,115,115,49,52,79,112,101,114,97,116,105,111,110,95,67,82,84,80,73,118,78,83,95,49,55,79,117,116,112,117,116,95,67,111,109,112,114,101,115,115,101,100,69,69,69,0,0,0,0,0,0,0,78,52,83,97,115,115,49,52,79,112,101,114,97,116,105,111,110,95,67,82,84,80,73,118,78,83,95,49,51,79,117,116,112,117,116,95,78,101,115,116,101,100,69,69,69,0,0,0,78,52,83,97,115,115,49,52,79,112,101,114,97,116,105,111,110,95,67,82,84,80,73,80,78,83,95,57,83,116,97,116,101,109,101,110,116,69,78,83,95,54,69,120,112,97,110,100,69,69,69,0,0,0,0,0,78,52,83,97,115,115,49,52,79,112,101,114,97,116,105,111,110,95,67,82,84,80,73,80,78,83,95,56,83,101,108,101,99,116,111,114,69,78,83,95,49,51,67,111,110,116,101,120,116,117,97,108,105,122,101,69,69,69,0,0,0,0,0,0,78,52,83,97,115,115,49,52,79,112,101,114,97,116,105,111,110,95,67,82,84,80,73,80,78,83,95,49,48,69,120,112,114,101,115,115,105,111,110,69,78,83,95,52,69,118,97,108,69,69,69,0,0,0,0,0,78,52,83,97,115,115,49,52,79,112,101,114,97,116,105,111,110,95,67,82,84,80,73,78,83,116,51,95,95,49,49,50,98,97,115,105,99,95,115,116,114,105,110,103,73,99,78,83,49,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,78,83,49,95,57,97,108,108,111,99,97,116,111,114,73,99,69,69,69,69,78,83,95,57,84,111,95,83,116,114,105,110,103,69,69,69,0,78,52,83,97,115,115,49,52,79,112,101,114,97,116,105,111,110,95,67,82,84,80,73,49,48,83,97,115,115,95,86,97,108,117,101,78,83,95,52,84,111,95,67,69,69,69,0,0,78,52,83,97,115,115,49,51,84,121,112,101,95,83,101,108,101,99,116,111,114,69,0,0,78,52,83,97,115,115,49,51,83,116,114,105,110,103,95,83,99,104,101,109,97,69,0,0,78,52,83,97,115,115,49,51,83,101,108,101,99,116,111,114,95,76,105,115,116,69,0,0,78,52,83,97,115,115,49,51,79,117,116,112,117,116,95,78,101,115,116,101,100,69,0,0,78,52,83,97,115,115,49,51,70,117,110,99,116,105,111,110,95,67,97,108,108,69,0,0,78,52,83,97,115,115,49,51,67,111,110,116,101,120,116,117,97,108,105,122,101,69,0,0,78,52,83,97,115,115,49,49,77,101,100,105,97,95,81,117,101,114,121,69,0,0,0,0,78,52,83,97,115,115,49,49,77,101,100,105,97,95,66,108,111,99,107,69,0,0,0,0,78,52,83,97,115,115,49,49,73,109,112,111,114,116,95,83,116,117,98,69,0,0,0,0,78,52,83,97,115,115,49,49,68,101,99,108,97,114,97,116,105,111,110,69,0,0,0,0,78,52,83,97,115,115,49,48,86,101,99,116,111,114,105,122,101,100,73,80,78,83,95,57,83,116,97,116,101,109,101,110,116,69,69,69,0,0,0,0,78,52,83,97,115,115,49,48,86,101,99,116,111,114,105,122,101,100,73,80,78,83,95,57,80,97,114,97,109,101,116,101,114,69,69,69,0,0,0,0,78,52,83,97,115,115,49,48,86,101,99,116,111,114,105,122,101,100,73,80,78,83,95,56,65,114,103,117,109,101,110,116,69,69,69,0,0,0,0,0,78,52,83,97,115,115,49,48,86,101,99,116,111,114,105,122,101,100,73,80,78,83,95,50,50,77,101,100,105,97,95,81,117,101,114,121,95,69,120,112,114,101,115,115,105,111,110,69,69,69,0,0,0,0,0,0,78,52,83,97,115,115,49,48,86,101,99,116,111,114,105,122,101,100,73,80,78,83,95,49,54,67,111,109,112,108,101,120,95,83,101,108,101,99,116,111,114,69,69,69,0,0,0,0,78,52,83,97,115,115,49,48,86,101,99,116,111,114,105,122,101,100,73,80,78,83,95,49,53,83,105,109,112,108,101,95,83,101,108,101,99,116,111,114,69,69,69,0,0,0,0,0,78,52,83,97,115,115,49,48,86,101,99,116,111,114,105,122,101,100,73,80,78,83,95,49,48,69,120,112,114,101,115,115,105,111,110,69,69,69,0,0,78,52,83,97,115,115,49,48,80,97,114,97,109,101,116,101,114,115,69,0,0,0,0,0,78,52,83,97,115,115,49,48,77,105,120,105,110,95,67,97,108,108,69,0,0,0,0,0,78,52,83,97,115,115,49,48,69,120,112,114,101,115,115,105,111,110,69,0,0,0,0,0,78,52,83,97,115,115,49,48,68,101,102,105,110,105,116,105,111,110,69,0,0,0,0,0,78,52,83,97,115,115,49,48,65,115,115,105,103,110,109,101,110,116,69,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,51,95,95,102,117,110,100,97,109,101,110,116,97,108,95,116,121,112,101,95,105,110,102,111,69,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,49,95,95,118,109,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,57,95,95,112,111,105,110,116,101,114,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,112,98,97,115,101,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,0,68,110,0,0,0,0,0,0,184,86,0,0,8,87,0,0,0,0,0,0,24,87,0,0,0,0,0,0,40,87,0,0,0,0,0,0,56,87,0,0,48,111,0,0,0,0,0,0,0,0,0,0,72,87,0,0,48,111,0,0,0,0,0,0,0,0,0,0,88,87,0,0,48,111,0,0,0,0,0,0,0,0,0,0,112,87,0,0,136,111,0,0,0,0,0,0,0,0,0,0,136,87,0,0,136,111,0,0,0,0,0,0,0,0,0,0,160,87,0,0,48,111,0,0,0,0,0,0,0,0,0,0,176,87,0,0,1,0,0,0,0,0,0,0,0,0,0,0,184,87,0,0,224,86,0,0,208,87,0,0,0,0,0,0,2,0,0,0,216,114,0,0,2,0,0,0,216,116,0,0,0,0,0,0,224,86,0,0,24,88,0,0,0,0,0,0,2,0,0,0,216,114,0,0,2,0,0,0,224,116,0,0,0,0,0,0,224,86,0,0,96,88,0,0,0,0,0,0,2,0,0,0,216,114,0,0,2,0,0,0,232,116,0,0,0,0,0,0,224,86,0,0,168,88,0,0,0,0,0,0,2,0,0,0,216,114,0,0,2,0,0,0,240,116,0,0,0,0,0,0,0,0,0,0,240,88,0,0,160,113,0,0,0,0,0,0,0,0,0,0,32,89,0,0,160,113,0,0,0,0,0,0,224,86,0,0,80,89,0,0,0,0,0,0,1,0,0,0,240,115,0,0,0,0,0,0,224,86,0,0,104,89,0,0,0,0,0,0,1,0,0,0,240,115,0,0,0,0,0,0,224,86,0,0,128,89,0,0,0,0,0,0,1,0,0,0,248,115,0,0,0,0,0,0,224,86,0,0,152,89,0,0,0,0,0,0,1,0,0,0,248,115,0,0,0,0,0,0,224,86,0,0,176,89,0,0,0,0,0,0,2,0,0,0,216,114,0,0,2,0,0,0,136,117,0,0,0,8,0,0,224,86,0,0,248,89,0,0,0,0,0,0,2,0,0,0,216,114,0,0,2,0,0,0,136,117,0,0,0,8,0,0,224,86,0,0,64,90,0,0,0,0,0,0,3,0,0,0,216,114,0,0,2,0,0,0,168,111,0,0,2,0,0,0,64,115,0,0,0,8,0,0,224,86,0,0,136,90,0,0,0,0,0,0,3,0,0,0,216,114,0,0,2,0,0,0,168,111,0,0,2,0,0,0,72,115,0,0,0,8,0,0,0,0,0,0,208,90,0,0,216,114,0,0,0,0,0,0,0,0,0,0,232,90,0,0,216,114,0,0,0,0,0,0,224,86,0,0,0,91,0,0,0,0,0,0,2,0,0,0,216,114,0,0,2,0,0,0,0,116,0,0,2,0,0,0,224,86,0,0,24,91,0,0,0,0,0,0,2,0,0,0,216,114,0,0,2,0,0,0,0,116,0,0,2,0,0,0,0,0,0,0,48,91,0,0,0,0,0,0,72,91,0,0,120,116,0,0,0,0,0,0,224,86,0,0,104,91,0,0,0,0,0,0,2,0,0,0,216,114,0,0,2,0,0,0,80,112,0,0,0,0,0,0,224,86,0,0,176,91,0,0,0,0,0,0,2,0,0,0,216,114,0,0,2,0,0,0,104,112,0,0,0,0,0,0,224,86,0,0,248,91,0,0,0,0,0,0,2,0,0,0,216,114,0,0,2,0,0,0,128,112,0,0,0,0,0,0,224,86,0,0,64,92,0,0,0,0,0,0,2,0,0,0,216,114,0,0,2,0,0,0,152,112,0,0,0,0,0,0,0,0,0,0,136,92,0,0,216,114,0,0,0,0,0,0,0,0,0,0,160,92,0,0,216,114,0,0,0,0,0,0,224,86,0,0,184,92,0,0,0,0,0,0,2,0,0,0,216,114,0,0,2,0,0,0,136,116,0,0,2,0,0,0,224,86,0,0,224,92,0,0,0,0,0,0,2,0,0,0,216,114,0,0,2,0,0,0,136,116,0,0,2,0,0,0,224,86,0,0,8,93,0,0,0,0,0,0,2,0,0,0,216,114,0,0,2,0,0,0,136,116,0,0,2,0,0,0,224,86,0,0,48,93,0,0,0,0,0,0,2,0,0,0,216,114,0,0,2,0,0,0,136,116,0,0,2,0,0,0,0,0,0,0,88,93,0,0,232,115,0,0,0,0,0,0,0,0,0,0,112,93,0,0,216,114,0,0,0,0,0,0,224,86,0,0,136,93,0,0,0,0,0,0,2,0,0,0,216,114,0,0,2,0,0,0,128,117,0,0,2,0,0,0,224,86,0,0,160,93,0,0,0,0,0,0,2,0,0,0,216,114,0,0,2,0,0,0,128,117,0,0,2,0,0,0,0,0,0,0,184,93,0,0,0,0,0,0,224,93,0,0,0,0,0,0,8,94,0,0,0,0,0,0,48,94,0,0,168,116,0,0,0,0,0,0,0,0,0,0,80,94,0,0,184,115,0,0,0,0,0,0,0,0,0,0,152,94,0,0,184,114,0,0,0,0,0,0,0,0,0,0,192,94,0,0,184,114,0,0,0,0,0,0,0,0,0,0,232,94,0,0,168,115,0,0,0,0,0,0,0,0,0,0,48,95,0,0,0,0,0,0,104,95,0,0,0,0,0,0,160,95,0,0,224,86,0,0,192,95,0,0,3,0,0,0,2,0,0,0,80,116,0,0,2,0,0,0,32,116,0,0,2,8,0,0,0,0,0,0,240,95,0,0,80,116,0,0,0,0,0,0,0,0,0,0,32,96,0,0,0,0,0,0,64,96,0,0,0,0,0,0,96,96,0,0,0,0,0,0,128,96,0,0,224,86,0,0,152,96,0,0,0,0,0,0,1,0,0,0,48,112,0,0,3,244,255,255,224,86,0,0,200,96,0,0,0,0,0,0,1,0,0,0,64,112,0,0,3,244,255,255,224,86,0,0,248,96,0,0,0,0,0,0,1,0,0,0,48,112,0,0,3,244,255,255,224,86,0,0,40,97,0,0,0,0,0,0,1,0,0,0,64,112,0,0,3,244,255,255,0,0,0,0,88,97,0,0,168,115,0,0,0,0,0,0,0,0,0,0,136,97,0,0,88,111,0,0,0,0,0,0,0,0,0,0,160,97,0,0,224,86,0,0,184,97,0,0,0,0,0,0,1,0,0,0,56,115,0,0,0,0,0,0,0,0,0,0,248,97,0,0,176,115,0,0,0,0,0,0,0,0,0,0,16,98,0,0,160,115,0,0,0,0,0,0,0,0,0,0,48,98,0,0,168,115,0,0,0,0,0,0,0,0,0,0,80,98,0,0,0,0,0,0,112,98,0,0,0,0,0,0,144,98,0,0,0,0,0,0,176,98,0,0,224,86,0,0,208,98,0,0,0,0,0,0,2,0,0,0,216,114,0,0,2,0,0,0,120,117,0,0,2,0,0,0,224,86,0,0,240,98,0,0,0,0,0,0,2,0,0,0,216,114,0,0,2,0,0,0,120,117,0,0,2,0,0,0,224,86,0,0,16,99,0,0,0,0,0,0,2,0,0,0,216,114,0,0,2,0,0,0,120,117,0,0,2,0,0,0,224,86,0,0,48,99,0,0,0,0,0,0,2,0,0,0,216,114,0,0,2,0,0,0,120,117,0,0,2,0,0,0,0,0,0,0,80,99,0,0,0,0,0,0,104,99,0,0,0,0,0,0,128,99,0,0,0,0,0,0,152,99,0,0,160,115,0,0,0,0,0,0,0,0,0,0,176,99,0,0,168,115,0,0,0,0,0,0,0,0,0,0,200,99,0,0,192,121,0,0,0,0,0,0,0,0,0,0,224,99,0,0,128,118,0,0,0,0,0,0,0,0,0,0,248,99,0,0,128,118,0,0,0,0,0,0,0,0,0,0,16,100,0,0,0,0,0,0,40,100,0,0,0,0,0,0,80,100,0,0,0,0,0,0,120,100,0,0,0,0,0,0,160,100,0,0,0,0,0,0,248,100,0,0,0,0,0,0,24,101,0,0,192,117,0,0,0,0,0,0,0,0,0,0,48,101,0,0,192,117,0,0,0,0,0,0,224,86,0,0,72,101,0,0,0,0,0,0,2,0,0,0,24,123,0,0,2,0,0,0,192,122,0,0,2,36,0,0,0,0,0,0,96,101,0,0,24,123,0,0,0,0,0,0,0,0,0,0,120,101,0,0,128,118,0,0,0,0,0,0,0,0,0,0,144,101,0,0,24,123,0,0,0,0,0,0,0,0,0,0,168,101,0,0,0,0,0,0,192,101,0,0,192,117,0,0,0,0,0,0,0,0,0,0,208,101,0,0,24,123,0,0,0,0,0,0,0,0,0,0,224,101,0,0,16,118,0,0,0,0,0,0,0,0,0,0,240,101,0,0,16,118,0,0,0,0,0,0,0,0,0,0,0,102,0,0,80,121,0,0,0,0,0,0,0,0,0,0,16,102,0,0,192,117,0,0,0,0,0,0,0,0,0,0,32,102,0,0,192,117,0,0,0,0,0,0,0,0,0,0,48,102,0,0,24,123,0,0,0,0,0,0,0,0,0,0,64,102,0,0,16,118,0,0,0,0,0,0,0,0,0,0,80,102,0,0,24,123,0,0,0,0,0,0,0,0,0,0,96,102,0,0,192,117,0,0,0,0,0,0,0,0,0,0,112,102,0,0,24,123,0,0,0,0,0,0,0,0,0,0,128,102,0,0,192,117,0,0,0,0,0,0,0,0,0,0,144,102,0,0,96,121,0,0,0,0,0,0,0,0,0,0,160,102,0,0,144,121,0,0,0,0,0,0,0,0,0,0,176,102,0,0,16,118,0,0,0,0,0,0,0,0,0,0,192,102,0,0,0,0,0,0,208,102,0,0,24,123,0,0,0,0,0,0,224,86,0,0,224,102,0,0,0,0,0,0,2,0,0,0,192,117,0,0,2,0,0,0,176,122,0,0,2,28,0,0,0,0,0,0,240,102,0,0,208,121,0,0,0,0,0,0,0,0,0,0,0,103,0,0,24,123,0,0,0,0,0,0,224,86,0,0,16,103,0,0,0,0,0,0,2,0,0,0,24,123,0,0,2,0,0,0,224,122,0,0,2,36,0,0,0,0,0,0,32,103,0,0])
.concat([176,121,0,0,0,0,0,0,0,0,0,0,48,103,0,0,16,118,0,0,0,0,0,0,0,0,0,0,64,103,0,0,16,118,0,0,0,0,0,0,0,0,0,0,80,103,0,0,192,117,0,0,0,0,0,0,0,0,0,0,96,103,0,0,24,123,0,0,0,0,0,0,0,0,0,0,128,103,0,0,32,121,0,0,0,0,0,0,0,0,0,0,160,103,0,0,24,123,0,0,0,0,0,0,0,0,0,0,192,103,0,0,32,121,0,0,0,0,0,0,0,0,0,0,224,103,0,0,32,121,0,0,0,0,0,0,0,0,0,0,0,104,0,0,32,121,0,0,0,0,0,0,0,0,0,0,32,104,0,0,112,121,0,0,0,0,0,0,224,86,0,0,64,104,0,0,0,0,0,0,2,0,0,0,96,118,0,0,2,0,0,0,216,122,0,0,2,32,0,0,0,0,0,0,96,104,0,0,24,123,0,0,0,0,0,0,0,0,0,0,128,104,0,0,24,123,0,0,0,0,0,0,0,0,0,0,160,104,0,0,32,121,0,0,0,0,0,0,0,0,0,0,192,104,0,0,96,118,0,0,0,0,0,0,0,0,0,0,224,104,0,0,24,119,0,0,0,0,0,0,0,0,0,0,0,105,0,0,96,118,0,0,0,0,0,0,0,0,0,0,32,105,0,0,96,118,0,0,0,0,0,0,0,0,0,0,64,105,0,0,32,121,0,0,0,0,0,0,0,0,0,0,96,105,0,0,224,117,0,0,0,0,0,0,0,0,0,0,136,105,0,0,224,117,0,0,0,0,0,0,0,0,0,0,176,105,0,0,224,117,0,0,0,0,0,0,0,0,0,0,232,105,0,0,224,117,0,0,0,0,0,0,0,0,0,0,24,106,0,0,232,117,0,0,0,0,0,0,0,0,0,0,80,106,0,0,240,117,0,0,0,0,0,0,0,0,0,0,144,106,0,0,248,117,0,0,0,0,0,0,0,0,0,0,200,106,0,0,0,118,0,0,0,0,0,0,0,0,0,0,48,107,0,0,8,118,0,0,0,0,0,0,0,0,0,0,96,107,0,0,32,121,0,0,0,0,0,0,224,86,0,0,120,107,0,0,0,0,0,0,2,0,0,0,24,119,0,0,2,0,0,0,224,122,0,0,2,40,0,0,224,86,0,0,144,107,0,0,0,0,0,0,2,0,0,0,96,118,0,0,2,0,0,0,208,122,0,0,2,32,0,0,0,0,0,0,168,107,0,0,128,121,0,0,0,0,0,0,0,0,0,0,192,107,0,0,24,123,0,0,0,0,0,0,0,0,0,0,216,107,0,0,160,121,0,0,0,0,0,0,224,86,0,0,240,107,0,0,0,0,0,0,2,0,0,0,24,123,0,0,2,0,0,0,200,122,0,0,2,36,0,0,0,0,0,0,8,108,0,0,16,118,0,0,0,0,0,0,0,0,0,0,32,108,0,0,192,117,0,0,0,0,0,0,0,0,0,0,56,108,0,0,192,117,0,0,0,0,0,0,0,0,0,0,80,108,0,0,0,0,0,0,120,108,0,0,0,0,0,0,160,108,0,0,0,0,0,0,200,108,0,0,0,0,0,0,0,109,0,0,0,0,0,0,48,109,0,0,0,0,0,0,96,109,0,0,224,86,0,0,136,109,0,0,0,0,0,0,2,0,0,0,128,118,0,0,2,0,0,0,184,122,0,0,2,28,0,0,0,0,0,0,160,109,0,0,16,118,0,0,0,0,0,0,0,0,0,0,184,109,0,0,128,118,0,0,0,0,0,0,0,0,0,0,208,109,0,0,16,118,0,0,0,0,0,0,0,0,0,0,232,109,0,0,192,117,0,0,0,0,0,0,0,0,0,0,0,110,0,0,168,123,0,0,0,0,0,0,0,0,0,0,40,110,0,0,152,123,0,0,0,0,0,0,0,0,0,0,80,110,0,0,152,123,0,0,0,0,0,0,0,0,0,0,120,110,0,0,136,123,0,0,0,0,0,0,0,0,0,0,160,110,0,0,168,123,0,0,0,0,0,0,0,0,0,0,200,110,0,0,168,123,0,0,0,0,0,0,0,0,0,0,240,110,0,0,40,111,0,0,0,0,0,0,184,86,0,0,24,111,0,0,64,0,0,0,0,0,0,0,80,116,0,0,14,2,0,0,6,1,0,0,192,255,255,255,192,255,255,255,80,116,0,0,28,2,0,0,170,0,0,0,108,0,0,0,0,0,0,0,80,116,0,0,14,2,0,0,6,1,0,0,148,255,255,255,148,255,255,255,80,116,0,0,28,2,0,0,170,0,0,0,48,49,50,51,52,53,54,55,56,57,97,98,99,100,101,102,65,66,67,68,69,70,120,88,43,45,112,80,105,73,110,78,0,0,0,0,0,0,0,0,0,0,0,0,0,0,110,64,0,0,0,0,0,0,111,64,0,0,0,0,0,224,111,64,0,0,0,0,0,64,111,64,0,0,0,0,0,96,109,64,0,0,0,0,0,224,106,64,0,0,0,0,0,0,0,0,0,0,0,0,0,224,111,64,0,0,0,0,0,224,111,64,0,0,0,0,0,192,95,64,0,0,0,0,0,224,111,64,0,0,0,0,0,128,106,64,0,0,0,0,0,0,110,64,0,0,0,0,0,224,111,64,0,0,0,0,0,224,111,64,0,0,0,0,0,160,110,64,0,0,0,0,0,160,110,64,0,0,0,0,0,128,107,64,0,0,0,0,0,224,111,64,0,0,0,0,0,128,108,64,0,0,0,0,0,128,104,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,111,64,0,0,0,0,0,96,109,64,0,0,0,0,0,160,105,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,111,64,0,0,0,0,0,64,97,64,0,0,0,0,0,128,69,64,0,0,0,0,0,64,108,64,0,0,0,0,0,160,100,64,0,0,0,0,0,0,69,64,0,0,0,0,0,0,69,64,0,0,0,0,0,192,107,64,0,0,0,0,0,0,103,64,0,0,0,0,0,224,96,64,0,0,0,0,0,192,87,64,0,0,0,0,0,192,99,64,0,0,0,0,0,0,100,64,0,0,0,0,0,192,95,64,0,0,0,0,0,224,111,64,0,0,0,0,0,0,0,0,0,0,0,0,0,64,106,64,0,0,0,0,0,64,90,64,0,0,0,0,0,0,62,64,0,0,0,0,0,224,111,64,0,0,0,0,0,192,95,64,0,0,0,0,0,0,84,64,0,0,0,0,0,0,89,64,0,0,0,0,0,160,98,64,0,0,0,0,0,160,109,64,0,0,0,0,0,224,111,64,0,0,0,0,0,0,111,64,0,0,0,0,0,128,107,64,0,0,0,0,0,128,107,64,0,0,0,0,0,0,52,64,0,0,0,0,0,0,78,64,0,0,0,0,0,0,0,0,0,0,0,0,0,224,111,64,0,0,0,0,0,224,111,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,97,64,0,0,0,0,0,0,0,0,0,0,0,0,0,96,97,64,0,0,0,0,0,96,97,64,0,0,0,0,0,0,103,64,0,0,0,0,0,192,96,64,0,0,0,0,0,0,38,64,0,0,0,0,0,32,101,64,0,0,0,0,0,32,101,64,0,0,0,0,0,32,101,64,0,0,0,0,0,32,101,64,0,0,0,0,0,32,101,64,0,0,0,0,0,32,101,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,89,64,0,0,0,0,0,0,0,0,0,0,0,0,0,160,103,64,0,0,0,0,0,224,102,64,0,0,0,0,0,192,90,64,0,0,0,0,0,96,97,64,0,0,0,0,0,0,0,0,0,0,0,0,0,96,97,64,0,0,0,0,0,64,85,64,0,0,0,0,0,192,90,64,0,0,0,0,0,128,71,64,0,0,0,0,0,224,111,64,0,0,0,0,0,128,97,64,0,0,0,0,0,0,0,0,0,0,0,0,0,32,99,64,0,0,0,0,0,0,73,64,0,0,0,0,0,128,105,64,0,0,0,0,0,96,97,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,109,64,0,0,0,0,0,192,98,64,0,0,0,0,0,128,94,64,0,0,0,0,0,224,97,64,0,0,0,0,0,128,103,64,0,0,0,0,0,224,97,64,0,0,0,0,0,0,82,64,0,0,0,0,0,128,78,64,0,0,0,0,0,96,97,64,0,0,0,0,0,128,71,64,0,0,0,0,0,192,83,64,0,0,0,0,0,192,83,64,0,0,0,0,0,128,71,64,0,0,0,0,0,192,83,64,0,0,0,0,0,192,83,64,0,0,0,0,0,0,0,0,0,0,0,0,0,192,105,64,0,0,0,0,0,32,106,64,0,0,0,0,0,128,98,64,0,0,0,0,0,0,0,0,0,0,0,0,0,96,106,64,0,0,0,0,0,224,111,64,0,0,0,0,0,0,52,64,0,0,0,0,0,96,98,64,0,0,0,0,0,0,0,0,0,0,0,0,0,224,103,64,0,0,0,0,0,224,111,64,0,0,0,0,0,64,90,64,0,0,0,0,0,64,90,64,0,0,0,0,0,64,90,64,0,0,0,0,0,64,90,64,0,0,0,0,0,64,90,64,0,0,0,0,0,64,90,64,0,0,0,0,0,0,62,64,0,0,0,0,0,0,98,64,0,0,0,0,0,224,111,64,0,0,0,0,0,64,102,64,0,0,0,0,0,0,65,64,0,0,0,0,0,0,65,64,0,0,0,0,0,224,111,64,0,0,0,0,0,64,111,64,0,0,0,0,0,0,110,64,0,0,0,0,0,0,65,64,0,0,0,0,0,96,97,64,0,0,0,0,0,0,65,64,0,0,0,0,0,224,111,64,0,0,0,0,0,0,0,0,0,0,0,0,0,224,111,64,0,0,0,0,0,128,107,64,0,0,0,0,0,128,107,64,0,0,0,0,0,128,107,64,0,0,0,0,0,0,111,64,0,0,0,0,0,0,111,64,0,0,0,0,0,224,111,64,0,0,0,0,0,224,111,64,0,0,0,0,0,224,106,64,0,0,0,0,0,0,0,0,0,0,0,0,0,64,107,64,0,0,0,0,0,160,100,64,0,0,0,0,0,0,64,64,0,0,0,0,0,0,96,64,0,0,0,0,0,0,96,64,0,0,0,0,0,0,96,64,0,0,0,0,0,0,96,64,0,0,0,0,0,0,96,64,0,0,0,0,0,0,96,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,64,0,0,0,0,0,0,0,0,0,0,0,0,0,160,101,64,0,0,0,0,0,224,111,64,0,0,0,0,0,128,71,64,0,0,0,0,0,0,110,64,0,0,0,0,0,224,111,64,0,0,0,0,0,0,110,64,0,0,0,0,0,224,111,64,0,0,0,0,0,64,90,64,0,0,0,0,0,128,102,64,0,0,0,0,0,160,105,64,0,0,0,0,0,0,87,64,0,0,0,0,0,0,87,64,0,0,0,0,0,192,82,64,0,0,0,0,0,0,0,0,0,0,0,0,0,64,96,64,0,0,0,0,0,224,111,64,0,0,0,0,0,224,111,64,0,0,0,0,0,0,110,64,0,0,0,0,0,0,110,64,0,0,0,0,0,192,108,64,0,0,0,0,0,128,97,64,0,0,0,0,0,192,108,64,0,0,0,0,0,192,108,64,0,0,0,0,0,64,111,64,0,0,0,0,0,224,111,64,0,0,0,0,0,0,110,64,0,0,0,0,0,160,110,64,0,0,0,0,0,0,95,64,0,0,0,0,0,128,111,64,0,0,0,0,0,0,0,0,0,0,0,0,0,224,111,64,0,0,0,0,0,64,111,64,0,0,0,0,0,160,105,64,0,0,0,0,0,160,101,64,0,0,0,0,0,0,107,64,0,0,0,0,0,192,108,64,0,0,0,0,0,0,110,64,0,0,0,0,0,0,96,64,0,0,0,0,0,0,96,64,0,0,0,0,0,0,108,64,0,0,0,0,0,224,111,64,0,0,0,0,0,224,111,64,0,0,0,0,0,64,111,64,0,0,0,0,0,64,111,64,0,0,0,0,0,64,106,64,0,0,0,0,0,96,106,64,0,0,0,0,0,96,106,64,0,0,0,0,0,96,106,64,0,0,0,0,0,96,106,64,0,0,0,0,0,96,106,64,0,0,0,0,0,96,106,64,0,0,0,0,0,0,98,64,0,0,0,0,0,192,109,64,0,0,0,0,0,0,98,64,0,0,0,0,0,224,111,64,0,0,0,0,0,192,102,64,0,0,0,0,0,32,104,64,0,0,0,0,0,224,111,64,0,0,0,0,0,0,100,64,0,0,0,0,0,128,94,64,0,0,0,0,0,0,64,64,0,0,0,0,0,64,102,64,0,0,0,0,0,64,101,64,0,0,0,0,0,224,96,64,0,0,0,0,0,192,105,64,0,0,0,0,0,64,111,64,0,0,0,0,0,192,93,64,0,0,0,0,0,0,97,64,0,0,0,0,0,32,99,64,0,0,0,0,0,192,93,64,0,0,0,0,0,0,97,64,0,0,0,0,0,32,99,64,0,0,0,0,0,0,102,64,0,0,0,0,0,128,104,64,0,0,0,0,0,192,107,64,0,0,0,0,0,224,111,64,0,0,0,0,0,224,111,64,0,0,0,0,0,0,108,64,0,0,0,0,0,0,0,0,0,0,0,0,0,224,111,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,73,64,0,0,0,0,0,160,105,64,0,0,0,0,0,0,73,64,0,0,0,0,0,64,111,64,0,0,0,0,0,0,110,64,0,0,0,0,0,192,108,64,0,0,0,0,0,224,111,64,0,0,0,0,0,0,0,0,0,0,0,0,0,224,111,64,0,0,0,0,0,0,96,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,89,64,0,0,0,0,0,160,105,64,0,0,0,0,0,64,101,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,105,64,0,0,0,0,0,64,103,64,0,0,0,0,0,64,85,64,0,0,0,0,0,96,106,64,0,0,0,0,0,96,98,64,0,0,0,0,0,0,92,64,0,0,0,0,0,0,107,64,0,0,0,0,0,0,78,64,0,0,0,0,0,96,102,64,0,0,0,0,0,64,92,64,0,0,0,0,0,192,94,64,0,0,0,0,0,0,90,64,0,0,0,0,0,192,109,64,0,0,0,0,0,0,0,0,0,0,0,0,0,64,111,64,0,0,0,0,0,64,99,64,0,0,0,0,0,0,82,64,0,0,0,0,0,32,106,64,0,0,0,0,0,128,105,64,0,0,0,0,0,224,104,64,0,0,0,0,0,0,53,64,0,0,0,0,0,160,96,64,0,0,0,0,0,0,57,64,0,0,0,0,0,0,57,64,0,0,0,0,0,0,92,64,0,0,0,0,0,160,110,64,0,0,0,0,0,224,111,64,0,0,0,0,0,64,111,64,0,0,0,0,0,224,111,64,0,0,0,0,0,128,108,64,0,0,0,0,0,32,108,64,0,0,0,0,0,224,111,64,0,0,0,0,0,128,108,64,0,0,0,0,0,160,102,64,0,0,0,0,0,224,111,64,0,0,0,0,0,192,107,64,0,0,0,0,0,160,101,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,64,0,0,0,0,0,160,111,64,0,0,0,0,0,160,110,64,0,0,0,0,0,192,108,64,0,0,0,0,0,0,96,64,0,0,0,0,0,0,96,64,0,0,0,0,0,0,0,0,0,0,0,0,0,192,90,64,0,0,0,0,0,192,97,64,0,0,0,0,0,128,65,64,0,0,0,0,0,224,111,64,0,0,0,0,0,160,100,64,0,0,0,0,0,0,0,0,0,0,0,0,0,224,111,64,0,0,0,0,0,64,81,64,0,0,0,0,0,0,0,0,0,0,0,0,0,64,107,64,0,0,0,0,0,0,92,64,0,0,0,0,0,192,106,64,0,0,0,0,0,192,109,64,0,0,0,0,0,0,109,64,0,0,0,0,0,64,101,64,0,0,0,0,0,0,99,64,0,0,0,0,0,96,111,64,0,0,0,0,0,0,99,64,0,0,0,0,0,224,101,64,0,0,0,0,0,192,109,64,0,0,0,0,0,192,109,64,0,0,0,0,0,0,107,64,0,0,0,0,0,0,92,64,0,0,0,0,0,96,98,64,0,0,0,0,0,224,111,64,0,0,0,0,0,224,109,64,0,0,0,0,0,160,106,64,0,0,0,0,0,224,111,64,0,0,0,0,0,64,107,64,0,0,0,0,0,32,103,64,0,0,0,0,0,160,105,64,0,0,0,0,0,160,96,64,0,0,0,0,0,128,79,64,0,0,0,0,0,224,111,64,0,0,0,0,0,0,104,64,0,0,0,0,0,96,105,64,0,0,0,0,0,160,107,64,0,0,0,0,0,0,100,64,0,0,0,0,0,160,107,64,0,0,0,0,0,0,102,64,0,0,0,0,0,0,108,64,0,0,0,0,0,192,108,64,0,0,0,0,0,0,96,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,64,0,0,0,0,0,224,111,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,103,64,0,0,0,0,0,224,97,64,0,0,0,0,0,224,97,64,0,0,0,0,0,64,80,64,0,0,0,0,0,64,90,64,0,0,0,0,0,32,108,64,0,0,0,0,0,96,97,64,0,0,0,0,0,64,81,64,0,0,0,0,0,0,51,64,0,0,0,0,0,64,111,64,0,0,0,0,0,0,96,64,0,0,0,0,0,128,92,64,0,0,0,0,0,128,110,64,0,0,0,0,0,128,100,64,0,0,0,0,0,0,88,64,0,0,0,0,0,0,71,64,0,0,0,0,0,96,97,64,0,0,0,0,0,192,85,64,0,0,0,0,0,224,111,64,0,0,0,0,0,160,110,64,0,0,0,0,0,192,109,64,0,0,0,0,0,0,100,64,0,0,0,0,0,128,84,64,0,0,0,0,0,128,70,64,0,0,0,0,0,0,104,64,0,0,0,0,0,0,104,64,0,0,0,0,0,0,104,64,0,0,0,0,0,224,96,64,0,0,0,0,0,192,105,64,0,0,0,0,0,96,109,64,0,0,0,0,0,128,90,64,0,0,0,0,0,128,86,64,0,0,0,0,0,160,105,64,0,0,0,0,0,0,92,64,0,0,0,0,0,0,96,64,0,0,0,0,0,0,98,64,0,0,0,0,0,0,92,64,0,0,0,0,0,0,96,64,0,0,0,0,0,0,98,64,0,0,0,0,0,224,111,64,0,0,0,0,0,64,111,64,0,0,0,0,0,64,111,64,0,0,0,0,0,0,0,0,0,0,0,0,0,224,111,64,0,0,0,0,0,192,95,64,0,0,0,0,0,128,81,64,0,0,0,0,0,64,96,64,0,0,0,0,0,128,102,64,0,0,0,0,0,64,106,64,0,0,0,0,0,128,102,64,0,0,0,0,0,128,97,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,64,0,0,0,0,0,0,96,64,0,0,0,0,0,0,107,64,0,0,0,0,0,224,103,64,0,0,0,0,0,0,107,64,0,0,0,0,0,224,111,64,0,0,0,0,0,192,88,64,0,0,0,0,0,192,81,64,0,0,0,0,0,0,80,64,0,0,0,0,0,0,108,64,0,0,0,0,0,0,106,64,0,0,0,0,0,192,109,64,0,0,0,0,0,64,96,64,0,0,0,0,0,192,109,64,0,0,0,0,0,160,110,64,0,0,0,0,0,192,107,64,0,0,0,0,0,96,102,64,0,0,0,0,0,224,111,64,0,0,0,0,0,224,111,64,0,0,0,0,0,224,111,64,0,0,0,0,0,160,110,64,0,0,0,0,0,160,110,64,0,0,0,0,0,160,110,64,0,0,0,0,0,224,111,64,0,0,0,0,0,224,111,64,0,0,0,0,0,0,0,0,0,0,0,0,0,64,99,64,0,0,0,0,0,160,105,64,0,0,0,0,0,0,73,64,0,0,0,0,0,254,175,64,80,9,0,0,0,0,0,0,16,12,0,0,0,0,0,0,8,4,0,0,0,0,0,0,16,39,0,0,0,0,0,0,160,8,0,0,0,0,0,0,240,21,0,0,0,0,0,0,128,48,0,0,0,0,0,0,208,3,0,0,0,0,0,0,200,32,0,0,0,0,0,0,216,8,0,0,0,0,0,0,232,37,0,0,0,0,0,0,24,1,0,0,0,0,0,0,192,11,0,0,0,0,0,0,168,39,0,0,0,0,0,0,160,5,0,0,0,0,0,0,16,47,0,0,0,0,0,0,32,37,0,0,0,0,0,0,240,7,0,0,0,0,0,0,80,6,0,0,0,0,0,0,0,32,0,0,0,0,0,0,240,34,0,0,0,0,0,0,64,8,0,0,0,0,0,0,176,46,0,0,0,0,0,0,40,20,0,0,0,0,0,0,80,15,0,0,0,0,0,0,24,19,0,0,0,0,0,0,16,17,0,0,0,0,0,0,160,30,0,0,0,0,0,0,120,11,0,0,0,0,0,0,152,13,0,0,0,0,0,0,144,23,0,0,0,0,0,0,200,22,0,0,0,0,0,0,248,47,0,0,0,0,0,0,48,28,0,0,0,0,0,0,64,29,0,0,0,0,0,0,0,45,0,0,0,0,0,0,24,23,0,0,0,0,0,0,40,48,0,0,0,0,0,0,232,23,0,0,0,0,0,0,232,19,0,0,0,0,0,0,24,13,0,0,0,0,0,0,0,49,0,0,0,0,0,0,176,21,0,0,0,0,0,0,240,20,0,0,0,0,0,0,120,26,0,0,0,0,0,0,104,20,0,0,0,0,0,0,152,0,0,0,0,0,0,0,152,45,0,0,0,0,0,0,136,41,0,0,0,0,0,0,16,6,0,0,0,0,0,0,128,22,0,0,0,0,0,0,192,24,0,0,0,0,0,0,112,1,0,0,0,0,0,0,64,119,104,105,108,101,0,0,239,187,191,0,0,0,0,0,247,100,76,0,0,0,0,0,64,109,105,120,105,110,0,0,64,109,101,100,105,97,0,0,102,97,108,115,101,0,0,0,64,119,97,114,110,0,0,0,116,114,117,101,0,0,0,0,14,254,255,0,0,0,0,0,111,110,108,121,0,0,0,0,110,117,108,108,0,0,0,0,102,114,111,109,0,0,0,0,101,118,101,110,0,0,0,0,64,101,108,115,101,0,0,0,46,46,46,0,0,0,0,0,64,101,97,99,104,0,0,0,117,114,108,40,0,0,0,0,111,100,100,0,0,0,0,0,110,111,116,0,0,0,0,0,64,102,111,114,0,0,0,0,97,110,100,0,0,0,0,0,116,111,0,0,0,0,0,0,125,0,0,0,0,0,0,0,111,114,0,0,0,0,0,0,105,110,0,0,0,0,0,0,64,105,102,0,0,0,0,0,33,61,0,0,0,0,0,0,60,61,0,0,0,0,0,0,62,61,0,0,0,0,0,0,60,0,0,0,0,0,0,0,62,0,0,0,0,0,0,0,61,61,0,0,0,0,0,0,105,102,0,0,0,0,0,0,232,3,0,0,0,0,0,0,221,115,102,115,0,0,0,0,58,110,111,116,40,0,0,0,255,254,0,0,0,0,0,0,0,0,254,255,0,0,0,0,255,254,0,0,0,0,0,0,254,255,0,0,0,0,0,0,105,109,112,111,114,116,97,110,116,0,0,0,0,0,0,0,132,49,149,51,0,0,0,0,64,102,117,110,99,116,105,111,110,0,0,0,0,0,0,0,36,61,0,0,0,0,0,0,43,47,118,56,45,0,0,0,43,47,118,47,0,0,0,0,43,47,118,43,0,0,0,0,43,47,118,57,0,0,0,0,43,47,118,56,0,0,0,0,126,61,0,0,0,0,0,0,116,104,114,111,117,103,104,0,47,47,0,0,0,0,0,0,64,105,110,99,108,117,100,101,0,0,0,0,0,0,0,0,35,123,0,0,0,0,0,0,100,101,102,97,117,108,116,0,64,99,111,110,116,101,110,116,0,0,0,0,0,0,0,0,64,99,104,97,114,115,101,116,0,0,0,0,0,0,0,0,94,61,0,0,0,0,0,0,42,47,0,0,0,0,0,0,42,61,0,0,0,0,0,0,47,42,0,0,0,0,0,0,45,43,0,0,0,0,0,0,64,114,101,116,117,114,110,0,112,114,111,103,105,100,0,0,124,61,0,0,0,0,0,0,64,105,109,112,111,114,116,0,64,101,120,116,101,110,100,0,251,238,40,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,8,0,0,0,6,0,0,0,10,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,82,184,30,133,235,81,4,64,0,0,0,0,0,0,24,64,102,102,102,102,102,102,57,64,0,0,0,0,0,0,82,64,0,0,0,0,0,0,88,64,76,38,147,201,100,50,217,63,0,0,0,0,0,0,240,63,185,92,46,151,203,229,2,64,0,0,0,0,0,0,36,64,22,139,197,98,177,88,60,64,185,92,46,151,203,229,66,64,85,85,85,85,85,85,197,63,24,75,126,177,228,23,219,63,0,0,0,0,0,0,240,63,239,238,238,238,238,238,16,64,0,0,0,0,0,0,40,64,0,0,0,0,0,0,48,64,10,133,66,161,80,40,164,63,154,153,153,153,153,153,185,63,144,199,227,241,120,60,206,63,0,0,0,0,0,0,240,63,172,213,106,181,90,173,6,64,144,199,227,241,120,60,14,64,28,199,113,28,199,113,140,63,101,135,169,203,237,15,162,63,85,85,85,85,85,85,181,63,62,233,147,62,233,147,214,63,0,0,0,0,0,0,240,63,85,85,85,85,85,85,245,63,85,85,85,85,85,85,133,63,24,75,126,177,228,23,155,63,0,0,0,0,0,0,176,63,239,238,238,238,238,238,208,63,0,0,0,0,0,0,232,63,0,0,0,0,0,0,240,63,48,33,0,0,88,42,0,0,160,34,0,0,224,27,0,0,192,21,0,0,152,17,0,0,168,11,0,0,40,7,0,0,80,4,0,0,176,1,0,0,88,48,0,0,248,44,0,0,224,42,0,0,72,41,0,0,120,40,0,0,120,39,0,0,8,39,0,0,216,37,0,0,120,37,0,0,232,36,0,0,136,36,0,0,24,36,0,0,224,34,0,0,144,34,0,0,56,34,0,0,168,33,0,0,168,32,0,0,72,32,0,0,192,31,0,0,16,31,0,0,80,30,0,0,192,29,0,0,200,28,0,0,208,27,0,0,16,27,0,0,32,26,0,0,32,25,0,0,56,24,0,0,176,23,0,0,96,23,0,0,224,22,0,0,144,22,0,0,48,22,0,0,200,21,0,0,120,21,0,0,80,21,0,0,24,21,0,0,136,20,0,0,72,20,0,0,8,20,0,0,160,19,0,0,216,18,0,0,16,18,0,0,160,17,0,0,224,16,0,0,80,16,0,0,216,15,0,0,248,14,0,0,88,14,0,0,200,13,0,0,72,13,0,0,216,12,0,0,104,12,0,0,176,11,0,0,48,11,0,0,216,10,0,0,24,10,0,0,136,9,0,0,16,9,0,0,192,8,0,0,96,8,0,0,24,8,0,0,168,7,0,0,64,7,0,0,8,7,0,0,216,6,0,0,136,6,0,0,48,6,0,0,248,5,0,0,192,5,0,0,48,5,0,0,16,5,0,0,208,4,0,0,112,4,0,0,40,4,0,0,0,4,0,0,184,3,0,0,128,3,0,0,40,3,0,0,0,3,0,0,208,2,0,0,168,2,0,0,112,2,0,0,240,1,0,0,160,1,0,0,96,1,0,0,48,1,0,0,216,0,0,0,184,0,0,0,136,0,0,0,24,49,0,0,248,48,0,0,200,48,0,0,120,48,0,0,72,48,0,0,32,48,0,0,232,47,0,0,128,47,0,0,64,47,0,0,0,47,0,0,160,46,0,0,88,46,0,0,16,46,0,0,64,45,0,0,240,44,0,0,208,44,0,0,160,44,0,0,8,44,0,0,240,43,0,0,216,43,0,0,152,43,0,0,128,43,0,0,80,43,0,0,0,43,0,0,208,42,0,0,176,42,0,0,136,42,0,0,64,42,0,0,56,42,0,0,40,42,0,0,16,42,0,0,248,41,0,0,184,41,0,0,128,41,0,0,56,41,0,0,32,41,0,0,24,41,0,0,0,41,0,0,248,40,0,0,240,40,0,0,224,40,0,0,216,40,0,0,184,40,0,0,152,40,0,0,136,40,0,0,112,40,0,0,96,40,0,0,0,0,0,0])
, "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);
assert(tempDoublePtr % 8 == 0);
function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
}
function copyTempDouble(ptr) {
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];
  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];
  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];
  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];
}
  function ___gxx_personality_v0() {
    }
  function __ZSt18uncaught_exceptionv() { // std::uncaught_exception()
      return !!__ZSt18uncaught_exceptionv.uncaught_exception;
    }function ___cxa_begin_catch(ptr) {
      __ZSt18uncaught_exceptionv.uncaught_exception--;
      return ptr;
    }
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      Module['exit'](status);
    }function _exit(status) {
      __exit(status);
    }function __ZSt9terminatev() {
      _exit(-1234);
    }
  function ___cxa_bad_typeid() {
  Module['printErr']('missing function: __cxa_bad_typeid'); abort(-1);
  }
  function ___cxa_pure_virtual() {
      ABORT = true;
      throw 'Pure virtual function called!';
    }
  function ___cxa_call_unexpected(exception) {
      Module.printErr('Unexpected exception thrown, this is not properly supported - aborting');
      ABORT = true;
      throw exception;
    }
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
  function ___cxa_allocate_exception(size) {
      return _malloc(size);
    }
  function ___cxa_free_exception(ptr) {
      try {
        return _free(ptr);
      } catch(e) { // XXX FIXME
      }
    }
  function _llvm_eh_exception() {
      return HEAP32[((_llvm_eh_exception.buf)>>2)];
    }
  function ___cxa_is_number_type(type) {
      var isNumber = false;
      try { if (type == __ZTIi) isNumber = true } catch(e){}
      try { if (type == __ZTIj) isNumber = true } catch(e){}
      try { if (type == __ZTIl) isNumber = true } catch(e){}
      try { if (type == __ZTIm) isNumber = true } catch(e){}
      try { if (type == __ZTIx) isNumber = true } catch(e){}
      try { if (type == __ZTIy) isNumber = true } catch(e){}
      try { if (type == __ZTIf) isNumber = true } catch(e){}
      try { if (type == __ZTId) isNumber = true } catch(e){}
      try { if (type == __ZTIe) isNumber = true } catch(e){}
      try { if (type == __ZTIc) isNumber = true } catch(e){}
      try { if (type == __ZTIa) isNumber = true } catch(e){}
      try { if (type == __ZTIh) isNumber = true } catch(e){}
      try { if (type == __ZTIs) isNumber = true } catch(e){}
      try { if (type == __ZTIt) isNumber = true } catch(e){}
      return isNumber;
    }function ___cxa_does_inherit(definiteType, possibilityType, possibility) {
      if (possibility == 0) return false;
      if (possibilityType == 0 || possibilityType == definiteType)
        return true;
      var possibility_type_info;
      if (___cxa_is_number_type(possibilityType)) {
        possibility_type_info = possibilityType;
      } else {
        var possibility_type_infoAddr = HEAP32[((possibilityType)>>2)] - 8;
        possibility_type_info = HEAP32[((possibility_type_infoAddr)>>2)];
      }
      switch (possibility_type_info) {
      case 0: // possibility is a pointer
        // See if definite type is a pointer
        var definite_type_infoAddr = HEAP32[((definiteType)>>2)] - 8;
        var definite_type_info = HEAP32[((definite_type_infoAddr)>>2)];
        if (definite_type_info == 0) {
          // Also a pointer; compare base types of pointers
          var defPointerBaseAddr = definiteType+8;
          var defPointerBaseType = HEAP32[((defPointerBaseAddr)>>2)];
          var possPointerBaseAddr = possibilityType+8;
          var possPointerBaseType = HEAP32[((possPointerBaseAddr)>>2)];
          return ___cxa_does_inherit(defPointerBaseType, possPointerBaseType, possibility);
        } else
          return false; // one pointer and one non-pointer
      case 1: // class with no base class
        return false;
      case 2: // class with base class
        var parentTypeAddr = possibilityType + 8;
        var parentType = HEAP32[((parentTypeAddr)>>2)];
        return ___cxa_does_inherit(definiteType, parentType, possibility);
      default:
        return false; // some unencountered type
      }
    }
  function ___resumeException(ptr) {
      if (HEAP32[((_llvm_eh_exception.buf)>>2)] == 0) HEAP32[((_llvm_eh_exception.buf)>>2)]=ptr;
      throw ptr;;
    }function ___cxa_find_matching_catch(thrown, throwntype) {
      if (thrown == -1) thrown = HEAP32[((_llvm_eh_exception.buf)>>2)];
      if (throwntype == -1) throwntype = HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)];
      var typeArray = Array.prototype.slice.call(arguments, 2);
      // If throwntype is a pointer, this means a pointer has been
      // thrown. When a pointer is thrown, actually what's thrown
      // is a pointer to the pointer. We'll dereference it.
      if (throwntype != 0 && !___cxa_is_number_type(throwntype)) {
        var throwntypeInfoAddr= HEAP32[((throwntype)>>2)] - 8;
        var throwntypeInfo= HEAP32[((throwntypeInfoAddr)>>2)];
        if (throwntypeInfo == 0)
          thrown = HEAP32[((thrown)>>2)];
      }
      // The different catch blocks are denoted by different types.
      // Due to inheritance, those types may not precisely match the
      // type of the thrown object. Find one which matches, and
      // return the type of the catch block which should be called.
      for (var i = 0; i < typeArray.length; i++) {
        if (___cxa_does_inherit(typeArray[i], throwntype, thrown))
          return ((asm["setTempRet0"](typeArray[i]),thrown)|0);
      }
      // Shouldn't happen unless we have bogus data in typeArray
      // or encounter a type for which emscripten doesn't have suitable
      // typeinfo defined. Best-efforts match just in case.
      return ((asm["setTempRet0"](throwntype),thrown)|0);
    }function ___cxa_throw(ptr, type, destructor) {
      if (!___cxa_throw.initialized) {
        try {
          HEAP32[((__ZTVN10__cxxabiv119__pointer_type_infoE)>>2)]=0; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv117__class_type_infoE)>>2)]=1; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv120__si_class_type_infoE)>>2)]=2; // Workaround for libcxxabi integration bug
        } catch(e){}
        ___cxa_throw.initialized = true;
      }
      HEAP32[((_llvm_eh_exception.buf)>>2)]=ptr
      HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)]=type
      HEAP32[(((_llvm_eh_exception.buf)+(8))>>2)]=destructor
      if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
        __ZSt18uncaught_exceptionv.uncaught_exception = 1;
      } else {
        __ZSt18uncaught_exceptionv.uncaught_exception++;
      }
      throw ptr;;
    }
  Module["_memmove"] = _memmove;var _llvm_memmove_p0i8_p0i8_i32=_memmove;
  Module["_memcmp"] = _memcmp;
  var _llvm_memcpy_p0i8_p0i8_i64=_memcpy;
  function _llvm_lifetime_start() {}
  function _llvm_lifetime_end() {}
  function ___cxa_end_catch() {
      if (___cxa_end_catch.rethrown) {
        ___cxa_end_catch.rethrown = false;
        return;
      }
      // Clear state flag.
      asm['setThrew'](0);
      // Clear type.
      HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)]=0
      // Call destructor if one is registered then clear it.
      var ptr = HEAP32[((_llvm_eh_exception.buf)>>2)];
      var destructor = HEAP32[(((_llvm_eh_exception.buf)+(8))>>2)];
      if (destructor) {
        Runtime.dynCall('vi', destructor, [ptr]);
        HEAP32[(((_llvm_eh_exception.buf)+(8))>>2)]=0
      }
      // Free ptr if it isn't null.
      if (ptr) {
        ___cxa_free_exception(ptr);
        HEAP32[((_llvm_eh_exception.buf)>>2)]=0
      }
    }
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i32=_memset;
  Module["_strlen"] = _strlen;
  var _llvm_memset_p0i8_i64=_memset;
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value
      return value;
    }
  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  var MEMFS={ops_table:null,CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 0777, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            },
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.contents = [];
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },ensureFlexible:function (node) {
        if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
          var contents = node.contents;
          node.contents = Array.prototype.slice.call(contents);
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        }
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.contents.length;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.ensureFlexible(node);
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 0777 | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          var node = stream.node;
          node.timestamp = Date.now();
          var contents = node.contents;
          if (length && contents.length === 0 && position === 0 && buffer.subarray) {
            // just replace it with the new data
            if (canOwn && offset === 0) {
              node.contents = buffer; // this could be a subarray of Emscripten HEAP, or allocated from some other source.
              node.contentMode = (buffer.buffer === HEAP8.buffer) ? MEMFS.CONTENT_OWNING : MEMFS.CONTENT_FIXED;
            } else {
              node.contents = new Uint8Array(buffer.subarray(offset, offset+length));
              node.contentMode = MEMFS.CONTENT_FIXED;
            }
            return length;
          }
          MEMFS.ensureFlexible(node);
          var contents = node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.contents.length;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.ensureFlexible(stream.node);
          var contents = stream.node.contents;
          var limit = offset + length;
          while (limit > contents.length) contents.push(0);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  var IDBFS={dbs:{},indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },reconcile:function (src, dst, callback) {
        var total = 0;
        var create = {};
        for (var key in src.files) {
          if (!src.files.hasOwnProperty(key)) continue;
          var e = src.files[key];
          var e2 = dst.files[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create[key] = e;
            total++;
          }
        }
        var remove = {};
        for (var key in dst.files) {
          if (!dst.files.hasOwnProperty(key)) continue;
          var e = dst.files[key];
          var e2 = src.files[key];
          if (!e2) {
            remove[key] = e;
            total++;
          }
        }
        if (!total) {
          // early out
          return callback(null);
        }
        var completed = 0;
        function done(err) {
          if (err) return callback(err);
          if (++completed >= total) {
            return callback(null);
          }
        };
        // create a single transaction to handle and IDB reads / writes we'll need to do
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        transaction.onerror = function transaction_onerror() { callback(this.error); };
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
        for (var path in create) {
          if (!create.hasOwnProperty(path)) continue;
          var entry = create[path];
          if (dst.type === 'local') {
            // save file to local
            try {
              if (FS.isDir(entry.mode)) {
                FS.mkdir(path, entry.mode);
              } else if (FS.isFile(entry.mode)) {
                var stream = FS.open(path, 'w+', 0666);
                FS.write(stream, entry.contents, 0, entry.contents.length, 0, true /* canOwn */);
                FS.close(stream);
              }
              done(null);
            } catch (e) {
              return done(e);
            }
          } else {
            // save file to IDB
            var req = store.put(entry, path);
            req.onsuccess = function req_onsuccess() { done(null); };
            req.onerror = function req_onerror() { done(this.error); };
          }
        }
        for (var path in remove) {
          if (!remove.hasOwnProperty(path)) continue;
          var entry = remove[path];
          if (dst.type === 'local') {
            // delete file from local
            try {
              if (FS.isDir(entry.mode)) {
                // TODO recursive delete?
                FS.rmdir(path);
              } else if (FS.isFile(entry.mode)) {
                FS.unlink(path);
              }
              done(null);
            } catch (e) {
              return done(e);
            }
          } else {
            // delete file from IDB
            var req = store.delete(path);
            req.onsuccess = function req_onsuccess() { done(null); };
            req.onerror = function req_onerror() { done(this.error); };
          }
        }
      },getLocalSet:function (mount, callback) {
        var files = {};
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
        var check = FS.readdir(mount.mountpoint)
          .filter(isRealDir)
          .map(toAbsolute(mount.mountpoint));
        while (check.length) {
          var path = check.pop();
          var stat, node;
          try {
            var lookup = FS.lookupPath(path);
            node = lookup.node;
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path)
              .filter(isRealDir)
              .map(toAbsolute(path)));
            files[path] = { mode: stat.mode, timestamp: stat.mtime };
          } else if (FS.isFile(stat.mode)) {
            files[path] = { contents: node.contents, mode: stat.mode, timestamp: stat.mtime };
          } else {
            return callback(new Error('node type not supported'));
          }
        }
        return callback(null, { type: 'local', files: files });
      },getDB:function (name, callback) {
        // look it up in the cache
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        req.onupgradeneeded = function req_onupgradeneeded() {
          db = req.result;
          db.createObjectStore(IDBFS.DB_STORE_NAME);
        };
        req.onsuccess = function req_onsuccess() {
          db = req.result;
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function req_onerror() {
          callback(this.error);
        };
      },getRemoteSet:function (mount, callback) {
        var files = {};
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function transaction_onerror() { callback(this.error); };
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          store.openCursor().onsuccess = function store_openCursor_onsuccess(event) {
            var cursor = event.target.result;
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, files: files });
            }
            files[cursor.key] = cursor.value;
            cursor.continue();
          };
        });
      }};
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so 
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          return flags;
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.position = position;
          return position;
        }}};
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,mounts:[],devices:[null],streams:[null],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || { recurse_count: 0 };
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
        // start at the root
        var current = FS.root;
        var current_path = '/';
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            current = current.mount.root;
          }
          // follow symlinks
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
            this.parent = null;
            this.mount = null;
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            FS.hashAddNode(this);
          };
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
          FS.FSNode.prototype = {};
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); },
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); },
            },
          });
        }
        return new FS.FSNode(parent, name, mode, rdev);
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 1;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        if (stream.__proto__) {
          // reuse the object
          stream.__proto__ = FS.FSStream.prototype;
        } else {
          var newStream = new FS.FSStream();
          for (var p in stream) {
            newStream[p] = stream[p];
          }
          stream = newStream;
        }
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
        var completed = 0;
        var total = FS.mounts.length;
        function done(err) {
          if (err) {
            return callback(err);
          }
          if (++completed >= total) {
            callback(null);
          }
        };
        // sync all mounts
        for (var i = 0; i < FS.mounts.length; i++) {
          var mount = FS.mounts[i];
          if (!mount.type.syncfs) {
            done(null);
            continue;
          }
          mount.type.syncfs(mount, populate, done);
        }
      },mount:function (type, opts, mountpoint) {
        var lookup;
        if (mountpoint) {
          lookup = FS.lookupPath(mountpoint, { follow: false });
          mountpoint = lookup.path;  // use the absolute path
        }
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          root: null
        };
        // create a root node for the fs
        var root = type.mount(mount);
        root.mount = mount;
        mount.root = root;
        // assign the mount info to the mountpoint's node
        if (lookup) {
          lookup.node.mount = mount;
          lookup.node.mounted = true;
          // compatibility update FS.root if we mount to /
          if (mountpoint === '/') {
            FS.root = mount.root;
          }
        }
        // add to our cached list of mounts
        FS.mounts.push(mount);
        return root;
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 0666;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 0777;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 0666;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:function (path) {
        var lookup = FS.lookupPath(path, { follow: false });
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 0666 : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        } else {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0);
        } else {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=stdin.fd;
        assert(stdin.fd === 1, 'invalid handle for stdin (' + stdin.fd + ')');
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=stdout.fd;
        assert(stdout.fd === 2, 'invalid handle for stdout (' + stdout.fd + ')');
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=stderr.fd;
        assert(stderr.fd === 3, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
          this.stack = stackTrace();
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
        FS.nameTable = new Array(4096);
        FS.root = FS.createNode(null, '/', 16384 | 0777, 0);
        FS.mount(MEMFS, {}, '/');
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
        FS.ensureErrnoError();
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          function LazyUint8Array() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
              if (!hasByteServing) chunkSize = datalength;
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};function _getcwd(buf, size) {
      // char *getcwd(char *buf, size_t size);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/getcwd.html
      if (size == 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return 0;
      }
      var cwd = FS.cwd();
      if (size < cwd.length + 1) {
        ___setErrNo(ERRNO_CODES.ERANGE);
        return 0;
      } else {
        writeAsciiToMemory(cwd, buf);
        return buf;
      }
    }
  Module["_strcpy"] = _strcpy;
  function _fmod(x, y) {
      return x % y;
    }
  function _isspace(chr) {
      return (chr == 32) || (chr >= 9 && chr <= 13);
    }function __parseInt(str, endptr, base, min, max, bits, unsign) {
      // Skip space.
      while (_isspace(HEAP8[(str)])) str++;
      // Check for a plus/minus sign.
      var multiplier = 1;
      if (HEAP8[(str)] == 45) {
        multiplier = -1;
        str++;
      } else if (HEAP8[(str)] == 43) {
        str++;
      }
      // Find base.
      var finalBase = base;
      if (!finalBase) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            finalBase = 16;
            str += 2;
          } else {
            finalBase = 8;
            str++;
          }
        }
      } else if (finalBase==16) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            str += 2;
          }
        }
      }
      if (!finalBase) finalBase = 10;
      // Get digits.
      var chr;
      var ret = 0;
      while ((chr = HEAP8[(str)]) != 0) {
        var digit = parseInt(String.fromCharCode(chr), finalBase);
        if (isNaN(digit)) {
          break;
        } else {
          ret = ret * finalBase + digit;
          str++;
        }
      }
      // Apply sign.
      ret *= multiplier;
      // Set end pointer.
      if (endptr) {
        HEAP32[((endptr)>>2)]=str
      }
      // Unsign if needed.
      if (unsign) {
        if (Math.abs(ret) > max) {
          ret = max;
          ___setErrNo(ERRNO_CODES.ERANGE);
        } else {
          ret = unSign(ret, bits);
        }
      }
      // Validate range.
      if (ret > max || ret < min) {
        ret = ret > max ? max : min;
        ___setErrNo(ERRNO_CODES.ERANGE);
      }
      if (bits == 64) {
        return ((asm["setTempRet0"]((tempDouble=ret,(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)),ret>>>0)|0);
      }
      return ret;
    }function _strtol(str, endptr, base) {
      return __parseInt(str, endptr, base, -2147483648, 2147483647, 32);  // LONG_MIN, LONG_MAX.
    }
  function _stat(path, buf, dontResolveLastLink) {
      // http://pubs.opengroup.org/onlinepubs/7908799/xsh/stat.html
      // int stat(const char *path, struct stat *buf);
      // NOTE: dontResolveLastLink is a shortcut for lstat(). It should never be
      //       used in client code.
      path = typeof path !== 'string' ? Pointer_stringify(path) : path;
      try {
        var stat = dontResolveLastLink ? FS.lstat(path) : FS.stat(path);
        HEAP32[((buf)>>2)]=stat.dev;
        HEAP32[(((buf)+(4))>>2)]=0;
        HEAP32[(((buf)+(8))>>2)]=stat.ino;
        HEAP32[(((buf)+(12))>>2)]=stat.mode
        HEAP32[(((buf)+(16))>>2)]=stat.nlink
        HEAP32[(((buf)+(20))>>2)]=stat.uid
        HEAP32[(((buf)+(24))>>2)]=stat.gid
        HEAP32[(((buf)+(28))>>2)]=stat.rdev
        HEAP32[(((buf)+(32))>>2)]=0;
        HEAP32[(((buf)+(36))>>2)]=stat.size
        HEAP32[(((buf)+(40))>>2)]=4096
        HEAP32[(((buf)+(44))>>2)]=stat.blocks
        HEAP32[(((buf)+(48))>>2)]=Math.floor(stat.atime.getTime() / 1000)
        HEAP32[(((buf)+(52))>>2)]=0
        HEAP32[(((buf)+(56))>>2)]=Math.floor(stat.mtime.getTime() / 1000)
        HEAP32[(((buf)+(60))>>2)]=0
        HEAP32[(((buf)+(64))>>2)]=Math.floor(stat.ctime.getTime() / 1000)
        HEAP32[(((buf)+(68))>>2)]=0
        HEAP32[(((buf)+(72))>>2)]=stat.ino
        return 0;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }
  function _close(fildes) {
      // int close(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/close.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        FS.close(stream);
        return 0;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }
  function _fsync(fildes) {
      // int fsync(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fsync.html
      var stream = FS.getStream(fildes);
      if (stream) {
        // We write directly to the file system, so there's nothing to do here.
        return 0;
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }function _fclose(stream) {
      // int fclose(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fclose.html
      _fsync(stream);
      return _close(stream);
    }
  var _mkport=undefined;var SOCKFS={mount:function (mount) {
        return FS.createNode(null, '/', 16384 | 0777, 0);
      },createSocket:function (family, type, protocol) {
        var streaming = type == 1;
        if (protocol) {
          assert(streaming == (protocol == 6)); // if SOCK_STREAM, must be tcp
        }
        // create our internal socket structure
        var sock = {
          family: family,
          type: type,
          protocol: protocol,
          server: null,
          peers: {},
          pending: [],
          recv_queue: [],
          sock_ops: SOCKFS.websocket_sock_ops
        };
        // create the filesystem node to store the socket structure
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 49152, 0);
        node.sock = sock;
        // and the wrapping stream that enables library functions such
        // as read and write to indirectly interact with the socket
        var stream = FS.createStream({
          path: name,
          node: node,
          flags: FS.modeStringToFlags('r+'),
          seekable: false,
          stream_ops: SOCKFS.stream_ops
        });
        // map the new stream to the socket structure (sockets have a 1:1
        // relationship with a stream)
        sock.stream = stream;
        return sock;
      },getSocket:function (fd) {
        var stream = FS.getStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
          return null;
        }
        return stream.node.sock;
      },stream_ops:{poll:function (stream) {
          var sock = stream.node.sock;
          return sock.sock_ops.poll(sock);
        },ioctl:function (stream, request, varargs) {
          var sock = stream.node.sock;
          return sock.sock_ops.ioctl(sock, request, varargs);
        },read:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          var msg = sock.sock_ops.recvmsg(sock, length);
          if (!msg) {
            // socket is closed
            return 0;
          }
          buffer.set(msg.buffer, offset);
          return msg.buffer.length;
        },write:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          return sock.sock_ops.sendmsg(sock, buffer, offset, length);
        },close:function (stream) {
          var sock = stream.node.sock;
          sock.sock_ops.close(sock);
        }},nextname:function () {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return 'socket[' + (SOCKFS.nextname.current++) + ']';
      },websocket_sock_ops:{createPeer:function (sock, addr, port) {
          var ws;
          if (typeof addr === 'object') {
            ws = addr;
            addr = null;
            port = null;
          }
          if (ws) {
            // for sockets that've already connected (e.g. we're the server)
            // we can inspect the _socket property for the address
            if (ws._socket) {
              addr = ws._socket.remoteAddress;
              port = ws._socket.remotePort;
            }
            // if we're just now initializing a connection to the remote,
            // inspect the url property
            else {
              var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
              if (!result) {
                throw new Error('WebSocket URL must be in the format ws(s)://address:port');
              }
              addr = result[1];
              port = parseInt(result[2], 10);
            }
          } else {
            // create the actual websocket object and connect
            try {
              var url = 'ws://' + addr + ':' + port;
              // the node ws library API is slightly different than the browser's
              var opts = ENVIRONMENT_IS_NODE ? {headers: {'websocket-protocol': ['binary']}} : ['binary'];
              // If node we use the ws library.
              var WebSocket = ENVIRONMENT_IS_NODE ? require('ws') : window['WebSocket'];
              ws = new WebSocket(url, opts);
              ws.binaryType = 'arraybuffer';
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH);
            }
          }
          var peer = {
            addr: addr,
            port: port,
            socket: ws,
            dgram_send_queue: []
          };
          SOCKFS.websocket_sock_ops.addPeer(sock, peer);
          SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
          // if this is a bound dgram socket, send the port number first to allow
          // us to override the ephemeral port reported to us by remotePort on the
          // remote end.
          if (sock.type === 2 && typeof sock.sport !== 'undefined') {
            peer.dgram_send_queue.push(new Uint8Array([
                255, 255, 255, 255,
                'p'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 't'.charCodeAt(0),
                ((sock.sport & 0xff00) >> 8) , (sock.sport & 0xff)
            ]));
          }
          return peer;
        },getPeer:function (sock, addr, port) {
          return sock.peers[addr + ':' + port];
        },addPeer:function (sock, peer) {
          sock.peers[peer.addr + ':' + peer.port] = peer;
        },removePeer:function (sock, peer) {
          delete sock.peers[peer.addr + ':' + peer.port];
        },handlePeerEvents:function (sock, peer) {
          var first = true;
          var handleOpen = function () {
            try {
              var queued = peer.dgram_send_queue.shift();
              while (queued) {
                peer.socket.send(queued);
                queued = peer.dgram_send_queue.shift();
              }
            } catch (e) {
              // not much we can do here in the way of proper error handling as we've already
              // lied and said this data was sent. shut it down.
              peer.socket.close();
            }
          };
          function handleMessage(data) {
            assert(typeof data !== 'string' && data.byteLength !== undefined);  // must receive an ArrayBuffer
            data = new Uint8Array(data);  // make a typed array view on the array buffer
            // if this is the port message, override the peer's port with it
            var wasfirst = first;
            first = false;
            if (wasfirst &&
                data.length === 10 &&
                data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 &&
                data[4] === 'p'.charCodeAt(0) && data[5] === 'o'.charCodeAt(0) && data[6] === 'r'.charCodeAt(0) && data[7] === 't'.charCodeAt(0)) {
              // update the peer's port and it's key in the peer map
              var newport = ((data[8] << 8) | data[9]);
              SOCKFS.websocket_sock_ops.removePeer(sock, peer);
              peer.port = newport;
              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
              return;
            }
            sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
          };
          if (ENVIRONMENT_IS_NODE) {
            peer.socket.on('open', handleOpen);
            peer.socket.on('message', function(data, flags) {
              if (!flags.binary) {
                return;
              }
              handleMessage((new Uint8Array(data)).buffer);  // copy from node Buffer -> ArrayBuffer
            });
            peer.socket.on('error', function() {
              // don't throw
            });
          } else {
            peer.socket.onopen = handleOpen;
            peer.socket.onmessage = function peer_socket_onmessage(event) {
              handleMessage(event.data);
            };
          }
        },poll:function (sock) {
          if (sock.type === 1 && sock.server) {
            // listen sockets should only say they're available for reading
            // if there are pending clients.
            return sock.pending.length ? (64 | 1) : 0;
          }
          var mask = 0;
          var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
            SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
            null;
          if (sock.recv_queue.length ||
              !dest ||  // connection-less sockets are always ready to read
              (dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
            mask |= (64 | 1);
          }
          if (!dest ||  // connection-less sockets are always ready to write
              (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 4;
          }
          if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {
            mask |= 16;
          }
          return mask;
        },ioctl:function (sock, request, arg) {
          switch (request) {
            case 21531:
              var bytes = 0;
              if (sock.recv_queue.length) {
                bytes = sock.recv_queue[0].data.length;
              }
              HEAP32[((arg)>>2)]=bytes;
              return 0;
            default:
              return ERRNO_CODES.EINVAL;
          }
        },close:function (sock) {
          // if we've spawned a listen server, close it
          if (sock.server) {
            try {
              sock.server.close();
            } catch (e) {
            }
            sock.server = null;
          }
          // close any peer connections
          var peers = Object.keys(sock.peers);
          for (var i = 0; i < peers.length; i++) {
            var peer = sock.peers[peers[i]];
            try {
              peer.socket.close();
            } catch (e) {
            }
            SOCKFS.websocket_sock_ops.removePeer(sock, peer);
          }
          return 0;
        },bind:function (sock, addr, port) {
          if (typeof sock.saddr !== 'undefined' || typeof sock.sport !== 'undefined') {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already bound
          }
          sock.saddr = addr;
          sock.sport = port || _mkport();
          // in order to emulate dgram sockets, we need to launch a listen server when
          // binding on a connection-less socket
          // note: this is only required on the server side
          if (sock.type === 2) {
            // close the existing server if it exists
            if (sock.server) {
              sock.server.close();
              sock.server = null;
            }
            // swallow error operation not supported error that occurs when binding in the
            // browser where this isn't supported
            try {
              sock.sock_ops.listen(sock, 0);
            } catch (e) {
              if (!(e instanceof FS.ErrnoError)) throw e;
              if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e;
            }
          }
        },connect:function (sock, addr, port) {
          if (sock.server) {
            throw new FS.ErrnoError(ERRNO_CODS.EOPNOTSUPP);
          }
          // TODO autobind
          // if (!sock.addr && sock.type == 2) {
          // }
          // early out if we're already connected / in the middle of connecting
          if (typeof sock.daddr !== 'undefined' && typeof sock.dport !== 'undefined') {
            var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
            if (dest) {
              if (dest.socket.readyState === dest.socket.CONNECTING) {
                throw new FS.ErrnoError(ERRNO_CODES.EALREADY);
              } else {
                throw new FS.ErrnoError(ERRNO_CODES.EISCONN);
              }
            }
          }
          // add the socket to our peer list and set our
          // destination address / port to match
          var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
          sock.daddr = peer.addr;
          sock.dport = peer.port;
          // always "fail" in non-blocking mode
          throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS);
        },listen:function (sock, backlog) {
          if (!ENVIRONMENT_IS_NODE) {
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
          }
          if (sock.server) {
             throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already listening
          }
          var WebSocketServer = require('ws').Server;
          var host = sock.saddr;
          sock.server = new WebSocketServer({
            host: host,
            port: sock.sport
            // TODO support backlog
          });
          sock.server.on('connection', function(ws) {
            if (sock.type === 1) {
              var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
              // create a peer on the new socket
              var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
              newsock.daddr = peer.addr;
              newsock.dport = peer.port;
              // push to queue for accept to pick up
              sock.pending.push(newsock);
            } else {
              // create a peer on the listen socket so calling sendto
              // with the listen socket and an address will resolve
              // to the correct client
              SOCKFS.websocket_sock_ops.createPeer(sock, ws);
            }
          });
          sock.server.on('closed', function() {
            sock.server = null;
          });
          sock.server.on('error', function() {
            // don't throw
          });
        },accept:function (listensock) {
          if (!listensock.server) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var newsock = listensock.pending.shift();
          newsock.stream.flags = listensock.stream.flags;
          return newsock;
        },getname:function (sock, peer) {
          var addr, port;
          if (peer) {
            if (sock.daddr === undefined || sock.dport === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            }
            addr = sock.daddr;
            port = sock.dport;
          } else {
            // TODO saddr and sport will be set for bind()'d UDP sockets, but what
            // should we be returning for TCP sockets that've been connect()'d?
            addr = sock.saddr || 0;
            port = sock.sport || 0;
          }
          return { addr: addr, port: port };
        },sendmsg:function (sock, buffer, offset, length, addr, port) {
          if (sock.type === 2) {
            // connection-less sockets will honor the message address,
            // and otherwise fall back to the bound destination address
            if (addr === undefined || port === undefined) {
              addr = sock.daddr;
              port = sock.dport;
            }
            // if there was no address to fall back to, error out
            if (addr === undefined || port === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ);
            }
          } else {
            // connection-based sockets will only use the bound
            addr = sock.daddr;
            port = sock.dport;
          }
          // find the peer for the destination address
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
          // early out if not connected with a connection-based socket
          if (sock.type === 1) {
            if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            } else if (dest.socket.readyState === dest.socket.CONNECTING) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
          // create a copy of the incoming data to send, as the WebSocket API
          // doesn't work entirely with an ArrayBufferView, it'll just send
          // the entire underlying buffer
          var data;
          if (buffer instanceof Array || buffer instanceof ArrayBuffer) {
            data = buffer.slice(offset, offset + length);
          } else {  // ArrayBufferView
            data = buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + length);
          }
          // if we're emulating a connection-less dgram socket and don't have
          // a cached connection, queue the buffer to send upon connect and
          // lie, saying the data was sent now.
          if (sock.type === 2) {
            if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
              // if we're not connected, open a new connection
              if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
              }
              dest.dgram_send_queue.push(data);
              return length;
            }
          }
          try {
            // send the actual data
            dest.socket.send(data);
            return length;
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
        },recvmsg:function (sock, length) {
          // http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
          if (sock.type === 1 && sock.server) {
            // tcp servers should not be recv()'ing on the listen socket
            throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
          }
          var queued = sock.recv_queue.shift();
          if (!queued) {
            if (sock.type === 1) {
              var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
              if (!dest) {
                // if we have a destination address but are not connected, error out
                throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
              }
              else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                // return null if the socket has closed
                return null;
              }
              else {
                // else, our socket is in a valid state but truly has nothing available
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
            } else {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
          // queued.data will be an ArrayBuffer if it's unadulterated, but if it's
          // requeued TCP data it'll be an ArrayBufferView
          var queuedLength = queued.data.byteLength || queued.data.length;
          var queuedOffset = queued.data.byteOffset || 0;
          var queuedBuffer = queued.data.buffer || queued.data;
          var bytesRead = Math.min(length, queuedLength);
          var res = {
            buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
            addr: queued.addr,
            port: queued.port
          };
          // push back any unread data for TCP connections
          if (sock.type === 1 && bytesRead < queuedLength) {
            var bytesRemaining = queuedLength - bytesRead;
            queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
            sock.recv_queue.unshift(queued);
          }
          return res;
        }}};function _send(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _write(fd, buf, len);
    }
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var bytesWritten = _write(stream, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        var streamObj = FS.getStream(stream);
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }
  function _recv(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _read(fd, buf, len);
    }
  function _pread(fildes, buf, nbyte, offset) {
      // ssize_t pread(int fildes, void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.read(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _read(fildes, buf, nbyte) {
      // ssize_t read(int fildes, void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.read(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fread(ptr, size, nitems, stream) {
      // size_t fread(void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fread.html
      var bytesToRead = nitems * size;
      if (bytesToRead == 0) {
        return 0;
      }
      var bytesRead = 0;
      var streamObj = FS.getStream(stream);
      if (!streamObj) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return 0;
      }
      while (streamObj.ungotten.length && bytesToRead > 0) {
        HEAP8[((ptr++)|0)]=streamObj.ungotten.pop()
        bytesToRead--;
        bytesRead++;
      }
      var err = _read(stream, ptr, bytesToRead);
      if (err == -1) {
        if (streamObj) streamObj.error = true;
        return 0;
      }
      bytesRead += err;
      if (bytesRead < bytesToRead) streamObj.eof = true;
      return Math.floor(bytesRead / size);
    }
  function _lseek(fildes, offset, whence) {
      // off_t lseek(int fildes, off_t offset, int whence);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/lseek.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        return FS.llseek(stream, offset, whence);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fseek(stream, offset, whence) {
      // int fseek(FILE *stream, long offset, int whence);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fseek.html
      var ret = _lseek(stream, offset, whence);
      if (ret == -1) {
        return -1;
      }
      stream = FS.getStream(stream);
      stream.eof = false;
      return 0;
    }var _fseeko=_fseek;
  function _ftell(stream) {
      // long ftell(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ftell.html
      stream = FS.getStream(stream);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      if (FS.isChrdev(stream.node.mode)) {
        ___setErrNo(ERRNO_CODES.ESPIPE);
        return -1;
      } else {
        return stream.position;
      }
    }var _ftello=_ftell;
  function _open(path, oflag, varargs) {
      // int open(const char *path, int oflag, ...);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/open.html
      var mode = HEAP32[((varargs)>>2)];
      path = Pointer_stringify(path);
      try {
        var stream = FS.open(path, oflag, mode);
        return stream.fd;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fopen(filename, mode) {
      // FILE *fopen(const char *restrict filename, const char *restrict mode);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fopen.html
      var flags;
      mode = Pointer_stringify(mode);
      if (mode[0] == 'r') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 0;
        }
      } else if (mode[0] == 'w') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 1;
        }
        flags |= 64;
        flags |= 512;
      } else if (mode[0] == 'a') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 1;
        }
        flags |= 64;
        flags |= 1024;
      } else {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return 0;
      }
      var ret = _open(filename, flags, allocate([0x1FF, 0, 0, 0], 'i32', ALLOC_STACK));  // All creation permissions.
      return (ret == -1) ? 0 : ret;
    }
  var _floor=Math_floor;
  function _toupper(chr) {
      if (chr >= 97 && chr <= 122) {
        return chr - 97 + 65;
      } else {
        return chr;
      }
    }
  var _ceil=Math_ceil;
  var _fabs=Math_abs;
  function _llvm_eh_typeid_for(type) {
      return type;
    }
  function _isalpha(chr) {
      return (chr >= 97 && chr <= 122) ||
             (chr >= 65 && chr <= 90);
    }
  function _isxdigit(chr) {
      return (chr >= 48 && chr <= 57) ||
             (chr >= 97 && chr <= 102) ||
             (chr >= 65 && chr <= 70);
    }
  function _isalnum(chr) {
      return (chr >= 48 && chr <= 57) ||
             (chr >= 97 && chr <= 122) ||
             (chr >= 65 && chr <= 90);
    }
  function _strdup(ptr) {
      var len = _strlen(ptr);
      var newStr = _malloc(len + 1);
      (_memcpy(newStr, ptr, len)|0);
      HEAP8[(((newStr)+(len))|0)]=0;
      return newStr;
    }
  function _pthread_mutex_lock() {}
  function _pthread_mutex_unlock() {}
  function ___cxa_guard_acquire(variable) {
      if (!HEAP8[(variable)]) { // ignore SAFE_HEAP stuff because llvm mixes i64 and i8 here
        HEAP8[(variable)]=1;
        return 1;
      }
      return 0;
    }
  function ___cxa_guard_release() {}
  function _pthread_cond_broadcast() {
      return 0;
    }
  function _pthread_cond_wait() {
      return 0;
    }
  function _atexit(func, arg) {
      __ATEXIT__.unshift({ func: func, arg: arg });
    }var ___cxa_atexit=_atexit;
  function _ungetc(c, stream) {
      // int ungetc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ungetc.html
      stream = FS.getStream(stream);
      if (!stream) {
        return -1;
      }
      if (c === -1) {
        // do nothing for EOF character
        return c;
      }
      c = unSign(c & 0xFF);
      stream.ungotten.push(c);
      stream.eof = false;
      return c;
    }
  function _fgetc(stream) {
      // int fgetc(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fgetc.html
      var streamObj = FS.getStream(stream);
      if (!streamObj) return -1;
      if (streamObj.eof || streamObj.error) return -1;
      var ret = _fread(_fgetc.ret, 1, 1, stream);
      if (ret == 0) {
        return -1;
      } else if (ret == -1) {
        streamObj.error = true;
        return -1;
      } else {
        return HEAPU8[((_fgetc.ret)|0)];
      }
    }var _getc=_fgetc;
  function ___errno_location() {
      return ___errno_state;
    }
  function _strerror_r(errnum, strerrbuf, buflen) {
      if (errnum in ERRNO_MESSAGES) {
        if (ERRNO_MESSAGES[errnum].length > buflen - 1) {
          return ___setErrNo(ERRNO_CODES.ERANGE);
        } else {
          var msg = ERRNO_MESSAGES[errnum];
          writeAsciiToMemory(msg, strerrbuf);
          return 0;
        }
      } else {
        return ___setErrNo(ERRNO_CODES.EINVAL);
      }
    }function _strerror(errnum) {
      if (!_strerror.buffer) _strerror.buffer = _malloc(256);
      _strerror_r(errnum, _strerror.buffer, 256);
      return _strerror.buffer;
    }
  function _abort() {
      Module['abort']();
    }
  function ___cxa_rethrow() {
      ___cxa_end_catch.rethrown = true;
      throw HEAP32[((_llvm_eh_exception.buf)>>2)];;
    }
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = HEAPF64[(((varargs)+(argIndex))>>3)];
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+8))>>2)]];
          argIndex += 8; // each 32-bit chunk is in a 64-bit block
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
        return ret;
      }
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          var flagPadSign = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              case 32:
                flagPadSign = true;
                break;
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
          // Handle precision.
          var precisionSet = false;
          if (next == 46) {
            var precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          } else {
            var precision = 6; // Standard default.
          }
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
              // Add sign if needed
              if (currArg >= 0) {
                if (flagAlwaysSigned) {
                  prefix = '+' + prefix;
                } else if (flagPadSign) {
                  prefix = ' ' + prefix;
                }
              }
              // Move sign to prefix so we zero-pad after the sign
              if (argText.charAt(0) == '-') {
                prefix = '-' + prefix;
                argText = argText.substr(1);
              }
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
                // Add sign.
                if (currArg >= 0) {
                  if (flagAlwaysSigned) {
                    argText = '+' + argText;
                  } else if (flagPadSign) {
                    argText = ' ' + argText;
                  }
                }
              }
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP32[((s)>>2)]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP8[(((s)+(i))|0)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP8[(((s)+(i))|0)]=0;
      return result.length;
    }
  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 79:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }
  function ___cxa_guard_abort() {}
  var _isxdigit_l=_isxdigit;
  function _isdigit(chr) {
      return chr >= 48 && chr <= 57;
    }var _isdigit_l=_isdigit;
  function __getFloat(text) {
      return /^[+-]?[0-9]*\.?[0-9]+([eE][+-]?[0-9]+)?/.exec(text);
    }function __scanString(format, get, unget, varargs) {
      if (!__scanString.whiteSpace) {
        __scanString.whiteSpace = {};
        __scanString.whiteSpace[32] = 1;
        __scanString.whiteSpace[9] = 1;
        __scanString.whiteSpace[10] = 1;
        __scanString.whiteSpace[11] = 1;
        __scanString.whiteSpace[12] = 1;
        __scanString.whiteSpace[13] = 1;
      }
      // Supports %x, %4x, %d.%d, %lld, %s, %f, %lf.
      // TODO: Support all format specifiers.
      format = Pointer_stringify(format);
      var soFar = 0;
      if (format.indexOf('%n') >= 0) {
        // need to track soFar
        var _get = get;
        get = function get() {
          soFar++;
          return _get();
        }
        var _unget = unget;
        unget = function unget() {
          soFar--;
          return _unget();
        }
      }
      var formatIndex = 0;
      var argsi = 0;
      var fields = 0;
      var argIndex = 0;
      var next;
      mainLoop:
      for (var formatIndex = 0; formatIndex < format.length;) {
        if (format[formatIndex] === '%' && format[formatIndex+1] == 'n') {
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getAlignSize('void*', null, true);
          HEAP32[((argPtr)>>2)]=soFar;
          formatIndex += 2;
          continue;
        }
        if (format[formatIndex] === '%') {
          var nextC = format.indexOf('c', formatIndex+1);
          if (nextC > 0) {
            var maxx = 1;
            if (nextC > formatIndex+1) {
              var sub = format.substring(formatIndex+1, nextC);
              maxx = parseInt(sub);
              if (maxx != sub) maxx = 0;
            }
            if (maxx) {
              var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
              argIndex += Runtime.getAlignSize('void*', null, true);
              fields++;
              for (var i = 0; i < maxx; i++) {
                next = get();
                HEAP8[((argPtr++)|0)]=next;
              }
              formatIndex += nextC - formatIndex + 1;
              continue;
            }
          }
        }
        // handle %[...]
        if (format[formatIndex] === '%' && format.indexOf('[', formatIndex+1) > 0) {
          var match = /\%([0-9]*)\[(\^)?(\]?[^\]]*)\]/.exec(format.substring(formatIndex));
          if (match) {
            var maxNumCharacters = parseInt(match[1]) || Infinity;
            var negateScanList = (match[2] === '^');
            var scanList = match[3];
            // expand "middle" dashs into character sets
            var middleDashMatch;
            while ((middleDashMatch = /([^\-])\-([^\-])/.exec(scanList))) {
              var rangeStartCharCode = middleDashMatch[1].charCodeAt(0);
              var rangeEndCharCode = middleDashMatch[2].charCodeAt(0);
              for (var expanded = ''; rangeStartCharCode <= rangeEndCharCode; expanded += String.fromCharCode(rangeStartCharCode++));
              scanList = scanList.replace(middleDashMatch[1] + '-' + middleDashMatch[2], expanded);
            }
            var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
            argIndex += Runtime.getAlignSize('void*', null, true);
            fields++;
            for (var i = 0; i < maxNumCharacters; i++) {
              next = get();
              if (negateScanList) {
                if (scanList.indexOf(String.fromCharCode(next)) < 0) {
                  HEAP8[((argPtr++)|0)]=next;
                } else {
                  unget();
                  break;
                }
              } else {
                if (scanList.indexOf(String.fromCharCode(next)) >= 0) {
                  HEAP8[((argPtr++)|0)]=next;
                } else {
                  unget();
                  break;
                }
              }
            }
            // write out null-terminating character
            HEAP8[((argPtr++)|0)]=0;
            formatIndex += match[0].length;
            continue;
          }
        }      
        // remove whitespace
        while (1) {
          next = get();
          if (next == 0) return fields;
          if (!(next in __scanString.whiteSpace)) break;
        }
        unget();
        if (format[formatIndex] === '%') {
          formatIndex++;
          var suppressAssignment = false;
          if (format[formatIndex] == '*') {
            suppressAssignment = true;
            formatIndex++;
          }
          var maxSpecifierStart = formatIndex;
          while (format[formatIndex].charCodeAt(0) >= 48 &&
                 format[formatIndex].charCodeAt(0) <= 57) {
            formatIndex++;
          }
          var max_;
          if (formatIndex != maxSpecifierStart) {
            max_ = parseInt(format.slice(maxSpecifierStart, formatIndex), 10);
          }
          var long_ = false;
          var half = false;
          var longLong = false;
          if (format[formatIndex] == 'l') {
            long_ = true;
            formatIndex++;
            if (format[formatIndex] == 'l') {
              longLong = true;
              formatIndex++;
            }
          } else if (format[formatIndex] == 'h') {
            half = true;
            formatIndex++;
          }
          var type = format[formatIndex];
          formatIndex++;
          var curr = 0;
          var buffer = [];
          // Read characters according to the format. floats are trickier, they may be in an unfloat state in the middle, then be a valid float later
          if (type == 'f' || type == 'e' || type == 'g' ||
              type == 'F' || type == 'E' || type == 'G') {
            next = get();
            while (next > 0 && (!(next in __scanString.whiteSpace)))  {
              buffer.push(String.fromCharCode(next));
              next = get();
            }
            var m = __getFloat(buffer.join(''));
            var last = m ? m[0].length : 0;
            for (var i = 0; i < buffer.length - last + 1; i++) {
              unget();
            }
            buffer.length = last;
          } else {
            next = get();
            var first = true;
            // Strip the optional 0x prefix for %x.
            if ((type == 'x' || type == 'X') && (next == 48)) {
              var peek = get();
              if (peek == 120 || peek == 88) {
                next = get();
              } else {
                unget();
              }
            }
            while ((curr < max_ || isNaN(max_)) && next > 0) {
              if (!(next in __scanString.whiteSpace) && // stop on whitespace
                  (type == 's' ||
                   ((type === 'd' || type == 'u' || type == 'i') && ((next >= 48 && next <= 57) ||
                                                                     (first && next == 45))) ||
                   ((type === 'x' || type === 'X') && (next >= 48 && next <= 57 ||
                                     next >= 97 && next <= 102 ||
                                     next >= 65 && next <= 70))) &&
                  (formatIndex >= format.length || next !== format[formatIndex].charCodeAt(0))) { // Stop when we read something that is coming up
                buffer.push(String.fromCharCode(next));
                next = get();
                curr++;
                first = false;
              } else {
                break;
              }
            }
            unget();
          }
          if (buffer.length === 0) return 0;  // Failure.
          if (suppressAssignment) continue;
          var text = buffer.join('');
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getAlignSize('void*', null, true);
          switch (type) {
            case 'd': case 'u': case 'i':
              if (half) {
                HEAP16[((argPtr)>>1)]=parseInt(text, 10);
              } else if (longLong) {
                (tempI64 = [parseInt(text, 10)>>>0,(tempDouble=parseInt(text, 10),(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)],HEAP32[((argPtr)>>2)]=tempI64[0],HEAP32[(((argPtr)+(4))>>2)]=tempI64[1]);
              } else {
                HEAP32[((argPtr)>>2)]=parseInt(text, 10);
              }
              break;
            case 'X':
            case 'x':
              HEAP32[((argPtr)>>2)]=parseInt(text, 16)
              break;
            case 'F':
            case 'f':
            case 'E':
            case 'e':
            case 'G':
            case 'g':
            case 'E':
              // fallthrough intended
              if (long_) {
                HEAPF64[((argPtr)>>3)]=parseFloat(text)
              } else {
                HEAPF32[((argPtr)>>2)]=parseFloat(text)
              }
              break;
            case 's':
              var array = intArrayFromString(text);
              for (var j = 0; j < array.length; j++) {
                HEAP8[(((argPtr)+(j))|0)]=array[j]
              }
              break;
          }
          fields++;
        } else if (format[formatIndex].charCodeAt(0) in __scanString.whiteSpace) {
          next = get();
          while (next in __scanString.whiteSpace) {
            if (next <= 0) break mainLoop;  // End of input.
            next = get();
          }
          unget(next);
          formatIndex++;
        } else {
          // Not a specifier.
          next = get();
          if (format[formatIndex].charCodeAt(0) !== next) {
            unget(next);
            break mainLoop;
          }
          formatIndex++;
        }
      }
      return fields;
    }function _sscanf(s, format, varargs) {
      // int sscanf(const char *restrict s, const char *restrict format, ... );
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/scanf.html
      var index = 0;
      function get() { return HEAP8[(((s)+(index++))|0)]; };
      function unget() { index--; };
      return __scanString(format, get, unget, varargs);
    }
  function _catopen() { throw 'TODO: ' + aborter }
  function _catgets() { throw 'TODO: ' + aborter }
  function _catclose() { throw 'TODO: ' + aborter }
  function _newlocale(mask, locale, base) {
      return _malloc(4);
    }
  function _freelocale(locale) {
      _free(locale);
    }
  function _isascii(chr) {
      return chr >= 0 && (chr & 0x80) == 0;
    }
  function ___ctype_b_loc() {
      // http://refspecs.freestandards.org/LSB_3.0.0/LSB-Core-generic/LSB-Core-generic/baselib---ctype-b-loc.html
      var me = ___ctype_b_loc;
      if (!me.ret) {
        var values = [
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,8195,8194,8194,8194,8194,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,24577,49156,49156,49156,
          49156,49156,49156,49156,49156,49156,49156,49156,49156,49156,49156,49156,55304,55304,55304,55304,55304,55304,55304,55304,
          55304,55304,49156,49156,49156,49156,49156,49156,49156,54536,54536,54536,54536,54536,54536,50440,50440,50440,50440,50440,
          50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,49156,49156,49156,49156,49156,
          49156,54792,54792,54792,54792,54792,54792,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,
          50696,50696,50696,50696,50696,50696,50696,49156,49156,49156,49156,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
        ];
        var i16size = 2;
        var arr = _malloc(values.length * i16size);
        for (var i = 0; i < values.length; i++) {
          HEAP16[(((arr)+(i * i16size))>>1)]=values[i]
        }
        me.ret = allocate([arr + 128 * i16size], 'i16*', ALLOC_NORMAL);
      }
      return me.ret;
    }
  function ___ctype_tolower_loc() {
      // http://refspecs.freestandards.org/LSB_3.1.1/LSB-Core-generic/LSB-Core-generic/libutil---ctype-tolower-loc.html
      var me = ___ctype_tolower_loc;
      if (!me.ret) {
        var values = [
          128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,
          158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,
          188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,
          218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,
          248,249,250,251,252,253,254,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,
          33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,97,98,99,100,101,102,103,
          104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,91,92,93,94,95,96,97,98,99,100,101,102,103,
          104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,
          134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,
          164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,
          194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,
          224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,
          254,255
        ];
        var i32size = 4;
        var arr = _malloc(values.length * i32size);
        for (var i = 0; i < values.length; i++) {
          HEAP32[(((arr)+(i * i32size))>>2)]=values[i]
        }
        me.ret = allocate([arr + 128 * i32size], 'i32*', ALLOC_NORMAL);
      }
      return me.ret;
    }
  function ___ctype_toupper_loc() {
      // http://refspecs.freestandards.org/LSB_3.1.1/LSB-Core-generic/LSB-Core-generic/libutil---ctype-toupper-loc.html
      var me = ___ctype_toupper_loc;
      if (!me.ret) {
        var values = [
          128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,
          158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,
          188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,
          218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,
          248,249,250,251,252,253,254,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,
          33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,
          73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,
          81,82,83,84,85,86,87,88,89,90,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,
          145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,
          175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,
          205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,
          235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255
        ];
        var i32size = 4;
        var arr = _malloc(values.length * i32size);
        for (var i = 0; i < values.length; i++) {
          HEAP32[(((arr)+(i * i32size))>>2)]=values[i]
        }
        me.ret = allocate([arr + 128 * i32size], 'i32*', ALLOC_NORMAL);
      }
      return me.ret;
    }
  function __isLeapYear(year) {
        return year%4 === 0 && (year%100 !== 0 || year%400 === 0);
    }
  function __arraySum(array, index) {
      var sum = 0;
      for (var i = 0; i <= index; sum += array[i++]);
      return sum;
    }
  var __MONTH_DAYS_LEAP=[31,29,31,30,31,30,31,31,30,31,30,31];
  var __MONTH_DAYS_REGULAR=[31,28,31,30,31,30,31,31,30,31,30,31];function __addDays(date, days) {
      var newDate = new Date(date.getTime());
      while(days > 0) {
        var leap = __isLeapYear(newDate.getFullYear());
        var currentMonth = newDate.getMonth();
        var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
        if (days > daysInCurrentMonth-newDate.getDate()) {
          // we spill over to next month
          days -= (daysInCurrentMonth-newDate.getDate()+1);
          newDate.setDate(1);
          if (currentMonth < 11) {
            newDate.setMonth(currentMonth+1)
          } else {
            newDate.setMonth(0);
            newDate.setFullYear(newDate.getFullYear()+1);
          }
        } else {
          // we stay in current month 
          newDate.setDate(newDate.getDate()+days);
          return newDate;
        }
      }
      return newDate;
    }function _strftime(s, maxsize, format, tm) {
      // size_t strftime(char *restrict s, size_t maxsize, const char *restrict format, const struct tm *restrict timeptr);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/strftime.html
      var date = {
        tm_sec: HEAP32[((tm)>>2)],
        tm_min: HEAP32[(((tm)+(4))>>2)],
        tm_hour: HEAP32[(((tm)+(8))>>2)],
        tm_mday: HEAP32[(((tm)+(12))>>2)],
        tm_mon: HEAP32[(((tm)+(16))>>2)],
        tm_year: HEAP32[(((tm)+(20))>>2)],
        tm_wday: HEAP32[(((tm)+(24))>>2)],
        tm_yday: HEAP32[(((tm)+(28))>>2)],
        tm_isdst: HEAP32[(((tm)+(32))>>2)]
      };
      var pattern = Pointer_stringify(format);
      // expand format
      var EXPANSION_RULES_1 = {
        '%c': '%a %b %d %H:%M:%S %Y',     // Replaced by the locale's appropriate date and time representation - e.g., Mon Aug  3 14:02:01 2013
        '%D': '%m/%d/%y',                 // Equivalent to %m / %d / %y
        '%F': '%Y-%m-%d',                 // Equivalent to %Y - %m - %d
        '%h': '%b',                       // Equivalent to %b
        '%r': '%I:%M:%S %p',              // Replaced by the time in a.m. and p.m. notation
        '%R': '%H:%M',                    // Replaced by the time in 24-hour notation
        '%T': '%H:%M:%S',                 // Replaced by the time
        '%x': '%m/%d/%y',                 // Replaced by the locale's appropriate date representation
        '%X': '%H:%M:%S',                 // Replaced by the locale's appropriate date representation
      };
      for (var rule in EXPANSION_RULES_1) {
        pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_1[rule]);
      }
      var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      function leadingSomething(value, digits, character) {
        var str = typeof value === 'number' ? value.toString() : (value || '');
        while (str.length < digits) {
          str = character[0]+str;
        }
        return str;
      };
      function leadingNulls(value, digits) {
        return leadingSomething(value, digits, '0');
      };
      function compareByDay(date1, date2) {
        function sgn(value) {
          return value < 0 ? -1 : (value > 0 ? 1 : 0);
        };
        var compare;
        if ((compare = sgn(date1.getFullYear()-date2.getFullYear())) === 0) {
          if ((compare = sgn(date1.getMonth()-date2.getMonth())) === 0) {
            compare = sgn(date1.getDate()-date2.getDate());
          }
        }
        return compare;
      };
      function getFirstWeekStartDate(janFourth) {
          switch (janFourth.getDay()) {
            case 0: // Sunday
              return new Date(janFourth.getFullYear()-1, 11, 29);
            case 1: // Monday
              return janFourth;
            case 2: // Tuesday
              return new Date(janFourth.getFullYear(), 0, 3);
            case 3: // Wednesday
              return new Date(janFourth.getFullYear(), 0, 2);
            case 4: // Thursday
              return new Date(janFourth.getFullYear(), 0, 1);
            case 5: // Friday
              return new Date(janFourth.getFullYear()-1, 11, 31);
            case 6: // Saturday
              return new Date(janFourth.getFullYear()-1, 11, 30);
          }
      };
      function getWeekBasedYear(date) {
          var thisDate = __addDays(new Date(date.tm_year+1900, 0, 1), date.tm_yday);
          var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
          var janFourthNextYear = new Date(thisDate.getFullYear()+1, 0, 4);
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
          if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
            // this date is after the start of the first week of this year
            if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
              return thisDate.getFullYear()+1;
            } else {
              return thisDate.getFullYear();
            }
          } else { 
            return thisDate.getFullYear()-1;
          }
      };
      var EXPANSION_RULES_2 = {
        '%a': function(date) {
          return WEEKDAYS[date.tm_wday].substring(0,3);
        },
        '%A': function(date) {
          return WEEKDAYS[date.tm_wday];
        },
        '%b': function(date) {
          return MONTHS[date.tm_mon].substring(0,3);
        },
        '%B': function(date) {
          return MONTHS[date.tm_mon];
        },
        '%C': function(date) {
          var year = date.tm_year+1900;
          return leadingNulls(Math.floor(year/100),2);
        },
        '%d': function(date) {
          return leadingNulls(date.tm_mday, 2);
        },
        '%e': function(date) {
          return leadingSomething(date.tm_mday, 2, ' ');
        },
        '%g': function(date) {
          // %g, %G, and %V give values according to the ISO 8601:2000 standard week-based year. 
          // In this system, weeks begin on a Monday and week 1 of the year is the week that includes 
          // January 4th, which is also the week that includes the first Thursday of the year, and 
          // is also the first week that contains at least four days in the year. 
          // If the first Monday of January is the 2nd, 3rd, or 4th, the preceding days are part of 
          // the last week of the preceding year; thus, for Saturday 2nd January 1999, 
          // %G is replaced by 1998 and %V is replaced by 53. If December 29th, 30th, 
          // or 31st is a Monday, it and any following days are part of week 1 of the following year. 
          // Thus, for Tuesday 30th December 1997, %G is replaced by 1998 and %V is replaced by 01.
          return getWeekBasedYear(date).toString().substring(2);
        },
        '%G': function(date) {
          return getWeekBasedYear(date);
        },
        '%H': function(date) {
          return leadingNulls(date.tm_hour, 2);
        },
        '%I': function(date) {
          return leadingNulls(date.tm_hour < 13 ? date.tm_hour : date.tm_hour-12, 2);
        },
        '%j': function(date) {
          // Day of the year (001-366)
          return leadingNulls(date.tm_mday+__arraySum(__isLeapYear(date.tm_year+1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date.tm_mon-1), 3);
        },
        '%m': function(date) {
          return leadingNulls(date.tm_mon+1, 2);
        },
        '%M': function(date) {
          return leadingNulls(date.tm_min, 2);
        },
        '%n': function() {
          return '\n';
        },
        '%p': function(date) {
          if (date.tm_hour > 0 && date.tm_hour < 13) {
            return 'AM';
          } else {
            return 'PM';
          }
        },
        '%S': function(date) {
          return leadingNulls(date.tm_sec, 2);
        },
        '%t': function() {
          return '\t';
        },
        '%u': function(date) {
          var day = new Date(date.tm_year+1900, date.tm_mon+1, date.tm_mday, 0, 0, 0, 0);
          return day.getDay() || 7;
        },
        '%U': function(date) {
          // Replaced by the week number of the year as a decimal number [00,53]. 
          // The first Sunday of January is the first day of week 1; 
          // days in the new year before this are in week 0. [ tm_year, tm_wday, tm_yday]
          var janFirst = new Date(date.tm_year+1900, 0, 1);
          var firstSunday = janFirst.getDay() === 0 ? janFirst : __addDays(janFirst, 7-janFirst.getDay());
          var endDate = new Date(date.tm_year+1900, date.tm_mon, date.tm_mday);
          // is target date after the first Sunday?
          if (compareByDay(firstSunday, endDate) < 0) {
            // calculate difference in days between first Sunday and endDate
            var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth()-1)-31;
            var firstSundayUntilEndJanuary = 31-firstSunday.getDate();
            var days = firstSundayUntilEndJanuary+februaryFirstUntilEndMonth+endDate.getDate();
            return leadingNulls(Math.ceil(days/7), 2);
          }
          return compareByDay(firstSunday, janFirst) === 0 ? '01': '00';
        },
        '%V': function(date) {
          // Replaced by the week number of the year (Monday as the first day of the week) 
          // as a decimal number [01,53]. If the week containing 1 January has four 
          // or more days in the new year, then it is considered week 1. 
          // Otherwise, it is the last week of the previous year, and the next week is week 1. 
          // Both January 4th and the first Thursday of January are always in week 1. [ tm_year, tm_wday, tm_yday]
          var janFourthThisYear = new Date(date.tm_year+1900, 0, 4);
          var janFourthNextYear = new Date(date.tm_year+1901, 0, 4);
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
          var endDate = __addDays(new Date(date.tm_year+1900, 0, 1), date.tm_yday);
          if (compareByDay(endDate, firstWeekStartThisYear) < 0) {
            // if given date is before this years first week, then it belongs to the 53rd week of last year
            return '53';
          } 
          if (compareByDay(firstWeekStartNextYear, endDate) <= 0) {
            // if given date is after next years first week, then it belongs to the 01th week of next year
            return '01';
          }
          // given date is in between CW 01..53 of this calendar year
          var daysDifference;
          if (firstWeekStartThisYear.getFullYear() < date.tm_year+1900) {
            // first CW of this year starts last year
            daysDifference = date.tm_yday+32-firstWeekStartThisYear.getDate()
          } else {
            // first CW of this year starts this year
            daysDifference = date.tm_yday+1-firstWeekStartThisYear.getDate();
          }
          return leadingNulls(Math.ceil(daysDifference/7), 2);
        },
        '%w': function(date) {
          var day = new Date(date.tm_year+1900, date.tm_mon+1, date.tm_mday, 0, 0, 0, 0);
          return day.getDay();
        },
        '%W': function(date) {
          // Replaced by the week number of the year as a decimal number [00,53]. 
          // The first Monday of January is the first day of week 1; 
          // days in the new year before this are in week 0. [ tm_year, tm_wday, tm_yday]
          var janFirst = new Date(date.tm_year, 0, 1);
          var firstMonday = janFirst.getDay() === 1 ? janFirst : __addDays(janFirst, janFirst.getDay() === 0 ? 1 : 7-janFirst.getDay()+1);
          var endDate = new Date(date.tm_year+1900, date.tm_mon, date.tm_mday);
          // is target date after the first Monday?
          if (compareByDay(firstMonday, endDate) < 0) {
            var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth()-1)-31;
            var firstMondayUntilEndJanuary = 31-firstMonday.getDate();
            var days = firstMondayUntilEndJanuary+februaryFirstUntilEndMonth+endDate.getDate();
            return leadingNulls(Math.ceil(days/7), 2);
          }
          return compareByDay(firstMonday, janFirst) === 0 ? '01': '00';
        },
        '%y': function(date) {
          // Replaced by the last two digits of the year as a decimal number [00,99]. [ tm_year]
          return (date.tm_year+1900).toString().substring(2);
        },
        '%Y': function(date) {
          // Replaced by the year as a decimal number (for example, 1997). [ tm_year]
          return date.tm_year+1900;
        },
        '%z': function(date) {
          // Replaced by the offset from UTC in the ISO 8601:2000 standard format ( +hhmm or -hhmm ),
          // or by no characters if no timezone is determinable. 
          // For example, "-0430" means 4 hours 30 minutes behind UTC (west of Greenwich). 
          // If tm_isdst is zero, the standard time offset is used. 
          // If tm_isdst is greater than zero, the daylight savings time offset is used. 
          // If tm_isdst is negative, no characters are returned. 
          // FIXME: we cannot determine time zone (or can we?)
          return '';
        },
        '%Z': function(date) {
          // Replaced by the timezone name or abbreviation, or by no bytes if no timezone information exists. [ tm_isdst]
          // FIXME: we cannot determine time zone (or can we?)
          return '';
        },
        '%%': function() {
          return '%';
        }
      };
      for (var rule in EXPANSION_RULES_2) {
        if (pattern.indexOf(rule) >= 0) {
          pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_2[rule](date));
        }
      }
      var bytes = intArrayFromString(pattern, false);
      if (bytes.length > maxsize) {
        return 0;
      } 
      writeArrayToMemory(bytes, s);
      return bytes.length-1;
    }var _strftime_l=_strftime;
  function __parseInt64(str, endptr, base, min, max, unsign) {
      var isNegative = false;
      // Skip space.
      while (_isspace(HEAP8[(str)])) str++;
      // Check for a plus/minus sign.
      if (HEAP8[(str)] == 45) {
        str++;
        isNegative = true;
      } else if (HEAP8[(str)] == 43) {
        str++;
      }
      // Find base.
      var ok = false;
      var finalBase = base;
      if (!finalBase) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            finalBase = 16;
            str += 2;
          } else {
            finalBase = 8;
            ok = true; // we saw an initial zero, perhaps the entire thing is just "0"
          }
        }
      } else if (finalBase==16) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            str += 2;
          }
        }
      }
      if (!finalBase) finalBase = 10;
      var start = str;
      // Get digits.
      var chr;
      while ((chr = HEAP8[(str)]) != 0) {
        var digit = parseInt(String.fromCharCode(chr), finalBase);
        if (isNaN(digit)) {
          break;
        } else {
          str++;
          ok = true;
        }
      }
      if (!ok) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return ((asm["setTempRet0"](0),0)|0);
      }
      // Set end pointer.
      if (endptr) {
        HEAP32[((endptr)>>2)]=str
      }
      try {
        var numberString = isNegative ? '-'+Pointer_stringify(start, str - start) : Pointer_stringify(start, str - start);
        i64Math.fromString(numberString, finalBase, min, max, unsign);
      } catch(e) {
        ___setErrNo(ERRNO_CODES.ERANGE); // not quite correct
      }
      return ((asm["setTempRet0"](((HEAP32[(((tempDoublePtr)+(4))>>2)])|0)),((HEAP32[((tempDoublePtr)>>2)])|0))|0);
    }function _strtoull(str, endptr, base) {
      return __parseInt64(str, endptr, base, 0, '18446744073709551615', true);  // ULONG_MAX.
    }var _strtoull_l=_strtoull;
  function _strtoll(str, endptr, base) {
      return __parseInt64(str, endptr, base, '-9223372036854775808', '9223372036854775807');  // LLONG_MIN, LLONG_MAX.
    }var _strtoll_l=_strtoll;
  function _uselocale(locale) {
      return 0;
    }
  var _llvm_va_start=undefined;
  function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }function _asprintf(s, format, varargs) {
      return _sprintf(-s, format, varargs);
    }function _vasprintf(s, format, va_arg) {
      return _asprintf(s, format, HEAP32[((va_arg)>>2)]);
    }
  function _llvm_va_end() {}
  function _vsnprintf(s, n, format, va_arg) {
      return _snprintf(s, n, format, HEAP32[((va_arg)>>2)]);
    }
  function _vsscanf(s, format, va_arg) {
      return _sscanf(s, format, HEAP32[((va_arg)>>2)]);
    }
  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }
  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret
      }
      return ret;
    }
  var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
        // Canvas event setup
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        var ctx;
        try {
          if (useWebGL) {
            var contextAttributes = {
              antialias: false,
              alpha: false
            };
            if (webGLContextAttributes) {
              for (var attribute in webGLContextAttributes) {
                contextAttributes[attribute] = webGLContextAttributes[attribute];
              }
            }
            var errorInfo = '?';
            function onContextCreationError(event) {
              errorInfo = event.statusMessage || errorInfo;
            }
            canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
            try {
              ['experimental-webgl', 'webgl'].some(function(webglId) {
                return ctx = canvas.getContext(webglId, contextAttributes);
              });
            } finally {
              canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
            }
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas: ' + [errorInfo, e]);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          setTimeout(func, 1000/60);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           window['setTimeout'];
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x, y;
          if (event.type == 'touchstart' ||
              event.type == 'touchend' ||
              event.type == 'touchmove') {
            var t = event.touches.item(0);
            if (t) {
              x = t.pageX - (window.scrollX + rect.left);
              y = t.pageY - (window.scrollY + rect.top);
            } else {
              return;
            }
          } else {
            x = event.pageX - (window.scrollX + rect.left);
            y = event.pageY - (window.scrollY + rect.top);
          }
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      }};
_llvm_eh_exception.buf = allocate(12, "void*", ALLOC_STATIC);
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
_fgetc.ret = allocate([0], "i8", ALLOC_STATIC);
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true; // seal the static portion of memory
STACK_MAX = STACK_BASE + 5242880;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");
 var ctlz_i8 = allocate([8,7,6,6,5,5,5,5,4,4,4,4,4,4,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_DYNAMIC);
 var cttz_i8 = allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0], "i8", ALLOC_DYNAMIC);
var Math_min = Math.min;
function invoke_iiiiiiii(index,a1,a2,a3,a4,a5,a6,a7) {
  try {
    return Module["dynCall_iiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiiiiiddi(index,a1,a2,a3,a4,a5,a6,a7,a8) {
  try {
    return Module["dynCall_iiiiiiddi"](index,a1,a2,a3,a4,a5,a6,a7,a8);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiii(index,a1,a2,a3,a4,a5) {
  try {
    Module["dynCall_viiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vii(index,a1,a2) {
  try {
    Module["dynCall_vii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiiiiii(index,a1,a2,a3,a4,a5,a6) {
  try {
    return Module["dynCall_iiiiiii"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiddddi(index,a1,a2,a3,a4,a5,a6,a7,a8) {
  try {
    Module["dynCall_viiiddddi"](index,a1,a2,a3,a4,a5,a6,a7,a8);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iddddiii(index,a1,a2,a3,a4,a5,a6,a7) {
  try {
    return Module["dynCall_iddddiii"](index,a1,a2,a3,a4,a5,a6,a7);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiiiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11) {
  try {
    return Module["dynCall_iiiiiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vidi(index,a1,a2,a3) {
  try {
    Module["dynCall_vidi"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiiiiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13,a14,a15) {
  try {
    Module["dynCall_viiiiiiiiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13,a14,a15);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiid(index,a1,a2,a3,a4,a5,a6) {
  try {
    Module["dynCall_viiiiid"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8) {
  try {
    Module["dynCall_viiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiii(index,a1,a2,a3,a4,a5,a6) {
  try {
    Module["dynCall_viiiiii"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_ddd(index,a1,a2) {
  try {
    return Module["dynCall_ddd"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_fiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_fiii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiidi(index,a1,a2,a3,a4,a5) {
  try {
    Module["dynCall_viiidi"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iid(index,a1,a2) {
  try {
    return Module["dynCall_iid"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiiii(index,a1,a2,a3,a4,a5,a6,a7) {
  try {
    Module["dynCall_viiiiiii"](index,a1,a2,a3,a4,a5,a6,a7);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiiid(index,a1,a2,a3,a4,a5,a6,a7) {
  try {
    Module["dynCall_viiiiiid"](index,a1,a2,a3,a4,a5,a6,a7);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9) {
  try {
    Module["dynCall_viiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10) {
  try {
    Module["dynCall_viiiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_diii(index,a1,a2,a3) {
  try {
    return Module["dynCall_diii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_dii(index,a1,a2) {
  try {
    return Module["dynCall_dii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_i(index) {
  try {
    return Module["dynCall_i"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiiiii(index,a1,a2,a3,a4,a5) {
  try {
    return Module["dynCall_iiiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viii(index,a1,a2,a3) {
  try {
    Module["dynCall_viii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8) {
  try {
    return Module["dynCall_iiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiiii(index,a1,a2,a3,a4) {
  try {
    return Module["dynCall_iiiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiii(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_viiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env.cttz_i8|0;var n=env.ctlz_i8|0;var o=env.__ZTVN10__cxxabiv117__class_type_infoE|0;var p=env.___fsmu8|0;var q=env.__ZTIc|0;var r=env._stdout|0;var s=env.__ZTVN10__cxxabiv119__pointer_type_infoE|0;var t=env.___dso_handle|0;var u=env._stdin|0;var v=env.__ZTVN10__cxxabiv120__si_class_type_infoE|0;var w=env._stderr|0;var x=+env.NaN;var y=+env.Infinity;var z=0;var A=0;var B=0;var C=0;var D=0,E=0,F=0,G=0,H=0.0,I=0,J=0,K=0,L=0.0;var M=0;var N=0;var O=0;var P=0;var Q=0;var R=0;var S=0;var T=0;var U=0;var V=0;var W=global.Math.floor;var X=global.Math.abs;var Y=global.Math.sqrt;var Z=global.Math.pow;var _=global.Math.cos;var $=global.Math.sin;var aa=global.Math.tan;var ab=global.Math.acos;var ac=global.Math.asin;var ad=global.Math.atan;var ae=global.Math.atan2;var af=global.Math.exp;var ag=global.Math.log;var ah=global.Math.ceil;var ai=global.Math.imul;var aj=env.abort;var ak=env.assert;var al=env.asmPrintInt;var am=env.asmPrintFloat;var an=env.min;var ao=env.invoke_iiiiiiii;var ap=env.invoke_iiiiiiddi;var aq=env.invoke_viiiii;var ar=env.invoke_vi;var as=env.invoke_vii;var at=env.invoke_iiiiiii;var au=env.invoke_ii;var av=env.invoke_viiiddddi;var aw=env.invoke_iddddiii;var ax=env.invoke_iiiiiiiiiiii;var ay=env.invoke_vidi;var az=env.invoke_iiii;var aA=env.invoke_viiiiiiiiiiiiiii;var aB=env.invoke_viiiiid;var aC=env.invoke_viiiiiiii;var aD=env.invoke_viiiiii;var aE=env.invoke_ddd;var aF=env.invoke_fiii;var aG=env.invoke_viiidi;var aH=env.invoke_iid;var aI=env.invoke_viiiiiii;var aJ=env.invoke_viiiiiid;var aK=env.invoke_viiiiiiiii;var aL=env.invoke_viiiiiiiiii;var aM=env.invoke_iii;var aN=env.invoke_diii;var aO=env.invoke_dii;var aP=env.invoke_i;var aQ=env.invoke_iiiiii;var aR=env.invoke_viii;var aS=env.invoke_v;var aT=env.invoke_iiiiiiiii;var aU=env.invoke_iiiii;var aV=env.invoke_viiii;var aW=env._llvm_lifetime_end;var aX=env._lseek;var aY=env.__scanString;var aZ=env._fclose;var a_=env._pthread_mutex_lock;var a$=env.___cxa_end_catch;var a0=env._strtoull;var a1=env._fflush;var a2=env._strtol;var a3=env.__isLeapYear;var a4=env._fwrite;var a5=env._send;var a6=env._isspace;var a7=env._read;var a8=env._ceil;var a9=env._fsync;var ba=env.___cxa_guard_abort;var bb=env._newlocale;var bc=env.___gxx_personality_v0;var bd=env._pthread_cond_wait;var be=env.___cxa_rethrow;var bf=env._fmod;var bg=env.___resumeException;var bh=env._llvm_va_end;var bi=env._vsscanf;var bj=env._snprintf;var bk=env._fgetc;var bl=env.__getFloat;var bm=env._atexit;var bn=env.___cxa_free_exception;var bo=env._close;var bp=env.___setErrNo;var bq=env._isxdigit;var br=env._ftell;var bs=env._exit;var bt=env._sprintf;var bu=env._asprintf;var bv=env.___ctype_b_loc;var bw=env._freelocale;var bx=env._catgets;var by=env.___cxa_is_number_type;var bz=env._getcwd;var bA=env.___cxa_does_inherit;var bB=env.___cxa_guard_acquire;var bC=env.___cxa_begin_catch;var bD=env._recv;var bE=env.__parseInt64;var bF=env.__ZSt18uncaught_exceptionv;var bG=env.___cxa_call_unexpected;var bH=env.__exit;var bI=env._strftime;var bJ=env.___cxa_throw;var bK=env._llvm_eh_exception;var bL=env._toupper;var bM=env._pread;var bN=env._fopen;var bO=env._open;var bP=env.__arraySum;var bQ=env._isalnum;var bR=env._isalpha;var bS=env.___cxa_find_matching_catch;var bT=env._strdup;var bU=env.__formatString;var bV=env._pthread_cond_broadcast;var bW=env.__ZSt9terminatev;var bX=env._isascii;var bY=env._pthread_mutex_unlock;var bZ=env._sbrk;var b_=env.___errno_location;var b$=env._strerror;var b0=env._catclose;var b1=env._llvm_lifetime_start;var b2=env.__parseInt;var b3=env.___cxa_guard_release;var b4=env._ungetc;var b5=env._uselocale;var b6=env._vsnprintf;var b7=env._sscanf;var b8=env._sysconf;var b9=env._fread;var ca=env._abort;var cb=env._isdigit;var cc=env._strtoll;var cd=env.__addDays;var ce=env._fabs;var cf=env._floor;var cg=env.__reallyNegative;var ch=env._fseek;var ci=env.___cxa_bad_typeid;var cj=env._write;var ck=env.___cxa_allocate_exception;var cl=env._stat;var cm=env.___cxa_pure_virtual;var cn=env._vasprintf;var co=env._catopen;var cp=env.___ctype_toupper_loc;var cq=env.___ctype_tolower_loc;var cr=env._llvm_eh_typeid_for;var cs=env._pwrite;var ct=env._strerror_r;var cu=env._time;var cv=0.0;
// EMSCRIPTEN_START_FUNCS
function Aa(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,at=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0;d=i;i=i+32|0;e=d|0;f=d+8|0;g=d+16|0;h=g;j=i;i=i+12|0;i=i+7&-8;k=j;l=i;i=i+196|0;i=i+7&-8;m=i;i=i+68|0;i=i+7&-8;n=i;i=i+68|0;i=i+7&-8;o=i;i=i+12|0;i=i+7&-8;p=i;i=i+12|0;i=i+7&-8;q=i;i=i+12|0;i=i+7&-8;r=i;i=i+144|0;s=i;i=i+12|0;i=i+7&-8;t=i;i=i+144|0;u=i;i=i+12|0;i=i+7&-8;v=n+36|0;w=n+40|0;Ld(n|0,0,68)|0;c[n>>2]=c[b>>2];x=o;a[x]=0;a[o+1|0]=0;y=n+4|0;z=0,aM(344,y|0,o|0)|0;L1:do{if(!z){c[n+52>>2]=c[b+8>>2];a[n+48|0]=(c[b+12>>2]|0)==1|0;a[n+49|0]=0;A=c[b+20>>2]|0;B=Le(A|0)|0;if(B>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;C=54;break}return 0}if(B>>>0<11>>>0){a[p]=B<<1;D=p+1|0}else{E=B+16&-16;F=(z=0,au(246,E|0)|0);if(z){z=0;C=54;break}c[p+8>>2]=F;c[p>>2]=E|1;c[p+4>>2]=B;D=F}La(D|0,A|0,B)|0;a[D+B|0]=0;B=n+16|0;z=0,aM(344,B|0,p|0)|0;L12:do{if(!z){c[n+28>>2]=c[b+16>>2];c[n+32>>2]=0;z=0;aR(142,n+36|0,0,0);do{if(!z){z=0;as(358,m|0,n|0);if(z){z=0;break}z=0;as(540,l|0,m|0);if(z){z=0;A=bS(-1,-1,30600,28472)|0;F=A;A=M;if((a[m+56|0]&1)!=0){K1(c[m+64>>2]|0)}E=m+36|0;G=c[E>>2]|0;if((G|0)!=0){H=m+40|0;I=c[H>>2]|0;if((G|0)==(I|0)){J=G}else{K=I;while(1){I=K-12|0;c[H>>2]=I;if((a[I]&1)==0){L=I}else{K1(c[K-12+8>>2]|0);L=c[H>>2]|0}if((G|0)==(L|0)){break}else{K=L}}J=c[E>>2]|0}K1(J)}if((a[m+16|0]&1)!=0){K1(c[m+24>>2]|0)}if((a[m+4|0]&1)==0){N=A;O=F;break L12}K1(c[m+12>>2]|0);N=A;O=F;break L12}if((a[m+56|0]&1)!=0){K1(c[m+64>>2]|0)}K=m+36|0;G=c[K>>2]|0;if((G|0)!=0){H=m+40|0;I=c[H>>2]|0;if((G|0)==(I|0)){P=G}else{Q=I;while(1){I=Q-12|0;c[H>>2]=I;if((a[I]&1)==0){R=I}else{K1(c[Q-12+8>>2]|0);R=c[H>>2]|0}if((G|0)==(R|0)){break}else{Q=R}}P=c[K>>2]|0}K1(P)}if((a[m+16|0]&1)!=0){K1(c[m+24>>2]|0)}if((a[m+4|0]&1)!=0){K1(c[m+12>>2]|0)}if((a[p]&1)!=0){K1(c[p+8>>2]|0)}if((a[x]&1)!=0){K1(c[o+8>>2]|0)}if((a[n+56|0]&1)!=0){K1(c[n+64>>2]|0)}Q=c[v>>2]|0;if((Q|0)!=0){G=c[w>>2]|0;if((Q|0)==(G|0)){S=Q}else{H=G;while(1){G=H-12|0;c[w>>2]=G;if((a[G]&1)==0){T=G}else{K1(c[H-12+8>>2]|0);T=c[w>>2]|0}if((Q|0)==(T|0)){break}else{H=T}}S=c[v>>2]|0}K1(S)}if((a[B]&1)!=0){K1(c[n+24>>2]|0)}if((a[y]&1)!=0){K1(c[n+12>>2]|0)}H=(z=0,au(142,l|0)|0);do{if(!z){c[b+4>>2]=H;c[b+28>>2]=0;c[b+24>>2]=0;z=0;as(14,q|0,l|0);if(z){z=0;break}z9(q,b+36|0,b+40|0);Q=q|0;K=c[Q>>2]|0;if((K|0)!=0){G=q+4|0;F=c[G>>2]|0;if((K|0)==(F|0)){U=K}else{A=F;while(1){F=A-12|0;c[G>>2]=F;if((a[F]&1)==0){V=F}else{K1(c[A-12+8>>2]|0);V=c[G>>2]|0}if((K|0)==(V|0)){break}else{A=V}}U=c[Q>>2]|0}K1(U)}z=0;ar(318,l|0);if(!z){i=d;return 0}else{z=0;A=bS(-1,-1,30600,28472)|0;W=M;X=A;C=88;break L1}}else{z=0}}while(0);H=bS(-1,-1,30600,28472)|0;A=M;z=0;ar(318,l|0);if(!z){W=A;X=H;C=88;break L1}else{z=0;break L1}}else{z=0}}while(0);H=bS(-1,-1,30600,28472)|0;N=M;O=H}else{z=0;H=bS(-1,-1,30600,28472)|0;N=M;O=H}}while(0);if((a[p]&1)==0){Y=N;Z=O;C=72;break}K1(c[p+8>>2]|0);Y=N;Z=O;C=72}else{z=0;C=54}}while(0);if((C|0)==54){O=bS(-1,-1,30600,28472)|0;Y=M;Z=O;C=72}do{if((C|0)==72){if((a[x]&1)!=0){K1(c[o+8>>2]|0)}if((a[n+56|0]&1)!=0){K1(c[n+64>>2]|0)}O=c[v>>2]|0;if((O|0)!=0){N=c[w>>2]|0;if((O|0)==(N|0)){_=O}else{p=N;while(1){N=p-12|0;c[w>>2]=N;if((a[N]&1)==0){$=N}else{K1(c[p-12+8>>2]|0);$=c[w>>2]|0}if((O|0)==($|0)){break}else{p=$}}_=c[v>>2]|0}K1(_)}if((a[n+16|0]&1)!=0){K1(c[n+24>>2]|0)}if((a[y]&1)==0){W=Y;X=Z;C=88;break}K1(c[n+12>>2]|0);W=Y;X=Z;C=88}}while(0);L131:do{if((C|0)==88){if((W|0)!=(cr(30600)|0)){if((W|0)!=(cr(28472)|0)){aa=W;ab=X;ac=ab;ad=0;ae=ac;af=aa;bg(ae|0)}Z=bC(X|0)|0;Y=Z;n=r+64|0;y=r|0;_=r+8|0;v=_|0;c[v>>2]=14616;$=r+12|0;c[y>>2]=31692;w=r+64|0;c[w>>2]=31712;c[r+4>>2]=0;z=0;as(200,r+64|0,$|0);L138:do{if(!z){c[r+136>>2]=0;c[r+140>>2]=-1;o=r+8|0;c[y>>2]=14596;c[n>>2]=14636;c[v>>2]=14616;x=$|0;c[x>>2]=14920;p=r+16|0;Iv(p);Ld(r+20|0,0,24)|0;c[x>>2]=14776;O=r+44|0;Ld(r+44|0,0,16)|0;c[r+60>>2]=24;Ld(h|0,0,12)|0;z=0;as(214,$|0,g|0);if(z){z=0;N=bS(-1,-1)|0;l=M;if((a[h]&1)!=0){K1(c[g+8>>2]|0)}if((a[O]&1)!=0){K1(c[r+52>>2]|0)}c[x>>2]=14920;z=0;ar(396,p|0);if(!z){ag=N;ah=l;C=142;break}else{z=0}l=bS(-1,-1,0)|0;dk(l);return 0}if((a[h]&1)!=0){K1(c[g+8>>2]|0)}l=(z=0,aM(114,_|0,9416)|0);L153:do{if(!z){N=cC[c[(c[Z>>2]|0)+8>>2]&511](Y)|0;x=(z=0,aM(114,l|0,N|0)|0);if(z){z=0;C=170;break}z=0;as(348,e|0,x+(c[(c[x>>2]|0)-12>>2]|0)|0);if(z){z=0;C=170;break}N=(z=0,aM(198,e|0,40880)|0);do{if(!z){U=(z=0,aM(c[(c[N>>2]|0)+28>>2]|0,N|0,10)|0);if(z){z=0;break}z=0;ar(396,e|0);if(z){z=0;C=170;break L153}z=0,aM(242,x|0,U|0)|0;if(z){z=0;C=170;break L153}z=0,au(62,x|0)|0;if(z){z=0;C=170;break L153}z=0;as(570,s|0,$|0);if(z){z=0;C=170;break L153}U=s;if((a[U]&1)==0){ai=s+1|0}else{ai=c[s+8>>2]|0}c[b+28>>2]=bT(ai|0)|0;if((a[U]&1)!=0){K1(c[s+8>>2]|0)}c[b+24>>2]=1;c[b+4>>2]=0;c[y>>2]=14596;c[w>>2]=14636;c[o>>2]=14616;U=r+12|0;c[U>>2]=14776;if((a[O]&1)!=0){K1(c[r+52>>2]|0)}c[U>>2]=14920;z=0;ar(396,p|0);if(z){z=0;U=bS(-1,-1)|0;V=M;z=0;ar(272,r+64|0);if(!z){aj=V;ak=U;C=169;break L138}else{z=0}U=bS(-1,-1,0)|0;dk(U);return 0}z=0;ar(272,r+64|0);if(z){z=0;U=bS(-1,-1)|0;aj=M;ak=U;C=169;break L138}a$();i=d;return 0}else{z=0}}while(0);x=bS(-1,-1)|0;N=M;z=0;ar(396,e|0);if(!z){al=N;am=x;break}else{z=0}x=bS(-1,-1,0)|0;dk(x);return 0}else{z=0;C=170}}while(0);if((C|0)==170){l=bS(-1,-1)|0;al=M;am=l}l=am;x=al;c[y>>2]=14596;c[w>>2]=14636;c[o>>2]=14616;N=r+12|0;c[N>>2]=14776;if((a[O]&1)!=0){K1(c[r+52>>2]|0)}c[N>>2]=14920;z=0;ar(396,p|0);if(!z){z=0;ar(272,r+64|0);if(!z){an=x;ao=l;break}else{z=0;break L131}}else{z=0}l=bS(-1,-1,0)|0;x=M;z=0;ar(272,r+64|0);if(!z){ap=x;aq=l;at=aq;dk(at);return 0}else{z=0;l=bS(-1,-1,0)|0;dk(l);return 0}}else{z=0;l=bS(-1,-1)|0;ag=l;ah=M;C=142}}while(0);do{if((C|0)==142){z=0;ar(272,n|0);if(!z){aj=ah;ak=ag;C=169;break}else{z=0;w=bS(-1,-1,0)|0;dk(w);return 0}}}while(0);if((C|0)==169){an=aj;ao=ak}z=0;aS(2);if(!z){aa=an;ab=ao}else{z=0;break}ac=ab;ad=0;ae=ac;af=aa;bg(ae|0)}n=bC(X|0)|0;w=t+64|0;y=t|0;$=t+8|0;Y=$|0;c[Y>>2]=14616;Z=t+12|0;c[y>>2]=31692;_=t+64|0;c[_>>2]=31712;c[t+4>>2]=0;z=0;as(200,t+64|0,Z|0);L207:do{if(!z){c[t+136>>2]=0;c[t+140>>2]=-1;v=t+8|0;c[y>>2]=14596;c[w>>2]=14636;c[Y>>2]=14616;l=Z|0;c[l>>2]=14920;x=t+16|0;Iv(x);Ld(t+20|0,0,24)|0;c[l>>2]=14776;N=t+44|0;Ld(t+44|0,0,16)|0;c[t+60>>2]=24;Ld(k|0,0,12)|0;z=0;as(214,Z|0,j|0);if(z){z=0;U=bS(-1,-1)|0;V=M;if((a[k]&1)!=0){K1(c[j+8>>2]|0)}if((a[N]&1)!=0){K1(c[t+52>>2]|0)}c[l>>2]=14920;z=0;ar(396,x|0);if(!z){av=U;aw=V;C=100;break}else{z=0}V=bS(-1,-1,0)|0;dk(V);return 0}if((a[k]&1)!=0){K1(c[j+8>>2]|0)}V=(z=0,aM(804,$|0,n+4|0)|0);L222:do{if(!z){U=(z=0,aM(114,V|0,7944)|0);if(z){z=0;C=180;break}l=(z=0,aM(312,U|0,c[n+20>>2]|0)|0);if(z){z=0;C=180;break}U=(z=0,aM(114,l|0,5968)|0);if(z){z=0;C=180;break}l=(z=0,aM(804,U|0,n+28|0)|0);if(z){z=0;C=180;break}z=0;as(348,f|0,l+(c[(c[l>>2]|0)-12>>2]|0)|0);if(z){z=0;C=180;break}U=(z=0,aM(198,f|0,40880)|0);do{if(!z){q=(z=0,aM(c[(c[U>>2]|0)+28>>2]|0,U|0,10)|0);if(z){z=0;break}z=0;ar(396,f|0);if(z){z=0;C=180;break L222}z=0,aM(242,l|0,q|0)|0;if(z){z=0;C=180;break L222}z=0,au(62,l|0)|0;if(z){z=0;C=180;break L222}z=0;as(570,u|0,Z|0);if(z){z=0;C=180;break L222}q=u;if((a[q]&1)==0){ax=u+1|0}else{ax=c[u+8>>2]|0}c[b+28>>2]=bT(ax|0)|0;if((a[q]&1)!=0){K1(c[u+8>>2]|0)}c[b+24>>2]=1;c[b+4>>2]=0;c[y>>2]=14596;c[_>>2]=14636;c[v>>2]=14616;q=t+12|0;c[q>>2]=14776;if((a[N]&1)!=0){K1(c[t+52>>2]|0)}c[q>>2]=14920;z=0;ar(396,x|0);if(z){z=0;q=bS(-1,-1)|0;S=M;z=0;ar(272,t+64|0);if(!z){ay=S;az=q;C=179;break L207}else{z=0}q=bS(-1,-1,0)|0;dk(q);return 0}z=0;ar(272,t+64|0);if(z){z=0;q=bS(-1,-1)|0;ay=M;az=q;C=179;break L207}a$();i=d;return 0}else{z=0}}while(0);l=bS(-1,-1)|0;U=M;z=0;ar(396,f|0);if(!z){aA=U;aB=l;break}else{z=0}l=bS(-1,-1,0)|0;dk(l);return 0}else{z=0;C=180}}while(0);if((C|0)==180){V=bS(-1,-1)|0;aA=M;aB=V}V=aB;p=aA;c[y>>2]=14596;c[_>>2]=14636;c[v>>2]=14616;O=t+12|0;c[O>>2]=14776;if((a[N]&1)!=0){K1(c[t+52>>2]|0)}c[O>>2]=14920;z=0;ar(396,x|0);if(!z){z=0;ar(272,t+64|0);if(!z){aC=p;aD=V;break}else{z=0;break L131}}else{z=0}V=bS(-1,-1,0)|0;p=M;z=0;ar(272,t+64|0);if(!z){ap=p;aq=V;at=aq;dk(at);return 0}else{z=0;V=bS(-1,-1,0)|0;dk(V);return 0}}else{z=0;V=bS(-1,-1)|0;av=V;aw=M;C=100}}while(0);do{if((C|0)==100){z=0;ar(272,w|0);if(!z){ay=aw;az=av;C=179;break}else{z=0;_=bS(-1,-1,0)|0;dk(_);return 0}}}while(0);if((C|0)==179){aC=ay;aD=az}z=0;aS(2);if(!z){aa=aC;ab=aD}else{z=0;break}ac=ab;ad=0;ae=ac;af=aa;bg(ae|0)}}while(0);ae=bS(-1,-1,0)|0;ap=M;aq=ae;at=aq;dk(at);return 0}function Ab(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;e=b|0;f=b+4|0;g=b+12|0;h=b+16|0;Ld(b|0,0,28)|0;c[b+28>>2]=1;c[b+32>>2]=1;i=b+36|0;j=d;if((a[j]&1)==0){k=i;c[k>>2]=c[j>>2];c[k+4>>2]=c[j+4>>2];c[k+8>>2]=c[j+8>>2];return}j=c[d+8>>2]|0;k=c[d+4>>2]|0;do{if(k>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(k>>>0<11>>>0){a[i]=k<<1;l=i+1|0}else{d=k+16&-16;m=(z=0,au(246,d|0)|0);if(z){z=0;break}c[b+44>>2]=m;c[i>>2]=d|1;c[b+40>>2]=k;l=m}La(l|0,j|0,k)|0;a[l+k|0]=0;return}}while(0);k=bS(-1,-1)|0;l=c[g>>2]|0;g=l;if((l|0)!=0){j=c[h>>2]|0;if((l|0)!=(j|0)){c[h>>2]=j+(~(((j-24+(-g|0)|0)>>>0)/24|0)*24|0)}K1(l)}l=c[e>>2]|0;if((l|0)==0){bg(k|0)}g=c[f>>2]|0;if((l|0)==(g|0)){n=l}else{j=g;while(1){g=j-12|0;c[f>>2]=g;if((a[g]&1)==0){o=g}else{K1(c[j-12+8>>2]|0);o=c[f>>2]|0}if((l|0)==(o|0)){break}else{j=o}}n=c[e>>2]|0}K1(n);bg(k|0)}function Ac(a){a=a|0;var b=0;b=a+28|0;c[b>>2]=(c[b>>2]|0)+1;c[a+32>>2]=1;return}function Ad(a){a=a|0;var b=0;b=a+28|0;c[b>>2]=(c[b>>2]|0)-1;c[a+32>>2]=1;return}function Ae(a,b){a=a|0;b=b|0;var e=0,f=0;e=d[b]|0;if((e&1|0)==0){f=e>>>1}else{f=c[b+4>>2]|0}b=a+32|0;c[b>>2]=(c[b>>2]|0)+f;return}function Af(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=i;i=i+24|0;e=d|0;f=b+16|0;b=e;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];f=e;b=e+12|0;g=a+24|0;c[b>>2]=c[g>>2];c[b+4>>2]=c[g+4>>2];c[b+8>>2]=c[g+8>>2];g=a+16|0;b=c[g>>2]|0;if((b|0)==(c[a+20>>2]|0)){Ag(a+12|0,e);i=d;return}if((b|0)==0){h=0}else{e=b;c[e>>2]=c[f>>2];c[e+4>>2]=c[f+4>>2];c[e+8>>2]=c[f+8>>2];c[e+12>>2]=c[f+12>>2];c[e+16>>2]=c[f+16>>2];c[e+20>>2]=c[f+20>>2];h=c[g>>2]|0}c[g>>2]=h+24;i=d;return}function Ag(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=a+4|0;e=a|0;f=c[e>>2]|0;g=f;h=(c[d>>2]|0)-g|0;i=(h|0)/24|0;j=i+1|0;if(j>>>0>178956970>>>0){Ip(0)}k=a+8|0;a=((c[k>>2]|0)-g|0)/24|0;if(a>>>0>89478484>>>0){l=178956970;m=5}else{g=a<<1;a=g>>>0<j>>>0?j:g;if((a|0)==0){n=0;o=0}else{l=a;m=5}}if((m|0)==5){n=K$(l*24|0)|0;o=l}l=n+(i*24|0)|0;if((l|0)!=0){m=l;l=b;c[m>>2]=c[l>>2];c[m+4>>2]=c[l+4>>2];c[m+8>>2]=c[l+8>>2];c[m+12>>2]=c[l+12>>2];c[m+16>>2]=c[l+16>>2];c[m+20>>2]=c[l+20>>2]}l=n+((((h|0)/-24|0)+i|0)*24|0)|0;i=f;La(l|0,i|0,h)|0;c[e>>2]=l;c[d>>2]=n+(j*24|0);c[k>>2]=n+(o*24|0);if((f|0)==0){return}K1(i);return}function Ah(b,c,d){b=b|0;c=c|0;d=d|0;z0(b,a[d+36|0]&1);return}function Ai(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0.0,j=0;d=i;i=i+16|0;f=d|0;g=+h[e+40>>3];ji(f,e);e=f;if((a[e]&1)==0){j=f+1|0}else{j=c[f+8>>2]|0}z=0;ay(2,b|0,+g,j|0);if(!z){if((a[e]&1)==0){i=d;return}K1(c[f+8>>2]|0);i=d;return}else{z=0;d=bS(-1,-1)|0;if((a[e]&1)==0){bg(d|0)}K1(c[f+8>>2]|0);bg(d|0)}}function Aj(a,b,c){a=a|0;b=b|0;c=c|0;z2(a,+h[c+40>>3],+h[c+48>>3],+h[c+56>>3],+h[c+64>>3]);return}function Ak(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;d=i;i=i+16|0;f=d|0;g=e+40|0;if((a[g]&1)==0){h=f;c[h>>2]=c[g>>2];c[h+4>>2]=c[g+4>>2];c[h+8>>2]=c[g+8>>2];j=a[h]|0;k=h}else{h=c[e+48>>2]|0;g=c[e+44>>2]|0;if(g>>>0>4294967279>>>0){DE(0)}if(g>>>0<11>>>0){e=g<<1&255;l=f;a[l]=e;m=f+1|0;n=e;o=l}else{l=g+16&-16;e=K$(l)|0;c[f+8>>2]=e;p=l|1;c[f>>2]=p;c[f+4>>2]=g;m=e;n=p&255;o=f}La(m|0,h|0,g)|0;a[m+g|0]=0;j=n;k=o}if((j&1)==0){q=f+1|0}else{q=c[f+8>>2]|0}z=0;as(546,b|0,q|0);if(!z){if((a[k]&1)==0){i=d;return}K1(c[f+8>>2]|0);i=d;return}else{z=0;d=bS(-1,-1)|0;if((a[k]&1)==0){bg(d|0)}K1(c[f+8>>2]|0);bg(d|0)}}function Al(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0;e=i;i=i+40|0;f=e|0;g=d+44|0;h=d+40|0;z4(a,(c[g>>2]|0)-(c[h>>2]|0)>>2,(c[d+52>>2]|0)!=1|0);d=c[h>>2]|0;j=(c[g>>2]|0)-d>>2;if((j|0)==0){i=e;return}g=a+12|0;a=b|0;b=f;k=0;l=d;while(1){d=(c[g>>2]|0)+(k*40|0)|0;m=c[l+(k<<2)>>2]|0;cZ[c[(c[m>>2]|0)+32>>2]&511](f,m|0,a);m=d;c[m>>2]=c[b>>2];c[m+4>>2]=c[b+4>>2];c[m+8>>2]=c[b+8>>2];c[m+12>>2]=c[b+12>>2];c[m+16>>2]=c[b+16>>2];c[m+20>>2]=c[b+20>>2];c[m+24>>2]=c[b+24>>2];c[m+28>>2]=c[b+28>>2];c[m+32>>2]=c[b+32>>2];c[m+36>>2]=c[b+36>>2];m=k+1|0;if(m>>>0>=j>>>0){break}k=m;l=c[h>>2]|0}i=e;return}function Am(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0;e=i;i=i+40|0;f=e|0;g=d+44|0;h=d+40|0;z4(a,(c[g>>2]|0)-(c[h>>2]|0)>>2,0);d=c[h>>2]|0;j=(c[g>>2]|0)-d>>2;if((j|0)==0){i=e;return}g=a+12|0;a=b|0;b=f;k=0;l=d;while(1){d=(c[g>>2]|0)+(k*40|0)|0;m=c[l+(k<<2)>>2]|0;cZ[c[(c[m>>2]|0)+32>>2]&511](f,m,a);m=d;c[m>>2]=c[b>>2];c[m+4>>2]=c[b+4>>2];c[m+8>>2]=c[b+8>>2];c[m+12>>2]=c[b+12>>2];c[m+16>>2]=c[b+16>>2];c[m+20>>2]=c[b+20>>2];c[m+24>>2]=c[b+24>>2];c[m+28>>2]=c[b+28>>2];c[m+32>>2]=c[b+32>>2];c[m+36>>2]=c[b+36>>2];m=k+1|0;if(m>>>0>=j>>>0){break}k=m;l=c[h>>2]|0}i=e;return}function An(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=c[d+36>>2]|0;cZ[c[(c[e>>2]|0)+32>>2]&511](a,e|0,b|0);return}function Ao(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function Ap(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function Aq(a){a=a|0;return}function Ar(a){a=a|0;K1(a);return}function As(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function At(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function Au(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function Av(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function Aw(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function Ax(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function Ay(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function Az(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function AA(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function AB(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function AC(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function AD(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function AE(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function AF(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function AG(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function AH(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function AI(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function AJ(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function AK(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function AL(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function AM(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function AN(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function AO(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function AP(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function AQ(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function AR(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function AS(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function AT(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function AU(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function AV(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function AW(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function AX(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function AY(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function AZ(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function A_(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function A$(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function A0(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function A1(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function A2(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function A3(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function A4(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function A5(a,b,c){a=a|0;b=b|0;c=c|0;z5(a);return}function A6(a,b){a=a|0;b=b|0;c[a>>2]=15880;c[a+4>>2]=b;return}function A7(a){a=a|0;K1(a);return}function A8(a){a=a|0;return}function A9(a,b,c){a=a|0;b=b|0;c=c|0;CJ(a,b,c);return}function Ba(a,b,c){a=a|0;b=b|0;c=c|0;CI(a,b,c);return}function Bb(a,b,c){a=a|0;b=b|0;c=c|0;CH(a,b,c);return}function Bc(a,b,c){a=a|0;b=b|0;c=c|0;CG(a,b,c);return}function Bd(a,b,c){a=a|0;b=b|0;c=c|0;CF(a,b,c);return}function Be(a,b,c){a=a|0;b=b|0;c=c|0;CE(a,b,c);return}function Bf(a,b,c){a=a|0;b=b|0;c=c|0;CD(a,b,c);return}function Bg(a,b,c){a=a|0;b=b|0;c=c|0;CC(a,b,c);return}function Bh(a,b,c){a=a|0;b=b|0;c=c|0;CB(a,b,c);return}function Bi(a,b,c){a=a|0;b=b|0;c=c|0;CA(a,b,c);return}function Bj(a,b,c){a=a|0;b=b|0;c=c|0;Cz(a,b,c);return}function Bk(a,b,c){a=a|0;b=b|0;c=c|0;Cy(a,b,c);return}function Bl(a,b,c){a=a|0;b=b|0;c=c|0;Cx(a,b,c);return}function Bm(a,b,c){a=a|0;b=b|0;c=c|0;Cw(a,b,c);return}function Bn(a,b,c){a=a|0;b=b|0;c=c|0;Cv(a,b,c);return}function Bo(a,b,c){a=a|0;b=b|0;c=c|0;Cu(a,b,c);return}function Bp(a,b,c){a=a|0;b=b|0;c=c|0;Ct(a,b,c);return}function Bq(a,b,c){a=a|0;b=b|0;c=c|0;Cs(a,b,c);return}function Br(a,b,c){a=a|0;b=b|0;c=c|0;Cr(a,b,c);return}function Bs(a,b,c){a=a|0;b=b|0;c=c|0;Cq(a,b,c);return}function Bt(a,b,c){a=a|0;b=b|0;c=c|0;Cp(a,b,c);return}function Bu(a,b,c){a=a|0;b=b|0;c=c|0;Co(a,b,c);return}function Bv(a,b,c){a=a|0;b=b|0;c=c|0;Cn(a,b,c);return}function Bw(a,b,c){a=a|0;b=b|0;c=c|0;Cm(a,b,c);return}function Bx(a,b,c){a=a|0;b=b|0;c=c|0;Cl(a,b,c);return}function By(a,b,c){a=a|0;b=b|0;c=c|0;Ck(a,b,c);return}function Bz(a,b,c){a=a|0;b=b|0;c=c|0;Cj(a,b,c);return}function BA(a,b,c){a=a|0;b=b|0;c=c|0;Ci(a,b,c);return}function BB(a,b,c){a=a|0;b=b|0;c=c|0;Ch(a,b,c);return}function BC(a,b,c){a=a|0;b=b|0;c=c|0;Cg(a,b,c);return}function BD(a,b,c){a=a|0;b=b|0;c=c|0;Cf(a,b,c);return}function BE(a,b,c){a=a|0;b=b|0;c=c|0;Ce(a,b,c);return}function BF(a,b,c){a=a|0;b=b|0;c=c|0;Cd(a,b,c);return}function BG(a,b,c){a=a|0;b=b|0;c=c|0;Cc(a,b,c);return}function BH(a,b,c){a=a|0;b=b|0;c=c|0;Cb(a,b,c);return}function BI(b,c,d){b=b|0;c=c|0;d=d|0;a[b]=0;a[b+1|0]=0;return}function BJ(a,b,c){a=a|0;b=b|0;c=c|0;Ca(a,b,c);return}function BK(a,b,c){a=a|0;b=b|0;c=c|0;B9(a,b,c);return}function BL(a,b,c){a=a|0;b=b|0;c=c|0;B8(a,b,c);return}function BM(a,b,c){a=a|0;b=b|0;c=c|0;B7(a,b,c);return}function BN(a,b,c){a=a|0;b=b|0;c=c|0;B6(a,b,c);return}function BO(a,b,c){a=a|0;b=b|0;c=c|0;B5(a,b,c);return}function BP(a,b,c){a=a|0;b=b|0;c=c|0;B4(a,b,c);return}function BQ(a,b,c){a=a|0;b=b|0;c=c|0;B3(a,b,c);return}function BR(a,b,c){a=a|0;b=b|0;c=c|0;B2(a,b,c);return}function BS(a,b,c){a=a|0;b=b|0;c=c|0;B1(a,b,c);return}function BT(a,b,c){a=a|0;b=b|0;c=c|0;B0(a,b,c);return}function BU(a,b,c){a=a|0;b=b|0;c=c|0;B$(a,b,c);return}function BV(a,b,c){a=a|0;b=b|0;c=c|0;B_(a,b,c);return}function BW(a,b,c){a=a|0;b=b|0;c=c|0;BZ(a,b,c);return}function BX(a,b,c){a=a|0;b=b|0;c=c|0;BY(a,b,c);return}function BY(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function BZ(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function B_(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function B$(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function B0(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function B1(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function B2(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function B3(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function B4(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function B5(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function B6(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function B7(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function B8(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function B9(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function Ca(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function Cb(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function Cc(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function Cd(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function Ce(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function Cf(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function Cg(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function Ch(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function Ci(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function Cj(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function Ck(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function Cl(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function Cm(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function Cn(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function Co(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function Cp(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function Cq(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function Cr(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function Cs(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function Ct(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function Cu(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function Cv(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function Cw(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function Cx(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function Cy(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function Cz(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function CA(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function CB(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function CC(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function CD(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function CE(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function CF(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function CG(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function CH(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function CI(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function CJ(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+24|0;g=f|0;qK(g,c[d+4>>2]|0);z=0;as(c[(c[e>>2]|0)+8>>2]|0,e|0,g|0);do{if(!z){e=g+4|0;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];qM(g);h=24;j=0;i=f;return}e=c[g+12>>2]|0;d=c[g+8>>2]|0;if(d>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}if(d>>>0<11>>>0){a[b]=d<<1;k=b+1|0}else{l=d+16&-16;m=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=l|1;c[b+4>>2]=d;k=m}La(k|0,e|0,d)|0;a[k+d|0]=0;qM(g);h=24;j=0;i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;z=0;ar(366,g|0);if(!z){bg(f|0)}else{z=0;f=bS(-1,-1,0)|0;dk(f)}}function CK(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;d=b;e=a[b]|0;f=e&255;g=(f&1|0)==0;if(g){h=f>>>1}else{h=c[b+4>>2]|0}i=(e&1)==0;if(i){j=d+1|0}else{j=c[b+8>>2]|0}e=h>>>0>2>>>0;do{if((Lc(j|0,344,(e?2:h)|0)|0)==0){if(h>>>0>1>>>0&(e^1)){k=0}else{break}return k|0}}while(0);if(g){l=f>>>1}else{l=c[b+4>>2]|0}if(i){m=d+1|0}else{m=c[b+8>>2]|0}e=l>>>0>2>>>0;do{if((Lc(m|0,9384,(e?2:l)|0)|0)==0){if(l>>>0>1>>>0&(e^1)){k=1}else{break}return k|0}}while(0);if(g){n=f>>>1}else{n=c[b+4>>2]|0}if(i){o=d+1|0}else{o=c[b+8>>2]|0}e=n>>>0>2>>>0;do{if((Lc(o|0,7832,(e?2:n)|0)|0)==0){if(n>>>0>1>>>0&(e^1)){k=2}else{break}return k|0}}while(0);if(g){p=f>>>1}else{p=c[b+4>>2]|0}if(i){q=d+1|0}else{q=c[b+8>>2]|0}e=p>>>0>2>>>0;do{if((Lc(q|0,5904,(e?2:p)|0)|0)==0){if(p>>>0>1>>>0&(e^1)){k=3}else{break}return k|0}}while(0);if(g){r=f>>>1}else{r=c[b+4>>2]|0}if(i){s=d+1|0}else{s=c[b+8>>2]|0}e=r>>>0>2>>>0;do{if((Lc(s|0,5088,(e?2:r)|0)|0)==0){if(r>>>0>1>>>0&(e^1)){k=4}else{break}return k|0}}while(0);if(g){t=f>>>1}else{t=c[b+4>>2]|0}if(i){u=d+1|0}else{u=c[b+8>>2]|0}b=t>>>0>2>>>0;d=Lc(u|0,3472,(b?2:t)|0)|0;if((d|0)==0){v=t>>>0<2>>>0?-1:b&1}else{v=d}k=(v|0)==0?5:6;return k|0}function CL(a,b){a=a|0;b=b|0;var c=0,d=0.0;c=CK(a)|0;a=CK(b)|0;if((c|0)==6|(a|0)==6){d=0.0;return+d}d=+h[36400+(c*48|0)+(a<<3)>>3];return+d}function CM(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=z7()|0;c[e+8>>2]=b;c[e+16>>2]=0;c[e+20>>2]=0;c[e>>2]=a;Aa(e)|0;a=c[e+4>>2]|0;if((a|0)==0){f=0}else{f=bT(a|0)|0}if((c[e+24>>2]|0)==0){g=0;c[d>>2]=g;z8(e);return f|0}g=bT(c[e+28>>2]|0)|0;c[d>>2]=g;z8(e);return f|0}function CN(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;b=i;i=i+32|0;d=b|0;e=b+8|0;f=b+16|0;g=b+24|0;h=c[u>>2]|0;C7(40248,h,40376);c[10310]=15188;c[10312]=15208;c[10311]=0;z=0;as(200,41248,40248);if(z){z=0;j=bS(-1,-1)|0;D2(41248);bg(j|0)}c[10330]=0;c[10331]=-1;j=c[r>>2]|0;c[10038]=14920;Iv(40156);Ld(40160,0,24)|0;c[10038]=15408;c[10046]=j;Iw(g,40156);k=(z=0,aM(198,g|0,40576)|0);if(z){z=0;l=bS(-1,-1)|0;Ix(g);c[10038]=14920;Ix(40156);bg(l|0)}l=k;Ix(g);c[10047]=l;c[10048]=40384;a[40196]=(cC[c[(c[k>>2]|0)+28>>2]&511](l)|0)&1;c[10244]=15092;c[10245]=15112;z=0;as(200,40980,40152);if(z){z=0;l=bS(-1,-1)|0;D2(40980);bg(l|0)}c[10263]=0;c[10264]=-1;l=c[w>>2]|0;c[10050]=14920;Iv(40204);Ld(40208,0,24)|0;c[10050]=15408;c[10058]=l;Iw(f,40204);k=(z=0,aM(198,f|0,40576)|0);if(z){z=0;g=bS(-1,-1)|0;Ix(f);c[10050]=14920;Ix(40204);bg(g|0)}g=k;Ix(f);c[10059]=g;c[10060]=40392;a[40244]=(cC[c[(c[k>>2]|0)+28>>2]&511](g)|0)&1;c[10288]=15092;c[10289]=15112;z=0;as(200,41156,40200);if(z){z=0;g=bS(-1,-1)|0;D2(41156);bg(g|0)}c[10307]=0;c[10308]=-1;g=c[(c[(c[10288]|0)-12>>2]|0)+41176>>2]|0;c[10266]=15092;c[10267]=15112;z=0;as(200,41068,g|0);if(z){z=0;g=bS(-1,-1)|0;D2(41068);bg(g|0)}c[10285]=0;c[10286]=-1;c[(c[(c[10310]|0)-12>>2]|0)+41312>>2]=40976;g=(c[(c[10288]|0)-12>>2]|0)+41156|0;c[g>>2]=c[g>>2]|8192;c[(c[(c[10288]|0)-12>>2]|0)+41224>>2]=40976;CV(40096,h,40400);c[10222]=15140;c[10224]=15160;c[10223]=0;z=0;as(200,40896,40096);if(z){z=0;h=bS(-1,-1)|0;D2(40896);bg(h|0)}c[10242]=0;c[10243]=-1;c[1e4]=14848;Iv(40004);Ld(40008,0,24)|0;c[1e4]=15336;c[10008]=j;Iw(e,40004);j=(z=0,aM(198,e|0,40568)|0);if(z){z=0;h=bS(-1,-1)|0;Ix(e);c[1e4]=14848;Ix(40004);bg(h|0)}h=j;Ix(e);c[10009]=h;c[10010]=40408;a[40044]=(cC[c[(c[j>>2]|0)+28>>2]&511](h)|0)&1;c[10152]=15044;c[10153]=15064;z=0;as(200,40612,4e4);if(z){z=0;h=bS(-1,-1)|0;D2(40612);bg(h|0)}c[10171]=0;c[10172]=-1;c[10012]=14848;Iv(40052);Ld(40056,0,24)|0;c[10012]=15336;c[10020]=l;Iw(d,40052);l=(z=0,aM(198,d|0,40568)|0);if(z){z=0;h=bS(-1,-1)|0;Ix(d);c[10012]=14848;Ix(40052);bg(h|0)}h=l;Ix(d);c[10021]=h;c[10022]=40416;a[40092]=(cC[c[(c[l>>2]|0)+28>>2]&511](h)|0)&1;c[10196]=15044;c[10197]=15064;z=0;as(200,40788,40048);if(z){z=0;h=bS(-1,-1)|0;D2(40788);bg(h|0)}c[10215]=0;c[10216]=-1;h=c[(c[(c[10196]|0)-12>>2]|0)+40808>>2]|0;c[10174]=15044;c[10175]=15064;z=0;as(200,40700,h|0);if(!z){c[10193]=0;c[10194]=-1;c[(c[(c[10222]|0)-12>>2]|0)+40960>>2]=40608;h=(c[(c[10196]|0)-12>>2]|0)+40788|0;c[h>>2]=c[h>>2]|8192;c[(c[(c[10196]|0)-12>>2]|0)+40856>>2]=40608;i=b;return}else{z=0;b=bS(-1,-1)|0;D2(40700);bg(b|0)}}function CO(a){a=a|0;z=0,au(62,40976)|0;do{if(!z){z=0,au(62,41064)|0;if(z){z=0;break}z=0,au(168,40608)|0;if(z){z=0;break}z=0,au(168,40696)|0;if(z){z=0;break}return}else{z=0}}while(0);a=bS(-1,-1,0)|0;dk(a)}function CP(a){a=a|0;c[a>>2]=14848;Ix(a+4|0);return}function CQ(a){a=a|0;c[a>>2]=14848;Ix(a+4|0);K1(a);return}function CR(b,d){b=b|0;d=d|0;var e=0;cC[c[(c[b>>2]|0)+24>>2]&511](b)|0;e=Iz(d,40568)|0;d=e;c[b+36>>2]=d;a[b+44|0]=(cC[c[(c[e>>2]|0)+28>>2]&511](d)|0)&1;return}function CS(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;b=i;i=i+16|0;d=b|0;e=b+8|0;f=a+36|0;g=a+40|0;h=d|0;j=d+8|0;k=d;d=a+32|0;while(1){a=c[f>>2]|0;l=cY[c[(c[a>>2]|0)+20>>2]&31](a,c[g>>2]|0,h,j,e)|0;a=(c[e>>2]|0)-k|0;if((a4(h|0,1,a|0,c[d>>2]|0)|0)!=(a|0)){m=-1;n=7;break}if((l|0)==2){m=-1;n=6;break}else if((l|0)!=1){n=4;break}}if((n|0)==7){i=b;return m|0}else if((n|0)==6){i=b;return m|0}else if((n|0)==4){m=((a1(c[d>>2]|0)|0)!=0)<<31>>31;i=b;return m|0}return 0}function CT(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0;if((a[b+44|0]&1)!=0){f=a4(d|0,4,e|0,c[b+32>>2]|0)|0;return f|0}g=b;if((e|0)>0){h=d;i=0}else{f=0;return f|0}while(1){if((cU[c[(c[g>>2]|0)+52>>2]&1023](b,c[h>>2]|0)|0)==-1){f=i;j=9;break}d=i+1|0;if((d|0)<(e|0)){h=h+4|0;i=d}else{f=d;j=10;break}}if((j|0)==10){return f|0}else if((j|0)==9){return f|0}return 0}function CU(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=(d|0)==-1;L1:do{if(!k){c[g>>2]=d;if((a[b+44|0]&1)!=0){if((a4(g|0,4,1,c[b+32>>2]|0)|0)==1){break}else{l=-1}i=e;return l|0}m=f|0;c[h>>2]=m;n=g+4|0;o=b+36|0;p=b+40|0;q=f+8|0;r=f;s=b+32|0;t=g;while(1){u=c[o>>2]|0;v=c$[c[(c[u>>2]|0)+12>>2]&31](u,c[p>>2]|0,t,n,j,m,q,h)|0;if((c[j>>2]|0)==(t|0)){l=-1;w=17;break}if((v|0)==3){w=7;break}u=(v|0)==1;if(v>>>0>=2>>>0){l=-1;w=18;break}v=(c[h>>2]|0)-r|0;if((a4(m|0,1,v|0,c[s>>2]|0)|0)!=(v|0)){l=-1;w=15;break}if(u){t=u?c[j>>2]|0:t}else{break L1}}if((w|0)==7){if((a4(t|0,1,1,c[s>>2]|0)|0)==1){break}else{l=-1}i=e;return l|0}else if((w|0)==15){i=e;return l|0}else if((w|0)==17){i=e;return l|0}else if((w|0)==18){i=e;return l|0}}}while(0);l=k?0:d;i=e;return l|0}function CV(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;i=i+8|0;g=f|0;h=b|0;c[h>>2]=14848;j=b+4|0;Iv(j);Ld(b+8|0,0,24)|0;c[h>>2]=15736;c[b+32>>2]=d;c[b+40>>2]=e;c[b+48>>2]=-1;a[b+52|0]=0;Iw(g,j);e=(z=0,aM(198,g|0,40568)|0);if(z){z=0;k=bS(-1,-1)|0;l=M;Ix(g);c[h>>2]=14848;Ix(j);bg(k|0)}d=e;m=b+36|0;c[m>>2]=d;n=b+44|0;c[n>>2]=cC[c[(c[e>>2]|0)+24>>2]&511](d)|0;d=c[m>>2]|0;a[b+53|0]=(cC[c[(c[d>>2]|0)+28>>2]&511](d)|0)&1;if((c[n>>2]|0)<=8){Ix(g);i=f;return}z=0;ar(52,80);if(!z){Ix(g);i=f;return}else{z=0;k=bS(-1,-1)|0;l=M;Ix(g);c[h>>2]=14848;Ix(j);bg(k|0)}}function CW(a){a=a|0;c[a>>2]=14848;Ix(a+4|0);return}function CX(a){a=a|0;c[a>>2]=14848;Ix(a+4|0);K1(a);return}function CY(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=Iz(d,40568)|0;d=e;f=b+36|0;c[f>>2]=d;g=b+44|0;c[g>>2]=cC[c[(c[e>>2]|0)+24>>2]&511](d)|0;d=c[f>>2]|0;a[b+53|0]=(cC[c[(c[d>>2]|0)+28>>2]&511](d)|0)&1;if((c[g>>2]|0)<=8){return}HR(80);return}function CZ(a){a=a|0;return C0(a,0)|0}function C_(a){a=a|0;return C0(a,1)|0}function C$(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=b+52|0;l=(a[k]&1)!=0;if((d|0)==-1){if(l){m=-1;i=e;return m|0}n=c[b+48>>2]|0;a[k]=(n|0)!=-1|0;m=n;i=e;return m|0}n=b+48|0;L8:do{if(l){c[h>>2]=c[n>>2];o=c[b+36>>2]|0;p=f|0;q=c$[c[(c[o>>2]|0)+12>>2]&31](o,c[b+40>>2]|0,h,h+4|0,j,p,f+8|0,g)|0;if((q|0)==3){a[p]=c[n>>2];c[g>>2]=f+1}else if((q|0)==2|(q|0)==1){m=-1;i=e;return m|0}q=b+32|0;while(1){o=c[g>>2]|0;if(o>>>0<=p>>>0){break L8}r=o-1|0;c[g>>2]=r;if((b4(a[r]|0,c[q>>2]|0)|0)==-1){m=-1;break}}i=e;return m|0}}while(0);c[n>>2]=d;a[k]=1;m=d;i=e;return m|0}function C0(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=b+52|0;if((a[k]&1)!=0){l=b+48|0;m=c[l>>2]|0;if(!d){n=m;i=e;return n|0}c[l>>2]=-1;a[k]=0;n=m;i=e;return n|0}m=c[b+44>>2]|0;k=(m|0)>1?m:1;L8:do{if((k|0)>0){m=b+32|0;l=0;while(1){o=bk(c[m>>2]|0)|0;if((o|0)==-1){n=-1;break}a[f+l|0]=o;l=l+1|0;if((l|0)>=(k|0)){break L8}}i=e;return n|0}}while(0);L15:do{if((a[b+53|0]&1)==0){l=b+40|0;m=b+36|0;o=f|0;p=g+4|0;q=b+32|0;r=k;while(1){s=c[l>>2]|0;t=s;u=c[t>>2]|0;v=c[t+4>>2]|0;t=c[m>>2]|0;w=f+r|0;x=c$[c[(c[t>>2]|0)+16>>2]&31](t,s,o,w,h,g,p,j)|0;if((x|0)==2){n=-1;y=26;break}else if((x|0)==3){y=14;break}else if((x|0)!=1){z=r;break L15}x=c[l>>2]|0;c[x>>2]=u;c[x+4>>2]=v;if((r|0)==8){n=-1;y=30;break}v=bk(c[q>>2]|0)|0;if((v|0)==-1){n=-1;y=31;break}a[w]=v;r=r+1|0}if((y|0)==26){i=e;return n|0}else if((y|0)==14){c[g>>2]=a[o]|0;z=r;break}else if((y|0)==30){i=e;return n|0}else if((y|0)==31){i=e;return n|0}}else{c[g>>2]=a[f|0]|0;z=k}}while(0);if(d){d=c[g>>2]|0;c[b+48>>2]=d;n=d;i=e;return n|0}d=b+32|0;b=z;while(1){if((b|0)<=0){break}z=b-1|0;if((b4(a[f+z|0]|0,c[d>>2]|0)|0)==-1){n=-1;y=27;break}else{b=z}}if((y|0)==27){i=e;return n|0}n=c[g>>2]|0;i=e;return n|0}function C1(a){a=a|0;c[a>>2]=14920;Ix(a+4|0);return}function C2(a){a=a|0;c[a>>2]=14920;Ix(a+4|0);K1(a);return}function C3(b,d){b=b|0;d=d|0;var e=0;cC[c[(c[b>>2]|0)+24>>2]&511](b)|0;e=Iz(d,40576)|0;d=e;c[b+36>>2]=d;a[b+44|0]=(cC[c[(c[e>>2]|0)+28>>2]&511](d)|0)&1;return}function C4(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;b=i;i=i+16|0;d=b|0;e=b+8|0;f=a+36|0;g=a+40|0;h=d|0;j=d+8|0;k=d;d=a+32|0;while(1){a=c[f>>2]|0;l=cY[c[(c[a>>2]|0)+20>>2]&31](a,c[g>>2]|0,h,j,e)|0;a=(c[e>>2]|0)-k|0;if((a4(h|0,1,a|0,c[d>>2]|0)|0)!=(a|0)){m=-1;n=6;break}if((l|0)==2){m=-1;n=8;break}else if((l|0)!=1){n=4;break}}if((n|0)==4){m=((a1(c[d>>2]|0)|0)!=0)<<31>>31;i=b;return m|0}else if((n|0)==8){i=b;return m|0}else if((n|0)==6){i=b;return m|0}return 0}function C5(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0;if((a[b+44|0]&1)!=0){g=a4(e|0,1,f|0,c[b+32>>2]|0)|0;return g|0}h=b;if((f|0)>0){i=e;j=0}else{g=0;return g|0}while(1){if((cU[c[(c[h>>2]|0)+52>>2]&1023](b,d[i]|0)|0)==-1){g=j;k=9;break}e=j+1|0;if((e|0)<(f|0)){i=i+1|0;j=e}else{g=e;k=8;break}}if((k|0)==9){return g|0}else if((k|0)==8){return g|0}return 0}function C6(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=(d|0)==-1;L1:do{if(!k){a[g]=d;if((a[b+44|0]&1)!=0){if((a4(g|0,1,1,c[b+32>>2]|0)|0)==1){break}else{l=-1}i=e;return l|0}m=f|0;c[h>>2]=m;n=g+1|0;o=b+36|0;p=b+40|0;q=f+8|0;r=f;s=b+32|0;t=g;while(1){u=c[o>>2]|0;v=c$[c[(c[u>>2]|0)+12>>2]&31](u,c[p>>2]|0,t,n,j,m,q,h)|0;if((c[j>>2]|0)==(t|0)){l=-1;w=15;break}if((v|0)==3){w=7;break}u=(v|0)==1;if(v>>>0>=2>>>0){l=-1;w=14;break}v=(c[h>>2]|0)-r|0;if((a4(m|0,1,v|0,c[s>>2]|0)|0)!=(v|0)){l=-1;w=16;break}if(u){t=u?c[j>>2]|0:t}else{break L1}}if((w|0)==7){if((a4(t|0,1,1,c[s>>2]|0)|0)==1){break}else{l=-1}i=e;return l|0}else if((w|0)==15){i=e;return l|0}else if((w|0)==16){i=e;return l|0}else if((w|0)==14){i=e;return l|0}}}while(0);l=k?0:d;i=e;return l|0}function C7(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;i=i+8|0;g=f|0;h=b|0;c[h>>2]=14920;j=b+4|0;Iv(j);Ld(b+8|0,0,24)|0;c[h>>2]=15808;c[b+32>>2]=d;c[b+40>>2]=e;c[b+48>>2]=-1;a[b+52|0]=0;Iw(g,j);e=(z=0,aM(198,g|0,40576)|0);if(z){z=0;k=bS(-1,-1)|0;l=M;Ix(g);c[h>>2]=14920;Ix(j);bg(k|0)}d=e;m=b+36|0;c[m>>2]=d;n=b+44|0;c[n>>2]=cC[c[(c[e>>2]|0)+24>>2]&511](d)|0;d=c[m>>2]|0;a[b+53|0]=(cC[c[(c[d>>2]|0)+28>>2]&511](d)|0)&1;if((c[n>>2]|0)<=8){Ix(g);i=f;return}z=0;ar(52,80);if(!z){Ix(g);i=f;return}else{z=0;k=bS(-1,-1)|0;l=M;Ix(g);c[h>>2]=14920;Ix(j);bg(k|0)}}function C8(a){a=a|0;c[a>>2]=14920;Ix(a+4|0);return}function C9(a){a=a|0;c[a>>2]=14920;Ix(a+4|0);K1(a);return}function Da(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=Iz(d,40576)|0;d=e;f=b+36|0;c[f>>2]=d;g=b+44|0;c[g>>2]=cC[c[(c[e>>2]|0)+24>>2]&511](d)|0;d=c[f>>2]|0;a[b+53|0]=(cC[c[(c[d>>2]|0)+28>>2]&511](d)|0)&1;if((c[g>>2]|0)<=8){return}HR(80);return}function Db(a){a=a|0;return De(a,0)|0}function Dc(a){a=a|0;return De(a,1)|0}function Dd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=b+52|0;l=(a[k]&1)!=0;if((d|0)==-1){if(l){m=-1;i=e;return m|0}n=c[b+48>>2]|0;a[k]=(n|0)!=-1|0;m=n;i=e;return m|0}n=b+48|0;L8:do{if(l){a[h]=c[n>>2];o=c[b+36>>2]|0;p=f|0;q=c$[c[(c[o>>2]|0)+12>>2]&31](o,c[b+40>>2]|0,h,h+1|0,j,p,f+8|0,g)|0;if((q|0)==3){a[p]=c[n>>2];c[g>>2]=f+1}else if((q|0)==2|(q|0)==1){m=-1;i=e;return m|0}q=b+32|0;while(1){o=c[g>>2]|0;if(o>>>0<=p>>>0){break L8}r=o-1|0;c[g>>2]=r;if((b4(a[r]|0,c[q>>2]|0)|0)==-1){m=-1;break}}i=e;return m|0}}while(0);c[n>>2]=d;a[k]=1;m=d;i=e;return m|0}function De(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;f=i;i=i+32|0;g=f|0;h=f+8|0;j=f+16|0;k=f+24|0;l=b+52|0;if((a[l]&1)!=0){m=b+48|0;n=c[m>>2]|0;if(!e){o=n;i=f;return o|0}c[m>>2]=-1;a[l]=0;o=n;i=f;return o|0}n=c[b+44>>2]|0;l=(n|0)>1?n:1;L8:do{if((l|0)>0){n=b+32|0;m=0;while(1){p=bk(c[n>>2]|0)|0;if((p|0)==-1){o=-1;break}a[g+m|0]=p;m=m+1|0;if((m|0)>=(l|0)){break L8}}i=f;return o|0}}while(0);L15:do{if((a[b+53|0]&1)==0){m=b+40|0;n=b+36|0;p=g|0;q=h+1|0;r=b+32|0;s=l;while(1){t=c[m>>2]|0;u=t;v=c[u>>2]|0;w=c[u+4>>2]|0;u=c[n>>2]|0;x=g+s|0;y=c$[c[(c[u>>2]|0)+16>>2]&31](u,t,p,x,j,h,q,k)|0;if((y|0)==3){z=14;break}else if((y|0)==2){o=-1;z=25;break}else if((y|0)!=1){A=s;break L15}y=c[m>>2]|0;c[y>>2]=v;c[y+4>>2]=w;if((s|0)==8){o=-1;z=29;break}w=bk(c[r>>2]|0)|0;if((w|0)==-1){o=-1;z=30;break}a[x]=w;s=s+1|0}if((z|0)==29){i=f;return o|0}else if((z|0)==30){i=f;return o|0}else if((z|0)==14){a[h]=a[p]|0;A=s;break}else if((z|0)==25){i=f;return o|0}}else{a[h]=a[g|0]|0;A=l}}while(0);do{if(e){l=a[h]|0;c[b+48>>2]=l&255;B=l}else{l=b+32|0;k=A;while(1){if((k|0)<=0){z=21;break}j=k-1|0;if((b4(d[g+j|0]|0|0,c[l>>2]|0)|0)==-1){o=-1;z=28;break}else{k=j}}if((z|0)==28){i=f;return o|0}else if((z|0)==21){B=a[h]|0;break}}}while(0);o=B&255;i=f;return o|0}function Df(){CN(0);bm(104,41328,t|0)|0;return}function Dg(a){a=a|0;return}function Dh(a){a=a|0;var b=0;b=a+4|0;K=c[b>>2]|0,c[b>>2]=K+1,K;return}function Di(a){a=a|0;var b=0,d=0;b=a+4|0;if(((K=c[b>>2]|0,c[b>>2]=K+ -1,K)|0)!=0){d=0;return d|0}cz[c[(c[a>>2]|0)+8>>2]&1023](a);d=1;return d|0}function Dj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;c[a>>2]=13080;d=Le(b|0)|0;e=K0(d+13|0)|0;c[e+4>>2]=d;c[e>>2]=d;f=e+12|0;c[a+4>>2]=f;c[e+8>>2]=0;La(f|0,b|0,d+1|0)|0;return}function Dk(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=13080;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((K=c[d>>2]|0,c[d>>2]=K+ -1,K)-1|0)>=0){e=a;K1(e);return}K2((c[b>>2]|0)-12|0);e=a;K1(e);return}function Dl(a){a=a|0;var b=0;c[a>>2]=13080;b=a+4|0;a=(c[b>>2]|0)-4|0;if(((K=c[a>>2]|0,c[a>>2]=K+ -1,K)-1|0)>=0){return}K2((c[b>>2]|0)-12|0);return}function Dm(a){a=a|0;return c[a+4>>2]|0}function Dn(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;c[b>>2]=12984;if((a[d]&1)==0){e=d+1|0}else{e=c[d+8>>2]|0}d=Le(e|0)|0;f=K0(d+13|0)|0;c[f+4>>2]=d;c[f>>2]=d;g=f+12|0;c[b+4>>2]=g;c[f+8>>2]=0;La(g|0,e|0,d+1|0)|0;return}function Do(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;c[a>>2]=12984;d=Le(b|0)|0;e=K0(d+13|0)|0;c[e+4>>2]=d;c[e>>2]=d;f=e+12|0;c[a+4>>2]=f;c[e+8>>2]=0;La(f|0,b|0,d+1|0)|0;return}function Dp(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=12984;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((K=c[d>>2]|0,c[d>>2]=K+ -1,K)-1|0)>=0){e=a;K1(e);return}K2((c[b>>2]|0)-12|0);e=a;K1(e);return}function Dq(a){a=a|0;var b=0;c[a>>2]=12984;b=a+4|0;a=(c[b>>2]|0)-4|0;if(((K=c[a>>2]|0,c[a>>2]=K+ -1,K)-1|0)>=0){return}K2((c[b>>2]|0)-12|0);return}function Dr(a){a=a|0;return c[a+4>>2]|0}function Ds(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=13080;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((K=c[d>>2]|0,c[d>>2]=K+ -1,K)-1|0)>=0){e=a;K1(e);return}K2((c[b>>2]|0)-12|0);e=a;K1(e);return}function Dt(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=13080;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((K=c[d>>2]|0,c[d>>2]=K+ -1,K)-1|0)>=0){e=a;K1(e);return}K2((c[b>>2]|0)-12|0);e=a;K1(e);return}function Du(a){a=a|0;return}function Dv(a,b,d){a=a|0;b=b|0;d=d|0;c[a>>2]=d;c[a+4>>2]=b;return}function Dw(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;cZ[c[(c[a>>2]|0)+12>>2]&511](f,a,b);if((c[f+4>>2]|0)!=(c[d+4>>2]|0)){g=0;i=e;return g|0}g=(c[f>>2]|0)==(c[d>>2]|0);i=e;return g|0}function Dx(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;if((c[b+4>>2]|0)!=(a|0)){e=0;return e|0}e=(c[b>>2]|0)==(d|0);return e|0}function Dy(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;d=b$(e|0)|0;e=Le(d|0)|0;if(e>>>0>4294967279>>>0){DE(0)}if(e>>>0<11>>>0){a[b]=e<<1;f=b+1|0;La(f|0,d|0,e)|0;g=f+e|0;a[g]=0;return}else{h=e+16&-16;i=K$(h)|0;c[b+8>>2]=i;c[b>>2]=h|1;c[b+4>>2]=e;f=i;La(f|0,d|0,e)|0;g=f+e|0;a[g]=0;return}}function Dz(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;g=i;h=f;j=i;i=i+12|0;i=i+7&-8;k=e|0;l=c[k>>2]|0;do{if((l|0)!=0){m=d[h]|0;if((m&1|0)==0){n=m>>>1}else{n=c[f+4>>2]|0}if((n|0)==0){o=l}else{DR(f,8752,2)|0;o=c[k>>2]|0}m=c[e+4>>2]|0;cZ[c[(c[m>>2]|0)+24>>2]&511](j,m,o);m=j;p=a[m]|0;if((p&1)==0){q=j+1|0}else{q=c[j+8>>2]|0}r=p&255;if((r&1|0)==0){s=r>>>1}else{s=c[j+4>>2]|0}z=0,az(84,f|0,q|0,s|0)|0;if(!z){if((a[m]&1)==0){break}K1(c[j+8>>2]|0);break}else{z=0}r=bS(-1,-1)|0;if((a[m]&1)==0){bg(r|0)}K1(c[j+8>>2]|0);bg(r|0)}}while(0);j=b;c[j>>2]=c[h>>2];c[j+4>>2]=c[h+4>>2];c[j+8>>2]=c[h+8>>2];Ld(h|0,0,12)|0;i=g;return}function DA(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0;f=i;i=i+32|0;g=d;d=i;i=i+8|0;c[d>>2]=c[g>>2];c[d+4>>2]=c[g+4>>2];g=f|0;h=f+16|0;j=Le(e|0)|0;if(j>>>0>4294967279>>>0){DE(0)}if(j>>>0<11>>>0){a[h]=j<<1;k=h+1|0}else{l=j+16&-16;m=K$(l)|0;c[h+8>>2]=m;c[h>>2]=l|1;c[h+4>>2]=j;k=m}La(k|0,e|0,j)|0;a[k+j|0]=0;z=0;aR(252,g|0,d|0,h|0);do{if(!z){z=0;as(98,b|0,g|0);if(z){z=0;j=bS(-1,-1)|0;k=j;j=M;if((a[g]&1)==0){n=j;o=k;break}K1(c[g+8>>2]|0);n=j;o=k;break}if((a[g]&1)!=0){K1(c[g+8>>2]|0)}if((a[h]&1)==0){p=b|0;c[p>>2]=15304;q=b+8|0;r=d;s=q;t=r|0;u=c[t>>2]|0;v=r+4|0;w=c[v>>2]|0;x=s|0;c[x>>2]=u;y=s+4|0;c[y>>2]=w;i=f;return}K1(c[h+8>>2]|0);p=b|0;c[p>>2]=15304;q=b+8|0;r=d;s=q;t=r|0;u=c[t>>2]|0;v=r+4|0;w=c[v>>2]|0;x=s|0;c[x>>2]=u;y=s+4|0;c[y>>2]=w;i=f;return}else{z=0;k=bS(-1,-1)|0;n=M;o=k}}while(0);if((a[h]&1)==0){A=o;B=0;C=A;D=n;bg(C|0)}K1(c[h+8>>2]|0);A=o;B=0;C=A;D=n;bg(C|0)}function DB(a){a=a|0;Dq(a|0);K1(a);return}function DC(a){a=a|0;Dq(a|0);return}function DD(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e;if((c[a>>2]|0)==1){do{bd(40328,40304)|0;}while((c[a>>2]|0)==1)}if((c[a>>2]|0)!=0){f;return}c[a>>2]=1;z=0,au(268,40304)|0;do{if(!z){z=0;ar(d|0,b|0);if(z){z=0;break}z=0,au(14,40304)|0;if(z){z=0;break}c[a>>2]=-1;z=0,au(268,40304)|0;if(z){z=0;break}z=0,au(116,40328)|0;if(z){z=0;break}return}else{z=0}}while(0);b=bS(-1,-1,0)|0;bC(b|0)|0;z=0,au(14,40304)|0;do{if(!z){c[a>>2]=0;z=0,au(268,40304)|0;if(z){z=0;break}z=0,au(116,40328)|0;if(z){z=0;break}z=0;aS(6);if(z){z=0;break}}else{z=0}}while(0);a=bS(-1,-1)|0;z=0;aS(2);if(!z){bg(a|0)}else{z=0;a=bS(-1,-1,0)|0;dk(a)}}function DE(a){a=a|0;var b=0;a=ck(8)|0;z=0;as(616,a|0,1240);if(!z){c[a>>2]=13048;bJ(a|0,28536,472)}else{z=0;b=bS(-1,-1)|0;bn(a|0);bg(b|0)}}function DF(a){a=a|0;var b=0;a=ck(8)|0;z=0;as(616,a|0,1240);if(!z){c[a>>2]=13016;bJ(a|0,28520,10)}else{z=0;b=bS(-1,-1)|0;bn(a|0);bg(b|0)}}function DG(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=d;if((a[e]&1)==0){f=b;c[f>>2]=c[e>>2];c[f+4>>2]=c[e+4>>2];c[f+8>>2]=c[e+8>>2];return}e=c[d+8>>2]|0;f=c[d+4>>2]|0;if(f>>>0>4294967279>>>0){DE(0)}if(f>>>0<11>>>0){a[b]=f<<1;g=b+1|0}else{d=f+16&-16;h=K$(d)|0;c[b+8>>2]=h;c[b>>2]=d|1;c[b+4>>2]=f;g=h}La(g|0,e|0,f)|0;a[g+f|0]=0;return}function DH(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;if(e>>>0>4294967279>>>0){DE(0)}if(e>>>0<11>>>0){a[b]=e<<1;f=b+1|0;La(f|0,d|0,e)|0;g=f+e|0;a[g]=0;return}else{h=e+16&-16;i=K$(h)|0;c[b+8>>2]=i;c[b>>2]=h|1;c[b+4>>2]=e;f=i;La(f|0,d|0,e)|0;g=f+e|0;a[g]=0;return}}function DI(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;if(d>>>0>4294967279>>>0){DE(0)}if(d>>>0<11>>>0){a[b]=d<<1;f=b+1|0}else{g=d+16&-16;h=K$(g)|0;c[b+8>>2]=h;c[b>>2]=g|1;c[b+4>>2]=d;f=h}Ld(f|0,e|0,d|0)|0;a[f+d|0]=0;return}function DJ(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0;g=a[d]|0;h=g&255;if((h&1|0)==0){i=h>>>1}else{i=c[d+4>>2]|0}if(i>>>0<e>>>0){DF(0)}if((g&1)==0){j=d+1|0}else{j=c[d+8>>2]|0}d=j+e|0;j=i-e|0;e=j>>>0<f>>>0?j:f;if(e>>>0>4294967279>>>0){DE(0)}if(e>>>0<11>>>0){a[b]=e<<1;k=b+1|0;La(k|0,d|0,e)|0;l=k+e|0;a[l]=0;return}else{f=e+16&-16;j=K$(f)|0;c[b+8>>2]=j;c[b>>2]=f|1;c[b+4>>2]=e;k=j;La(k|0,d|0,e)|0;l=k+e|0;a[l]=0;return}}function DK(b){b=b|0;if((a[b]&1)==0){return}K1(c[b+8>>2]|0);return}function DL(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;if((b|0)==(d|0)){return b|0}e=a[d]|0;if((e&1)==0){f=d+1|0}else{f=c[d+8>>2]|0}g=e&255;if((g&1|0)==0){h=g>>>1}else{h=c[d+4>>2]|0}d=b;g=b;e=a[g]|0;if((e&1)==0){i=10;j=e}else{e=c[b>>2]|0;i=(e&-2)-1|0;j=e&255}if(i>>>0<h>>>0){e=j&255;if((e&1|0)==0){k=e>>>1}else{k=c[b+4>>2]|0}DS(b,i,h-i|0,k,0,k,h,f);return b|0}if((j&1)==0){l=d+1|0}else{l=c[b+8>>2]|0}Lb(l|0,f|0,h|0)|0;a[l+h|0]=0;if((a[g]&1)==0){a[g]=h<<1;return b|0}else{c[b+4>>2]=h;return b|0}return 0}function DM(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=Le(d|0)|0;f=b;g=b;h=a[g]|0;if((h&1)==0){i=10;j=h}else{h=c[b>>2]|0;i=(h&-2)-1|0;j=h&255}if(i>>>0<e>>>0){h=j&255;if((h&1|0)==0){k=h>>>1}else{k=c[b+4>>2]|0}DS(b,i,e-i|0,k,0,k,e,d);return b|0}if((j&1)==0){l=f+1|0}else{l=c[b+8>>2]|0}Lb(l|0,d|0,e|0)|0;a[l+e|0]=0;if((a[g]&1)==0){a[g]=e<<1;return b|0}else{c[b+4>>2]=e;return b|0}return 0}function DN(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b;g=a[f]|0;h=g&255;if((h&1|0)==0){i=h>>>1}else{i=c[b+4>>2]|0}if(i>>>0<d>>>0){DO(b,d-i|0,e)|0;return}if((g&1)==0){a[b+1+d|0]=0;a[f]=d<<1;return}else{a[(c[b+8>>2]|0)+d|0]=0;c[b+4>>2]=d;return}}function DO(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0;if((d|0)==0){return b|0}f=b;g=a[f]|0;if((g&1)==0){h=10;i=g}else{g=c[b>>2]|0;h=(g&-2)-1|0;i=g&255}g=i&255;if((g&1|0)==0){j=g>>>1}else{j=c[b+4>>2]|0}if((h-j|0)>>>0<d>>>0){DT(b,h,d-h+j|0,j,j,0,0);k=a[f]|0}else{k=i}if((k&1)==0){l=b+1|0}else{l=c[b+8>>2]|0}Ld(l+j|0,e|0,d|0)|0;e=j+d|0;if((a[f]&1)==0){a[f]=e<<1}else{c[b+4>>2]=e}a[l+e|0]=0;return b|0}function DP(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;if(d>>>0>4294967279>>>0){DE(0)}e=b;f=b;g=a[f]|0;if((g&1)==0){h=10;i=g}else{g=c[b>>2]|0;h=(g&-2)-1|0;i=g&255}g=i&255;if((g&1|0)==0){j=g>>>1}else{j=c[b+4>>2]|0}g=j>>>0>d>>>0?j:d;if(g>>>0<11>>>0){k=11}else{k=g+16&-16}g=k-1|0;if((g|0)==(h|0)){return}if((g|0)==10){l=e+1|0;m=c[b+8>>2]|0;n=1;o=0}else{do{if(g>>>0>h>>>0){p=K$(k)|0}else{d=(z=0,au(246,k|0)|0);if(!z){p=d;break}else{z=0}d=bS(-1,-1,0)|0;bC(d|0)|0;a$();return}}while(0);h=i&1;if(h<<24>>24==0){q=e+1|0}else{q=c[b+8>>2]|0}l=p;m=q;n=h<<24>>24!=0;o=1}h=i&255;if((h&1|0)==0){r=h>>>1}else{r=c[b+4>>2]|0}La(l|0,m|0,r+1|0)|0;if(n){K1(m)}if(o){c[b>>2]=k|1;c[b+4>>2]=j;c[b+8>>2]=l;return}else{a[f]=j<<1;return}}function DQ(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;e=b;f=a[e]|0;if((f&1)==0){g=(f&255)>>>1;h=10}else{g=c[b+4>>2]|0;h=(c[b>>2]&-2)-1|0}if((g|0)==(h|0)){DT(b,h,1,h,h,0,0);i=a[e]|0}else{i=f}if((i&1)==0){a[e]=(g<<1)+2;j=b+1|0;k=g+1|0;l=j+g|0;a[l]=d;m=j+k|0;a[m]=0;return}else{e=c[b+8>>2]|0;i=g+1|0;c[b+4>>2]=i;j=e;k=i;l=j+g|0;a[l]=d;m=j+k|0;a[m]=0;return}}function DR(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;f=b;g=a[f]|0;if((g&1)==0){h=10;i=g}else{g=c[b>>2]|0;h=(g&-2)-1|0;i=g&255}g=i&255;if((g&1|0)==0){j=g>>>1}else{j=c[b+4>>2]|0}if((h-j|0)>>>0<e>>>0){DS(b,h,e-h+j|0,j,j,0,e,d);return b|0}if((e|0)==0){return b|0}if((i&1)==0){k=b+1|0}else{k=c[b+8>>2]|0}La(k+j|0,d|0,e)|0;d=j+e|0;if((a[f]&1)==0){a[f]=d<<1}else{c[b+4>>2]=d}a[k+d|0]=0;return b|0}function DS(b,d,e,f,g,h,i,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;if((-18-d|0)>>>0<e>>>0){DE(0)}if((a[b]&1)==0){k=b+1|0}else{k=c[b+8>>2]|0}do{if(d>>>0<2147483623>>>0){l=e+d|0;m=d<<1;n=l>>>0<m>>>0?m:l;if(n>>>0<11>>>0){o=11;break}o=n+16&-16}else{o=-17}}while(0);e=K$(o)|0;if((g|0)!=0){La(e|0,k|0,g)|0}if((i|0)!=0){La(e+g|0,j|0,i)|0}j=f-h|0;if((j|0)!=(g|0)){La(e+(i+g)|0,k+(h+g)|0,j-g|0)|0}if((d|0)==10){p=b+8|0;c[p>>2]=e;q=o|1;r=b|0;c[r>>2]=q;s=j+i|0;t=b+4|0;c[t>>2]=s;u=e+s|0;a[u]=0;return}K1(k);p=b+8|0;c[p>>2]=e;q=o|1;r=b|0;c[r>>2]=q;s=j+i|0;t=b+4|0;c[t>>2]=s;u=e+s|0;a[u]=0;return}function DT(b,d,e,f,g,h,i){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;if((-17-d|0)>>>0<e>>>0){DE(0)}if((a[b]&1)==0){j=b+1|0}else{j=c[b+8>>2]|0}do{if(d>>>0<2147483623>>>0){k=e+d|0;l=d<<1;m=k>>>0<l>>>0?l:k;if(m>>>0<11>>>0){n=11;break}n=m+16&-16}else{n=-17}}while(0);e=K$(n)|0;if((g|0)!=0){La(e|0,j|0,g)|0}m=f-h|0;if((m|0)!=(g|0)){La(e+(i+g)|0,j+(h+g)|0,m-g|0)|0}if((d|0)==10){o=b+8|0;c[o>>2]=e;p=n|1;q=b|0;c[q>>2]=p;return}K1(j);o=b+8|0;c[o>>2]=e;p=n|1;q=b|0;c[q>>2]=p;return}function DU(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0;if(e>>>0>1073741807>>>0){DE(0)}if(e>>>0<2>>>0){a[b]=e<<1;f=b+4|0;g=Ks(f,d,e)|0;h=f+(e<<2)|0;c[h>>2]=0;return}else{i=e+4&-4;j=K$(i<<2)|0;c[b+8>>2]=j;c[b>>2]=i|1;c[b+4>>2]=e;f=j;g=Ks(f,d,e)|0;h=f+(e<<2)|0;c[h>>2]=0;return}}function DV(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0;if(d>>>0>1073741807>>>0){DE(0)}if(d>>>0<2>>>0){a[b]=d<<1;f=b+4|0;g=Ku(f,e,d)|0;h=f+(d<<2)|0;c[h>>2]=0;return}else{i=d+4&-4;j=K$(i<<2)|0;c[b+8>>2]=j;c[b>>2]=i|1;c[b+4>>2]=d;f=j;g=Ku(f,e,d)|0;h=f+(d<<2)|0;c[h>>2]=0;return}}function DW(b){b=b|0;if((a[b]&1)==0){return}K1(c[b+8>>2]|0);return}function DX(a,b){a=a|0;b=b|0;return DY(a,b,Kr(b)|0)|0}function DY(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;f=b;g=a[f]|0;if((g&1)==0){h=1;i=g}else{g=c[b>>2]|0;h=(g&-2)-1|0;i=g&255}if(h>>>0<e>>>0){g=i&255;if((g&1|0)==0){j=g>>>1}else{j=c[b+4>>2]|0}D$(b,h,e-h|0,j,0,j,e,d);return b|0}if((i&1)==0){k=b+4|0}else{k=c[b+8>>2]|0}Kt(k,d,e)|0;c[k+(e<<2)>>2]=0;if((a[f]&1)==0){a[f]=e<<1;return b|0}else{c[b+4>>2]=e;return b|0}return 0}function DZ(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;if(d>>>0>1073741807>>>0){DE(0)}e=b;f=a[e]|0;if((f&1)==0){g=1;h=f}else{f=c[b>>2]|0;g=(f&-2)-1|0;h=f&255}f=h&255;if((f&1|0)==0){i=f>>>1}else{i=c[b+4>>2]|0}f=i>>>0>d>>>0?i:d;if(f>>>0<2>>>0){j=2}else{j=f+4&-4}f=j-1|0;if((f|0)==(g|0)){return}if((f|0)==1){k=b+4|0;l=c[b+8>>2]|0;m=1;n=0}else{d=j<<2;do{if(f>>>0>g>>>0){o=K$(d)|0}else{p=(z=0,au(246,d|0)|0);if(!z){o=p;break}else{z=0}p=bS(-1,-1,0)|0;bC(p|0)|0;a$();return}}while(0);d=h&1;if(d<<24>>24==0){q=b+4|0}else{q=c[b+8>>2]|0}k=o;l=q;m=d<<24>>24!=0;n=1}d=k;k=h&255;if((k&1|0)==0){r=k>>>1}else{r=c[b+4>>2]|0}Ks(d,l,r+1|0)|0;if(m){K1(l)}if(n){c[b>>2]=j|1;c[b+4>>2]=i;c[b+8>>2]=d;return}else{a[e]=i<<1;return}}function D_(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;e=b;f=a[e]|0;if((f&1)==0){g=(f&255)>>>1;h=1}else{g=c[b+4>>2]|0;h=(c[b>>2]&-2)-1|0}if((g|0)==(h|0)){D0(b,h,1,h,h,0,0);i=a[e]|0}else{i=f}if((i&1)==0){a[e]=(g<<1)+2;j=b+4|0;k=g+1|0;l=j+(g<<2)|0;c[l>>2]=d;m=j+(k<<2)|0;c[m>>2]=0;return}else{e=c[b+8>>2]|0;i=g+1|0;c[b+4>>2]=i;j=e;k=i;l=j+(g<<2)|0;c[l>>2]=d;m=j+(k<<2)|0;c[m>>2]=0;return}}function D$(b,d,e,f,g,h,i,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;if((1073741806-d|0)>>>0<e>>>0){DE(0)}if((a[b]&1)==0){k=b+4|0}else{k=c[b+8>>2]|0}do{if(d>>>0<536870887>>>0){l=e+d|0;m=d<<1;n=l>>>0<m>>>0?m:l;if(n>>>0<2>>>0){o=2;break}o=n+4&-4}else{o=1073741807}}while(0);e=K$(o<<2)|0;if((g|0)!=0){Ks(e,k,g)|0}if((i|0)!=0){Ks(e+(g<<2)|0,j,i)|0}j=f-h|0;if((j|0)!=(g|0)){Ks(e+(i+g<<2)|0,k+(h+g<<2)|0,j-g|0)|0}if((d|0)==1){p=b+8|0;c[p>>2]=e;q=o|1;r=b|0;c[r>>2]=q;s=j+i|0;t=b+4|0;c[t>>2]=s;u=e+(s<<2)|0;c[u>>2]=0;return}K1(k);p=b+8|0;c[p>>2]=e;q=o|1;r=b|0;c[r>>2]=q;s=j+i|0;t=b+4|0;c[t>>2]=s;u=e+(s<<2)|0;c[u>>2]=0;return}function D0(b,d,e,f,g,h,i){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;if((1073741807-d|0)>>>0<e>>>0){DE(0)}if((a[b]&1)==0){j=b+4|0}else{j=c[b+8>>2]|0}do{if(d>>>0<536870887>>>0){k=e+d|0;l=d<<1;m=k>>>0<l>>>0?l:k;if(m>>>0<2>>>0){n=2;break}n=m+4&-4}else{n=1073741807}}while(0);e=K$(n<<2)|0;if((g|0)!=0){Ks(e,j,g)|0}m=f-h|0;if((m|0)!=(g|0)){Ks(e+(i+g<<2)|0,j+(h+g<<2)|0,m-g|0)|0}if((d|0)==1){o=b+8|0;c[o>>2]=e;p=n|1;q=b|0;c[q>>2]=p;return}K1(j);o=b+8|0;c[o>>2]=e;p=n|1;q=b|0;c[q>>2]=p;return}function D1(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;g=(c[b+24>>2]|0)==0;if(g){c[b+16>>2]=d|1}else{c[b+16>>2]=d}if(((g&1|d)&c[b+20>>2]|0)==0){i=e;return}e=ck(16)|0;do{if((a[41448]|0)==0){if((bB(41448)|0)==0){break}c[9836]=14544;bm(186,39344,t|0)|0}}while(0);b=Li(39344,0,32)|0;c[f>>2]=b|1;c[f+4>>2]=M;z=0;aR(428,e|0,f|0,9152);if(!z){c[e>>2]=13728;bJ(e|0,29096,162)}else{z=0;f=bS(-1,-1)|0;bn(e|0);bg(f|0)}}function D2(a){a=a|0;var b=0,d=0,e=0,f=0;c[a>>2]=13704;b=c[a+40>>2]|0;d=a+32|0;e=a+36|0;L1:do{if((b|0)!=0){f=b;while(1){f=f-1|0;z=0;aR(c[(c[d>>2]|0)+(f<<2)>>2]|0,0,a|0,c[(c[e>>2]|0)+(f<<2)>>2]|0);if(z){z=0;break}if((f|0)==0){break L1}}f=bS(-1,-1,0)|0;dk(f)}}while(0);Ix(a+28|0);KW(c[d>>2]|0);KW(c[e>>2]|0);KW(c[a+48>>2]|0);KW(c[a+60>>2]|0);return}function D3(a,b){a=a|0;b=b|0;Iw(a,b+28|0);return}function D4(a,b){a=a|0;b=b|0;c[a+24>>2]=b;c[a+16>>2]=(b|0)==0;c[a+20>>2]=0;c[a+4>>2]=4098;c[a+12>>2]=0;c[a+8>>2]=6;Ld(a+32|0,0,40)|0;Iv(a+28|0);return}function D5(a){a=a|0;c[a>>2]=14920;Ix(a+4|0);K1(a);return}function D6(a){a=a|0;c[a>>2]=14920;Ix(a+4|0);return}function D7(a,b){a=a|0;b=b|0;return}function D8(a,b,c){a=a|0;b=b|0;c=c|0;return a|0}function D9(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;g=a;c[g>>2]=0;c[g+4>>2]=0;g=a+8|0;c[g>>2]=-1;c[g+4>>2]=-1;return}function Ea(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;e=i;b=d;d=i;i=i+16|0;c[d>>2]=c[b>>2];c[d+4>>2]=c[b+4>>2];c[d+8>>2]=c[b+8>>2];c[d+12>>2]=c[b+12>>2];b=a;c[b>>2]=0;c[b+4>>2]=0;b=a+8|0;c[b>>2]=-1;c[b+4>>2]=-1;i=e;return}function Eb(a){a=a|0;return 0}function Ec(a){a=a|0;return 0}function Ed(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;f=b;if((e|0)<=0){g=0;return g|0}h=b+12|0;i=b+16|0;j=d;d=0;while(1){k=c[h>>2]|0;if(k>>>0<(c[i>>2]|0)>>>0){c[h>>2]=k+1;l=a[k]|0}else{k=cC[c[(c[f>>2]|0)+40>>2]&511](b)|0;if((k|0)==-1){g=d;m=11;break}l=k&255}a[j]=l;k=d+1|0;if((k|0)<(e|0)){j=j+1|0;d=k}else{g=k;m=10;break}}if((m|0)==10){return g|0}else if((m|0)==11){return g|0}return 0}function Ee(a){a=a|0;return-1|0}function Ef(a){a=a|0;var b=0,e=0;if((cC[c[(c[a>>2]|0)+36>>2]&511](a)|0)==-1){b=-1;return b|0}e=a+12|0;a=c[e>>2]|0;c[e>>2]=a+1;b=d[a]|0;return b|0}function Eg(a,b){a=a|0;b=b|0;return-1|0}function Eh(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;g=b;if((f|0)<=0){h=0;return h|0}i=b+24|0;j=b+28|0;k=0;l=e;while(1){e=c[i>>2]|0;if(e>>>0<(c[j>>2]|0)>>>0){m=a[l]|0;c[i>>2]=e+1;a[e]=m}else{if((cU[c[(c[g>>2]|0)+52>>2]&1023](b,d[l]|0)|0)==-1){h=k;n=10;break}}m=k+1|0;if((m|0)<(f|0)){k=m;l=l+1|0}else{h=m;n=9;break}}if((n|0)==9){return h|0}else if((n|0)==10){return h|0}return 0}function Ei(a,b){a=a|0;b=b|0;return-1|0}function Ej(a){a=a|0;c[a>>2]=14848;Ix(a+4|0);K1(a);return}function Ek(a){a=a|0;c[a>>2]=14848;Ix(a+4|0);return}function El(a,b){a=a|0;b=b|0;return}function Em(a,b,c){a=a|0;b=b|0;c=c|0;return a|0}function En(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;g=a;c[g>>2]=0;c[g+4>>2]=0;g=a+8|0;c[g>>2]=-1;c[g+4>>2]=-1;return}function Eo(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;e=i;b=d;d=i;i=i+16|0;c[d>>2]=c[b>>2];c[d+4>>2]=c[b+4>>2];c[d+8>>2]=c[b+8>>2];c[d+12>>2]=c[b+12>>2];b=a;c[b>>2]=0;c[b+4>>2]=0;b=a+8|0;c[b>>2]=-1;c[b+4>>2]=-1;i=e;return}function Ep(a){a=a|0;return 0}function Eq(a){a=a|0;return 0}function Er(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=a;if((d|0)<=0){f=0;return f|0}g=a+12|0;h=a+16|0;i=b;b=0;while(1){j=c[g>>2]|0;if(j>>>0<(c[h>>2]|0)>>>0){c[g>>2]=j+4;k=c[j>>2]|0}else{j=cC[c[(c[e>>2]|0)+40>>2]&511](a)|0;if((j|0)==-1){f=b;l=10;break}else{k=j}}c[i>>2]=k;j=b+1|0;if((j|0)<(d|0)){i=i+4|0;b=j}else{f=j;l=9;break}}if((l|0)==9){return f|0}else if((l|0)==10){return f|0}return 0}function Es(a){a=a|0;return-1|0}function Et(a){a=a|0;var b=0,d=0;if((cC[c[(c[a>>2]|0)+36>>2]&511](a)|0)==-1){b=-1;return b|0}d=a+12|0;a=c[d>>2]|0;c[d>>2]=a+4;b=c[a>>2]|0;return b|0}function Eu(a,b){a=a|0;b=b|0;return-1|0}function Ev(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=a;if((d|0)<=0){f=0;return f|0}g=a+24|0;h=a+28|0;i=0;j=b;while(1){b=c[g>>2]|0;if(b>>>0<(c[h>>2]|0)>>>0){k=c[j>>2]|0;c[g>>2]=b+4;c[b>>2]=k}else{if((cU[c[(c[e>>2]|0)+52>>2]&1023](a,c[j>>2]|0)|0)==-1){f=i;l=9;break}}k=i+1|0;if((k|0)<(d|0)){i=k;j=j+4|0}else{f=k;l=10;break}}if((l|0)==9){return f|0}else if((l|0)==10){return f|0}return 0}function Ew(a,b){a=a|0;b=b|0;return-1|0}function Ex(a){a=a|0;D2(a+8|0);K1(a);return}function Ey(a){a=a|0;D2(a+8|0);return}function Ez(a){a=a|0;var b=0,d=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;D2(b+(d+8)|0);K1(b+d|0);return}function EA(a){a=a|0;D2(a+((c[(c[a>>2]|0)-12>>2]|0)+8)|0);return}function EB(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;d=i;i=i+8|0;e=d|0;f=b;g=c[(c[f>>2]|0)-12>>2]|0;h=b;if((c[h+(g+24)>>2]|0)==0){i=d;return b|0}j=e|0;a[j]=0;c[e+4>>2]=b;do{if((c[h+(g+16)>>2]|0)==0){k=c[h+(g+72)>>2]|0;do{if((k|0)==0){l=5}else{z=0,au(62,k|0)|0;if(!z){l=5;break}else{z=0}m=bS(-1,-1,0)|0;n=m}}while(0);if((l|0)==5){a[j]=1;k=c[h+((c[(c[f>>2]|0)-12>>2]|0)+24)>>2]|0;m=(z=0,au(c[(c[k>>2]|0)+24>>2]|0,k|0)|0);if(!z){if((m|0)!=-1){break}m=c[(c[f>>2]|0)-12>>2]|0;z=0;as(364,h+m|0,c[h+(m+16)>>2]|1|0);if(!z){break}else{z=0}}else{z=0}m=bS(-1,-1,0)|0;EP(e);n=m}bC(n|0)|0;m=c[(c[f>>2]|0)-12>>2]|0;k=h+(m+16)|0;c[k>>2]=c[k>>2]|1;if((c[h+(m+20)>>2]&1|0)==0){a$();i=d;return b|0}z=0;aS(6);if(!z){return 0}else{z=0}m=bS(-1,-1)|0;z=0;aS(2);if(!z){bg(m|0)}else{z=0;m=bS(-1,-1,0)|0;dk(m);return 0}}}while(0);EP(e);i=d;return b|0}function EC(a){a=a|0;var b=0;b=a+16|0;c[b>>2]=c[b>>2]|1;if((c[a+20>>2]&1|0)==0){return}else{be()}}function ED(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;e=a+4|0;c[e>>2]=0;f=a;g=c[(c[f>>2]|0)-12>>2]|0;h=a;i=c[h+(g+16)>>2]|0;do{if((i|0)==0){j=c[h+(g+72)>>2]|0;if((j|0)==0){k=g}else{z=0,au(62,j|0)|0;if(z){z=0;break}k=c[(c[f>>2]|0)-12>>2]|0}if((c[h+(k+16)>>2]|0)!=0){l=k;m=16;break}j=c[h+(k+24)>>2]|0;n=(z=0,az(c[(c[j>>2]|0)+32>>2]|0,j|0,b|0,d|0)|0);if(z){z=0;break}c[e>>2]=n;if((n|0)==(d|0)){return a|0}n=c[(c[f>>2]|0)-12>>2]|0;z=0;as(364,h+n|0,c[h+(n+16)>>2]|6|0);if(z){z=0;break}return a|0}else{z=0;as(364,h+g|0,i|4|0);if(z){z=0;break}l=c[(c[f>>2]|0)-12>>2]|0;m=16}}while(0);do{if((m|0)==16){z=0;as(364,h+l|0,c[h+(l+16)>>2]|4|0);if(z){z=0;break}return a|0}}while(0);l=bS(-1,-1,0)|0;bC(l|0)|0;l=c[(c[f>>2]|0)-12>>2]|0;f=h+(l+16)|0;c[f>>2]=c[f>>2]|1;if((c[h+(l+20)>>2]&1|0)==0){a$();return a|0}z=0;aS(6);if(!z){return 0}else{z=0}a=bS(-1,-1)|0;z=0;aS(2);if(!z){bg(a|0)}else{z=0;a=bS(-1,-1,0)|0;dk(a);return 0}return 0}function EE(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;d=i;i=i+16|0;e=d|0;f=a;c[f>>2]=0;c[f+4>>2]=0;f=a+8|0;c[f>>2]=-1;c[f+4>>2]=-1;f=b;g=c[(c[f>>2]|0)-12>>2]|0;h=b;b=c[h+(g+16)>>2]|0;do{if((b|0)==0){j=c[h+(g+72)>>2]|0;if((j|0)==0){k=g}else{z=0,au(62,j|0)|0;if(z){z=0;break}k=c[(c[f>>2]|0)-12>>2]|0}if((c[h+(k+16)>>2]|0)!=0){i=d;return}j=c[h+(k+24)>>2]|0;z=0;aD(c[(c[j>>2]|0)+16>>2]|0,e|0,j|0,0,0,1,8);if(z){z=0;break}j=a;l=e;c[j>>2]=c[l>>2];c[j+4>>2]=c[l+4>>2];c[j+8>>2]=c[l+8>>2];c[j+12>>2]=c[l+12>>2];i=d;return}else{z=0;as(364,h+g|0,b|4|0);if(z){z=0;break}i=d;return}}while(0);b=bS(-1,-1,0)|0;bC(b|0)|0;b=c[(c[f>>2]|0)-12>>2]|0;f=h+(b+16)|0;c[f>>2]=c[f>>2]|1;if((c[h+(b+20)>>2]&1|0)==0){a$();i=d;return}z=0;aS(6);if(z){z=0}d=bS(-1,-1)|0;z=0;aS(2);if(!z){bg(d|0)}else{z=0;d=bS(-1,-1,0)|0;dk(d)}}function EF(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;i=i+16|0;g=f|0;h=a;j=c[(c[h>>2]|0)-12>>2]|0;k=a;l=c[k+(j+16)>>2]|0;do{if((l|0)==0){m=c[k+(j+72)>>2]|0;if((m|0)==0){n=j}else{z=0,au(62,m|0)|0;if(z){z=0;break}n=c[(c[h>>2]|0)-12>>2]|0}if((c[k+(n+16)>>2]|0)!=0){i=f;return a|0}m=c[k+(n+24)>>2]|0;z=0;aD(c[(c[m>>2]|0)+16>>2]|0,g|0,m|0,b|0,d|0,e|0,8);if(z){z=0;break}m=g+8|0;if(!((c[m>>2]|0)==(-1|0)&(c[m+4>>2]|0)==(-1|0))){i=f;return a|0}m=c[(c[h>>2]|0)-12>>2]|0;z=0;as(364,k+m|0,c[k+(m+16)>>2]|4|0);if(z){z=0;break}i=f;return a|0}else{z=0;as(364,k+j|0,l|4|0);if(z){z=0;break}i=f;return a|0}}while(0);l=bS(-1,-1,0)|0;bC(l|0)|0;l=c[(c[h>>2]|0)-12>>2]|0;h=k+(l+16)|0;c[h>>2]=c[h>>2]|1;if((c[k+(l+20)>>2]&1|0)==0){a$();i=f;return a|0}z=0;aS(6);if(!z){return 0}else{z=0}a=bS(-1,-1)|0;z=0;aS(2);if(!z){bg(a|0)}else{z=0;a=bS(-1,-1,0)|0;dk(a);return 0}return 0}function EG(a){a=a|0;D2(a+8|0);K1(a);return}function EH(a){a=a|0;D2(a+8|0);return}function EI(a){a=a|0;var b=0,d=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;D2(b+(d+8)|0);K1(b+d|0);return}function EJ(a){a=a|0;D2(a+((c[(c[a>>2]|0)-12>>2]|0)+8)|0);return}function EK(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;d=i;i=i+8|0;e=d|0;f=b;g=c[(c[f>>2]|0)-12>>2]|0;h=b;if((c[h+(g+24)>>2]|0)==0){i=d;return b|0}j=e|0;a[j]=0;c[e+4>>2]=b;do{if((c[h+(g+16)>>2]|0)==0){k=c[h+(g+72)>>2]|0;do{if((k|0)==0){l=5}else{z=0,au(168,k|0)|0;if(!z){l=5;break}else{z=0}m=bS(-1,-1,0)|0;n=m}}while(0);if((l|0)==5){a[j]=1;k=c[h+((c[(c[f>>2]|0)-12>>2]|0)+24)>>2]|0;m=(z=0,au(c[(c[k>>2]|0)+24>>2]|0,k|0)|0);if(!z){if((m|0)!=-1){break}m=c[(c[f>>2]|0)-12>>2]|0;z=0;as(364,h+m|0,c[h+(m+16)>>2]|1|0);if(!z){break}else{z=0}}else{z=0}m=bS(-1,-1,0)|0;EY(e);n=m}bC(n|0)|0;m=c[(c[f>>2]|0)-12>>2]|0;k=h+(m+16)|0;c[k>>2]=c[k>>2]|1;if((c[h+(m+20)>>2]&1|0)==0){a$();i=d;return b|0}z=0;aS(6);if(!z){return 0}else{z=0}m=bS(-1,-1)|0;z=0;aS(2);if(!z){bg(m|0)}else{z=0;m=bS(-1,-1,0)|0;dk(m);return 0}}}while(0);EY(e);i=d;return b|0}function EL(a){a=a|0;D2(a+4|0);K1(a);return}function EM(a){a=a|0;D2(a+4|0);return}function EN(a){a=a|0;var b=0,d=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;D2(b+(d+4)|0);K1(b+d|0);return}function EO(a){a=a|0;D2(a+((c[(c[a>>2]|0)-12>>2]|0)+4)|0);return}function EP(a){a=a|0;var b=0,d=0,e=0,f=0;b=a+4|0;a=c[b>>2]|0;d=c[(c[a>>2]|0)-12>>2]|0;e=a;if((c[e+(d+24)>>2]|0)==0){return}if((c[e+(d+16)>>2]|0)!=0){return}if((c[e+(d+4)>>2]&8192|0)==0){return}if(bF()|0){return}d=c[b>>2]|0;e=c[d+((c[(c[d>>2]|0)-12>>2]|0)+24)>>2]|0;d=(z=0,au(c[(c[e>>2]|0)+24>>2]|0,e|0)|0);do{if(!z){if((d|0)!=-1){return}e=c[b>>2]|0;a=c[(c[e>>2]|0)-12>>2]|0;f=e;z=0;as(364,f+a|0,c[f+(a+16)>>2]|1|0);if(z){z=0;break}return}else{z=0}}while(0);b=bS(-1,-1,0)|0;bC(b|0)|0;z=0;aS(2);if(!z){return}else{z=0;b=bS(-1,-1,0)|0;dk(b)}}function EQ(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0;e=i;i=i+40|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=e+32|0;l=h|0;a[l]=0;c[h+4>>2]=b;m=b;n=c[(c[m>>2]|0)-12>>2]|0;o=b;do{if((c[o+(n+16)>>2]|0)==0){p=c[o+(n+72)>>2]|0;do{if((p|0)==0){q=4}else{z=0,au(62,p|0)|0;if(!z){q=4;break}else{z=0}r=bS(-1,-1,0)|0;s=r}}while(0);if((q|0)==4){a[l]=1;Iw(j,o+((c[(c[m>>2]|0)-12>>2]|0)+28)|0);p=(z=0,aM(198,j|0,40528)|0);if(!z){r=p;Ix(j);t=c[(c[m>>2]|0)-12>>2]|0;u=c[o+(t+24)>>2]|0;v=o+t|0;w=o+(t+76)|0;x=c[w>>2]|0;y=x&255;L10:do{if((x|0)==-1){Iw(g,o+(t+28)|0);A=(z=0,aM(198,g|0,40880)|0);do{if(!z){B=(z=0,aM(c[(c[A>>2]|0)+28>>2]|0,A|0,32)|0);if(z){z=0;break}Ix(g);c[w>>2]=B<<24>>24;C=B;q=10;break L10}else{z=0}}while(0);A=bS(-1,-1,0)|0;B=M;Ix(g);D=B;E=A}else{C=y;q=10}}while(0);if((q|0)==10){y=c[(c[p>>2]|0)+24>>2]|0;c[f>>2]=u;z=0;aD(y|0,k|0,r|0,f|0,v|0,C|0,d|0);if(!z){if((c[k>>2]|0)!=0){break}y=c[(c[m>>2]|0)-12>>2]|0;z=0;as(364,o+y|0,c[o+(y+16)>>2]|5|0);if(!z){break}else{z=0}}else{z=0}y=bS(-1,-1,0)|0;D=M;E=y}F=E}else{z=0;y=bS(-1,-1,0)|0;Ix(j);F=y}EP(h);s=F}bC(s|0)|0;y=c[(c[m>>2]|0)-12>>2]|0;w=o+(y+16)|0;c[w>>2]=c[w>>2]|1;if((c[o+(y+20)>>2]&1|0)==0){a$();i=e;return b|0}z=0;aS(6);if(!z){return 0}else{z=0}y=bS(-1,-1)|0;z=0;aS(2);if(!z){bg(y|0)}else{z=0;y=bS(-1,-1,0)|0;dk(y);return 0}}}while(0);EP(h);i=e;return b|0}function ER(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0;e=i;i=i+40|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=e+32|0;l=h|0;a[l]=0;c[h+4>>2]=b;m=b;n=c[(c[m>>2]|0)-12>>2]|0;o=b;do{if((c[o+(n+16)>>2]|0)==0){p=c[o+(n+72)>>2]|0;do{if((p|0)==0){q=4}else{z=0,au(62,p|0)|0;if(!z){q=4;break}else{z=0}r=bS(-1,-1,0)|0;s=r}}while(0);if((q|0)==4){a[l]=1;Iw(j,o+((c[(c[m>>2]|0)-12>>2]|0)+28)|0);p=(z=0,aM(198,j|0,40528)|0);if(!z){r=p;Ix(j);t=c[(c[m>>2]|0)-12>>2]|0;u=c[o+(t+24)>>2]|0;v=o+t|0;w=o+(t+76)|0;x=c[w>>2]|0;y=x&255;L11:do{if((x|0)==-1){Iw(g,o+(t+28)|0);A=(z=0,aM(198,g|0,40880)|0);do{if(!z){B=(z=0,aM(c[(c[A>>2]|0)+28>>2]|0,A|0,32)|0);if(z){z=0;break}Ix(g);c[w>>2]=B<<24>>24;C=B;q=10;break L11}else{z=0}}while(0);A=bS(-1,-1,0)|0;B=M;Ix(g);D=B;E=A}else{C=y;q=10}}while(0);if((q|0)==10){y=c[(c[p>>2]|0)+24>>2]|0;c[f>>2]=u;z=0;aD(y|0,k|0,r|0,f|0,v|0,C|0,d|0);if(!z){if((c[k>>2]|0)!=0){break}y=c[(c[m>>2]|0)-12>>2]|0;z=0;as(364,o+y|0,c[o+(y+16)>>2]|5|0);if(!z){break}else{z=0}}else{z=0}y=bS(-1,-1,0)|0;D=M;E=y}F=E}else{z=0;y=bS(-1,-1,0)|0;Ix(j);F=y}EP(h);s=F}bC(s|0)|0;y=c[(c[m>>2]|0)-12>>2]|0;w=o+(y+16)|0;c[w>>2]=c[w>>2]|1;if((c[o+(y+20)>>2]&1|0)==0){a$();i=e;return b|0}z=0;aS(6);if(!z){return 0}else{z=0}y=bS(-1,-1)|0;z=0;aS(2);if(!z){bg(y|0)}else{z=0;y=bS(-1,-1,0)|0;dk(y);return 0}}}while(0);EP(h);i=e;return b|0}function ES(b,d){b=b|0;d=+d;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0;e=i;i=i+40|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=e+32|0;l=h|0;a[l]=0;c[h+4>>2]=b;m=b;n=c[(c[m>>2]|0)-12>>2]|0;o=b;do{if((c[o+(n+16)>>2]|0)==0){p=c[o+(n+72)>>2]|0;do{if((p|0)==0){q=4}else{z=0,au(62,p|0)|0;if(!z){q=4;break}else{z=0}r=bS(-1,-1,0)|0;s=r}}while(0);if((q|0)==4){a[l]=1;Iw(j,o+((c[(c[m>>2]|0)-12>>2]|0)+28)|0);p=(z=0,aM(198,j|0,40528)|0);if(!z){r=p;Ix(j);t=c[(c[m>>2]|0)-12>>2]|0;u=c[o+(t+24)>>2]|0;v=o+t|0;w=o+(t+76)|0;x=c[w>>2]|0;y=x&255;L10:do{if((x|0)==-1){Iw(g,o+(t+28)|0);A=(z=0,aM(198,g|0,40880)|0);do{if(!z){B=(z=0,aM(c[(c[A>>2]|0)+28>>2]|0,A|0,32)|0);if(z){z=0;break}Ix(g);c[w>>2]=B<<24>>24;C=B;q=10;break L10}else{z=0}}while(0);A=bS(-1,-1,0)|0;B=M;Ix(g);D=B;E=A}else{C=y;q=10}}while(0);if((q|0)==10){y=c[(c[p>>2]|0)+32>>2]|0;c[f>>2]=u;z=0;aB(y|0,k|0,r|0,f|0,v|0,C|0,+d);if(!z){if((c[k>>2]|0)!=0){break}y=c[(c[m>>2]|0)-12>>2]|0;z=0;as(364,o+y|0,c[o+(y+16)>>2]|5|0);if(!z){break}else{z=0}}else{z=0}y=bS(-1,-1,0)|0;D=M;E=y}F=E}else{z=0;y=bS(-1,-1,0)|0;Ix(j);F=y}EP(h);s=F}bC(s|0)|0;y=c[(c[m>>2]|0)-12>>2]|0;w=o+(y+16)|0;c[w>>2]=c[w>>2]|1;if((c[o+(y+20)>>2]&1|0)==0){a$();i=e;return b|0}z=0;aS(6);if(!z){return 0}else{z=0}y=bS(-1,-1)|0;z=0;aS(2);if(!z){bg(y|0)}else{z=0;y=bS(-1,-1,0)|0;dk(y);return 0}}}while(0);EP(h);i=e;return b|0}function ET(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;e=i;i=i+8|0;f=e|0;g=f|0;a[g]=0;c[f+4>>2]=b;h=b;j=c[(c[h>>2]|0)-12>>2]|0;k=b;do{if((c[k+(j+16)>>2]|0)==0){l=c[k+(j+72)>>2]|0;do{if((l|0)==0){m=4}else{z=0,au(62,l|0)|0;if(!z){m=4;break}else{z=0}n=bS(-1,-1,0)|0;o=n}}while(0);if((m|0)==4){a[g]=1;l=c[k+((c[(c[h>>2]|0)-12>>2]|0)+24)>>2]|0;n=l;do{if((l|0)==0){p=n;m=9}else{q=l+24|0;r=c[q>>2]|0;if((r|0)==(c[l+28>>2]|0)){s=(z=0,aM(c[(c[l>>2]|0)+52>>2]|0,n|0,d&255|0)|0);if(!z){t=s}else{z=0;break}}else{c[q>>2]=r+1;a[r]=d;t=d&255}p=(t|0)==-1?0:n;m=9}}while(0);if((m|0)==9){if((p|0)!=0){break}n=c[(c[h>>2]|0)-12>>2]|0;z=0;as(364,k+n|0,c[k+(n+16)>>2]|1|0);if(!z){break}else{z=0}}n=bS(-1,-1,0)|0;EP(f);o=n}bC(o|0)|0;n=c[(c[h>>2]|0)-12>>2]|0;l=k+(n+16)|0;c[l>>2]=c[l>>2]|1;if((c[k+(n+20)>>2]&1|0)==0){a$();i=e;return b|0}z=0;aS(6);if(!z){return 0}else{z=0}n=bS(-1,-1)|0;z=0;aS(2);if(!z){bg(n|0)}else{z=0;n=bS(-1,-1,0)|0;dk(n);return 0}}}while(0);EP(f);i=e;return b|0}function EU(a){a=a|0;D2(a+4|0);K1(a);return}function EV(a){a=a|0;D2(a+4|0);return}function EW(a){a=a|0;var b=0,d=0;b=a;d=c[(c[a>>2]|0)-12>>2]|0;D2(b+(d+4)|0);K1(b+d|0);return}function EX(a){a=a|0;D2(a+((c[(c[a>>2]|0)-12>>2]|0)+4)|0);return}function EY(a){a=a|0;var b=0,d=0,e=0,f=0;b=a+4|0;a=c[b>>2]|0;d=c[(c[a>>2]|0)-12>>2]|0;e=a;if((c[e+(d+24)>>2]|0)==0){return}if((c[e+(d+16)>>2]|0)!=0){return}if((c[e+(d+4)>>2]&8192|0)==0){return}if(bF()|0){return}d=c[b>>2]|0;e=c[d+((c[(c[d>>2]|0)-12>>2]|0)+24)>>2]|0;d=(z=0,au(c[(c[e>>2]|0)+24>>2]|0,e|0)|0);do{if(!z){if((d|0)!=-1){return}e=c[b>>2]|0;a=c[(c[e>>2]|0)-12>>2]|0;f=e;z=0;as(364,f+a|0,c[f+(a+16)>>2]|1|0);if(z){z=0;break}return}else{z=0}}while(0);b=bS(-1,-1,0)|0;bC(b|0)|0;z=0;aS(2);if(!z){return}else{z=0;b=bS(-1,-1,0)|0;dk(b)}}function EZ(a){a=a|0;return 10608}function E_(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)==1){DH(a,11600,35);return}else{Dy(a,b|0,c);return}}function E$(a){a=a|0;Du(a|0);return}function E0(a){a=a|0;DC(a|0);K1(a);return}function E1(a){a=a|0;DC(a|0);return}function E2(a){a=a|0;D2(a);K1(a);return}function E3(a){a=a|0;Du(a|0);K1(a);return}function E4(a){a=a|0;Dg(a|0);K1(a);return}function E5(a){a=a|0;Dg(a|0);return}function E6(a){a=a|0;Dg(a|0);return}function E7(b,c,d,e,f){b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0;L1:do{if((e|0)==(f|0)){g=c}else{b=c;h=e;while(1){if((b|0)==(d|0)){i=-1;j=10;break}k=a[b]|0;l=a[h]|0;if(k<<24>>24<l<<24>>24){i=-1;j=8;break}if(l<<24>>24<k<<24>>24){i=1;j=11;break}k=b+1|0;l=h+1|0;if((l|0)==(f|0)){g=k;break L1}else{b=k;h=l}}if((j|0)==11){return i|0}else if((j|0)==10){return i|0}else if((j|0)==8){return i|0}}}while(0);i=(g|0)!=(d|0)|0;return i|0}function E8(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0;d=e;g=f-d|0;if(g>>>0>4294967279>>>0){DE(b)}if(g>>>0<11>>>0){a[b]=g<<1;h=b+1|0}else{i=g+16&-16;j=K$(i)|0;c[b+8>>2]=j;c[b>>2]=i|1;c[b+4>>2]=g;h=j}if((e|0)==(f|0)){k=h;a[k]=0;return}j=f+(-d|0)|0;d=h;g=e;while(1){a[d]=a[g]|0;e=g+1|0;if((e|0)==(f|0)){break}else{d=d+1|0;g=e}}k=h+j|0;a[k]=0;return}function E9(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0;if((c|0)==(d|0)){e=0;return e|0}else{f=c;g=0}while(1){c=(a[f]|0)+(g<<4)|0;b=c&-268435456;h=(b>>>24|b)^c;c=f+1|0;if((c|0)==(d|0)){e=h;break}else{f=c;g=h}}return e|0}function Fa(a){a=a|0;Dg(a|0);K1(a);return}function Fb(a){a=a|0;Dg(a|0);return}function Fc(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0;L1:do{if((e|0)==(f|0)){g=b;h=6}else{a=b;i=e;while(1){if((a|0)==(d|0)){j=-1;break L1}k=c[a>>2]|0;l=c[i>>2]|0;if((k|0)<(l|0)){j=-1;break L1}if((l|0)<(k|0)){j=1;break L1}k=a+4|0;l=i+4|0;if((l|0)==(f|0)){g=k;h=6;break}else{a=k;i=l}}}}while(0);if((h|0)==6){j=(g|0)!=(d|0)|0}return j|0}function Fd(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0;d=e;g=f-d|0;h=g>>2;if(h>>>0>1073741807>>>0){DE(b)}if(h>>>0<2>>>0){a[b]=g>>>1;i=b+4|0}else{g=h+4&-4;j=K$(g<<2)|0;c[b+8>>2]=j;c[b>>2]=g|1;c[b+4>>2]=h;i=j}if((e|0)==(f|0)){k=i;c[k>>2]=0;return}j=(f-4+(-d|0)|0)>>>2;d=i;h=e;while(1){c[d>>2]=c[h>>2];e=h+4|0;if((e|0)==(f|0)){break}else{d=d+4|0;h=e}}k=i+(j+1<<2)|0;c[k>>2]=0;return}function Fe(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;if((b|0)==(d|0)){e=0;return e|0}else{f=b;g=0}while(1){b=(c[f>>2]|0)+(g<<4)|0;a=b&-268435456;h=(a>>>24|a)^b;b=f+4|0;if((b|0)==(d|0)){e=h;break}else{f=b;g=h}}return e|0}function Ff(a){a=a|0;Dg(a|0);K1(a);return}function Fg(a){a=a|0;Dg(a|0);return}function Fh(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;k=i;i=i+112|0;l=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[l>>2];l=k|0;m=k+16|0;n=k+32|0;o=k+40|0;p=k+48|0;q=k+56|0;r=k+64|0;s=k+72|0;t=k+80|0;u=k+104|0;if((c[g+4>>2]&1|0)==0){c[n>>2]=-1;v=c[(c[d>>2]|0)+16>>2]|0;w=e|0;c[p>>2]=c[w>>2];c[q>>2]=c[f>>2];cQ[v&127](o,d,p,q,g,h,n);q=c[o>>2]|0;c[w>>2]=q;w=c[n>>2]|0;if((w|0)==1){a[j]=1}else if((w|0)==0){a[j]=0}else{a[j]=1;c[h>>2]=4}c[b>>2]=q;i=k;return}D3(r,g);q=r|0;r=c[q>>2]|0;if((c[10220]|0)==-1){x=9}else{c[m>>2]=40880;c[m+4>>2]=460;c[m+8>>2]=0;z=0;aR(2,40880,m|0,518);if(!z){x=9}else{z=0}}do{if((x|0)==9){m=(c[10221]|0)-1|0;w=c[r+8>>2]|0;do{if((c[r+12>>2]|0)-w>>2>>>0>m>>>0){n=c[w+(m<<2)>>2]|0;if((n|0)==0){break}o=n;Di(c[q>>2]|0)|0;D3(s,g);n=s|0;p=c[n>>2]|0;if((c[10124]|0)==-1){x=15}else{c[l>>2]=40496;c[l+4>>2]=460;c[l+8>>2]=0;z=0;aR(2,40496,l|0,518);if(!z){x=15}else{z=0}}do{if((x|0)==15){d=(c[10125]|0)-1|0;v=c[p+8>>2]|0;do{if((c[p+12>>2]|0)-v>>2>>>0>d>>>0){y=c[v+(d<<2)>>2]|0;if((y|0)==0){break}A=y;Di(c[n>>2]|0)|0;B=t|0;C=y;z=0;as(c[(c[C>>2]|0)+24>>2]|0,B|0,A|0);do{if(!z){y=t+12|0;z=0;as(c[(c[C>>2]|0)+28>>2]|0,y|0,A|0);if(z){z=0;D=y;break}c[u>>2]=c[f>>2];y=(z=0,ao(4,e|0,u|0,B|0,t+24|0,o|0,h|0,1)|0);if(!z){a[j]=(y|0)==(B|0)|0;c[b>>2]=c[e>>2];DK(t+12|0);DK(t|0);i=k;return}else{z=0;y=bS(-1,-1)|0;E=M;DK(t+12|0);DK(t|0);F=y;G=E;H=F;I=0;J=H;K=G;bg(J|0)}}else{z=0;D=B}}while(0);A=bS(-1,-1)|0;C=A;A=M;if((B|0)==(D|0)){F=C;G=A;H=F;I=0;J=H;K=G;bg(J|0)}else{L=D}while(1){E=L-12|0;DK(E);if((E|0)==(B|0)){F=C;G=A;break}else{L=E}}H=F;I=0;J=H;K=G;bg(J|0)}}while(0);d=ck(4)|0;Kw(d);z=0;aR(146,d|0,28488,100);if(z){z=0;break}}}while(0);o=bS(-1,-1)|0;p=M;Di(c[n>>2]|0)|0;F=o;G=p;H=F;I=0;J=H;K=G;bg(J|0)}}while(0);m=ck(4)|0;Kw(m);z=0;aR(146,m|0,28488,100);if(z){z=0;break}}}while(0);L=bS(-1,-1)|0;D=M;Di(c[q>>2]|0)|0;F=L;G=D;H=F;I=0;J=H;K=G;bg(J|0)}function Fi(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0;l=i;i=i+104|0;m=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[m>>2];m=(g-f|0)/12|0;n=l|0;do{if(m>>>0>100>>>0){o=KV(m)|0;if((o|0)!=0){p=o;q=o;break}z=0;aS(4);if(!z){p=0;q=0;break}else{z=0}o=bS(-1,-1)|0;r=M;s=o;bg(s|0)}else{p=n;q=0}}while(0);n=(f|0)==(g|0);if(n){t=m;u=0}else{o=m;m=0;v=p;w=f;while(1){x=d[w]|0;if((x&1|0)==0){y=x>>>1}else{y=c[w+4>>2]|0}if((y|0)==0){a[v]=2;A=m+1|0;B=o-1|0}else{a[v]=1;A=m;B=o}x=w+12|0;if((x|0)==(g|0)){t=B;u=A;break}else{o=B;m=A;v=v+1|0;w=x}}}w=b|0;b=e|0;e=h;v=0;A=u;u=t;L19:while(1){t=c[w>>2]|0;do{if((t|0)==0){C=0}else{if((c[t+12>>2]|0)!=(c[t+16>>2]|0)){C=t;break}m=(z=0,au(c[(c[t>>2]|0)+36>>2]|0,t|0)|0);if(z){z=0;D=6;break L19}if((m|0)==-1){c[w>>2]=0;C=0;break}else{C=c[w>>2]|0;break}}}while(0);t=(C|0)==0;m=c[b>>2]|0;if((m|0)==0){E=C;F=0}else{do{if((c[m+12>>2]|0)==(c[m+16>>2]|0)){B=(z=0,au(c[(c[m>>2]|0)+36>>2]|0,m|0)|0);if(z){z=0;D=6;break L19}if((B|0)!=-1){G=m;break}c[b>>2]=0;G=0}else{G=m}}while(0);E=c[w>>2]|0;F=G}H=(F|0)==0;if(!((t^H)&(u|0)!=0)){D=81;break}m=c[E+12>>2]|0;if((m|0)==(c[E+16>>2]|0)){B=(z=0,au(c[(c[E>>2]|0)+36>>2]|0,E|0)|0);if(z){z=0;D=6;break}I=B&255}else{I=a[m]|0}if(k){J=I}else{m=(z=0,aM(c[(c[e>>2]|0)+12>>2]|0,h|0,I|0)|0);if(!z){J=m}else{z=0;D=6;break}}do{if(n){K=A;L=u}else{m=v+1|0;L48:do{if(k){B=u;o=A;y=p;x=0;N=f;while(1){do{if((a[y]|0)==1){O=N;if((a[O]&1)==0){P=N+1|0}else{P=c[N+8>>2]|0}if(J<<24>>24!=(a[P+v|0]|0)){a[y]=0;Q=x;R=o;S=B-1|0;break}T=d[O]|0;if((T&1|0)==0){U=T>>>1}else{U=c[N+4>>2]|0}if((U|0)!=(m|0)){Q=1;R=o;S=B;break}a[y]=2;Q=1;R=o+1|0;S=B-1|0}else{Q=x;R=o;S=B}}while(0);T=N+12|0;if((T|0)==(g|0)){V=S;W=R;X=Q;break L48}B=S;o=R;y=y+1|0;x=Q;N=T}}else{N=u;x=A;y=p;o=0;B=f;while(1){do{if((a[y]|0)==1){T=B;if((a[T]&1)==0){Y=B+1|0}else{Y=c[B+8>>2]|0}O=(z=0,aM(c[(c[e>>2]|0)+12>>2]|0,h|0,a[Y+v|0]|0)|0);if(z){z=0;D=5;break L19}if(J<<24>>24!=O<<24>>24){a[y]=0;Z=o;_=x;$=N-1|0;break}O=d[T]|0;if((O&1|0)==0){aa=O>>>1}else{aa=c[B+4>>2]|0}if((aa|0)!=(m|0)){Z=1;_=x;$=N;break}a[y]=2;Z=1;_=x+1|0;$=N-1|0}else{Z=o;_=x;$=N}}while(0);O=B+12|0;if((O|0)==(g|0)){V=$;W=_;X=Z;break L48}N=$;x=_;y=y+1|0;o=Z;B=O}}}while(0);if(!X){K=W;L=V;break}m=c[w>>2]|0;B=m+12|0;o=c[B>>2]|0;if((o|0)==(c[m+16>>2]|0)){y=c[(c[m>>2]|0)+40>>2]|0;z=0,au(y|0,m|0)|0;if(z){z=0;D=6;break L19}}else{c[B>>2]=o+1}if((W+V|0)>>>0<2>>>0|n){K=W;L=V;break}o=v+1|0;B=W;m=p;y=f;while(1){do{if((a[m]|0)==2){x=d[y]|0;if((x&1|0)==0){ab=x>>>1}else{ab=c[y+4>>2]|0}if((ab|0)==(o|0)){ac=B;break}a[m]=0;ac=B-1|0}else{ac=B}}while(0);x=y+12|0;if((x|0)==(g|0)){K=ac;L=V;break}else{B=ac;m=m+1|0;y=x}}}}while(0);v=v+1|0;A=K;u=L}if((D|0)==81){do{if((E|0)==0){ad=0;D=87}else{if((c[E+12>>2]|0)!=(c[E+16>>2]|0)){ad=E;D=87;break}L=(z=0,au(c[(c[E>>2]|0)+36>>2]|0,E|0)|0);if(z){z=0;break}if((L|0)==-1){c[w>>2]=0;ad=0;D=87;break}else{ad=c[w>>2]|0;D=87;break}}}while(0);L113:do{if((D|0)==87){w=(ad|0)==0;do{if(H){D=93}else{if((c[F+12>>2]|0)!=(c[F+16>>2]|0)){if(w){break}else{D=95;break}}E=(z=0,au(c[(c[F>>2]|0)+36>>2]|0,F|0)|0);if(z){z=0;break L113}if((E|0)==-1){c[b>>2]=0;D=93;break}else{if(w^(F|0)==0){break}else{D=95;break}}}}while(0);if((D|0)==93){if(w){D=95}}if((D|0)==95){c[j>>2]=c[j>>2]|2}L129:do{if(n){D=100}else{E=f;L=p;while(1){if((a[L]|0)==2){ae=E;break L129}u=E+12|0;if((u|0)==(g|0)){D=100;break L129}E=u;L=L+1|0}}}while(0);if((D|0)==100){c[j>>2]=c[j>>2]|4;ae=g}if((q|0)==0){i=l;return ae|0}KW(q);i=l;return ae|0}}while(0);ae=bS(-1,-1)|0;af=M;ag=ae}else if((D|0)==5){ae=bS(-1,-1)|0;af=M;ag=ae}else if((D|0)==6){D=bS(-1,-1)|0;af=M;ag=D}if((q|0)==0){r=af;s=ag;bg(s|0)}KW(q);r=af;s=ag;bg(s|0);return 0}function Fj(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0;b=i;i=i+16|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;c[j>>2]=c[d>>2];c[k>>2]=c[e>>2];Fk(a,0,j,k,f,g,h);i=b;return}function Fk(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0;e=i;i=i+72|0;l=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[l>>2];l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=o;q=i;i=i+4|0;i=i+7&-8;r=i;i=i+160|0;s=i;i=i+4|0;i=i+7&-8;t=i;i=i+4|0;i=i+7&-8;u=c[h+4>>2]&74;if((u|0)==8){v=16}else if((u|0)==64){v=8}else if((u|0)==0){v=0}else{v=10}u=l|0;F0(n,h,u,m);Ld(p|0,0,12)|0;h=o;z=0;aR(82,o|0,10,0);L6:do{if(!z){if((a[p]&1)==0){l=h+1|0;w=l;x=l;y=o+8|0}else{l=o+8|0;w=c[l>>2]|0;x=h+1|0;y=l}c[q>>2]=w;l=r|0;c[s>>2]=l;c[t>>2]=0;A=f|0;B=g|0;C=o|0;D=o+4|0;E=a[m]|0;F=w;G=c[A>>2]|0;L12:while(1){do{if((G|0)==0){H=0}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){H=G;break}I=(z=0,au(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(z){z=0;J=34;break L12}if((I|0)!=-1){H=G;break}c[A>>2]=0;H=0}}while(0);K=(H|0)==0;I=c[B>>2]|0;do{if((I|0)==0){J=21}else{if((c[I+12>>2]|0)!=(c[I+16>>2]|0)){if(K){L=I;N=0;break}else{O=F;P=I;Q=0;break L12}}R=(z=0,au(c[(c[I>>2]|0)+36>>2]|0,I|0)|0);if(z){z=0;J=34;break L12}if((R|0)==-1){c[B>>2]=0;J=21;break}else{R=(I|0)==0;if(K^R){L=I;N=R;break}else{O=F;P=I;Q=R;break L12}}}}while(0);if((J|0)==21){J=0;if(K){O=F;P=0;Q=1;break}else{L=0;N=1}}I=d[p]|0;R=(I&1|0)==0;if(((c[q>>2]|0)-F|0)==((R?I>>>1:c[D>>2]|0)|0)){if(R){S=I>>>1;T=I>>>1}else{I=c[D>>2]|0;S=I;T=I}z=0;aR(82,o|0,S<<1|0,0);if(z){z=0;J=34;break}if((a[p]&1)==0){U=10}else{U=(c[C>>2]&-2)-1|0}z=0;aR(82,o|0,U|0,0);if(z){z=0;J=34;break}if((a[p]&1)==0){V=x}else{V=c[y>>2]|0}c[q>>2]=V+T;W=V}else{W=F}I=H+12|0;R=c[I>>2]|0;X=H+16|0;if((R|0)==(c[X>>2]|0)){Y=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(z){z=0;J=34;break}Z=Y&255}else{Z=a[R]|0}if((FC(Z,v,W,q,t,E,n,l,s,u)|0)!=0){O=W;P=L;Q=N;break}R=c[I>>2]|0;if((R|0)==(c[X>>2]|0)){X=c[(c[H>>2]|0)+40>>2]|0;z=0,au(X|0,H|0)|0;if(!z){F=W;G=H;continue}else{z=0;J=34;break}}else{c[I>>2]=R+1;F=W;G=H;continue}}if((J|0)==34){G=bS(-1,-1)|0;_=M;$=G;DK(o);DK(n);bg($|0)}G=d[n]|0;if((G&1|0)==0){aa=G>>>1}else{aa=c[n+4>>2]|0}do{if((aa|0)!=0){G=c[s>>2]|0;if((G-r|0)>=160){break}F=c[t>>2]|0;c[s>>2]=G+4;c[G>>2]=F}}while(0);F=(z=0,aU(40,O|0,c[q>>2]|0,j|0,v|0)|0);if(z){z=0;break}c[k>>2]=F;HV(n,l,c[s>>2]|0,j);do{if(K){ab=0}else{if((c[H+12>>2]|0)!=(c[H+16>>2]|0)){ab=H;break}F=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(z){z=0;break L6}if((F|0)!=-1){ab=H;break}c[A>>2]=0;ab=0}}while(0);A=(ab|0)==0;L75:do{if(Q){J=62}else{do{if((c[P+12>>2]|0)==(c[P+16>>2]|0)){l=(z=0,au(c[(c[P>>2]|0)+36>>2]|0,P|0)|0);if(z){z=0;break L6}if((l|0)!=-1){break}c[B>>2]=0;J=62;break L75}}while(0);if(!(A^(P|0)==0)){break}ac=b|0;c[ac>>2]=ab;DK(o);DK(n);i=e;return}}while(0);do{if((J|0)==62){if(A){break}ac=b|0;c[ac>>2]=ab;DK(o);DK(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;ac=b|0;c[ac>>2]=ab;DK(o);DK(n);i=e;return}else{z=0}}while(0);e=bS(-1,-1)|0;_=M;$=e;DK(o);DK(n);bg($|0)}function Fl(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0;b=i;i=i+16|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;c[j>>2]=c[d>>2];c[k>>2]=c[e>>2];Fm(a,0,j,k,f,g,h);i=b;return}function Fm(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0;e=i;i=i+72|0;l=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[l>>2];l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=o;q=i;i=i+4|0;i=i+7&-8;r=i;i=i+160|0;s=i;i=i+4|0;i=i+7&-8;t=i;i=i+4|0;i=i+7&-8;u=c[h+4>>2]&74;if((u|0)==64){v=8}else if((u|0)==0){v=0}else if((u|0)==8){v=16}else{v=10}u=l|0;F0(n,h,u,m);Ld(p|0,0,12)|0;h=o;z=0;aR(82,o|0,10,0);L6:do{if(!z){if((a[p]&1)==0){l=h+1|0;w=l;x=l;y=o+8|0}else{l=o+8|0;w=c[l>>2]|0;x=h+1|0;y=l}c[q>>2]=w;l=r|0;c[s>>2]=l;c[t>>2]=0;A=f|0;B=g|0;C=o|0;D=o+4|0;E=a[m]|0;F=w;G=c[A>>2]|0;L12:while(1){do{if((G|0)==0){H=0}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){H=G;break}I=(z=0,au(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(z){z=0;J=34;break L12}if((I|0)!=-1){H=G;break}c[A>>2]=0;H=0}}while(0);K=(H|0)==0;I=c[B>>2]|0;do{if((I|0)==0){J=21}else{if((c[I+12>>2]|0)!=(c[I+16>>2]|0)){if(K){L=I;N=0;break}else{O=F;P=I;Q=0;break L12}}R=(z=0,au(c[(c[I>>2]|0)+36>>2]|0,I|0)|0);if(z){z=0;J=34;break L12}if((R|0)==-1){c[B>>2]=0;J=21;break}else{R=(I|0)==0;if(K^R){L=I;N=R;break}else{O=F;P=I;Q=R;break L12}}}}while(0);if((J|0)==21){J=0;if(K){O=F;P=0;Q=1;break}else{L=0;N=1}}I=d[p]|0;R=(I&1|0)==0;if(((c[q>>2]|0)-F|0)==((R?I>>>1:c[D>>2]|0)|0)){if(R){S=I>>>1;T=I>>>1}else{I=c[D>>2]|0;S=I;T=I}z=0;aR(82,o|0,S<<1|0,0);if(z){z=0;J=34;break}if((a[p]&1)==0){U=10}else{U=(c[C>>2]&-2)-1|0}z=0;aR(82,o|0,U|0,0);if(z){z=0;J=34;break}if((a[p]&1)==0){V=x}else{V=c[y>>2]|0}c[q>>2]=V+T;W=V}else{W=F}I=H+12|0;R=c[I>>2]|0;X=H+16|0;if((R|0)==(c[X>>2]|0)){Y=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(z){z=0;J=34;break}Z=Y&255}else{Z=a[R]|0}if((FC(Z,v,W,q,t,E,n,l,s,u)|0)!=0){O=W;P=L;Q=N;break}R=c[I>>2]|0;if((R|0)==(c[X>>2]|0)){X=c[(c[H>>2]|0)+40>>2]|0;z=0,au(X|0,H|0)|0;if(!z){F=W;G=H;continue}else{z=0;J=34;break}}else{c[I>>2]=R+1;F=W;G=H;continue}}if((J|0)==34){G=bS(-1,-1)|0;_=M;$=G;DK(o);DK(n);bg($|0)}G=d[n]|0;if((G&1|0)==0){aa=G>>>1}else{aa=c[n+4>>2]|0}do{if((aa|0)!=0){G=c[s>>2]|0;if((G-r|0)>=160){break}F=c[t>>2]|0;c[s>>2]=G+4;c[G>>2]=F}}while(0);F=(z=0,aU(4,O|0,c[q>>2]|0,j|0,v|0)|0);G=M;if(z){z=0;break}c[k>>2]=F;c[k+4>>2]=G;HV(n,l,c[s>>2]|0,j);do{if(K){ab=0}else{if((c[H+12>>2]|0)!=(c[H+16>>2]|0)){ab=H;break}G=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(z){z=0;break L6}if((G|0)!=-1){ab=H;break}c[A>>2]=0;ab=0}}while(0);A=(ab|0)==0;L75:do{if(Q){J=62}else{do{if((c[P+12>>2]|0)==(c[P+16>>2]|0)){l=(z=0,au(c[(c[P>>2]|0)+36>>2]|0,P|0)|0);if(z){z=0;break L6}if((l|0)!=-1){break}c[B>>2]=0;J=62;break L75}}while(0);if(!(A^(P|0)==0)){break}ac=b|0;c[ac>>2]=ab;DK(o);DK(n);i=e;return}}while(0);do{if((J|0)==62){if(A){break}ac=b|0;c[ac>>2]=ab;DK(o);DK(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;ac=b|0;c[ac>>2]=ab;DK(o);DK(n);i=e;return}else{z=0}}while(0);e=bS(-1,-1)|0;_=M;$=e;DK(o);DK(n);bg($|0)}function Fn(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0;b=i;i=i+16|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;c[j>>2]=c[d>>2];c[k>>2]=c[e>>2];Fo(a,0,j,k,f,g,h);i=b;return}function Fo(e,f,g,h,j,k,l){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0;f=i;i=i+72|0;m=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[m>>2];m=h;h=i;i=i+4|0;i=i+7&-8;c[h>>2]=c[m>>2];m=f|0;n=f+32|0;o=f+40|0;p=f+56|0;q=p;r=i;i=i+4|0;i=i+7&-8;s=i;i=i+160|0;t=i;i=i+4|0;i=i+7&-8;u=i;i=i+4|0;i=i+7&-8;v=c[j+4>>2]&74;if((v|0)==8){w=16}else if((v|0)==64){w=8}else if((v|0)==0){w=0}else{w=10}v=m|0;F0(o,j,v,n);Ld(q|0,0,12)|0;j=p;z=0;aR(82,p|0,10,0);L6:do{if(!z){if((a[q]&1)==0){m=j+1|0;x=m;y=m;A=p+8|0}else{m=p+8|0;x=c[m>>2]|0;y=j+1|0;A=m}c[r>>2]=x;m=s|0;c[t>>2]=m;c[u>>2]=0;B=g|0;C=h|0;D=p|0;E=p+4|0;F=a[n]|0;G=x;H=c[B>>2]|0;L12:while(1){do{if((H|0)==0){I=0}else{if((c[H+12>>2]|0)!=(c[H+16>>2]|0)){I=H;break}J=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(z){z=0;K=34;break L12}if((J|0)!=-1){I=H;break}c[B>>2]=0;I=0}}while(0);L=(I|0)==0;J=c[C>>2]|0;do{if((J|0)==0){K=21}else{if((c[J+12>>2]|0)!=(c[J+16>>2]|0)){if(L){N=J;O=0;break}else{P=G;Q=J;R=0;break L12}}S=(z=0,au(c[(c[J>>2]|0)+36>>2]|0,J|0)|0);if(z){z=0;K=34;break L12}if((S|0)==-1){c[C>>2]=0;K=21;break}else{S=(J|0)==0;if(L^S){N=J;O=S;break}else{P=G;Q=J;R=S;break L12}}}}while(0);if((K|0)==21){K=0;if(L){P=G;Q=0;R=1;break}else{N=0;O=1}}J=d[q]|0;S=(J&1|0)==0;if(((c[r>>2]|0)-G|0)==((S?J>>>1:c[E>>2]|0)|0)){if(S){T=J>>>1;U=J>>>1}else{J=c[E>>2]|0;T=J;U=J}z=0;aR(82,p|0,T<<1|0,0);if(z){z=0;K=34;break}if((a[q]&1)==0){V=10}else{V=(c[D>>2]&-2)-1|0}z=0;aR(82,p|0,V|0,0);if(z){z=0;K=34;break}if((a[q]&1)==0){W=y}else{W=c[A>>2]|0}c[r>>2]=W+U;X=W}else{X=G}J=I+12|0;S=c[J>>2]|0;Y=I+16|0;if((S|0)==(c[Y>>2]|0)){Z=(z=0,au(c[(c[I>>2]|0)+36>>2]|0,I|0)|0);if(z){z=0;K=34;break}_=Z&255}else{_=a[S]|0}if((FC(_,w,X,r,u,F,o,m,t,v)|0)!=0){P=X;Q=N;R=O;break}S=c[J>>2]|0;if((S|0)==(c[Y>>2]|0)){Y=c[(c[I>>2]|0)+40>>2]|0;z=0,au(Y|0,I|0)|0;if(!z){G=X;H=I;continue}else{z=0;K=34;break}}else{c[J>>2]=S+1;G=X;H=I;continue}}if((K|0)==34){H=bS(-1,-1)|0;$=M;aa=H;DK(p);DK(o);bg(aa|0)}H=d[o]|0;if((H&1|0)==0){ab=H>>>1}else{ab=c[o+4>>2]|0}do{if((ab|0)!=0){H=c[t>>2]|0;if((H-s|0)>=160){break}G=c[u>>2]|0;c[t>>2]=H+4;c[H>>2]=G}}while(0);G=(z=0,aU(6,P|0,c[r>>2]|0,k|0,w|0)|0);if(z){z=0;break}b[l>>1]=G;HV(o,m,c[t>>2]|0,k);do{if(L){ac=0}else{if((c[I+12>>2]|0)!=(c[I+16>>2]|0)){ac=I;break}G=(z=0,au(c[(c[I>>2]|0)+36>>2]|0,I|0)|0);if(z){z=0;break L6}if((G|0)!=-1){ac=I;break}c[B>>2]=0;ac=0}}while(0);B=(ac|0)==0;L75:do{if(R){K=62}else{do{if((c[Q+12>>2]|0)==(c[Q+16>>2]|0)){m=(z=0,au(c[(c[Q>>2]|0)+36>>2]|0,Q|0)|0);if(z){z=0;break L6}if((m|0)!=-1){break}c[C>>2]=0;K=62;break L75}}while(0);if(!(B^(Q|0)==0)){break}ad=e|0;c[ad>>2]=ac;DK(p);DK(o);i=f;return}}while(0);do{if((K|0)==62){if(B){break}ad=e|0;c[ad>>2]=ac;DK(p);DK(o);i=f;return}}while(0);c[k>>2]=c[k>>2]|2;ad=e|0;c[ad>>2]=ac;DK(p);DK(o);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;$=M;aa=f;DK(p);DK(o);bg(aa|0)}function Fp(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0;b=i;i=i+16|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;c[j>>2]=c[d>>2];c[k>>2]=c[e>>2];Fq(a,0,j,k,f,g,h);i=b;return}function Fq(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0;e=i;i=i+72|0;l=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[l>>2];l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=o;q=i;i=i+4|0;i=i+7&-8;r=i;i=i+160|0;s=i;i=i+4|0;i=i+7&-8;t=i;i=i+4|0;i=i+7&-8;u=c[h+4>>2]&74;if((u|0)==64){v=8}else if((u|0)==0){v=0}else if((u|0)==8){v=16}else{v=10}u=l|0;F0(n,h,u,m);Ld(p|0,0,12)|0;h=o;z=0;aR(82,o|0,10,0);L6:do{if(!z){if((a[p]&1)==0){l=h+1|0;w=l;x=l;y=o+8|0}else{l=o+8|0;w=c[l>>2]|0;x=h+1|0;y=l}c[q>>2]=w;l=r|0;c[s>>2]=l;c[t>>2]=0;A=f|0;B=g|0;C=o|0;D=o+4|0;E=a[m]|0;F=w;G=c[A>>2]|0;L12:while(1){do{if((G|0)==0){H=0}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){H=G;break}I=(z=0,au(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(z){z=0;J=34;break L12}if((I|0)!=-1){H=G;break}c[A>>2]=0;H=0}}while(0);K=(H|0)==0;I=c[B>>2]|0;do{if((I|0)==0){J=21}else{if((c[I+12>>2]|0)!=(c[I+16>>2]|0)){if(K){L=I;N=0;break}else{O=F;P=I;Q=0;break L12}}R=(z=0,au(c[(c[I>>2]|0)+36>>2]|0,I|0)|0);if(z){z=0;J=34;break L12}if((R|0)==-1){c[B>>2]=0;J=21;break}else{R=(I|0)==0;if(K^R){L=I;N=R;break}else{O=F;P=I;Q=R;break L12}}}}while(0);if((J|0)==21){J=0;if(K){O=F;P=0;Q=1;break}else{L=0;N=1}}I=d[p]|0;R=(I&1|0)==0;if(((c[q>>2]|0)-F|0)==((R?I>>>1:c[D>>2]|0)|0)){if(R){S=I>>>1;T=I>>>1}else{I=c[D>>2]|0;S=I;T=I}z=0;aR(82,o|0,S<<1|0,0);if(z){z=0;J=34;break}if((a[p]&1)==0){U=10}else{U=(c[C>>2]&-2)-1|0}z=0;aR(82,o|0,U|0,0);if(z){z=0;J=34;break}if((a[p]&1)==0){V=x}else{V=c[y>>2]|0}c[q>>2]=V+T;W=V}else{W=F}I=H+12|0;R=c[I>>2]|0;X=H+16|0;if((R|0)==(c[X>>2]|0)){Y=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(z){z=0;J=34;break}Z=Y&255}else{Z=a[R]|0}if((FC(Z,v,W,q,t,E,n,l,s,u)|0)!=0){O=W;P=L;Q=N;break}R=c[I>>2]|0;if((R|0)==(c[X>>2]|0)){X=c[(c[H>>2]|0)+40>>2]|0;z=0,au(X|0,H|0)|0;if(!z){F=W;G=H;continue}else{z=0;J=34;break}}else{c[I>>2]=R+1;F=W;G=H;continue}}if((J|0)==34){G=bS(-1,-1)|0;_=M;$=G;DK(o);DK(n);bg($|0)}G=d[n]|0;if((G&1|0)==0){aa=G>>>1}else{aa=c[n+4>>2]|0}do{if((aa|0)!=0){G=c[s>>2]|0;if((G-r|0)>=160){break}F=c[t>>2]|0;c[s>>2]=G+4;c[G>>2]=F}}while(0);F=(z=0,aU(2,O|0,c[q>>2]|0,j|0,v|0)|0);if(z){z=0;break}c[k>>2]=F;HV(n,l,c[s>>2]|0,j);do{if(K){ab=0}else{if((c[H+12>>2]|0)!=(c[H+16>>2]|0)){ab=H;break}F=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(z){z=0;break L6}if((F|0)!=-1){ab=H;break}c[A>>2]=0;ab=0}}while(0);A=(ab|0)==0;L75:do{if(Q){J=62}else{do{if((c[P+12>>2]|0)==(c[P+16>>2]|0)){l=(z=0,au(c[(c[P>>2]|0)+36>>2]|0,P|0)|0);if(z){z=0;break L6}if((l|0)!=-1){break}c[B>>2]=0;J=62;break L75}}while(0);if(!(A^(P|0)==0)){break}ac=b|0;c[ac>>2]=ab;DK(o);DK(n);i=e;return}}while(0);do{if((J|0)==62){if(A){break}ac=b|0;c[ac>>2]=ab;DK(o);DK(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;ac=b|0;c[ac>>2]=ab;DK(o);DK(n);i=e;return}else{z=0}}while(0);e=bS(-1,-1)|0;_=M;$=e;DK(o);DK(n);bg($|0)}function Fr(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0;b=i;i=i+16|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;c[j>>2]=c[d>>2];c[k>>2]=c[e>>2];Fs(a,0,j,k,f,g,h);i=b;return}function Fs(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0;e=i;i=i+72|0;l=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[l>>2];l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=o;q=i;i=i+4|0;i=i+7&-8;r=i;i=i+160|0;s=i;i=i+4|0;i=i+7&-8;t=i;i=i+4|0;i=i+7&-8;u=c[h+4>>2]&74;if((u|0)==8){v=16}else if((u|0)==64){v=8}else if((u|0)==0){v=0}else{v=10}u=l|0;F0(n,h,u,m);Ld(p|0,0,12)|0;h=o;z=0;aR(82,o|0,10,0);L6:do{if(!z){if((a[p]&1)==0){l=h+1|0;w=l;x=l;y=o+8|0}else{l=o+8|0;w=c[l>>2]|0;x=h+1|0;y=l}c[q>>2]=w;l=r|0;c[s>>2]=l;c[t>>2]=0;A=f|0;B=g|0;C=o|0;D=o+4|0;E=a[m]|0;F=w;G=c[A>>2]|0;L12:while(1){do{if((G|0)==0){H=0}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){H=G;break}I=(z=0,au(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(z){z=0;J=34;break L12}if((I|0)!=-1){H=G;break}c[A>>2]=0;H=0}}while(0);K=(H|0)==0;I=c[B>>2]|0;do{if((I|0)==0){J=21}else{if((c[I+12>>2]|0)!=(c[I+16>>2]|0)){if(K){L=I;N=0;break}else{O=F;P=I;Q=0;break L12}}R=(z=0,au(c[(c[I>>2]|0)+36>>2]|0,I|0)|0);if(z){z=0;J=34;break L12}if((R|0)==-1){c[B>>2]=0;J=21;break}else{R=(I|0)==0;if(K^R){L=I;N=R;break}else{O=F;P=I;Q=R;break L12}}}}while(0);if((J|0)==21){J=0;if(K){O=F;P=0;Q=1;break}else{L=0;N=1}}I=d[p]|0;R=(I&1|0)==0;if(((c[q>>2]|0)-F|0)==((R?I>>>1:c[D>>2]|0)|0)){if(R){S=I>>>1;T=I>>>1}else{I=c[D>>2]|0;S=I;T=I}z=0;aR(82,o|0,S<<1|0,0);if(z){z=0;J=34;break}if((a[p]&1)==0){U=10}else{U=(c[C>>2]&-2)-1|0}z=0;aR(82,o|0,U|0,0);if(z){z=0;J=34;break}if((a[p]&1)==0){V=x}else{V=c[y>>2]|0}c[q>>2]=V+T;W=V}else{W=F}I=H+12|0;R=c[I>>2]|0;X=H+16|0;if((R|0)==(c[X>>2]|0)){Y=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(z){z=0;J=34;break}Z=Y&255}else{Z=a[R]|0}if((FC(Z,v,W,q,t,E,n,l,s,u)|0)!=0){O=W;P=L;Q=N;break}R=c[I>>2]|0;if((R|0)==(c[X>>2]|0)){X=c[(c[H>>2]|0)+40>>2]|0;z=0,au(X|0,H|0)|0;if(!z){F=W;G=H;continue}else{z=0;J=34;break}}else{c[I>>2]=R+1;F=W;G=H;continue}}if((J|0)==34){G=bS(-1,-1)|0;_=M;$=G;DK(o);DK(n);bg($|0)}G=d[n]|0;if((G&1|0)==0){aa=G>>>1}else{aa=c[n+4>>2]|0}do{if((aa|0)!=0){G=c[s>>2]|0;if((G-r|0)>=160){break}F=c[t>>2]|0;c[s>>2]=G+4;c[G>>2]=F}}while(0);F=(z=0,aU(28,O|0,c[q>>2]|0,j|0,v|0)|0);if(z){z=0;break}c[k>>2]=F;HV(n,l,c[s>>2]|0,j);do{if(K){ab=0}else{if((c[H+12>>2]|0)!=(c[H+16>>2]|0)){ab=H;break}F=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(z){z=0;break L6}if((F|0)!=-1){ab=H;break}c[A>>2]=0;ab=0}}while(0);A=(ab|0)==0;L75:do{if(Q){J=62}else{do{if((c[P+12>>2]|0)==(c[P+16>>2]|0)){l=(z=0,au(c[(c[P>>2]|0)+36>>2]|0,P|0)|0);if(z){z=0;break L6}if((l|0)!=-1){break}c[B>>2]=0;J=62;break L75}}while(0);if(!(A^(P|0)==0)){break}ac=b|0;c[ac>>2]=ab;DK(o);DK(n);i=e;return}}while(0);do{if((J|0)==62){if(A){break}ac=b|0;c[ac>>2]=ab;DK(o);DK(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;ac=b|0;c[ac>>2]=ab;DK(o);DK(n);i=e;return}else{z=0}}while(0);e=bS(-1,-1)|0;_=M;$=e;DK(o);DK(n);bg($|0)}function Ft(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0;b=i;i=i+16|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;c[j>>2]=c[d>>2];c[k>>2]=c[e>>2];Fu(a,0,j,k,f,g,h);i=b;return}function Fu(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0;e=i;i=i+72|0;l=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[l>>2];l=e|0;m=e+32|0;n=e+40|0;o=e+56|0;p=o;q=i;i=i+4|0;i=i+7&-8;r=i;i=i+160|0;s=i;i=i+4|0;i=i+7&-8;t=i;i=i+4|0;i=i+7&-8;u=c[h+4>>2]&74;if((u|0)==64){v=8}else if((u|0)==0){v=0}else if((u|0)==8){v=16}else{v=10}u=l|0;F0(n,h,u,m);Ld(p|0,0,12)|0;h=o;z=0;aR(82,o|0,10,0);L6:do{if(!z){if((a[p]&1)==0){l=h+1|0;w=l;x=l;y=o+8|0}else{l=o+8|0;w=c[l>>2]|0;x=h+1|0;y=l}c[q>>2]=w;l=r|0;c[s>>2]=l;c[t>>2]=0;A=f|0;B=g|0;C=o|0;D=o+4|0;E=a[m]|0;F=w;G=c[A>>2]|0;L12:while(1){do{if((G|0)==0){H=0}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){H=G;break}I=(z=0,au(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(z){z=0;J=34;break L12}if((I|0)!=-1){H=G;break}c[A>>2]=0;H=0}}while(0);K=(H|0)==0;I=c[B>>2]|0;do{if((I|0)==0){J=21}else{if((c[I+12>>2]|0)!=(c[I+16>>2]|0)){if(K){L=I;N=0;break}else{O=F;P=I;Q=0;break L12}}R=(z=0,au(c[(c[I>>2]|0)+36>>2]|0,I|0)|0);if(z){z=0;J=34;break L12}if((R|0)==-1){c[B>>2]=0;J=21;break}else{R=(I|0)==0;if(K^R){L=I;N=R;break}else{O=F;P=I;Q=R;break L12}}}}while(0);if((J|0)==21){J=0;if(K){O=F;P=0;Q=1;break}else{L=0;N=1}}I=d[p]|0;R=(I&1|0)==0;if(((c[q>>2]|0)-F|0)==((R?I>>>1:c[D>>2]|0)|0)){if(R){S=I>>>1;T=I>>>1}else{I=c[D>>2]|0;S=I;T=I}z=0;aR(82,o|0,S<<1|0,0);if(z){z=0;J=34;break}if((a[p]&1)==0){U=10}else{U=(c[C>>2]&-2)-1|0}z=0;aR(82,o|0,U|0,0);if(z){z=0;J=34;break}if((a[p]&1)==0){V=x}else{V=c[y>>2]|0}c[q>>2]=V+T;W=V}else{W=F}I=H+12|0;R=c[I>>2]|0;X=H+16|0;if((R|0)==(c[X>>2]|0)){Y=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(z){z=0;J=34;break}Z=Y&255}else{Z=a[R]|0}if((FC(Z,v,W,q,t,E,n,l,s,u)|0)!=0){O=W;P=L;Q=N;break}R=c[I>>2]|0;if((R|0)==(c[X>>2]|0)){X=c[(c[H>>2]|0)+40>>2]|0;z=0,au(X|0,H|0)|0;if(!z){F=W;G=H;continue}else{z=0;J=34;break}}else{c[I>>2]=R+1;F=W;G=H;continue}}if((J|0)==34){G=bS(-1,-1)|0;_=M;$=G;DK(o);DK(n);bg($|0)}G=d[n]|0;if((G&1|0)==0){aa=G>>>1}else{aa=c[n+4>>2]|0}do{if((aa|0)!=0){G=c[s>>2]|0;if((G-r|0)>=160){break}F=c[t>>2]|0;c[s>>2]=G+4;c[G>>2]=F}}while(0);F=(z=0,aU(22,O|0,c[q>>2]|0,j|0,v|0)|0);G=M;if(z){z=0;break}c[k>>2]=F;c[k+4>>2]=G;HV(n,l,c[s>>2]|0,j);do{if(K){ab=0}else{if((c[H+12>>2]|0)!=(c[H+16>>2]|0)){ab=H;break}G=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(z){z=0;break L6}if((G|0)!=-1){ab=H;break}c[A>>2]=0;ab=0}}while(0);A=(ab|0)==0;L75:do{if(Q){J=62}else{do{if((c[P+12>>2]|0)==(c[P+16>>2]|0)){l=(z=0,au(c[(c[P>>2]|0)+36>>2]|0,P|0)|0);if(z){z=0;break L6}if((l|0)!=-1){break}c[B>>2]=0;J=62;break L75}}while(0);if(!(A^(P|0)==0)){break}ac=b|0;c[ac>>2]=ab;DK(o);DK(n);i=e;return}}while(0);do{if((J|0)==62){if(A){break}ac=b|0;c[ac>>2]=ab;DK(o);DK(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;ac=b|0;c[ac>>2]=ab;DK(o);DK(n);i=e;return}else{z=0}}while(0);e=bS(-1,-1)|0;_=M;$=e;DK(o);DK(n);bg($|0)}function Fv(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0;b=i;i=i+16|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;c[j>>2]=c[d>>2];c[k>>2]=c[e>>2];Fw(a,0,j,k,f,g,h);i=b;return}function Fw(b,e,f,h,j,k,l){b=b|0;e=e|0;f=f|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0.0,ag=0,ah=0;e=i;i=i+80|0;m=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[m>>2];m=h;h=i;i=i+4|0;i=i+7&-8;c[h>>2]=c[m>>2];m=e+32|0;n=e+40|0;o=e+48|0;p=e+64|0;q=p;r=i;i=i+4|0;i=i+7&-8;s=i;i=i+160|0;t=i;i=i+4|0;i=i+7&-8;u=i;i=i+4|0;i=i+7&-8;v=i;i=i+1|0;i=i+7&-8;w=i;i=i+1|0;i=i+7&-8;x=e|0;F1(o,j,x,m,n);Ld(q|0,0,12)|0;j=p;z=0;aR(82,p|0,10,0);L1:do{if(!z){if((a[q]&1)==0){y=j+1|0;A=y;B=y;C=p+8|0}else{y=p+8|0;A=c[y>>2]|0;B=j+1|0;C=y}c[r>>2]=A;y=s|0;c[t>>2]=y;c[u>>2]=0;a[v]=1;a[w]=69;D=f|0;E=h|0;F=p|0;G=p+4|0;H=a[m]|0;I=a[n]|0;J=A;K=c[D>>2]|0;L7:while(1){do{if((K|0)==0){L=0}else{if((c[K+12>>2]|0)!=(c[K+16>>2]|0)){L=K;break}N=(z=0,au(c[(c[K>>2]|0)+36>>2]|0,K|0)|0);if(z){z=0;O=30;break L7}if((N|0)!=-1){L=K;break}c[D>>2]=0;L=0}}while(0);P=(L|0)==0;N=c[E>>2]|0;do{if((N|0)==0){O=17}else{if((c[N+12>>2]|0)!=(c[N+16>>2]|0)){if(P){Q=N;R=0;break}else{S=J;T=N;U=0;break L7}}V=(z=0,au(c[(c[N>>2]|0)+36>>2]|0,N|0)|0);if(z){z=0;O=30;break L7}if((V|0)==-1){c[E>>2]=0;O=17;break}else{V=(N|0)==0;if(P^V){Q=N;R=V;break}else{S=J;T=N;U=V;break L7}}}}while(0);if((O|0)==17){O=0;if(P){S=J;T=0;U=1;break}else{Q=0;R=1}}N=d[q]|0;V=(N&1|0)==0;if(((c[r>>2]|0)-J|0)==((V?N>>>1:c[G>>2]|0)|0)){if(V){W=N>>>1;X=N>>>1}else{N=c[G>>2]|0;W=N;X=N}z=0;aR(82,p|0,W<<1|0,0);if(z){z=0;O=30;break}if((a[q]&1)==0){Y=10}else{Y=(c[F>>2]&-2)-1|0}z=0;aR(82,p|0,Y|0,0);if(z){z=0;O=30;break}if((a[q]&1)==0){Z=B}else{Z=c[C>>2]|0}c[r>>2]=Z+X;_=Z}else{_=J}N=L+12|0;V=c[N>>2]|0;$=L+16|0;if((V|0)==(c[$>>2]|0)){aa=(z=0,au(c[(c[L>>2]|0)+36>>2]|0,L|0)|0);if(z){z=0;O=30;break}ab=aa&255}else{ab=a[V]|0}if((F2(ab,v,w,_,r,H,I,o,y,t,u,x)|0)!=0){S=_;T=Q;U=R;break}V=c[N>>2]|0;if((V|0)==(c[$>>2]|0)){$=c[(c[L>>2]|0)+40>>2]|0;z=0,au($|0,L|0)|0;if(!z){J=_;K=L;continue}else{z=0;O=30;break}}else{c[N>>2]=V+1;J=_;K=L;continue}}if((O|0)==30){K=bS(-1,-1)|0;ac=M;ad=K;DK(p);DK(o);bg(ad|0)}K=d[o]|0;if((K&1|0)==0){ae=K>>>1}else{ae=c[o+4>>2]|0}do{if((ae|0)!=0){if((a[v]&1)==0){break}K=c[t>>2]|0;if((K-s|0)>=160){break}J=c[u>>2]|0;c[t>>2]=K+4;c[K>>2]=J}}while(0);af=(z=0,+(+aF(2,S|0,c[r>>2]|0,k|0)));if(z){z=0;break}g[l>>2]=af;HV(o,y,c[t>>2]|0,k);do{if(P){ag=0}else{if((c[L+12>>2]|0)!=(c[L+16>>2]|0)){ag=L;break}J=(z=0,au(c[(c[L>>2]|0)+36>>2]|0,L|0)|0);if(z){z=0;break L1}if((J|0)!=-1){ag=L;break}c[D>>2]=0;ag=0}}while(0);D=(ag|0)==0;L71:do{if(U){O=59}else{do{if((c[T+12>>2]|0)==(c[T+16>>2]|0)){y=(z=0,au(c[(c[T>>2]|0)+36>>2]|0,T|0)|0);if(z){z=0;break L1}if((y|0)!=-1){break}c[E>>2]=0;O=59;break L71}}while(0);if(!(D^(T|0)==0)){break}ah=b|0;c[ah>>2]=ag;DK(p);DK(o);i=e;return}}while(0);do{if((O|0)==59){if(D){break}ah=b|0;c[ah>>2]=ag;DK(p);DK(o);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;ah=b|0;c[ah>>2]=ag;DK(p);DK(o);i=e;return}else{z=0}}while(0);e=bS(-1,-1)|0;ac=M;ad=e;DK(p);DK(o);bg(ad|0)}function Fx(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0;b=i;i=i+16|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;c[j>>2]=c[d>>2];c[k>>2]=c[e>>2];Fy(a,0,j,k,f,g,h);i=b;return}function Fy(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0.0,ag=0,ah=0;e=i;i=i+80|0;m=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[m>>2];m=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[m>>2];m=e+32|0;n=e+40|0;o=e+48|0;p=e+64|0;q=p;r=i;i=i+4|0;i=i+7&-8;s=i;i=i+160|0;t=i;i=i+4|0;i=i+7&-8;u=i;i=i+4|0;i=i+7&-8;v=i;i=i+1|0;i=i+7&-8;w=i;i=i+1|0;i=i+7&-8;x=e|0;F1(o,j,x,m,n);Ld(q|0,0,12)|0;j=p;z=0;aR(82,p|0,10,0);L1:do{if(!z){if((a[q]&1)==0){y=j+1|0;A=y;B=y;C=p+8|0}else{y=p+8|0;A=c[y>>2]|0;B=j+1|0;C=y}c[r>>2]=A;y=s|0;c[t>>2]=y;c[u>>2]=0;a[v]=1;a[w]=69;D=f|0;E=g|0;F=p|0;G=p+4|0;H=a[m]|0;I=a[n]|0;J=A;K=c[D>>2]|0;L7:while(1){do{if((K|0)==0){L=0}else{if((c[K+12>>2]|0)!=(c[K+16>>2]|0)){L=K;break}N=(z=0,au(c[(c[K>>2]|0)+36>>2]|0,K|0)|0);if(z){z=0;O=30;break L7}if((N|0)!=-1){L=K;break}c[D>>2]=0;L=0}}while(0);P=(L|0)==0;N=c[E>>2]|0;do{if((N|0)==0){O=17}else{if((c[N+12>>2]|0)!=(c[N+16>>2]|0)){if(P){Q=N;R=0;break}else{S=J;T=N;U=0;break L7}}V=(z=0,au(c[(c[N>>2]|0)+36>>2]|0,N|0)|0);if(z){z=0;O=30;break L7}if((V|0)==-1){c[E>>2]=0;O=17;break}else{V=(N|0)==0;if(P^V){Q=N;R=V;break}else{S=J;T=N;U=V;break L7}}}}while(0);if((O|0)==17){O=0;if(P){S=J;T=0;U=1;break}else{Q=0;R=1}}N=d[q]|0;V=(N&1|0)==0;if(((c[r>>2]|0)-J|0)==((V?N>>>1:c[G>>2]|0)|0)){if(V){W=N>>>1;X=N>>>1}else{N=c[G>>2]|0;W=N;X=N}z=0;aR(82,p|0,W<<1|0,0);if(z){z=0;O=30;break}if((a[q]&1)==0){Y=10}else{Y=(c[F>>2]&-2)-1|0}z=0;aR(82,p|0,Y|0,0);if(z){z=0;O=30;break}if((a[q]&1)==0){Z=B}else{Z=c[C>>2]|0}c[r>>2]=Z+X;_=Z}else{_=J}N=L+12|0;V=c[N>>2]|0;$=L+16|0;if((V|0)==(c[$>>2]|0)){aa=(z=0,au(c[(c[L>>2]|0)+36>>2]|0,L|0)|0);if(z){z=0;O=30;break}ab=aa&255}else{ab=a[V]|0}if((F2(ab,v,w,_,r,H,I,o,y,t,u,x)|0)!=0){S=_;T=Q;U=R;break}V=c[N>>2]|0;if((V|0)==(c[$>>2]|0)){$=c[(c[L>>2]|0)+40>>2]|0;z=0,au($|0,L|0)|0;if(!z){J=_;K=L;continue}else{z=0;O=30;break}}else{c[N>>2]=V+1;J=_;K=L;continue}}if((O|0)==30){K=bS(-1,-1)|0;ac=M;ad=K;DK(p);DK(o);bg(ad|0)}K=d[o]|0;if((K&1|0)==0){ae=K>>>1}else{ae=c[o+4>>2]|0}do{if((ae|0)!=0){if((a[v]&1)==0){break}K=c[t>>2]|0;if((K-s|0)>=160){break}J=c[u>>2]|0;c[t>>2]=K+4;c[K>>2]=J}}while(0);af=(z=0,+(+aN(4,S|0,c[r>>2]|0,k|0)));if(z){z=0;break}h[l>>3]=af;HV(o,y,c[t>>2]|0,k);do{if(P){ag=0}else{if((c[L+12>>2]|0)!=(c[L+16>>2]|0)){ag=L;break}J=(z=0,au(c[(c[L>>2]|0)+36>>2]|0,L|0)|0);if(z){z=0;break L1}if((J|0)!=-1){ag=L;break}c[D>>2]=0;ag=0}}while(0);D=(ag|0)==0;L71:do{if(U){O=59}else{do{if((c[T+12>>2]|0)==(c[T+16>>2]|0)){y=(z=0,au(c[(c[T>>2]|0)+36>>2]|0,T|0)|0);if(z){z=0;break L1}if((y|0)!=-1){break}c[E>>2]=0;O=59;break L71}}while(0);if(!(D^(T|0)==0)){break}ah=b|0;c[ah>>2]=ag;DK(p);DK(o);i=e;return}}while(0);do{if((O|0)==59){if(D){break}ah=b|0;c[ah>>2]=ag;DK(p);DK(o);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;ah=b|0;c[ah>>2]=ag;DK(p);DK(o);i=e;return}else{z=0}}while(0);e=bS(-1,-1)|0;ac=M;ad=e;DK(p);DK(o);bg(ad|0)}function Fz(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0;b=i;i=i+16|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;c[j>>2]=c[d>>2];c[k>>2]=c[e>>2];FA(a,0,j,k,f,g,h);i=b;return}function FA(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0.0,ag=0,ah=0;e=i;i=i+80|0;m=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[m>>2];m=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[m>>2];m=e+32|0;n=e+40|0;o=e+48|0;p=e+64|0;q=p;r=i;i=i+4|0;i=i+7&-8;s=i;i=i+160|0;t=i;i=i+4|0;i=i+7&-8;u=i;i=i+4|0;i=i+7&-8;v=i;i=i+1|0;i=i+7&-8;w=i;i=i+1|0;i=i+7&-8;x=e|0;F1(o,j,x,m,n);Ld(q|0,0,12)|0;j=p;z=0;aR(82,p|0,10,0);L1:do{if(!z){if((a[q]&1)==0){y=j+1|0;A=y;B=y;C=p+8|0}else{y=p+8|0;A=c[y>>2]|0;B=j+1|0;C=y}c[r>>2]=A;y=s|0;c[t>>2]=y;c[u>>2]=0;a[v]=1;a[w]=69;D=f|0;E=g|0;F=p|0;G=p+4|0;H=a[m]|0;I=a[n]|0;J=A;K=c[D>>2]|0;L7:while(1){do{if((K|0)==0){L=0}else{if((c[K+12>>2]|0)!=(c[K+16>>2]|0)){L=K;break}N=(z=0,au(c[(c[K>>2]|0)+36>>2]|0,K|0)|0);if(z){z=0;O=30;break L7}if((N|0)!=-1){L=K;break}c[D>>2]=0;L=0}}while(0);P=(L|0)==0;N=c[E>>2]|0;do{if((N|0)==0){O=17}else{if((c[N+12>>2]|0)!=(c[N+16>>2]|0)){if(P){Q=N;R=0;break}else{S=J;T=N;U=0;break L7}}V=(z=0,au(c[(c[N>>2]|0)+36>>2]|0,N|0)|0);if(z){z=0;O=30;break L7}if((V|0)==-1){c[E>>2]=0;O=17;break}else{V=(N|0)==0;if(P^V){Q=N;R=V;break}else{S=J;T=N;U=V;break L7}}}}while(0);if((O|0)==17){O=0;if(P){S=J;T=0;U=1;break}else{Q=0;R=1}}N=d[q]|0;V=(N&1|0)==0;if(((c[r>>2]|0)-J|0)==((V?N>>>1:c[G>>2]|0)|0)){if(V){W=N>>>1;X=N>>>1}else{N=c[G>>2]|0;W=N;X=N}z=0;aR(82,p|0,W<<1|0,0);if(z){z=0;O=30;break}if((a[q]&1)==0){Y=10}else{Y=(c[F>>2]&-2)-1|0}z=0;aR(82,p|0,Y|0,0);if(z){z=0;O=30;break}if((a[q]&1)==0){Z=B}else{Z=c[C>>2]|0}c[r>>2]=Z+X;_=Z}else{_=J}N=L+12|0;V=c[N>>2]|0;$=L+16|0;if((V|0)==(c[$>>2]|0)){aa=(z=0,au(c[(c[L>>2]|0)+36>>2]|0,L|0)|0);if(z){z=0;O=30;break}ab=aa&255}else{ab=a[V]|0}if((F2(ab,v,w,_,r,H,I,o,y,t,u,x)|0)!=0){S=_;T=Q;U=R;break}V=c[N>>2]|0;if((V|0)==(c[$>>2]|0)){$=c[(c[L>>2]|0)+40>>2]|0;z=0,au($|0,L|0)|0;if(!z){J=_;K=L;continue}else{z=0;O=30;break}}else{c[N>>2]=V+1;J=_;K=L;continue}}if((O|0)==30){K=bS(-1,-1)|0;ac=M;ad=K;DK(p);DK(o);bg(ad|0)}K=d[o]|0;if((K&1|0)==0){ae=K>>>1}else{ae=c[o+4>>2]|0}do{if((ae|0)!=0){if((a[v]&1)==0){break}K=c[t>>2]|0;if((K-s|0)>=160){break}J=c[u>>2]|0;c[t>>2]=K+4;c[K>>2]=J}}while(0);af=(z=0,+(+aN(2,S|0,c[r>>2]|0,k|0)));if(z){z=0;break}h[l>>3]=af;HV(o,y,c[t>>2]|0,k);do{if(P){ag=0}else{if((c[L+12>>2]|0)!=(c[L+16>>2]|0)){ag=L;break}J=(z=0,au(c[(c[L>>2]|0)+36>>2]|0,L|0)|0);if(z){z=0;break L1}if((J|0)!=-1){ag=L;break}c[D>>2]=0;ag=0}}while(0);D=(ag|0)==0;L71:do{if(U){O=59}else{do{if((c[T+12>>2]|0)==(c[T+16>>2]|0)){y=(z=0,au(c[(c[T>>2]|0)+36>>2]|0,T|0)|0);if(z){z=0;break L1}if((y|0)!=-1){break}c[E>>2]=0;O=59;break L71}}while(0);if(!(D^(T|0)==0)){break}ah=b|0;c[ah>>2]=ag;DK(p);DK(o);i=e;return}}while(0);do{if((O|0)==59){if(D){break}ah=b|0;c[ah>>2]=ag;DK(p);DK(o);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;ah=b|0;c[ah>>2]=ag;DK(p);DK(o);i=e;return}else{z=0}}while(0);e=bS(-1,-1)|0;ac=M;ad=e;DK(p);DK(o);bg(ad|0)}function FB(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0;e=i;i=i+64|0;l=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[l>>2];l=e|0;m=e+16|0;n=e+48|0;o=i;i=i+4|0;i=i+7&-8;p=i;i=i+12|0;i=i+7&-8;q=i;i=i+4|0;i=i+7&-8;r=i;i=i+160|0;s=i;i=i+4|0;i=i+7&-8;t=i;i=i+4|0;i=i+7&-8;Ld(n|0,0,12)|0;u=p;z=0;as(348,o|0,h|0);if(z){z=0;h=bS(-1,-1)|0;v=M;w=h;DK(n);x=w;y=0;A=x;B=v;bg(A|0)}h=o|0;o=c[h>>2]|0;if((c[10220]|0)==-1){C=4}else{c[l>>2]=40880;c[l+4>>2]=460;c[l+8>>2]=0;z=0;aR(2,40880,l|0,518);if(!z){C=4}else{z=0}}L7:do{if((C|0)==4){l=(c[10221]|0)-1|0;D=c[o+8>>2]|0;do{if((c[o+12>>2]|0)-D>>2>>>0>l>>>0){E=c[D+(l<<2)>>2]|0;if((E|0)==0){break}F=E;G=m|0;H=c[(c[E>>2]|0)+32>>2]|0;z=0,aU(H|0,F|0,31760,31786,G|0)|0;if(z){z=0;break L7}Di(c[h>>2]|0)|0;Ld(u|0,0,12)|0;F=p;z=0;aR(82,p|0,10,0);L13:do{if(!z){if((a[u]&1)==0){H=F+1|0;I=H;J=H;K=p+8|0}else{H=p+8|0;I=c[H>>2]|0;J=F+1|0;K=H}c[q>>2]=I;H=r|0;c[s>>2]=H;c[t>>2]=0;E=f|0;L=g|0;N=p|0;O=p+4|0;P=I;Q=c[E>>2]|0;L19:while(1){do{if((Q|0)==0){R=0}else{if((c[Q+12>>2]|0)!=(c[Q+16>>2]|0)){R=Q;break}S=(z=0,au(c[(c[Q>>2]|0)+36>>2]|0,Q|0)|0);if(z){z=0;C=40;break L19}if((S|0)!=-1){R=Q;break}c[E>>2]=0;R=0}}while(0);S=(R|0)==0;T=c[L>>2]|0;do{if((T|0)==0){C=25}else{if((c[T+12>>2]|0)!=(c[T+16>>2]|0)){if(S){break}else{U=P;break L19}}V=(z=0,au(c[(c[T>>2]|0)+36>>2]|0,T|0)|0);if(z){z=0;C=40;break L19}if((V|0)==-1){c[L>>2]=0;C=25;break}else{if(S^(T|0)==0){break}else{U=P;break L19}}}}while(0);if((C|0)==25){C=0;if(S){U=P;break}}T=d[u]|0;V=(T&1|0)==0;if(((c[q>>2]|0)-P|0)==((V?T>>>1:c[O>>2]|0)|0)){if(V){W=T>>>1;X=T>>>1}else{T=c[O>>2]|0;W=T;X=T}z=0;aR(82,p|0,W<<1|0,0);if(z){z=0;C=40;break}if((a[u]&1)==0){Y=10}else{Y=(c[N>>2]&-2)-1|0}z=0;aR(82,p|0,Y|0,0);if(z){z=0;C=40;break}if((a[u]&1)==0){Z=J}else{Z=c[K>>2]|0}c[q>>2]=Z+X;_=Z}else{_=P}T=R+12|0;V=c[T>>2]|0;$=R+16|0;if((V|0)==(c[$>>2]|0)){aa=(z=0,au(c[(c[R>>2]|0)+36>>2]|0,R|0)|0);if(z){z=0;C=40;break}ab=aa&255}else{ab=a[V]|0}if((FC(ab,16,_,q,t,0,n,H,s,G)|0)!=0){U=_;break}V=c[T>>2]|0;if((V|0)==(c[$>>2]|0)){$=c[(c[R>>2]|0)+40>>2]|0;z=0,au($|0,R|0)|0;if(!z){P=_;Q=R;continue}else{z=0;C=40;break}}else{c[T>>2]=V+1;P=_;Q=R;continue}}if((C|0)==40){Q=bS(-1,-1)|0;ac=M;ad=Q;break}a[U+3|0]=0;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}Q=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9834]=Q;break}else{z=0;Q=bS(-1,-1)|0;ac=M;ad=Q;break L13}}}while(0);Q=(z=0,aU(18,U|0,c[9834]|0,8184,(P=i,i=i+8|0,c[P>>2]=k,P)|0)|0);i=P;if(z){z=0;C=41;break}if((Q|0)!=1){c[j>>2]=4}Q=c[E>>2]|0;do{if((Q|0)==0){ae=0}else{if((c[Q+12>>2]|0)!=(c[Q+16>>2]|0)){ae=Q;break}P=(z=0,au(c[(c[Q>>2]|0)+36>>2]|0,Q|0)|0);if(z){z=0;C=41;break L13}if((P|0)!=-1){ae=Q;break}c[E>>2]=0;ae=0}}while(0);E=(ae|0)==0;Q=c[L>>2]|0;do{if((Q|0)==0){C=70}else{if((c[Q+12>>2]|0)!=(c[Q+16>>2]|0)){if(!E){break}af=b|0;c[af>>2]=ae;DK(p);DK(n);i=e;return}P=(z=0,au(c[(c[Q>>2]|0)+36>>2]|0,Q|0)|0);if(z){z=0;C=41;break L13}if((P|0)==-1){c[L>>2]=0;C=70;break}if(!(E^(Q|0)==0)){break}af=b|0;c[af>>2]=ae;DK(p);DK(n);i=e;return}}while(0);do{if((C|0)==70){if(E){break}af=b|0;c[af>>2]=ae;DK(p);DK(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;af=b|0;c[af>>2]=ae;DK(p);DK(n);i=e;return}else{z=0;C=41}}while(0);if((C|0)==41){G=bS(-1,-1)|0;ac=M;ad=G}DK(p);v=ac;w=ad;DK(n);x=w;y=0;A=x;B=v;bg(A|0)}}while(0);l=ck(4)|0;Kw(l);z=0;aR(146,l|0,28488,100);if(z){z=0;break}}}while(0);ad=bS(-1,-1)|0;ac=M;Di(c[h>>2]|0)|0;v=ac;w=ad;DK(n);x=w;y=0;A=x;B=v;bg(A|0)}function FC(b,e,f,g,h,i,j,k,l,m){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0;n=c[g>>2]|0;o=(n|0)==(f|0);do{if(o){p=(a[m+24|0]|0)==b<<24>>24;if(!p){if((a[m+25|0]|0)!=b<<24>>24){break}}c[g>>2]=f+1;a[f]=p?43:45;c[h>>2]=0;q=0;return q|0}}while(0);p=d[j]|0;if((p&1|0)==0){r=p>>>1}else{r=c[j+4>>2]|0}if((r|0)!=0&b<<24>>24==i<<24>>24){i=c[l>>2]|0;if((i-k|0)>=160){q=0;return q|0}k=c[h>>2]|0;c[l>>2]=i+4;c[i>>2]=k;c[h>>2]=0;q=0;return q|0}k=m+26|0;i=m;while(1){l=i+1|0;if((a[i]|0)==b<<24>>24){s=i;break}if((l|0)==(k|0)){s=k;break}else{i=l}}i=s-m|0;if((i|0)>23){q=-1;return q|0}do{if((e|0)==8|(e|0)==10){if((i|0)<(e|0)){break}else{q=-1}return q|0}else if((e|0)==16){if((i|0)<22){break}if(o){q=-1;return q|0}if((n-f|0)>=3){q=-1;return q|0}if((a[n-1|0]|0)!=48){q=-1;return q|0}c[h>>2]=0;m=a[31760+i|0]|0;s=c[g>>2]|0;c[g>>2]=s+1;a[s]=m;q=0;return q|0}}while(0);f=a[31760+i|0]|0;c[g>>2]=n+1;a[n]=f;c[h>>2]=(c[h>>2]|0)+1;q=0;return q|0}function FD(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f|0;h=g;c[h>>2]=e;c[h+4>>2]=0;h=b5(b|0)|0;b=bi(a|0,d|0,g|0)|0;if((h|0)==0){i=f;return b|0}z=0,au(36,h|0)|0;if(!z){i=f;return b|0}else{z=0;b=bS(-1,-1,0)|0;dk(b);return 0}return 0}function FE(a){a=a|0;Dg(a|0);K1(a);return}function FF(a){a=a|0;Dg(a|0);return}function FG(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;k=i;i=i+112|0;l=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[l>>2];l=k|0;m=k+16|0;n=k+32|0;o=k+40|0;p=k+48|0;q=k+56|0;r=k+64|0;s=k+72|0;t=k+80|0;u=k+104|0;if((c[g+4>>2]&1|0)==0){c[n>>2]=-1;v=c[(c[d>>2]|0)+16>>2]|0;w=e|0;c[p>>2]=c[w>>2];c[q>>2]=c[f>>2];cQ[v&127](o,d,p,q,g,h,n);q=c[o>>2]|0;c[w>>2]=q;w=c[n>>2]|0;if((w|0)==0){a[j]=0}else if((w|0)==1){a[j]=1}else{a[j]=1;c[h>>2]=4}c[b>>2]=q;i=k;return}D3(r,g);q=r|0;r=c[q>>2]|0;if((c[10218]|0)==-1){x=9}else{c[m>>2]=40872;c[m+4>>2]=460;c[m+8>>2]=0;z=0;aR(2,40872,m|0,518);if(!z){x=9}else{z=0}}do{if((x|0)==9){m=(c[10219]|0)-1|0;w=c[r+8>>2]|0;do{if((c[r+12>>2]|0)-w>>2>>>0>m>>>0){n=c[w+(m<<2)>>2]|0;if((n|0)==0){break}o=n;Di(c[q>>2]|0)|0;D3(s,g);n=s|0;p=c[n>>2]|0;if((c[10122]|0)==-1){x=15}else{c[l>>2]=40488;c[l+4>>2]=460;c[l+8>>2]=0;z=0;aR(2,40488,l|0,518);if(!z){x=15}else{z=0}}do{if((x|0)==15){d=(c[10123]|0)-1|0;v=c[p+8>>2]|0;do{if((c[p+12>>2]|0)-v>>2>>>0>d>>>0){y=c[v+(d<<2)>>2]|0;if((y|0)==0){break}A=y;Di(c[n>>2]|0)|0;B=t|0;C=y;z=0;as(c[(c[C>>2]|0)+24>>2]|0,B|0,A|0);do{if(!z){y=t+12|0;z=0;as(c[(c[C>>2]|0)+28>>2]|0,y|0,A|0);if(z){z=0;D=y;break}c[u>>2]=c[f>>2];y=(z=0,ao(2,e|0,u|0,B|0,t+24|0,o|0,h|0,1)|0);if(!z){a[j]=(y|0)==(B|0)|0;c[b>>2]=c[e>>2];DW(t+12|0);DW(t|0);i=k;return}else{z=0;y=bS(-1,-1)|0;E=M;DW(t+12|0);DW(t|0);F=y;G=E;H=F;I=0;J=H;K=G;bg(J|0)}}else{z=0;D=B}}while(0);A=bS(-1,-1)|0;C=A;A=M;if((B|0)==(D|0)){F=C;G=A;H=F;I=0;J=H;K=G;bg(J|0)}else{L=D}while(1){E=L-12|0;DW(E);if((E|0)==(B|0)){F=C;G=A;break}else{L=E}}H=F;I=0;J=H;K=G;bg(J|0)}}while(0);d=ck(4)|0;Kw(d);z=0;aR(146,d|0,28488,100);if(z){z=0;break}}}while(0);o=bS(-1,-1)|0;p=M;Di(c[n>>2]|0)|0;F=o;G=p;H=F;I=0;J=H;K=G;bg(J|0)}}while(0);m=ck(4)|0;Kw(m);z=0;aR(146,m|0,28488,100);if(z){z=0;break}}}while(0);L=bS(-1,-1)|0;D=M;Di(c[q>>2]|0)|0;F=L;G=D;H=F;I=0;J=H;K=G;bg(J|0)}function FH(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0;l=i;i=i+104|0;m=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[m>>2];m=(g-f|0)/12|0;n=l|0;do{if(m>>>0>100>>>0){o=KV(m)|0;if((o|0)!=0){p=o;q=o;break}z=0;aS(4);if(!z){p=0;q=0;break}else{z=0}o=bS(-1,-1)|0;r=M;s=o;bg(s|0)}else{p=n;q=0}}while(0);n=(f|0)==(g|0);if(n){t=m;u=0}else{o=m;m=0;v=p;w=f;while(1){x=d[w]|0;if((x&1|0)==0){y=x>>>1}else{y=c[w+4>>2]|0}if((y|0)==0){a[v]=2;A=m+1|0;B=o-1|0}else{a[v]=1;A=m;B=o}x=w+12|0;if((x|0)==(g|0)){t=B;u=A;break}else{o=B;m=A;v=v+1|0;w=x}}}w=b|0;b=e|0;e=h;v=0;A=u;u=t;L19:while(1){t=c[w>>2]|0;do{if((t|0)==0){C=0}else{m=c[t+12>>2]|0;if((m|0)==(c[t+16>>2]|0)){B=(z=0,au(c[(c[t>>2]|0)+36>>2]|0,t|0)|0);if(!z){D=B}else{z=0;E=6;break L19}}else{D=c[m>>2]|0}if((D|0)==-1){c[w>>2]=0;C=0;break}else{C=c[w>>2]|0;break}}}while(0);t=(C|0)==0;m=c[b>>2]|0;if((m|0)==0){F=C;G=0}else{B=c[m+12>>2]|0;if((B|0)==(c[m+16>>2]|0)){o=(z=0,au(c[(c[m>>2]|0)+36>>2]|0,m|0)|0);if(!z){H=o}else{z=0;E=6;break}}else{H=c[B>>2]|0}if((H|0)==-1){c[b>>2]=0;I=0}else{I=m}F=c[w>>2]|0;G=I}J=(G|0)==0;if(!((t^J)&(u|0)!=0)){E=82;break}t=c[F+12>>2]|0;if((t|0)==(c[F+16>>2]|0)){m=(z=0,au(c[(c[F>>2]|0)+36>>2]|0,F|0)|0);if(!z){K=m}else{z=0;E=6;break}}else{K=c[t>>2]|0}if(k){L=K}else{t=(z=0,aM(c[(c[e>>2]|0)+28>>2]|0,h|0,K|0)|0);if(!z){L=t}else{z=0;E=6;break}}do{if(n){N=A;O=u}else{t=v+1|0;L51:do{if(k){m=u;B=A;o=p;y=0;x=f;while(1){do{if((a[o]|0)==1){P=x;if((a[P]&1)==0){Q=x+4|0}else{Q=c[x+8>>2]|0}if((L|0)!=(c[Q+(v<<2)>>2]|0)){a[o]=0;R=y;S=B;T=m-1|0;break}U=d[P]|0;if((U&1|0)==0){V=U>>>1}else{V=c[x+4>>2]|0}if((V|0)!=(t|0)){R=1;S=B;T=m;break}a[o]=2;R=1;S=B+1|0;T=m-1|0}else{R=y;S=B;T=m}}while(0);U=x+12|0;if((U|0)==(g|0)){W=T;X=S;Y=R;break L51}m=T;B=S;o=o+1|0;y=R;x=U}}else{x=u;y=A;o=p;B=0;m=f;while(1){do{if((a[o]|0)==1){U=m;if((a[U]&1)==0){Z=m+4|0}else{Z=c[m+8>>2]|0}P=(z=0,aM(c[(c[e>>2]|0)+28>>2]|0,h|0,c[Z+(v<<2)>>2]|0)|0);if(z){z=0;E=5;break L19}if((L|0)!=(P|0)){a[o]=0;_=B;$=y;aa=x-1|0;break}P=d[U]|0;if((P&1|0)==0){ab=P>>>1}else{ab=c[m+4>>2]|0}if((ab|0)!=(t|0)){_=1;$=y;aa=x;break}a[o]=2;_=1;$=y+1|0;aa=x-1|0}else{_=B;$=y;aa=x}}while(0);P=m+12|0;if((P|0)==(g|0)){W=aa;X=$;Y=_;break L51}x=aa;y=$;o=o+1|0;B=_;m=P}}}while(0);if(!Y){N=X;O=W;break}t=c[w>>2]|0;m=t+12|0;B=c[m>>2]|0;if((B|0)==(c[t+16>>2]|0)){o=c[(c[t>>2]|0)+40>>2]|0;z=0,au(o|0,t|0)|0;if(z){z=0;E=6;break L19}}else{c[m>>2]=B+4}if((X+W|0)>>>0<2>>>0|n){N=X;O=W;break}B=v+1|0;m=X;t=p;o=f;while(1){do{if((a[t]|0)==2){y=d[o]|0;if((y&1|0)==0){ac=y>>>1}else{ac=c[o+4>>2]|0}if((ac|0)==(B|0)){ad=m;break}a[t]=0;ad=m-1|0}else{ad=m}}while(0);y=o+12|0;if((y|0)==(g|0)){N=ad;O=W;break}else{m=ad;t=t+1|0;o=y}}}}while(0);v=v+1|0;A=N;u=O}if((E|0)==6){O=bS(-1,-1)|0;ae=M;af=O}else if((E|0)==5){O=bS(-1,-1)|0;ae=M;af=O}else if((E|0)==82){do{if((F|0)==0){ag=1;E=89}else{O=c[F+12>>2]|0;if((O|0)==(c[F+16>>2]|0)){u=(z=0,au(c[(c[F>>2]|0)+36>>2]|0,F|0)|0);if(!z){ah=u}else{z=0;break}}else{ah=c[O>>2]|0}if((ah|0)==-1){c[w>>2]=0;ag=1;E=89;break}else{ag=(c[w>>2]|0)==0;E=89;break}}}while(0);L120:do{if((E|0)==89){do{if(J){E=95}else{w=c[G+12>>2]|0;if((w|0)==(c[G+16>>2]|0)){ah=(z=0,au(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(!z){ai=ah}else{z=0;break L120}}else{ai=c[w>>2]|0}if((ai|0)==-1){c[b>>2]=0;E=95;break}else{if(ag^(G|0)==0){break}else{E=97;break}}}}while(0);if((E|0)==95){if(ag){E=97}}if((E|0)==97){c[j>>2]=c[j>>2]|2}L136:do{if(n){E=102}else{w=f;ah=p;while(1){if((a[ah]|0)==2){aj=w;break L136}F=w+12|0;if((F|0)==(g|0)){E=102;break L136}w=F;ah=ah+1|0}}}while(0);if((E|0)==102){c[j>>2]=c[j>>2]|4;aj=g}if((q|0)==0){i=l;return aj|0}KW(q);i=l;return aj|0}}while(0);aj=bS(-1,-1)|0;ae=M;af=aj}if((q|0)==0){r=ae;s=af;bg(s|0)}KW(q);r=ae;s=af;bg(s|0);return 0}function FI(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0;b=i;i=i+16|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;c[j>>2]=c[d>>2];c[k>>2]=c[e>>2];FJ(a,0,j,k,f,g,h);i=b;return}function FJ(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0;e=i;i=i+144|0;l=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[l>>2];l=e|0;m=e+104|0;n=e+112|0;o=e+128|0;p=o;q=i;i=i+4|0;i=i+7&-8;r=i;i=i+160|0;s=i;i=i+4|0;i=i+7&-8;t=i;i=i+4|0;i=i+7&-8;u=c[h+4>>2]&74;if((u|0)==8){v=16}else if((u|0)==64){v=8}else if((u|0)==0){v=0}else{v=10}u=l|0;F3(n,h,u,m);Ld(p|0,0,12)|0;h=o;z=0;aR(82,o|0,10,0);L6:do{if(!z){if((a[p]&1)==0){l=h+1|0;w=l;x=l;y=o+8|0}else{l=o+8|0;w=c[l>>2]|0;x=h+1|0;y=l}c[q>>2]=w;l=r|0;c[s>>2]=l;c[t>>2]=0;A=f|0;B=g|0;C=o|0;D=o+4|0;E=c[m>>2]|0;F=w;G=c[A>>2]|0;L12:while(1){do{if((G|0)==0){H=0}else{I=c[G+12>>2]|0;if((I|0)==(c[G+16>>2]|0)){J=(z=0,au(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(!z){K=J}else{z=0;L=35;break L12}}else{K=c[I>>2]|0}if((K|0)!=-1){H=G;break}c[A>>2]=0;H=0}}while(0);N=(H|0)==0;I=c[B>>2]|0;do{if((I|0)==0){L=22}else{J=c[I+12>>2]|0;if((J|0)==(c[I+16>>2]|0)){O=(z=0,au(c[(c[I>>2]|0)+36>>2]|0,I|0)|0);if(!z){P=O}else{z=0;L=35;break L12}}else{P=c[J>>2]|0}if((P|0)==-1){c[B>>2]=0;L=22;break}else{J=(I|0)==0;if(N^J){Q=I;R=J;break}else{S=F;T=I;U=J;break L12}}}}while(0);if((L|0)==22){L=0;if(N){S=F;T=0;U=1;break}else{Q=0;R=1}}I=d[p]|0;J=(I&1|0)==0;if(((c[q>>2]|0)-F|0)==((J?I>>>1:c[D>>2]|0)|0)){if(J){V=I>>>1;W=I>>>1}else{I=c[D>>2]|0;V=I;W=I}z=0;aR(82,o|0,V<<1|0,0);if(z){z=0;L=35;break}if((a[p]&1)==0){X=10}else{X=(c[C>>2]&-2)-1|0}z=0;aR(82,o|0,X|0,0);if(z){z=0;L=35;break}if((a[p]&1)==0){Y=x}else{Y=c[y>>2]|0}c[q>>2]=Y+W;Z=Y}else{Z=F}I=H+12|0;J=c[I>>2]|0;O=H+16|0;if((J|0)==(c[O>>2]|0)){_=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(!z){$=_}else{z=0;L=35;break}}else{$=c[J>>2]|0}if((F$($,v,Z,q,t,E,n,l,s,u)|0)!=0){S=Z;T=Q;U=R;break}J=c[I>>2]|0;if((J|0)==(c[O>>2]|0)){O=c[(c[H>>2]|0)+40>>2]|0;z=0,au(O|0,H|0)|0;if(!z){F=Z;G=H;continue}else{z=0;L=35;break}}else{c[I>>2]=J+4;F=Z;G=H;continue}}if((L|0)==35){G=bS(-1,-1)|0;aa=M;ab=G;DK(o);DK(n);bg(ab|0)}G=d[n]|0;if((G&1|0)==0){ac=G>>>1}else{ac=c[n+4>>2]|0}do{if((ac|0)!=0){G=c[s>>2]|0;if((G-r|0)>=160){break}F=c[t>>2]|0;c[s>>2]=G+4;c[G>>2]=F}}while(0);F=(z=0,aU(40,S|0,c[q>>2]|0,j|0,v|0)|0);if(z){z=0;break}c[k>>2]=F;HV(n,l,c[s>>2]|0,j);do{if(N){ad=0}else{F=c[H+12>>2]|0;if((F|0)==(c[H+16>>2]|0)){G=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(!z){ae=G}else{z=0;break L6}}else{ae=c[F>>2]|0}if((ae|0)!=-1){ad=H;break}c[A>>2]=0;ad=0}}while(0);A=(ad|0)==0;do{if(U){L=64}else{l=c[T+12>>2]|0;if((l|0)==(c[T+16>>2]|0)){F=(z=0,au(c[(c[T>>2]|0)+36>>2]|0,T|0)|0);if(!z){af=F}else{z=0;break L6}}else{af=c[l>>2]|0}if((af|0)==-1){c[B>>2]=0;L=64;break}if(!(A^(T|0)==0)){break}ag=b|0;c[ag>>2]=ad;DK(o);DK(n);i=e;return}}while(0);do{if((L|0)==64){if(A){break}ag=b|0;c[ag>>2]=ad;DK(o);DK(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;ag=b|0;c[ag>>2]=ad;DK(o);DK(n);i=e;return}else{z=0}}while(0);e=bS(-1,-1)|0;aa=M;ab=e;DK(o);DK(n);bg(ab|0)}function FK(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0;b=i;i=i+16|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;c[j>>2]=c[d>>2];c[k>>2]=c[e>>2];FL(a,0,j,k,f,g,h);i=b;return}function FL(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0;e=i;i=i+144|0;l=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[l>>2];l=e|0;m=e+104|0;n=e+112|0;o=e+128|0;p=o;q=i;i=i+4|0;i=i+7&-8;r=i;i=i+160|0;s=i;i=i+4|0;i=i+7&-8;t=i;i=i+4|0;i=i+7&-8;u=c[h+4>>2]&74;if((u|0)==8){v=16}else if((u|0)==64){v=8}else if((u|0)==0){v=0}else{v=10}u=l|0;F3(n,h,u,m);Ld(p|0,0,12)|0;h=o;z=0;aR(82,o|0,10,0);L6:do{if(!z){if((a[p]&1)==0){l=h+1|0;w=l;x=l;y=o+8|0}else{l=o+8|0;w=c[l>>2]|0;x=h+1|0;y=l}c[q>>2]=w;l=r|0;c[s>>2]=l;c[t>>2]=0;A=f|0;B=g|0;C=o|0;D=o+4|0;E=c[m>>2]|0;F=w;G=c[A>>2]|0;L12:while(1){do{if((G|0)==0){H=0}else{I=c[G+12>>2]|0;if((I|0)==(c[G+16>>2]|0)){J=(z=0,au(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(!z){K=J}else{z=0;L=35;break L12}}else{K=c[I>>2]|0}if((K|0)!=-1){H=G;break}c[A>>2]=0;H=0}}while(0);N=(H|0)==0;I=c[B>>2]|0;do{if((I|0)==0){L=22}else{J=c[I+12>>2]|0;if((J|0)==(c[I+16>>2]|0)){O=(z=0,au(c[(c[I>>2]|0)+36>>2]|0,I|0)|0);if(!z){P=O}else{z=0;L=35;break L12}}else{P=c[J>>2]|0}if((P|0)==-1){c[B>>2]=0;L=22;break}else{J=(I|0)==0;if(N^J){Q=I;R=J;break}else{S=F;T=I;U=J;break L12}}}}while(0);if((L|0)==22){L=0;if(N){S=F;T=0;U=1;break}else{Q=0;R=1}}I=d[p]|0;J=(I&1|0)==0;if(((c[q>>2]|0)-F|0)==((J?I>>>1:c[D>>2]|0)|0)){if(J){V=I>>>1;W=I>>>1}else{I=c[D>>2]|0;V=I;W=I}z=0;aR(82,o|0,V<<1|0,0);if(z){z=0;L=35;break}if((a[p]&1)==0){X=10}else{X=(c[C>>2]&-2)-1|0}z=0;aR(82,o|0,X|0,0);if(z){z=0;L=35;break}if((a[p]&1)==0){Y=x}else{Y=c[y>>2]|0}c[q>>2]=Y+W;Z=Y}else{Z=F}I=H+12|0;J=c[I>>2]|0;O=H+16|0;if((J|0)==(c[O>>2]|0)){_=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(!z){$=_}else{z=0;L=35;break}}else{$=c[J>>2]|0}if((F$($,v,Z,q,t,E,n,l,s,u)|0)!=0){S=Z;T=Q;U=R;break}J=c[I>>2]|0;if((J|0)==(c[O>>2]|0)){O=c[(c[H>>2]|0)+40>>2]|0;z=0,au(O|0,H|0)|0;if(!z){F=Z;G=H;continue}else{z=0;L=35;break}}else{c[I>>2]=J+4;F=Z;G=H;continue}}if((L|0)==35){G=bS(-1,-1)|0;aa=M;ab=G;DK(o);DK(n);bg(ab|0)}G=d[n]|0;if((G&1|0)==0){ac=G>>>1}else{ac=c[n+4>>2]|0}do{if((ac|0)!=0){G=c[s>>2]|0;if((G-r|0)>=160){break}F=c[t>>2]|0;c[s>>2]=G+4;c[G>>2]=F}}while(0);F=(z=0,aU(4,S|0,c[q>>2]|0,j|0,v|0)|0);G=M;if(z){z=0;break}c[k>>2]=F;c[k+4>>2]=G;HV(n,l,c[s>>2]|0,j);do{if(N){ad=0}else{G=c[H+12>>2]|0;if((G|0)==(c[H+16>>2]|0)){F=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(!z){ae=F}else{z=0;break L6}}else{ae=c[G>>2]|0}if((ae|0)!=-1){ad=H;break}c[A>>2]=0;ad=0}}while(0);A=(ad|0)==0;do{if(U){L=64}else{l=c[T+12>>2]|0;if((l|0)==(c[T+16>>2]|0)){G=(z=0,au(c[(c[T>>2]|0)+36>>2]|0,T|0)|0);if(!z){af=G}else{z=0;break L6}}else{af=c[l>>2]|0}if((af|0)==-1){c[B>>2]=0;L=64;break}if(!(A^(T|0)==0)){break}ag=b|0;c[ag>>2]=ad;DK(o);DK(n);i=e;return}}while(0);do{if((L|0)==64){if(A){break}ag=b|0;c[ag>>2]=ad;DK(o);DK(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;ag=b|0;c[ag>>2]=ad;DK(o);DK(n);i=e;return}else{z=0}}while(0);e=bS(-1,-1)|0;aa=M;ab=e;DK(o);DK(n);bg(ab|0)}function FM(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0;b=i;i=i+16|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;c[j>>2]=c[d>>2];c[k>>2]=c[e>>2];FN(a,0,j,k,f,g,h);i=b;return}function FN(e,f,g,h,j,k,l){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0;f=i;i=i+144|0;m=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[m>>2];m=h;h=i;i=i+4|0;i=i+7&-8;c[h>>2]=c[m>>2];m=f|0;n=f+104|0;o=f+112|0;p=f+128|0;q=p;r=i;i=i+4|0;i=i+7&-8;s=i;i=i+160|0;t=i;i=i+4|0;i=i+7&-8;u=i;i=i+4|0;i=i+7&-8;v=c[j+4>>2]&74;if((v|0)==8){w=16}else if((v|0)==64){w=8}else if((v|0)==0){w=0}else{w=10}v=m|0;F3(o,j,v,n);Ld(q|0,0,12)|0;j=p;z=0;aR(82,p|0,10,0);L6:do{if(!z){if((a[q]&1)==0){m=j+1|0;x=m;y=m;A=p+8|0}else{m=p+8|0;x=c[m>>2]|0;y=j+1|0;A=m}c[r>>2]=x;m=s|0;c[t>>2]=m;c[u>>2]=0;B=g|0;C=h|0;D=p|0;E=p+4|0;F=c[n>>2]|0;G=x;H=c[B>>2]|0;L12:while(1){do{if((H|0)==0){I=0}else{J=c[H+12>>2]|0;if((J|0)==(c[H+16>>2]|0)){K=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(!z){L=K}else{z=0;N=35;break L12}}else{L=c[J>>2]|0}if((L|0)!=-1){I=H;break}c[B>>2]=0;I=0}}while(0);O=(I|0)==0;J=c[C>>2]|0;do{if((J|0)==0){N=22}else{K=c[J+12>>2]|0;if((K|0)==(c[J+16>>2]|0)){P=(z=0,au(c[(c[J>>2]|0)+36>>2]|0,J|0)|0);if(!z){Q=P}else{z=0;N=35;break L12}}else{Q=c[K>>2]|0}if((Q|0)==-1){c[C>>2]=0;N=22;break}else{K=(J|0)==0;if(O^K){R=J;S=K;break}else{T=G;U=J;V=K;break L12}}}}while(0);if((N|0)==22){N=0;if(O){T=G;U=0;V=1;break}else{R=0;S=1}}J=d[q]|0;K=(J&1|0)==0;if(((c[r>>2]|0)-G|0)==((K?J>>>1:c[E>>2]|0)|0)){if(K){W=J>>>1;X=J>>>1}else{J=c[E>>2]|0;W=J;X=J}z=0;aR(82,p|0,W<<1|0,0);if(z){z=0;N=35;break}if((a[q]&1)==0){Y=10}else{Y=(c[D>>2]&-2)-1|0}z=0;aR(82,p|0,Y|0,0);if(z){z=0;N=35;break}if((a[q]&1)==0){Z=y}else{Z=c[A>>2]|0}c[r>>2]=Z+X;_=Z}else{_=G}J=I+12|0;K=c[J>>2]|0;P=I+16|0;if((K|0)==(c[P>>2]|0)){$=(z=0,au(c[(c[I>>2]|0)+36>>2]|0,I|0)|0);if(!z){aa=$}else{z=0;N=35;break}}else{aa=c[K>>2]|0}if((F$(aa,w,_,r,u,F,o,m,t,v)|0)!=0){T=_;U=R;V=S;break}K=c[J>>2]|0;if((K|0)==(c[P>>2]|0)){P=c[(c[I>>2]|0)+40>>2]|0;z=0,au(P|0,I|0)|0;if(!z){G=_;H=I;continue}else{z=0;N=35;break}}else{c[J>>2]=K+4;G=_;H=I;continue}}if((N|0)==35){H=bS(-1,-1)|0;ab=M;ac=H;DK(p);DK(o);bg(ac|0)}H=d[o]|0;if((H&1|0)==0){ad=H>>>1}else{ad=c[o+4>>2]|0}do{if((ad|0)!=0){H=c[t>>2]|0;if((H-s|0)>=160){break}G=c[u>>2]|0;c[t>>2]=H+4;c[H>>2]=G}}while(0);G=(z=0,aU(6,T|0,c[r>>2]|0,k|0,w|0)|0);if(z){z=0;break}b[l>>1]=G;HV(o,m,c[t>>2]|0,k);do{if(O){ae=0}else{G=c[I+12>>2]|0;if((G|0)==(c[I+16>>2]|0)){H=(z=0,au(c[(c[I>>2]|0)+36>>2]|0,I|0)|0);if(!z){af=H}else{z=0;break L6}}else{af=c[G>>2]|0}if((af|0)!=-1){ae=I;break}c[B>>2]=0;ae=0}}while(0);B=(ae|0)==0;do{if(V){N=64}else{m=c[U+12>>2]|0;if((m|0)==(c[U+16>>2]|0)){G=(z=0,au(c[(c[U>>2]|0)+36>>2]|0,U|0)|0);if(!z){ag=G}else{z=0;break L6}}else{ag=c[m>>2]|0}if((ag|0)==-1){c[C>>2]=0;N=64;break}if(!(B^(U|0)==0)){break}ah=e|0;c[ah>>2]=ae;DK(p);DK(o);i=f;return}}while(0);do{if((N|0)==64){if(B){break}ah=e|0;c[ah>>2]=ae;DK(p);DK(o);i=f;return}}while(0);c[k>>2]=c[k>>2]|2;ah=e|0;c[ah>>2]=ae;DK(p);DK(o);i=f;return}else{z=0}}while(0);f=bS(-1,-1)|0;ab=M;ac=f;DK(p);DK(o);bg(ac|0)}function FO(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0;b=i;i=i+16|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;c[j>>2]=c[d>>2];c[k>>2]=c[e>>2];FP(a,0,j,k,f,g,h);i=b;return}function FP(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0;e=i;i=i+144|0;l=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[l>>2];l=e|0;m=e+104|0;n=e+112|0;o=e+128|0;p=o;q=i;i=i+4|0;i=i+7&-8;r=i;i=i+160|0;s=i;i=i+4|0;i=i+7&-8;t=i;i=i+4|0;i=i+7&-8;u=c[h+4>>2]&74;if((u|0)==8){v=16}else if((u|0)==64){v=8}else if((u|0)==0){v=0}else{v=10}u=l|0;F3(n,h,u,m);Ld(p|0,0,12)|0;h=o;z=0;aR(82,o|0,10,0);L6:do{if(!z){if((a[p]&1)==0){l=h+1|0;w=l;x=l;y=o+8|0}else{l=o+8|0;w=c[l>>2]|0;x=h+1|0;y=l}c[q>>2]=w;l=r|0;c[s>>2]=l;c[t>>2]=0;A=f|0;B=g|0;C=o|0;D=o+4|0;E=c[m>>2]|0;F=w;G=c[A>>2]|0;L12:while(1){do{if((G|0)==0){H=0}else{I=c[G+12>>2]|0;if((I|0)==(c[G+16>>2]|0)){J=(z=0,au(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(!z){K=J}else{z=0;L=35;break L12}}else{K=c[I>>2]|0}if((K|0)!=-1){H=G;break}c[A>>2]=0;H=0}}while(0);N=(H|0)==0;I=c[B>>2]|0;do{if((I|0)==0){L=22}else{J=c[I+12>>2]|0;if((J|0)==(c[I+16>>2]|0)){O=(z=0,au(c[(c[I>>2]|0)+36>>2]|0,I|0)|0);if(!z){P=O}else{z=0;L=35;break L12}}else{P=c[J>>2]|0}if((P|0)==-1){c[B>>2]=0;L=22;break}else{J=(I|0)==0;if(N^J){Q=I;R=J;break}else{S=F;T=I;U=J;break L12}}}}while(0);if((L|0)==22){L=0;if(N){S=F;T=0;U=1;break}else{Q=0;R=1}}I=d[p]|0;J=(I&1|0)==0;if(((c[q>>2]|0)-F|0)==((J?I>>>1:c[D>>2]|0)|0)){if(J){V=I>>>1;W=I>>>1}else{I=c[D>>2]|0;V=I;W=I}z=0;aR(82,o|0,V<<1|0,0);if(z){z=0;L=35;break}if((a[p]&1)==0){X=10}else{X=(c[C>>2]&-2)-1|0}z=0;aR(82,o|0,X|0,0);if(z){z=0;L=35;break}if((a[p]&1)==0){Y=x}else{Y=c[y>>2]|0}c[q>>2]=Y+W;Z=Y}else{Z=F}I=H+12|0;J=c[I>>2]|0;O=H+16|0;if((J|0)==(c[O>>2]|0)){_=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(!z){$=_}else{z=0;L=35;break}}else{$=c[J>>2]|0}if((F$($,v,Z,q,t,E,n,l,s,u)|0)!=0){S=Z;T=Q;U=R;break}J=c[I>>2]|0;if((J|0)==(c[O>>2]|0)){O=c[(c[H>>2]|0)+40>>2]|0;z=0,au(O|0,H|0)|0;if(!z){F=Z;G=H;continue}else{z=0;L=35;break}}else{c[I>>2]=J+4;F=Z;G=H;continue}}if((L|0)==35){G=bS(-1,-1)|0;aa=M;ab=G;DK(o);DK(n);bg(ab|0)}G=d[n]|0;if((G&1|0)==0){ac=G>>>1}else{ac=c[n+4>>2]|0}do{if((ac|0)!=0){G=c[s>>2]|0;if((G-r|0)>=160){break}F=c[t>>2]|0;c[s>>2]=G+4;c[G>>2]=F}}while(0);F=(z=0,aU(2,S|0,c[q>>2]|0,j|0,v|0)|0);if(z){z=0;break}c[k>>2]=F;HV(n,l,c[s>>2]|0,j);do{if(N){ad=0}else{F=c[H+12>>2]|0;if((F|0)==(c[H+16>>2]|0)){G=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(!z){ae=G}else{z=0;break L6}}else{ae=c[F>>2]|0}if((ae|0)!=-1){ad=H;break}c[A>>2]=0;ad=0}}while(0);A=(ad|0)==0;do{if(U){L=64}else{l=c[T+12>>2]|0;if((l|0)==(c[T+16>>2]|0)){F=(z=0,au(c[(c[T>>2]|0)+36>>2]|0,T|0)|0);if(!z){af=F}else{z=0;break L6}}else{af=c[l>>2]|0}if((af|0)==-1){c[B>>2]=0;L=64;break}if(!(A^(T|0)==0)){break}ag=b|0;c[ag>>2]=ad;DK(o);DK(n);i=e;return}}while(0);do{if((L|0)==64){if(A){break}ag=b|0;c[ag>>2]=ad;DK(o);DK(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;ag=b|0;c[ag>>2]=ad;DK(o);DK(n);i=e;return}else{z=0}}while(0);e=bS(-1,-1)|0;aa=M;ab=e;DK(o);DK(n);bg(ab|0)}function FQ(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0;b=i;i=i+16|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;c[j>>2]=c[d>>2];c[k>>2]=c[e>>2];FR(a,0,j,k,f,g,h);i=b;return}function FR(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0;e=i;i=i+144|0;l=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[l>>2];l=e|0;m=e+104|0;n=e+112|0;o=e+128|0;p=o;q=i;i=i+4|0;i=i+7&-8;r=i;i=i+160|0;s=i;i=i+4|0;i=i+7&-8;t=i;i=i+4|0;i=i+7&-8;u=c[h+4>>2]&74;if((u|0)==8){v=16}else if((u|0)==64){v=8}else if((u|0)==0){v=0}else{v=10}u=l|0;F3(n,h,u,m);Ld(p|0,0,12)|0;h=o;z=0;aR(82,o|0,10,0);L6:do{if(!z){if((a[p]&1)==0){l=h+1|0;w=l;x=l;y=o+8|0}else{l=o+8|0;w=c[l>>2]|0;x=h+1|0;y=l}c[q>>2]=w;l=r|0;c[s>>2]=l;c[t>>2]=0;A=f|0;B=g|0;C=o|0;D=o+4|0;E=c[m>>2]|0;F=w;G=c[A>>2]|0;L12:while(1){do{if((G|0)==0){H=0}else{I=c[G+12>>2]|0;if((I|0)==(c[G+16>>2]|0)){J=(z=0,au(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(!z){K=J}else{z=0;L=35;break L12}}else{K=c[I>>2]|0}if((K|0)!=-1){H=G;break}c[A>>2]=0;H=0}}while(0);N=(H|0)==0;I=c[B>>2]|0;do{if((I|0)==0){L=22}else{J=c[I+12>>2]|0;if((J|0)==(c[I+16>>2]|0)){O=(z=0,au(c[(c[I>>2]|0)+36>>2]|0,I|0)|0);if(!z){P=O}else{z=0;L=35;break L12}}else{P=c[J>>2]|0}if((P|0)==-1){c[B>>2]=0;L=22;break}else{J=(I|0)==0;if(N^J){Q=I;R=J;break}else{S=F;T=I;U=J;break L12}}}}while(0);if((L|0)==22){L=0;if(N){S=F;T=0;U=1;break}else{Q=0;R=1}}I=d[p]|0;J=(I&1|0)==0;if(((c[q>>2]|0)-F|0)==((J?I>>>1:c[D>>2]|0)|0)){if(J){V=I>>>1;W=I>>>1}else{I=c[D>>2]|0;V=I;W=I}z=0;aR(82,o|0,V<<1|0,0);if(z){z=0;L=35;break}if((a[p]&1)==0){X=10}else{X=(c[C>>2]&-2)-1|0}z=0;aR(82,o|0,X|0,0);if(z){z=0;L=35;break}if((a[p]&1)==0){Y=x}else{Y=c[y>>2]|0}c[q>>2]=Y+W;Z=Y}else{Z=F}I=H+12|0;J=c[I>>2]|0;O=H+16|0;if((J|0)==(c[O>>2]|0)){_=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(!z){$=_}else{z=0;L=35;break}}else{$=c[J>>2]|0}if((F$($,v,Z,q,t,E,n,l,s,u)|0)!=0){S=Z;T=Q;U=R;break}J=c[I>>2]|0;if((J|0)==(c[O>>2]|0)){O=c[(c[H>>2]|0)+40>>2]|0;z=0,au(O|0,H|0)|0;if(!z){F=Z;G=H;continue}else{z=0;L=35;break}}else{c[I>>2]=J+4;F=Z;G=H;continue}}if((L|0)==35){G=bS(-1,-1)|0;aa=M;ab=G;DK(o);DK(n);bg(ab|0)}G=d[n]|0;if((G&1|0)==0){ac=G>>>1}else{ac=c[n+4>>2]|0}do{if((ac|0)!=0){G=c[s>>2]|0;if((G-r|0)>=160){break}F=c[t>>2]|0;c[s>>2]=G+4;c[G>>2]=F}}while(0);F=(z=0,aU(28,S|0,c[q>>2]|0,j|0,v|0)|0);if(z){z=0;break}c[k>>2]=F;HV(n,l,c[s>>2]|0,j);do{if(N){ad=0}else{F=c[H+12>>2]|0;if((F|0)==(c[H+16>>2]|0)){G=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(!z){ae=G}else{z=0;break L6}}else{ae=c[F>>2]|0}if((ae|0)!=-1){ad=H;break}c[A>>2]=0;ad=0}}while(0);A=(ad|0)==0;do{if(U){L=64}else{l=c[T+12>>2]|0;if((l|0)==(c[T+16>>2]|0)){F=(z=0,au(c[(c[T>>2]|0)+36>>2]|0,T|0)|0);if(!z){af=F}else{z=0;break L6}}else{af=c[l>>2]|0}if((af|0)==-1){c[B>>2]=0;L=64;break}if(!(A^(T|0)==0)){break}ag=b|0;c[ag>>2]=ad;DK(o);DK(n);i=e;return}}while(0);do{if((L|0)==64){if(A){break}ag=b|0;c[ag>>2]=ad;DK(o);DK(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;ag=b|0;c[ag>>2]=ad;DK(o);DK(n);i=e;return}else{z=0}}while(0);e=bS(-1,-1)|0;aa=M;ab=e;DK(o);DK(n);bg(ab|0)}function FS(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0;b=i;i=i+16|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;c[j>>2]=c[d>>2];c[k>>2]=c[e>>2];FT(a,0,j,k,f,g,h);i=b;return}function FT(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0;e=i;i=i+144|0;l=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[l>>2];l=e|0;m=e+104|0;n=e+112|0;o=e+128|0;p=o;q=i;i=i+4|0;i=i+7&-8;r=i;i=i+160|0;s=i;i=i+4|0;i=i+7&-8;t=i;i=i+4|0;i=i+7&-8;u=c[h+4>>2]&74;if((u|0)==8){v=16}else if((u|0)==64){v=8}else if((u|0)==0){v=0}else{v=10}u=l|0;F3(n,h,u,m);Ld(p|0,0,12)|0;h=o;z=0;aR(82,o|0,10,0);L6:do{if(!z){if((a[p]&1)==0){l=h+1|0;w=l;x=l;y=o+8|0}else{l=o+8|0;w=c[l>>2]|0;x=h+1|0;y=l}c[q>>2]=w;l=r|0;c[s>>2]=l;c[t>>2]=0;A=f|0;B=g|0;C=o|0;D=o+4|0;E=c[m>>2]|0;F=w;G=c[A>>2]|0;L12:while(1){do{if((G|0)==0){H=0}else{I=c[G+12>>2]|0;if((I|0)==(c[G+16>>2]|0)){J=(z=0,au(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(!z){K=J}else{z=0;L=35;break L12}}else{K=c[I>>2]|0}if((K|0)!=-1){H=G;break}c[A>>2]=0;H=0}}while(0);N=(H|0)==0;I=c[B>>2]|0;do{if((I|0)==0){L=22}else{J=c[I+12>>2]|0;if((J|0)==(c[I+16>>2]|0)){O=(z=0,au(c[(c[I>>2]|0)+36>>2]|0,I|0)|0);if(!z){P=O}else{z=0;L=35;break L12}}else{P=c[J>>2]|0}if((P|0)==-1){c[B>>2]=0;L=22;break}else{J=(I|0)==0;if(N^J){Q=I;R=J;break}else{S=F;T=I;U=J;break L12}}}}while(0);if((L|0)==22){L=0;if(N){S=F;T=0;U=1;break}else{Q=0;R=1}}I=d[p]|0;J=(I&1|0)==0;if(((c[q>>2]|0)-F|0)==((J?I>>>1:c[D>>2]|0)|0)){if(J){V=I>>>1;W=I>>>1}else{I=c[D>>2]|0;V=I;W=I}z=0;aR(82,o|0,V<<1|0,0);if(z){z=0;L=35;break}if((a[p]&1)==0){X=10}else{X=(c[C>>2]&-2)-1|0}z=0;aR(82,o|0,X|0,0);if(z){z=0;L=35;break}if((a[p]&1)==0){Y=x}else{Y=c[y>>2]|0}c[q>>2]=Y+W;Z=Y}else{Z=F}I=H+12|0;J=c[I>>2]|0;O=H+16|0;if((J|0)==(c[O>>2]|0)){_=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(!z){$=_}else{z=0;L=35;break}}else{$=c[J>>2]|0}if((F$($,v,Z,q,t,E,n,l,s,u)|0)!=0){S=Z;T=Q;U=R;break}J=c[I>>2]|0;if((J|0)==(c[O>>2]|0)){O=c[(c[H>>2]|0)+40>>2]|0;z=0,au(O|0,H|0)|0;if(!z){F=Z;G=H;continue}else{z=0;L=35;break}}else{c[I>>2]=J+4;F=Z;G=H;continue}}if((L|0)==35){G=bS(-1,-1)|0;aa=M;ab=G;DK(o);DK(n);bg(ab|0)}G=d[n]|0;if((G&1|0)==0){ac=G>>>1}else{ac=c[n+4>>2]|0}do{if((ac|0)!=0){G=c[s>>2]|0;if((G-r|0)>=160){break}F=c[t>>2]|0;c[s>>2]=G+4;c[G>>2]=F}}while(0);F=(z=0,aU(22,S|0,c[q>>2]|0,j|0,v|0)|0);G=M;if(z){z=0;break}c[k>>2]=F;c[k+4>>2]=G;HV(n,l,c[s>>2]|0,j);do{if(N){ad=0}else{G=c[H+12>>2]|0;if((G|0)==(c[H+16>>2]|0)){F=(z=0,au(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(!z){ae=F}else{z=0;break L6}}else{ae=c[G>>2]|0}if((ae|0)!=-1){ad=H;break}c[A>>2]=0;ad=0}}while(0);A=(ad|0)==0;do{if(U){L=64}else{l=c[T+12>>2]|0;if((l|0)==(c[T+16>>2]|0)){G=(z=0,au(c[(c[T>>2]|0)+36>>2]|0,T|0)|0);if(!z){af=G}else{z=0;break L6}}else{af=c[l>>2]|0}if((af|0)==-1){c[B>>2]=0;L=64;break}if(!(A^(T|0)==0)){break}ag=b|0;c[ag>>2]=ad;DK(o);DK(n);i=e;return}}while(0);do{if((L|0)==64){if(A){break}ag=b|0;c[ag>>2]=ad;DK(o);DK(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;ag=b|0;c[ag>>2]=ad;DK(o);DK(n);i=e;return}else{z=0}}while(0);e=bS(-1,-1)|0;aa=M;ab=e;DK(o);DK(n);bg(ab|0)}function FU(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0;b=i;i=i+16|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;c[j>>2]=c[d>>2];c[k>>2]=c[e>>2];FV(a,0,j,k,f,g,h);i=b;return}function FV(b,e,f,h,j,k,l){b=b|0;e=e|0;f=f|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0.0,ai=0,aj=0,ak=0,al=0;e=i;i=i+176|0;m=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[m>>2];m=h;h=i;i=i+4|0;i=i+7&-8;c[h>>2]=c[m>>2];m=e+128|0;n=e+136|0;o=e+144|0;p=e+160|0;q=p;r=i;i=i+4|0;i=i+7&-8;s=i;i=i+160|0;t=i;i=i+4|0;i=i+7&-8;u=i;i=i+4|0;i=i+7&-8;v=i;i=i+1|0;i=i+7&-8;w=i;i=i+1|0;i=i+7&-8;x=e|0;F4(o,j,x,m,n);Ld(q|0,0,12)|0;j=p;z=0;aR(82,p|0,10,0);L1:do{if(!z){if((a[q]&1)==0){y=j+1|0;A=y;B=y;C=p+8|0}else{y=p+8|0;A=c[y>>2]|0;B=j+1|0;C=y}c[r>>2]=A;y=s|0;c[t>>2]=y;c[u>>2]=0;a[v]=1;a[w]=69;D=f|0;E=h|0;F=p|0;G=p+4|0;H=c[m>>2]|0;I=c[n>>2]|0;J=A;K=c[D>>2]|0;L7:while(1){do{if((K|0)==0){L=0}else{N=c[K+12>>2]|0;if((N|0)==(c[K+16>>2]|0)){O=(z=0,au(c[(c[K>>2]|0)+36>>2]|0,K|0)|0);if(!z){P=O}else{z=0;Q=31;break L7}}else{P=c[N>>2]|0}if((P|0)!=-1){L=K;break}c[D>>2]=0;L=0}}while(0);R=(L|0)==0;N=c[E>>2]|0;do{if((N|0)==0){Q=18}else{O=c[N+12>>2]|0;if((O|0)==(c[N+16>>2]|0)){S=(z=0,au(c[(c[N>>2]|0)+36>>2]|0,N|0)|0);if(!z){T=S}else{z=0;Q=31;break L7}}else{T=c[O>>2]|0}if((T|0)==-1){c[E>>2]=0;Q=18;break}else{O=(N|0)==0;if(R^O){U=N;V=O;break}else{W=J;X=N;Y=O;break L7}}}}while(0);if((Q|0)==18){Q=0;if(R){W=J;X=0;Y=1;break}else{U=0;V=1}}N=d[q]|0;O=(N&1|0)==0;if(((c[r>>2]|0)-J|0)==((O?N>>>1:c[G>>2]|0)|0)){if(O){Z=N>>>1;_=N>>>1}else{N=c[G>>2]|0;Z=N;_=N}z=0;aR(82,p|0,Z<<1|0,0);if(z){z=0;Q=31;break}if((a[q]&1)==0){$=10}else{$=(c[F>>2]&-2)-1|0}z=0;aR(82,p|0,$|0,0);if(z){z=0;Q=31;break}if((a[q]&1)==0){aa=B}else{aa=c[C>>2]|0}c[r>>2]=aa+_;ab=aa}else{ab=J}N=L+12|0;O=c[N>>2]|0;S=L+16|0;if((O|0)==(c[S>>2]|0)){ac=(z=0,au(c[(c[L>>2]|0)+36>>2]|0,L|0)|0);if(!z){ad=ac}else{z=0;Q=31;break}}else{ad=c[O>>2]|0}if((F5(ad,v,w,ab,r,H,I,o,y,t,u,x)|0)!=0){W=ab;X=U;Y=V;break}O=c[N>>2]|0;if((O|0)==(c[S>>2]|0)){S=c[(c[L>>2]|0)+40>>2]|0;z=0,au(S|0,L|0)|0;if(!z){J=ab;K=L;continue}else{z=0;Q=31;break}}else{c[N>>2]=O+4;J=ab;K=L;continue}}if((Q|0)==31){K=bS(-1,-1)|0;ae=M;af=K;DK(p);DK(o);bg(af|0)}K=d[o]|0;if((K&1|0)==0){ag=K>>>1}else{ag=c[o+4>>2]|0}do{if((ag|0)!=0){if((a[v]&1)==0){break}K=c[t>>2]|0;if((K-s|0)>=160){break}J=c[u>>2]|0;c[t>>2]=K+4;c[K>>2]=J}}while(0);ah=(z=0,+(+aF(2,W|0,c[r>>2]|0,k|0)));if(z){z=0;break}g[l>>2]=ah;HV(o,y,c[t>>2]|0,k);do{if(R){ai=0}else{J=c[L+12>>2]|0;if((J|0)==(c[L+16>>2]|0)){K=(z=0,au(c[(c[L>>2]|0)+36>>2]|0,L|0)|0);if(!z){aj=K}else{z=0;break L1}}else{aj=c[J>>2]|0}if((aj|0)!=-1){ai=L;break}c[D>>2]=0;ai=0}}while(0);D=(ai|0)==0;do{if(Y){Q=61}else{y=c[X+12>>2]|0;if((y|0)==(c[X+16>>2]|0)){J=(z=0,au(c[(c[X>>2]|0)+36>>2]|0,X|0)|0);if(!z){ak=J}else{z=0;break L1}}else{ak=c[y>>2]|0}if((ak|0)==-1){c[E>>2]=0;Q=61;break}if(!(D^(X|0)==0)){break}al=b|0;c[al>>2]=ai;DK(p);DK(o);i=e;return}}while(0);do{if((Q|0)==61){if(D){break}al=b|0;c[al>>2]=ai;DK(p);DK(o);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;al=b|0;c[al>>2]=ai;DK(p);DK(o);i=e;return}else{z=0}}while(0);e=bS(-1,-1)|0;ae=M;af=e;DK(p);DK(o);bg(af|0)}function FW(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0;b=i;i=i+16|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;c[j>>2]=c[d>>2];c[k>>2]=c[e>>2];FX(a,0,j,k,f,g,h);i=b;return}function FX(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0.0,ai=0,aj=0,ak=0,al=0;e=i;i=i+176|0;m=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[m>>2];m=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[m>>2];m=e+128|0;n=e+136|0;o=e+144|0;p=e+160|0;q=p;r=i;i=i+4|0;i=i+7&-8;s=i;i=i+160|0;t=i;i=i+4|0;i=i+7&-8;u=i;i=i+4|0;i=i+7&-8;v=i;i=i+1|0;i=i+7&-8;w=i;i=i+1|0;i=i+7&-8;x=e|0;F4(o,j,x,m,n);Ld(q|0,0,12)|0;j=p;z=0;aR(82,p|0,10,0);L1:do{if(!z){if((a[q]&1)==0){y=j+1|0;A=y;B=y;C=p+8|0}else{y=p+8|0;A=c[y>>2]|0;B=j+1|0;C=y}c[r>>2]=A;y=s|0;c[t>>2]=y;c[u>>2]=0;a[v]=1;a[w]=69;D=f|0;E=g|0;F=p|0;G=p+4|0;H=c[m>>2]|0;I=c[n>>2]|0;J=A;K=c[D>>2]|0;L7:while(1){do{if((K|0)==0){L=0}else{N=c[K+12>>2]|0;if((N|0)==(c[K+16>>2]|0)){O=(z=0,au(c[(c[K>>2]|0)+36>>2]|0,K|0)|0);if(!z){P=O}else{z=0;Q=31;break L7}}else{P=c[N>>2]|0}if((P|0)!=-1){L=K;break}c[D>>2]=0;L=0}}while(0);R=(L|0)==0;N=c[E>>2]|0;do{if((N|0)==0){Q=18}else{O=c[N+12>>2]|0;if((O|0)==(c[N+16>>2]|0)){S=(z=0,au(c[(c[N>>2]|0)+36>>2]|0,N|0)|0);if(!z){T=S}else{z=0;Q=31;break L7}}else{T=c[O>>2]|0}if((T|0)==-1){c[E>>2]=0;Q=18;break}else{O=(N|0)==0;if(R^O){U=N;V=O;break}else{W=J;X=N;Y=O;break L7}}}}while(0);if((Q|0)==18){Q=0;if(R){W=J;X=0;Y=1;break}else{U=0;V=1}}N=d[q]|0;O=(N&1|0)==0;if(((c[r>>2]|0)-J|0)==((O?N>>>1:c[G>>2]|0)|0)){if(O){Z=N>>>1;_=N>>>1}else{N=c[G>>2]|0;Z=N;_=N}z=0;aR(82,p|0,Z<<1|0,0);if(z){z=0;Q=31;break}if((a[q]&1)==0){$=10}else{$=(c[F>>2]&-2)-1|0}z=0;aR(82,p|0,$|0,0);if(z){z=0;Q=31;break}if((a[q]&1)==0){aa=B}else{aa=c[C>>2]|0}c[r>>2]=aa+_;ab=aa}else{ab=J}N=L+12|0;O=c[N>>2]|0;S=L+16|0;if((O|0)==(c[S>>2]|0)){ac=(z=0,au(c[(c[L>>2]|0)+36>>2]|0,L|0)|0);if(!z){ad=ac}else{z=0;Q=31;break}}else{ad=c[O>>2]|0}if((F5(ad,v,w,ab,r,H,I,o,y,t,u,x)|0)!=0){W=ab;X=U;Y=V;break}O=c[N>>2]|0;if((O|0)==(c[S>>2]|0)){S=c[(c[L>>2]|0)+40>>2]|0;z=0,au(S|0,L|0)|0;if(!z){J=ab;K=L;continue}else{z=0;Q=31;break}}else{c[N>>2]=O+4;J=ab;K=L;continue}}if((Q|0)==31){K=bS(-1,-1)|0;ae=M;af=K;DK(p);DK(o);bg(af|0)}K=d[o]|0;if((K&1|0)==0){ag=K>>>1}else{ag=c[o+4>>2]|0}do{if((ag|0)!=0){if((a[v]&1)==0){break}K=c[t>>2]|0;if((K-s|0)>=160){break}J=c[u>>2]|0;c[t>>2]=K+4;c[K>>2]=J}}while(0);ah=(z=0,+(+aN(4,W|0,c[r>>2]|0,k|0)));if(z){z=0;break}h[l>>3]=ah;HV(o,y,c[t>>2]|0,k);do{if(R){ai=0}else{J=c[L+12>>2]|0;if((J|0)==(c[L+16>>2]|0)){K=(z=0,au(c[(c[L>>2]|0)+36>>2]|0,L|0)|0);if(!z){aj=K}else{z=0;break L1}}else{aj=c[J>>2]|0}if((aj|0)!=-1){ai=L;break}c[D>>2]=0;ai=0}}while(0);D=(ai|0)==0;do{if(Y){Q=61}else{y=c[X+12>>2]|0;if((y|0)==(c[X+16>>2]|0)){J=(z=0,au(c[(c[X>>2]|0)+36>>2]|0,X|0)|0);if(!z){ak=J}else{z=0;break L1}}else{ak=c[y>>2]|0}if((ak|0)==-1){c[E>>2]=0;Q=61;break}if(!(D^(X|0)==0)){break}al=b|0;c[al>>2]=ai;DK(p);DK(o);i=e;return}}while(0);do{if((Q|0)==61){if(D){break}al=b|0;c[al>>2]=ai;DK(p);DK(o);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;al=b|0;c[al>>2]=ai;DK(p);DK(o);i=e;return}else{z=0}}while(0);e=bS(-1,-1)|0;ae=M;af=e;DK(p);DK(o);bg(af|0)}function FY(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0;b=i;i=i+16|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;c[j>>2]=c[d>>2];c[k>>2]=c[e>>2];FZ(a,0,j,k,f,g,h);i=b;return}function FZ(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0.0,ai=0,aj=0,ak=0,al=0;e=i;i=i+176|0;m=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[m>>2];m=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[m>>2];m=e+128|0;n=e+136|0;o=e+144|0;p=e+160|0;q=p;r=i;i=i+4|0;i=i+7&-8;s=i;i=i+160|0;t=i;i=i+4|0;i=i+7&-8;u=i;i=i+4|0;i=i+7&-8;v=i;i=i+1|0;i=i+7&-8;w=i;i=i+1|0;i=i+7&-8;x=e|0;F4(o,j,x,m,n);Ld(q|0,0,12)|0;j=p;z=0;aR(82,p|0,10,0);L1:do{if(!z){if((a[q]&1)==0){y=j+1|0;A=y;B=y;C=p+8|0}else{y=p+8|0;A=c[y>>2]|0;B=j+1|0;C=y}c[r>>2]=A;y=s|0;c[t>>2]=y;c[u>>2]=0;a[v]=1;a[w]=69;D=f|0;E=g|0;F=p|0;G=p+4|0;H=c[m>>2]|0;I=c[n>>2]|0;J=A;K=c[D>>2]|0;L7:while(1){do{if((K|0)==0){L=0}else{N=c[K+12>>2]|0;if((N|0)==(c[K+16>>2]|0)){O=(z=0,au(c[(c[K>>2]|0)+36>>2]|0,K|0)|0);if(!z){P=O}else{z=0;Q=31;break L7}}else{P=c[N>>2]|0}if((P|0)!=-1){L=K;break}c[D>>2]=0;L=0}}while(0);R=(L|0)==0;N=c[E>>2]|0;do{if((N|0)==0){Q=18}else{O=c[N+12>>2]|0;if((O|0)==(c[N+16>>2]|0)){S=(z=0,au(c[(c[N>>2]|0)+36>>2]|0,N|0)|0);if(!z){T=S}else{z=0;Q=31;break L7}}else{T=c[O>>2]|0}if((T|0)==-1){c[E>>2]=0;Q=18;break}else{O=(N|0)==0;if(R^O){U=N;V=O;break}else{W=J;X=N;Y=O;break L7}}}}while(0);if((Q|0)==18){Q=0;if(R){W=J;X=0;Y=1;break}else{U=0;V=1}}N=d[q]|0;O=(N&1|0)==0;if(((c[r>>2]|0)-J|0)==((O?N>>>1:c[G>>2]|0)|0)){if(O){Z=N>>>1;_=N>>>1}else{N=c[G>>2]|0;Z=N;_=N}z=0;aR(82,p|0,Z<<1|0,0);if(z){z=0;Q=31;break}if((a[q]&1)==0){$=10}else{$=(c[F>>2]&-2)-1|0}z=0;aR(82,p|0,$|0,0);if(z){z=0;Q=31;break}if((a[q]&1)==0){aa=B}else{aa=c[C>>2]|0}c[r>>2]=aa+_;ab=aa}else{ab=J}N=L+12|0;O=c[N>>2]|0;S=L+16|0;if((O|0)==(c[S>>2]|0)){ac=(z=0,au(c[(c[L>>2]|0)+36>>2]|0,L|0)|0);if(!z){ad=ac}else{z=0;Q=31;break}}else{ad=c[O>>2]|0}if((F5(ad,v,w,ab,r,H,I,o,y,t,u,x)|0)!=0){W=ab;X=U;Y=V;break}O=c[N>>2]|0;if((O|0)==(c[S>>2]|0)){S=c[(c[L>>2]|0)+40>>2]|0;z=0,au(S|0,L|0)|0;if(!z){J=ab;K=L;continue}else{z=0;Q=31;break}}else{c[N>>2]=O+4;J=ab;K=L;continue}}if((Q|0)==31){K=bS(-1,-1)|0;ae=M;af=K;DK(p);DK(o);bg(af|0)}K=d[o]|0;if((K&1|0)==0){ag=K>>>1}else{ag=c[o+4>>2]|0}do{if((ag|0)!=0){if((a[v]&1)==0){break}K=c[t>>2]|0;if((K-s|0)>=160){break}J=c[u>>2]|0;c[t>>2]=K+4;c[K>>2]=J}}while(0);ah=(z=0,+(+aN(2,W|0,c[r>>2]|0,k|0)));if(z){z=0;break}h[l>>3]=ah;HV(o,y,c[t>>2]|0,k);do{if(R){ai=0}else{J=c[L+12>>2]|0;if((J|0)==(c[L+16>>2]|0)){K=(z=0,au(c[(c[L>>2]|0)+36>>2]|0,L|0)|0);if(!z){aj=K}else{z=0;break L1}}else{aj=c[J>>2]|0}if((aj|0)!=-1){ai=L;break}c[D>>2]=0;ai=0}}while(0);D=(ai|0)==0;do{if(Y){Q=61}else{y=c[X+12>>2]|0;if((y|0)==(c[X+16>>2]|0)){J=(z=0,au(c[(c[X>>2]|0)+36>>2]|0,X|0)|0);if(!z){ak=J}else{z=0;break L1}}else{ak=c[y>>2]|0}if((ak|0)==-1){c[E>>2]=0;Q=61;break}if(!(D^(X|0)==0)){break}al=b|0;c[al>>2]=ai;DK(p);DK(o);i=e;return}}while(0);do{if((Q|0)==61){if(D){break}al=b|0;c[al>>2]=ai;DK(p);DK(o);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;al=b|0;c[al>>2]=ai;DK(p);DK(o);i=e;return}else{z=0}}while(0);e=bS(-1,-1)|0;ae=M;af=e;DK(p);DK(o);bg(af|0)}function F_(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0;e=i;i=i+136|0;l=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[l>>2];l=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[l>>2];l=e|0;m=e+16|0;n=e+120|0;o=i;i=i+4|0;i=i+7&-8;p=i;i=i+12|0;i=i+7&-8;q=i;i=i+4|0;i=i+7&-8;r=i;i=i+160|0;s=i;i=i+4|0;i=i+7&-8;t=i;i=i+4|0;i=i+7&-8;Ld(n|0,0,12)|0;u=p;z=0;as(348,o|0,h|0);if(z){z=0;h=bS(-1,-1)|0;v=M;w=h;DK(n);x=w;y=0;A=x;B=v;bg(A|0)}h=o|0;o=c[h>>2]|0;if((c[10218]|0)==-1){C=4}else{c[l>>2]=40872;c[l+4>>2]=460;c[l+8>>2]=0;z=0;aR(2,40872,l|0,518);if(!z){C=4}else{z=0}}L7:do{if((C|0)==4){l=(c[10219]|0)-1|0;D=c[o+8>>2]|0;do{if((c[o+12>>2]|0)-D>>2>>>0>l>>>0){E=c[D+(l<<2)>>2]|0;if((E|0)==0){break}F=E;G=m|0;H=c[(c[E>>2]|0)+48>>2]|0;z=0,aU(H|0,F|0,31760,31786,G|0)|0;if(z){z=0;break L7}Di(c[h>>2]|0)|0;Ld(u|0,0,12)|0;F=p;z=0;aR(82,p|0,10,0);L13:do{if(!z){if((a[u]&1)==0){H=F+1|0;I=H;J=H;K=p+8|0}else{H=p+8|0;I=c[H>>2]|0;J=F+1|0;K=H}c[q>>2]=I;H=r|0;c[s>>2]=H;c[t>>2]=0;E=f|0;L=g|0;N=p|0;O=p+4|0;P=I;Q=c[E>>2]|0;L19:while(1){do{if((Q|0)==0){R=0}else{S=c[Q+12>>2]|0;if((S|0)==(c[Q+16>>2]|0)){T=(z=0,au(c[(c[Q>>2]|0)+36>>2]|0,Q|0)|0);if(!z){U=T}else{z=0;C=41;break L19}}else{U=c[S>>2]|0}if((U|0)!=-1){R=Q;break}c[E>>2]=0;R=0}}while(0);S=(R|0)==0;T=c[L>>2]|0;do{if((T|0)==0){C=26}else{V=c[T+12>>2]|0;if((V|0)==(c[T+16>>2]|0)){W=(z=0,au(c[(c[T>>2]|0)+36>>2]|0,T|0)|0);if(!z){X=W}else{z=0;C=41;break L19}}else{X=c[V>>2]|0}if((X|0)==-1){c[L>>2]=0;C=26;break}else{if(S^(T|0)==0){break}else{Y=P;break L19}}}}while(0);if((C|0)==26){C=0;if(S){Y=P;break}}T=d[u]|0;V=(T&1|0)==0;if(((c[q>>2]|0)-P|0)==((V?T>>>1:c[O>>2]|0)|0)){if(V){Z=T>>>1;_=T>>>1}else{T=c[O>>2]|0;Z=T;_=T}z=0;aR(82,p|0,Z<<1|0,0);if(z){z=0;C=41;break}if((a[u]&1)==0){$=10}else{$=(c[N>>2]&-2)-1|0}z=0;aR(82,p|0,$|0,0);if(z){z=0;C=41;break}if((a[u]&1)==0){aa=J}else{aa=c[K>>2]|0}c[q>>2]=aa+_;ab=aa}else{ab=P}T=R+12|0;V=c[T>>2]|0;W=R+16|0;if((V|0)==(c[W>>2]|0)){ac=(z=0,au(c[(c[R>>2]|0)+36>>2]|0,R|0)|0);if(!z){ad=ac}else{z=0;C=41;break}}else{ad=c[V>>2]|0}if((F$(ad,16,ab,q,t,0,n,H,s,G)|0)!=0){Y=ab;break}V=c[T>>2]|0;if((V|0)==(c[W>>2]|0)){W=c[(c[R>>2]|0)+40>>2]|0;z=0,au(W|0,R|0)|0;if(!z){P=ab;Q=R;continue}else{z=0;C=41;break}}else{c[T>>2]=V+4;P=ab;Q=R;continue}}if((C|0)==41){Q=bS(-1,-1)|0;ae=M;af=Q;break}a[Y+3|0]=0;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}Q=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9834]=Q;break}else{z=0;Q=bS(-1,-1)|0;ae=M;af=Q;break L13}}}while(0);Q=(z=0,aU(18,Y|0,c[9834]|0,8184,(P=i,i=i+8|0,c[P>>2]=k,P)|0)|0);i=P;if(z){z=0;C=42;break}if((Q|0)!=1){c[j>>2]=4}Q=c[E>>2]|0;do{if((Q|0)==0){ag=0}else{P=c[Q+12>>2]|0;if((P|0)==(c[Q+16>>2]|0)){H=(z=0,au(c[(c[Q>>2]|0)+36>>2]|0,Q|0)|0);if(!z){ah=H}else{z=0;C=42;break L13}}else{ah=c[P>>2]|0}if((ah|0)!=-1){ag=Q;break}c[E>>2]=0;ag=0}}while(0);E=(ag|0)==0;Q=c[L>>2]|0;do{if((Q|0)==0){C=71}else{P=c[Q+12>>2]|0;if((P|0)==(c[Q+16>>2]|0)){H=(z=0,au(c[(c[Q>>2]|0)+36>>2]|0,Q|0)|0);if(!z){ai=H}else{z=0;C=42;break L13}}else{ai=c[P>>2]|0}if((ai|0)==-1){c[L>>2]=0;C=71;break}if(!(E^(Q|0)==0)){break}aj=b|0;c[aj>>2]=ag;DK(p);DK(n);i=e;return}}while(0);do{if((C|0)==71){if(E){break}aj=b|0;c[aj>>2]=ag;DK(p);DK(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;aj=b|0;c[aj>>2]=ag;DK(p);DK(n);i=e;return}else{z=0;C=42}}while(0);if((C|0)==42){G=bS(-1,-1)|0;ae=M;af=G}DK(p);v=ae;w=af;DK(n);x=w;y=0;A=x;B=v;bg(A|0)}}while(0);l=ck(4)|0;Kw(l);z=0;aR(146,l|0,28488,100);if(z){z=0;break}}}while(0);af=bS(-1,-1)|0;ae=M;Di(c[h>>2]|0)|0;v=ae;w=af;DK(n);x=w;y=0;A=x;B=v;bg(A|0)}function F$(b,e,f,g,h,i,j,k,l,m){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0;n=c[g>>2]|0;o=(n|0)==(f|0);do{if(o){p=(c[m+96>>2]|0)==(b|0);if(!p){if((c[m+100>>2]|0)!=(b|0)){break}}c[g>>2]=f+1;a[f]=p?43:45;c[h>>2]=0;q=0;return q|0}}while(0);p=d[j]|0;if((p&1|0)==0){r=p>>>1}else{r=c[j+4>>2]|0}if((r|0)!=0&(b|0)==(i|0)){i=c[l>>2]|0;if((i-k|0)>=160){q=0;return q|0}k=c[h>>2]|0;c[l>>2]=i+4;c[i>>2]=k;c[h>>2]=0;q=0;return q|0}k=m+104|0;i=m;while(1){l=i+4|0;if((c[i>>2]|0)==(b|0)){s=i;break}if((l|0)==(k|0)){s=k;break}else{i=l}}i=s-m|0;m=i>>2;if((i|0)>92){q=-1;return q|0}do{if((e|0)==8|(e|0)==10){if((m|0)<(e|0)){break}else{q=-1}return q|0}else if((e|0)==16){if((i|0)<88){break}if(o){q=-1;return q|0}if((n-f|0)>=3){q=-1;return q|0}if((a[n-1|0]|0)!=48){q=-1;return q|0}c[h>>2]=0;s=a[31760+m|0]|0;k=c[g>>2]|0;c[g>>2]=k+1;a[k]=s;q=0;return q|0}}while(0);f=a[31760+m|0]|0;c[g>>2]=n+1;a[n]=f;c[h>>2]=(c[h>>2]|0)+1;q=0;return q|0}function F0(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;g=i;i=i+40|0;h=g|0;j=g+16|0;k=g+32|0;D3(k,d);d=k|0;k=c[d>>2]|0;if((c[10220]|0)==-1){l=3}else{c[j>>2]=40880;c[j+4>>2]=460;c[j+8>>2]=0;z=0;aR(2,40880,j|0,518);if(!z){l=3}else{z=0}}L3:do{if((l|0)==3){j=(c[10221]|0)-1|0;m=c[k+8>>2]|0;do{if((c[k+12>>2]|0)-m>>2>>>0>j>>>0){n=c[m+(j<<2)>>2]|0;if((n|0)==0){break}o=n;p=c[(c[n>>2]|0)+32>>2]|0;z=0,aU(p|0,o|0,31760,31786,e|0)|0;if(z){z=0;break L3}o=c[d>>2]|0;if((c[10124]|0)!=-1){c[h>>2]=40496;c[h+4>>2]=460;c[h+8>>2]=0;z=0;aR(2,40496,h|0,518);if(z){z=0;break L3}}p=(c[10125]|0)-1|0;n=c[o+8>>2]|0;do{if((c[o+12>>2]|0)-n>>2>>>0>p>>>0){q=c[n+(p<<2)>>2]|0;if((q|0)==0){break}r=q;s=(z=0,au(c[(c[q>>2]|0)+16>>2]|0,r|0)|0);if(z){z=0;break L3}a[f]=s;z=0;as(c[(c[q>>2]|0)+20>>2]|0,b|0,r|0);if(z){z=0;break L3}Di(c[d>>2]|0)|0;i=g;return}}while(0);p=ck(4)|0;Kw(p);z=0;aR(146,p|0,28488,100);if(z){z=0;break L3}}}while(0);j=ck(4)|0;Kw(j);z=0;aR(146,j|0,28488,100);if(z){z=0;break}}}while(0);g=bS(-1,-1)|0;Di(c[d>>2]|0)|0;bg(g|0)}function F1(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;h=i;i=i+40|0;j=h|0;k=h+16|0;l=h+32|0;D3(l,d);d=l|0;l=c[d>>2]|0;if((c[10220]|0)==-1){m=3}else{c[k>>2]=40880;c[k+4>>2]=460;c[k+8>>2]=0;z=0;aR(2,40880,k|0,518);if(!z){m=3}else{z=0}}L3:do{if((m|0)==3){k=(c[10221]|0)-1|0;n=c[l+8>>2]|0;do{if((c[l+12>>2]|0)-n>>2>>>0>k>>>0){o=c[n+(k<<2)>>2]|0;if((o|0)==0){break}p=o;q=c[(c[o>>2]|0)+32>>2]|0;z=0,aU(q|0,p|0,31760,31792,e|0)|0;if(z){z=0;break L3}p=c[d>>2]|0;if((c[10124]|0)!=-1){c[j>>2]=40496;c[j+4>>2]=460;c[j+8>>2]=0;z=0;aR(2,40496,j|0,518);if(z){z=0;break L3}}q=(c[10125]|0)-1|0;o=c[p+8>>2]|0;do{if((c[p+12>>2]|0)-o>>2>>>0>q>>>0){r=c[o+(q<<2)>>2]|0;if((r|0)==0){break}s=r;t=r;u=(z=0,au(c[(c[t>>2]|0)+12>>2]|0,s|0)|0);if(z){z=0;break L3}a[f]=u;u=(z=0,au(c[(c[t>>2]|0)+16>>2]|0,s|0)|0);if(z){z=0;break L3}a[g]=u;z=0;as(c[(c[r>>2]|0)+20>>2]|0,b|0,s|0);if(z){z=0;break L3}Di(c[d>>2]|0)|0;i=h;return}}while(0);q=ck(4)|0;Kw(q);z=0;aR(146,q|0,28488,100);if(z){z=0;break L3}}}while(0);k=ck(4)|0;Kw(k);z=0;aR(146,k|0,28488,100);if(z){z=0;break}}}while(0);h=bS(-1,-1)|0;Di(c[d>>2]|0)|0;bg(h|0)}function F2(b,e,f,g,h,i,j,k,l,m,n,o){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0,s=0,t=0;if(b<<24>>24==i<<24>>24){if((a[e]&1)==0){p=-1;return p|0}a[e]=0;i=c[h>>2]|0;c[h>>2]=i+1;a[i]=46;i=d[k]|0;if((i&1|0)==0){q=i>>>1}else{q=c[k+4>>2]|0}if((q|0)==0){p=0;return p|0}q=c[m>>2]|0;if((q-l|0)>=160){p=0;return p|0}i=c[n>>2]|0;c[m>>2]=q+4;c[q>>2]=i;p=0;return p|0}do{if(b<<24>>24==j<<24>>24){i=d[k]|0;if((i&1|0)==0){r=i>>>1}else{r=c[k+4>>2]|0}if((r|0)==0){break}if((a[e]&1)==0){p=-1;return p|0}i=c[m>>2]|0;if((i-l|0)>=160){p=0;return p|0}q=c[n>>2]|0;c[m>>2]=i+4;c[i>>2]=q;c[n>>2]=0;p=0;return p|0}}while(0);r=o+32|0;j=o;while(1){q=j+1|0;if((a[j]|0)==b<<24>>24){s=j;break}if((q|0)==(r|0)){s=r;break}else{j=q}}j=s-o|0;if((j|0)>31){p=-1;return p|0}o=a[31760+j|0]|0;if((j|0)==22|(j|0)==23){a[f]=80;s=c[h>>2]|0;c[h>>2]=s+1;a[s]=o;p=0;return p|0}else if((j|0)==25|(j|0)==24){s=c[h>>2]|0;do{if((s|0)!=(g|0)){if((a[s-1|0]&95|0)==(a[f]&127|0)){break}else{p=-1}return p|0}}while(0);c[h>>2]=s+1;a[s]=o;p=0;return p|0}else{s=a[f]|0;do{if((o&95|0)==(s<<24>>24|0)){a[f]=s|-128;if((a[e]&1)==0){break}a[e]=0;g=d[k]|0;if((g&1|0)==0){t=g>>>1}else{t=c[k+4>>2]|0}if((t|0)==0){break}g=c[m>>2]|0;if((g-l|0)>=160){break}r=c[n>>2]|0;c[m>>2]=g+4;c[g>>2]=r}}while(0);m=c[h>>2]|0;c[h>>2]=m+1;a[m]=o;if((j|0)>21){p=0;return p|0}c[n>>2]=(c[n>>2]|0)+1;p=0;return p|0}return 0}function F3(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;f=i;i=i+40|0;g=f|0;h=f+16|0;j=f+32|0;D3(j,b);b=j|0;j=c[b>>2]|0;if((c[10218]|0)==-1){k=3}else{c[h>>2]=40872;c[h+4>>2]=460;c[h+8>>2]=0;z=0;aR(2,40872,h|0,518);if(!z){k=3}else{z=0}}L3:do{if((k|0)==3){h=(c[10219]|0)-1|0;l=c[j+8>>2]|0;do{if((c[j+12>>2]|0)-l>>2>>>0>h>>>0){m=c[l+(h<<2)>>2]|0;if((m|0)==0){break}n=m;o=c[(c[m>>2]|0)+48>>2]|0;z=0,aU(o|0,n|0,31760,31786,d|0)|0;if(z){z=0;break L3}n=c[b>>2]|0;if((c[10122]|0)!=-1){c[g>>2]=40488;c[g+4>>2]=460;c[g+8>>2]=0;z=0;aR(2,40488,g|0,518);if(z){z=0;break L3}}o=(c[10123]|0)-1|0;m=c[n+8>>2]|0;do{if((c[n+12>>2]|0)-m>>2>>>0>o>>>0){p=c[m+(o<<2)>>2]|0;if((p|0)==0){break}q=p;r=(z=0,au(c[(c[p>>2]|0)+16>>2]|0,q|0)|0);if(z){z=0;break L3}c[e>>2]=r;z=0;as(c[(c[p>>2]|0)+20>>2]|0,a|0,q|0);if(z){z=0;break L3}Di(c[b>>2]|0)|0;i=f;return}}while(0);o=ck(4)|0;Kw(o);z=0;aR(146,o|0,28488,100);if(z){z=0;break L3}}}while(0);h=ck(4)|0;Kw(h);z=0;aR(146,h|0,28488,100);if(z){z=0;break}}}while(0);f=bS(-1,-1)|0;Di(c[b>>2]|0)|0;bg(f|0)}function F4(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;g=i;i=i+40|0;h=g|0;j=g+16|0;k=g+32|0;D3(k,b);b=k|0;k=c[b>>2]|0;if((c[10218]|0)==-1){l=3}else{c[j>>2]=40872;c[j+4>>2]=460;c[j+8>>2]=0;z=0;aR(2,40872,j|0,518);if(!z){l=3}else{z=0}}L3:do{if((l|0)==3){j=(c[10219]|0)-1|0;m=c[k+8>>2]|0;do{if((c[k+12>>2]|0)-m>>2>>>0>j>>>0){n=c[m+(j<<2)>>2]|0;if((n|0)==0){break}o=n;p=c[(c[n>>2]|0)+48>>2]|0;z=0,aU(p|0,o|0,31760,31792,d|0)|0;if(z){z=0;break L3}o=c[b>>2]|0;if((c[10122]|0)!=-1){c[h>>2]=40488;c[h+4>>2]=460;c[h+8>>2]=0;z=0;aR(2,40488,h|0,518);if(z){z=0;break L3}}p=(c[10123]|0)-1|0;n=c[o+8>>2]|0;do{if((c[o+12>>2]|0)-n>>2>>>0>p>>>0){q=c[n+(p<<2)>>2]|0;if((q|0)==0){break}r=q;s=q;t=(z=0,au(c[(c[s>>2]|0)+12>>2]|0,r|0)|0);if(z){z=0;break L3}c[e>>2]=t;t=(z=0,au(c[(c[s>>2]|0)+16>>2]|0,r|0)|0);if(z){z=0;break L3}c[f>>2]=t;z=0;as(c[(c[q>>2]|0)+20>>2]|0,a|0,r|0);if(z){z=0;break L3}Di(c[b>>2]|0)|0;i=g;return}}while(0);p=ck(4)|0;Kw(p);z=0;aR(146,p|0,28488,100);if(z){z=0;break L3}}}while(0);j=ck(4)|0;Kw(j);z=0;aR(146,j|0,28488,100);if(z){z=0;break}}}while(0);g=bS(-1,-1)|0;Di(c[b>>2]|0)|0;bg(g|0)}function F5(b,e,f,g,h,i,j,k,l,m,n,o){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0,s=0,t=0;if((b|0)==(i|0)){if((a[e]&1)==0){p=-1;return p|0}a[e]=0;i=c[h>>2]|0;c[h>>2]=i+1;a[i]=46;i=d[k]|0;if((i&1|0)==0){q=i>>>1}else{q=c[k+4>>2]|0}if((q|0)==0){p=0;return p|0}q=c[m>>2]|0;if((q-l|0)>=160){p=0;return p|0}i=c[n>>2]|0;c[m>>2]=q+4;c[q>>2]=i;p=0;return p|0}do{if((b|0)==(j|0)){i=d[k]|0;if((i&1|0)==0){r=i>>>1}else{r=c[k+4>>2]|0}if((r|0)==0){break}if((a[e]&1)==0){p=-1;return p|0}i=c[m>>2]|0;if((i-l|0)>=160){p=0;return p|0}q=c[n>>2]|0;c[m>>2]=i+4;c[i>>2]=q;c[n>>2]=0;p=0;return p|0}}while(0);r=o+128|0;j=o;while(1){q=j+4|0;if((c[j>>2]|0)==(b|0)){s=j;break}if((q|0)==(r|0)){s=r;break}else{j=q}}j=s-o|0;o=j>>2;if((j|0)>124){p=-1;return p|0}s=a[31760+o|0]|0;do{if((o|0)==25|(o|0)==24){r=c[h>>2]|0;do{if((r|0)!=(g|0)){if((a[r-1|0]&95|0)==(a[f]&127|0)){break}else{p=-1}return p|0}}while(0);c[h>>2]=r+1;a[r]=s;p=0;return p|0}else if((o|0)==22|(o|0)==23){a[f]=80}else{b=a[f]|0;if((s&95|0)!=(b<<24>>24|0)){break}a[f]=b|-128;if((a[e]&1)==0){break}a[e]=0;b=d[k]|0;if((b&1|0)==0){t=b>>>1}else{t=c[k+4>>2]|0}if((t|0)==0){break}b=c[m>>2]|0;if((b-l|0)>=160){break}q=c[n>>2]|0;c[m>>2]=b+4;c[b>>2]=q}}while(0);m=c[h>>2]|0;c[h>>2]=m+1;a[m]=s;if((j|0)>84){p=0;return p|0}c[n>>2]=(c[n>>2]|0)+1;p=0;return p|0}function F6(a){a=a|0;Dg(a|0);K1(a);return}function F7(a){a=a|0;Dg(a|0);return}function F8(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;j=i;i=i+48|0;k=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[k>>2];k=j|0;l=j+16|0;m=j+24|0;n=j+32|0;if((c[f+4>>2]&1|0)==0){o=c[(c[d>>2]|0)+24>>2]|0;c[l>>2]=c[e>>2];cL[o&127](b,d,l,f,g,h&1);i=j;return}D3(m,f);f=m|0;m=c[f>>2]|0;if((c[10124]|0)==-1){p=5}else{c[k>>2]=40496;c[k+4>>2]=460;c[k+8>>2]=0;z=0;aR(2,40496,k|0,518);if(!z){p=5}else{z=0}}do{if((p|0)==5){k=(c[10125]|0)-1|0;g=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-g>>2>>>0>k>>>0){l=c[g+(k<<2)>>2]|0;if((l|0)==0){break}d=l;Di(c[f>>2]|0)|0;o=c[l>>2]|0;if(h){cA[c[o+24>>2]&1023](n,d)}else{cA[c[o+28>>2]&1023](n,d)}d=n;o=n;l=a[o]|0;if((l&1)==0){q=d+1|0;r=q;s=q;t=n+8|0}else{q=n+8|0;r=c[q>>2]|0;s=d+1|0;t=q}q=e|0;d=n+4|0;u=r;v=l;L20:while(1){if((v&1)==0){w=s}else{w=c[t>>2]|0}l=v&255;if((u|0)==(w+((l&1|0)==0?l>>>1:c[d>>2]|0)|0)){p=28;break}l=a[u]|0;x=c[q>>2]|0;do{if((x|0)!=0){y=x+24|0;A=c[y>>2]|0;if((A|0)!=(c[x+28>>2]|0)){c[y>>2]=A+1;a[A]=l;break}A=(z=0,aM(c[(c[x>>2]|0)+52>>2]|0,x|0,l&255|0)|0);if(z){z=0;p=27;break L20}if((A|0)!=-1){break}c[q>>2]=0}}while(0);u=u+1|0;v=a[o]|0}if((p|0)==27){o=bS(-1,-1)|0;v=M;DK(n);B=v;C=o;D=C;E=0;F=D;G=B;bg(F|0)}else if((p|0)==28){c[b>>2]=c[q>>2];DK(n);i=j;return}}}while(0);k=ck(4)|0;Kw(k);z=0;aR(146,k|0,28488,100);if(z){z=0;break}}}while(0);j=bS(-1,-1)|0;n=M;Di(c[f>>2]|0)|0;B=n;C=j;D=C;E=0;F=D;G=B;bg(F|0)}function F9(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+80|0;j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=d|0;k=d+8|0;l=d+24|0;m=d+48|0;n=d+56|0;o=d+64|0;p=d+72|0;q=j|0;a[q]=a[12896]|0;a[q+1|0]=a[12897]|0;a[q+2|0]=a[12898]|0;a[q+3|0]=a[12899]|0;a[q+4|0]=a[12900]|0;a[q+5|0]=a[12901]|0;r=j+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=j+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else if((v|0)==64){a[u]=111}else{a[u]=100}}while(0);u=k|0;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}v=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9834]=v;break}else{z=0;v=bS(-1,-1)|0;bg(v|0)}}}while(0);v=Ga(u,12,c[9834]|0,q,(q=i,i=i+8|0,c[q>>2]=h,q)|0)|0;i=q;q=k+v|0;h=c[s>>2]&176;do{if((h|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=k+1|0;break}if(!((v|0)>1&s<<24>>24==48)){x=22;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=22;break}w=k+2|0}else if((h|0)==32){w=q}else{x=22}}while(0);if((x|0)==22){w=u}x=l|0;D3(o,f);z=0;aI(80,u|0,w|0,q|0,x|0,m|0,n|0,o|0);if(!z){Di(c[o>>2]|0)|0;c[p>>2]=c[e>>2];fs(b,p,x,c[m>>2]|0,c[n>>2]|0,f,g);i=d;return}else{z=0;d=bS(-1,-1)|0;Di(c[o>>2]|0)|0;bg(d|0)}}function Ga(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0;g=i;i=i+16|0;h=g|0;j=h;c[j>>2]=f;c[j+4>>2]=0;j=b5(d|0)|0;d=b6(a|0,b|0,e|0,h|0)|0;if((j|0)==0){i=g;return d|0}z=0,au(36,j|0)|0;if(!z){i=g;return d|0}else{z=0;d=bS(-1,-1,0)|0;dk(d);return 0}return 0}function Gb(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0;l=i;i=i+48|0;m=l|0;n=l+16|0;o=l+32|0;p=k|0;k=c[p>>2]|0;if((c[10220]|0)!=-1){c[n>>2]=40880;c[n+4>>2]=460;c[n+8>>2]=0;DD(40880,n,518)}n=(c[10221]|0)-1|0;q=c[k+8>>2]|0;if((c[k+12>>2]|0)-q>>2>>>0<=n>>>0){r=ck(4)|0;s=r;Kw(s);bJ(r|0,28488,100)}k=c[q+(n<<2)>>2]|0;if((k|0)==0){r=ck(4)|0;s=r;Kw(s);bJ(r|0,28488,100)}r=k;s=c[p>>2]|0;if((c[10124]|0)!=-1){c[m>>2]=40496;c[m+4>>2]=460;c[m+8>>2]=0;DD(40496,m,518)}m=(c[10125]|0)-1|0;p=c[s+8>>2]|0;if((c[s+12>>2]|0)-p>>2>>>0<=m>>>0){t=ck(4)|0;u=t;Kw(u);bJ(t|0,28488,100)}s=c[p+(m<<2)>>2]|0;if((s|0)==0){t=ck(4)|0;u=t;Kw(u);bJ(t|0,28488,100)}t=s;cA[c[(c[s>>2]|0)+20>>2]&1023](o,t);u=o;m=o;p=d[m]|0;if((p&1|0)==0){v=p>>>1}else{v=c[o+4>>2]|0}L23:do{if((v|0)==0){p=c[(c[k>>2]|0)+32>>2]|0;z=0,aU(p|0,r|0,b|0,f|0,g|0)|0;if(z){z=0;w=18;break}c[j>>2]=g+(f-b)}else{c[j>>2]=g;p=a[b]|0;if((p<<24>>24|0)==45|(p<<24>>24|0)==43){n=(z=0,aM(c[(c[k>>2]|0)+28>>2]|0,r|0,p|0)|0);if(z){z=0;w=18;break}p=c[j>>2]|0;c[j>>2]=p+1;a[p]=n;x=b+1|0}else{x=b}do{if((f-x|0)>1){if((a[x]|0)!=48){y=x;break}n=x+1|0;p=a[n]|0;if(!((p<<24>>24|0)==120|(p<<24>>24|0)==88)){y=x;break}p=k;q=(z=0,aM(c[(c[p>>2]|0)+28>>2]|0,r|0,48)|0);if(z){z=0;w=18;break L23}A=c[j>>2]|0;c[j>>2]=A+1;a[A]=q;q=(z=0,aM(c[(c[p>>2]|0)+28>>2]|0,r|0,a[n]|0)|0);if(z){z=0;w=18;break L23}n=c[j>>2]|0;c[j>>2]=n+1;a[n]=q;y=x+2|0}else{y=x}}while(0);do{if((y|0)!=(f|0)){q=f-1|0;if(y>>>0<q>>>0){B=y;C=q}else{break}do{q=a[B]|0;a[B]=a[C]|0;a[C]=q;B=B+1|0;C=C-1|0;}while(B>>>0<C>>>0)}}while(0);q=(z=0,au(c[(c[s>>2]|0)+16>>2]|0,t|0)|0);if(z){z=0;w=18;break}L44:do{if(y>>>0<f>>>0){n=u+1|0;p=k;A=o+4|0;D=o+8|0;E=0;F=0;G=y;while(1){H=(a[m]&1)==0;do{if((a[(H?n:c[D>>2]|0)+F|0]|0)==0){I=F;J=E}else{if((E|0)!=(a[(H?n:c[D>>2]|0)+F|0]|0)){I=F;J=E;break}K=c[j>>2]|0;c[j>>2]=K+1;a[K]=q;K=d[m]|0;I=(F>>>0<(((K&1|0)==0?K>>>1:c[A>>2]|0)-1|0)>>>0)+F|0;J=0}}while(0);H=(z=0,aM(c[(c[p>>2]|0)+28>>2]|0,r|0,a[G]|0)|0);if(z){z=0;break}K=c[j>>2]|0;c[j>>2]=K+1;a[K]=H;H=G+1|0;if(H>>>0<f>>>0){E=J+1|0;F=I;G=H}else{break L44}}G=bS(-1,-1)|0;L=M;N=G;DK(o);bg(N|0)}}while(0);q=g+(y-b)|0;G=c[j>>2]|0;if((q|0)==(G|0)){break}F=G-1|0;if(q>>>0<F>>>0){O=q;P=F}else{break}do{F=a[O]|0;a[O]=a[P]|0;a[P]=F;O=O+1|0;P=P-1|0;}while(O>>>0<P>>>0)}}while(0);if((w|0)==18){w=bS(-1,-1)|0;L=M;N=w;DK(o);bg(N|0)}if((e|0)==(f|0)){Q=c[j>>2]|0;c[h>>2]=Q;DK(o);i=l;return}else{Q=g+(e-b)|0;c[h>>2]=Q;DK(o);i=l;return}}function Gc(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+112|0;k=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+32|0;n=d+80|0;o=d+88|0;p=d+96|0;q=d+104|0;c[k>>2]=37;c[k+4>>2]=0;r=k;k=r+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=k}else{a[k]=43;u=r+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;a[v+1|0]=108;u=v+2|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=100}}while(0);u=l|0;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}t=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9834]=t;break}else{z=0;t=bS(-1,-1)|0;bg(t|0)}}}while(0);t=Ga(u,22,c[9834]|0,r,(r=i,i=i+16|0,c[r>>2]=h,c[r+8>>2]=j,r)|0)|0;i=r;r=l+t|0;j=c[s>>2]&176;do{if((j|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=l+1|0;break}if(!((t|0)>1&s<<24>>24==48)){x=22;break}s=a[l+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=22;break}w=l+2|0}else if((j|0)==32){w=r}else{x=22}}while(0);if((x|0)==22){w=u}x=m|0;D3(p,f);z=0;aI(80,u|0,w|0,r|0,x|0,n|0,o|0,p|0);if(!z){Di(c[p>>2]|0)|0;c[q>>2]=c[e>>2];fs(b,q,x,c[n>>2]|0,c[o>>2]|0,f,g);i=d;return}else{z=0;d=bS(-1,-1)|0;Di(c[p>>2]|0)|0;bg(d|0)}}function Gd(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+80|0;j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=d|0;k=d+8|0;l=d+24|0;m=d+48|0;n=d+56|0;o=d+64|0;p=d+72|0;q=j|0;a[q]=a[12896]|0;a[q+1|0]=a[12897]|0;a[q+2|0]=a[12898]|0;a[q+3|0]=a[12899]|0;a[q+4|0]=a[12900]|0;a[q+5|0]=a[12901]|0;r=j+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=j+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else if((v|0)==64){a[u]=111}else{a[u]=117}}while(0);u=k|0;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}v=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9834]=v;break}else{z=0;v=bS(-1,-1)|0;bg(v|0)}}}while(0);v=Ga(u,12,c[9834]|0,q,(q=i,i=i+8|0,c[q>>2]=h,q)|0)|0;i=q;q=k+v|0;h=c[s>>2]&176;do{if((h|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=k+1|0;break}if(!((v|0)>1&s<<24>>24==48)){x=22;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=22;break}w=k+2|0}else if((h|0)==32){w=q}else{x=22}}while(0);if((x|0)==22){w=u}x=l|0;D3(o,f);z=0;aI(80,u|0,w|0,q|0,x|0,m|0,n|0,o|0);if(!z){Di(c[o>>2]|0)|0;c[p>>2]=c[e>>2];fs(b,p,x,c[m>>2]|0,c[n>>2]|0,f,g);i=d;return}else{z=0;d=bS(-1,-1)|0;Di(c[o>>2]|0)|0;bg(d|0)}}function Ge(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+112|0;k=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+32|0;n=d+80|0;o=d+88|0;p=d+96|0;q=d+104|0;c[k>>2]=37;c[k+4>>2]=0;r=k;k=r+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=k}else{a[k]=43;u=r+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;a[v+1|0]=108;u=v+2|0;v=t&74;do{if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else if((v|0)==64){a[u]=111}else{a[u]=117}}while(0);u=l|0;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}v=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9834]=v;break}else{z=0;v=bS(-1,-1)|0;bg(v|0)}}}while(0);v=Ga(u,23,c[9834]|0,r,(r=i,i=i+16|0,c[r>>2]=h,c[r+8>>2]=j,r)|0)|0;i=r;r=l+v|0;j=c[s>>2]&176;do{if((j|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=l+1|0;break}if(!((v|0)>1&s<<24>>24==48)){x=22;break}s=a[l+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=22;break}w=l+2|0}else if((j|0)==32){w=r}else{x=22}}while(0);if((x|0)==22){w=u}x=m|0;D3(p,f);z=0;aI(80,u|0,w|0,r|0,x|0,n|0,o|0,p|0);if(!z){Di(c[p>>2]|0)|0;c[q>>2]=c[e>>2];fs(b,q,x,c[n>>2]|0,c[o>>2]|0,f,g);i=d;return}else{z=0;d=bS(-1,-1)|0;Di(c[p>>2]|0)|0;bg(d|0)}}function Gf(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0;d=i;i=i+152|0;k=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+40|0;n=d+48|0;o=d+112|0;p=d+120|0;q=d+128|0;r=d+136|0;s=d+144|0;c[k>>2]=37;c[k+4>>2]=0;t=k;k=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=k}else{a[k]=43;w=t+2|0}if((v&1024|0)==0){x=w}else{a[w]=35;x=w+1|0}w=v&260;k=v>>>14;do{if((w|0)==260){if((k&1|0)==0){a[x]=97;y=0;break}else{a[x]=65;y=0;break}}else{a[x]=46;v=x+2|0;a[x+1|0]=42;if((w|0)==4){if((k&1|0)==0){a[v]=102;y=1;break}else{a[v]=70;y=1;break}}else if((w|0)==256){if((k&1|0)==0){a[v]=101;y=1;break}else{a[v]=69;y=1;break}}else{if((k&1|0)==0){a[v]=103;y=1;break}else{a[v]=71;y=1;break}}}}while(0);k=l|0;c[m>>2]=k;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}l=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9834]=l;break}else{z=0;l=bS(-1,-1)|0;bg(l|0)}}}while(0);l=c[9834]|0;if(y){w=Ga(k,30,l,t,(A=i,i=i+16|0,c[A>>2]=c[f+8>>2],h[A+8>>3]=j,A)|0)|0;i=A;B=w}else{w=Ga(k,30,l,t,(A=i,i=i+8|0,h[A>>3]=j,A)|0)|0;i=A;B=w}L38:do{if((B|0)>29){w=(a[41440]|0)==0;L40:do{if(y){do{if(w){if((bB(41440)|0)==0){break}l=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9834]=l;break}else{z=0;l=bS(-1,-1)|0;C=M;D=l;break L40}}}while(0);l=(z=0,aU(26,m|0,c[9834]|0,t|0,(A=i,i=i+16|0,c[A>>2]=c[f+8>>2],h[A+8>>3]=j,A)|0)|0);i=A;if(!z){E=l;F=44}else{z=0;F=36}}else{do{if(w){if((bB(41440)|0)==0){break}l=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9834]=l;break}else{z=0;l=bS(-1,-1)|0;C=M;D=l;break L40}}}while(0);l=(z=0,aU(26,m|0,c[9834]|0,t|0,(A=i,i=i+16|0,c[A>>2]=c[f+8>>2],h[A+8>>3]=j,A)|0)|0);i=A;if(!z){E=l;F=44}else{z=0;F=36}}}while(0);do{if((F|0)==44){w=c[m>>2]|0;if((w|0)!=0){G=E;H=w;I=w;break L38}z=0;aS(4);if(z){z=0;F=36;break}w=c[m>>2]|0;G=E;H=w;I=w;break L38}}while(0);if((F|0)==36){w=bS(-1,-1)|0;C=M;D=w}J=C;K=D;L=K;N=0;O=L;P=J;bg(O|0)}else{G=B;H=0;I=c[m>>2]|0}}while(0);B=I+G|0;D=c[u>>2]&176;do{if((D|0)==16){u=a[I]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){Q=I+1|0;break}if(!((G|0)>1&u<<24>>24==48)){F=53;break}u=a[I+1|0]|0;if(!((u<<24>>24|0)==120|(u<<24>>24|0)==88)){F=53;break}Q=I+2|0}else if((D|0)==32){Q=B}else{F=53}}while(0);if((F|0)==53){Q=I}do{if((I|0)==(k|0)){R=n|0;S=0;T=k;F=59}else{D=KV(G<<1)|0;if((D|0)!=0){R=D;S=D;T=I;F=59;break}z=0;aS(4);if(z){z=0;U=0;F=58;break}R=0;S=0;T=c[m>>2]|0;F=59}}while(0);do{if((F|0)==59){z=0;as(348,q|0,f|0);if(z){z=0;U=S;F=58;break}z=0;aI(86,T|0,Q|0,B|0,R|0,o|0,p|0,q|0);if(z){z=0;m=bS(-1,-1)|0;I=M;Di(c[q>>2]|0)|0;V=m;W=I;X=S;break}Di(c[q>>2]|0)|0;I=e|0;c[s>>2]=c[I>>2];z=0;aI(56,r|0,s|0,R|0,c[o>>2]|0,c[p>>2]|0,f|0,g|0);if(z){z=0;U=S;F=58;break}m=c[r>>2]|0;c[I>>2]=m;c[b>>2]=m;if((S|0)!=0){KW(S)}if((H|0)==0){i=d;return}KW(H);i=d;return}}while(0);if((F|0)==58){F=bS(-1,-1)|0;V=F;W=M;X=U}if((X|0)!=0){KW(X)}if((H|0)==0){J=W;K=V;L=K;N=0;O=L;P=J;bg(O|0)}KW(H);J=W;K=V;L=K;N=0;O=L;P=J;bg(O|0)}function Gg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f|0;h=g;c[h>>2]=e;c[h+4>>2]=0;h=b5(b|0)|0;b=(z=0,az(30,a|0,d|0,g|0)|0);if(!z){if((h|0)==0){i=f;return b|0}z=0,au(36,h|0)|0;if(!z){i=f;return b|0}else{z=0;b=bS(-1,-1,0)|0;dk(b);return 0}}else{z=0;b=bS(-1,-1)|0;if((h|0)==0){bg(b|0)}z=0,au(36,h|0)|0;if(!z){bg(b|0)}else{z=0;b=bS(-1,-1,0)|0;dk(b);return 0}}return 0}function Gh(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0;l=i;i=i+48|0;m=l|0;n=l+16|0;o=l+32|0;p=k|0;k=c[p>>2]|0;if((c[10220]|0)!=-1){c[n>>2]=40880;c[n+4>>2]=460;c[n+8>>2]=0;DD(40880,n,518)}n=(c[10221]|0)-1|0;q=c[k+8>>2]|0;if((c[k+12>>2]|0)-q>>2>>>0<=n>>>0){r=ck(4)|0;s=r;Kw(s);bJ(r|0,28488,100)}k=c[q+(n<<2)>>2]|0;if((k|0)==0){r=ck(4)|0;s=r;Kw(s);bJ(r|0,28488,100)}r=k;s=c[p>>2]|0;if((c[10124]|0)!=-1){c[m>>2]=40496;c[m+4>>2]=460;c[m+8>>2]=0;DD(40496,m,518)}m=(c[10125]|0)-1|0;p=c[s+8>>2]|0;if((c[s+12>>2]|0)-p>>2>>>0<=m>>>0){t=ck(4)|0;u=t;Kw(u);bJ(t|0,28488,100)}s=c[p+(m<<2)>>2]|0;if((s|0)==0){t=ck(4)|0;u=t;Kw(u);bJ(t|0,28488,100)}t=s;cA[c[(c[s>>2]|0)+20>>2]&1023](o,t);c[j>>2]=g;u=a[b]|0;do{if((u<<24>>24|0)==45|(u<<24>>24|0)==43){m=(z=0,aM(c[(c[k>>2]|0)+28>>2]|0,r|0,u|0)|0);if(z){z=0;break}p=c[j>>2]|0;c[j>>2]=p+1;a[p]=m;v=b+1|0;w=20}else{v=b;w=20}}while(0);L22:do{if((w|0)==20){u=f;L24:do{if((u-v|0)>1){if((a[v]|0)!=48){w=21;break}m=v+1|0;p=a[m]|0;if(!((p<<24>>24|0)==120|(p<<24>>24|0)==88)){w=21;break}p=k;n=(z=0,aM(c[(c[p>>2]|0)+28>>2]|0,r|0,48)|0);if(z){z=0;break L22}q=c[j>>2]|0;c[j>>2]=q+1;a[q]=n;n=v+2|0;q=(z=0,aM(c[(c[p>>2]|0)+28>>2]|0,r|0,a[m]|0)|0);if(z){z=0;break L22}m=c[j>>2]|0;c[j>>2]=m+1;a[m]=q;if(n>>>0<f>>>0){x=n}else{y=n;A=n;break}L30:while(1){q=a[x]|0;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}m=(z=0,az(68,2147483647,9720,0)|0);if(z){z=0;w=32;break L30}c[9834]=m}}while(0);m=(z=0,aM(164,q<<24>>24|0,c[9834]|0)|0);if(z){z=0;w=17;break}p=x+1|0;if((m|0)==0){y=x;A=n;break L24}if(p>>>0<f>>>0){x=p}else{y=p;A=n;break L24}}if((w|0)==17){n=bS(-1,-1)|0;B=M;C=n;DK(o);bg(C|0)}else if((w|0)==32){n=bS(-1,-1)|0;B=M;C=n;DK(o);bg(C|0)}}else{w=21}}while(0);L44:do{if((w|0)==21){if(v>>>0<f>>>0){D=v}else{y=v;A=v;break}L46:while(1){n=a[D]|0;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}p=(z=0,az(68,2147483647,9720,0)|0);if(z){z=0;w=40;break L46}c[9834]=p}}while(0);q=(z=0,aM(68,n<<24>>24|0,c[9834]|0)|0);if(z){z=0;w=16;break}p=D+1|0;if((q|0)==0){y=D;A=v;break L44}if(p>>>0<f>>>0){D=p}else{y=p;A=v;break L44}}if((w|0)==16){p=bS(-1,-1)|0;B=M;C=p;DK(o);bg(C|0)}else if((w|0)==40){p=bS(-1,-1)|0;B=M;C=p;DK(o);bg(C|0)}}}while(0);p=o;q=o;m=d[q]|0;if((m&1|0)==0){E=m>>>1}else{E=c[o+4>>2]|0}do{if((E|0)==0){m=c[j>>2]|0;F=c[(c[k>>2]|0)+32>>2]|0;z=0,aU(F|0,r|0,A|0,y|0,m|0)|0;if(z){z=0;break L22}c[j>>2]=(c[j>>2]|0)+(y-A)}else{do{if((A|0)!=(y|0)){m=y-1|0;if(A>>>0<m>>>0){G=A;H=m}else{break}do{m=a[G]|0;a[G]=a[H]|0;a[H]=m;G=G+1|0;H=H-1|0;}while(G>>>0<H>>>0)}}while(0);n=(z=0,au(c[(c[s>>2]|0)+16>>2]|0,t|0)|0);if(z){z=0;break L22}L75:do{if(A>>>0<y>>>0){m=p+1|0;F=o+4|0;I=o+8|0;J=k;K=0;L=0;N=A;while(1){O=(a[q]&1)==0;do{if((a[(O?m:c[I>>2]|0)+L|0]|0)>0){if((K|0)!=(a[(O?m:c[I>>2]|0)+L|0]|0)){P=L;Q=K;break}R=c[j>>2]|0;c[j>>2]=R+1;a[R]=n;R=d[q]|0;P=(L>>>0<(((R&1|0)==0?R>>>1:c[F>>2]|0)-1|0)>>>0)+L|0;Q=0}else{P=L;Q=K}}while(0);O=(z=0,aM(c[(c[J>>2]|0)+28>>2]|0,r|0,a[N]|0)|0);if(z){z=0;break}R=c[j>>2]|0;c[j>>2]=R+1;a[R]=O;O=N+1|0;if(O>>>0<y>>>0){K=Q+1|0;L=P;N=O}else{break L75}}N=bS(-1,-1)|0;B=M;C=N;DK(o);bg(C|0)}}while(0);n=g+(A-b)|0;N=c[j>>2]|0;if((n|0)==(N|0)){break}L=N-1|0;if(n>>>0<L>>>0){S=n;T=L}else{break}do{L=a[S]|0;a[S]=a[T]|0;a[T]=L;S=S+1|0;T=T-1|0;}while(S>>>0<T>>>0)}}while(0);L91:do{if(y>>>0<f>>>0){q=k;p=y;while(1){L=a[p]|0;if(L<<24>>24==46){w=66;break}n=(z=0,aM(c[(c[q>>2]|0)+28>>2]|0,r|0,L|0)|0);if(z){z=0;w=14;break}L=c[j>>2]|0;c[j>>2]=L+1;a[L]=n;n=p+1|0;if(n>>>0<f>>>0){p=n}else{U=n;break L91}}if((w|0)==14){q=bS(-1,-1)|0;B=M;C=q;DK(o);bg(C|0)}else if((w|0)==66){q=(z=0,au(c[(c[s>>2]|0)+12>>2]|0,t|0)|0);if(z){z=0;break L22}n=c[j>>2]|0;c[j>>2]=n+1;a[n]=q;U=p+1|0;break}}else{U=y}}while(0);q=c[j>>2]|0;n=c[(c[k>>2]|0)+32>>2]|0;z=0,aU(n|0,r|0,U|0,f|0,q|0)|0;if(z){z=0;break}q=(c[j>>2]|0)+(u-U)|0;c[j>>2]=q;if((e|0)==(f|0)){V=q;c[h>>2]=V;DK(o);i=l;return}V=g+(e-b)|0;c[h>>2]=V;DK(o);i=l;return}}while(0);l=bS(-1,-1)|0;B=M;C=l;DK(o);bg(C|0)}function Gi(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0;d=i;i=i+152|0;k=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+40|0;n=d+48|0;o=d+112|0;p=d+120|0;q=d+128|0;r=d+136|0;s=d+144|0;c[k>>2]=37;c[k+4>>2]=0;t=k;k=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=k}else{a[k]=43;w=t+2|0}if((v&1024|0)==0){x=w}else{a[w]=35;x=w+1|0}w=v&260;k=v>>>14;do{if((w|0)==260){a[x]=76;v=x+1|0;if((k&1|0)==0){a[v]=97;y=0;break}else{a[v]=65;y=0;break}}else{a[x]=46;a[x+1|0]=42;a[x+2|0]=76;v=x+3|0;if((w|0)==256){if((k&1|0)==0){a[v]=101;y=1;break}else{a[v]=69;y=1;break}}else if((w|0)==4){if((k&1|0)==0){a[v]=102;y=1;break}else{a[v]=70;y=1;break}}else{if((k&1|0)==0){a[v]=103;y=1;break}else{a[v]=71;y=1;break}}}}while(0);k=l|0;c[m>>2]=k;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}l=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9834]=l;break}else{z=0;l=bS(-1,-1)|0;bg(l|0)}}}while(0);l=c[9834]|0;if(y){w=Ga(k,30,l,t,(A=i,i=i+16|0,c[A>>2]=c[f+8>>2],h[A+8>>3]=j,A)|0)|0;i=A;B=w}else{w=Ga(k,30,l,t,(A=i,i=i+8|0,h[A>>3]=j,A)|0)|0;i=A;B=w}L38:do{if((B|0)>29){w=(a[41440]|0)==0;L40:do{if(y){do{if(w){if((bB(41440)|0)==0){break}l=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9834]=l;break}else{z=0;l=bS(-1,-1)|0;C=M;D=l;break L40}}}while(0);l=(z=0,aU(26,m|0,c[9834]|0,t|0,(A=i,i=i+16|0,c[A>>2]=c[f+8>>2],h[A+8>>3]=j,A)|0)|0);i=A;if(!z){E=l;F=44}else{z=0;F=36}}else{do{if(w){if((bB(41440)|0)==0){break}l=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9834]=l;break}else{z=0;l=bS(-1,-1)|0;C=M;D=l;break L40}}}while(0);l=(z=0,aU(26,m|0,c[9834]|0,t|0,(A=i,i=i+8|0,h[A>>3]=j,A)|0)|0);i=A;if(!z){E=l;F=44}else{z=0;F=36}}}while(0);do{if((F|0)==44){w=c[m>>2]|0;if((w|0)!=0){G=E;H=w;I=w;break L38}z=0;aS(4);if(z){z=0;F=36;break}w=c[m>>2]|0;G=E;H=w;I=w;break L38}}while(0);if((F|0)==36){w=bS(-1,-1)|0;C=M;D=w}J=C;K=D;L=K;N=0;O=L;P=J;bg(O|0)}else{G=B;H=0;I=c[m>>2]|0}}while(0);B=I+G|0;D=c[u>>2]&176;do{if((D|0)==32){Q=B}else if((D|0)==16){u=a[I]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){Q=I+1|0;break}if(!((G|0)>1&u<<24>>24==48)){F=53;break}u=a[I+1|0]|0;if(!((u<<24>>24|0)==120|(u<<24>>24|0)==88)){F=53;break}Q=I+2|0}else{F=53}}while(0);if((F|0)==53){Q=I}do{if((I|0)==(k|0)){R=n|0;S=0;T=k;F=59}else{D=KV(G<<1)|0;if((D|0)!=0){R=D;S=D;T=I;F=59;break}z=0;aS(4);if(z){z=0;U=0;F=58;break}R=0;S=0;T=c[m>>2]|0;F=59}}while(0);do{if((F|0)==59){z=0;as(348,q|0,f|0);if(z){z=0;U=S;F=58;break}z=0;aI(86,T|0,Q|0,B|0,R|0,o|0,p|0,q|0);if(z){z=0;m=bS(-1,-1)|0;I=M;Di(c[q>>2]|0)|0;V=m;W=I;X=S;break}Di(c[q>>2]|0)|0;I=e|0;c[s>>2]=c[I>>2];z=0;aI(56,r|0,s|0,R|0,c[o>>2]|0,c[p>>2]|0,f|0,g|0);if(z){z=0;U=S;F=58;break}m=c[r>>2]|0;c[I>>2]=m;c[b>>2]=m;if((S|0)!=0){KW(S)}if((H|0)==0){i=d;return}KW(H);i=d;return}}while(0);if((F|0)==58){F=bS(-1,-1)|0;V=F;W=M;X=U}if((X|0)!=0){KW(X)}if((H|0)==0){J=W;K=V;L=K;N=0;O=L;P=J;bg(O|0)}KW(H);J=W;K=V;L=K;N=0;O=L;P=J;bg(O|0)}function Gj(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0;d=i;i=i+104|0;j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=d|0;k=d+24|0;l=d+48|0;m=d+88|0;n=d+96|0;o=d+16|0;a[o]=a[12904]|0;a[o+1|0]=a[12905]|0;a[o+2|0]=a[12906]|0;a[o+3|0]=a[12907]|0;a[o+4|0]=a[12908]|0;a[o+5|0]=a[12909]|0;p=k|0;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}q=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9834]=q;break}else{z=0;q=bS(-1,-1)|0;bg(q|0)}}}while(0);q=Ga(p,20,c[9834]|0,o,(o=i,i=i+8|0,c[o>>2]=h,o)|0)|0;i=o;o=k+q|0;h=c[f+4>>2]&176;do{if((h|0)==16){r=a[p]|0;if((r<<24>>24|0)==45|(r<<24>>24|0)==43){s=k+1|0;break}if(!((q|0)>1&r<<24>>24==48)){t=12;break}r=a[k+1|0]|0;if(!((r<<24>>24|0)==120|(r<<24>>24|0)==88)){t=12;break}s=k+2|0}else if((h|0)==32){s=o}else{t=12}}while(0);if((t|0)==12){s=p}D3(m,f);t=m|0;m=c[t>>2]|0;do{if((c[10220]|0)!=-1){c[j>>2]=40880;c[j+4>>2]=460;c[j+8>>2]=0;z=0;aR(2,40880,j|0,518);if(!z){break}else{z=0}u=bS(-1,-1)|0;v=M;w=c[t>>2]|0;x=w|0;y=Di(x)|0;bg(u|0)}}while(0);j=(c[10221]|0)-1|0;h=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-h>>2>>>0>j>>>0){r=c[h+(j<<2)>>2]|0;if((r|0)==0){break}Di(c[t>>2]|0)|0;A=l|0;c0[c[(c[r>>2]|0)+32>>2]&63](r,p,o,A)|0;r=l+q|0;if((s|0)==(o|0)){B=r;C=e|0;D=c[C>>2]|0;E=n|0;c[E>>2]=D;fs(b,n,A,B,r,f,g);i=d;return}B=l+(s-k)|0;C=e|0;D=c[C>>2]|0;E=n|0;c[E>>2]=D;fs(b,n,A,B,r,f,g);i=d;return}}while(0);d=ck(4)|0;Kw(d);z=0;aR(146,d|0,28488,100);if(z){z=0;u=bS(-1,-1)|0;v=M;w=c[t>>2]|0;x=w|0;y=Di(x)|0;bg(u|0)}}function Gk(a){a=a|0;Dg(a|0);K1(a);return}function Gl(a){a=a|0;Dg(a|0);return}function Gm(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;j=i;i=i+48|0;k=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[k>>2];k=j|0;l=j+16|0;m=j+24|0;n=j+32|0;if((c[f+4>>2]&1|0)==0){o=c[(c[d>>2]|0)+24>>2]|0;c[l>>2]=c[e>>2];cL[o&127](b,d,l,f,g,h&1);i=j;return}D3(m,f);f=m|0;m=c[f>>2]|0;if((c[10122]|0)==-1){p=5}else{c[k>>2]=40488;c[k+4>>2]=460;c[k+8>>2]=0;z=0;aR(2,40488,k|0,518);if(!z){p=5}else{z=0}}do{if((p|0)==5){k=(c[10123]|0)-1|0;g=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-g>>2>>>0>k>>>0){l=c[g+(k<<2)>>2]|0;if((l|0)==0){break}d=l;Di(c[f>>2]|0)|0;o=c[l>>2]|0;if(h){cA[c[o+24>>2]&1023](n,d)}else{cA[c[o+28>>2]&1023](n,d)}d=n;o=a[d]|0;if((o&1)==0){l=n+4|0;q=l;r=l;s=n+8|0}else{l=n+8|0;q=c[l>>2]|0;r=n+4|0;s=l}l=e|0;t=q;u=o;L20:while(1){if((u&1)==0){v=r}else{v=c[s>>2]|0}o=u&255;if((o&1|0)==0){w=o>>>1}else{w=c[r>>2]|0}if((t|0)==(v+(w<<2)|0)){p=31;break}o=c[t>>2]|0;x=c[l>>2]|0;do{if((x|0)!=0){y=x+24|0;A=c[y>>2]|0;if((A|0)==(c[x+28>>2]|0)){B=(z=0,aM(c[(c[x>>2]|0)+52>>2]|0,x|0,o|0)|0);if(!z){C=B}else{z=0;p=30;break L20}}else{c[y>>2]=A+4;c[A>>2]=o;C=o}if((C|0)!=-1){break}c[l>>2]=0}}while(0);t=t+4|0;u=a[d]|0}if((p|0)==31){c[b>>2]=c[l>>2];DW(n);i=j;return}else if((p|0)==30){d=bS(-1,-1)|0;u=M;DW(n);D=u;E=d;F=E;G=0;H=F;I=D;bg(H|0)}}}while(0);k=ck(4)|0;Kw(k);z=0;aR(146,k|0,28488,100);if(z){z=0;break}}}while(0);n=bS(-1,-1)|0;p=M;Di(c[f>>2]|0)|0;D=p;E=n;F=E;G=0;H=F;I=D;bg(H|0)}function Gn(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+144|0;j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=d|0;k=d+8|0;l=d+24|0;m=d+112|0;n=d+120|0;o=d+128|0;p=d+136|0;q=j|0;a[q]=a[12896]|0;a[q+1|0]=a[12897]|0;a[q+2|0]=a[12898]|0;a[q+3|0]=a[12899]|0;a[q+4|0]=a[12900]|0;a[q+5|0]=a[12901]|0;r=j+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=j+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else if((v|0)==64){a[u]=111}else{a[u]=100}}while(0);u=k|0;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}v=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9834]=v;break}else{z=0;v=bS(-1,-1)|0;bg(v|0)}}}while(0);v=Ga(u,12,c[9834]|0,q,(q=i,i=i+8|0,c[q>>2]=h,q)|0)|0;i=q;q=k+v|0;h=c[s>>2]&176;do{if((h|0)==32){w=q}else if((h|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=k+1|0;break}if(!((v|0)>1&s<<24>>24==48)){x=22;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=22;break}w=k+2|0}else{x=22}}while(0);if((x|0)==22){w=u}x=l|0;D3(o,f);z=0;aI(48,u|0,w|0,q|0,x|0,m|0,n|0,o|0);if(!z){Di(c[o>>2]|0)|0;c[p>>2]=c[e>>2];Gp(b,p,x,c[m>>2]|0,c[n>>2]|0,f,g);i=d;return}else{z=0;d=bS(-1,-1)|0;Di(c[o>>2]|0)|0;bg(d|0)}}function Go(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0;l=i;i=i+48|0;m=l|0;n=l+16|0;o=l+32|0;p=k|0;k=c[p>>2]|0;if((c[10218]|0)!=-1){c[n>>2]=40872;c[n+4>>2]=460;c[n+8>>2]=0;DD(40872,n,518)}n=(c[10219]|0)-1|0;q=c[k+8>>2]|0;if((c[k+12>>2]|0)-q>>2>>>0<=n>>>0){r=ck(4)|0;s=r;Kw(s);bJ(r|0,28488,100)}k=c[q+(n<<2)>>2]|0;if((k|0)==0){r=ck(4)|0;s=r;Kw(s);bJ(r|0,28488,100)}r=k;s=c[p>>2]|0;if((c[10122]|0)!=-1){c[m>>2]=40488;c[m+4>>2]=460;c[m+8>>2]=0;DD(40488,m,518)}m=(c[10123]|0)-1|0;p=c[s+8>>2]|0;if((c[s+12>>2]|0)-p>>2>>>0<=m>>>0){t=ck(4)|0;u=t;Kw(u);bJ(t|0,28488,100)}s=c[p+(m<<2)>>2]|0;if((s|0)==0){t=ck(4)|0;u=t;Kw(u);bJ(t|0,28488,100)}t=s;cA[c[(c[s>>2]|0)+20>>2]&1023](o,t);u=o;m=o;p=d[m]|0;if((p&1|0)==0){v=p>>>1}else{v=c[o+4>>2]|0}L23:do{if((v|0)==0){p=c[(c[k>>2]|0)+48>>2]|0;z=0,aU(p|0,r|0,b|0,f|0,g|0)|0;if(z){z=0;w=18;break}c[j>>2]=g+(f-b<<2)}else{c[j>>2]=g;p=a[b]|0;if((p<<24>>24|0)==45|(p<<24>>24|0)==43){n=(z=0,aM(c[(c[k>>2]|0)+44>>2]|0,r|0,p|0)|0);if(z){z=0;w=18;break}p=c[j>>2]|0;c[j>>2]=p+4;c[p>>2]=n;x=b+1|0}else{x=b}do{if((f-x|0)>1){if((a[x]|0)!=48){y=x;break}n=x+1|0;p=a[n]|0;if(!((p<<24>>24|0)==120|(p<<24>>24|0)==88)){y=x;break}p=k;q=(z=0,aM(c[(c[p>>2]|0)+44>>2]|0,r|0,48)|0);if(z){z=0;w=18;break L23}A=c[j>>2]|0;c[j>>2]=A+4;c[A>>2]=q;q=(z=0,aM(c[(c[p>>2]|0)+44>>2]|0,r|0,a[n]|0)|0);if(z){z=0;w=18;break L23}n=c[j>>2]|0;c[j>>2]=n+4;c[n>>2]=q;y=x+2|0}else{y=x}}while(0);do{if((y|0)!=(f|0)){q=f-1|0;if(y>>>0<q>>>0){B=y;C=q}else{break}do{q=a[B]|0;a[B]=a[C]|0;a[C]=q;B=B+1|0;C=C-1|0;}while(B>>>0<C>>>0)}}while(0);q=(z=0,au(c[(c[s>>2]|0)+16>>2]|0,t|0)|0);if(z){z=0;w=18;break}L44:do{if(y>>>0<f>>>0){n=u+1|0;p=k;A=o+4|0;D=o+8|0;E=0;F=0;G=y;while(1){H=(a[m]&1)==0;do{if((a[(H?n:c[D>>2]|0)+F|0]|0)==0){I=F;J=E}else{if((E|0)!=(a[(H?n:c[D>>2]|0)+F|0]|0)){I=F;J=E;break}K=c[j>>2]|0;c[j>>2]=K+4;c[K>>2]=q;K=d[m]|0;I=(F>>>0<(((K&1|0)==0?K>>>1:c[A>>2]|0)-1|0)>>>0)+F|0;J=0}}while(0);H=(z=0,aM(c[(c[p>>2]|0)+44>>2]|0,r|0,a[G]|0)|0);if(z){z=0;break}K=c[j>>2]|0;c[j>>2]=K+4;c[K>>2]=H;H=G+1|0;if(H>>>0<f>>>0){E=J+1|0;F=I;G=H}else{break L44}}G=bS(-1,-1)|0;L=M;N=G;DK(o);bg(N|0)}}while(0);q=g+(y-b<<2)|0;G=c[j>>2]|0;if((q|0)==(G|0)){break}F=G-4|0;if(q>>>0<F>>>0){O=q;P=F}else{break}do{F=c[O>>2]|0;c[O>>2]=c[P>>2];c[P>>2]=F;O=O+4|0;P=P-4|0;}while(O>>>0<P>>>0)}}while(0);if((w|0)==18){w=bS(-1,-1)|0;L=M;N=w;DK(o);bg(N|0)}if((e|0)==(f|0)){Q=c[j>>2]|0;c[h>>2]=Q;DK(o);i=l;return}else{Q=g+(e-b<<2)|0;c[h>>2]=Q;DK(o);i=l;return}}function Gp(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;k=i;i=i+16|0;l=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[l>>2];l=k|0;m=d|0;d=c[m>>2]|0;if((d|0)==0){c[b>>2]=0;i=k;return}n=g;g=e;o=n-g>>2;p=h+12|0;h=c[p>>2]|0;q=(h|0)>(o|0)?h-o|0:0;o=f;h=o-g|0;g=h>>2;do{if((h|0)>0){if((cH[c[(c[d>>2]|0)+48>>2]&127](d,e,g)|0)==(g|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);do{if((q|0)>0){DV(l,q,j);if((a[l]&1)==0){r=l+4|0}else{r=c[l+8>>2]|0}g=(z=0,az(c[(c[d>>2]|0)+48>>2]|0,d|0,r|0,q|0)|0);if(z){z=0;e=bS(-1,-1)|0;DW(l);bg(e|0)}if((g|0)==(q|0)){DW(l);break}c[m>>2]=0;c[b>>2]=0;DW(l);i=k;return}}while(0);l=n-o|0;o=l>>2;do{if((l|0)>0){if((cH[c[(c[d>>2]|0)+48>>2]&127](d,f,o)|0)==(o|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);c[p>>2]=0;c[b>>2]=d;i=k;return}function Gq(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+232|0;k=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+32|0;n=d+200|0;o=d+208|0;p=d+216|0;q=d+224|0;c[k>>2]=37;c[k+4>>2]=0;r=k;k=r+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=k}else{a[k]=43;u=r+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;a[v+1|0]=108;u=v+2|0;v=t&74;do{if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else if((v|0)==64){a[u]=111}else{a[u]=100}}while(0);u=l|0;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}v=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9834]=v;break}else{z=0;v=bS(-1,-1)|0;bg(v|0)}}}while(0);v=Ga(u,22,c[9834]|0,r,(r=i,i=i+16|0,c[r>>2]=h,c[r+8>>2]=j,r)|0)|0;i=r;r=l+v|0;j=c[s>>2]&176;do{if((j|0)==32){w=r}else if((j|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=l+1|0;break}if(!((v|0)>1&s<<24>>24==48)){x=22;break}s=a[l+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=22;break}w=l+2|0}else{x=22}}while(0);if((x|0)==22){w=u}x=m|0;D3(p,f);z=0;aI(48,u|0,w|0,r|0,x|0,n|0,o|0,p|0);if(!z){Di(c[p>>2]|0)|0;c[q>>2]=c[e>>2];Gp(b,q,x,c[n>>2]|0,c[o>>2]|0,f,g);i=d;return}else{z=0;d=bS(-1,-1)|0;Di(c[p>>2]|0)|0;bg(d|0)}}function Gr(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+144|0;j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=d|0;k=d+8|0;l=d+24|0;m=d+112|0;n=d+120|0;o=d+128|0;p=d+136|0;q=j|0;a[q]=a[12896]|0;a[q+1|0]=a[12897]|0;a[q+2|0]=a[12898]|0;a[q+3|0]=a[12899]|0;a[q+4|0]=a[12900]|0;a[q+5|0]=a[12901]|0;r=j+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=j+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=117}}while(0);u=k|0;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}t=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9834]=t;break}else{z=0;t=bS(-1,-1)|0;bg(t|0)}}}while(0);t=Ga(u,12,c[9834]|0,q,(q=i,i=i+8|0,c[q>>2]=h,q)|0)|0;i=q;q=k+t|0;h=c[s>>2]&176;do{if((h|0)==32){w=q}else if((h|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=k+1|0;break}if(!((t|0)>1&s<<24>>24==48)){x=22;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=22;break}w=k+2|0}else{x=22}}while(0);if((x|0)==22){w=u}x=l|0;D3(o,f);z=0;aI(48,u|0,w|0,q|0,x|0,m|0,n|0,o|0);if(!z){Di(c[o>>2]|0)|0;c[p>>2]=c[e>>2];Gp(b,p,x,c[m>>2]|0,c[n>>2]|0,f,g);i=d;return}else{z=0;d=bS(-1,-1)|0;Di(c[o>>2]|0)|0;bg(d|0)}}function Gs(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+240|0;k=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+32|0;n=d+208|0;o=d+216|0;p=d+224|0;q=d+232|0;c[k>>2]=37;c[k+4>>2]=0;r=k;k=r+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=k}else{a[k]=43;u=r+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;a[v+1|0]=108;u=v+2|0;v=t&74;do{if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else if((v|0)==64){a[u]=111}else{a[u]=117}}while(0);u=l|0;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}v=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9834]=v;break}else{z=0;v=bS(-1,-1)|0;bg(v|0)}}}while(0);v=Ga(u,23,c[9834]|0,r,(r=i,i=i+16|0,c[r>>2]=h,c[r+8>>2]=j,r)|0)|0;i=r;r=l+v|0;j=c[s>>2]&176;do{if((j|0)==32){w=r}else if((j|0)==16){s=a[u]|0;if((s<<24>>24|0)==45|(s<<24>>24|0)==43){w=l+1|0;break}if(!((v|0)>1&s<<24>>24==48)){x=22;break}s=a[l+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){x=22;break}w=l+2|0}else{x=22}}while(0);if((x|0)==22){w=u}x=m|0;D3(p,f);z=0;aI(48,u|0,w|0,r|0,x|0,n|0,o|0,p|0);if(!z){Di(c[p>>2]|0)|0;c[q>>2]=c[e>>2];Gp(b,q,x,c[n>>2]|0,c[o>>2]|0,f,g);i=d;return}else{z=0;d=bS(-1,-1)|0;Di(c[p>>2]|0)|0;bg(d|0)}}function Gt(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0;d=i;i=i+320|0;k=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+40|0;n=d+48|0;o=d+280|0;p=d+288|0;q=d+296|0;r=d+304|0;s=d+312|0;c[k>>2]=37;c[k+4>>2]=0;t=k;k=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=k}else{a[k]=43;w=t+2|0}if((v&1024|0)==0){x=w}else{a[w]=35;x=w+1|0}w=v&260;k=v>>>14;do{if((w|0)==260){if((k&1|0)==0){a[x]=97;y=0;break}else{a[x]=65;y=0;break}}else{a[x]=46;v=x+2|0;a[x+1|0]=42;if((w|0)==4){if((k&1|0)==0){a[v]=102;y=1;break}else{a[v]=70;y=1;break}}else if((w|0)==256){if((k&1|0)==0){a[v]=101;y=1;break}else{a[v]=69;y=1;break}}else{if((k&1|0)==0){a[v]=103;y=1;break}else{a[v]=71;y=1;break}}}}while(0);k=l|0;c[m>>2]=k;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}l=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9834]=l;break}else{z=0;l=bS(-1,-1)|0;bg(l|0)}}}while(0);l=c[9834]|0;if(y){w=Ga(k,30,l,t,(A=i,i=i+16|0,c[A>>2]=c[f+8>>2],h[A+8>>3]=j,A)|0)|0;i=A;B=w}else{w=Ga(k,30,l,t,(A=i,i=i+8|0,h[A>>3]=j,A)|0)|0;i=A;B=w}L38:do{if((B|0)>29){w=(a[41440]|0)==0;L41:do{if(y){do{if(w){if((bB(41440)|0)==0){break}l=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9834]=l;break}else{z=0;l=bS(-1,-1)|0;C=M;D=l;break L41}}}while(0);l=(z=0,aU(26,m|0,c[9834]|0,t|0,(A=i,i=i+16|0,c[A>>2]=c[f+8>>2],h[A+8>>3]=j,A)|0)|0);i=A;if(!z){E=l;F=44}else{z=0;F=36}}else{do{if(w){if((bB(41440)|0)==0){break}l=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9834]=l;break}else{z=0;l=bS(-1,-1)|0;C=M;D=l;break L41}}}while(0);l=(z=0,aU(26,m|0,c[9834]|0,t|0,(A=i,i=i+16|0,c[A>>2]=c[f+8>>2],h[A+8>>3]=j,A)|0)|0);i=A;if(!z){E=l;F=44}else{z=0;F=36}}}while(0);do{if((F|0)==44){w=c[m>>2]|0;if((w|0)!=0){G=E;H=w;I=w;break L38}z=0;aS(4);if(z){z=0;F=36;break}w=c[m>>2]|0;G=E;H=w;I=w;break L38}}while(0);if((F|0)==36){w=bS(-1,-1)|0;C=M;D=w}J=C;K=D;L=K;N=0;O=L;P=J;bg(O|0)}else{G=B;H=0;I=c[m>>2]|0}}while(0);B=I+G|0;D=c[u>>2]&176;do{if((D|0)==16){u=a[I]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){Q=I+1|0;break}if(!((G|0)>1&u<<24>>24==48)){F=53;break}u=a[I+1|0]|0;if(!((u<<24>>24|0)==120|(u<<24>>24|0)==88)){F=53;break}Q=I+2|0}else if((D|0)==32){Q=B}else{F=53}}while(0);if((F|0)==53){Q=I}do{if((I|0)==(k|0)){R=n|0;S=0;T=k;F=59}else{D=KV(G<<3)|0;u=D;if((D|0)!=0){R=u;S=u;T=I;F=59;break}z=0;aS(4);if(z){z=0;U=0;F=58;break}R=u;S=u;T=c[m>>2]|0;F=59}}while(0);do{if((F|0)==59){z=0;as(348,q|0,f|0);if(z){z=0;U=S;F=58;break}z=0;aI(70,T|0,Q|0,B|0,R|0,o|0,p|0,q|0);if(z){z=0;m=bS(-1,-1)|0;I=M;Di(c[q>>2]|0)|0;V=m;W=I;X=S;break}Di(c[q>>2]|0)|0;I=e|0;c[s>>2]=c[I>>2];z=0;aI(52,r|0,s|0,R|0,c[o>>2]|0,c[p>>2]|0,f|0,g|0);if(z){z=0;U=S;F=58;break}m=c[r>>2]|0;c[I>>2]=m;c[b>>2]=m;if((S|0)!=0){KW(S)}if((H|0)==0){i=d;return}KW(H);i=d;return}}while(0);if((F|0)==58){F=bS(-1,-1)|0;V=F;W=M;X=U}if((X|0)!=0){KW(X)}if((H|0)==0){J=W;K=V;L=K;N=0;O=L;P=J;bg(O|0)}KW(H);J=W;K=V;L=K;N=0;O=L;P=J;bg(O|0)}function Gu(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0;l=i;i=i+48|0;m=l|0;n=l+16|0;o=l+32|0;p=k|0;k=c[p>>2]|0;if((c[10218]|0)!=-1){c[n>>2]=40872;c[n+4>>2]=460;c[n+8>>2]=0;DD(40872,n,518)}n=(c[10219]|0)-1|0;q=c[k+8>>2]|0;if((c[k+12>>2]|0)-q>>2>>>0<=n>>>0){r=ck(4)|0;s=r;Kw(s);bJ(r|0,28488,100)}k=c[q+(n<<2)>>2]|0;if((k|0)==0){r=ck(4)|0;s=r;Kw(s);bJ(r|0,28488,100)}r=k;s=c[p>>2]|0;if((c[10122]|0)!=-1){c[m>>2]=40488;c[m+4>>2]=460;c[m+8>>2]=0;DD(40488,m,518)}m=(c[10123]|0)-1|0;p=c[s+8>>2]|0;if((c[s+12>>2]|0)-p>>2>>>0<=m>>>0){t=ck(4)|0;u=t;Kw(u);bJ(t|0,28488,100)}s=c[p+(m<<2)>>2]|0;if((s|0)==0){t=ck(4)|0;u=t;Kw(u);bJ(t|0,28488,100)}t=s;cA[c[(c[s>>2]|0)+20>>2]&1023](o,t);c[j>>2]=g;u=a[b]|0;do{if((u<<24>>24|0)==45|(u<<24>>24|0)==43){m=(z=0,aM(c[(c[k>>2]|0)+44>>2]|0,r|0,u|0)|0);if(z){z=0;break}p=c[j>>2]|0;c[j>>2]=p+4;c[p>>2]=m;v=b+1|0;w=20}else{v=b;w=20}}while(0);L22:do{if((w|0)==20){u=f;L24:do{if((u-v|0)>1){if((a[v]|0)!=48){w=21;break}m=v+1|0;p=a[m]|0;if(!((p<<24>>24|0)==120|(p<<24>>24|0)==88)){w=21;break}p=k;n=(z=0,aM(c[(c[p>>2]|0)+44>>2]|0,r|0,48)|0);if(z){z=0;break L22}q=c[j>>2]|0;c[j>>2]=q+4;c[q>>2]=n;n=v+2|0;q=(z=0,aM(c[(c[p>>2]|0)+44>>2]|0,r|0,a[m]|0)|0);if(z){z=0;break L22}m=c[j>>2]|0;c[j>>2]=m+4;c[m>>2]=q;if(n>>>0<f>>>0){x=n}else{y=n;A=n;break}L30:while(1){q=a[x]|0;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}m=(z=0,az(68,2147483647,9720,0)|0);if(z){z=0;w=32;break L30}c[9834]=m}}while(0);m=(z=0,aM(164,q<<24>>24|0,c[9834]|0)|0);if(z){z=0;w=17;break}p=x+1|0;if((m|0)==0){y=x;A=n;break L24}if(p>>>0<f>>>0){x=p}else{y=p;A=n;break L24}}if((w|0)==17){n=bS(-1,-1)|0;B=M;C=n;DK(o);bg(C|0)}else if((w|0)==32){n=bS(-1,-1)|0;B=M;C=n;DK(o);bg(C|0)}}else{w=21}}while(0);L44:do{if((w|0)==21){if(v>>>0<f>>>0){D=v}else{y=v;A=v;break}L46:while(1){n=a[D]|0;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}p=(z=0,az(68,2147483647,9720,0)|0);if(z){z=0;w=40;break L46}c[9834]=p}}while(0);q=(z=0,aM(68,n<<24>>24|0,c[9834]|0)|0);if(z){z=0;w=16;break}p=D+1|0;if((q|0)==0){y=D;A=v;break L44}if(p>>>0<f>>>0){D=p}else{y=p;A=v;break L44}}if((w|0)==40){p=bS(-1,-1)|0;B=M;C=p;DK(o);bg(C|0)}else if((w|0)==16){p=bS(-1,-1)|0;B=M;C=p;DK(o);bg(C|0)}}}while(0);p=o;q=o;m=d[q]|0;if((m&1|0)==0){E=m>>>1}else{E=c[o+4>>2]|0}do{if((E|0)==0){m=c[j>>2]|0;F=c[(c[k>>2]|0)+48>>2]|0;z=0,aU(F|0,r|0,A|0,y|0,m|0)|0;if(z){z=0;break L22}c[j>>2]=(c[j>>2]|0)+(y-A<<2)}else{do{if((A|0)!=(y|0)){m=y-1|0;if(A>>>0<m>>>0){G=A;H=m}else{break}do{m=a[G]|0;a[G]=a[H]|0;a[H]=m;G=G+1|0;H=H-1|0;}while(G>>>0<H>>>0)}}while(0);n=(z=0,au(c[(c[s>>2]|0)+16>>2]|0,t|0)|0);if(z){z=0;break L22}L75:do{if(A>>>0<y>>>0){m=p+1|0;F=o+4|0;I=o+8|0;J=k;K=0;L=0;N=A;while(1){O=(a[q]&1)==0;do{if((a[(O?m:c[I>>2]|0)+L|0]|0)>0){if((K|0)!=(a[(O?m:c[I>>2]|0)+L|0]|0)){P=L;Q=K;break}R=c[j>>2]|0;c[j>>2]=R+4;c[R>>2]=n;R=d[q]|0;P=(L>>>0<(((R&1|0)==0?R>>>1:c[F>>2]|0)-1|0)>>>0)+L|0;Q=0}else{P=L;Q=K}}while(0);O=(z=0,aM(c[(c[J>>2]|0)+44>>2]|0,r|0,a[N]|0)|0);if(z){z=0;break}R=c[j>>2]|0;c[j>>2]=R+4;c[R>>2]=O;O=N+1|0;if(O>>>0<y>>>0){K=Q+1|0;L=P;N=O}else{break L75}}N=bS(-1,-1)|0;B=M;C=N;DK(o);bg(C|0)}}while(0);n=g+(A-b<<2)|0;N=c[j>>2]|0;if((n|0)==(N|0)){break}L=N-4|0;if(n>>>0<L>>>0){S=n;T=L}else{break}do{L=c[S>>2]|0;c[S>>2]=c[T>>2];c[T>>2]=L;S=S+4|0;T=T-4|0;}while(S>>>0<T>>>0)}}while(0);L91:do{if(y>>>0<f>>>0){q=k;p=y;while(1){L=a[p]|0;if(L<<24>>24==46){w=66;break}n=(z=0,aM(c[(c[q>>2]|0)+44>>2]|0,r|0,L|0)|0);if(z){z=0;w=14;break}L=c[j>>2]|0;c[j>>2]=L+4;c[L>>2]=n;n=p+1|0;if(n>>>0<f>>>0){p=n}else{U=n;break L91}}if((w|0)==66){q=(z=0,au(c[(c[s>>2]|0)+12>>2]|0,t|0)|0);if(z){z=0;break L22}n=c[j>>2]|0;c[j>>2]=n+4;c[n>>2]=q;U=p+1|0;break}else if((w|0)==14){q=bS(-1,-1)|0;B=M;C=q;DK(o);bg(C|0)}}else{U=y}}while(0);q=c[j>>2]|0;n=c[(c[k>>2]|0)+48>>2]|0;z=0,aU(n|0,r|0,U|0,f|0,q|0)|0;if(z){z=0;break}q=(c[j>>2]|0)+(u-U<<2)|0;c[j>>2]=q;if((e|0)==(f|0)){V=q;c[h>>2]=V;DK(o);i=l;return}V=g+(e-b<<2)|0;c[h>>2]=V;DK(o);i=l;return}}while(0);l=bS(-1,-1)|0;B=M;C=l;DK(o);bg(C|0)}function Gv(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0;d=i;i=i+320|0;k=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[k>>2];k=d|0;l=d+8|0;m=d+40|0;n=d+48|0;o=d+280|0;p=d+288|0;q=d+296|0;r=d+304|0;s=d+312|0;c[k>>2]=37;c[k+4>>2]=0;t=k;k=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=k}else{a[k]=43;w=t+2|0}if((v&1024|0)==0){x=w}else{a[w]=35;x=w+1|0}w=v&260;k=v>>>14;do{if((w|0)==260){a[x]=76;v=x+1|0;if((k&1|0)==0){a[v]=97;y=0;break}else{a[v]=65;y=0;break}}else{a[x]=46;a[x+1|0]=42;a[x+2|0]=76;v=x+3|0;if((w|0)==4){if((k&1|0)==0){a[v]=102;y=1;break}else{a[v]=70;y=1;break}}else if((w|0)==256){if((k&1|0)==0){a[v]=101;y=1;break}else{a[v]=69;y=1;break}}else{if((k&1|0)==0){a[v]=103;y=1;break}else{a[v]=71;y=1;break}}}}while(0);k=l|0;c[m>>2]=k;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}l=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9834]=l;break}else{z=0;l=bS(-1,-1)|0;bg(l|0)}}}while(0);l=c[9834]|0;if(y){w=Ga(k,30,l,t,(A=i,i=i+16|0,c[A>>2]=c[f+8>>2],h[A+8>>3]=j,A)|0)|0;i=A;B=w}else{w=Ga(k,30,l,t,(A=i,i=i+8|0,h[A>>3]=j,A)|0)|0;i=A;B=w}L38:do{if((B|0)>29){w=(a[41440]|0)==0;L41:do{if(y){do{if(w){if((bB(41440)|0)==0){break}l=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9834]=l;break}else{z=0;l=bS(-1,-1)|0;C=M;D=l;break L41}}}while(0);l=(z=0,aU(26,m|0,c[9834]|0,t|0,(A=i,i=i+16|0,c[A>>2]=c[f+8>>2],h[A+8>>3]=j,A)|0)|0);i=A;if(!z){E=l;F=44}else{z=0;F=36}}else{do{if(w){if((bB(41440)|0)==0){break}l=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9834]=l;break}else{z=0;l=bS(-1,-1)|0;C=M;D=l;break L41}}}while(0);l=(z=0,aU(26,m|0,c[9834]|0,t|0,(A=i,i=i+8|0,h[A>>3]=j,A)|0)|0);i=A;if(!z){E=l;F=44}else{z=0;F=36}}}while(0);do{if((F|0)==44){w=c[m>>2]|0;if((w|0)!=0){G=E;H=w;I=w;break L38}z=0;aS(4);if(z){z=0;F=36;break}w=c[m>>2]|0;G=E;H=w;I=w;break L38}}while(0);if((F|0)==36){w=bS(-1,-1)|0;C=M;D=w}J=C;K=D;L=K;N=0;O=L;P=J;bg(O|0)}else{G=B;H=0;I=c[m>>2]|0}}while(0);B=I+G|0;D=c[u>>2]&176;do{if((D|0)==16){u=a[I]|0;if((u<<24>>24|0)==45|(u<<24>>24|0)==43){Q=I+1|0;break}if(!((G|0)>1&u<<24>>24==48)){F=53;break}u=a[I+1|0]|0;if(!((u<<24>>24|0)==120|(u<<24>>24|0)==88)){F=53;break}Q=I+2|0}else if((D|0)==32){Q=B}else{F=53}}while(0);if((F|0)==53){Q=I}do{if((I|0)==(k|0)){R=n|0;S=0;T=k;F=59}else{D=KV(G<<3)|0;u=D;if((D|0)!=0){R=u;S=u;T=I;F=59;break}z=0;aS(4);if(z){z=0;U=0;F=58;break}R=u;S=u;T=c[m>>2]|0;F=59}}while(0);do{if((F|0)==59){z=0;as(348,q|0,f|0);if(z){z=0;U=S;F=58;break}z=0;aI(70,T|0,Q|0,B|0,R|0,o|0,p|0,q|0);if(z){z=0;m=bS(-1,-1)|0;I=M;Di(c[q>>2]|0)|0;V=m;W=I;X=S;break}Di(c[q>>2]|0)|0;I=e|0;c[s>>2]=c[I>>2];z=0;aI(52,r|0,s|0,R|0,c[o>>2]|0,c[p>>2]|0,f|0,g|0);if(z){z=0;U=S;F=58;break}m=c[r>>2]|0;c[I>>2]=m;c[b>>2]=m;if((S|0)!=0){KW(S)}if((H|0)==0){i=d;return}KW(H);i=d;return}}while(0);if((F|0)==58){F=bS(-1,-1)|0;V=F;W=M;X=U}if((X|0)!=0){KW(X)}if((H|0)==0){J=W;K=V;L=K;N=0;O=L;P=J;bg(O|0)}KW(H);J=W;K=V;L=K;N=0;O=L;P=J;bg(O|0)}function Gw(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0;d=i;i=i+216|0;j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=d|0;k=d+24|0;l=d+48|0;m=d+200|0;n=d+208|0;o=d+16|0;a[o]=a[12904]|0;a[o+1|0]=a[12905]|0;a[o+2|0]=a[12906]|0;a[o+3|0]=a[12907]|0;a[o+4|0]=a[12908]|0;a[o+5|0]=a[12909]|0;p=k|0;do{if((a[41440]|0)==0){if((bB(41440)|0)==0){break}q=(z=0,az(68,2147483647,9720,0)|0);if(!z){c[9834]=q;break}else{z=0;q=bS(-1,-1)|0;bg(q|0)}}}while(0);q=Ga(p,20,c[9834]|0,o,(o=i,i=i+8|0,c[o>>2]=h,o)|0)|0;i=o;o=k+q|0;h=c[f+4>>2]&176;do{if((h|0)==16){r=a[p]|0;if((r<<24>>24|0)==45|(r<<24>>24|0)==43){s=k+1|0;break}if(!((q|0)>1&r<<24>>24==48)){t=12;break}r=a[k+1|0]|0;if(!((r<<24>>24|0)==120|(r<<24>>24|0)==88)){t=12;break}s=k+2|0}else if((h|0)==32){s=o}else{t=12}}while(0);if((t|0)==12){s=p}D3(m,f);t=m|0;m=c[t>>2]|0;do{if((c[10218]|0)!=-1){c[j>>2]=40872;c[j+4>>2]=460;c[j+8>>2]=0;z=0;aR(2,40872,j|0,518);if(!z){break}else{z=0}u=bS(-1,-1)|0;v=M;w=c[t>>2]|0;x=w|0;y=Di(x)|0;bg(u|0)}}while(0);j=(c[10219]|0)-1|0;h=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-h>>2>>>0>j>>>0){r=c[h+(j<<2)>>2]|0;if((r|0)==0){break}Di(c[t>>2]|0)|0;A=l|0;c0[c[(c[r>>2]|0)+48>>2]&63](r,p,o,A)|0;r=l+(q<<2)|0;if((s|0)==(o|0)){B=r;C=e|0;D=c[C>>2]|0;E=n|0;c[E>>2]=D;Gp(b,n,A,B,r,f,g);i=d;return}B=l+(s-k<<2)|0;C=e|0;D=c[C>>2]|0;E=n|0;c[E>>2]=D;Gp(b,n,A,B,r,f,g);i=d;return}}while(0);d=ck(4)|0;Kw(d);z=0;aR(146,d|0,28488,100);if(z){z=0;u=bS(-1,-1)|0;v=M;w=c[t>>2]|0;x=w|0;y=Di(x)|0;bg(u|0)}}function Gx(d,e,f,g,h,j,k,l,m){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0;n=i;i=i+48|0;o=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[o>>2];o=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[o>>2];o=n|0;p=n+16|0;q=n+24|0;r=n+32|0;s=n+40|0;D3(p,h);t=p|0;p=c[t>>2]|0;do{if((c[10220]|0)!=-1){c[o>>2]=40880;c[o+4>>2]=460;c[o+8>>2]=0;z=0;aR(2,40880,o|0,518);if(!z){break}else{z=0}u=bS(-1,-1)|0;v=M;w=c[t>>2]|0;x=w|0;y=Di(x)|0;bg(u|0)}}while(0);o=(c[10221]|0)-1|0;A=c[p+8>>2]|0;do{if((c[p+12>>2]|0)-A>>2>>>0>o>>>0){B=c[A+(o<<2)>>2]|0;if((B|0)==0){break}C=B;Di(c[t>>2]|0)|0;c[j>>2]=0;D=f|0;L8:do{if((l|0)==(m|0)){E=67}else{F=g|0;G=B;H=B+8|0;I=B;J=e;K=r|0;L=s|0;N=q|0;O=l;P=0;L10:while(1){Q=P;while(1){if((Q|0)!=0){E=67;break L8}R=c[D>>2]|0;do{if((R|0)==0){S=0}else{if((c[R+12>>2]|0)!=(c[R+16>>2]|0)){S=R;break}if((cC[c[(c[R>>2]|0)+36>>2]&511](R)|0)!=-1){S=R;break}c[D>>2]=0;S=0}}while(0);R=(S|0)==0;T=c[F>>2]|0;L20:do{if((T|0)==0){E=20}else{do{if((c[T+12>>2]|0)==(c[T+16>>2]|0)){if((cC[c[(c[T>>2]|0)+36>>2]&511](T)|0)!=-1){break}c[F>>2]=0;E=20;break L20}}while(0);if(R){U=T}else{E=21;break L10}}}while(0);if((E|0)==20){E=0;if(R){E=21;break L10}else{U=0}}if((cH[c[(c[G>>2]|0)+36>>2]&127](C,a[O]|0,0)|0)<<24>>24==37){E=24;break}T=a[O]|0;if(T<<24>>24>-1){V=c[H>>2]|0;if((b[V+(T<<24>>24<<1)>>1]&8192)!=0){W=O;E=35;break}}X=S+12|0;T=c[X>>2]|0;Y=S+16|0;if((T|0)==(c[Y>>2]|0)){Z=(cC[c[(c[S>>2]|0)+36>>2]&511](S)|0)&255}else{Z=a[T]|0}T=cU[c[(c[I>>2]|0)+12>>2]&1023](C,Z)|0;if(T<<24>>24==(cU[c[(c[I>>2]|0)+12>>2]&1023](C,a[O]|0)|0)<<24>>24){E=62;break}c[j>>2]=4;Q=4}L38:do{if((E|0)==62){E=0;Q=c[X>>2]|0;if((Q|0)==(c[Y>>2]|0)){cC[c[(c[S>>2]|0)+40>>2]&511](S)|0}else{c[X>>2]=Q+1}_=O+1|0}else if((E|0)==35){while(1){E=0;Q=W+1|0;if((Q|0)==(m|0)){$=m;break}T=a[Q]|0;if(T<<24>>24<=-1){$=Q;break}if((b[V+(T<<24>>24<<1)>>1]&8192)==0){$=Q;break}else{W=Q;E=35}}R=S;Q=U;while(1){do{if((R|0)==0){aa=0}else{if((c[R+12>>2]|0)!=(c[R+16>>2]|0)){aa=R;break}if((cC[c[(c[R>>2]|0)+36>>2]&511](R)|0)!=-1){aa=R;break}c[D>>2]=0;aa=0}}while(0);T=(aa|0)==0;do{if((Q|0)==0){E=48}else{if((c[Q+12>>2]|0)!=(c[Q+16>>2]|0)){if(T){ab=Q;break}else{_=$;break L38}}if((cC[c[(c[Q>>2]|0)+36>>2]&511](Q)|0)==-1){c[F>>2]=0;E=48;break}else{if(T^(Q|0)==0){ab=Q;break}else{_=$;break L38}}}}while(0);if((E|0)==48){E=0;if(T){_=$;break L38}else{ab=0}}ac=aa+12|0;ad=c[ac>>2]|0;ae=aa+16|0;if((ad|0)==(c[ae>>2]|0)){af=(cC[c[(c[aa>>2]|0)+36>>2]&511](aa)|0)&255}else{af=a[ad]|0}if(af<<24>>24<=-1){_=$;break L38}if((b[(c[H>>2]|0)+(af<<24>>24<<1)>>1]&8192)==0){_=$;break L38}ad=c[ac>>2]|0;if((ad|0)==(c[ae>>2]|0)){cC[c[(c[aa>>2]|0)+40>>2]&511](aa)|0;R=aa;Q=ab;continue}else{c[ac>>2]=ad+1;R=aa;Q=ab;continue}}}else if((E|0)==24){E=0;Q=O+1|0;if((Q|0)==(m|0)){E=25;break L10}R=cH[c[(c[G>>2]|0)+36>>2]&127](C,a[Q]|0,0)|0;if((R<<24>>24|0)==69|(R<<24>>24|0)==48){ad=O+2|0;if((ad|0)==(m|0)){E=28;break L10}ag=R;ah=cH[c[(c[G>>2]|0)+36>>2]&127](C,a[ad]|0,0)|0;ai=ad}else{ag=0;ah=R;ai=Q}Q=c[(c[J>>2]|0)+36>>2]|0;c[K>>2]=S;c[L>>2]=U;cS[Q&7](q,e,r,s,h,j,k,ah,ag);c[D>>2]=c[N>>2];_=ai+1|0}}while(0);if((_|0)==(m|0)){E=67;break L8}O=_;P=c[j>>2]|0}if((E|0)==28){c[j>>2]=4;aj=S;break}else if((E|0)==21){c[j>>2]=4;aj=S;break}else if((E|0)==25){c[j>>2]=4;aj=S;break}}}while(0);if((E|0)==67){aj=c[D>>2]|0}C=f|0;do{if((aj|0)!=0){if((c[aj+12>>2]|0)!=(c[aj+16>>2]|0)){break}if((cC[c[(c[aj>>2]|0)+36>>2]&511](aj)|0)!=-1){break}c[C>>2]=0}}while(0);D=c[C>>2]|0;B=(D|0)==0;P=g|0;O=c[P>>2]|0;L96:do{if((O|0)==0){E=77}else{do{if((c[O+12>>2]|0)==(c[O+16>>2]|0)){if((cC[c[(c[O>>2]|0)+36>>2]&511](O)|0)!=-1){break}c[P>>2]=0;E=77;break L96}}while(0);if(!B){break}ak=d|0;c[ak>>2]=D;i=n;return}}while(0);do{if((E|0)==77){if(B){break}ak=d|0;c[ak>>2]=D;i=n;return}}while(0);c[j>>2]=c[j>>2]|2;ak=d|0;c[ak>>2]=D;i=n;return}}while(0);n=ck(4)|0;Kw(n);z=0;aR(146,n|0,28488,100);if(z){z=0;u=bS(-1,-1)|0;v=M;w=c[t>>2]|0;x=w|0;y=Di(x)|0;bg(u|0)}}function Gy(a){a=a|0;Dg(a|0);K1(a);return}function Gz(a){a=a|0;Dg(a|0);return}function GA(a){a=a|0;return 2}function GB(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;j=i;i=i+16|0;k=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;c[k>>2]=c[d>>2];c[l>>2]=c[e>>2];Gx(a,b,k,l,f,g,h,12888,12896);i=j;return}function GC(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;k=i;i=i+16|0;l=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[l>>2];l=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[l>>2];l=k|0;m=k+8|0;n=d+8|0;o=cC[c[(c[n>>2]|0)+20>>2]&511](n)|0;c[l>>2]=c[e>>2];c[m>>2]=c[f>>2];f=o;e=a[o]|0;if((e&1)==0){p=f+1|0;q=f+1|0}else{f=c[o+8>>2]|0;p=f;q=f}f=e&255;if((f&1|0)==0){r=f>>>1}else{r=c[o+4>>2]|0}Gx(b,d,l,m,g,h,j,q,p+r|0);i=k;return}function GD(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0;j=i;i=i+32|0;k=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;m=j+24|0;D3(m,f);f=m|0;m=c[f>>2]|0;do{if((c[10220]|0)!=-1){c[l>>2]=40880;c[l+4>>2]=460;c[l+8>>2]=0;z=0;aR(2,40880,l|0,518);if(!z){break}else{z=0}n=bS(-1,-1)|0;o=M;p=c[f>>2]|0;q=p|0;r=Di(q)|0;bg(n|0)}}while(0);l=(c[10221]|0)-1|0;s=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-s>>2>>>0>l>>>0){t=c[s+(l<<2)>>2]|0;if((t|0)==0){break}Di(c[f>>2]|0)|0;u=c[e>>2]|0;v=b+8|0;w=cC[c[c[v>>2]>>2]&511](v)|0;c[k>>2]=u;u=(Fi(d,k,w,w+168|0,t,g,0)|0)-w|0;if((u|0)>=168){x=4;y=0;A=d|0;B=c[A>>2]|0;C=a|0;c[C>>2]=B;i=j;return}c[h+24>>2]=((u|0)/12|0|0)%7|0;x=4;y=0;A=d|0;B=c[A>>2]|0;C=a|0;c[C>>2]=B;i=j;return}}while(0);j=ck(4)|0;Kw(j);z=0;aR(146,j|0,28488,100);if(z){z=0;n=bS(-1,-1)|0;o=M;p=c[f>>2]|0;q=p|0;r=Di(q)|0;bg(n|0)}}function GE(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0;j=i;i=i+32|0;k=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[k>>2];k=j|0;l=j+8|0;m=j+24|0;D3(m,f);f=m|0;m=c[f>>2]|0;do{if((c[10220]|0)!=-1){c[l>>2]=40880;c[l+4>>2]=460;c[l+8>>2]=0;z=0;aR(2,40880,l|0,518);if(!z){break}else{z=0}n=bS(-1,-1)|0;o=M;p=c[f>>2]|0;q=p|0;r=Di(q)|0;bg(n|0)}}while(0);l=(c[10221]|0)-1|0;s=c[m+8>>2]|0;do{if((c[m+12>>2]|0)-s>>2>>>0>l>>>0){t=c[s+(l<<2)>>2]|0;if((t|0)==0){break}Di(c[f>>2]|0)|0;u=c[e>>2]|0;v=b+8|0;w=cC[c[(c[v>>2]|0)+4>>2]&511](v)|0;c[k>>2]=u;u=(Fi(d,k,w,w+288|0,t,g,0)|0)-w|0;if((u|0)>=288){x=4;y=0;A=d|0;B=c[A>>2]|0;C=a|0;c[C>>2]=B;i=j;return}c[h+16>>2]=((u|0)/12|0|0)%12|0;x=4;y=0;A=d|0;B=c[A>>2]|0;C=a|0;c[C>>2]=B;i=j;return}}while(0);j=ck(4)|0;Kw(j);z=0;aR(146,j|0,28488,100);if(z){z=0;n=bS(-1,-1)|0;o=M;p=c[f>>2]|0;q=p|0;r=Di(q)|0;bg(n|0)}}function GF(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0;b=i;i=i+32|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;k=b+8|0;l=b+24|0;D3(l,f);f=l|0;l=c[f>>2]|0;do{if((c[10220]|0)!=-1){c[k>>2]=40880;c[k+4>>2]=460;c[k+8>>2]=0;z=0;aR(2,40880,k|0,518);if(!z){break}else{z=0}m=bS(-1,-1)|0;n=M;o=c[f>>2]|0;p=o|0;q=Di(p)|0;bg(m|0)}}while(0);k=(c[10221]|0)-1|0;r=c[l+8>>2]|0;do{if((c[l+12>>2]|0)-r>>2>>>0>k>>>0){s=c[r+(k<<2)>>2]|0;if((s|0)==0){break}Di(c[f>>2]|0)|0;c[j>>2]=c[e>>2];t=GK(d,j,g,s,4)|0;if((c[g>>2]&4|0)!=0){u=4;v=0;w=d|0;x=c[w>>2]|0;y=a|0;c[y>>2]=x;i=b;return}if((t|0)<69){A=t+2e3|0}else{A=(t-69|0)>>>0<31>>>0?t+1900|0:t}c[h+20>>2]=A-1900;u=4;v=0;w=d|0;x=c[w>>2]|0;y=a|0;c[y>>2]=x;i=b;return}}while(0);b=ck(4)|0;Kw(b);z=0;aR(146,b|0,28488,100);if(z){z=0;m=bS(-1,-1)|0;n=M;o=c[f>>2]|0;p=o|0;q=Di(p)|0;bg(m|0)}}function GG(b,d,e,f,g,h,j,k,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0;l=i;i=i+328|0;m=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[m>>2];m=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[m>>2];m=l|0;n=l+8|0;o=l+16|0;p=l+24|0;q=l+32|0;r=l+40|0;s=l+48|0;t=l+56|0;u=l+64|0;v=l+72|0;w=l+80|0;x=l+88|0;y=l+96|0;A=l+112|0;B=l+120|0;C=l+128|0;D=l+136|0;E=l+144|0;F=l+152|0;G=l+160|0;H=l+168|0;I=l+176|0;J=l+184|0;K=l+192|0;L=l+200|0;N=l+208|0;O=l+216|0;P=l+224|0;Q=l+232|0;R=l+240|0;S=l+248|0;T=l+256|0;U=l+264|0;V=l+272|0;W=l+280|0;X=l+288|0;Y=l+296|0;Z=l+304|0;_=l+312|0;$=l+320|0;c[h>>2]=0;D3(A,g);aa=A|0;A=c[aa>>2]|0;do{if((c[10220]|0)!=-1){c[y>>2]=40880;c[y+4>>2]=460;c[y+8>>2]=0;z=0;aR(2,40880,y|0,518);if(!z){break}else{z=0}ab=bS(-1,-1)|0;ac=M;ad=c[aa>>2]|0;ae=ad|0;af=Di(ae)|0;bg(ab|0)}}while(0);y=(c[10221]|0)-1|0;ag=c[A+8>>2]|0;do{if((c[A+12>>2]|0)-ag>>2>>>0>y>>>0){ah=c[ag+(y<<2)>>2]|0;if((ah|0)==0){break}ai=ah;Di(c[aa>>2]|0)|0;L8:do{switch(k<<24>>24|0){case 72:{c[u>>2]=c[f>>2];ah=GK(e,u,h,ai,2)|0;aj=c[h>>2]|0;if((aj&4|0)==0&(ah|0)<24){c[j+8>>2]=ah;break L8}else{c[h>>2]=aj|4;break L8}break};case 73:{aj=j+8|0;c[t>>2]=c[f>>2];ah=GK(e,t,h,ai,2)|0;ak=c[h>>2]|0;do{if((ak&4|0)==0){if((ah-1|0)>>>0>=12>>>0){break}c[aj>>2]=ah;break L8}}while(0);c[h>>2]=ak|4;break};case 106:{c[s>>2]=c[f>>2];ah=GK(e,s,h,ai,3)|0;aj=c[h>>2]|0;if((aj&4|0)==0&(ah|0)<366){c[j+28>>2]=ah;break L8}else{c[h>>2]=aj|4;break L8}break};case 109:{c[r>>2]=c[f>>2];aj=GK(e,r,h,ai,2)|0;ah=c[h>>2]|0;if((ah&4|0)==0&(aj|0)<13){c[j+16>>2]=aj-1;break L8}else{c[h>>2]=ah|4;break L8}break};case 77:{c[q>>2]=c[f>>2];ah=GK(e,q,h,ai,2)|0;aj=c[h>>2]|0;if((aj&4|0)==0&(ah|0)<60){c[j+4>>2]=ah;break L8}else{c[h>>2]=aj|4;break L8}break};case 110:case 116:{c[K>>2]=c[f>>2];GH(0,e,K,h,ai);break};case 112:{c[L>>2]=c[f>>2];GI(d,j+8|0,e,L,h,ai);break};case 114:{aj=e|0;c[O>>2]=c[aj>>2];c[P>>2]=c[f>>2];Gx(N,d,O,P,g,h,j,12856,12867);c[aj>>2]=c[N>>2];break};case 82:{aj=e|0;c[R>>2]=c[aj>>2];c[S>>2]=c[f>>2];Gx(Q,d,R,S,g,h,j,12848,12853);c[aj>>2]=c[Q>>2];break};case 83:{c[p>>2]=c[f>>2];aj=GK(e,p,h,ai,2)|0;ah=c[h>>2]|0;if((ah&4|0)==0&(aj|0)<61){c[j>>2]=aj;break L8}else{c[h>>2]=ah|4;break L8}break};case 84:{ah=e|0;c[U>>2]=c[ah>>2];c[V>>2]=c[f>>2];Gx(T,d,U,V,g,h,j,12840,12848);c[ah>>2]=c[T>>2];break};case 119:{c[o>>2]=c[f>>2];ah=GK(e,o,h,ai,1)|0;aj=c[h>>2]|0;if((aj&4|0)==0&(ah|0)<7){c[j+24>>2]=ah;break L8}else{c[h>>2]=aj|4;break L8}break};case 100:case 101:{aj=j+12|0;c[v>>2]=c[f>>2];ah=GK(e,v,h,ai,2)|0;al=c[h>>2]|0;do{if((al&4|0)==0){if((ah-1|0)>>>0>=31>>>0){break}c[aj>>2]=ah;break L8}}while(0);c[h>>2]=al|4;break};case 99:{ah=d+8|0;aj=cC[c[(c[ah>>2]|0)+12>>2]&511](ah)|0;ah=e|0;c[C>>2]=c[ah>>2];c[D>>2]=c[f>>2];ak=aj;am=a[aj]|0;if((am&1)==0){an=ak+1|0;ao=ak+1|0}else{ak=c[aj+8>>2]|0;an=ak;ao=ak}ak=am&255;if((ak&1|0)==0){ap=ak>>>1}else{ap=c[aj+4>>2]|0}Gx(B,d,C,D,g,h,j,ao,an+ap|0);c[ah>>2]=c[B>>2];break};case 97:case 65:{ah=c[f>>2]|0;aj=d+8|0;ak=cC[c[c[aj>>2]>>2]&511](aj)|0;c[x>>2]=ah;ah=(Fi(e,x,ak,ak+168|0,ai,h,0)|0)-ak|0;if((ah|0)>=168){break L8}c[j+24>>2]=((ah|0)/12|0|0)%7|0;break};case 98:case 66:case 104:{ah=c[f>>2]|0;ak=d+8|0;aj=cC[c[(c[ak>>2]|0)+4>>2]&511](ak)|0;c[w>>2]=ah;ah=(Fi(e,w,aj,aj+288|0,ai,h,0)|0)-aj|0;if((ah|0)>=288){break L8}c[j+16>>2]=((ah|0)/12|0|0)%12|0;break};case 68:{ah=e|0;c[F>>2]=c[ah>>2];c[G>>2]=c[f>>2];Gx(E,d,F,G,g,h,j,12880,12888);c[ah>>2]=c[E>>2];break};case 70:{ah=e|0;c[I>>2]=c[ah>>2];c[J>>2]=c[f>>2];Gx(H,d,I,J,g,h,j,12872,12880);c[ah>>2]=c[H>>2];break};case 120:{ah=c[(c[d>>2]|0)+20>>2]|0;c[W>>2]=c[e>>2];c[X>>2]=c[f>>2];cQ[ah&127](b,d,W,X,g,h,j);i=l;return};case 88:{ah=d+8|0;aj=cC[c[(c[ah>>2]|0)+24>>2]&511](ah)|0;ah=e|0;c[Z>>2]=c[ah>>2];c[_>>2]=c[f>>2];ak=aj;am=a[aj]|0;if((am&1)==0){aq=ak+1|0;ar=ak+1|0}else{ak=c[aj+8>>2]|0;aq=ak;ar=ak}ak=am&255;if((ak&1|0)==0){as=ak>>>1}else{as=c[aj+4>>2]|0}Gx(Y,d,Z,_,g,h,j,ar,aq+as|0);c[ah>>2]=c[Y>>2];break};case 121:{c[n>>2]=c[f>>2];ah=GK(e,n,h,ai,4)|0;if((c[h>>2]&4|0)!=0){break L8}if((ah|0)<69){at=ah+2e3|0}else{at=(ah-69|0)>>>0<31>>>0?ah+1900|0:ah}c[j+20>>2]=at-1900;break};case 89:{c[m>>2]=c[f>>2];ah=GK(e,m,h,ai,4)|0;if((c[h>>2]&4|0)!=0){break L8}c[j+20>>2]=ah-1900;break};case 37:{c[$>>2]=c[f>>2];GJ(0,e,$,h,ai);break};default:{c[h>>2]=c[h>>2]|4}}}while(0);c[b>>2]=c[e>>2];i=l;return}}while(0);l=ck(4)|0;Kw(l);z=0;aR(146,l|0,28488,100);if(z){z=0;ab=bS(-1,-1)|0;ac=M;ad=c[aa>>2]|0;ae=ad|0;af=Di(ae)|0;bg(ab|0)}}function GH(d,e,f,g,h){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;d=i;j=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[j>>2];j=e|0;e=f|0;f=h+8|0;L1:while(1){h=c[j>>2]|0;do{if((h|0)==0){k=0}else{if((c[h+12>>2]|0)!=(c[h+16>>2]|0)){k=h;break}if((cC[c[(c[h>>2]|0)+36>>2]&511](h)|0)==-1){c[j>>2]=0;k=0;break}else{k=c[j>>2]|0;break}}}while(0);h=(k|0)==0;l=c[e>>2]|0;L10:do{if((l|0)==0){m=12}else{do{if((c[l+12>>2]|0)==(c[l+16>>2]|0)){if((cC[c[(c[l>>2]|0)+36>>2]&511](l)|0)!=-1){break}c[e>>2]=0;m=12;break L10}}while(0);if(h){n=l;o=0}else{p=l;q=0;break L1}}}while(0);if((m|0)==12){m=0;if(h){p=0;q=1;break}else{n=0;o=1}}l=c[j>>2]|0;r=c[l+12>>2]|0;if((r|0)==(c[l+16>>2]|0)){s=(cC[c[(c[l>>2]|0)+36>>2]&511](l)|0)&255}else{s=a[r]|0}if(s<<24>>24<=-1){p=n;q=o;break}if((b[(c[f>>2]|0)+(s<<24>>24<<1)>>1]&8192)==0){p=n;q=o;break}r=c[j>>2]|0;l=r+12|0;t=c[l>>2]|0;if((t|0)==(c[r+16>>2]|0)){cC[c[(c[r>>2]|0)+40>>2]&511](r)|0;continue}else{c[l>>2]=t+1;continue}}o=c[j>>2]|0;do{if((o|0)==0){u=0}else{if((c[o+12>>2]|0)!=(c[o+16>>2]|0)){u=o;break}if((cC[c[(c[o>>2]|0)+36>>2]&511](o)|0)==-1){c[j>>2]=0;u=0;break}else{u=c[j>>2]|0;break}}}while(0);j=(u|0)==0;do{if(q){m=31}else{if((c[p+12>>2]|0)!=(c[p+16>>2]|0)){if(!(j^(p|0)==0)){break}i=d;return}if((cC[c[(c[p>>2]|0)+36>>2]&511](p)|0)==-1){c[e>>2]=0;m=31;break}if(!j){break}i=d;return}}while(0);do{if((m|0)==31){if(j){break}i=d;return}}while(0);c[g>>2]=c[g>>2]|2;i=d;return}function GI(a,b,e,f,g,h){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0;j=i;i=i+8|0;k=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[k>>2];k=j|0;l=a+8|0;a=cC[c[(c[l>>2]|0)+8>>2]&511](l)|0;l=d[a]|0;if((l&1|0)==0){m=l>>>1}else{m=c[a+4>>2]|0}l=d[a+12|0]|0;if((l&1|0)==0){n=l>>>1}else{n=c[a+16>>2]|0}if((m|0)==(-n|0)){c[g>>2]=c[g>>2]|4;i=j;return}c[k>>2]=c[f>>2];f=Fi(e,k,a,a+24|0,h,g,0)|0;g=f-a|0;do{if((f|0)==(a|0)){if((c[b>>2]|0)!=12){break}c[b>>2]=0;i=j;return}}while(0);if((g|0)!=12){i=j;return}g=c[b>>2]|0;if((g|0)>=12){i=j;return}c[b>>2]=g+12;i=j;return}function GJ(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0;b=i;h=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[h>>2];h=d|0;d=c[h>>2]|0;do{if((d|0)==0){j=0}else{if((c[d+12>>2]|0)!=(c[d+16>>2]|0)){j=d;break}if((cC[c[(c[d>>2]|0)+36>>2]&511](d)|0)==-1){c[h>>2]=0;j=0;break}else{j=c[h>>2]|0;break}}}while(0);d=(j|0)==0;j=e|0;e=c[j>>2]|0;L8:do{if((e|0)==0){k=11}else{do{if((c[e+12>>2]|0)==(c[e+16>>2]|0)){if((cC[c[(c[e>>2]|0)+36>>2]&511](e)|0)!=-1){break}c[j>>2]=0;k=11;break L8}}while(0);if(d){l=e;m=0}else{k=12}}}while(0);if((k|0)==11){if(d){k=12}else{l=0;m=1}}if((k|0)==12){c[f>>2]=c[f>>2]|6;i=b;return}d=c[h>>2]|0;e=c[d+12>>2]|0;if((e|0)==(c[d+16>>2]|0)){n=(cC[c[(c[d>>2]|0)+36>>2]&511](d)|0)&255}else{n=a[e]|0}if((cH[c[(c[g>>2]|0)+36>>2]&127](g,n,0)|0)<<24>>24!=37){c[f>>2]=c[f>>2]|4;i=b;return}n=c[h>>2]|0;g=n+12|0;e=c[g>>2]|0;if((e|0)==(c[n+16>>2]|0)){cC[c[(c[n>>2]|0)+40>>2]&511](n)|0}else{c[g>>2]=e+1}e=c[h>>2]|0;do{if((e|0)==0){o=0}else{if((c[e+12>>2]|0)!=(c[e+16>>2]|0)){o=e;break}if((cC[c[(c[e>>2]|0)+36>>2]&511](e)|0)==-1){c[h>>2]=0;o=0;break}else{o=c[h>>2]|0;break}}}while(0);h=(o|0)==0;do{if(m){k=31}else{if((c[l+12>>2]|0)!=(c[l+16>>2]|0)){if(!(h^(l|0)==0)){break}i=b;return}if((cC[c[(c[l>>2]|0)+36>>2]&511](l)|0)==-1){c[j>>2]=0;k=31;break}if(!h){break}i=b;return}}while(0);do{if((k|0)==31){if(h){break}i=b;return}}while(0);c[f>>2]=c[f>>2]|2;i=b;return}function GK(d,e,f,g,h){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;j=i;k=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[k>>2];k=d|0;d=c[k>>2]|0;do{if((d|0)==0){l=0}else{if((c[d+12>>2]|0)!=(c[d+16>>2]|0)){l=d;break}if((cC[c[(c[d>>2]|0)+36>>2]&511](d)|0)==-1){c[k>>2]=0;l=0;break}else{l=c[k>>2]|0;break}}}while(0);d=(l|0)==0;l=e|0;e=c[l>>2]|0;L8:do{if((e|0)==0){m=11}else{do{if((c[e+12>>2]|0)==(c[e+16>>2]|0)){if((cC[c[(c[e>>2]|0)+36>>2]&511](e)|0)!=-1){break}c[l>>2]=0;m=11;break L8}}while(0);if(d){n=e}else{m=12}}}while(0);if((m|0)==11){if(d){m=12}else{n=0}}if((m|0)==12){c[f>>2]=c[f>>2]|6;o=0;i=j;return o|0}d=c[k>>2]|0;e=c[d+12>>2]|0;if((e|0)==(c[d+16>>2]|0)){p=(cC[c[(c[d>>2]|0)+36>>2]&511](d)|0)&255}else{p=a[e]|0}do{if(p<<24>>24>-1){e=g+8|0;if((b[(c[e>>2]|0)+(p<<24>>24<<1)>>1]&2048)==0){break}d=g;q=(cH[c[(c[d>>2]|0)+36>>2]&127](g,p,0)|0)<<24>>24;r=c[k>>2]|0;s=r+12|0;t=c[s>>2]|0;if((t|0)==(c[r+16>>2]|0)){cC[c[(c[r>>2]|0)+40>>2]&511](r)|0;u=q;v=h;w=n}else{c[s>>2]=t+1;u=q;v=h;w=n}while(1){x=u-48|0;q=v-1|0;t=c[k>>2]|0;do{if((t|0)==0){y=0}else{if((c[t+12>>2]|0)!=(c[t+16>>2]|0)){y=t;break}if((cC[c[(c[t>>2]|0)+36>>2]&511](t)|0)==-1){c[k>>2]=0;y=0;break}else{y=c[k>>2]|0;break}}}while(0);t=(y|0)==0;if((w|0)==0){z=y;A=0}else{do{if((c[w+12>>2]|0)==(c[w+16>>2]|0)){if((cC[c[(c[w>>2]|0)+36>>2]&511](w)|0)!=-1){B=w;break}c[l>>2]=0;B=0}else{B=w}}while(0);z=c[k>>2]|0;A=B}C=(A|0)==0;if(!((t^C)&(q|0)>0)){m=41;break}s=c[z+12>>2]|0;if((s|0)==(c[z+16>>2]|0)){D=(cC[c[(c[z>>2]|0)+36>>2]&511](z)|0)&255}else{D=a[s]|0}if(D<<24>>24<=-1){o=x;m=57;break}if((b[(c[e>>2]|0)+(D<<24>>24<<1)>>1]&2048)==0){o=x;m=56;break}s=((cH[c[(c[d>>2]|0)+36>>2]&127](g,D,0)|0)<<24>>24)+(x*10|0)|0;r=c[k>>2]|0;E=r+12|0;F=c[E>>2]|0;if((F|0)==(c[r+16>>2]|0)){cC[c[(c[r>>2]|0)+40>>2]&511](r)|0;u=s;v=q;w=A;continue}else{c[E>>2]=F+1;u=s;v=q;w=A;continue}}if((m|0)==57){i=j;return o|0}else if((m|0)==41){do{if((z|0)==0){G=0}else{if((c[z+12>>2]|0)!=(c[z+16>>2]|0)){G=z;break}if((cC[c[(c[z>>2]|0)+36>>2]&511](z)|0)==-1){c[k>>2]=0;G=0;break}else{G=c[k>>2]|0;break}}}while(0);d=(G|0)==0;L66:do{if(C){m=51}else{do{if((c[A+12>>2]|0)==(c[A+16>>2]|0)){if((cC[c[(c[A>>2]|0)+36>>2]&511](A)|0)!=-1){break}c[l>>2]=0;m=51;break L66}}while(0);if(d){o=x}else{break}i=j;return o|0}}while(0);do{if((m|0)==51){if(d){break}else{o=x}i=j;return o|0}}while(0);c[f>>2]=c[f>>2]|2;o=x;i=j;return o|0}else if((m|0)==56){i=j;return o|0}}}while(0);c[f>>2]=c[f>>2]|4;o=0;i=j;return o|0}
function jc(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;e=i;i=i+72|0;f=e|0;g=e+16|0;h=e+32|0;j=e+48|0;k=e+56|0;l=c[d+36>>2]|0;if((l|0)==0){m=0}else{m=cU[c[(c[l>>2]|0)+20>>2]&1023](l|0,b|0)|0}l=c[d+40>>2]|0;if((l|0)==0){n=0}else{n=cU[c[(c[l>>2]|0)+20>>2]&1023](l|0,b|0)|0}l=c[b+4>>2]|0;b=K$(48)|0;c[j>>2]=b;o=l+4|0;p=c[o>>2]|0;if((p|0)==(c[l+8>>2]|0)){e4(l|0,j);q=c[j>>2]|0}else{if((p|0)==0){r=0}else{c[p>>2]=b;r=c[o>>2]|0}c[o>>2]=r+4;q=b}b=q;r=d+4|0;L14:do{if((a[r]&1)==0){p=k;c[p>>2]=c[r>>2];c[p+4>>2]=c[r+4>>2];c[p+8>>2]=c[r+8>>2];s=a[p]|0;t=p;u=20}else{p=c[d+12>>2]|0;j=c[d+8>>2]|0;do{if(j>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(j>>>0<11>>>0){v=j<<1&255;w=k;a[w]=v;x=k+1|0;y=v;A=w}else{w=j+16&-16;v=(z=0,au(246,w|0)|0);if(z){z=0;break}c[k+8>>2]=v;B=w|1;c[k>>2]=B;c[k+4>>2]=j;x=v;y=B&255;A=k}La(x|0,p|0,j)|0;a[x+j|0]=0;s=y;t=A;u=20;break L14}}while(0);j=bS(-1,-1)|0;C=M;D=j}}while(0);do{if((u|0)==20){A=d+16|0;y=h;c[y>>2]=c[A>>2];c[y+4>>2]=c[A+4>>2];c[y+8>>2]=c[A+8>>2];A=a[d+44|0]&1;y=h;x=f;r=g;j=q;L29:do{if((s&1)==0){c[x>>2]=c[t>>2];c[x+4>>2]=c[t+4>>2];c[x+8>>2]=c[t+8>>2];u=30}else{p=c[k+8>>2]|0;B=c[k+4>>2]|0;do{if(B>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(B>>>0<11>>>0){a[x]=B<<1;E=f+1|0}else{v=B+16&-16;w=(z=0,au(246,v|0)|0);if(z){z=0;break}c[f+8>>2]=w;c[f>>2]=v|1;c[f+4>>2]=B;E=w}La(E|0,p|0,B)|0;a[E+B|0]=0;u=30;break L29}}while(0);B=bS(-1,-1)|0;F=M;G=B}}while(0);do{if((u|0)==30){c[r>>2]=c[y>>2];c[r+4>>2]=c[y+4>>2];c[r+8>>2]=c[y+8>>2];z=0;aD(6,j|0,f|0,g|0,0,0,0);if(z){z=0;B=bS(-1,-1)|0;p=M;if((a[x]&1)==0){F=p;G=B;break}K1(c[f+8>>2]|0);F=p;G=B;break}if((a[x]&1)!=0){K1(c[f+8>>2]|0)}c[q>>2]=19256;c[q+36>>2]=m;c[q+40>>2]=n;a[q+44|0]=A;if((a[t]&1)==0){i=e;return j|0}K1(c[k+8>>2]|0);i=e;return j|0}}while(0);j=G;A=F;if((a[t]&1)==0){C=A;D=j;break}K1(c[k+8>>2]|0);C=A;D=j}}while(0);k=c[l>>2]|0;l=c[o>>2]|0;L58:do{if((k|0)==(l|0)){H=k}else{t=k;while(1){F=t+4|0;if((c[t>>2]|0)==(q|0)){H=t;break L58}if((F|0)==(l|0)){H=l;break}else{t=F}}}}while(0);q=H-k>>2;H=k+(q+1<<2)|0;t=l-H|0;Lb(k+(q<<2)|0,H|0,t|0)|0;H=k+((t>>2)+q<<2)|0;q=c[o>>2]|0;if((H|0)==(q|0)){K1(b);I=D;J=0;K=I;L=C;bg(K|0)}c[o>>2]=q+(~((q-4+(-H|0)|0)>>>2)<<2);K1(b);I=D;J=0;K=I;L=C;bg(K|0);return 0}function jd(a,b){a=a|0;b=b|0;return b|0}function je(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0;e=i;i=i+120|0;f=e|0;g=e+16|0;h=e+24|0;j=e+32|0;k=e+48|0;l=e+56|0;m=e+72|0;n=e+88|0;o=e+104|0;p=c[d+36>>2]|0;a[p+28|0]=0;q=cU[c[(c[p>>2]|0)+20>>2]&1023](p|0,b|0)|0;a[q+28|0]=0;p=d+52|0;L1:do{if((a[p]&1)==0){r=q}else{if((c[q+32>>2]|0)==5){r=q;break}s=c[b+4>>2]|0;t=K$(60)|0;c[k>>2]=t;u=s+4|0;v=c[u>>2]|0;if((v|0)==(c[s+8>>2]|0)){e4(s|0,k);w=c[k>>2]|0}else{if((v|0)==0){x=0}else{c[v>>2]=t;x=c[u>>2]|0}c[u>>2]=x+4;w=t}t=w;v=q+4|0;L11:do{if((a[v]&1)==0){y=l;c[y>>2]=c[v>>2];c[y+4>>2]=c[v+4>>2];c[y+8>>2]=c[v+8>>2];A=18}else{y=c[q+12>>2]|0;B=c[q+8>>2]|0;do{if(B>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(B>>>0<11>>>0){a[l]=B<<1;C=l+1|0}else{D=B+16&-16;E=(z=0,au(246,D|0)|0);if(z){z=0;break}c[l+8>>2]=E;c[l>>2]=D|1;c[l+4>>2]=B;C=E}La(C|0,y|0,B)|0;a[C+B|0]=0;A=18;break L11}}while(0);B=bS(-1,-1)|0;F=M;G=B}}while(0);do{if((A|0)==18){v=q+16|0;B=j;c[B>>2]=c[v>>2];c[B+4>>2]=c[v+4>>2];c[B+8>>2]=c[v+8>>2];z=0;aD(34,w|0,l|0,j|0,0,1,1);if(z){z=0;v=bS(-1,-1)|0;B=v;v=M;if((a[l]&1)==0){F=v;G=B;break}K1(c[l+8>>2]|0);F=v;G=B;break}if((a[l]&1)!=0){K1(c[l+8>>2]|0)}B=w+36|0;v=B;c[h>>2]=q;y=B+8|0;E=y;D=c[E>>2]|0;if((D|0)==(c[B+12>>2]|0)){fp(B+4|0,h);H=c[h>>2]|0}else{if((D|0)==0){I=0}else{c[D>>2]=q;I=c[E>>2]|0}c[y>>2]=I+4;H=q}cA[c[c[B>>2]>>2]&1023](v,H);r=w;break L1}}while(0);v=c[s>>2]|0;B=c[u>>2]|0;L41:do{if((v|0)==(B|0)){J=v}else{y=v;while(1){E=y+4|0;if((c[y>>2]|0)==(w|0)){J=y;break L41}if((E|0)==(B|0)){J=B;break}else{y=E}}}}while(0);s=J-v>>2;y=v+(s+1<<2)|0;E=B-y|0;Lb(v+(s<<2)|0,y|0,E|0)|0;y=v+((E>>2)+s<<2)|0;s=c[u>>2]|0;if((y|0)!=(s|0)){c[u>>2]=s+(~((s-4+(-y|0)|0)>>>2)<<2)}K1(t);K=F;L=G;N=L;O=0;P=N;Q=K;bg(P|0)}}while(0);G=c[b+4>>2]|0;b=K$(56)|0;c[g>>2]=b;F=G+4|0;J=c[F>>2]|0;if((J|0)==(c[G+8>>2]|0)){e4(G|0,g);R=c[g>>2]|0}else{if((J|0)==0){S=0}else{c[J>>2]=b;S=c[F>>2]|0}c[F>>2]=S+4;R=b}b=R;S=R;J=d+4|0;L58:do{if((a[J]&1)==0){g=m;c[g>>2]=c[J>>2];c[g+4>>2]=c[J+4>>2];c[g+8>>2]=c[J+8>>2];A=51}else{g=c[d+12>>2]|0;w=c[d+8>>2]|0;do{if(w>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(w>>>0<11>>>0){a[m]=w<<1;T=m+1|0}else{H=w+16&-16;q=(z=0,au(246,H|0)|0);if(z){z=0;break}c[m+8>>2]=q;c[m>>2]=H|1;c[m+4>>2]=w;T=q}La(T|0,g|0,w)|0;a[T+w|0]=0;A=51;break L58}}while(0);w=bS(-1,-1)|0;U=M;V=w}}while(0);do{if((A|0)==51){T=n;J=d+16|0;c[T>>2]=c[J>>2];c[T+4>>2]=c[J+4>>2];c[T+8>>2]=c[J+8>>2];J=d+40|0;L73:do{if((a[J]&1)==0){w=o;c[w>>2]=c[J>>2];c[w+4>>2]=c[J+4>>2];c[w+8>>2]=c[J+8>>2];A=61}else{w=c[d+48>>2]|0;g=c[d+44>>2]|0;do{if(g>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(g>>>0<11>>>0){a[o]=g<<1;W=o+1|0}else{t=g+16&-16;u=(z=0,au(246,t|0)|0);if(z){z=0;break}c[o+8>>2]=u;c[o>>2]=t|1;c[o+4>>2]=g;W=u}La(W|0,w|0,g)|0;a[W+g|0]=0;A=61;break L73}}while(0);g=bS(-1,-1)|0;X=M;Y=g}}while(0);do{if((A|0)==61){J=(a[p]&1)!=0;g=f;c[g>>2]=c[T>>2];c[g+4>>2]=c[T+4>>2];c[g+8>>2]=c[T+8>>2];z=0;aD(28,S|0,m|0,f|0,r|0,o|0,J|0);if(z){z=0;J=bS(-1,-1)|0;g=J;J=M;if((a[o]&1)==0){X=J;Y=g;break}K1(c[o+8>>2]|0);X=J;Y=g;break}g=R;if((a[o]&1)!=0){K1(c[o+8>>2]|0)}if((a[m]&1)==0){i=e;return g|0}K1(c[m+8>>2]|0);i=e;return g|0}}while(0);if((a[m]&1)==0){U=X;V=Y;break}K1(c[m+8>>2]|0);U=X;V=Y}}while(0);Y=c[G>>2]|0;G=c[F>>2]|0;L102:do{if((Y|0)==(G|0)){Z=Y}else{X=Y;while(1){m=X+4|0;if((c[X>>2]|0)==(R|0)){Z=X;break L102}if((m|0)==(G|0)){Z=G;break}else{X=m}}}}while(0);R=Z-Y>>2;Z=Y+(R+1<<2)|0;X=G-Z|0;Lb(Y+(R<<2)|0,Z|0,X|0)|0;Z=Y+((X>>2)+R<<2)|0;R=c[F>>2]|0;if((Z|0)!=(R|0)){c[F>>2]=R+(~((R-4+(-Z|0)|0)>>>2)<<2)}K1(b);K=U;L=V;N=L;O=0;P=N;Q=K;bg(P|0);return 0}function jf(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;e=i;i=i+48|0;f=e|0;g=e+8|0;h=e+24|0;j=e+32|0;k=c[b+4>>2]|0;l=K$(56)|0;c[h>>2]=l;m=k+4|0;n=c[m>>2]|0;if((n|0)==(c[k+8>>2]|0)){e4(k|0,h);o=c[h>>2]|0}else{if((n|0)==0){p=0}else{c[n>>2]=l;p=c[m>>2]|0}c[m>>2]=p+4;o=l}l=o;p=d+4|0;L8:do{if((a[p]&1)==0){n=j;c[n>>2]=c[p>>2];c[n+4>>2]=c[p+4>>2];c[n+8>>2]=c[p+8>>2];q=16}else{n=c[d+12>>2]|0;h=c[d+8>>2]|0;do{if(h>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(h>>>0<11>>>0){a[j]=h<<1;r=j+1|0}else{s=h+16&-16;t=(z=0,au(246,s|0)|0);if(z){z=0;break}c[j+8>>2]=t;c[j>>2]=s|1;c[j+4>>2]=h;r=t}La(r|0,n|0,h)|0;a[r+h|0]=0;q=16;break L8}}while(0);h=bS(-1,-1)|0;u=h;v=M}}while(0);do{if((q|0)==16){r=d+16|0;p=g;c[p>>2]=c[r>>2];c[p+4>>2]=c[r+4>>2];c[p+8>>2]=c[r+8>>2];z=0;aR(46,o|0,j|0,g|0);if(z){z=0;r=bS(-1,-1)|0;p=r;r=M;if((a[j]&1)==0){u=p;v=r;break}K1(c[j+8>>2]|0);u=p;v=r;break}if((a[j]&1)!=0){K1(c[j+8>>2]|0)}r=d+40|0;p=c[r>>2]|0;h=(c[d+44>>2]|0)-p>>2;if((h|0)==0){w=o;i=e;return w|0}n=o+36|0;t=n;s=b|0;x=n+8|0;y=x;A=n+12|0;B=n+4|0;C=n;n=0;D=p;while(1){p=c[D+(n<<2)>>2]|0;E=cU[c[(c[p>>2]|0)+20>>2]&1023](p,s)|0;c[f>>2]=E;p=c[y>>2]|0;if((p|0)==(c[A>>2]|0)){jL(B,f);F=c[f>>2]|0}else{if((p|0)==0){G=0}else{c[p>>2]=E;G=c[y>>2]|0}c[x>>2]=G+4;F=E}cA[c[c[C>>2]>>2]&1023](t,F);E=n+1|0;if(E>>>0>=h>>>0){break}n=E;D=c[r>>2]|0}w=o;i=e;return w|0}}while(0);w=c[k>>2]|0;k=c[m>>2]|0;L45:do{if((w|0)==(k|0)){H=w}else{e=w;while(1){F=e+4|0;if((c[e>>2]|0)==(o|0)){H=e;break L45}if((F|0)==(k|0)){H=k;break}else{e=F}}}}while(0);o=H-w>>2;H=w+(o+1<<2)|0;e=k-H|0;Lb(w+(o<<2)|0,H|0,e|0)|0;H=w+((e>>2)+o<<2)|0;o=c[m>>2]|0;if((H|0)==(o|0)){K1(l);I=u;J=0;K=I;L=v;bg(K|0)}c[m>>2]=o+(~((o-4+(-H|0)|0)>>>2)<<2);K1(l);I=u;J=0;K=I;L=v;bg(K|0);return 0}function jg(b,e){b=b|0;e=e|0;var f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0.0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0;f=i;i=i+96|0;g=f|0;j=f+8|0;k=f+16|0;l=f+32|0;m=f+48|0;n=f+64|0;o=f+80|0;p=e;q=d[p]|0;if((q&1|0)==0){r=q>>>1}else{r=c[e+4>>2]|0}L5:do{if((r|0)==0){q=c[b+52>>2]|0;s=b+48|0;t=c[s>>2]|0;u=(q-t|0)/12|0;if((q|0)==(t|0)){break}q=k;v=k+8|0;w=k+1|0;x=k|0;y=k+4|0;A=0;B=t;while(1){t=B+(A*12|0)|0;if((a[t]&1)==0){c[q>>2]=c[t>>2];c[q+4>>2]=c[t+4>>2];c[q+8>>2]=c[t+8>>2]}else{t=c[B+(A*12|0)+8>>2]|0;C=c[B+(A*12|0)+4>>2]|0;if(C>>>0>4294967279>>>0){D=10;break}if(C>>>0<11>>>0){a[q]=C<<1;E=w}else{F=C+16&-16;G=K$(F)|0;c[v>>2]=G;c[x>>2]=F|1;c[y>>2]=C;E=G}La(E|0,t|0,C)|0;a[E+C|0]=0}C=(z=0,au(46,k|0)|0);if(z){z=0;D=17;break}if((C|0)!=6){D=21;break}if((a[q]&1)!=0){K1(c[v>>2]|0)}C=A+1|0;if(C>>>0>=u>>>0){break L5}A=C;B=c[s>>2]|0}do{if((D|0)==10){DE(0)}else if((D|0)==17){s=bS(-1,-1)|0;H=M;I=s}else if((D|0)==21){z=0,aM(344,e|0,k|0)|0;if(z){z=0;s=bS(-1,-1)|0;H=M;I=s;break}if((a[q]&1)==0){break L5}K1(c[v>>2]|0);break L5}}while(0);s=I;B=H;if((a[q]&1)==0){J=B;K=s;L=K;N=0;O=L;P=J;bg(O|0)}K1(c[v>>2]|0);J=B;K=s;L=K;N=0;O=L;P=J;bg(O|0)}}while(0);H=d[p]|0;if((H&1|0)==0){Q=H>>>1}else{Q=c[e+4>>2]|0}L43:do{if((Q|0)==0){H=c[b+64>>2]|0;p=b+60|0;I=c[p>>2]|0;k=(H-I|0)/12|0;if((H|0)==(I|0)){break}H=l;E=l+8|0;r=l+1|0;s=l|0;B=l+4|0;A=0;u=I;while(1){I=u+(A*12|0)|0;if((a[I]&1)==0){c[H>>2]=c[I>>2];c[H+4>>2]=c[I+4>>2];c[H+8>>2]=c[I+8>>2]}else{I=c[u+(A*12|0)+8>>2]|0;y=c[u+(A*12|0)+4>>2]|0;if(y>>>0>4294967279>>>0){D=37;break}if(y>>>0<11>>>0){a[H]=y<<1;R=r}else{x=y+16&-16;w=K$(x)|0;c[E>>2]=w;c[s>>2]=x|1;c[B>>2]=y;R=w}La(R|0,I|0,y)|0;a[R+y|0]=0}y=(z=0,au(46,l|0)|0);if(z){z=0;D=44;break}if((y|0)!=6){D=48;break}if((a[H]&1)!=0){K1(c[E>>2]|0)}y=A+1|0;if(y>>>0>=k>>>0){break L43}A=y;u=c[p>>2]|0}do{if((D|0)==37){DE(0)}else if((D|0)==44){p=bS(-1,-1)|0;S=M;T=p}else if((D|0)==48){z=0,aM(344,e|0,l|0)|0;if(z){z=0;p=bS(-1,-1)|0;S=M;T=p;break}if((a[H]&1)==0){break L43}K1(c[E>>2]|0);break L43}}while(0);p=T;u=S;if((a[H]&1)==0){J=u;K=p;L=K;N=0;O=L;P=J;bg(O|0)}K1(c[E>>2]|0);J=u;K=p;L=K;N=0;O=L;P=J;bg(O|0)}}while(0);S=b+48|0;T=b+52|0;l=c[T>>2]|0;R=S|0;Q=c[R>>2]|0;p=(l-Q|0)/12|0;L77:do{if((l|0)!=(Q|0)){u=m;A=m+8|0;k=b+40|0;B=m+1|0;s=m|0;r=m+4|0;v=0;q=Q;while(1){y=q+(v*12|0)|0;if((a[y]&1)==0){c[u>>2]=c[y>>2];c[u+4>>2]=c[y+4>>2];c[u+8>>2]=c[y+8>>2]}else{y=c[q+(v*12|0)+8>>2]|0;I=c[q+(v*12|0)+4>>2]|0;if(I>>>0>4294967279>>>0){D=60;break}if(I>>>0<11>>>0){a[u]=I<<1;U=B}else{w=I+16&-16;x=K$(w)|0;c[A>>2]=x;c[s>>2]=w|1;c[r>>2]=I;U=x}La(U|0,y|0,I)|0;a[U+I|0]=0}I=(z=0,au(46,m|0)|0);if(z){z=0;break}if((I|0)!=6){V=(z=0,+(+aO(2,m|0,e|0)));if(z){z=0;break}h[k>>3]=V*+h[k>>3];I=(c[R>>2]|0)+(v*12|0)|0;z=0,aM(344,I|0,e|0)|0;if(z){z=0;break}}if((a[u]&1)!=0){K1(c[A>>2]|0)}I=v+1|0;if(I>>>0>=p>>>0){break L77}v=I;q=c[R>>2]|0}if((D|0)==60){DE(0)}q=bS(-1,-1)|0;v=q;q=M;if((a[u]&1)==0){J=q;K=v;L=K;N=0;O=L;P=J;bg(O|0)}K1(c[A>>2]|0);J=q;K=v;L=K;N=0;O=L;P=J;bg(O|0)}}while(0);p=b+64|0;m=c[p>>2]|0;U=b+60|0;Q=c[U>>2]|0;l=(m-Q|0)/12|0;L107:do{if((m|0)!=(Q|0)){v=n;q=n+8|0;k=b+40|0;r=n+1|0;s=n|0;B=n+4|0;E=0;H=Q;while(1){I=H+(E*12|0)|0;if((a[I]&1)==0){c[v>>2]=c[I>>2];c[v+4>>2]=c[I+4>>2];c[v+8>>2]=c[I+8>>2]}else{I=c[H+(E*12|0)+8>>2]|0;y=c[H+(E*12|0)+4>>2]|0;if(y>>>0>4294967279>>>0){D=80;break}if(y>>>0<11>>>0){a[v]=y<<1;W=r}else{x=y+16&-16;w=K$(x)|0;c[q>>2]=w;c[s>>2]=x|1;c[B>>2]=y;W=w}La(W|0,I|0,y)|0;a[W+y|0]=0}y=(z=0,au(46,n|0)|0);if(z){z=0;break}if((y|0)!=6){V=(z=0,+(+aO(2,n|0,e|0)));if(z){z=0;break}h[k>>3]=+h[k>>3]/V;y=(c[U>>2]|0)+(E*12|0)|0;z=0,aM(344,y|0,e|0)|0;if(z){z=0;break}}if((a[v]&1)!=0){K1(c[q>>2]|0)}y=E+1|0;if(y>>>0>=l>>>0){break L107}E=y;H=c[U>>2]|0}if((D|0)==80){DE(0)}H=bS(-1,-1)|0;E=H;H=M;if((a[v]&1)==0){J=H;K=E;L=K;N=0;O=L;P=J;bg(O|0)}K1(c[q>>2]|0);J=H;K=E;L=K;N=0;O=L;P=J;bg(O|0)}}while(0);l=o|0;c[l>>2]=0;e=o+4|0;c[e>>2]=0;n=o+8|0;c[n>>2]=0;z=0;as(398,o|0,((c[T>>2]|0)-(c[R>>2]|0)|0)/12|0|0);L137:do{if(!z){W=c[R>>2]|0;L139:do{if((W|0)==(c[T>>2]|0)){X=W}else{Q=W;L140:while(1){b=c[U>>2]|0;m=c[p>>2]|0;L142:do{if((b|0)==(m|0)){Y=b;D=116}else{E=a[Q]|0;H=E&255;k=(H&1|0)==0;B=H>>>1;H=Q+1|0;s=Q+8|0;r=Q+4|0;A=b;while(1){u=A;y=a[A]|0;I=y&255;if((I&1|0)==0){Z=I>>>1}else{Z=c[A+4>>2]|0}if(k){_=B}else{_=c[r>>2]|0}L153:do{if((Z|0)==(_|0)){I=(y&1)==0;if(I){$=u+1|0}else{$=c[A+8>>2]|0}if((E&1)==0){aa=H}else{aa=c[s>>2]|0}if(!I){if((Lc($|0,aa|0,Z|0)|0)==0){Y=A;D=116;break L142}else{break}}if((Z|0)==0){Y=A;D=116;break L142}else{ab=aa;ac=$;ad=Z}while(1){if((a[ac]|0)!=(a[ab]|0)){break L153}I=ad-1|0;if((I|0)==0){Y=A;D=116;break L142}else{ab=ab+1|0;ac=ac+1|0;ad=I}}}}while(0);u=A+12|0;if((u|0)==(m|0)){D=135;break}else{A=u}}}}while(0);do{if((D|0)==116){D=0;if((Y|0)==(m|0)){D=135;break}A=(Y-b|0)/12|0;s=b+(A*12|0)|0;H=b+((A+1|0)*12|0)|0;if((H|0)==(m|0)){ae=s;af=m}else{A=s;s=H;do{z=0,aM(344,A|0,s|0)|0;if(z){z=0;D=125;break L140}s=s+12|0;A=A+12|0;}while((s|0)!=(m|0));ae=A;af=c[p>>2]|0}if((ae|0)==(af|0)){break}else{ag=af}while(1){s=ag-12|0;c[p>>2]=s;if((a[s]&1)==0){ah=s}else{K1(c[ag-12+8>>2]|0);ah=c[p>>2]|0}if((ae|0)==(ah|0)){break}else{ag=ah}}}}while(0);do{if((D|0)==135){D=0;m=c[e>>2]|0;if((m|0)==(c[n>>2]|0)){z=0;as(284,o|0,Q|0);if(!z){break}else{z=0;D=126;break L140}}do{if((m|0)!=0){b=Q;if((a[b]&1)==0){A=m;c[A>>2]=c[b>>2];c[A+4>>2]=c[b+4>>2];c[A+8>>2]=c[b+8>>2];break}b=c[Q+8>>2]|0;A=c[Q+4>>2]|0;if(A>>>0>4294967279>>>0){D=140;break L140}if(A>>>0<11>>>0){a[m]=A<<1;ai=m+1|0}else{s=A+16&-16;H=(z=0,au(246,s|0)|0);if(z){z=0;D=126;break L140}c[m+8>>2]=H;c[m>>2]=s|1;c[m+4>>2]=A;ai=H}La(ai|0,b|0,A)|0;a[ai+A|0]=0}}while(0);c[e>>2]=(c[e>>2]|0)+12}}while(0);m=Q+12|0;if((m|0)==(c[T>>2]|0)){X=m;break L139}else{Q=m}}if((D|0)==125){Q=bS(-1,-1)|0;aj=M;ak=Q;break L137}else if((D|0)==126){Q=bS(-1,-1)|0;aj=M;ak=Q;break L137}else if((D|0)==140){z=0;ar(88,0);if(z){z=0;D=127;break L137}}}}while(0);if((S|0)==(o|0)){al=X}else{z=0;aR(142,S|0,c[l>>2]|0,c[e>>2]|0);if(z){z=0;D=127;break}al=c[T>>2]|0}z=0;aR(404,c[R>>2]|0,al|0,g|0);if(z){z=0;D=127;break}z=0;aR(404,c[U>>2]|0,c[p>>2]|0,j|0);if(z){z=0;D=127;break}W=c[l>>2]|0;if((W|0)==0){i=f;return}q=c[e>>2]|0;if((W|0)==(q|0)){am=W}else{v=q;while(1){q=v-12|0;c[e>>2]=q;if((a[q]&1)==0){an=q}else{K1(c[v-12+8>>2]|0);an=c[e>>2]|0}if((W|0)==(an|0)){break}else{v=an}}am=c[l>>2]|0}K1(am);i=f;return}else{z=0;D=127}}while(0);if((D|0)==127){D=bS(-1,-1)|0;aj=M;ak=D}D=ak;ak=aj;aj=c[l>>2]|0;if((aj|0)==0){J=ak;K=D;L=K;N=0;O=L;P=J;bg(O|0)}f=c[e>>2]|0;if((aj|0)==(f|0)){ao=aj}else{am=f;while(1){f=am-12|0;c[e>>2]=f;if((a[f]&1)==0){ap=f}else{K1(c[am-12+8>>2]|0);ap=c[e>>2]|0}if((aj|0)==(ap|0)){break}else{am=ap}}ao=c[l>>2]|0}K1(ao);J=ak;K=D;L=K;N=0;O=L;P=J;bg(O|0)}function jh(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0;e=i;f=b;g=i;i=i+12|0;i=i+7&-8;h=i;i=i+12|0;i=i+7&-8;j=c[d+52>>2]|0;k=d+48|0;l=c[k>>2]|0;m=(j-l|0)/12|0;L1:do{if((j|0)!=(l|0)){n=g;o=g+8|0;p=g+1|0;q=g|0;r=g+4|0;s=0;t=l;while(1){u=t+(s*12|0)|0;if((a[u]&1)==0){c[n>>2]=c[u>>2];c[n+4>>2]=c[u+4>>2];c[n+8>>2]=c[u+8>>2]}else{u=c[t+(s*12|0)+8>>2]|0;v=c[t+(s*12|0)+4>>2]|0;if(v>>>0>4294967279>>>0){w=6;break}if(v>>>0<11>>>0){a[n]=v<<1;x=p}else{y=v+16&-16;A=K$(y)|0;c[o>>2]=A;c[q>>2]=y|1;c[r>>2]=v;x=A}La(x|0,u|0,v)|0;a[x+v|0]=0}v=(z=0,au(46,g|0)|0);if(z){z=0;w=22;break}B=(a[n]&1)==0;if((v|0)!=6){w=13;break}if(!B){K1(c[o>>2]|0)}v=s+1|0;if(v>>>0>=m>>>0){break L1}s=v;t=c[k>>2]|0}if((w|0)==13){if(B){c[f>>2]=c[n>>2];c[f+4>>2]=c[n+4>>2];c[f+8>>2]=c[n+8>>2];i=e;return}t=c[o>>2]|0;s=c[r>>2]|0;do{if(s>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(s>>>0<11>>>0){a[f]=s<<1;C=b+1|0}else{q=s+16&-16;p=(z=0,au(246,q|0)|0);if(z){z=0;break}c[b+8>>2]=p;c[b>>2]=q|1;c[b+4>>2]=s;C=p}La(C|0,t|0,s)|0;a[C+s|0]=0;if(B){i=e;return}K1(c[o>>2]|0);i=e;return}}while(0);s=bS(-1,-1)|0;D=M;E=s}else if((w|0)==6){DE(0)}else if((w|0)==22){s=bS(-1,-1)|0;D=M;E=s}s=E;t=D;if((a[n]&1)==0){F=t;G=s;H=G;I=0;J=H;K=F;bg(J|0)}K1(c[o>>2]|0);F=t;G=s;H=G;I=0;J=H;K=F;bg(J|0)}}while(0);D=c[d+64>>2]|0;E=d+60|0;d=c[E>>2]|0;B=(D-d|0)/12|0;L48:do{if((D|0)!=(d|0)){C=h;k=h+8|0;m=h+1|0;g=h|0;x=h+4|0;l=0;j=d;while(1){s=j+(l*12|0)|0;if((a[s]&1)==0){c[C>>2]=c[s>>2];c[C+4>>2]=c[s+4>>2];c[C+8>>2]=c[s+8>>2]}else{s=c[j+(l*12|0)+8>>2]|0;t=c[j+(l*12|0)+4>>2]|0;if(t>>>0>4294967279>>>0){w=35;break}if(t>>>0<11>>>0){a[C]=t<<1;L=m}else{r=t+16&-16;p=K$(r)|0;c[k>>2]=p;c[g>>2]=r|1;c[x>>2]=t;L=p}La(L|0,s|0,t)|0;a[L+t|0]=0}t=(z=0,au(46,h|0)|0);if(z){z=0;w=51;break}N=(a[C]&1)==0;if((t|0)!=6){w=42;break}if(!N){K1(c[k>>2]|0)}t=l+1|0;if(t>>>0>=B>>>0){break L48}l=t;j=c[E>>2]|0}if((w|0)==51){j=bS(-1,-1)|0;O=M;P=j}else if((w|0)==35){DE(0)}else if((w|0)==42){if(N){c[f>>2]=c[C>>2];c[f+4>>2]=c[C+4>>2];c[f+8>>2]=c[C+8>>2];i=e;return}j=c[k>>2]|0;l=c[x>>2]|0;do{if(l>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(l>>>0<11>>>0){a[f]=l<<1;Q=b+1|0}else{g=l+16&-16;m=(z=0,au(246,g|0)|0);if(z){z=0;break}c[b+8>>2]=m;c[b>>2]=g|1;c[b+4>>2]=l;Q=m}La(Q|0,j|0,l)|0;a[Q+l|0]=0;if(N){i=e;return}K1(c[k>>2]|0);i=e;return}}while(0);l=bS(-1,-1)|0;O=M;P=l}l=P;j=O;if((a[C]&1)==0){F=j;G=l;H=G;I=0;J=H;K=F;bg(J|0)}K1(c[k>>2]|0);F=j;G=l;H=G;I=0;J=H;K=F;bg(J|0)}}while(0);Ld(f|0,0,12)|0;i=e;return}function ji(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;e=i;i=i+16|0;f=e|0;g=f;h=i;i=i+144|0;j=h+64|0;k=h|0;l=h+8|0;m=l|0;c[m>>2]=14616;n=h+12|0;c[k>>2]=31692;o=h+64|0;c[o>>2]=31712;c[h+4>>2]=0;z=0;as(200,h+64|0,n|0);do{if(!z){c[h+136>>2]=0;c[h+140>>2]=-1;p=h+8|0;c[k>>2]=14596;c[j>>2]=14636;c[m>>2]=14616;q=n|0;c[q>>2]=14920;r=h+16|0;Iv(r);Ld(h+20|0,0,24)|0;c[q>>2]=14776;s=h+44|0;Ld(h+44|0,0,16)|0;c[h+60>>2]=24;Ld(g|0,0,12)|0;z=0;as(214,n|0,f|0);if(z){z=0;t=bS(-1,-1)|0;u=M;if((a[g]&1)!=0){K1(c[f+8>>2]|0)}if((a[s]&1)!=0){K1(c[h+52>>2]|0)}c[q>>2]=14920;z=0;ar(396,r|0);if(!z){v=t;w=u;break}else{z=0}u=bS(-1,-1,0)|0;dk(u)}if((a[g]&1)!=0){K1(c[f+8>>2]|0)}u=c[d+52>>2]|0;t=d+48|0;q=c[t>>2]|0;x=(u-q|0)/12|0;L17:do{if((u|0)==(q|0)){y=30}else{A=l;B=0;while(1){if((B|0)!=0){z=0,aM(106,A|0,42)|0;if(z){z=0;break}}z=0,aM(804,A|0,(c[t>>2]|0)+(B*12|0)|0)|0;if(z){z=0;break}C=B+1|0;if(C>>>0<x>>>0){B=C}else{y=30;break L17}}B=bS(-1,-1)|0;D=M;E=B}}while(0);L26:do{if((y|0)==30){x=d+60|0;t=d+64|0;L28:do{if((c[x>>2]|0)==(c[t>>2]|0)){y=38}else{q=l;z=0,aM(106,q|0,47)|0;if(z){z=0;break}q=c[t>>2]|0;u=c[x>>2]|0;B=(q-u|0)/12|0;if((q|0)==(u|0)){y=38;break}u=l;q=0;while(1){if((q|0)!=0){z=0,aM(106,u|0,42)|0;if(z){z=0;break}}z=0,aM(804,u|0,(c[x>>2]|0)+(q*12|0)|0)|0;if(z){z=0;break}A=q+1|0;if(A>>>0<B>>>0){q=A}else{y=38;break L28}}q=bS(-1,-1)|0;D=M;E=q;break L26}}while(0);do{if((y|0)==38){z=0;as(570,b|0,n|0);if(z){z=0;break}c[k>>2]=14596;c[o>>2]=14636;c[p>>2]=14616;x=h+12|0;c[x>>2]=14776;if((a[s]&1)!=0){K1(c[h+52>>2]|0)}c[x>>2]=14920;z=0;ar(396,r|0);if(!z){D2(h+64|0);i=e;return}else{z=0}x=bS(-1,-1)|0;z=0;ar(272,h+64|0);if(!z){bg(x|0)}else{z=0;x=bS(-1,-1,0)|0;dk(x)}}}while(0);x=bS(-1,-1)|0;D=M;E=x}}while(0);c[k>>2]=14596;c[o>>2]=14636;c[p>>2]=14616;x=h+12|0;c[x>>2]=14776;if((a[s]&1)!=0){K1(c[h+52>>2]|0)}c[x>>2]=14920;z=0;ar(396,r|0);if(z){z=0;x=bS(-1,-1,0)|0;t=M;z=0;ar(272,h+64|0);if(!z){F=t;G=x;H=G;dk(H)}else{z=0;x=bS(-1,-1,0)|0;dk(x)}}z=0;ar(272,h+64|0);if(!z){bg(E|0)}else{z=0}x=bS(-1,-1,0)|0;F=M;G=x;H=G;dk(H)}else{z=0;x=bS(-1,-1)|0;v=x;w=M}}while(0);z=0;ar(272,j|0);if(!z){bg(v|0)}else{z=0;v=bS(-1,-1,0)|0;dk(v)}}function jj(a){a=a|0;j0(a);return}function jk(a,b){a=a|0;b=b|0;return b|0}function jl(a,b){a=a|0;b=b|0;return b|0}function jm(a,b){a=a|0;b=b|0;return b|0}function jn(a,b){a=a|0;b=b|0;return b|0}function jo(a,b){a=a|0;b=b|0;return b|0}function jp(a,b){a=a|0;b=b|0;return b|0}function jq(a,b){a=a|0;b=b|0;return b|0}function jr(a,b){a=a|0;b=b|0;return b|0}function js(a,b){a=a|0;b=b|0;return b|0}function jt(a,b){a=a|0;b=b|0;return b|0}function ju(a,b){a=a|0;b=b|0;return b|0}function jv(a,b){a=a|0;b=b|0;return b|0}function jw(a,b){a=a|0;b=b|0;return b|0}function jx(a,b){a=a|0;b=b|0;return b|0}function jy(a,b){a=a|0;b=b|0;return b|0}function jz(a,b){a=a|0;b=b|0;return b|0}function jA(a,b){a=a|0;b=b|0;return b|0}function jB(a,b){a=a|0;b=b|0;return b|0}function jC(a,b){a=a|0;b=b|0;return b|0}function jD(a,b){a=a|0;b=b|0;return b|0}function jE(a,b){a=a|0;b=b|0;return b|0}function jF(a,b){a=a|0;b=b|0;return b|0}function jG(a,b){a=a|0;b=b|0;return b|0}function jH(a,b){a=a|0;b=b|0;return b|0}function jI(a,b){a=a|0;b=b|0;return b|0}function jJ(a,b){a=a|0;b=b|0;return b|0}function jK(a,b){a=a|0;b=b|0;return b|0}function jL(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=a+4|0;e=a|0;f=c[e>>2]|0;g=f;h=(c[d>>2]|0)-g|0;i=h>>2;j=i+1|0;if(j>>>0>1073741823>>>0){Ip(0)}k=a+8|0;a=(c[k>>2]|0)-g|0;if(a>>2>>>0>536870910>>>0){l=1073741823;m=5}else{g=a>>1;a=g>>>0<j>>>0?j:g;if((a|0)==0){n=0;o=0}else{l=a;m=5}}if((m|0)==5){n=K$(l<<2)|0;o=l}l=n+(i<<2)|0;if((l|0)!=0){c[l>>2]=c[b>>2]}b=f;La(n|0,b|0,h)|0;c[e>>2]=n;c[d>>2]=n+(j<<2);c[k>>2]=n+(o<<2);if((f|0)==0){return}K1(b);return}function jM(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=a+4|0;e=a|0;f=c[e>>2]|0;g=f;h=(c[d>>2]|0)-g|0;i=h>>2;j=i+1|0;if(j>>>0>1073741823>>>0){Ip(0)}k=a+8|0;a=(c[k>>2]|0)-g|0;if(a>>2>>>0>536870910>>>0){l=1073741823;m=5}else{g=a>>1;a=g>>>0<j>>>0?j:g;if((a|0)==0){n=0;o=0}else{l=a;m=5}}if((m|0)==5){n=K$(l<<2)|0;o=l}l=n+(i<<2)|0;if((l|0)!=0){c[l>>2]=c[b>>2]}b=f;La(n|0,b|0,h)|0;c[e>>2]=n;c[d>>2]=n+(j<<2);c[k>>2]=n+(o<<2);if((f|0)==0){return}K1(b);return}function jN(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;e=c[b+4>>2]|0;if((e|0)==0){f=0;return f|0}b=a[d]|0;g=b&255;h=(g&1|0)==0;i=g>>>1;g=(b&1)==0;b=d+1|0;j=d+8|0;k=d+4|0;d=e;while(1){e=d+16|0;if(h){l=i}else{l=c[k>>2]|0}m=e;n=a[e]|0;e=n&255;o=(e&1|0)==0;if(o){p=e>>>1}else{p=c[d+20>>2]|0}if(g){q=b}else{q=c[j>>2]|0}r=(n&1)==0;if(r){s=m+1|0}else{s=c[d+24>>2]|0}n=Lc(q|0,s|0,(p>>>0<l>>>0?p:l)|0)|0;if((n|0)==0){if(l>>>0<p>>>0){t=16}else{t=17}}else{if((n|0)<0){t=16}else{t=17}}if((t|0)==17){t=0;if(o){u=e>>>1}else{u=c[d+20>>2]|0}if(h){v=i}else{v=c[k>>2]|0}if(r){w=m+1|0}else{w=c[d+24>>2]|0}if(g){x=b}else{x=c[j>>2]|0}m=Lc(w|0,x|0,(v>>>0<u>>>0?v:u)|0)|0;if((m|0)==0){if(u>>>0>=v>>>0){f=1;t=33;break}}else{if((m|0)>=0){f=1;t=35;break}}y=d+4|0}else if((t|0)==16){t=0;y=d|0}m=c[y>>2]|0;if((m|0)==0){f=0;t=36;break}else{d=m}}if((t|0)==35){return f|0}else if((t|0)==36){return f|0}else if((t|0)==33){return f|0}return 0}function jO(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;f=d;g=(e-f|0)/12|0;h=b+8|0;i=c[h>>2]|0;j=b|0;k=c[j>>2]|0;l=k;if(g>>>0>((i-l|0)/12|0)>>>0){if((k|0)==0){m=i}else{i=b+4|0;n=c[i>>2]|0;if((k|0)==(n|0)){o=k}else{p=n;while(1){n=p-12|0;c[i>>2]=n;if((a[n]&1)==0){q=n}else{K1(c[p-12+8>>2]|0);q=c[i>>2]|0}if((k|0)==(q|0)){break}else{p=q}}o=c[j>>2]|0}K1(o);c[h>>2]=0;c[i>>2]=0;c[j>>2]=0;m=0}if(g>>>0>357913941>>>0){Ip(0)}i=(m|0)/12|0;do{if(i>>>0>178956969>>>0){r=357913941}else{m=i<<1;o=m>>>0<g>>>0?g:m;if(o>>>0<=357913941>>>0){r=o;break}Ip(0)}}while(0);i=K$(r*12|0)|0;o=b+4|0;c[o>>2]=i;c[j>>2]=i;c[h>>2]=i+(r*12|0);if((d|0)==(e|0)){return}else{s=d;t=i}L23:while(1){do{if((t|0)!=0){i=s;if((a[i]&1)==0){r=t;c[r>>2]=c[i>>2];c[r+4>>2]=c[i+4>>2];c[r+8>>2]=c[i+8>>2];break}i=c[s+8>>2]|0;r=c[s+4>>2]|0;if(r>>>0>4294967279>>>0){u=42;break L23}if(r>>>0<11>>>0){a[t]=r<<1;v=t+1|0}else{h=r+16&-16;j=K$(h)|0;c[t+8>>2]=j;c[t>>2]=h|1;c[t+4>>2]=r;v=j}La(v|0,i|0,r)|0;a[v+r|0]=0}}while(0);r=(c[o>>2]|0)+12|0;c[o>>2]=r;i=s+12|0;if((i|0)==(e|0)){u=54;break}else{s=i;t=r}}if((u|0)==42){DE(0)}else if((u|0)==54){return}}t=b+4|0;b=((c[t>>2]|0)-l|0)/12|0;if(g>>>0>b>>>0){w=1;x=d+(b*12|0)|0}else{w=0;x=e}if((x|0)==(d|0)){y=k}else{b=(((x-12+(-f|0)|0)>>>0)/12|0)+1|0;f=k;g=d;while(1){DL(f,g)|0;d=g+12|0;if((d|0)==(x|0)){break}else{f=f+12|0;g=d}}y=k+(b*12|0)|0}if(!w){w=c[t>>2]|0;if((y|0)==(w|0)){return}else{z=w}while(1){w=z-12|0;c[t>>2]=w;if((a[w]&1)==0){A=w}else{K1(c[z-12+8>>2]|0);A=c[t>>2]|0}if((y|0)==(A|0)){break}else{z=A}}return}if((x|0)==(e|0)){return}A=x;x=c[t>>2]|0;L63:while(1){do{if((x|0)!=0){z=A;if((a[z]&1)==0){y=x;c[y>>2]=c[z>>2];c[y+4>>2]=c[z+4>>2];c[y+8>>2]=c[z+8>>2];break}z=c[A+8>>2]|0;y=c[A+4>>2]|0;if(y>>>0>4294967279>>>0){u=16;break L63}if(y>>>0<11>>>0){a[x]=y<<1;B=x+1|0}else{w=y+16&-16;b=K$(w)|0;c[x+8>>2]=b;c[x>>2]=w|1;c[x+4>>2]=y;B=b}La(B|0,z|0,y)|0;a[B+y|0]=0}}while(0);y=(c[t>>2]|0)+12|0;c[t>>2]=y;z=A+12|0;if((z|0)==(e|0)){u=51;break}else{A=z;x=y}}if((u|0)==16){DE(0)}else if((u|0)==51){return}}function jP(b){b=b|0;c[b>>2]=16664;if((a[b+4|0]&1)==0){return}K1(c[b+12>>2]|0);return}function jQ(b){b=b|0;var d=0;c[b>>2]=16664;if((a[b+4|0]&1)==0){d=b;K1(d);return}K1(c[b+12>>2]|0);d=b;K1(d);return}function jR(a,b){a=a|0;b=b|0;cA[c[(c[b>>2]|0)+148>>2]&1023](b,a);return}function jS(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+148>>2]&1023](b,a)|0}function jT(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+148>>2]&1023](b,a)|0}function jU(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+148>>2]&1023](b,a)|0}function jV(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+148>>2]&1023](b,a)|0}function jW(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+148>>2]&511](a,d,b);return}function jX(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+148>>2]&511](a,d,b);return}function jY(a){a=a|0;return 0}function jZ(b,c){b=b|0;c=c|0;c=b;a[b]=8;b=c+1|0;E=1819047278;a[b]=E;E=E>>8;a[b+1|0]=E;E=E>>8;a[b+2|0]=E;E=E>>8;a[b+3|0]=E;a[c+5|0]=0;return}function j_(a){a=a|0;return 1}function j$(a){a=a|0;return 1}function j0(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;d=b|0;c[d>>2]=17616;e=b+60|0;f=c[e>>2]|0;if((f|0)!=0){g=b+64|0;h=c[g>>2]|0;if((f|0)==(h|0)){i=f}else{j=h;while(1){h=j-12|0;c[g>>2]=h;if((a[h]&1)==0){k=h}else{K1(c[j-12+8>>2]|0);k=c[g>>2]|0}if((f|0)==(k|0)){break}else{j=k}}i=c[e>>2]|0}K1(i)}i=b+48|0;e=c[i>>2]|0;if((e|0)!=0){k=b+52|0;j=c[k>>2]|0;if((e|0)==(j|0)){l=e}else{f=j;while(1){j=f-12|0;c[k>>2]=j;if((a[j]&1)==0){m=j}else{K1(c[f-12+8>>2]|0);m=c[k>>2]|0}if((e|0)==(m|0)){break}else{f=m}}l=c[i>>2]|0}K1(l)}c[d>>2]=16664;if((a[b+4|0]&1)==0){return}K1(c[b+12>>2]|0);return}function j1(a){a=a|0;var b=0;z=0;ar(492,a|0);if(!z){K1(a);return}else{z=0;b=bS(-1,-1)|0;K1(a);bg(b|0)}}function j2(a,b){a=a|0;b=b|0;cA[c[(c[b>>2]|0)+120>>2]&1023](b,a);return}function j3(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+120>>2]&1023](b,a)|0}function j4(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+120>>2]&1023](b,a)|0}function j5(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+120>>2]&1023](b,a)|0}function j6(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+120>>2]&1023](b,a)|0}function j7(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+120>>2]&511](a,d,b);return}function j8(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+120>>2]&511](a,d,b);return}function j9(b,c){b=b|0;c=c|0;c=b;a[b]=12;b=c+1|0;a[b]=a[7568]|0;a[b+1|0]=a[7569]|0;a[b+2|0]=a[7570]|0;a[b+3|0]=a[7571]|0;a[b+4|0]=a[7572]|0;a[b+5|0]=a[7573]|0;a[c+7|0]=0;return}function ka(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0;e=i;i=i+40|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=e+32|0;a[g]=d;d=h|0;a[d]=0;c[h+4>>2]=b;l=b;m=c[(c[l>>2]|0)-12>>2]|0;n=b;L1:do{if((c[n+(m+16)>>2]|0)==0){o=c[n+(m+72)>>2]|0;if((o|0)!=0){z=0,au(62,o|0)|0;if(z){z=0;p=15;break}}a[d]=1;o=c[(c[l>>2]|0)-12>>2]|0;c[j>>2]=c[n+(o+24)>>2];q=n+o|0;r=g+1|0;s=(c[n+(o+4)>>2]&176|0)==32?r:g;t=n+(o+76)|0;o=c[t>>2]|0;u=o&255;L6:do{if((o|0)==-1){z=0;as(348,f|0,q|0);if(z){z=0;p=16;break}v=(z=0,aM(198,f|0,40880)|0);do{if(!z){w=(z=0,aM(c[(c[v>>2]|0)+28>>2]|0,v|0,32)|0);if(z){z=0;break}z=0;ar(396,f|0);if(z){z=0;p=16;break L6}c[t>>2]=w<<24>>24;x=w;p=12;break L6}else{z=0}}while(0);v=bS(-1,-1,0)|0;w=M;z=0;ar(396,f|0);if(!z){y=w;A=v;break}else{z=0}v=bS(-1,-1,0)|0;dk(v);return 0}else{x=u;p=12}}while(0);do{if((p|0)==12){z=0;aI(56,k|0,j|0,g|0,s|0,r|0,q|0,x|0);if(z){z=0;p=16;break}if((c[k>>2]|0)!=0){p=18;break L1}u=c[(c[l>>2]|0)-12>>2]|0;z=0;as(364,n+u|0,c[n+(u+16)>>2]|5|0);if(!z){p=18;break L1}else{z=0;p=16}}}while(0);if((p|0)==16){q=bS(-1,-1,0)|0;y=M;A=q}z=0;ar(140,h|0);if(!z){B=A;break}else{z=0}C=bS(-1,-1,0)|0;D=M;E=C;dk(E);return 0}else{p=18}}while(0);do{if((p|0)==18){z=0;ar(140,h|0);if(z){z=0;p=15;break}i=e;return b|0}}while(0);if((p|0)==15){p=bS(-1,-1,0)|0;B=p}bC(B|0)|0;z=0;ar(184,n+(c[(c[l>>2]|0)-12>>2]|0)|0);if(!z){a$();i=e;return b|0}else{z=0}b=bS(-1,-1)|0;z=0;aS(2);if(!z){bg(b|0)}else{z=0;C=bS(-1,-1,0)|0;D=M;E=C;dk(E);return 0}return 0}function kb(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;f=i;i=i+32|0;g=e;e=i;i=i+12|0;i=i+7&-8;c[e>>2]=c[g>>2];c[e+4>>2]=c[g+4>>2];c[e+8>>2]=c[g+8>>2];g=f|0;h=f+16|0;j=b|0;k=d;if((a[k]&1)==0){l=g;c[l>>2]=c[k>>2];c[l+4>>2]=c[k+4>>2];c[l+8>>2]=c[k+8>>2]}else{k=c[d+8>>2]|0;l=c[d+4>>2]|0;if(l>>>0>4294967279>>>0){DE(0)}if(l>>>0<11>>>0){a[g]=l<<1;m=g+1|0}else{d=l+16&-16;n=K$(d)|0;c[g+8>>2]=n;c[g>>2]=d|1;c[g+4>>2]=l;m=n}La(m|0,k|0,l)|0;a[m+l|0]=0}l=h;m=e;c[l>>2]=c[m>>2];c[l+4>>2]=c[m+4>>2];c[l+8>>2]=c[m+8>>2];z=0;aD(6,j|0,g|0,h|0,0,0,0);if(!z){if((a[g]&1)==0){o=b+36|0;p=b+40|0;c[p>>2]=0;q=b+44|0;c[q>>2]=0;r=b+48|0;c[r>>2]=0;s=b|0;c[s>>2]=16360;c[o>>2]=16424;t=b+52|0;a[t]=0;u=b+53|0;a[u]=0;i=f;return}K1(c[g+8>>2]|0);o=b+36|0;p=b+40|0;c[p>>2]=0;q=b+44|0;c[q>>2]=0;r=b+48|0;c[r>>2]=0;s=b|0;c[s>>2]=16360;c[o>>2]=16424;t=b+52|0;a[t]=0;u=b+53|0;a[u]=0;i=f;return}else{z=0;f=bS(-1,-1)|0;if((a[g]&1)==0){bg(f|0)}K1(c[g+8>>2]|0);bg(f|0)}}function kc(b){b=b|0;var d=0,e=0,f=0,g=0;c[b+36>>2]=21696;d=c[b+40>>2]|0;e=d;if((d|0)!=0){f=b+44|0;g=c[f>>2]|0;if((d|0)!=(g|0)){c[f>>2]=g+(~((g-4+(-e|0)|0)>>>2)<<2)}K1(d)}c[b>>2]=16664;if((a[b+4|0]&1)==0){return}K1(c[b+12>>2]|0);return}function kd(b){b=b|0;var d=0,e=0,f=0,g=0,h=0;c[b+36>>2]=21696;d=c[b+40>>2]|0;e=d;if((d|0)!=0){f=b+44|0;g=c[f>>2]|0;if((d|0)!=(g|0)){c[f>>2]=g+(~((g-4+(-e|0)|0)>>>2)<<2)}K1(d)}c[b>>2]=16664;if((a[b+4|0]&1)==0){h=b;K1(h);return}K1(c[b+12>>2]|0);h=b;K1(h);return}function ke(a,b){a=a|0;b=b|0;cA[c[(c[b>>2]|0)+164>>2]&1023](b,a);return}function kf(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+164>>2]&1023](b,a)|0}function kg(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+164>>2]&1023](b,a)|0}function kh(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+164>>2]&1023](b,a)|0}function ki(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+164>>2]&1023](b,a)|0}function kj(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+164>>2]&511](a,d,b);return}function kk(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+164>>2]&511](a,d,b);return}function kl(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0;e=i;i=i+256|0;f=e|0;g=e+16|0;h=e+32|0;j=e+48|0;k=e+64|0;l=e+80|0;m=e+96|0;n=e+112|0;o=e+128|0;p=e+144|0;q=e+160|0;r=e+176|0;s=e+192|0;t=e+208|0;u=e+224|0;v=e+240|0;w=d+40|0;if((a[w]&1)==0){x=f;c[x>>2]=c[w>>2];c[x+4>>2]=c[w+4>>2];c[x+8>>2]=c[w+8>>2];y=a[x]|0;A=x}else{x=c[d+48>>2]|0;w=c[d+44>>2]|0;if(w>>>0>4294967279>>>0){DE(0)}if(w>>>0<11>>>0){B=w<<1&255;C=f;a[C]=B;D=f+1|0;E=B;F=C}else{C=w+16&-16;B=K$(C)|0;c[f+8>>2]=B;G=C|1;c[f>>2]=G;c[f+4>>2]=w;D=B;E=G&255;F=f}La(D|0,x|0,w)|0;a[D+w|0]=0;y=E;A=F}F=y&255;if((F&1|0)==0){H=F>>>1}else{H=c[f+4>>2]|0}if((a[A]&1)!=0){K1(c[f+8>>2]|0)}if((H|0)!=0){L21:do{if((a[b+53|0]&1)!=0){H=K$(64)|0;f=g+8|0;c[f>>2]=H;c[g>>2]=65;c[g+4>>2]=53;La(H|0,7296,53)|0;a[H+53|0]=0;H=d+4|0;L23:do{if((a[H]&1)==0){A=h;c[A>>2]=c[H>>2];c[A+4>>2]=c[H+4>>2];c[A+8>>2]=c[H+8>>2];I=26}else{A=c[d+12>>2]|0;F=c[d+8>>2]|0;do{if(F>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(F>>>0<11>>>0){a[h]=F<<1;J=h+1|0}else{y=F+16&-16;E=(z=0,au(246,y|0)|0);if(z){z=0;break}c[h+8>>2]=E;c[h>>2]=y|1;c[h+4>>2]=F;J=E}La(J|0,A|0,F)|0;a[J+F|0]=0;I=26;break L23}}while(0);F=bS(-1,-1)|0;K=M;L=F}}while(0);do{if((I|0)==26){H=j;F=d+16|0;c[H>>2]=c[F>>2];c[H+4>>2]=c[F+4>>2];c[H+8>>2]=c[F+8>>2];z=0;aR(372,g|0,h|0,j|0);if(z){z=0;F=bS(-1,-1)|0;H=F;F=M;if((a[h]&1)==0){K=F;L=H;break}K1(c[h+8>>2]|0);K=F;L=H;break}if((a[h]&1)!=0){K1(c[h+8>>2]|0)}if((a[g]&1)==0){break L21}K1(c[f>>2]|0);break L21}}while(0);if((a[g]&1)==0){N=K;O=L;P=O;Q=0;R=P;S=N;bg(R|0)}K1(c[f>>2]|0);N=K;O=L;P=O;Q=0;R=P;S=N;bg(R|0)}}while(0);a[b+52|0]=1;i=e;return}L=b+53|0;K=(a[L]&1)!=0;if((a[d+52|0]&1)!=0){L56:do{if(K){g=K$(80)|0;h=k+8|0;c[h>>2]=g;c[k>>2]=81;c[k+4>>2]=73;La(g|0,7e3,73)|0;a[g+73|0]=0;g=d+4|0;L58:do{if((a[g]&1)==0){j=l;c[j>>2]=c[g>>2];c[j+4>>2]=c[g+4>>2];c[j+8>>2]=c[g+8>>2];I=49}else{j=c[d+12>>2]|0;J=c[d+8>>2]|0;do{if(J>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(J>>>0<11>>>0){a[l]=J<<1;T=l+1|0}else{H=J+16&-16;F=(z=0,au(246,H|0)|0);if(z){z=0;break}c[l+8>>2]=F;c[l>>2]=H|1;c[l+4>>2]=J;T=F}La(T|0,j|0,J)|0;a[T+J|0]=0;I=49;break L58}}while(0);J=bS(-1,-1)|0;U=M;V=J}}while(0);do{if((I|0)==49){g=m;f=d+16|0;c[g>>2]=c[f>>2];c[g+4>>2]=c[f+4>>2];c[g+8>>2]=c[f+8>>2];z=0;aR(372,k|0,l|0,m|0);if(z){z=0;f=bS(-1,-1)|0;g=f;f=M;if((a[l]&1)==0){U=f;V=g;break}K1(c[l+8>>2]|0);U=f;V=g;break}if((a[l]&1)!=0){K1(c[l+8>>2]|0)}if((a[k]&1)==0){break L56}K1(c[h>>2]|0);break L56}}while(0);if((a[k]&1)==0){N=U;O=V;P=O;Q=0;R=P;S=N;bg(R|0)}K1(c[h>>2]|0);N=U;O=V;P=O;Q=0;R=P;S=N;bg(R|0)}}while(0);L87:do{if((a[b+52|0]&1)!=0){V=K$(96)|0;U=n+8|0;c[U>>2]=V;c[n>>2]=97;c[n+4>>2]=94;La(V|0,6808,94)|0;a[V+94|0]=0;V=d+4|0;L89:do{if((a[V]&1)==0){k=o;c[k>>2]=c[V>>2];c[k+4>>2]=c[V+4>>2];c[k+8>>2]=c[V+8>>2];I=70}else{k=c[d+12>>2]|0;l=c[d+8>>2]|0;do{if(l>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(l>>>0<11>>>0){a[o]=l<<1;W=o+1|0}else{m=l+16&-16;T=(z=0,au(246,m|0)|0);if(z){z=0;break}c[o+8>>2]=T;c[o>>2]=m|1;c[o+4>>2]=l;W=T}La(W|0,k|0,l)|0;a[W+l|0]=0;I=70;break L89}}while(0);l=bS(-1,-1)|0;X=M;Y=l}}while(0);do{if((I|0)==70){V=p;h=d+16|0;c[V>>2]=c[h>>2];c[V+4>>2]=c[h+4>>2];c[V+8>>2]=c[h+8>>2];z=0;aR(372,n|0,o|0,p|0);if(z){z=0;h=bS(-1,-1)|0;V=h;h=M;if((a[o]&1)==0){X=h;Y=V;break}K1(c[o+8>>2]|0);X=h;Y=V;break}if((a[o]&1)!=0){K1(c[o+8>>2]|0)}if((a[n]&1)==0){break L87}K1(c[U>>2]|0);break L87}}while(0);if((a[n]&1)==0){N=X;O=Y;P=O;Q=0;R=P;S=N;bg(R|0)}K1(c[U>>2]|0);N=X;O=Y;P=O;Q=0;R=P;S=N;bg(R|0)}}while(0);a[L]=1;i=e;return}L120:do{if(K){L=K$(64)|0;Y=q+8|0;c[Y>>2]=L;c[q>>2]=65;c[q+4>>2]=56;La(L|0,6536,56)|0;a[L+56|0]=0;L=d+4|0;L122:do{if((a[L]&1)==0){X=r;c[X>>2]=c[L>>2];c[X+4>>2]=c[L+4>>2];c[X+8>>2]=c[L+8>>2];I=92}else{X=c[d+12>>2]|0;n=c[d+8>>2]|0;do{if(n>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(n>>>0<11>>>0){a[r]=n<<1;Z=r+1|0}else{o=n+16&-16;p=(z=0,au(246,o|0)|0);if(z){z=0;break}c[r+8>>2]=p;c[r>>2]=o|1;c[r+4>>2]=n;Z=p}La(Z|0,X|0,n)|0;a[Z+n|0]=0;I=92;break L122}}while(0);n=bS(-1,-1)|0;_=M;$=n}}while(0);do{if((I|0)==92){L=s;U=d+16|0;c[L>>2]=c[U>>2];c[L+4>>2]=c[U+4>>2];c[L+8>>2]=c[U+8>>2];z=0;aR(372,q|0,r|0,s|0);if(z){z=0;U=bS(-1,-1)|0;L=U;U=M;if((a[r]&1)==0){_=U;$=L;break}K1(c[r+8>>2]|0);_=U;$=L;break}if((a[r]&1)!=0){K1(c[r+8>>2]|0)}if((a[q]&1)==0){break L120}K1(c[Y>>2]|0);break L120}}while(0);if((a[q]&1)==0){N=_;O=$;P=O;Q=0;R=P;S=N;bg(R|0)}K1(c[Y>>2]|0);N=_;O=$;P=O;Q=0;R=P;S=N;bg(R|0)}}while(0);if((a[b+52|0]&1)==0){i=e;return}b=K$(48)|0;$=t+8|0;c[$>>2]=b;c[t>>2]=49;c[t+4>>2]=46;La(b|0,6368,46)|0;a[b+46|0]=0;b=d+4|0;L154:do{if((a[b]&1)==0){_=u;c[_>>2]=c[b>>2];c[_+4>>2]=c[b+4>>2];c[_+8>>2]=c[b+8>>2];I=113}else{_=c[d+12>>2]|0;q=c[d+8>>2]|0;do{if(q>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(q>>>0<11>>>0){a[u]=q<<1;aa=u+1|0}else{r=q+16&-16;s=(z=0,au(246,r|0)|0);if(z){z=0;break}c[u+8>>2]=s;c[u>>2]=r|1;c[u+4>>2]=q;aa=s}La(aa|0,_|0,q)|0;a[aa+q|0]=0;I=113;break L154}}while(0);q=bS(-1,-1)|0;ab=M;ac=q}}while(0);do{if((I|0)==113){aa=v;b=d+16|0;c[aa>>2]=c[b>>2];c[aa+4>>2]=c[b+4>>2];c[aa+8>>2]=c[b+8>>2];z=0;aR(372,t|0,u|0,v|0);if(z){z=0;b=bS(-1,-1)|0;aa=b;b=M;if((a[u]&1)==0){ab=b;ac=aa;break}K1(c[u+8>>2]|0);ab=b;ac=aa;break}if((a[u]&1)!=0){K1(c[u+8>>2]|0)}if((a[t]&1)==0){i=e;return}K1(c[$>>2]|0);i=e;return}}while(0);if((a[t]&1)==0){N=ab;O=ac;P=O;Q=0;R=P;S=N;bg(R|0)}K1(c[$>>2]|0);N=ab;O=ac;P=O;Q=0;R=P;S=N;bg(R|0)}function km(a,b){a=a|0;b=b|0;kl(a-56+20|0,b);return}function kn(b){b=b|0;var d=0,e=0,f=0,g=0;d=b-56+20|0;c[d+36>>2]=21696;b=c[d+40>>2]|0;e=b;if((b|0)!=0){f=d+44|0;g=c[f>>2]|0;if((b|0)!=(g|0)){c[f>>2]=g+(~((g-4+(-e|0)|0)>>>2)<<2)}K1(b)}c[d>>2]=16664;if((a[d+4|0]&1)==0){return}K1(c[d+12>>2]|0);return}function ko(b){b=b|0;var d=0,e=0,f=0,g=0,h=0;d=b-56+20|0;c[d+36>>2]=21696;b=c[d+40>>2]|0;e=b;if((b|0)!=0){f=d+44|0;g=c[f>>2]|0;if((b|0)!=(g|0)){c[f>>2]=g+(~((g-4+(-e|0)|0)>>>2)<<2)}K1(b)}c[d>>2]=16664;if((a[d+4|0]&1)==0){h=d;K1(h);return}K1(c[d+12>>2]|0);h=d;K1(h);return}function kp(a,b){a=a|0;b=b|0;return}function kq(b){b=b|0;c[b>>2]=16664;if((a[b+4|0]&1)==0){return}K1(c[b+12>>2]|0);return}function kr(b){b=b|0;var d=0;c[b>>2]=16664;if((a[b+4|0]&1)==0){d=b;K1(d);return}K1(c[b+12>>2]|0);d=b;K1(d);return}function ks(a,b){a=a|0;b=b|0;cA[c[(c[b>>2]|0)+144>>2]&1023](b,a);return}function kt(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+144>>2]&1023](b,a)|0}function ku(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+144>>2]&1023](b,a)|0}function kv(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+144>>2]&1023](b,a)|0}function kw(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+144>>2]&1023](b,a)|0}function kx(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+144>>2]&511](a,d,b);return}function ky(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+144>>2]&511](a,d,b);return}function kz(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0;k=i;i=i+32|0;l=e;e=i;i=i+12|0;i=i+7&-8;c[e>>2]=c[l>>2];c[e+4>>2]=c[l+4>>2];c[e+8>>2]=c[l+8>>2];l=k|0;m=k+16|0;n=b|0;o=d;if((a[o]&1)==0){p=l;c[p>>2]=c[o>>2];c[p+4>>2]=c[o+4>>2];c[p+8>>2]=c[o+8>>2]}else{o=c[d+8>>2]|0;p=c[d+4>>2]|0;if(p>>>0>4294967279>>>0){DE(0)}if(p>>>0<11>>>0){a[l]=p<<1;q=l+1|0}else{d=p+16&-16;r=K$(d)|0;c[l+8>>2]=r;c[l>>2]=d|1;c[l+4>>2]=p;q=r}La(q|0,o|0,p)|0;a[q+p|0]=0}p=m;q=e;c[p>>2]=c[q>>2];c[p+4>>2]=c[q+4>>2];c[p+8>>2]=c[q+8>>2];z=0;aD(6,n|0,l|0,m|0,0,0,0);if(z){z=0;m=bS(-1,-1)|0;n=m;m=M;if((a[l]&1)==0){s=m;t=n;u=t;v=0;w=u;x=s;bg(w|0)}K1(c[l+8>>2]|0);s=m;t=n;u=t;v=0;w=u;x=s;bg(w|0)}if((a[l]&1)!=0){K1(c[l+8>>2]|0)}l=b+36|0;c[l>>2]=21728;n=b+40|0;c[n>>2]=0;m=b+44|0;c[m>>2]=0;q=b+48|0;c[q>>2]=0;if((g|0)==0){y=b|0;c[y>>2]=21352;c[l>>2]=21412;A=b+52|0;c[A>>2]=f;B=b+56|0;C=h&1;a[B]=C;D=b+57|0;E=j&1;a[D]=E;i=k;return}p=(z=0,au(246,g<<2|0)|0);if(!z){e=p;c[n>>2]=e;c[m>>2]=e;c[q>>2]=e+(g<<2);y=b|0;c[y>>2]=21352;c[l>>2]=21412;A=b+52|0;c[A>>2]=f;B=b+56|0;C=h&1;a[B]=C;D=b+57|0;E=j&1;a[D]=E;i=k;return}else{z=0}k=bS(-1,-1)|0;E=k;k=M;c[b>>2]=16664;if((a[b+4|0]&1)==0){s=k;t=E;u=t;v=0;w=u;x=s;bg(w|0)}K1(c[b+12>>2]|0);s=k;t=E;u=t;v=0;w=u;x=s;bg(w|0)}function kA(b){b=b|0;var d=0,e=0,f=0,g=0;c[b+36>>2]=21728;d=c[b+40>>2]|0;e=d;if((d|0)!=0){f=b+44|0;g=c[f>>2]|0;if((d|0)!=(g|0)){c[f>>2]=g+(~((g-4+(-e|0)|0)>>>2)<<2)}K1(d)}c[b>>2]=16664;if((a[b+4|0]&1)==0){return}K1(c[b+12>>2]|0);return}function kB(b){b=b|0;var d=0,e=0,f=0,g=0,h=0;c[b+36>>2]=21728;d=c[b+40>>2]|0;e=d;if((d|0)!=0){f=b+44|0;g=c[f>>2]|0;if((d|0)!=(g|0)){c[f>>2]=g+(~((g-4+(-e|0)|0)>>>2)<<2)}K1(d)}c[b>>2]=16664;if((a[b+4|0]&1)==0){h=b;K1(h);return}K1(c[b+12>>2]|0);h=b;K1(h);return}function kC(a,b){a=a|0;b=b|0;cA[c[(c[b>>2]|0)+140>>2]&1023](b,a);return}function kD(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+140>>2]&1023](b,a)|0}function kE(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+140>>2]&1023](b,a)|0}function kF(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+140>>2]&1023](b,a)|0}function kG(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+140>>2]&1023](b,a)|0}function kH(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+140>>2]&511](a,d,b);return}function kI(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+140>>2]&511](a,d,b);return}function kJ(a,b){a=a|0;b=b|0;return}function kK(b){b=b|0;var d=0,e=0,f=0,g=0;d=b-60+24|0;c[d+36>>2]=21728;b=c[d+40>>2]|0;e=b;if((b|0)!=0){f=d+44|0;g=c[f>>2]|0;if((b|0)!=(g|0)){c[f>>2]=g+(~((g-4+(-e|0)|0)>>>2)<<2)}K1(b)}c[d>>2]=16664;if((a[d+4|0]&1)==0){return}K1(c[d+12>>2]|0);return}function kL(b){b=b|0;var d=0,e=0,f=0,g=0,h=0;d=b-60+24|0;c[d+36>>2]=21728;b=c[d+40>>2]|0;e=b;if((b|0)!=0){f=d+44|0;g=c[f>>2]|0;if((b|0)!=(g|0)){c[f>>2]=g+(~((g-4+(-e|0)|0)>>>2)<<2)}K1(b)}c[d>>2]=16664;if((a[d+4|0]&1)==0){h=d;K1(h);return}K1(c[d+12>>2]|0);h=d;K1(h);return}function kM(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;f=b|0;c[f>>2]=16664;g=b+4|0;h=e+4|0;if((a[h]&1)==0){i=g;c[i>>2]=c[h>>2];c[i+4>>2]=c[h+4>>2];c[i+8>>2]=c[h+8>>2]}else{h=c[e+12>>2]|0;i=c[e+8>>2]|0;if(i>>>0>4294967279>>>0){DE(0)}if(i>>>0<11>>>0){a[g]=i<<1;j=g+1|0}else{k=i+16&-16;l=K$(k)|0;c[b+12>>2]=l;c[g>>2]=k|1;c[b+8>>2]=i;j=l}La(j|0,h|0,i)|0;a[j+i|0]=0}i=b+16|0;j=e+16|0;c[i>>2]=c[j>>2];c[i+4>>2]=c[j+4>>2];c[i+8>>2]=c[j+8>>2];c[f>>2]=22e3;j=e+28|0;i=b+28|0;h=j|0;l=j+4|0;j=d[l]|d[l+1|0]<<8|d[l+2|0]<<16|d[l+3|0]<<24|0;l=i|0;E=d[h]|d[h+1|0]<<8|d[h+2|0]<<16|d[h+3|0]<<24|0;a[l]=E;E=E>>8;a[l+1|0]=E;E=E>>8;a[l+2|0]=E;E=E>>8;a[l+3|0]=E;l=i+4|0;E=j;a[l]=E;E=E>>8;a[l+1|0]=E;E=E>>8;a[l+2|0]=E;E=E>>8;a[l+3|0]=E;c[f>>2]=18280;l=b+40|0;j=e+40|0;c[l>>2]=c[j>>2];c[l+4>>2]=c[j+4>>2];c[l+8>>2]=c[j+8>>2];c[l+12>>2]=c[j+12>>2];c[l+16>>2]=c[j+16>>2];c[l+20>>2]=c[j+20>>2];c[l+24>>2]=c[j+24>>2];c[l+28>>2]=c[j+28>>2];j=b+72|0;l=e+72|0;if((a[l]&1)==0){i=j;c[i>>2]=c[l>>2];c[i+4>>2]=c[l+4>>2];c[i+8>>2]=c[l+8>>2];return}l=c[e+80>>2]|0;i=c[e+76>>2]|0;do{if(i>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(i>>>0<11>>>0){a[j]=i<<1;m=j+1|0}else{e=i+16&-16;h=(z=0,au(246,e|0)|0);if(z){z=0;break}c[b+80>>2]=h;c[j>>2]=e|1;c[b+76>>2]=i;m=h}La(m|0,l|0,i)|0;a[m+i|0]=0;return}}while(0);i=bS(-1,-1)|0;c[f>>2]=16664;if((a[g]&1)==0){bg(i|0)}K1(c[b+12>>2]|0);bg(i|0)}function kN(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;j=i;i=i+32|0;k=e;e=i;i=i+12|0;i=i+7&-8;c[e>>2]=c[k>>2];c[e+4>>2]=c[k+4>>2];c[e+8>>2]=c[k+8>>2];k=j|0;l=j+16|0;m=b|0;n=d;if((a[n]&1)==0){o=k;c[o>>2]=c[n>>2];c[o+4>>2]=c[n+4>>2];c[o+8>>2]=c[n+8>>2]}else{n=c[d+8>>2]|0;o=c[d+4>>2]|0;if(o>>>0>4294967279>>>0){DE(0)}if(o>>>0<11>>>0){a[k]=o<<1;p=k+1|0}else{d=o+16&-16;q=K$(d)|0;c[k+8>>2]=q;c[k>>2]=d|1;c[k+4>>2]=o;p=q}La(p|0,n|0,o)|0;a[p+o|0]=0}o=l;p=e;c[o>>2]=c[p>>2];c[o+4>>2]=c[p+4>>2];c[o+8>>2]=c[p+8>>2];z=0;aq(8,m|0,k|0,l|0,g|0,0);if(z){z=0;g=bS(-1,-1)|0;l=g;g=M;if((a[k]&1)==0){r=g;s=l;t=s;u=0;v=t;w=r;bg(v|0)}K1(c[k+8>>2]|0);r=g;s=l;t=s;u=0;v=t;w=r;bg(v|0)}if((a[k]&1)!=0){K1(c[k+8>>2]|0)}k=b+40|0;c[k>>2]=21824;l=b+44|0;c[l>>2]=0;g=b+48|0;c[g>>2]=0;m=b+52|0;c[m>>2]=0;if((f|0)==0){x=b|0;c[x>>2]=20640;c[k>>2]=20700;y=b+56|0;a[y]=h;i=j;return}p=(z=0,au(246,f<<2|0)|0);if(!z){o=p;c[l>>2]=o;c[g>>2]=o;c[m>>2]=o+(f<<2);x=b|0;c[x>>2]=20640;c[k>>2]=20700;y=b+56|0;a[y]=h;i=j;return}else{z=0}j=bS(-1,-1)|0;h=j;j=M;c[b>>2]=16664;if((a[b+4|0]&1)==0){r=j;s=h;t=s;u=0;v=t;w=r;bg(v|0)}K1(c[b+12>>2]|0);r=j;s=h;t=s;u=0;v=t;w=r;bg(v|0)}function kO(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;h=i;i=i+32|0;j=e;e=i;i=i+12|0;i=i+7&-8;c[e>>2]=c[j>>2];c[e+4>>2]=c[j+4>>2];c[e+8>>2]=c[j+8>>2];j=h|0;k=h+16|0;l=b|0;m=d;if((a[m]&1)==0){n=j;c[n>>2]=c[m>>2];c[n+4>>2]=c[m+4>>2];c[n+8>>2]=c[m+8>>2]}else{m=c[d+8>>2]|0;n=c[d+4>>2]|0;if(n>>>0>4294967279>>>0){DE(0)}if(n>>>0<11>>>0){a[j]=n<<1;o=j+1|0}else{d=n+16&-16;p=K$(d)|0;c[j+8>>2]=p;c[j>>2]=d|1;c[j+4>>2]=n;o=p}La(o|0,m|0,n)|0;a[o+n|0]=0}n=k;o=e;c[n>>2]=c[o>>2];c[n+4>>2]=c[o+4>>2];c[n+8>>2]=c[o+8>>2];z=0;aD(6,l|0,j|0,k|0,g|0,0,0);if(!z){if((a[j]&1)==0){q=b|0;c[q>>2]=17480;r=b+36|0;s=f&1;a[r]=s;t=b+32|0;c[t>>2]=4;i=h;return}K1(c[j+8>>2]|0);q=b|0;c[q>>2]=17480;r=b+36|0;s=f&1;a[r]=s;t=b+32|0;c[t>>2]=4;i=h;return}else{z=0;h=bS(-1,-1)|0;if((a[j]&1)==0){bg(h|0)}K1(c[j+8>>2]|0);bg(h|0)}}function kP(b){b=b|0;var d=0,e=0,f=0,g=0;c[b+40>>2]=21824;d=c[b+44>>2]|0;e=d;if((d|0)!=0){f=b+48|0;g=c[f>>2]|0;if((d|0)!=(g|0)){c[f>>2]=g+(~((g-4+(-e|0)|0)>>>2)<<2)}K1(d)}c[b>>2]=16664;if((a[b+4|0]&1)==0){return}K1(c[b+12>>2]|0);return}function kQ(b){b=b|0;var d=0,e=0,f=0,g=0,h=0;c[b+40>>2]=21824;d=c[b+44>>2]|0;e=d;if((d|0)!=0){f=b+48|0;g=c[f>>2]|0;if((d|0)!=(g|0)){c[f>>2]=g+(~((g-4+(-e|0)|0)>>>2)<<2)}K1(d)}c[b>>2]=16664;if((a[b+4|0]&1)==0){h=b;K1(h);return}K1(c[b+12>>2]|0);h=b;K1(h);return}function kR(a,b){a=a|0;b=b|0;cA[c[(c[b>>2]|0)+132>>2]&1023](b,a);return}function kS(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+132>>2]&1023](b,a)|0}function kT(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+132>>2]&1023](b,a)|0}function kU(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+132>>2]&1023](b,a)|0}function kV(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+132>>2]&1023](b,a)|0}function kW(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+132>>2]&511](a,d,b);return}function kX(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+132>>2]&511](a,d,b);return}function kY(b,c){b=b|0;c=c|0;c=b;a[b]=12;b=c+1|0;a[b]=a[5960]|0;a[b+1|0]=a[5961]|0;a[b+2|0]=a[5962]|0;a[b+3|0]=a[5963]|0;a[b+4|0]=a[5964]|0;a[b+5|0]=a[5965]|0;a[c+7|0]=0;return}function kZ(b){b=b|0;var d=0,e=0,f=0,g=0;d=b-60+20|0;c[d+40>>2]=21824;b=c[d+44>>2]|0;e=b;if((b|0)!=0){f=d+48|0;g=c[f>>2]|0;if((b|0)!=(g|0)){c[f>>2]=g+(~((g-4+(-e|0)|0)>>>2)<<2)}K1(b)}c[d>>2]=16664;if((a[d+4|0]&1)==0){return}K1(c[d+12>>2]|0);return}function k_(b){b=b|0;var d=0,e=0,f=0,g=0,h=0;d=b-60+20|0;c[d+40>>2]=21824;b=c[d+44>>2]|0;e=b;if((b|0)!=0){f=d+48|0;g=c[f>>2]|0;if((b|0)!=(g|0)){c[f>>2]=g+(~((g-4+(-e|0)|0)>>>2)<<2)}K1(b)}c[d>>2]=16664;if((a[d+4|0]&1)==0){h=d;K1(h);return}K1(c[d+12>>2]|0);h=d;K1(h);return}function k$(a,b){a=a|0;b=b|0;cA[c[c[b>>2]>>2]&1023](b,a|0);return}function k0(a,b){a=a|0;b=b|0;return cU[c[c[b>>2]>>2]&1023](b,a|0)|0}function k1(a,b){a=a|0;b=b|0;return cU[c[c[b>>2]>>2]&1023](b,a|0)|0}function k2(a,b){a=a|0;b=b|0;return cU[c[c[b>>2]>>2]&1023](b,a|0)|0}function k3(a,b){a=a|0;b=b|0;return cU[c[c[b>>2]>>2]&1023](b,a|0)|0}function k4(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[c[d>>2]>>2]&511](a,d,b|0);return}function k5(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[c[d>>2]>>2]&511](a,d,b|0);return}function k6(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;h=i;i=i+32|0;j=e;e=i;i=i+12|0;i=i+7&-8;c[e>>2]=c[j>>2];c[e+4>>2]=c[j+4>>2];c[e+8>>2]=c[j+8>>2];j=h|0;k=h+16|0;l=b|0;m=d;if((a[m]&1)==0){n=j;c[n>>2]=c[m>>2];c[n+4>>2]=c[m+4>>2];c[n+8>>2]=c[m+8>>2]}else{m=c[d+8>>2]|0;n=c[d+4>>2]|0;if(n>>>0>4294967279>>>0){DE(0)}if(n>>>0<11>>>0){a[j]=n<<1;o=j+1|0}else{d=n+16&-16;p=K$(d)|0;c[j+8>>2]=p;c[j>>2]=d|1;c[j+4>>2]=n;o=p}La(o|0,m|0,n)|0;a[o+n|0]=0}n=k;o=e;c[n>>2]=c[o>>2];c[n+4>>2]=c[o+4>>2];c[n+8>>2]=c[o+8>>2];z=0;aD(6,l|0,j|0,k|0,0,0,0);if(z){z=0;k=bS(-1,-1)|0;l=k;k=M;if((a[j]&1)==0){q=k;r=l;s=r;t=0;u=s;v=q;bg(u|0)}K1(c[j+8>>2]|0);q=k;r=l;s=r;t=0;u=s;v=q;bg(u|0)}if((a[j]&1)!=0){K1(c[j+8>>2]|0)}j=b|0;c[j>>2]=21048;l=b+36|0;k=f;if((a[k]&1)==0){o=l;c[o>>2]=c[k>>2];c[o+4>>2]=c[k+4>>2];c[o+8>>2]=c[k+8>>2];w=b+48|0;c[w>>2]=g;x=b+32|0;c[x>>2]=4;i=h;return}k=c[f+8>>2]|0;o=c[f+4>>2]|0;do{if(o>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(o>>>0<11>>>0){a[l]=o<<1;y=l+1|0}else{f=o+16&-16;n=(z=0,au(246,f|0)|0);if(z){z=0;break}c[b+44>>2]=n;c[l>>2]=f|1;c[b+40>>2]=o;y=n}La(y|0,k|0,o)|0;a[y+o|0]=0;w=b+48|0;c[w>>2]=g;x=b+32|0;c[x>>2]=4;i=h;return}}while(0);h=bS(-1,-1)|0;x=h;h=M;c[j>>2]=16664;if((a[b+4|0]&1)==0){q=h;r=x;s=r;t=0;u=s;v=q;bg(u|0)}K1(c[b+12>>2]|0);q=h;r=x;s=r;t=0;u=s;v=q;bg(u|0)}function k7(b){b=b|0;var d=0;d=b|0;c[d>>2]=21048;if((a[b+36|0]&1)!=0){K1(c[b+44>>2]|0)}c[d>>2]=16664;if((a[b+4|0]&1)==0){return}K1(c[b+12>>2]|0);return}function k8(b){b=b|0;var d=0,e=0;d=b|0;c[d>>2]=21048;if((a[b+36|0]&1)!=0){K1(c[b+44>>2]|0)}c[d>>2]=16664;if((a[b+4|0]&1)==0){e=b;K1(e);return}K1(c[b+12>>2]|0);e=b;K1(e);return}function k9(a,b){a=a|0;b=b|0;cA[c[(c[b>>2]|0)+104>>2]&1023](b,a);return}function la(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+104>>2]&1023](b,a)|0}function lb(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+104>>2]&1023](b,a)|0}function lc(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+104>>2]&1023](b,a)|0}function ld(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+104>>2]&1023](b,a)|0}function le(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+104>>2]&511](a,d,b);return}function lf(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+104>>2]&511](a,d,b);return}function lg(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;h=i;i=i+32|0;j=e;e=i;i=i+12|0;i=i+7&-8;c[e>>2]=c[j>>2];c[e+4>>2]=c[j+4>>2];c[e+8>>2]=c[j+8>>2];j=h|0;k=h+16|0;l=b|0;m=d;if((a[m]&1)==0){n=j;c[n>>2]=c[m>>2];c[n+4>>2]=c[m+4>>2];c[n+8>>2]=c[m+8>>2]}else{m=c[d+8>>2]|0;n=c[d+4>>2]|0;if(n>>>0>4294967279>>>0){DE(0)}if(n>>>0<11>>>0){a[j]=n<<1;o=j+1|0}else{d=n+16&-16;p=K$(d)|0;c[j+8>>2]=p;c[j>>2]=d|1;c[j+4>>2]=n;o=p}La(o|0,m|0,n)|0;a[o+n|0]=0}n=k;o=e;c[n>>2]=c[o>>2];c[n+4>>2]=c[o+4>>2];c[n+8>>2]=c[o+8>>2];z=0;aq(8,l|0,j|0,k|0,g|0,1);if(z){z=0;g=bS(-1,-1)|0;k=g;g=M;if((a[j]&1)==0){q=g;r=k;s=r;t=0;u=s;v=q;bg(u|0)}K1(c[j+8>>2]|0);q=g;r=k;s=r;t=0;u=s;v=q;bg(u|0)}if((a[j]&1)!=0){K1(c[j+8>>2]|0)}j=b|0;c[j>>2]=20288;k=b+40|0;g=f;if((a[g]&1)==0){l=k;c[l>>2]=c[g>>2];c[l+4>>2]=c[g+4>>2];c[l+8>>2]=c[g+8>>2];i=h;return}g=c[f+8>>2]|0;l=c[f+4>>2]|0;do{if(l>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(l>>>0<11>>>0){a[k]=l<<1;w=k+1|0}else{f=l+16&-16;o=(z=0,au(246,f|0)|0);if(z){z=0;break}c[b+48>>2]=o;c[k>>2]=f|1;c[b+44>>2]=l;w=o}La(w|0,g|0,l)|0;a[w+l|0]=0;i=h;return}}while(0);h=bS(-1,-1)|0;l=h;h=M;c[j>>2]=16664;if((a[b+4|0]&1)==0){q=h;r=l;s=r;t=0;u=s;v=q;bg(u|0)}K1(c[b+12>>2]|0);q=h;r=l;s=r;t=0;u=s;v=q;bg(u|0)}function lh(b){b=b|0;var d=0;d=b|0;c[d>>2]=20288;if((a[b+40|0]&1)!=0){K1(c[b+48>>2]|0)}c[d>>2]=16664;if((a[b+4|0]&1)==0){return}K1(c[b+12>>2]|0);return}function li(b){b=b|0;var d=0,e=0;d=b|0;c[d>>2]=20288;if((a[b+40|0]&1)!=0){K1(c[b+48>>2]|0)}c[d>>2]=16664;if((a[b+4|0]&1)==0){e=b;K1(e);return}K1(c[b+12>>2]|0);e=b;K1(e);return}function lj(a,b){a=a|0;b=b|0;cA[c[(c[b>>2]|0)+136>>2]&1023](b,a);return}function lk(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+136>>2]&1023](b,a)|0}function ll(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+136>>2]&1023](b,a)|0}function lm(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+136>>2]&1023](b,a)|0}function ln(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+136>>2]&1023](b,a)|0}function lo(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+136>>2]&511](a,d,b);return}function lp(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+136>>2]&511](a,d,b);return}function lq(b,c){b=b|0;c=c|0;c=b;a[b]=12;b=c+1|0;a[b]=a[5960]|0;a[b+1|0]=a[5961]|0;a[b+2|0]=a[5962]|0;a[b+3|0]=a[5963]|0;a[b+4|0]=a[5964]|0;a[b+5|0]=a[5965]|0;a[c+7|0]=0;return}function lr(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;h=i;i=i+32|0;j=e;e=i;i=i+12|0;i=i+7&-8;c[e>>2]=c[j>>2];c[e+4>>2]=c[j+4>>2];c[e+8>>2]=c[j+8>>2];j=h|0;k=h+16|0;l=b|0;m=d;if((a[m]&1)==0){n=j;c[n>>2]=c[m>>2];c[n+4>>2]=c[m+4>>2];c[n+8>>2]=c[m+8>>2]}else{m=c[d+8>>2]|0;n=c[d+4>>2]|0;if(n>>>0>4294967279>>>0){DE(0)}if(n>>>0<11>>>0){a[j]=n<<1;o=j+1|0}else{d=n+16&-16;p=K$(d)|0;c[j+8>>2]=p;c[j>>2]=d|1;c[j+4>>2]=n;o=p}La(o|0,m|0,n)|0;a[o+n|0]=0}n=k;o=e;c[n>>2]=c[o>>2];c[n+4>>2]=c[o+4>>2];c[n+8>>2]=c[o+8>>2];z=0;aq(8,l|0,j|0,k|0,g|0,1);if(z){z=0;g=bS(-1,-1)|0;k=g;g=M;if((a[j]&1)==0){q=g;r=k;s=r;t=0;u=s;v=q;bg(u|0)}K1(c[j+8>>2]|0);q=g;r=k;s=r;t=0;u=s;v=q;bg(u|0)}if((a[j]&1)!=0){K1(c[j+8>>2]|0)}j=b|0;c[j>>2]=20288;k=Le(f|0)|0;g=b+40|0;do{if(k>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(k>>>0<11>>>0){a[g]=k<<1;w=g+1|0;La(w|0,f|0,k)|0;x=w+k|0;a[x]=0;i=h;return}l=k+16&-16;o=(z=0,au(246,l|0)|0);if(z){z=0;break}c[b+48>>2]=o;c[g>>2]=l|1;c[b+44>>2]=k;w=o;La(w|0,f|0,k)|0;x=w+k|0;a[x]=0;i=h;return}}while(0);h=bS(-1,-1)|0;x=h;h=M;c[j>>2]=16664;if((a[b+4|0]&1)==0){q=h;r=x;s=r;t=0;u=s;v=q;bg(u|0)}K1(c[b+12>>2]|0);q=h;r=x;s=r;t=0;u=s;v=q;bg(u|0)}function ls(b,e){b=b|0;e=e|0;var f=0,g=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0;f=b|0;c[f>>2]=16664;g=b+4|0;i=e+4|0;if((a[i]&1)==0){j=g;c[j>>2]=c[i>>2];c[j+4>>2]=c[i+4>>2];c[j+8>>2]=c[i+8>>2]}else{i=c[e+12>>2]|0;j=c[e+8>>2]|0;if(j>>>0>4294967279>>>0){DE(0)}if(j>>>0<11>>>0){a[g]=j<<1;k=g+1|0}else{l=j+16&-16;m=K$(l)|0;c[b+12>>2]=m;c[g>>2]=l|1;c[b+8>>2]=j;k=m}La(k|0,i|0,j)|0;a[k+j|0]=0}j=b+16|0;k=e+16|0;c[j>>2]=c[k>>2];c[j+4>>2]=c[k+4>>2];c[j+8>>2]=c[k+8>>2];c[f>>2]=22e3;k=e+28|0;j=b+28|0;i=k|0;m=k+4|0;k=d[m]|d[m+1|0]<<8|d[m+2|0]<<16|d[m+3|0]<<24|0;m=j|0;E=d[i]|d[i+1|0]<<8|d[i+2|0]<<16|d[i+3|0]<<24|0;a[m]=E;E=E>>8;a[m+1|0]=E;E=E>>8;a[m+2|0]=E;E=E>>8;a[m+3|0]=E;m=j+4|0;E=k;a[m]=E;E=E>>8;a[m+1|0]=E;E=E>>8;a[m+2|0]=E;E=E>>8;a[m+3|0]=E;c[f>>2]=17616;m=b+40|0;k=e+40|0;h[m>>3]=+h[k>>3];j=b+48|0;z=0;as(294,j|0,e+48|0);do{if(!z){h[m>>3]=+h[k>>3];z=0;as(294,b+60|0,e+60|0);if(!z){h[m>>3]=+h[k>>3];return}else{z=0}i=bS(-1,-1)|0;l=i;i=M;n=j|0;o=c[n>>2]|0;if((o|0)==0){p=i;q=l;break}r=b+52|0;s=c[r>>2]|0;if((o|0)==(s|0)){t=o}else{u=s;while(1){s=u-12|0;c[r>>2]=s;if((a[s]&1)==0){v=s}else{K1(c[u-12+8>>2]|0);v=c[r>>2]|0}if((o|0)==(v|0)){break}else{u=v}}t=c[n>>2]|0}K1(t);p=i;q=l}else{z=0;u=bS(-1,-1)|0;p=M;q=u}}while(0);c[f>>2]=16664;if((a[g]&1)==0){w=q;x=0;y=w;A=p;bg(y|0)}K1(c[b+12>>2]|0);w=q;x=0;y=w;A=p;bg(y|0)}function lt(b){b=b|0;c[b>>2]=16664;if((a[b+4|0]&1)==0){return}K1(c[b+12>>2]|0);return}function lu(b){b=b|0;var d=0;c[b>>2]=16664;if((a[b+4|0]&1)==0){d=b;K1(d);return}K1(c[b+12>>2]|0);d=b;K1(d);return}function lv(a,b){a=a|0;b=b|0;cA[c[(c[b>>2]|0)+128>>2]&1023](b,a);return}function lw(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+128>>2]&1023](b,a)|0}function lx(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+128>>2]&1023](b,a)|0}function ly(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+128>>2]&1023](b,a)|0}function lz(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+128>>2]&1023](b,a)|0}function lA(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+128>>2]&511](a,d,b);return}function lB(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+128>>2]&511](a,d,b);return}function lC(b){b=b|0;return(a[b+36|0]&1)!=0|0}function lD(b,c){b=b|0;c=c|0;c=b;a[b]=8;b=c+1|0;E=1819242338;a[b]=E;E=E>>8;a[b+1|0]=E;E=E>>8;a[b+2|0]=E;E=E>>8;a[b+3|0]=E;a[c+5|0]=0;return}function lE(b){b=b|0;return(a[b+36|0]&1)==0|0}function lF(b,e,f,g,j){b=b|0;e=e|0;f=f|0;g=+g;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0;k=i;i=i+32|0;l=f;f=i;i=i+12|0;i=i+7&-8;c[f>>2]=c[l>>2];c[f+4>>2]=c[l+4>>2];c[f+8>>2]=c[l+8>>2];l=k|0;m=k+16|0;n=b|0;o=e;if((a[o]&1)==0){p=l;c[p>>2]=c[o>>2];c[p+4>>2]=c[o+4>>2];c[p+8>>2]=c[o+8>>2]}else{o=c[e+8>>2]|0;p=c[e+4>>2]|0;if(p>>>0>4294967279>>>0){DE(0)}if(p>>>0<11>>>0){a[l]=p<<1;q=l+1|0}else{e=p+16&-16;r=K$(e)|0;c[l+8>>2]=r;c[l>>2]=e|1;c[l+4>>2]=p;q=r}La(q|0,o|0,p)|0;a[q+p|0]=0}p=m;q=f;c[p>>2]=c[q>>2];c[p+4>>2]=c[q+4>>2];c[p+8>>2]=c[q+8>>2];z=0;aD(6,n|0,l|0,m|0,0,0,0);if(z){z=0;m=bS(-1,-1)|0;n=m;m=M;if((a[l]&1)==0){s=m;t=n;u=t;v=0;w=u;x=s;bg(w|0)}K1(c[l+8>>2]|0);s=m;t=n;u=t;v=0;w=u;x=s;bg(w|0)}if((a[l]&1)!=0){K1(c[l+8>>2]|0)}l=b|0;c[l>>2]=17616;h[b+40>>3]=g;n=b+48|0;m=n|0;q=b+52|0;p=b+60|0;f=b+64|0;Ld(n|0,0,24)|0;o=d[j]|0;if((o&1|0)==0){y=o>>>1}else{y=c[j+4>>2]|0}if((y|0)==0){A=b+32|0;c[A>>2]=2;i=k;return}z=0;as(284,n|0,j|0);if(!z){A=b+32|0;c[A>>2]=2;i=k;return}else{z=0}k=bS(-1,-1)|0;A=k;k=M;j=c[p>>2]|0;if((j|0)!=0){n=c[f>>2]|0;if((j|0)==(n|0)){B=j}else{y=n;while(1){n=y-12|0;c[f>>2]=n;if((a[n]&1)==0){C=n}else{K1(c[y-12+8>>2]|0);C=c[f>>2]|0}if((j|0)==(C|0)){break}else{y=C}}B=c[p>>2]|0}K1(B)}B=c[m>>2]|0;if((B|0)!=0){p=c[q>>2]|0;if((B|0)==(p|0)){D=B}else{C=p;while(1){p=C-12|0;c[q>>2]=p;if((a[p]&1)==0){E=p}else{K1(c[C-12+8>>2]|0);E=c[q>>2]|0}if((B|0)==(E|0)){break}else{C=E}}D=c[m>>2]|0}K1(D)}c[l>>2]=16664;if((a[b+4|0]&1)==0){s=k;t=A;u=t;v=0;w=u;x=s;bg(w|0)}K1(c[b+12>>2]|0);s=k;t=A;u=t;v=0;w=u;x=s;bg(w|0)}function lG(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;h=i;i=i+8|0;j=h|0;c[a>>2]=17984;c[a+4>>2]=b;c[a+8>>2]=d;c[a+12>>2]=e;c[a+16>>2]=f;f=a+20|0;e=a+24|0;d=a+32|0;b=a+36|0;k=a+44|0;l=k|0;m=a+48|0;Ld(f|0,0,36)|0;c[a+56>>2]=g;g=a+60|0;n=g|0;o=a+64|0;c[o>>2]=0;c[a+68>>2]=0;c[g>>2]=o;o=a+72|0;g=a+76|0;Ld(o|0,0,24)|0;c[a+84>>2]=a+88;c[j>>2]=0;p=c[m>>2]|0;if((p|0)!=0){c[p>>2]=0;c[m>>2]=(c[m>>2]|0)+4;i=h;return}z=0;as(6,k|0,j|0);if(!z){i=h;return}else{z=0}h=bS(-1,-1)|0;g_(a+84|0,c[a+88>>2]|0);j=c[o>>2]|0;o=j;if((j|0)!=0){k=c[g>>2]|0;if((j|0)!=(k|0)){c[g>>2]=k+(~((k-8+(-o|0)|0)>>>3)<<3)}K1(j)}gZ(n,c[a+64>>2]|0);a=c[l>>2]|0;l=a;if((a|0)!=0){n=c[m>>2]|0;if((a|0)!=(n|0)){c[m>>2]=n+(~((n-4+(-l|0)|0)>>>2)<<2)}K1(a)}a=c[d>>2]|0;d=a;if((a|0)!=0){l=c[b>>2]|0;if((a|0)!=(l|0)){c[b>>2]=l+(~((l-4+(-d|0)|0)>>>2)<<2)}K1(a)}a=c[f>>2]|0;if((a|0)==0){bg(h|0)}f=c[e>>2]|0;if((a|0)!=(f|0)){c[e>>2]=f+(~((f-4+(-a|0)|0)>>>2)<<2)}K1(a);bg(h|0)}function lH(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0;e=i;i=i+72|0;f=e|0;g=e+8|0;h=e+24|0;j=e+32|0;k=e+48|0;l=e+56|0;m=j+4|0;c[m>>2]=0;c[j+8>>2]=0;c[j>>2]=m;m=b+16|0;c[j+12>>2]=c[m>>2];c[m>>2]=j;n=c[b+4>>2]|0;o=(z=0,au(246,48)|0);L1:do{if(!z){p=o;c[h>>2]=p;q=n+4|0;r=c[q>>2]|0;if((r|0)==(c[n+8>>2]|0)){z=0;as(378,n|0,h|0);if(z){z=0;s=43;break}t=c[h>>2]|0}else{if((r|0)==0){u=0}else{c[r>>2]=p;u=c[q>>2]|0}c[q>>2]=u+4;t=p}p=t;r=t;v=d+4|0;L11:do{if((a[v]&1)==0){w=l;c[w>>2]=c[v>>2];c[w+4>>2]=c[v+4>>2];c[w+8>>2]=c[v+8>>2];s=18}else{w=c[d+12>>2]|0;x=c[d+8>>2]|0;do{if(x>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(x>>>0<11>>>0){a[l]=x<<1;y=l+1|0}else{A=x+16&-16;B=(z=0,au(246,A|0)|0);if(z){z=0;break}c[l+8>>2]=B;c[l>>2]=A|1;c[l+4>>2]=x;y=B}La(y|0,w|0,x)|0;a[y+x|0]=0;s=18;break L11}}while(0);x=bS(-1,-1)|0;C=x;D=M}}while(0);do{if((s|0)==18){v=d+16|0;x=g;c[x>>2]=c[v>>2];c[x+4>>2]=c[v+4>>2];c[x+8>>2]=c[v+8>>2];v=d+36|0;x=d+32|0;z=0;aq(4,r|0,l|0,g|0,(c[v>>2]|0)-(c[x>>2]|0)>>2|0,(a[d+44|0]&1)!=0|0);if(z){z=0;w=bS(-1,-1)|0;B=w;w=M;if((a[l]&1)==0){C=B;D=w;break}K1(c[l+8>>2]|0);C=B;D=w;break}if((a[l]&1)!=0){K1(c[l+8>>2]|0)}c[k>>2]=r;w=b+24|0;B=c[w>>2]|0;if((B|0)==(c[b+28>>2]|0)){z=0;as(404,b+20|0,k|0);if(z){z=0;s=43;break L1}E=c[w>>2]|0}else{if((B|0)==0){F=0}else{c[B>>2]=r;F=c[w>>2]|0}B=F+4|0;c[w>>2]=B;E=B}B=c[E-4>>2]|0;A=c[x>>2]|0;G=(c[v>>2]|0)-A>>2;if((G|0)==0){H=E;I=H-4|0;c[w>>2]=I;J=c[m>>2]|0;K=J+12|0;L=c[K>>2]|0;c[m>>2]=L;N=c[k>>2]|0;O=N|0;P=j|0;Q=j+4|0;R=c[Q>>2]|0;S=R;gX(P,S);i=e;return O|0}v=b|0;T=B+28|0;U=B+36|0;V=B+40|0;W=B+32|0;B=T;X=0;Y=A;while(1){A=c[Y+(X<<2)>>2]|0;Z=(z=0,aM(c[(c[A>>2]|0)+16>>2]|0,A|0,v|0)|0);if(z){z=0;s=42;break}if((Z|0)!=0){c[f>>2]=Z;A=c[U>>2]|0;if((A|0)==(c[V>>2]|0)){z=0;as(484,W|0,f|0);if(z){z=0;s=42;break}_=c[f>>2]|0}else{if((A|0)==0){$=0}else{c[A>>2]=Z;$=c[U>>2]|0}c[U>>2]=$+4;_=Z}z=0;as(c[c[B>>2]>>2]|0,T|0,_|0);if(z){z=0;s=42;break}}Z=X+1|0;if(Z>>>0>=G>>>0){break}X=Z;Y=c[x>>2]|0}if((s|0)==42){x=bS(-1,-1)|0;aa=M;ab=x;break L1}H=c[w>>2]|0;I=H-4|0;c[w>>2]=I;J=c[m>>2]|0;K=J+12|0;L=c[K>>2]|0;c[m>>2]=L;N=c[k>>2]|0;O=N|0;P=j|0;Q=j+4|0;R=c[Q>>2]|0;S=R;gX(P,S);i=e;return O|0}}while(0);r=c[n>>2]|0;x=c[q>>2]|0;L64:do{if((r|0)==(x|0)){ac=r}else{Y=r;while(1){X=Y+4|0;if((c[Y>>2]|0)==(t|0)){ac=Y;break L64}if((X|0)==(x|0)){ac=x;break}else{Y=X}}}}while(0);Y=ac-r>>2;w=r+(Y+1<<2)|0;X=x-w|0;Lb(r+(Y<<2)|0,w|0,X|0)|0;w=r+((X>>2)+Y<<2)|0;Y=c[q>>2]|0;if((w|0)!=(Y|0)){c[q>>2]=Y+(~((Y-4+(-w|0)|0)>>>2)<<2)}K1(p);ad=C;ae=D;af=j|0;ag=j+4|0;ah=c[ag>>2]|0;ai=ah;gX(af,ai);aj=ad;ak=0;al=aj;am=ae;bg(al|0)}else{z=0;s=43}}while(0);if((s|0)==43){s=bS(-1,-1)|0;aa=M;ab=s}ad=ab;ae=aa;af=j|0;ag=j+4|0;ah=c[ag>>2]|0;ai=ah;gX(af,ai);aj=ad;ak=0;al=aj;am=ae;bg(al|0);return 0}function lI(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,av=0,aw=0,ax=0,ay=0,aA=0,aB=0,aC=0,aD=0;e=i;i=i+232|0;f=e|0;g=e+16|0;h=e+32|0;j=e+48|0;k=e+56|0;l=e+64|0;m=e+72|0;n=e+136|0;o=e+152|0;p=e+168|0;q=e+184|0;r=e+200|0;s=e+216|0;A6(k,0);t=d+32|0;u=c[t>>2]|0;v=c[(c[u>>2]|0)+24>>2]|0;w=b+44|0;x=b+48|0;y=(z=0,at(100,c[b+12>>2]|0,c[(c[x>>2]|0)-4>>2]|0,c[b+16>>2]|0,c[b+56>>2]|0,0,0)|0);L1:do{if(!z){A=(z=0,aM(v|0,u|0,y|0)|0);if(z){z=0;B=89;break}c[l>>2]=A;z=0;aR(c[(c[A>>2]|0)+28>>2]|0,o|0,A|0,k|0);if(z){z=0;B=89;break}A=n;Ld(A|0,0,12)|0;C=o;D=a[C]|0;E=D&255;if((E&1|0)==0){F=E>>>1}else{F=c[o+4>>2]|0}if((D&1)==0){G=o+1|0}else{G=c[o+8>>2]|0}D=F+1|0;do{if(D>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;B=18;break}return 0}else{if(D>>>0<11>>>0){a[A]=F<<1;H=n+1|0}else{E=F+17&-16;I=(z=0,au(246,E|0)|0);if(z){z=0;B=18;break}c[n+8>>2]=I;c[n>>2]=E|1;c[n+4>>2]=F;H=I}La(H|0,G|0,F)|0;a[H+F|0]=0;z=0,az(84,n|0,9072,1)|0;if(z){z=0;B=18;break}if((a[A]&1)==0){J=n+1|0}else{J=c[n+8>>2]|0}I=b+4|0;E=c[I>>2]|0;K=c[t>>2]|0;L=K+4|0;L27:do{if((a[L]&1)==0){N=p;c[N>>2]=c[L>>2];c[N+4>>2]=c[L+4>>2];c[N+8>>2]=c[L+8>>2];B=33}else{N=c[K+12>>2]|0;O=c[K+8>>2]|0;do{if(O>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(O>>>0<11>>>0){a[p]=O<<1;P=p+1|0}else{Q=O+16&-16;R=(z=0,au(246,Q|0)|0);if(z){z=0;break}c[p+8>>2]=R;c[p>>2]=Q|1;c[p+4>>2]=O;P=R}La(P|0,N|0,O)|0;a[P+O|0]=0;B=33;break L27}}while(0);O=bS(-1,-1)|0;S=O;T=M}}while(0);do{if((B|0)==33){L=q;O=K+16|0;c[L>>2]=c[O>>2];c[L+4>>2]=c[O+4>>2];c[L+8>>2]=c[O+8>>2];z=0;aq(2,m|0,J|0,E|0,p|0,q|0);do{if(!z){O=(z=0,au(50,m|0)|0);if(z){z=0;L=bS(-1,-1)|0;N=L;L=M;if((a[m+28|0]&1)!=0){K1(c[m+36>>2]|0)}R=c[m+4>>2]|0;if((R|0)==0){U=N;V=L;break}Q=m+8|0;W=c[Q>>2]|0;if((R|0)!=(W|0)){c[Q>>2]=W+(~((W-4+(-R|0)|0)>>>2)<<2)}K1(R);U=N;V=L;break}L=O|0;c[l>>2]=L;if((a[m+28|0]&1)!=0){K1(c[m+36>>2]|0)}O=c[m+4>>2]|0;N=O;if((O|0)!=0){R=m+8|0;W=c[R>>2]|0;if((O|0)!=(W|0)){c[R>>2]=W+(~((W-4+(-N|0)|0)>>>2)<<2)}K1(O)}if((a[p]&1)!=0){K1(c[p+8>>2]|0)}if((a[A]&1)!=0){K1(c[n+8>>2]|0)}if((a[C]&1)!=0){K1(c[o+8>>2]|0)}O=c[x>>2]|0;if((O|0)==(c[b+52>>2]|0)){z=0;as(6,w|0,l|0);if(z){z=0;B=89;break L1}}else{if((O|0)==0){X=0}else{c[O>>2]=L;X=c[x>>2]|0}c[x>>2]=X+4}L=c[I>>2]|0;O=(z=0,au(246,36)|0);if(z){z=0;B=89;break L1}N=O;c[j>>2]=N;O=L+4|0;W=c[O>>2]|0;if((W|0)==(c[L+8>>2]|0)){z=0;as(378,L|0,j|0);if(z){z=0;B=89;break L1}Y=c[j>>2]|0}else{if((W|0)==0){Z=0}else{c[W>>2]=N;Z=c[O>>2]|0}c[O>>2]=Z+4;Y=N}N=Y;W=d+4|0;L88:do{if((a[W]&1)==0){R=r;c[R>>2]=c[W>>2];c[R+4>>2]=c[W+4>>2];c[R+8>>2]=c[W+8>>2];B=69}else{R=c[d+12>>2]|0;Q=c[d+8>>2]|0;do{if(Q>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(Q>>>0<11>>>0){a[r]=Q<<1;_=r+1|0}else{$=Q+16&-16;aa=(z=0,au(246,$|0)|0);if(z){z=0;break}c[r+8>>2]=aa;c[r>>2]=$|1;c[r+4>>2]=Q;_=aa}La(_|0,R|0,Q)|0;a[_+Q|0]=0;B=69;break L88}}while(0);Q=bS(-1,-1)|0;ab=Q;ac=M}}while(0);do{if((B|0)==69){W=s;Q=d+16|0;c[W>>2]=c[Q>>2];c[W+4>>2]=c[Q+4>>2];c[W+8>>2]=c[Q+8>>2];Q=c[l>>2]|0;R=c[d+28>>2]|0;aa=(z=0,aM(c[(c[R>>2]|0)+16>>2]|0,R|0,b|0)|0);do{if(!z){R=(z=0,au(c[(c[aa>>2]|0)+40>>2]|0,aa|0)|0);if(z){z=0;B=106;break}$=h;c[$>>2]=c[W>>2];c[$+4>>2]=c[W+4>>2];c[$+8>>2]=c[W+8>>2];ad=f;ae=g;af=Y;ag=r;ah=a[ag]|0;ai=(ah&1)==0;if(ai){c[ad>>2]=c[ag>>2];c[ad+4>>2]=c[ag+4>>2];c[ad+8>>2]=c[ag+8>>2]}else{ag=c[r+8>>2]|0;aj=c[r+4>>2]|0;if(aj>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;B=106;break}return 0}if(aj>>>0<11>>>0){a[ad]=aj<<1;ak=f+1|0}else{al=aj+16&-16;am=(z=0,au(246,al|0)|0);if(z){z=0;B=106;break}c[f+8>>2]=am;c[f>>2]=al|1;c[f+4>>2]=aj;ak=am}La(ak|0,ag|0,aj)|0;a[ak+aj|0]=0}c[ae>>2]=c[$>>2];c[ae+4>>2]=c[$+4>>2];c[ae+8>>2]=c[$+8>>2];z=0;aV(6,af|0,f|0,g|0,R|0);if(z){z=0;R=bS(-1,-1)|0;af=M;if((a[ad]&1)==0){an=af;ao=R;ap=ah;break}K1(c[f+8>>2]|0);an=af;ao=R;ap=ah;break}if((a[ad]&1)!=0){K1(c[f+8>>2]|0)}c[Y>>2]=16856;c[Y+32>>2]=Q;if(ai){av=c[x>>2]|0;aw=av-4|0;c[x>>2]=aw;ax=Y;A8(k);i=e;return ax|0}K1(c[r+8>>2]|0);av=c[x>>2]|0;aw=av-4|0;c[x>>2]=aw;ax=Y;A8(k);i=e;return ax|0}else{z=0;B=106}}while(0);if((B|0)==106){Q=bS(-1,-1)|0;an=M;ao=Q;ap=a[r]|0}Q=ao;W=an;if((ap&1)==0){ab=Q;ac=W;break}K1(c[r+8>>2]|0);ab=Q;ac=W}}while(0);W=c[L>>2]|0;Q=c[O>>2]|0;L135:do{if((W|0)==(Q|0)){ay=W}else{aa=W;while(1){ai=aa+4|0;if((c[aa>>2]|0)==(Y|0)){ay=aa;break L135}if((ai|0)==(Q|0)){ay=Q;break}else{aa=ai}}}}while(0);L=ay-W>>2;aa=W+(L+1<<2)|0;ai=Q-aa|0;Lb(W+(L<<2)|0,aa|0,ai|0)|0;aa=W+((ai>>2)+L<<2)|0;L=c[O>>2]|0;if((aa|0)!=(L|0)){c[O>>2]=L+(~((L-4+(-aa|0)|0)>>>2)<<2)}K1(N);aA=ab;aB=ac;break L1}else{z=0;aa=bS(-1,-1)|0;U=aa;V=M}}while(0);if((a[p]&1)==0){S=U;T=V;break}K1(c[p+8>>2]|0);S=U;T=V}}while(0);if((a[A]&1)==0){aC=S;aD=T;break}K1(c[n+8>>2]|0);aC=S;aD=T}}while(0);if((B|0)==18){D=bS(-1,-1)|0;I=M;if((a[A]&1)!=0){K1(c[n+8>>2]|0)}aC=D;aD=I}if((a[C]&1)==0){aA=aC;aB=aD;break}K1(c[o+8>>2]|0);aA=aC;aB=aD}else{z=0;B=89}}while(0);if((B|0)==89){B=bS(-1,-1)|0;aA=B;aB=M}z=0;ar(444,k|0);if(!z){bg(aA|0)}else{z=0;aA=bS(-1,-1,0)|0;dk(aA);return 0}return 0}function lJ(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,at=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0;e=i;i=i+176|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=e+32|0;l=e+48|0;m=e+56|0;n=e+64|0;o=e+80|0;p=e+88|0;q=e+96|0;r=e+112|0;s=e+128|0;t=e+144|0;u=e+160|0;v=b+32|0;w=c[d+32>>2]|0;c[p>>2]=w;x=b+36|0;y=c[x>>2]|0;if((y|0)==(c[b+40>>2]|0)){mS(v,p)}else{if((y|0)==0){A=0}else{c[y>>2]=w;A=c[x>>2]|0}c[x>>2]=A+4}A=c[d+28>>2]|0;w=cU[c[(c[A>>2]|0)+16>>2]&1023](A,b|0)|0;A=cC[c[(c[w>>2]|0)+40>>2]&511](w)|0;w=c[(c[b+24>>2]|0)-4>>2]|0;y=A+32|0;p=c[y>>2]|0;B=(c[A+36>>2]|0)-p>>2;if((B|0)==0){C=c[x>>2]|0;D=C-4|0;c[x>>2]=D;i=e;return 0}A=b+4|0;E=d+4|0;F=q;G=d+16|0;H=v|0;v=w+28|0;I=w+36|0;J=w+40|0;K=w+32|0;w=v;L=r;N=r+8|0;O=d+12|0;P=d+8|0;d=r+1|0;Q=r|0;R=r+4|0;S=q+8|0;T=q+1|0;U=q|0;V=q+4|0;W=s+8|0;X=s|0;Y=s+4|0;Z=t;_=u;$=b+56|0;b=s;aa=t+8|0;ab=t+1|0;ac=t|0;ad=t+4|0;ae=0;af=p;L11:while(1){p=c[af+(ae<<2)>>2]|0;if((p|0)==0){ag=9;break}do{if((c[(c[(c[p>>2]|0)-4>>2]|0)+4>>2]|0)==27704){ah=c[A>>2]|0;ai=K$(60)|0;c[o>>2]=ai;aj=ah+4|0;ak=c[aj>>2]|0;if((ak|0)==(c[ah+8>>2]|0)){e4(ah|0,o);al=c[o>>2]|0}else{if((ak|0)==0){am=0}else{c[ak>>2]=ai;am=c[aj>>2]|0}c[aj>>2]=am+4;al=ai}an=al;if((a[E]&1)==0){c[F>>2]=c[E>>2];c[F+4>>2]=c[E+4>>2];c[F+8>>2]=c[E+8>>2]}else{ai=c[O>>2]|0;ak=c[P>>2]|0;if(ak>>>0>4294967279>>>0){ag=19;break L11}if(ak>>>0<11>>>0){a[F]=ak<<1;ao=T}else{ap=ak+16&-16;at=(z=0,au(246,ap|0)|0);if(z){z=0;ag=67;break L11}c[S>>2]=at;c[U>>2]=ap|1;c[V>>2]=ak;ao=at}La(ao|0,ai|0,ak)|0;a[ao+ak|0]=0}ak=n;c[ak>>2]=c[G>>2];c[ak+4>>2]=c[G+4>>2];c[ak+8>>2]=c[G+8>>2];z=0;aD(2,al|0,q|0,n|0,0,0,0);if(z){z=0;ag=70;break L11}if((a[F]&1)!=0){K1(c[S>>2]|0)}ak=c[x>>2]|0;ai=al+40|0;at=ai;do{if((c[H>>2]|0)==(ak|0)){ap=c[p+28>>2]|0;c[g>>2]=ap;av=ai+8|0;aw=c[av>>2]|0;ax=aw;if((aw|0)==(c[ai+12>>2]|0)){fp(ai+4|0,g);ay=c[g>>2]|0}else{if((aw|0)==0){az=0}else{c[ax>>2]=ap;az=c[av>>2]|0}c[av>>2]=az+4;ay=ap}cA[c[c[ai>>2]>>2]&1023](at,ay);}else{ap=c[ak-4>>2]|0;c[m>>2]=ap;av=ai+8|0;ax=c[av>>2]|0;aw=ax;aA=ai+12|0;if((ax|0)==(c[aA>>2]|0)){fp(ai+4|0,m);aB=c[m>>2]|0}else{if((ax|0)==0){aC=0}else{c[aw>>2]=ap;aC=c[av>>2]|0}c[av>>2]=aC+4;aB=ap}cA[c[c[ai>>2]>>2]&1023](at,aB);aE=c[A>>2]|0;ap=K$(52)|0;c[l>>2]=ap;aF=aE+4|0;aw=c[aF>>2]|0;if((aw|0)==(c[aE+8>>2]|0)){e4(aE|0,l);aG=c[l>>2]|0}else{if((aw|0)==0){aH=0}else{c[aw>>2]=ap;aH=c[aF>>2]|0}c[aF>>2]=aH+4;aG=ap}aI=aG;if((a[E]&1)==0){c[L>>2]=c[E>>2];c[L+4>>2]=c[E+4>>2];c[L+8>>2]=c[E+8>>2]}else{ap=c[O>>2]|0;aw=c[P>>2]|0;if(aw>>>0>4294967279>>>0){ag=43;break L11}if(aw>>>0<11>>>0){a[L]=aw<<1;aJ=d}else{ax=aw+16&-16;aK=(z=0,au(246,ax|0)|0);if(z){z=0;ag=78;break L11}c[N>>2]=aK;c[Q>>2]=ax|1;c[R>>2]=aw;aJ=aK}La(aJ|0,ap|0,aw)|0;a[aJ+aw|0]=0}aw=k;c[aw>>2]=c[G>>2];c[aw+4>>2]=c[G+4>>2];c[aw+8>>2]=c[G+8>>2];z=0;aq(36,aG|0,r|0,k|0,11080,0);if(z){z=0;aL=1;ag=81;break L11}aw=aG;c[j>>2]=aw;ap=c[av>>2]|0;aK=ap;if((ap|0)==(c[aA>>2]|0)){z=0;as(372,ai+4|0,j|0);if(z){z=0;aL=0;ag=81;break L11}aM=c[j>>2]|0}else{if((ap|0)==0){aN=0}else{c[aK>>2]=aw;aN=c[av>>2]|0}c[av>>2]=aN+4;aM=aw}z=0;as(c[c[ai>>2]>>2]|0,at|0,aM|0);if(z){z=0;aL=0;ag=81;break L11}aw=c[p+28>>2]|0;c[h>>2]=aw;aK=c[av>>2]|0;ap=aK;if((aK|0)==(c[aA>>2]|0)){z=0;as(372,ai+4|0,h|0);if(z){z=0;aL=0;ag=81;break L11}aO=c[h>>2]|0}else{if((aK|0)==0){aP=0}else{c[ap>>2]=aw;aP=c[av>>2]|0}c[av>>2]=aP+4;aO=aw}z=0;as(c[c[ai>>2]>>2]|0,at|0,aO|0);if(z){z=0;aL=0;ag=81;break L11}if((a[L]&1)==0){break}K1(c[N>>2]|0)}}while(0);c[p+28>>2]=al;c[f>>2]=p;at=c[I>>2]|0;if((at|0)==(c[J>>2]|0)){mR(K,f);aQ=c[f>>2]|0}else{if((at|0)==0){aR=0}else{c[at>>2]=p;aR=c[I>>2]|0}c[I>>2]=aR+4;aQ=p}cA[c[c[w>>2]>>2]&1023](v,aQ);}else{at=K$(80)|0;c[W>>2]=at;c[X>>2]=81;c[Y>>2]=72;La(at|0,8984,72)|0;a[at+72|0]=0;at=p+4|0;if((a[at]&1)==0){c[Z>>2]=c[at>>2];c[Z+4>>2]=c[at+4>>2];c[Z+8>>2]=c[at+8>>2]}else{at=c[p+12>>2]|0;ai=c[p+8>>2]|0;if(ai>>>0>4294967279>>>0){ag=105;break L11}if(ai>>>0<11>>>0){a[Z]=ai<<1;aS=ab}else{ak=ai+16&-16;aw=(z=0,au(246,ak|0)|0);if(z){z=0;ag=117;break L11}c[aa>>2]=aw;c[ac>>2]=ak|1;c[ad>>2]=ai;aS=aw}La(aS|0,at|0,ai)|0;a[aS+ai|0]=0}ai=p+16|0;c[_>>2]=c[ai>>2];c[_+4>>2]=c[ai+4>>2];c[_+8>>2]=c[ai+8>>2];z=0;aV(46,s|0,t|0,u|0,c[$>>2]|0);if(z){z=0;ag=120;break L11}if((a[Z]&1)!=0){K1(c[aa>>2]|0)}if((a[b]&1)==0){break}K1(c[W>>2]|0)}}while(0);p=ae+1|0;if(p>>>0>=B>>>0){ag=129;break}ae=p;af=c[y>>2]|0}do{if((ag|0)==43){z=0;ar(88,0);if(!z){return 0}else{z=0;y=bS(-1,-1)|0;aT=M;aU=y;ag=80;break}}else if((ag|0)==67){y=bS(-1,-1)|0;aW=M;aX=y;ag=69}else if((ag|0)==70){y=bS(-1,-1)|0;af=y;y=M;if((a[F]&1)==0){aY=y;aZ=af;ag=72;break}K1(c[S>>2]|0);aY=y;aZ=af;ag=72}else if((ag|0)==78){af=bS(-1,-1)|0;aT=M;aU=af;ag=80}else if((ag|0)==81){af=bS(-1,-1)|0;y=af;af=M;if((a[L]&1)==0){if(aL){a_=y;a$=af;ag=84;break}else{a0=af;a1=y}a2=a1;a3=0;a4=a2;a5=a0;bg(a4|0)}else{K1(c[N>>2]|0);if(aL){a_=y;a$=af;ag=84;break}else{a0=af;a1=y}a2=a1;a3=0;a4=a2;a5=a0;bg(a4|0)}}else if((ag|0)==19){z=0;ar(88,0);if(!z){return 0}else{z=0;y=bS(-1,-1)|0;aW=M;aX=y;ag=69;break}}else if((ag|0)==9){ci();return 0}else if((ag|0)==105){z=0;ar(88,0);if(!z){return 0}else{z=0;y=bS(-1,-1)|0;a6=M;a7=y;ag=119;break}}else if((ag|0)==117){y=bS(-1,-1)|0;a6=M;a7=y;ag=119}else if((ag|0)==120){y=bS(-1,-1)|0;af=y;y=M;if((a[Z]&1)==0){a8=y;a9=af;ag=122;break}K1(c[aa>>2]|0);a8=y;a9=af;ag=122}else if((ag|0)==129){C=c[x>>2]|0;D=C-4|0;c[x>>2]=D;i=e;return 0}}while(0);if((ag|0)==69){aY=aW;aZ=aX;ag=72}else if((ag|0)==80){a_=aU;a$=aT;ag=84}else if((ag|0)==119){a8=a6;a9=a7;ag=122}if((ag|0)==72){a7=c[ah>>2]|0;ah=c[aj>>2]|0;L151:do{if((a7|0)==(ah|0)){ba=a7}else{a6=a7;while(1){aT=a6+4|0;if((c[a6>>2]|0)==(al|0)){ba=a6;break L151}if((aT|0)==(ah|0)){ba=ah;break}else{a6=aT}}}}while(0);al=ba-a7>>2;ba=a7+(al+1<<2)|0;a6=ah-ba|0;Lb(a7+(al<<2)|0,ba|0,a6|0)|0;ba=a7+((a6>>2)+al<<2)|0;al=c[aj>>2]|0;if((ba|0)!=(al|0)){c[aj>>2]=al+(~((al-4+(-ba|0)|0)>>>2)<<2)}K1(an);a0=aY;a1=aZ;a2=a1;a3=0;a4=a2;a5=a0;bg(a4|0)}else if((ag|0)==84){aZ=c[aE>>2]|0;aE=c[aF>>2]|0;L161:do{if((aZ|0)==(aE|0)){bb=aZ}else{aY=aZ;while(1){an=aY+4|0;if((c[aY>>2]|0)==(aG|0)){bb=aY;break L161}if((an|0)==(aE|0)){bb=aE;break}else{aY=an}}}}while(0);aG=bb-aZ>>2;bb=aZ+(aG+1<<2)|0;aY=aE-bb|0;Lb(aZ+(aG<<2)|0,bb|0,aY|0)|0;bb=aZ+((aY>>2)+aG<<2)|0;aG=c[aF>>2]|0;if((bb|0)!=(aG|0)){c[aF>>2]=aG+(~((aG-4+(-bb|0)|0)>>>2)<<2)}K1(aI);a0=a$;a1=a_;a2=a1;a3=0;a4=a2;a5=a0;bg(a4|0)}else if((ag|0)==122){if((a[b]&1)==0){a0=a8;a1=a9;a2=a1;a3=0;a4=a2;a5=a0;bg(a4|0)}K1(c[W>>2]|0);a0=a8;a1=a9;a2=a1;a3=0;a4=a2;a5=a0;bg(a4|0)}return 0}function lK(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0;e=i;i=i+88|0;f=e|0;g=e+16|0;h=e+32|0;j=e+48|0;k=e+56|0;l=e+72|0;m=c[d+32>>2]|0;n=c[(c[m>>2]|0)+20>>2]|0;o=iI(c[b+8>>2]|0,c[b+16>>2]|0,c[b+56>>2]|0)|0;p=cU[n&1023](m,o)|0;o=c[b+4>>2]|0;m=K$(40)|0;c[j>>2]=m;n=o+4|0;q=c[n>>2]|0;if((q|0)==(c[o+8>>2]|0)){e4(o|0,j);r=c[j>>2]|0}else{if((q|0)==0){s=0}else{c[q>>2]=m;s=c[n>>2]|0}c[n>>2]=s+4;r=m}m=r;s=d+4|0;L8:do{if((a[s]&1)==0){q=k;c[q>>2]=c[s>>2];c[q+4>>2]=c[s+4>>2];c[q+8>>2]=c[s+8>>2];t=16}else{q=c[d+12>>2]|0;j=c[d+8>>2]|0;do{if(j>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(j>>>0<11>>>0){a[k]=j<<1;u=k+1|0}else{v=j+16&-16;w=(z=0,au(246,v|0)|0);if(z){z=0;break}c[k+8>>2]=w;c[k>>2]=v|1;c[k+4>>2]=j;u=w}La(u|0,q|0,j)|0;a[u+j|0]=0;t=16;break L8}}while(0);j=bS(-1,-1)|0;x=M;y=j}}while(0);do{if((t|0)==16){u=l;s=d+16|0;c[u>>2]=c[s>>2];c[u+4>>2]=c[s+4>>2];c[u+8>>2]=c[s+8>>2];s=c[d+28>>2]|0;j=(z=0,aM(c[(c[s>>2]|0)+16>>2]|0,s|0,b|0)|0);do{if(!z){s=(z=0,au(c[(c[j>>2]|0)+40>>2]|0,j|0)|0);if(z){z=0;t=37;break}q=h;c[q>>2]=c[u>>2];c[q+4>>2]=c[u+4>>2];c[q+8>>2]=c[u+8>>2];w=f;v=g;A=r;B=k;C=a[B]|0;D=(C&1)==0;if(D){c[w>>2]=c[B>>2];c[w+4>>2]=c[B+4>>2];c[w+8>>2]=c[B+8>>2]}else{B=c[k+8>>2]|0;E=c[k+4>>2]|0;if(E>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;t=37;break}return 0}if(E>>>0<11>>>0){a[w]=E<<1;F=f+1|0}else{G=E+16&-16;H=(z=0,au(246,G|0)|0);if(z){z=0;t=37;break}c[f+8>>2]=H;c[f>>2]=G|1;c[f+4>>2]=E;F=H}La(F|0,B|0,E)|0;a[F+E|0]=0}c[v>>2]=c[q>>2];c[v+4>>2]=c[q+4>>2];c[v+8>>2]=c[q+8>>2];z=0;aV(6,A|0,f|0,g|0,s|0);if(z){z=0;s=bS(-1,-1)|0;A=M;if((a[w]&1)==0){I=A;J=s;K=C;break}K1(c[f+8>>2]|0);I=A;J=s;K=C;break}if((a[w]&1)!=0){K1(c[f+8>>2]|0)}c[r>>2]=21440;c[r+32>>2]=p;w=r+36|0;c[w>>2]=0;if(D){L=b+48|0;N=c[L>>2]|0;O=N-4|0;P=c[O>>2]|0;Q=P;c[w>>2]=Q;R=r;i=e;return R|0}K1(c[k+8>>2]|0);L=b+48|0;N=c[L>>2]|0;O=N-4|0;P=c[O>>2]|0;Q=P;c[w>>2]=Q;R=r;i=e;return R|0}else{z=0;t=37}}while(0);if((t|0)==37){u=bS(-1,-1)|0;I=M;J=u;K=a[k]|0}u=J;j=I;if((K&1)==0){x=j;y=u;break}K1(c[k+8>>2]|0);x=j;y=u}}while(0);k=c[o>>2]|0;o=c[n>>2]|0;L55:do{if((k|0)==(o|0)){S=k}else{K=k;while(1){I=K+4|0;if((c[K>>2]|0)==(r|0)){S=K;break L55}if((I|0)==(o|0)){S=o;break}else{K=I}}}}while(0);r=S-k>>2;S=k+(r+1<<2)|0;K=o-S|0;Lb(k+(r<<2)|0,S|0,K|0)|0;S=k+((K>>2)+r<<2)|0;r=c[n>>2]|0;if((S|0)==(r|0)){K1(m);T=y;U=0;V=T;W=x;bg(V|0)}c[n>>2]=r+(~((r-4+(-S|0)|0)>>>2)<<2);K1(m);T=y;U=0;V=T;W=x;bg(V|0);return 0}function lL(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;e=i;i=i+80|0;f=e|0;g=e+16|0;h=e+24|0;j=e+32|0;k=e+48|0;l=e+64|0;m=c[d+28>>2]|0;c[h>>2]=0;n=b+48|0;o=c[n>>2]|0;if((o|0)==(c[b+52>>2]|0)){mU(b+44|0,h)}else{if((o|0)==0){p=0}else{c[o>>2]=0;p=c[n>>2]|0}c[n>>2]=p+4}p=c[d+44>>2]|0;if((p|0)==0){q=0}else{o=c[(c[p>>2]|0)+24>>2]|0;h=hj(c[b+12>>2]|0,0,c[b+16>>2]|0,c[b+56>>2]|0,0,0)|0;q=cU[o&1023](p|0,h)|0}if((m|0)==0){r=0}else{h=cU[c[(c[m>>2]|0)+16>>2]&1023](m,b|0)|0;r=cC[c[(c[h>>2]|0)+40>>2]&511](h)|0}h=c[b+4>>2]|0;b=K$(48)|0;c[g>>2]=b;m=h+4|0;p=c[m>>2]|0;if((p|0)==(c[h+8>>2]|0)){e4(h|0,g);s=c[g>>2]|0}else{if((p|0)==0){t=0}else{c[p>>2]=b;t=c[m>>2]|0}c[m>>2]=t+4;s=b}b=s;t=s;p=d+4|0;L21:do{if((a[p]&1)==0){g=j;c[g>>2]=c[p>>2];c[g+4>>2]=c[p+4>>2];c[g+8>>2]=c[p+8>>2];u=25}else{g=c[d+12>>2]|0;o=c[d+8>>2]|0;do{if(o>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(o>>>0<11>>>0){a[j]=o<<1;v=j+1|0}else{w=o+16&-16;x=(z=0,au(246,w|0)|0);if(z){z=0;break}c[j+8>>2]=x;c[j>>2]=w|1;c[j+4>>2]=o;v=x}La(v|0,g|0,o)|0;a[v+o|0]=0;u=25;break L21}}while(0);o=bS(-1,-1)|0;y=M;A=o}}while(0);do{if((u|0)==25){v=k;p=d+16|0;c[v>>2]=c[p>>2];c[v+4>>2]=c[p+4>>2];c[v+8>>2]=c[p+8>>2];p=d+32|0;L36:do{if((a[p]&1)==0){o=l;c[o>>2]=c[p>>2];c[o+4>>2]=c[p+4>>2];c[o+8>>2]=c[p+8>>2];u=35}else{o=c[d+40>>2]|0;g=c[d+36>>2]|0;do{if(g>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(g>>>0<11>>>0){a[l]=g<<1;B=l+1|0}else{x=g+16&-16;w=(z=0,au(246,x|0)|0);if(z){z=0;break}c[l+8>>2]=w;c[l>>2]=x|1;c[l+4>>2]=g;B=w}La(B|0,o|0,g)|0;a[B+g|0]=0;u=35;break L36}}while(0);g=bS(-1,-1)|0;C=M;D=g}}while(0);do{if((u|0)==35){p=f;c[p>>2]=c[v>>2];c[p+4>>2]=c[v+4>>2];c[p+8>>2]=c[v+8>>2];z=0;aD(8,t|0,j|0,f|0,l|0,q|0,r|0);if(z){z=0;p=bS(-1,-1)|0;g=p;p=M;if((a[l]&1)==0){C=p;D=g;break}K1(c[l+8>>2]|0);C=p;D=g;break}if((a[l]&1)!=0){K1(c[l+8>>2]|0)}if((a[j]&1)==0){E=c[n>>2]|0;F=E-4|0;c[n>>2]=F;G=s;i=e;return G|0}K1(c[j+8>>2]|0);E=c[n>>2]|0;F=E-4|0;c[n>>2]=F;G=s;i=e;return G|0}}while(0);if((a[j]&1)==0){y=C;A=D;break}K1(c[j+8>>2]|0);y=C;A=D}}while(0);D=c[h>>2]|0;h=c[m>>2]|0;L65:do{if((D|0)==(h|0)){H=D}else{C=D;while(1){j=C+4|0;if((c[C>>2]|0)==(s|0)){H=C;break L65}if((j|0)==(h|0)){H=h;break}else{C=j}}}}while(0);s=H-D>>2;H=D+(s+1<<2)|0;C=h-H|0;Lb(D+(s<<2)|0,H|0,C|0)|0;H=D+((C>>2)+s<<2)|0;s=c[m>>2]|0;if((H|0)==(s|0)){K1(b);I=A;J=0;K=I;L=y;bg(K|0)}c[m>>2]=s+(~((s-4+(-H|0)|0)>>>2)<<2);K1(b);I=A;J=0;K=I;L=y;bg(K|0);return 0}function lM(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0;e=i;i=i+88|0;f=e|0;g=e+16|0;h=e+32|0;j=e+48|0;k=e+56|0;l=e+72|0;m=c[d+28>>2]|0;n=c[(c[m>>2]|0)+20>>2]|0;o=b+8|0;p=b+16|0;q=b+56|0;r=iI(c[o>>2]|0,c[p>>2]|0,c[q>>2]|0)|0;s=cU[n&1023](m,r)|0;r=c[b+4>>2]|0;b=K$(40)|0;c[j>>2]=b;m=r+4|0;n=c[m>>2]|0;if((n|0)==(c[r+8>>2]|0)){e4(r|0,j);t=c[j>>2]|0}else{if((n|0)==0){u=0}else{c[n>>2]=b;u=c[m>>2]|0}c[m>>2]=u+4;t=b}b=t;u=d+4|0;L8:do{if((a[u]&1)==0){n=k;c[n>>2]=c[u>>2];c[n+4>>2]=c[u+4>>2];c[n+8>>2]=c[u+8>>2];v=16}else{n=c[d+12>>2]|0;j=c[d+8>>2]|0;do{if(j>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(j>>>0<11>>>0){a[k]=j<<1;w=k+1|0}else{x=j+16&-16;y=(z=0,au(246,x|0)|0);if(z){z=0;break}c[k+8>>2]=y;c[k>>2]=x|1;c[k+4>>2]=j;w=y}La(w|0,n|0,j)|0;a[w+j|0]=0;v=16;break L8}}while(0);j=bS(-1,-1)|0;A=M;B=j}}while(0);do{if((v|0)==16){w=l;u=d+16|0;c[w>>2]=c[u>>2];c[w+4>>2]=c[u+4>>2];c[w+8>>2]=c[u+8>>2];u=c[d+32>>2]|0;j=c[(c[u>>2]|0)+20>>2]|0;n=(z=0,az(42,c[o>>2]|0,c[p>>2]|0,c[q>>2]|0)|0);do{if(!z){y=(z=0,aM(j|0,u|0,n|0)|0);if(z){z=0;v=37;break}x=a[d+36|0]&1;C=h;c[C>>2]=c[w>>2];c[C+4>>2]=c[w+4>>2];c[C+8>>2]=c[w+8>>2];D=f;E=g;F=t;G=k;H=a[G]|0;I=(H&1)==0;if(I){c[D>>2]=c[G>>2];c[D+4>>2]=c[G+4>>2];c[D+8>>2]=c[G+8>>2]}else{G=c[k+8>>2]|0;J=c[k+4>>2]|0;if(J>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;v=37;break}return 0}if(J>>>0<11>>>0){a[D]=J<<1;K=f+1|0}else{L=J+16&-16;N=(z=0,au(246,L|0)|0);if(z){z=0;v=37;break}c[f+8>>2]=N;c[f>>2]=L|1;c[f+4>>2]=J;K=N}La(K|0,G|0,J)|0;a[K+J|0]=0}c[E>>2]=c[C>>2];c[E+4>>2]=c[C+4>>2];c[E+8>>2]=c[C+8>>2];z=0;aR(412,F|0,f|0,g|0);if(z){z=0;C=bS(-1,-1)|0;E=M;if((a[D]&1)==0){O=E;P=C;Q=H;break}K1(c[f+8>>2]|0);O=E;P=C;Q=H;break}if((a[D]&1)!=0){K1(c[f+8>>2]|0)}c[t>>2]=21568;c[t+28>>2]=s;c[t+32>>2]=y;a[t+36|0]=x;if(I){i=e;return F|0}K1(c[k+8>>2]|0);i=e;return F|0}else{z=0;v=37}}while(0);if((v|0)==37){w=bS(-1,-1)|0;O=M;P=w;Q=a[k]|0}w=P;n=O;if((Q&1)==0){A=n;B=w;break}K1(c[k+8>>2]|0);A=n;B=w}}while(0);k=c[r>>2]|0;r=c[m>>2]|0;L55:do{if((k|0)==(r|0)){R=k}else{Q=k;while(1){O=Q+4|0;if((c[Q>>2]|0)==(t|0)){R=Q;break L55}if((O|0)==(r|0)){R=r;break}else{Q=O}}}}while(0);t=R-k>>2;R=k+(t+1<<2)|0;Q=r-R|0;Lb(k+(t<<2)|0,R|0,Q|0)|0;R=k+((Q>>2)+t<<2)|0;t=c[m>>2]|0;if((R|0)==(t|0)){K1(b);S=B;T=0;U=S;V=A;bg(U|0)}c[m>>2]=t+(~((t-4+(-R|0)|0)>>>2)<<2);K1(b);S=B;T=0;U=S;V=A;bg(U|0);return 0}function lN(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0;e=i;i=i+48|0;f=e|0;g=e+16|0;h=e+32|0;j=d+28|0;if((a[j]&1)==0){k=f;c[k>>2]=c[j>>2];c[k+4>>2]=c[j+4>>2];c[k+8>>2]=c[j+8>>2];l=a[k]|0;m=k}else{k=c[d+36>>2]|0;j=c[d+32>>2]|0;if(j>>>0>4294967279>>>0){DE(0);return 0}if(j>>>0<11>>>0){n=j<<1&255;o=f;a[o]=n;p=f+1|0;q=n;r=o}else{o=j+16&-16;n=K$(o)|0;c[f+8>>2]=n;s=o|1;c[f>>2]=s;c[f+4>>2]=j;p=n;q=s&255;r=f}La(p|0,k|0,j)|0;a[p+j|0]=0;l=q;m=r}r=b+16|0;q=c[r>>2]|0;do{if((l&1)==0){j=g;c[j>>2]=c[m>>2];c[j+4>>2]=c[m+4>>2];c[j+8>>2]=c[m+8>>2];t=19}else{j=c[f+8>>2]|0;p=c[f+4>>2]|0;if(p>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;t=39;break}return 0}if(p>>>0<11>>>0){a[g]=p<<1;u=g+1|0}else{k=p+16&-16;s=(z=0,au(246,k|0)|0);if(z){z=0;t=39;break}c[g+8>>2]=s;c[g>>2]=k|1;c[g+4>>2]=p;u=s}La(u|0,j|0,p)|0;a[u+p|0]=0;t=19}}while(0);L24:do{if((t|0)==19){u=(z=0,aM(554,q|0,g|0)|0);if(z){z=0;l=bS(-1,-1)|0;p=l;l=M;if((a[g]&1)==0){v=p;w=l;break}K1(c[g+8>>2]|0);v=p;w=l;break}if((a[g]&1)!=0){K1(c[g+8>>2]|0)}do{if(u){if((a[d+44|0]&1)!=0){break}l=c[d+40>>2]|0;p=c[(c[l>>2]|0)+20>>2]|0;j=(z=0,az(42,c[b+8>>2]|0,c[r>>2]|0,c[b+56>>2]|0)|0);if(z){z=0;t=39;break L24}s=(z=0,aM(p|0,l|0,j|0)|0);if(z){z=0;t=39;break L24}j=s|0;s=c[r>>2]|0;if((a[m]&1)==0){l=h;c[l>>2]=c[m>>2];c[l+4>>2]=c[m+4>>2];c[l+8>>2]=c[m+8>>2]}else{l=c[f+8>>2]|0;p=c[f+4>>2]|0;if(p>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;t=39;break L24}return 0}if(p>>>0<11>>>0){a[h]=p<<1;x=h+1|0}else{k=p+16&-16;n=(z=0,au(246,k|0)|0);if(z){z=0;t=39;break L24}c[h+8>>2]=n;c[h>>2]=k|1;c[h+4>>2]=p;x=n}La(x|0,l|0,p)|0;a[x+p|0]=0}p=(z=0,aM(90,s|0,h|0)|0);if(!z){c[p>>2]=j;if((a[h]&1)==0){break}K1(c[h+8>>2]|0);break}else{z=0;j=bS(-1,-1)|0;p=j;j=M;if((a[h]&1)==0){v=p;w=j;break L24}K1(c[h+8>>2]|0);v=p;w=j;break L24}}else{j=c[d+40>>2]|0;p=c[(c[j>>2]|0)+20>>2]|0;s=(z=0,az(42,c[b+8>>2]|0,c[r>>2]|0,c[b+56>>2]|0)|0);if(z){z=0;t=39;break L24}l=(z=0,aM(p|0,j|0,s|0)|0);if(z){z=0;t=39;break L24}s=(z=0,aM(178,c[r>>2]|0,f|0)|0);if(z){z=0;t=39;break L24}c[s>>2]=l}}while(0);if((a[m]&1)==0){i=e;return 0}K1(c[f+8>>2]|0);i=e;return 0}}while(0);if((t|0)==39){t=bS(-1,-1)|0;v=t;w=M}if((a[m]&1)==0){y=v;A=0;B=y;C=w;bg(B|0)}K1(c[f+8>>2]|0);y=v;A=0;B=y;C=w;bg(B|0);return 0}function lO(a,b){a=a|0;b=b|0;return b|0}function lP(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0;e=i;i=i+24|0;f=e|0;g=e+8|0;h=(c[b+4>>2]|0)+52|0;j=d+28|0;if((a[j]&1)==0){k=g;c[k>>2]=c[j>>2];c[k+4>>2]=c[j+4>>2];c[k+8>>2]=c[j+8>>2]}else{j=c[d+36>>2]|0;k=c[d+32>>2]|0;if(k>>>0>4294967279>>>0){DE(0);return 0}if(k>>>0<11>>>0){a[g]=k<<1;l=g+1|0}else{d=k+16&-16;m=K$(d)|0;c[g+8>>2]=m;c[g>>2]=d|1;c[g+4>>2]=k;l=m}La(l|0,j|0,k)|0;a[l+k|0]=0}k=(z=0,aM(504,h|0,g|0)|0);L12:do{if(!z){h=c[k>>2]|0;l=c[(c[b+24>>2]|0)-4>>2]|0;j=h+32|0;m=c[j>>2]|0;d=(c[h+36>>2]|0)-m>>2;L14:do{if((d|0)!=0){h=b|0;n=l+28|0;o=l+36|0;p=l+40|0;q=l+32|0;r=n;s=0;t=m;while(1){u=c[t+(s<<2)>>2]|0;v=(z=0,aM(c[(c[u>>2]|0)+16>>2]|0,u|0,h|0)|0);if(z){z=0;break}if((v|0)!=0){c[f>>2]=v;u=c[o>>2]|0;if((u|0)==(c[p>>2]|0)){z=0;as(484,q|0,f|0);if(z){z=0;break}w=c[f>>2]|0}else{if((u|0)==0){x=0}else{c[u>>2]=v;x=c[o>>2]|0}c[o>>2]=x+4;w=v}z=0;as(c[c[r>>2]>>2]|0,n|0,w|0);if(z){z=0;break}}v=s+1|0;if(v>>>0>=d>>>0){break L14}s=v;t=c[j>>2]|0}t=bS(-1,-1)|0;y=M;A=t;break L12}}while(0);if((a[g]&1)==0){i=e;return 0}K1(c[g+8>>2]|0);i=e;return 0}else{z=0;j=bS(-1,-1)|0;y=M;A=j}}while(0);if((a[g]&1)==0){bg(A|0)}K1(c[g+8>>2]|0);bg(A|0);return 0}function lQ(a,b){a=a|0;b=b|0;var d=0,e=0;d=c[(c[b>>2]|0)+20>>2]|0;e=iI(c[a+8>>2]|0,c[a+16>>2]|0,c[a+56>>2]|0)|0;cU[d&1023](b,e)|0;return 0}function lR(a,b){a=a|0;b=b|0;return b|0}function lS(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;d=i;i=i+16|0;e=d|0;f=d+8|0;g=c[b+28>>2]|0;h=c[(c[g>>2]|0)+20>>2]|0;j=iI(c[a+8>>2]|0,c[a+16>>2]|0,c[a+56>>2]|0)|0;k=cU[h&1023](g|0,j)|0;if(cC[c[(c[k>>2]|0)+36>>2]&511](k)|0){k=c[b+32>>2]|0;j=c[(c[a+24>>2]|0)-4>>2]|0;g=k+32|0;h=c[g>>2]|0;l=(c[k+36>>2]|0)-h>>2;if((l|0)==0){i=d;return 0}k=a|0;m=j+28|0;n=j+36|0;o=j+40|0;p=j+32|0;j=m;q=0;r=h;while(1){h=c[r+(q<<2)>>2]|0;s=cU[c[(c[h>>2]|0)+16>>2]&1023](h|0,k)|0;if((s|0)!=0){c[e>>2]=s;h=c[n>>2]|0;if((h|0)==(c[o>>2]|0)){mR(p,e);t=c[e>>2]|0}else{if((h|0)==0){u=0}else{c[h>>2]=s;u=c[n>>2]|0}c[n>>2]=u+4;t=s}cA[c[c[j>>2]>>2]&1023](m,t);}s=q+1|0;if(s>>>0>=l>>>0){break}q=s;r=c[g>>2]|0}i=d;return 0}g=c[b+36>>2]|0;if((g|0)==0){i=d;return 0}b=c[(c[a+24>>2]|0)-4>>2]|0;r=g+32|0;q=c[r>>2]|0;l=(c[g+36>>2]|0)-q>>2;if((l|0)==0){i=d;return 0}g=a|0;a=b+28|0;t=b+36|0;m=b+40|0;j=b+32|0;b=a;u=0;n=q;while(1){q=c[n+(u<<2)>>2]|0;e=cU[c[(c[q>>2]|0)+16>>2]&1023](q|0,g)|0;if((e|0)!=0){c[f>>2]=e;q=c[t>>2]|0;if((q|0)==(c[m>>2]|0)){mR(j,f);v=c[f>>2]|0}else{if((q|0)==0){w=0}else{c[q>>2]=e;w=c[t>>2]|0}c[t>>2]=w+4;v=e}cA[c[c[b>>2]>>2]&1023](a,v);}e=u+1|0;if(e>>>0>=l>>>0){break}u=e;n=c[r>>2]|0}i=d;return 0}function lT(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0.0,$=0.0,aa=0.0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,at=0,av=0,aw=0,ax=0,ay=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0.0,bd=0,be=0,bf=0,bh=0,bi=0,bj=0,bk=0,bl=0,bm=0,bn=0,bo=0,bp=0,bq=0,br=0,bs=0,bt=0,bu=0,bv=0,bw=0,bx=0,by=0,bz=0,bA=0;e=i;i=i+280|0;f=e|0;g=e+16|0;j=e+24|0;k=e+32|0;l=e+48|0;m=e+56|0;n=e+72|0;o=e+88|0;p=e+104|0;q=e+120|0;r=e+136|0;s=e+152|0;t=e+168|0;u=e+184|0;v=e+200|0;w=e+216|0;x=e+232|0;y=e+248|0;A=e+264|0;B=d+32|0;if((a[B]&1)==0){C=m;c[C>>2]=c[B>>2];c[C+4>>2]=c[B+4>>2];c[C+8>>2]=c[B+8>>2]}else{B=c[d+40>>2]|0;C=c[d+36>>2]|0;if(C>>>0>4294967279>>>0){DE(0);return 0}if(C>>>0<11>>>0){a[m]=C<<1;D=m+1|0}else{E=C+16&-16;F=K$(E)|0;c[m+8>>2]=F;c[m>>2]=E|1;c[m+4>>2]=C;D=F}La(D|0,B|0,C)|0;a[D+C|0]=0}C=c[d+44>>2]|0;D=c[(c[C>>2]|0)+20>>2]|0;B=b+8|0;F=b+16|0;E=b+56|0;G=(z=0,az(42,c[B>>2]|0,c[F>>2]|0,c[E>>2]|0)|0);L12:do{if(!z){H=(z=0,aM(D|0,C|0,G|0)|0);if(z){z=0;I=28;break}L15:do{if((c[H+32>>2]|0)!=2){J=(z=0,au(246,48)|0);if(z){z=0;I=28;break L12}K=n+8|0;c[K>>2]=J;c[n>>2]=49;c[n+4>>2]=47;La(J|0,7248,47)|0;a[J+47|0]=0;J=H+4|0;L18:do{if((a[J]&1)==0){L=o;c[L>>2]=c[J>>2];c[L+4>>2]=c[J+4>>2];c[L+8>>2]=c[J+8>>2];I=23}else{L=c[H+12>>2]|0;N=c[H+8>>2]|0;do{if(N>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(N>>>0<11>>>0){a[o]=N<<1;O=o+1|0}else{P=N+16&-16;Q=(z=0,au(246,P|0)|0);if(z){z=0;break}c[o+8>>2]=Q;c[o>>2]=P|1;c[o+4>>2]=N;O=Q}La(O|0,L|0,N)|0;a[O+N|0]=0;I=23;break L18}}while(0);N=bS(-1,-1)|0;R=N;S=M}}while(0);do{if((I|0)==23){J=p;N=H+16|0;c[J>>2]=c[N>>2];c[J+4>>2]=c[N+4>>2];c[J+8>>2]=c[N+8>>2];z=0;aV(46,n|0,o|0,p|0,c[E>>2]|0);if(z){z=0;N=bS(-1,-1)|0;J=N;N=M;if((a[o]&1)==0){R=J;S=N;break}K1(c[o+8>>2]|0);R=J;S=N;break}if((a[o]&1)!=0){K1(c[o+8>>2]|0)}if((a[n]&1)==0){break L15}K1(c[K>>2]|0);break L15}}while(0);if((a[n]&1)==0){T=R;U=S;break L12}K1(c[K>>2]|0);T=R;U=S;break L12}}while(0);N=c[d+48>>2]|0;J=c[(c[N>>2]|0)+20>>2]|0;L=(z=0,az(42,c[B>>2]|0,c[F>>2]|0,c[E>>2]|0)|0);if(z){z=0;I=28;break}Q=(z=0,aM(J|0,N|0,L|0)|0);if(z){z=0;I=28;break}L46:do{if((c[Q+32>>2]|0)!=2){L=(z=0,au(246,48)|0);if(z){z=0;I=28;break L12}N=q+8|0;c[N>>2]=L;c[q>>2]=49;c[q+4>>2]=47;La(L|0,5632,47)|0;a[L+47|0]=0;L=Q+4|0;L49:do{if((a[L]&1)==0){J=r;c[J>>2]=c[L>>2];c[J+4>>2]=c[L+4>>2];c[J+8>>2]=c[L+8>>2];I=48}else{J=c[Q+12>>2]|0;P=c[Q+8>>2]|0;do{if(P>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(P>>>0<11>>>0){a[r]=P<<1;V=r+1|0}else{W=P+16&-16;X=(z=0,au(246,W|0)|0);if(z){z=0;break}c[r+8>>2]=X;c[r>>2]=W|1;c[r+4>>2]=P;V=X}La(V|0,J|0,P)|0;a[V+P|0]=0;I=48;break L49}}while(0);P=bS(-1,-1)|0;Y=P;Z=M}}while(0);do{if((I|0)==48){L=s;K=Q+16|0;c[L>>2]=c[K>>2];c[L+4>>2]=c[K+4>>2];c[L+8>>2]=c[K+8>>2];z=0;aV(46,q|0,r|0,s|0,c[E>>2]|0);if(z){z=0;K=bS(-1,-1)|0;L=K;K=M;if((a[r]&1)==0){Y=L;Z=K;break}K1(c[r+8>>2]|0);Y=L;Z=K;break}if((a[r]&1)!=0){K1(c[r+8>>2]|0)}if((a[q]&1)==0){break L46}K1(c[N>>2]|0);break L46}}while(0);if((a[q]&1)==0){T=Y;U=Z;break L12}K1(c[N>>2]|0);T=Y;U=Z;break L12}}while(0);_=+h[H+40>>3];$=+h[Q+40>>3];if((a[d+52|0]&1)==0){aa=$}else{aa=$+1.0}K=t+4|0;c[K>>2]=0;c[t+8>>2]=0;c[t>>2]=K;K=t+12|0;c[K>>2]=0;L=b+4|0;P=c[L>>2]|0;J=(z=0,au(246,72)|0);L78:do{if(!z){X=J;c[l>>2]=X;W=P+4|0;ab=c[W>>2]|0;if((ab|0)==(c[P+8>>2]|0)){z=0;as(378,P|0,l|0);if(z){z=0;I=148;break}ac=c[l>>2]|0}else{if((ab|0)==0){ad=0}else{c[ab>>2]=X;ad=c[W>>2]|0}c[W>>2]=ad+4;ac=X}X=ac;ab=ac;ae=H+4|0;L88:do{if((a[ae]&1)==0){af=u;c[af>>2]=c[ae>>2];c[af+4>>2]=c[ae+4>>2];c[af+8>>2]=c[ae+8>>2];I=77}else{af=c[H+12>>2]|0;ag=c[H+8>>2]|0;do{if(ag>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(ag>>>0<11>>>0){a[u]=ag<<1;ah=u+1|0}else{ai=ag+16&-16;aj=(z=0,au(246,ai|0)|0);if(z){z=0;break}c[u+8>>2]=aj;c[u>>2]=ai|1;c[u+4>>2]=ag;ah=aj}La(ah|0,af|0,ag)|0;a[ah+ag|0]=0;I=77;break L88}}while(0);ag=bS(-1,-1)|0;ak=M;al=ag}}while(0);do{if((I|0)==77){N=H+16|0;ag=k;c[ag>>2]=c[N>>2];c[ag+4>>2]=c[N+4>>2];c[ag+8>>2]=c[N+8>>2];ag=v;a[ag]=0;a[v+1|0]=0;z=0;aG(2,ab|0,u|0,k|0,+_,v|0);do{if(!z){af=m;aj=(a[af]&1)==0;if(aj){ai=w;c[ai>>2]=c[af>>2];c[ai+4>>2]=c[af+4>>2];c[ai+8>>2]=c[af+8>>2]}else{ai=c[m+8>>2]|0;am=c[m+4>>2]|0;if(am>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;an=0;I=151;break}return 0}if(am>>>0<11>>>0){a[w]=am<<1;ao=w+1|0}else{ap=am+16&-16;aq=(z=0,au(246,ap|0)|0);if(z){z=0;an=0;I=151;break}c[w+8>>2]=aq;c[w>>2]=ap|1;c[w+4>>2]=am;ao=aq}La(ao|0,ai|0,am)|0;a[ao+am|0]=0}am=(z=0,aM(90,t|0,w|0)|0);if(z){z=0;ai=bS(-1,-1)|0;aq=ai;ai=M;if((a[w]&1)==0){at=aq;av=ai;aw=0;break}K1(c[w+8>>2]|0);at=aq;av=ai;aw=0;break}c[am>>2]=ac;if((a[w]&1)!=0){K1(c[w+8>>2]|0)}if((a[ag]&1)!=0){K1(c[v+8>>2]|0)}if((a[u]&1)!=0){K1(c[u+8>>2]|0)}am=c[F>>2]|0;c[K>>2]=am;c[F>>2]=t;ai=c[d+28>>2]|0;L131:do{if(_<aa){aq=b+24|0;ap=ai+36|0;ax=ai+32|0;ay=x;aA=y;aB=y+1|0;aC=A;aD=x+8|0;aE=y+8|0;aF=A+8|0;aH=m+8|0;aI=m+4|0;aJ=A+1|0;aK=A|0;aL=A+4|0;aN=H+12|0;aO=H+8|0;aP=x+1|0;aQ=x|0;aR=x+4|0;aS=b|0;$=_;L133:while(1){aT=c[(c[aq>>2]|0)-4>>2]|0;aU=c[ax>>2]|0;aW=(c[ap>>2]|0)-aU>>2;L135:do{if((aW|0)!=0){aX=aT+28|0;aY=aT+36|0;aZ=aT+40|0;a_=aT+32|0;a$=aX;a0=0;a1=aU;while(1){a2=c[a1+(a0<<2)>>2]|0;a3=(z=0,aM(c[(c[a2>>2]|0)+16>>2]|0,a2|0,aS|0)|0);if(z){z=0;I=146;break L133}if((a3|0)!=0){c[j>>2]=a3;a2=c[aY>>2]|0;if((a2|0)==(c[aZ>>2]|0)){z=0;as(484,a_|0,j|0);if(z){z=0;I=146;break L133}a4=c[j>>2]|0}else{if((a2|0)==0){a5=0}else{c[a2>>2]=a3;a5=c[aY>>2]|0}c[aY>>2]=a5+4;a4=a3}z=0;as(c[c[a$>>2]>>2]|0,aX|0,a4|0);if(z){z=0;I=146;break L133}}a3=a0+1|0;if(a3>>>0>=aW>>>0){break L135}a0=a3;a1=c[ax>>2]|0}}}while(0);a6=c[L>>2]|0;aW=(z=0,au(246,72)|0);if(z){z=0;I=147;break}aU=aW;c[g>>2]=aU;a7=a6+4|0;aW=c[a7>>2]|0;if((aW|0)==(c[a6+8>>2]|0)){z=0;as(378,a6|0,g|0);if(z){z=0;I=147;break}a8=c[g>>2]|0}else{if((aW|0)==0){a9=0}else{c[aW>>2]=aU;a9=c[a7>>2]|0}c[a7>>2]=a9+4;a8=aU}ba=a8;aU=a8;if((a[ae]&1)==0){c[ay>>2]=c[ae>>2];c[ay+4>>2]=c[ae+4>>2];c[ay+8>>2]=c[ae+8>>2]}else{aW=c[aN>>2]|0;aT=c[aO>>2]|0;if(aT>>>0>4294967279>>>0){I=120;break}if(aT>>>0<11>>>0){a[ay]=aT<<1;bb=aP}else{a1=aT+16&-16;a0=(z=0,au(246,a1|0)|0);if(z){z=0;I=165;break}c[aD>>2]=a0;c[aQ>>2]=a1|1;c[aR>>2]=aT;bb=a0}La(bb|0,aW|0,aT)|0;a[bb+aT|0]=0}aT=f;c[aT>>2]=c[N>>2];c[aT+4>>2]=c[N+4>>2];c[aT+8>>2]=c[N+8>>2];bc=$+1.0;a[aA]=0;a[aB]=0;z=0;aG(2,aU|0,x|0,f|0,+bc,y|0);if(z){z=0;bd=1;I=168;break}aU=c[F>>2]|0;if(aj){c[aC>>2]=c[af>>2];c[aC+4>>2]=c[af+4>>2];c[aC+8>>2]=c[af+8>>2]}else{aT=c[aH>>2]|0;aW=c[aI>>2]|0;if(aW>>>0>4294967279>>>0){I=131;break}if(aW>>>0<11>>>0){a[aC]=aW<<1;be=aJ}else{a0=aW+16&-16;a1=(z=0,au(246,a0|0)|0);if(z){z=0;bd=0;I=168;break}c[aF>>2]=a1;c[aK>>2]=a0|1;c[aL>>2]=aW;be=a1}La(be|0,aT|0,aW)|0;a[be+aW|0]=0}aW=(z=0,aM(90,aU|0,A|0)|0);if(z){z=0;I=171;break}c[aW>>2]=a8;if((a[aC]&1)!=0){K1(c[aF>>2]|0)}if((a[aA]&1)!=0){K1(c[aE>>2]|0)}if((a[ay]&1)!=0){K1(c[aD>>2]|0)}if(bc<aa){$=bc}else{I=184;break}}do{if((I|0)==146){aL=bS(-1,-1)|0;bf=M;bh=aL;I=149;break L78}else if((I|0)==147){aL=bS(-1,-1)|0;bf=M;bh=aL;I=149;break L78}else if((I|0)==165){aL=bS(-1,-1)|0;bi=M;bj=aL;I=167}else if((I|0)==168){aL=bS(-1,-1)|0;bk=M;bl=aL;bm=bd;I=170}else if((I|0)==171){aL=bS(-1,-1)|0;aK=aL;aL=M;if((a[aC]&1)==0){bn=aK;bo=0;bp=aL;I=173;break}K1(c[aF>>2]|0);bn=aK;bo=0;bp=aL;I=173}else if((I|0)==184){bq=c[K>>2]|0;break L131}else if((I|0)==120){z=0;ar(88,0);if(!z){return 0}else{z=0;aL=bS(-1,-1)|0;bi=M;bj=aL;I=167;break}}else if((I|0)==131){z=0;ar(88,0);if(!z){return 0}else{z=0;aL=bS(-1,-1)|0;bk=M;bl=aL;bm=0;I=170;break}}}while(0);if((I|0)==167){br=bi;bs=bj}else if((I|0)==170){bn=bl;bo=bm;bp=bk;I=173}do{if((I|0)==173){if((a[aA]&1)!=0){K1(c[aE>>2]|0)}if((a[ay]&1)==0){if(bo){br=bp;bs=bn;break}else{bt=bn;bu=bp;break L78}}else{K1(c[aD>>2]|0);if(bo){br=bp;bs=bn;break}else{bt=bn;bu=bp;break L78}}}}while(0);aD=c[a6>>2]|0;ay=c[a7>>2]|0;L221:do{if((aD|0)==(ay|0)){bv=aD}else{aE=aD;while(1){aA=aE+4|0;if((c[aE>>2]|0)==(a8|0)){bv=aE;break L221}if((aA|0)==(ay|0)){bv=ay;break}else{aE=aA}}}}while(0);aE=bv-aD>>2;aA=aD+(aE+1<<2)|0;aF=ay-aA|0;Lb(aD+(aE<<2)|0,aA|0,aF|0)|0;aA=aD+((aF>>2)+aE<<2)|0;aE=c[a7>>2]|0;if((aA|0)!=(aE|0)){c[a7>>2]=aE+(~((aE-4+(-aA|0)|0)>>>2)<<2)}K1(ba);bt=bs;bu=br;break L78}else{bq=am}}while(0);c[F>>2]=bq;gX(t|0,c[t+4>>2]|0);if(aj){i=e;return 0}K1(c[m+8>>2]|0);i=e;return 0}else{z=0;an=1;I=151}}while(0);if((I|0)==151){N=bS(-1,-1)|0;at=N;av=M;aw=an}if((a[ag]&1)!=0){K1(c[v+8>>2]|0)}if((a[u]&1)==0){if(aw){ak=av;al=at;break}else{bt=at;bu=av;break L78}}else{K1(c[u+8>>2]|0);if(aw){ak=av;al=at;break}else{bt=at;bu=av;break L78}}}}while(0);ae=c[P>>2]|0;ab=c[W>>2]|0;L244:do{if((ae|0)==(ab|0)){bw=ae}else{N=ae;while(1){am=N+4|0;if((c[N>>2]|0)==(ac|0)){bw=N;break L244}if((am|0)==(ab|0)){bw=ab;break}else{N=am}}}}while(0);N=bw-ae>>2;ag=ae+(N+1<<2)|0;am=ab-ag|0;Lb(ae+(N<<2)|0,ag|0,am|0)|0;ag=ae+((am>>2)+N<<2)|0;N=c[W>>2]|0;if((ag|0)!=(N|0)){c[W>>2]=N+(~((N-4+(-ag|0)|0)>>>2)<<2)}K1(X);bt=al;bu=ak}else{z=0;I=148}}while(0);if((I|0)==148){P=bS(-1,-1)|0;bf=M;bh=P;I=149}if((I|0)==149){bt=bh;bu=bf}gX(t|0,c[t+4>>2]|0);T=bt;U=bu}else{z=0;I=28}}while(0);if((I|0)==28){I=bS(-1,-1)|0;T=I;U=M}if((a[m]&1)==0){bx=T;by=0;bz=bx;bA=U;bg(bz|0)}K1(c[m+8>>2]|0);bx=T;by=0;bz=bx;bA=U;bg(bz|0);return 0}function lU(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,at=0,av=0,aw=0,ax=0,ay=0,aA=0,aB=0,aC=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0;e=i;i=i+120|0;f=e|0;g=e+8|0;h=e+16|0;j=e+32|0;k=e+40|0;l=e+56|0;m=e+72|0;n=e+88|0;o=e+104|0;p=d+32|0;if((a[p]&1)==0){q=k;c[q>>2]=c[p>>2];c[q+4>>2]=c[p+4>>2];c[q+8>>2]=c[p+8>>2]}else{p=c[d+40>>2]|0;q=c[d+36>>2]|0;if(q>>>0>4294967279>>>0){DE(0);return 0}if(q>>>0<11>>>0){a[k]=q<<1;r=k+1|0}else{s=q+16&-16;t=K$(s)|0;c[k+8>>2]=t;c[k>>2]=s|1;c[k+4>>2]=q;r=t}La(r|0,p|0,q)|0;a[r+q|0]=0}q=c[d+44>>2]|0;r=c[(c[q>>2]|0)+20>>2]|0;p=b+8|0;t=b+16|0;s=b+56|0;u=(z=0,az(42,c[p>>2]|0,c[t>>2]|0,c[s>>2]|0)|0);L12:do{if(!z){v=(z=0,aM(r|0,q|0,u|0)|0);if(z){z=0;w=39;break}L15:do{if((c[v+32>>2]|0)==5){x=v}else{y=c[b+4>>2]|0;A=(z=0,au(246,60)|0);if(z){z=0;w=39;break L12}B=A;c[j>>2]=B;A=y+4|0;C=c[A>>2]|0;if((C|0)==(c[y+8>>2]|0)){z=0;as(378,y|0,j|0);if(z){z=0;w=39;break L12}D=c[j>>2]|0}else{if((C|0)==0){E=0}else{c[C>>2]=B;E=c[A>>2]|0}c[A>>2]=E+4;D=B}B=D;C=D;F=v+4|0;L27:do{if((a[F]&1)==0){G=l;c[G>>2]=c[F>>2];c[G+4>>2]=c[F+4>>2];c[G+8>>2]=c[F+8>>2];w=29}else{G=c[v+12>>2]|0;H=c[v+8>>2]|0;do{if(H>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(H>>>0<11>>>0){a[l]=H<<1;I=l+1|0}else{J=H+16&-16;K=(z=0,au(246,J|0)|0);if(z){z=0;break}c[l+8>>2]=K;c[l>>2]=J|1;c[l+4>>2]=H;I=K}La(I|0,G|0,H)|0;a[I+H|0]=0;w=29;break L27}}while(0);H=bS(-1,-1)|0;L=H;N=M}}while(0);do{if((w|0)==29){F=v+16|0;H=h;c[H>>2]=c[F>>2];c[H+4>>2]=c[F+4>>2];c[H+8>>2]=c[F+8>>2];z=0;aD(34,C|0,l|0,h|0,1,1,0);if(z){z=0;F=bS(-1,-1)|0;H=F;F=M;if((a[l]&1)==0){L=H;N=F;break}K1(c[l+8>>2]|0);L=H;N=F;break}if((a[l]&1)!=0){K1(c[l+8>>2]|0)}F=D+36|0;H=F;c[g>>2]=v;G=F+8|0;K=G;J=c[K>>2]|0;if((J|0)==(c[F+12>>2]|0)){z=0;as(372,F+4|0,g|0);if(z){z=0;w=39;break L12}O=c[g>>2]|0}else{if((J|0)==0){P=0}else{c[J>>2]=v;P=c[K>>2]|0}c[G>>2]=P+4;O=v}z=0;as(c[c[F>>2]>>2]|0,H|0,O|0);if(!z){x=C;break L15}else{z=0;w=39;break L12}}}while(0);C=c[y>>2]|0;H=c[A>>2]|0;L58:do{if((C|0)==(H|0)){Q=C}else{F=C;while(1){G=F+4|0;if((c[F>>2]|0)==(D|0)){Q=F;break L58}if((G|0)==(H|0)){Q=H;break}else{F=G}}}}while(0);y=Q-C>>2;F=C+(y+1<<2)|0;G=H-F|0;Lb(C+(y<<2)|0,F|0,G|0)|0;F=C+((G>>2)+y<<2)|0;y=c[A>>2]|0;if((F|0)!=(y|0)){c[A>>2]=y+(~((y-4+(-F|0)|0)>>>2)<<2)}K1(B);R=L;S=N;break L12}}while(0);v=m+4|0;c[v>>2]=0;c[m+8>>2]=0;c[m>>2]=v;v=m+12|0;c[v>>2]=0;F=k;y=(a[F]&1)==0;do{if(y){G=n;c[G>>2]=c[F>>2];c[G+4>>2]=c[F+4>>2];c[G+8>>2]=c[F+8>>2];w=60}else{G=c[k+8>>2]|0;K=c[k+4>>2]|0;if(K>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;w=97;break}return 0}if(K>>>0<11>>>0){a[n]=K<<1;T=n+1|0}else{J=K+16&-16;U=(z=0,au(246,J|0)|0);if(z){z=0;w=97;break}c[n+8>>2]=U;c[n>>2]=J|1;c[n+4>>2]=K;T=U}La(T|0,G|0,K)|0;a[T+K|0]=0;w=60}}while(0);L79:do{if((w|0)==60){K=(z=0,aM(90,m|0,n|0)|0);if(z){z=0;G=bS(-1,-1)|0;U=G;G=M;if((a[n]&1)==0){V=U;W=G;break}K1(c[n+8>>2]|0);V=U;W=G;break}c[K>>2]=0;if((a[n]&1)!=0){K1(c[n+8>>2]|0)}K=c[t>>2]|0;c[v>>2]=K;c[t>>2]=m;G=c[d+28>>2]|0;U=x+40|0;J=c[U>>2]|0;X=(c[x+44>>2]|0)-J>>2;do{if((X|0)==0){Y=K}else{Z=o;_=b+24|0;$=G+36|0;aa=G+32|0;ab=b|0;ac=o+8|0;ad=k+8|0;ae=k+4|0;af=o+1|0;ag=o|0;ah=o+4|0;ai=0;aj=J;ak=m;L90:while(1){al=c[aj+(ai<<2)>>2]|0;am=c[(c[al>>2]|0)+20>>2]|0;an=(z=0,az(42,c[p>>2]|0,ak|0,c[s>>2]|0)|0);if(z){z=0;w=96;break}ao=(z=0,aM(am|0,al|0,an|0)|0);if(z){z=0;w=96;break}an=ao|0;ao=c[t>>2]|0;if(y){c[Z>>2]=c[F>>2];c[Z+4>>2]=c[F+4>>2];c[Z+8>>2]=c[F+8>>2]}else{al=c[ad>>2]|0;am=c[ae>>2]|0;if(am>>>0>4294967279>>>0){w=70;break}if(am>>>0<11>>>0){a[Z]=am<<1;ap=af}else{aq=am+16&-16;at=(z=0,au(246,aq|0)|0);if(z){z=0;w=96;break}c[ac>>2]=at;c[ag>>2]=aq|1;c[ah>>2]=am;ap=at}La(ap|0,al|0,am)|0;a[ap+am|0]=0}am=(z=0,aM(90,ao|0,o|0)|0);if(z){z=0;w=101;break}c[am>>2]=an;if((a[Z]&1)!=0){K1(c[ac>>2]|0)}an=c[(c[_>>2]|0)-4>>2]|0;am=c[aa>>2]|0;ao=(c[$>>2]|0)-am>>2;L108:do{if((ao|0)!=0){al=an+28|0;at=an+36|0;aq=an+40|0;av=an+32|0;aw=al;ax=0;ay=am;while(1){aA=c[ay+(ax<<2)>>2]|0;aB=(z=0,aM(c[(c[aA>>2]|0)+16>>2]|0,aA|0,ab|0)|0);if(z){z=0;w=95;break L90}if((aB|0)!=0){c[f>>2]=aB;aA=c[at>>2]|0;if((aA|0)==(c[aq>>2]|0)){z=0;as(484,av|0,f|0);if(z){z=0;w=95;break L90}aC=c[f>>2]|0}else{if((aA|0)==0){aE=0}else{c[aA>>2]=aB;aE=c[at>>2]|0}c[at>>2]=aE+4;aC=aB}z=0;as(c[c[aw>>2]>>2]|0,al|0,aC|0);if(z){z=0;w=95;break L90}}aB=ax+1|0;if(aB>>>0>=ao>>>0){break L108}ax=aB;ay=c[aa>>2]|0}}}while(0);ao=ai+1|0;if(ao>>>0>=X>>>0){w=103;break}ai=ao;aj=c[U>>2]|0;ak=c[t>>2]|0}if((w|0)==95){ak=bS(-1,-1)|0;aF=M;aG=ak;w=98;break L79}else if((w|0)==96){ak=bS(-1,-1)|0;aF=M;aG=ak;w=98;break L79}else if((w|0)==101){ak=bS(-1,-1)|0;aj=ak;ak=M;if((a[Z]&1)==0){V=aj;W=ak;break L79}K1(c[ac>>2]|0);V=aj;W=ak;break L79}else if((w|0)==103){Y=c[v>>2]|0;break}else if((w|0)==70){z=0;ar(88,0);if(z){z=0;w=97;break L79}return 0}}}while(0);c[t>>2]=Y;gX(m|0,c[m+4>>2]|0);if(y){i=e;return 0}K1(c[k+8>>2]|0);i=e;return 0}}while(0);if((w|0)==97){y=bS(-1,-1)|0;aF=M;aG=y;w=98}if((w|0)==98){V=aG;W=aF}gX(m|0,c[m+4>>2]|0);R=V;S=W}else{z=0;w=39}}while(0);if((w|0)==39){w=bS(-1,-1)|0;R=w;S=M}if((a[k]&1)==0){aH=R;aI=0;aJ=aH;aK=S;bg(aJ|0)}K1(c[k+8>>2]|0);aH=R;aI=0;aJ=aH;aK=S;bg(aJ|0);return 0}function lV(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;d=i;i=i+8|0;e=d|0;f=c[b+32>>2]|0;g=c[b+28>>2]|0;b=f|0;h=f;f=a+8|0;j=a+16|0;k=a+56|0;l=a+24|0;m=g+36|0;n=g+32|0;g=a|0;L1:while(1){a=c[(c[h>>2]|0)+20>>2]|0;o=iI(c[f>>2]|0,c[j>>2]|0,c[k>>2]|0)|0;p=cU[a&1023](b,o)|0;if(!(cC[c[(c[p>>2]|0)+36>>2]&511](p)|0)){break}p=c[(c[l>>2]|0)-4>>2]|0;o=c[n>>2]|0;a=(c[m>>2]|0)-o>>2;if((a|0)==0){continue}q=p+28|0;r=p+36|0;s=p+40|0;t=p+32|0;p=q;u=0;v=o;while(1){o=c[v+(u<<2)>>2]|0;w=cU[c[(c[o>>2]|0)+16>>2]&1023](o|0,g)|0;if((w|0)!=0){c[e>>2]=w;o=c[r>>2]|0;if((o|0)==(c[s>>2]|0)){mR(t,e);x=c[e>>2]|0}else{if((o|0)==0){y=0}else{c[o>>2]=w;y=c[r>>2]|0}c[r>>2]=y+4;x=w}cA[c[c[p>>2]>>2]&1023](q,x);}w=u+1|0;if(w>>>0>=a>>>0){continue L1}u=w;v=c[n>>2]|0}}i=d;return 0}function lW(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;e=i;i=i+48|0;f=e|0;g=e+16|0;h=e+32|0;j=K$(48)|0;k=f+8|0;c[k>>2]=j;c[f>>2]=49;c[f+4>>2]=42;La(j|0,3104,42)|0;a[j+42|0]=0;j=d+4|0;L1:do{if((a[j]&1)==0){l=g;c[l>>2]=c[j>>2];c[l+4>>2]=c[j+4>>2];c[l+8>>2]=c[j+8>>2];m=11}else{l=c[d+12>>2]|0;n=c[d+8>>2]|0;do{if(n>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(n>>>0<11>>>0){a[g]=n<<1;o=g+1|0}else{p=n+16&-16;q=(z=0,au(246,p|0)|0);if(z){z=0;break}c[g+8>>2]=q;c[g>>2]=p|1;c[g+4>>2]=n;o=q}La(o|0,l|0,n)|0;a[o+n|0]=0;m=11;break L1}}while(0);n=bS(-1,-1)|0;r=M;s=n}}while(0);do{if((m|0)==11){o=h;j=d+16|0;c[o>>2]=c[j>>2];c[o+4>>2]=c[j+4>>2];c[o+8>>2]=c[j+8>>2];z=0;aV(46,f|0,g|0,h|0,c[b+56>>2]|0);if(z){z=0;j=bS(-1,-1)|0;o=j;j=M;if((a[g]&1)==0){r=j;s=o;break}K1(c[g+8>>2]|0);r=j;s=o;break}if((a[g]&1)!=0){K1(c[g+8>>2]|0)}if((a[f]&1)==0){i=e;return 0}K1(c[k>>2]|0);i=e;return 0}}while(0);if((a[f]&1)==0){t=s;u=0;v=t;w=r;bg(v|0)}K1(c[k>>2]|0);t=s;u=0;v=t;w=r;bg(v|0);return 0}function lX(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aN=0,aO=0,aP=0,aQ=0,aS=0,aT=0,aU=0,aW=0,aX=0,aY=0,aZ=0,a_=0;e=i;i=i+392|0;f=e|0;g=e+8|0;h=e+72|0;j=e+80|0;k=e+96|0;l=e+112|0;m=e+128|0;n=e+144|0;o=e+160|0;p=e+176|0;q=e+240|0;r=e+304|0;s=e+368|0;t=e+384|0;A6(h,0);u=c[(c[b+48>>2]|0)-4>>2]|0;if((u|0)==0){A8(h);i=e;return 0}v=c[d+28>>2]|0;d=c[(c[v>>2]|0)+24>>2]|0;w=b+56|0;x=(z=0,at(100,c[b+12>>2]|0,0,c[b+16>>2]|0,c[w>>2]|0,0,0)|0);L4:do{if(!z){y=(z=0,aM(d|0,v|0,x|0)|0);if(z){z=0;A=3;break}B=y+36|0;L7:do{if(((c[y+40>>2]|0)-(c[B>>2]|0)|0)!=4){C=(z=0,au(246,48)|0);if(z){z=0;A=3;break L4}D=j+8|0;c[D>>2]=C;c[j>>2]=49;c[j+4>>2]=35;La(C|0,1904,35)|0;a[C+35|0]=0;C=y+4|0;L10:do{if((a[C]&1)==0){E=k;c[E>>2]=c[C>>2];c[E+4>>2]=c[C+4>>2];c[E+8>>2]=c[C+8>>2];A=19}else{E=c[y+12>>2]|0;F=c[y+8>>2]|0;do{if(F>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(F>>>0<11>>>0){a[k]=F<<1;G=k+1|0}else{H=F+16&-16;I=(z=0,au(246,H|0)|0);if(z){z=0;break}c[k+8>>2]=I;c[k>>2]=H|1;c[k+4>>2]=F;G=I}La(G|0,E|0,F)|0;a[G+F|0]=0;A=19;break L10}}while(0);F=bS(-1,-1)|0;J=F;K=M}}while(0);do{if((A|0)==19){C=l;F=y+16|0;c[C>>2]=c[F>>2];c[C+4>>2]=c[F+4>>2];c[C+8>>2]=c[F+8>>2];z=0;aV(46,j|0,k|0,l|0,c[w>>2]|0);if(z){z=0;F=bS(-1,-1)|0;C=F;F=M;if((a[k]&1)==0){J=C;K=F;break}K1(c[k+8>>2]|0);J=C;K=F;break}if((a[k]&1)!=0){K1(c[k+8>>2]|0)}if((a[j]&1)==0){break L7}K1(c[D>>2]|0);break L7}}while(0);if((a[j]&1)==0){L=J;N=K;break L4}K1(c[D>>2]|0);L=J;N=K;break L4}}while(0);y=c[c[B>>2]>>2]|0;F=y+36|0;if((c[F>>2]|0)==0){A=31}else{if((c[y+40>>2]|0)!=0){A=31}}L38:do{if((A|0)==31){C=(z=0,au(246,48)|0);if(z){z=0;A=3;break L4}E=m+8|0;c[E>>2]=C;c[m>>2]=49;c[m+4>>2]=36;La(C|0,1184,36)|0;a[C+36|0]=0;C=y+4|0;L41:do{if((a[C]&1)==0){I=n;c[I>>2]=c[C>>2];c[I+4>>2]=c[C+4>>2];c[I+8>>2]=c[C+8>>2];A=42}else{I=c[y+12>>2]|0;H=c[y+8>>2]|0;do{if(H>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(H>>>0<11>>>0){a[n]=H<<1;O=n+1|0}else{P=H+16&-16;Q=(z=0,au(246,P|0)|0);if(z){z=0;break}c[n+8>>2]=Q;c[n>>2]=P|1;c[n+4>>2]=H;O=Q}La(O|0,I|0,H)|0;a[O+H|0]=0;A=42;break L41}}while(0);H=bS(-1,-1)|0;R=H;S=M}}while(0);do{if((A|0)==42){C=o;D=y+16|0;c[C>>2]=c[D>>2];c[C+4>>2]=c[D+4>>2];c[C+8>>2]=c[D+8>>2];z=0;aV(46,m|0,n|0,o|0,c[w>>2]|0);if(z){z=0;D=bS(-1,-1)|0;C=D;D=M;if((a[n]&1)==0){R=C;S=D;break}K1(c[n+8>>2]|0);R=C;S=D;break}if((a[n]&1)!=0){K1(c[n+8>>2]|0)}if((a[m]&1)==0){break L38}K1(c[E>>2]|0);break L38}}while(0);if((a[m]&1)==0){L=R;N=S;break L4}K1(c[E>>2]|0);L=R;N=S;break L4}}while(0);y=c[F>>2]|0;B=u+36|0;D=(c[u+40>>2]|0)-(c[B>>2]|0)>>2;if((D|0)==0){A8(h);i=e;return 0}C=q|0;H=q+60|0;I=p|0;Q=p+60|0;P=g|0;T=b+60|0;U=g+60|0;V=g|0;W=g+32|0;X=g+48|0;Y=g+52|0;Z=g+36|0;_=g+4|0;$=p|0;aa=p+32|0;ab=p+48|0;ac=p+52|0;ad=p+36|0;ae=p+4|0;af=q|0;ag=q+32|0;ah=q+48|0;ai=q+52|0;aj=q+36|0;ak=q+4|0;al=r|0;am=r+32|0;an=r+48|0;ao=r+52|0;ap=r+36|0;aq=r+4|0;av=b+72|0;aw=t|0;ax=t+4|0;ay=s|0;az=s+4|0;aA=r+12|0;aB=r+40|0;aC=q+12|0;aD=q+40|0;aE=p+12|0;aF=p+40|0;aG=g+12|0;aH=g+40|0;aI=0;while(1){z=0;as(324,r|0,y|0);if(z){z=0;A=2;break}aJ=c[(c[B>>2]|0)+(aI<<2)>>2]|0;z=0;as(324,C|0,r|0);if(z){z=0;A=99;break}c[H>>2]=aJ;z=0;as(324,I|0,C|0);if(z){z=0;A=100;break}c[Q>>2]=c[H>>2];z=0;as(324,P|0,I|0);if(z){z=0;A=101;break}c[U>>2]=c[Q>>2];z=0;aR(410,f|0,T|0,g|0);if(z){z=0;A=65;break}c[V>>2]=19920;c[W>>2]=19976;e9(X,c[Y>>2]|0);c[W>>2]=21792;aJ=c[Z>>2]|0;aK=aJ;if((aJ|0)!=0){aL=c[aH>>2]|0;if((aJ|0)!=(aL|0)){c[aH>>2]=aL+(~((aL-4+(-aK|0)|0)>>>2)<<2)}K1(aJ)}c[V>>2]=16664;if((a[_]&1)!=0){K1(c[aG>>2]|0)}c[$>>2]=19920;c[aa>>2]=19976;e9(ab,c[ac>>2]|0);c[aa>>2]=21792;aJ=c[ad>>2]|0;aK=aJ;if((aJ|0)!=0){aL=c[aF>>2]|0;if((aJ|0)!=(aL|0)){c[aF>>2]=aL+(~((aL-4+(-aK|0)|0)>>>2)<<2)}K1(aJ)}c[$>>2]=16664;if((a[ae]&1)!=0){K1(c[aE>>2]|0)}c[af>>2]=19920;c[ag>>2]=19976;e9(ah,c[ai>>2]|0);c[ag>>2]=21792;aJ=c[aj>>2]|0;aK=aJ;if((aJ|0)!=0){aL=c[aD>>2]|0;if((aJ|0)!=(aL|0)){c[aD>>2]=aL+(~((aL-4+(-aK|0)|0)>>>2)<<2)}K1(aJ)}c[af>>2]=16664;if((a[ak]&1)!=0){K1(c[aC>>2]|0)}c[al>>2]=19920;c[am>>2]=19976;e9(an,c[ao>>2]|0);c[am>>2]=21792;aJ=c[ap>>2]|0;aK=aJ;if((aJ|0)!=0){aL=c[aB>>2]|0;if((aJ|0)!=(aL|0)){c[aB>>2]=aL+(~((aL-4+(-aK|0)|0)>>>2)<<2)}K1(aJ)}c[al>>2]=16664;if((a[aq]&1)!=0){K1(c[aA>>2]|0)}z=0;as(108,s|0,y|0);if(z){z=0;A=2;break}c[aw>>2]=c[(c[B>>2]|0)+(aI<<2)>>2];c[ax>>2]=y;z=0;aR(216,av|0,s|0,t|0);if(z){z=0;A=120;break}aJ=c[ay>>2]|0;if((aJ|0)!=0){aK=c[az>>2]|0;if((aJ|0)==(aK|0)){aN=aJ}else{aL=aK;while(1){aK=aL-12|0;c[az>>2]=aK;if((a[aK]&1)==0){aO=aK}else{K1(c[aL-12+8>>2]|0);aO=c[az>>2]|0}if((aJ|0)==(aO|0)){break}else{aL=aO}}aN=c[ay>>2]|0}K1(aN)}aL=aI+1|0;if(aL>>>0<D>>>0){aI=aL}else{A=133;break}}do{if((A|0)==2){aI=bS(-1,-1)|0;aP=M;aQ=aI;A=4;break L4}else if((A|0)==133){A8(h);i=e;return 0}else if((A|0)==65){aI=bS(-1,-1)|0;D=M;c[V>>2]=19920;c[W>>2]=19976;e9(X,c[Y>>2]|0);c[W>>2]=21792;av=c[Z>>2]|0;y=av;if((av|0)!=0){ax=c[aH>>2]|0;if((av|0)!=(ax|0)){c[aH>>2]=ax+(~((ax-4+(-y|0)|0)>>>2)<<2)}K1(av)}c[V>>2]=16664;if((a[_]&1)==0){aS=D;aT=aI;A=102;break}K1(c[aG>>2]|0);aS=D;aT=aI;A=102}else if((A|0)==99){aI=bS(-1,-1)|0;aU=aI;aW=M}else if((A|0)==100){aI=bS(-1,-1)|0;aX=aI;aY=M;A=108}else if((A|0)==101){aI=bS(-1,-1)|0;aS=M;aT=aI;A=102}else if((A|0)==120){aI=bS(-1,-1)|0;D=aI;aI=M;av=c[ay>>2]|0;if((av|0)==0){L=D;N=aI;break L4}y=c[az>>2]|0;if((av|0)==(y|0)){aZ=av}else{ax=y;while(1){y=ax-12|0;c[az>>2]=y;if((a[y]&1)==0){a_=y}else{K1(c[ax-12+8>>2]|0);a_=c[az>>2]|0}if((av|0)==(a_|0)){break}else{ax=a_}}aZ=c[ay>>2]|0}K1(aZ);L=D;N=aI;break L4}}while(0);do{if((A|0)==102){ay=aT;az=aS;c[$>>2]=19920;c[aa>>2]=19976;e9(ab,c[ac>>2]|0);c[aa>>2]=21792;aG=c[ad>>2]|0;_=aG;if((aG|0)!=0){V=c[aF>>2]|0;if((aG|0)!=(V|0)){c[aF>>2]=V+(~((V-4+(-_|0)|0)>>>2)<<2)}K1(aG)}c[$>>2]=16664;if((a[ae]&1)==0){aX=ay;aY=az;A=108;break}K1(c[aE>>2]|0);aX=ay;aY=az;A=108}}while(0);do{if((A|0)==108){c[af>>2]=19920;c[ag>>2]=19976;e9(ah,c[ai>>2]|0);c[ag>>2]=21792;aE=c[aj>>2]|0;ae=aE;if((aE|0)!=0){$=c[aD>>2]|0;if((aE|0)!=($|0)){c[aD>>2]=$+(~(($-4+(-ae|0)|0)>>>2)<<2)}K1(aE)}c[af>>2]=16664;if((a[ak]&1)==0){aU=aX;aW=aY;break}K1(c[aC>>2]|0);aU=aX;aW=aY}}while(0);c[al>>2]=19920;c[am>>2]=19976;e9(an,c[ao>>2]|0);c[am>>2]=21792;aC=c[ap>>2]|0;ak=aC;if((aC|0)!=0){af=c[aB>>2]|0;if((aC|0)!=(af|0)){c[aB>>2]=af+(~((af-4+(-ak|0)|0)>>>2)<<2)}K1(aC)}c[al>>2]=16664;if((a[aq]&1)==0){L=aU;N=aW;break}K1(c[aA>>2]|0);L=aU;N=aW}else{z=0;A=3}}while(0);if((A|0)==3){aW=bS(-1,-1)|0;aP=M;aQ=aW;A=4}if((A|0)==4){L=aQ;N=aP}z=0;ar(444,h|0);if(!z){bg(L|0)}else{z=0;L=bS(-1,-1,0)|0;dk(L);return 0}return 0}function lY(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0;f=i;i=i+64|0;g=f|0;h=f+8|0;j=f+16|0;k=f+32|0;l=d|0;m=d+4|0;if((c[l>>2]|0)==(c[m>>2]|0)){n=ck(4)|0;c[n>>2]=9176;bJ(n|0,28568,0)}n=b+4|0;o=c[n>>2]|0;c[h>>2]=o-(c[b>>2]|0)>>3;if((o|0)==(c[b+8>>2]|0)){mP(b|0,e)}else{if((o|0)==0){p=0}else{c[o>>2]=c[e>>2];c[o+4>>2]=c[e+4>>2];p=c[n>>2]|0}c[n>>2]=p+8}p=j|0;n=j+4|0;c[n>>2]=0;e=j+8|0;c[e>>2]=0;o=j|0;c[o>>2]=n;n=c[m>>2]|0;q=c[l>>2]|0;r=(n-q|0)/12|0;if((n|0)==(q|0)){s=j+4|0;t=c[s>>2]|0;u=t;fc(p,u);i=f;return}n=j+4|0;v=0;w=q;while(1){q=w+(v*12|0)|0;x=e1(p,g,q)|0;if((c[x>>2]|0)==0){y=(z=0,au(246,28)|0);if(z){z=0;A=32;break}B=y+16|0;C=q;if((a[C]&1)==0){c[B>>2]=c[C>>2];c[B+4>>2]=c[C+4>>2];c[B+8>>2]=c[C+8>>2]}else{C=c[w+(v*12|0)+8>>2]|0;q=c[w+(v*12|0)+4>>2]|0;if(q>>>0>4294967279>>>0){A=15;break}if(q>>>0<11>>>0){a[B]=q<<1;D=y+17|0}else{E=q+16&-16;F=(z=0,au(246,E|0)|0);if(z){z=0;A=22;break}c[y+24>>2]=F;c[B>>2]=E|1;c[y+20>>2]=q;D=F}La(D|0,C|0,q)|0;a[D+q|0]=0}q=c[g>>2]|0;C=y;c[y>>2]=0;c[y+4>>2]=0;c[y+8>>2]=q;c[x>>2]=C;q=c[c[o>>2]>>2]|0;if((q|0)==0){G=C}else{c[o>>2]=q;G=c[x>>2]|0}e2(c[n>>2]|0,G);c[e>>2]=(c[e>>2]|0)+1}x=v+1|0;if(x>>>0>=r>>>0){A=34;break}v=x;w=c[l>>2]|0}do{if((A|0)==15){z=0;ar(88,0);if(z){z=0;w=bS(-1,-1)|0;H=M;I=w;A=24;break}}else if((A|0)==22){w=bS(-1,-1)|0;H=M;I=w;A=24}else if((A|0)==32){w=bS(-1,-1)|0;J=M;K=w}else if((A|0)==34){w=c[m>>2]|0;v=c[l>>2]|0;r=(w-v|0)/12|0;if((w|0)==(v|0)){s=j+4|0;t=c[s>>2]|0;u=t;fc(p,u);i=f;return}w=b+12|0;e=k+12|0;G=k+16|0;n=k|0;o=k+4|0;g=0;D=v;while(1){z=0,aM(376,w|0,D+(g*12|0)|0)|0;if(z){z=0;A=31;break}v=(z=0,aM(376,w|0,(c[l>>2]|0)+(g*12|0)|0)|0);if(z){z=0;A=31;break}z=0;aV(16,k|0,d|0,j|0,h|0);if(z){z=0;A=31;break}x=v+4|0;q=c[x>>2]|0;if((q|0)==(c[v+8>>2]|0)){z=0;as(576,v|0,k|0);if(z){z=0;A=54;break}}else{if((q|0)==0){L=0}else{z=0;as(538,q|0,k|0);if(z){z=0;A=54;break}L=c[x>>2]|0}c[x>>2]=L+28}fc(e,c[G>>2]|0);x=c[n>>2]|0;if((x|0)!=0){q=c[o>>2]|0;if((x|0)==(q|0)){N=x}else{v=q;while(1){q=v-12|0;c[o>>2]=q;if((a[q]&1)==0){O=q}else{K1(c[v-12+8>>2]|0);O=c[o>>2]|0}if((x|0)==(O|0)){break}else{v=O}}N=c[n>>2]|0}K1(N)}v=g+1|0;if(v>>>0>=r>>>0){A=66;break}g=v;D=c[l>>2]|0}if((A|0)==31){D=bS(-1,-1)|0;J=M;K=D;break}else if((A|0)==66){s=j+4|0;t=c[s>>2]|0;u=t;fc(p,u);i=f;return}else if((A|0)==54){D=bS(-1,-1)|0;g=D;D=M;fc(e,c[G>>2]|0);r=c[n>>2]|0;if((r|0)==0){P=D;Q=g;R=j+4|0;S=c[R>>2]|0;T=S;fc(p,T);U=Q;V=0;W=U;X=P;bg(W|0)}w=c[o>>2]|0;if((r|0)==(w|0)){Y=r}else{v=w;while(1){w=v-12|0;c[o>>2]=w;if((a[w]&1)==0){Z=w}else{K1(c[v-12+8>>2]|0);Z=c[o>>2]|0}if((r|0)==(Z|0)){break}else{v=Z}}Y=c[n>>2]|0}K1(Y);P=D;Q=g;R=j+4|0;S=c[R>>2]|0;T=S;fc(p,T);U=Q;V=0;W=U;X=P;bg(W|0)}}}while(0);do{if((A|0)==24){if((y|0)==0){J=H;K=I;break}K1(y);J=H;K=I}}while(0);P=J;Q=K;R=j+4|0;S=c[R>>2]|0;T=S;fc(p,T);U=Q;V=0;W=U;X=P;bg(W|0)}function lZ(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0;e=i;i=i+40|0;f=e|0;g=e+8|0;h=e+24|0;j=c[b+4>>2]|0;k=K$(72)|0;c[f>>2]=k;l=j+4|0;m=c[l>>2]|0;if((m|0)==(c[j+8>>2]|0)){e4(j|0,f);n=c[f>>2]|0}else{if((m|0)==0){o=0}else{c[m>>2]=k;o=c[l>>2]|0}c[l>>2]=o+4;n=k}k=n;z=0;as(638,n|0,d|0);if(z){z=0;o=bS(-1,-1)|0;m=o;o=M;f=c[j>>2]|0;j=c[l>>2]|0;L10:do{if((f|0)==(j|0)){p=f}else{q=f;while(1){r=q+4|0;if((c[q>>2]|0)==(n|0)){p=q;break L10}if((r|0)==(j|0)){p=j;break}else{q=r}}}}while(0);q=p-f>>2;p=f+(q+1<<2)|0;r=j-p|0;Lb(f+(q<<2)|0,p|0,r|0)|0;p=f+((r>>2)+q<<2)|0;q=c[l>>2]|0;if((p|0)!=(q|0)){c[l>>2]=q+(~((q-4+(-p|0)|0)>>>2)<<2)}K1(k);s=o;t=m;u=t;v=0;w=u;x=s;bg(w|0)}m=b+16|0;b=c[m>>2]|0;o=d+32|0;if((a[o]&1)==0){k=h;c[k>>2]=c[o>>2];c[k+4>>2]=c[o+4>>2];c[k+8>>2]=c[o+8>>2];y=a[k]|0;A=k}else{k=c[d+40>>2]|0;o=c[d+36>>2]|0;if(o>>>0>4294967279>>>0){DE(0);return 0}if(o>>>0<11>>>0){p=o<<1&255;q=h;a[q]=p;B=h+1|0;C=p;D=q}else{q=o+16&-16;p=K$(q)|0;c[h+8>>2]=p;l=q|1;c[h>>2]=l;c[h+4>>2]=o;B=p;C=l&255;D=h}La(B|0,k|0,o)|0;a[B+o|0]=0;y=C;A=D}D=((c[d+52>>2]|0)==0?560:12432)|0;d=g;Ld(d|0,0,12)|0;C=y&255;if((C&1|0)==0){E=C>>>1}else{E=c[h+4>>2]|0}if((y&1)==0){F=h+1|0}else{F=c[h+8>>2]|0}y=E+3|0;do{if(y>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;G=29;break}return 0}else{if(y>>>0<11>>>0){a[d]=E<<1;H=g+1|0}else{C=E+19&-16;o=(z=0,au(246,C|0)|0);if(z){z=0;G=29;break}c[g+8>>2]=o;c[g>>2]=C|1;c[g+4>>2]=E;H=o}La(H|0,F|0,E)|0;a[H+E|0]=0;z=0,az(84,g|0,D|0,3)|0;if(z){z=0;G=29;break}o=(z=0,aM(178,b|0,g|0)|0);if(z){z=0;C=bS(-1,-1)|0;B=C;C=M;if((a[d]&1)==0){I=C;J=B;break}K1(c[g+8>>2]|0);I=C;J=B;break}c[o>>2]=n;if((a[d]&1)!=0){K1(c[g+8>>2]|0)}if((a[A]&1)==0){K=c[m>>2]|0;L=n+48|0;N=K;c[L>>2]=N;i=e;return 0}K1(c[h+8>>2]|0);K=c[m>>2]|0;L=n+48|0;N=K;c[L>>2]=N;i=e;return 0}}while(0);if((G|0)==29){G=bS(-1,-1)|0;e=M;if((a[d]&1)!=0){K1(c[g+8>>2]|0)}I=e;J=G}if((a[A]&1)==0){s=I;t=J;u=t;v=0;w=u;x=s;bg(w|0)}K1(c[h+8>>2]|0);s=I;t=J;u=t;v=0;w=u;x=s;bg(w|0);return 0}function l_(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,at=0,av=0,aw=0,ax=0,ay=0,aA=0,aB=0,aC=0,aE=0,aF=0,aG=0,aH=0,aJ=0,aK=0,aL=0,aN=0,aO=0,aP=0,aQ=0,aS=0,aT=0,aU=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bh=0,bi=0,bj=0,bk=0,bl=0,bm=0,bn=0,bo=0,bp=0,bq=0,br=0,bs=0,bt=0,bu=0,bv=0,bw=0,bx=0,by=0,bz=0,bA=0,bB=0,bC=0,bD=0,bE=0,bF=0,bG=0,bH=0,bI=0,bJ=0,bK=0,bL=0,bM=0,bN=0,bO=0,bP=0,bQ=0,bR=0,bT=0,bU=0,bV=0,bW=0,bX=0,bY=0,bZ=0,b_=0,b$=0;e=i;i=i+448|0;f=e|0;g=e+8|0;h=e+24|0;j=e+40|0;k=e+48|0;l=e+56|0;m=e+72|0;n=e+88|0;o=e+104|0;p=e+120|0;q=e+136|0;r=e+152|0;s=e+168|0;t=e+184|0;u=e+200|0;v=e+240|0;w=e+256|0;x=e+272|0;y=e+288|0;A=e+304|0;B=e+320|0;C=e+336|0;D=e+352|0;F=e+368|0;G=e+384|0;H=e+400|0;I=e+416|0;J=e+432|0;K=d+32|0;if((a[K]&1)==0){L=n;c[L>>2]=c[K>>2];c[L+4>>2]=c[K+4>>2];c[L+8>>2]=c[K+8>>2];N=a[L]|0;O=L}else{L=c[d+40>>2]|0;P=c[d+36>>2]|0;if(P>>>0>4294967279>>>0){DE(0);return 0}if(P>>>0<11>>>0){Q=P<<1&255;R=n;a[R]=Q;S=n+1|0;T=Q;U=R}else{R=P+16&-16;Q=K$(R)|0;c[n+8>>2]=Q;V=R|1;c[n>>2]=V;c[n+4>>2]=P;S=Q;T=V&255;U=n}La(S|0,L|0,P)|0;a[S+P|0]=0;N=T;O=U}U=m;Ld(U|0,0,12)|0;T=N&255;if((T&1|0)==0){W=T>>>1}else{W=c[n+4>>2]|0}if((N&1)==0){X=n+1|0}else{X=c[n+8>>2]|0}N=W+3|0;do{if(N>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(N>>>0<11>>>0){a[U]=W<<1;Y=m+1|0}else{T=W+19&-16;P=(z=0,au(246,T|0)|0);if(z){z=0;break}c[m+8>>2]=P;c[m>>2]=T|1;c[m+4>>2]=W;Y=P}La(Y|0,X|0,W)|0;a[Y+W|0]=0;z=0,az(84,m|0,560,3)|0;if(z){z=0;break}if((a[O]&1)!=0){K1(c[n+8>>2]|0)}P=b+16|0;T=c[P>>2]|0;do{if((a[U]&1)==0){S=o;c[S>>2]=c[U>>2];c[S+4>>2]=c[U+4>>2];c[S+8>>2]=c[U+8>>2];Z=37}else{S=c[m+8>>2]|0;L=c[m+4>>2]|0;if(L>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;Z=86;break}return 0}if(L>>>0<11>>>0){a[o]=L<<1;_=o+1|0}else{V=L+16&-16;Q=(z=0,au(246,V|0)|0);if(z){z=0;Z=86;break}c[o+8>>2]=Q;c[o>>2]=V|1;c[o+4>>2]=L;_=Q}La(_|0,S|0,L)|0;a[_+L|0]=0;Z=37}}while(0);L45:do{if((Z|0)==37){L=(z=0,aM(554,T|0,o|0)|0);if(z){z=0;S=bS(-1,-1)|0;Q=S;S=M;if((a[o]&1)==0){$=Q;aa=S;break}K1(c[o+8>>2]|0);$=Q;aa=S;break}if((a[o]&1)!=0){K1(c[o+8>>2]|0)}L54:do{if(!L){if((a[K]&1)==0){S=q;c[S>>2]=c[K>>2];c[S+4>>2]=c[K+4>>2];c[S+8>>2]=c[K+8>>2];ab=a[S]|0;ac=S}else{S=c[d+40>>2]|0;Q=c[d+36>>2]|0;if(Q>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;Z=86;break L45}return 0}if(Q>>>0<11>>>0){V=Q<<1&255;R=q;a[R]=V;ad=q+1|0;ae=V;af=R}else{R=Q+16&-16;V=(z=0,au(246,R|0)|0);if(z){z=0;Z=86;break L45}c[q+8>>2]=V;ag=R|1;c[q>>2]=ag;c[q+4>>2]=Q;ad=V;ae=ag&255;af=q}La(ad|0,S|0,Q)|0;a[ad+Q|0]=0;ab=ae;ac=af}Q=p;Ld(Q|0,0,12)|0;S=q;ag=ab&255;if((ag&1|0)==0){ah=ag>>>1}else{ah=c[q+4>>2]|0}ag=ah+15|0;do{if(ag>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;Z=65;break}return 0}else{if(ag>>>0<11>>>0){a[Q]=30;ai=p+1|0}else{V=ah+31&-16;R=(z=0,au(246,V|0)|0);if(z){z=0;Z=65;break}c[p+8>>2]=R;c[p>>2]=V|1;c[p+4>>2]=15;ai=R}La(ai|0,11712,15)|0;a[ai+15|0]=0;if((a[ac]&1)==0){aj=S+1|0}else{aj=c[q+8>>2]|0}z=0,az(84,p|0,aj|0,ah|0)|0;if(z){z=0;Z=65;break}R=d+4|0;L87:do{if((a[R]&1)==0){V=r;c[V>>2]=c[R>>2];c[V+4>>2]=c[R+4>>2];c[V+8>>2]=c[R+8>>2];Z=77}else{V=c[d+12>>2]|0;ak=c[d+8>>2]|0;do{if(ak>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(ak>>>0<11>>>0){a[r]=ak<<1;al=r+1|0}else{am=ak+16&-16;an=(z=0,au(246,am|0)|0);if(z){z=0;break}c[r+8>>2]=an;c[r>>2]=am|1;c[r+4>>2]=ak;al=an}La(al|0,V|0,ak)|0;a[al+ak|0]=0;Z=77;break L87}}while(0);ak=bS(-1,-1)|0;ao=ak;ap=M}}while(0);do{if((Z|0)==77){R=s;ak=d+16|0;c[R>>2]=c[ak>>2];c[R+4>>2]=c[ak+4>>2];c[R+8>>2]=c[ak+8>>2];z=0;aV(46,p|0,r|0,s|0,c[b+56>>2]|0);if(z){z=0;ak=bS(-1,-1)|0;R=ak;ak=M;if((a[r]&1)==0){ao=R;ap=ak;break}K1(c[r+8>>2]|0);ao=R;ap=ak;break}if((a[r]&1)!=0){K1(c[r+8>>2]|0)}if((a[Q]&1)!=0){K1(c[p+8>>2]|0)}if((a[ac]&1)==0){break L54}K1(c[q+8>>2]|0);break L54}}while(0);if((a[Q]&1)==0){at=ao;av=ap;break}K1(c[p+8>>2]|0);at=ao;av=ap}}while(0);if((Z|0)==65){S=bS(-1,-1)|0;ag=M;if((a[Q]&1)!=0){K1(c[p+8>>2]|0)}at=S;av=ag}if((a[ac]&1)==0){$=at;aa=av;break L45}K1(c[q+8>>2]|0);$=at;aa=av;break L45}}while(0);L=c[P>>2]|0;if((a[U]&1)==0){ag=t;c[ag>>2]=c[U>>2];c[ag+4>>2]=c[U+4>>2];c[ag+8>>2]=c[U+8>>2]}else{ag=c[m+8>>2]|0;S=c[m+4>>2]|0;if(S>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;Z=86;break}return 0}if(S>>>0<11>>>0){a[t]=S<<1;aw=t+1|0}else{ak=S+16&-16;R=(z=0,au(246,ak|0)|0);if(z){z=0;Z=86;break}c[t+8>>2]=R;c[t>>2]=ak|1;c[t+4>>2]=S;aw=R}La(aw|0,ag|0,S)|0;a[aw+S|0]=0}S=(z=0,aM(90,L|0,t|0)|0);if(z){z=0;L=bS(-1,-1)|0;ag=L;L=M;if((a[t]&1)==0){$=ag;aa=L;break}K1(c[t+8>>2]|0);$=ag;aa=L;break}L=c[S>>2]|0;if((a[t]&1)!=0){K1(c[t+8>>2]|0)}S=c[L+28>>2]|0;ag=c[L+44>>2]|0;R=c[d+44>>2]|0;ak=c[(c[R>>2]|0)+20>>2]|0;V=b+8|0;an=b+56|0;am=(z=0,az(42,c[V>>2]|0,c[P>>2]|0,c[an>>2]|0)|0);if(z){z=0;Z=86;break}ax=(z=0,aM(ak|0,R|0,am|0)|0);if(z){z=0;Z=86;break}am=ax;ax=c[an>>2]|0;R=d+4|0;if((a[R]&1)==0){ak=v;c[ak>>2]=c[R>>2];c[ak+4>>2]=c[R+4>>2];c[ak+8>>2]=c[R+8>>2]}else{ak=c[d+12>>2]|0;ay=c[d+8>>2]|0;if(ay>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;Z=86;break}return 0}if(ay>>>0<11>>>0){a[v]=ay<<1;aA=v+1|0}else{aB=ay+16&-16;aC=(z=0,au(246,aB|0)|0);if(z){z=0;Z=86;break}c[v+8>>2]=aC;c[v>>2]=aB|1;c[v+4>>2]=ay;aA=aC}La(aA|0,ak|0,ay)|0;a[aA+ay|0]=0}ay=w;ak=d+16|0;c[ay>>2]=c[ak>>2];c[ay+4>>2]=c[ak+4>>2];c[ay+8>>2]=c[ak+8>>2];L158:do{if((a[K]&1)==0){aC=A;c[aC>>2]=c[K>>2];c[aC+4>>2]=c[K+4>>2];c[aC+8>>2]=c[K+8>>2];aE=a[aC]|0;aF=aC;Z=132}else{aC=c[d+40>>2]|0;aB=c[d+36>>2]|0;do{if(aB>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(aB>>>0<11>>>0){aG=aB<<1&255;aH=A;a[aH]=aG;aJ=A+1|0;aK=aG;aL=aH}else{aH=aB+16&-16;aG=(z=0,au(246,aH|0)|0);if(z){z=0;break}c[A+8>>2]=aG;aN=aH|1;c[A>>2]=aN;c[A+4>>2]=aB;aJ=aG;aK=aN&255;aL=A}La(aJ|0,aC|0,aB)|0;a[aJ+aB|0]=0;aE=aK;aF=aL;Z=132;break L158}}while(0);aB=bS(-1,-1)|0;aO=aB;aP=M}}while(0);do{if((Z|0)==132){aB=y;Ld(aB|0,0,12)|0;aC=A;Q=aE&255;if((Q&1|0)==0){aQ=Q>>>1}else{aQ=c[A+4>>2]|0}Q=aQ+12|0;do{if(Q>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;Z=146;break}return 0}else{if(Q>>>0<11>>>0){a[aB]=24;aS=y+1|0}else{aN=aQ+28&-16;aG=(z=0,au(246,aN|0)|0);if(z){z=0;Z=146;break}c[y+8>>2]=aG;c[y>>2]=aN|1;c[y+4>>2]=12;aS=aG}La(aS|0,11032,12)|0;a[aS+12|0]=0;if((a[aF]&1)==0){aT=aC+1|0}else{aT=c[A+8>>2]|0}z=0,az(84,y|0,aT|0,aQ|0)|0;if(z){z=0;Z=146;break}aG=x;Ld(aG|0,0,12)|0;aN=a[aB]|0;aH=aN&255;if((aH&1|0)==0){aU=aH>>>1}else{aU=c[y+4>>2]|0}if((aN&1)==0){aW=y+1|0}else{aW=c[y+8>>2]|0}aN=aU+1|0;do{if(aN>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;Z=162;break}return 0}else{if(aN>>>0<11>>>0){a[aG]=aU<<1;aX=x+1|0}else{aH=aU+17&-16;aY=(z=0,au(246,aH|0)|0);if(z){z=0;Z=162;break}c[x+8>>2]=aY;c[x>>2]=aH|1;c[x+4>>2]=aU;aX=aY}La(aX|0,aW|0,aU)|0;a[aX+aU|0]=0;z=0,az(84,x|0,10664,1)|0;if(z){z=0;Z=162;break}aY=l;c[aY>>2]=c[ay>>2];c[aY+4>>2]=c[ay+4>>2];c[aY+8>>2]=c[ay+8>>2];z=0;aq(26,u|0,ax|0,v|0,l|0,x|0);if(z){z=0;aY=bS(-1,-1)|0;aH=aY;aY=M;if((a[aG]&1)==0){aZ=aH;a_=aY;break}K1(c[x+8>>2]|0);aZ=aH;a_=aY;break}if((a[aG]&1)!=0){K1(c[x+8>>2]|0)}if((a[aB]&1)!=0){K1(c[y+8>>2]|0)}if((a[aF]&1)!=0){K1(c[A+8>>2]|0)}if((a[v]&1)!=0){K1(c[v+8>>2]|0)}c[an>>2]=u;aY=B+4|0;c[aY>>2]=0;c[B+8>>2]=0;c[B>>2]=aY;aY=B+12|0;c[aY>>2]=0;c[aY>>2]=c[L+48>>2];aY=d+28|0;L225:do{if((c[aY>>2]|0)==0){Z=260}else{aH=b+4|0;a$=c[aH>>2]|0;a0=(z=0,au(246,72)|0);if(z){z=0;Z=234;break}a1=a0;c[k>>2]=a1;a0=a$+4|0;a2=c[a0>>2]|0;if((a2|0)==(c[a$+8>>2]|0)){z=0;as(378,a$|0,k|0);if(z){z=0;Z=234;break}a3=c[k>>2]|0}else{if((a2|0)==0){a4=0}else{c[a2>>2]=a1;a4=c[a0>>2]|0}c[a0>>2]=a4+4;a3=a1}a1=a3;a2=a3;L236:do{if((a[R]&1)==0){a5=C;c[a5>>2]=c[R>>2];c[a5+4>>2]=c[R+4>>2];c[a5+8>>2]=c[R+8>>2];Z=191}else{a5=c[d+12>>2]|0;a6=c[d+8>>2]|0;do{if(a6>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(a6>>>0<11>>>0){a[C]=a6<<1;a7=C+1|0}else{a8=a6+16&-16;a9=(z=0,au(246,a8|0)|0);if(z){z=0;break}c[C+8>>2]=a9;c[C>>2]=a8|1;c[C+4>>2]=a6;a7=a9}La(a7|0,a5|0,a6)|0;a[a7+a6|0]=0;Z=191;break L236}}while(0);a6=bS(-1,-1)|0;ba=a6;bb=M}}while(0);do{if((Z|0)==191){a6=D;c[a6>>2]=c[ak>>2];c[a6+4>>2]=c[ak+4>>2];c[a6+8>>2]=c[ak+8>>2];a5=F;a9=F;a[a9]=16;a8=a5+1|0;bc=a8|0;E=1852793664;a[bc]=E;E=E>>8;a[bc+1|0]=E;E=E>>8;a[bc+2|0]=E;E=E>>8;a[bc+3|0]=E;bc=a8+4|0;E=1953391988;a[bc]=E;E=E>>8;a[bc+1|0]=E;E=E>>8;a[bc+2|0]=E;E=E>>8;a[bc+3|0]=E;a[a5+9|0]=0;a5=c[aH>>2]|0;bc=(z=0,au(246,48)|0);L251:do{if(!z){a8=bc;c[j>>2]=a8;bd=a5+4|0;be=c[bd>>2]|0;if((be|0)==(c[a5+8>>2]|0)){z=0;as(378,a5|0,j|0);if(z){z=0;Z=237;break}bf=c[j>>2]|0}else{if((be|0)==0){bh=0}else{c[be>>2]=a8;bh=c[bd>>2]|0}c[bd>>2]=bh+4;bf=a8}a8=bf;be=bf;L261:do{if((a[R]&1)==0){bi=G;c[bi>>2]=c[R>>2];c[bi+4>>2]=c[R+4>>2];c[bi+8>>2]=c[R+8>>2];Z=208}else{bi=c[d+12>>2]|0;bj=c[d+8>>2]|0;do{if(bj>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(bj>>>0<11>>>0){a[G]=bj<<1;bk=G+1|0}else{bl=bj+16&-16;bm=(z=0,au(246,bl|0)|0);if(z){z=0;break}c[G+8>>2]=bm;c[G>>2]=bl|1;c[G+4>>2]=bj;bk=bm}La(bk|0,bi|0,bj)|0;a[bk+bj|0]=0;Z=208;break L261}}while(0);bj=bS(-1,-1)|0;bn=M;bo=bj}}while(0);do{if((Z|0)==208){bj=h;c[bj>>2]=c[ak>>2];c[bj+4>>2]=c[ak+4>>2];c[bj+8>>2]=c[ak+8>>2];z=0;aR(464,be|0,G|0,h|0);do{if(!z){bj=c[aY>>2]|0;bi=g;c[bi>>2]=c[a6>>2];c[bi+4>>2]=c[a6+4>>2];c[bi+8>>2]=c[a6+8>>2];z=0;aI(4,a2|0,C|0,g|0,F|0,be|0,bj|0,0);if(z){z=0;bp=0;break}if((a[G]&1)!=0){K1(c[G+8>>2]|0)}if((a[a9]&1)!=0){K1(c[F+8>>2]|0)}if((a[C]&1)!=0){K1(c[C+8>>2]|0)}c[a3+48>>2]=c[P>>2];bj=(z=0,au(246,16)|0);if(z){z=0;Z=234;break L225}bi=H+8|0;c[bi>>2]=bj;c[H>>2]=17;c[H+4>>2]=11;La(bj|0,10176,11)|0;a[bj+11|0]=0;bj=(z=0,aM(178,B|0,H|0)|0);if(!z){c[bj>>2]=a3;if((a[H]&1)==0){Z=260;break L225}K1(c[bi>>2]|0);Z=260;break L225}else{z=0;bj=bS(-1,-1)|0;bm=bj;bj=M;if((a[H]&1)==0){bq=bm;br=bj;break L225}K1(c[bi>>2]|0);bq=bm;br=bj;break L225}}else{z=0;bp=1}}while(0);bj=bS(-1,-1)|0;bm=bj;bj=M;if((a[G]&1)==0){if(bp){bn=bj;bo=bm;break}else{bs=bm;bt=bj;break L251}}else{K1(c[G+8>>2]|0);if(bp){bn=bj;bo=bm;break}else{bs=bm;bt=bj;break L251}}}}while(0);be=c[a5>>2]|0;bj=c[bd>>2]|0;L299:do{if((be|0)==(bj|0)){bu=be}else{bm=be;while(1){bi=bm+4|0;if((c[bm>>2]|0)==(bf|0)){bu=bm;break L299}if((bi|0)==(bj|0)){bu=bj;break}else{bm=bi}}}}while(0);bm=bu-be>>2;bi=be+(bm+1<<2)|0;bl=bj-bi|0;Lb(be+(bm<<2)|0,bi|0,bl|0)|0;bi=be+((bl>>2)+bm<<2)|0;bm=c[bd>>2]|0;if((bi|0)!=(bm|0)){c[bd>>2]=bm+(~((bm-4+(-bi|0)|0)>>>2)<<2)}K1(a8);bs=bo;bt=bn}else{z=0;Z=237}}while(0);if((Z|0)==237){a5=bS(-1,-1)|0;bs=a5;bt=M}if((a[a9]&1)!=0){K1(c[F+8>>2]|0)}if((a[C]&1)==0){ba=bs;bb=bt;break}K1(c[C+8>>2]|0);ba=bs;bb=bt}}while(0);a2=c[a$>>2]|0;aH=c[a0>>2]|0;L315:do{if((a2|0)==(aH|0)){bv=a2}else{a5=a2;while(1){a6=a5+4|0;if((c[a5>>2]|0)==(a3|0)){bv=a5;break L315}if((a6|0)==(aH|0)){bv=aH;break}else{a5=a6}}}}while(0);a$=bv-a2>>2;a5=a2+(a$+1<<2)|0;a9=aH-a5|0;Lb(a2+(a$<<2)|0,a5|0,a9|0)|0;a5=a2+((a9>>2)+a$<<2)|0;a$=c[a0>>2]|0;if((a5|0)!=(a$|0)){c[a0>>2]=a$+(~((a$-4+(-a5|0)|0)>>>2)<<2)}K1(a1);bq=ba;br=bb}}while(0);L323:do{if((Z|0)==260){if((a[K]&1)==0){aY=J;c[aY>>2]=c[K>>2];c[aY+4>>2]=c[K+4>>2];c[aY+8>>2]=c[K+8>>2];bw=a[aY]|0;bx=aY}else{aY=c[d+40>>2]|0;a5=c[d+36>>2]|0;if(a5>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;Z=234;break}return 0}if(a5>>>0<11>>>0){a$=a5<<1&255;a9=J;a[a9]=a$;by=J+1|0;bz=a$;bA=a9}else{a9=a5+16&-16;a$=(z=0,au(246,a9|0)|0);if(z){z=0;Z=234;break}c[J+8>>2]=a$;a6=a9|1;c[J>>2]=a6;c[J+4>>2]=a5;by=a$;bz=a6&255;bA=J}La(by|0,aY|0,a5)|0;a[by+a5|0]=0;bw=bz;bx=bA}a5=I;Ld(a5|0,0,12)|0;aY=J;a6=bw&255;if((a6&1|0)==0){bB=a6>>>1}else{bB=c[J+4>>2]|0}a6=bB+6|0;do{if(a6>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;Z=284;break}return 0}else{if(a6>>>0<11>>>0){a[a5]=12;bC=I+1|0}else{a$=bB+22&-16;a9=(z=0,au(246,a$|0)|0);if(z){z=0;Z=284;break}c[I+8>>2]=a9;c[I>>2]=a$|1;c[I+4>>2]=6;bC=a9}a[bC]=a[10024]|0;a[bC+1|0]=a[10025]|0;a[bC+2|0]=a[10026]|0;a[bC+3|0]=a[10027]|0;a[bC+4|0]=a[10028]|0;a[bC+5|0]=a[10029]|0;a[bC+6|0]=0;if((a[bx]&1)==0){bD=aY+1|0}else{bD=c[J+8>>2]|0}z=0,az(84,I|0,bD|0,bB|0)|0;if(z){z=0;Z=284;break}z=0;aD(22,I|0,ag|0,am|0,c[b+4>>2]|0,B|0,c[V>>2]|0);if(z){z=0;a9=bS(-1,-1)|0;a$=a9;a9=M;if((a[a5]&1)==0){bE=a$;bF=a9;break}K1(c[I+8>>2]|0);bE=a$;bF=a9;break}if((a[a5]&1)!=0){K1(c[I+8>>2]|0)}if((a[bx]&1)!=0){K1(c[J+8>>2]|0)}a9=c[P>>2]|0;c[P>>2]=B;a$=c[(c[b+24>>2]|0)-4>>2]|0;bc=S+32|0;bi=c[bc>>2]|0;bm=(c[S+36>>2]|0)-bi>>2;L366:do{if((bm|0)!=0){bl=b|0;bG=a$+28|0;bH=a$+36|0;bI=a$+40|0;bJ=a$+32|0;bK=bG;bL=0;bM=bi;while(1){bN=c[bM+(bL<<2)>>2]|0;bO=(z=0,aM(c[(c[bN>>2]|0)+16>>2]|0,bN|0,bl|0)|0);if(z){z=0;break}if((bO|0)!=0){c[f>>2]=bO;bN=c[bH>>2]|0;if((bN|0)==(c[bI>>2]|0)){z=0;as(484,bJ|0,f|0);if(z){z=0;break}bP=c[f>>2]|0}else{if((bN|0)==0){bQ=0}else{c[bN>>2]=bO;bQ=c[bH>>2]|0}c[bH>>2]=bQ+4;bP=bO}z=0;as(c[c[bK>>2]>>2]|0,bG|0,bP|0);if(z){z=0;break}}bO=bL+1|0;if(bO>>>0>=bm>>>0){break L366}bL=bO;bM=c[bc>>2]|0}bM=bS(-1,-1)|0;bR=M;bT=bM;Z=235;break L323}}while(0);c[P>>2]=a9;c[an>>2]=c[u>>2];gX(B|0,c[B+4>>2]|0);if((a[u+28|0]&1)!=0){K1(c[u+36>>2]|0)}if((a[u+4|0]&1)!=0){K1(c[u+12>>2]|0)}if((a[U]&1)==0){i=e;return 0}K1(c[m+8>>2]|0);i=e;return 0}}while(0);if((Z|0)==284){aY=bS(-1,-1)|0;a6=M;if((a[a5]&1)!=0){K1(c[I+8>>2]|0)}bE=aY;bF=a6}if((a[bx]&1)==0){bq=bE;br=bF;break}K1(c[J+8>>2]|0);bq=bE;br=bF}}while(0);if((Z|0)==234){a6=bS(-1,-1)|0;bR=M;bT=a6;Z=235}if((Z|0)==235){bq=bT;br=bR}gX(B|0,c[B+4>>2]|0);if((a[u+28|0]&1)!=0){K1(c[u+36>>2]|0)}if((a[u+4|0]&1)==0){$=bq;aa=br;break L45}K1(c[u+12>>2]|0);$=bq;aa=br;break L45}}while(0);if((Z|0)==162){aN=bS(-1,-1)|0;a6=M;if((a[aG]&1)!=0){K1(c[x+8>>2]|0)}aZ=aN;a_=a6}if((a[aB]&1)==0){bU=aZ;bV=a_;break}K1(c[y+8>>2]|0);bU=aZ;bV=a_}}while(0);if((Z|0)==146){aC=bS(-1,-1)|0;Q=M;if((a[aB]&1)!=0){K1(c[y+8>>2]|0)}bU=aC;bV=Q}if((a[aF]&1)==0){aO=bU;aP=bV;break}K1(c[A+8>>2]|0);aO=bU;aP=bV}}while(0);if((a[v]&1)==0){$=aO;aa=aP;break}K1(c[v+8>>2]|0);$=aO;aa=aP}}while(0);if((Z|0)==86){P=bS(-1,-1)|0;$=P;aa=M}if((a[U]&1)==0){bW=$;bX=aa;bY=bW;bZ=0;b_=bY;b$=bX;bg(b_|0)}K1(c[m+8>>2]|0);bW=$;bX=aa;bY=bW;bZ=0;b_=bY;b$=bX;bg(b_|0)}}while(0);aa=bS(-1,-1)|0;$=M;if((a[U]&1)!=0){K1(c[m+8>>2]|0)}m=aa;aa=$;if((a[O]&1)==0){bW=m;bX=aa;bY=bW;bZ=0;b_=bY;b$=bX;bg(b_|0)}K1(c[n+8>>2]|0);bW=m;bX=aa;bY=bW;bZ=0;b_=bY;b$=bX;bg(b_|0);return 0}function l$(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0;e=i;i=i+128|0;f=e|0;g=e+16|0;h=e+32|0;j=e+40|0;k=e+48|0;l=e+64|0;m=e+80|0;n=e+96|0;o=e+112|0;p=c[b+16>>2]|0;q=K$(16)|0;r=k+8|0;c[r>>2]=q;c[k>>2]=17;c[k+4>>2]=11;La(q|0,10176,11)|0;a[q+11|0]=0;q=(z=0,aM(554,p|0,k|0)|0);if(z){z=0;p=bS(-1,-1)|0;s=p;p=M;if((a[k]&1)==0){t=p;u=s;v=u;w=0;x=v;y=t;bg(x|0)}K1(c[r>>2]|0);t=p;u=s;v=u;w=0;x=v;y=t;bg(x|0)}if((a[k]&1)!=0){K1(c[r>>2]|0)}if(!q){A=0;i=e;return A|0}q=b+4|0;r=c[q>>2]|0;k=K$(48)|0;c[j>>2]=k;s=r+4|0;p=c[s>>2]|0;if((p|0)==(c[r+8>>2]|0)){e4(r|0,j);B=c[j>>2]|0}else{if((p|0)==0){C=0}else{c[p>>2]=k;C=c[s>>2]|0}c[s>>2]=C+4;B=k}k=B;C=B;p=d+4|0;L21:do{if((a[p]&1)==0){j=l;c[j>>2]=c[p>>2];c[j+4>>2]=c[p+4>>2];c[j+8>>2]=c[p+8>>2];D=22}else{j=c[d+12>>2]|0;F=c[d+8>>2]|0;do{if(F>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(F>>>0<11>>>0){a[l]=F<<1;G=l+1|0}else{H=F+16&-16;I=(z=0,au(246,H|0)|0);if(z){z=0;break}c[l+8>>2]=I;c[l>>2]=H|1;c[l+4>>2]=F;G=I}La(G|0,j|0,F)|0;a[G+F|0]=0;D=22;break L21}}while(0);F=bS(-1,-1)|0;J=M;K=F}}while(0);do{if((D|0)==22){G=m;F=d+16|0;c[G>>2]=c[F>>2];c[G+4>>2]=c[F+4>>2];c[G+8>>2]=c[F+8>>2];j=n;I=n;a[I]=16;H=j+1|0;L=H|0;E=1852793664;a[L]=E;E=E>>8;a[L+1|0]=E;E=E>>8;a[L+2|0]=E;E=E>>8;a[L+3|0]=E;L=H+4|0;E=1953391988;a[L]=E;E=E>>8;a[L+1|0]=E;E=E>>8;a[L+2|0]=E;E=E>>8;a[L+3|0]=E;a[j+9|0]=0;j=c[q>>2]|0;L=(z=0,au(246,56)|0);L36:do{if(!z){H=L;c[h>>2]=H;N=j+4|0;O=c[N>>2]|0;if((O|0)==(c[j+8>>2]|0)){z=0;as(378,j|0,h|0);if(z){z=0;D=49;break}P=c[h>>2]|0}else{if((O|0)==0){Q=0}else{c[O>>2]=H;Q=c[N>>2]|0}c[N>>2]=Q+4;P=H}H=P;O=P;L46:do{if((a[p]&1)==0){R=o;c[R>>2]=c[p>>2];c[R+4>>2]=c[p+4>>2];c[R+8>>2]=c[p+8>>2];D=39}else{R=c[d+12>>2]|0;S=c[d+8>>2]|0;do{if(S>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(S>>>0<11>>>0){a[o]=S<<1;T=o+1|0}else{U=S+16&-16;V=(z=0,au(246,U|0)|0);if(z){z=0;break}c[o+8>>2]=V;c[o>>2]=U|1;c[o+4>>2]=S;T=V}La(T|0,R|0,S)|0;a[T+S|0]=0;D=39;break L46}}while(0);S=bS(-1,-1)|0;W=S;X=M}}while(0);do{if((D|0)==39){S=g;c[S>>2]=c[F>>2];c[S+4>>2]=c[F+4>>2];c[S+8>>2]=c[F+8>>2];z=0;aR(46,O|0,o|0,g|0);do{if(!z){S=f;c[S>>2]=c[G>>2];c[S+4>>2]=c[G+4>>2];c[S+8>>2]=c[G+8>>2];z=0;aD(38,C|0,l|0,f|0,n|0,O|0,0);if(z){z=0;Y=0;break}if((a[o]&1)!=0){K1(c[o+8>>2]|0)}if((a[I]&1)!=0){K1(c[n+8>>2]|0)}if((a[l]&1)!=0){K1(c[l+8>>2]|0)}A=cU[c[(c[B>>2]|0)+16>>2]&1023](C,b|0)|0;i=e;return A|0}else{z=0;Y=1}}while(0);S=bS(-1,-1)|0;R=S;S=M;if((a[o]&1)==0){if(Y){W=R;X=S;break}else{Z=S;_=R;break L36}}else{K1(c[o+8>>2]|0);if(Y){W=R;X=S;break}else{Z=S;_=R;break L36}}}}while(0);O=c[j>>2]|0;R=c[N>>2]|0;L79:do{if((O|0)==(R|0)){$=O}else{S=O;while(1){V=S+4|0;if((c[S>>2]|0)==(P|0)){$=S;break L79}if((V|0)==(R|0)){$=R;break}else{S=V}}}}while(0);S=$-O>>2;V=O+(S+1<<2)|0;U=R-V|0;Lb(O+(S<<2)|0,V|0,U|0)|0;V=O+((U>>2)+S<<2)|0;S=c[N>>2]|0;if((V|0)!=(S|0)){c[N>>2]=S+(~((S-4+(-V|0)|0)>>>2)<<2)}K1(H);Z=X;_=W}else{z=0;D=49}}while(0);if((D|0)==49){j=bS(-1,-1)|0;Z=M;_=j}if((a[I]&1)!=0){K1(c[n+8>>2]|0)}if((a[l]&1)==0){J=Z;K=_;break}K1(c[l+8>>2]|0);J=Z;K=_}}while(0);_=c[r>>2]|0;r=c[s>>2]|0;L95:do{if((_|0)==(r|0)){aa=_}else{Z=_;while(1){l=Z+4|0;if((c[Z>>2]|0)==(B|0)){aa=Z;break L95}if((l|0)==(r|0)){aa=r;break}else{Z=l}}}}while(0);B=aa-_>>2;aa=_+(B+1<<2)|0;Z=r-aa|0;Lb(_+(B<<2)|0,aa|0,Z|0)|0;aa=_+((Z>>2)+B<<2)|0;B=c[s>>2]|0;if((aa|0)!=(B|0)){c[s>>2]=B+(~((B-4+(-aa|0)|0)>>>2)<<2)}K1(k);t=J;u=K;v=u;w=0;x=v;y=t;bg(x|0);return 0}function l0(a,b){a=a|0;b=b|0;return mx(a,b)|0}function l1(a){a=a|0;gY(a);return}function l2(a){a=a|0;var b=0;z=0;ar(536,a|0);if(!z){K1(a);return}else{z=0;b=bS(-1,-1)|0;K1(a);bg(b|0)}}function l3(a,b){a=a|0;b=b|0;return mx(a,b|0)|0}function l4(a,b){a=a|0;b=b|0;return mx(a,b|0)|0}function l5(a,b){a=a|0;b=b|0;return mx(a,b|0)|0}function l6(a,b){a=a|0;b=b|0;return mx(a,b|0)|0}function l7(a,b){a=a|0;b=b|0;return mx(a,b|0)|0}function l8(a,b){a=a|0;b=b|0;return mx(a,b|0)|0}function l9(a,b){a=a|0;b=b|0;return mx(a,b|0)|0}function ma(a,b){a=a|0;b=b|0;return mx(a,b|0)|0}function mb(a,b){a=a|0;b=b|0;return mx(a,b|0)|0}function mc(a,b){a=a|0;b=b|0;return mx(a,b|0)|0}function md(a,b){a=a|0;b=b|0;return mx(a,b|0)|0}function me(a,b){a=a|0;b=b|0;return mx(a,b|0)|0}function mf(a,b){a=a|0;b=b|0;return mx(a,b|0)|0}function mg(a,b){a=a|0;b=b|0;return mx(a,b|0)|0}function mh(a,b){a=a|0;b=b|0;return mx(a,b|0)|0}function mi(a,b){a=a|0;b=b|0;return mx(a,b|0)|0}function mj(a,b){a=a|0;b=b|0;return mx(a,b|0)|0}function mk(a,b){a=a|0;b=b|0;return mx(a,b|0)|0}function ml(a,b){a=a|0;b=b|0;return mx(a,b|0)|0}function mm(a,b){a=a|0;b=b|0;return mx(a,b|0)|0}function mn(a,b){a=a|0;b=b|0;return mx(a,b|0)|0}function mo(a,b){a=a|0;b=b|0;return mx(a,b|0)|0}function mp(a,b){a=a|0;b=b|0;return mx(a,b|0)|0}function mq(a,b){a=a|0;b=b|0;return mx(a,b|0)|0}function mr(a,b){a=a|0;b=b|0;return mx(a,b|0)|0}function ms(a,b){a=a|0;b=b|0;return mx(a,b|0)|0}function mt(a,b){a=a|0;b=b|0;return mx(a,b|0)|0}function mu(a,b){a=a|0;b=b|0;return mx(a,b|0)|0}function mv(a,b){a=a|0;b=b|0;return mx(a,b|0)|0}function mw(a,b){a=a|0;b=b|0;return mx(a,b|0)|0}function mx(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0;e=i;i=i+160|0;f=e|0;g=e+16|0;h=e+32|0;j=e+40|0;k=e+56|0;l=e+64|0;m=e+80|0;n=e+96|0;o=e+112|0;p=e+128|0;q=e+144|0;r=K$(64)|0;s=l+8|0;c[s>>2]=r;c[l>>2]=65;c[l+4>>2]=62;La(r|0,9728,62)|0;a[r+62|0]=0;r=d+4|0;L1:do{if((a[r]&1)==0){t=m;c[t>>2]=c[r>>2];c[t+4>>2]=c[r+4>>2];c[t+8>>2]=c[r+8>>2];u=11}else{t=c[d+12>>2]|0;v=c[d+8>>2]|0;do{if(v>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(v>>>0<11>>>0){a[m]=v<<1;w=m+1|0}else{x=v+16&-16;y=(z=0,au(246,x|0)|0);if(z){z=0;break}c[m+8>>2]=y;c[m>>2]=x|1;c[m+4>>2]=v;w=y}La(w|0,t|0,v)|0;a[w+v|0]=0;u=11;break L1}}while(0);v=bS(-1,-1)|0;A=v;B=M}}while(0);do{if((u|0)==11){w=n;r=d+16|0;c[w>>2]=c[r>>2];c[w+4>>2]=c[r+4>>2];c[w+8>>2]=c[r+8>>2];z=0;aV(46,l|0,m|0,n|0,c[b+56>>2]|0);if(z){z=0;r=bS(-1,-1)|0;w=r;r=M;if((a[m]&1)==0){A=w;B=r;break}K1(c[m+8>>2]|0);A=w;B=r;break}if((a[m]&1)!=0){K1(c[m+8>>2]|0)}if((a[l]&1)!=0){K1(c[s>>2]|0)}r=b+4|0;w=c[r>>2]|0;v=K$(52)|0;c[k>>2]=v;t=w+4|0;y=c[t>>2]|0;if((y|0)==(c[w+8>>2]|0)){e4(w|0,k);C=c[k>>2]|0}else{if((y|0)==0){D=0}else{c[y>>2]=v;D=c[t>>2]|0}c[t>>2]=D+4;C=v}v=C;y=C;x=o;a[x]=0;a[o+1|0]=0;E=(z=0,au(246,32)|0);if(!z){La(E|0,9544,24)|0;a[E+24|0]=0;L35:do{if((d|0)==0){z=0;aS(10);if(!z){return 0}else{z=0;F=bS(-1,-1)|0;G=M;H=F;u=58;break}}else{F=c[(c[(c[d>>2]|0)-4>>2]|0)+4>>2]|0;I=p;Ld(I|0,0,12)|0;J=Le(F|0)|0;K=J+24|0;do{if(K>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(K>>>0<11>>>0){a[I]=48;L=p+1|0}else{N=J+40&-16;O=(z=0,au(246,N|0)|0);if(z){z=0;break}c[p+8>>2]=O;c[p>>2]=N|1;c[p+4>>2]=24;L=O}La(L|0,E|0,24)|0;a[L+24|0]=0;z=0,az(84,p|0,F|0,J|0)|0;if(z){z=0;break}c[j>>2]=0;c[j+4>>2]=0;c[j+8>>2]=0;z=0;aq(28,y|0,o|0,j|0,p|0,0);if(z){z=0;O=bS(-1,-1)|0;N=O;O=M;if((a[I]&1)==0){P=N;Q=O;break L35}K1(c[p+8>>2]|0);P=N;Q=O;break L35}if((a[I]&1)!=0){K1(c[p+8>>2]|0)}K1(E);if((a[x]&1)!=0){K1(c[o+8>>2]|0)}O=c[r>>2]|0;N=K$(32)|0;c[h>>2]=N;R=O+4|0;S=c[R>>2]|0;if((S|0)==(c[O+8>>2]|0)){e4(O|0,h);T=c[h>>2]|0}else{if((S|0)==0){U=0}else{c[S>>2]=N;U=c[R>>2]|0}c[R>>2]=U+4;T=N}N=T;S=q;a[S]=0;a[q+1|0]=0;V=f;W=T;c[V>>2]=c[S>>2];c[V+4>>2]=c[S+4>>2];c[V+8>>2]=c[S+8>>2];c[g>>2]=0;c[g+4>>2]=0;c[g+8>>2]=0;z=0;aR(412,W|0,f|0,g|0);if(!z){if((a[V]&1)==0){X=T|0;c[X>>2]=16720;Y=T+28|0;Z=C;c[Y>>2]=Z;_=12;$=0;aa=12;ab=0;i=e;return W|0}K1(c[f+8>>2]|0);X=T|0;c[X>>2]=16720;Y=T+28|0;Z=C;c[Y>>2]=Z;_=12;$=0;aa=12;ab=0;i=e;return W|0}else{z=0}W=bS(-1,-1)|0;S=M;if((a[V]&1)!=0){K1(c[f+8>>2]|0)}V=W;W=S;S=c[O>>2]|0;O=c[R>>2]|0;L78:do{if((S|0)==(O|0)){ac=S}else{ad=S;while(1){ae=ad+4|0;if((c[ad>>2]|0)==(T|0)){ac=ad;break L78}if((ae|0)==(O|0)){ac=O;break}else{ad=ae}}}}while(0);ad=ac-S>>2;ae=S+(ad+1<<2)|0;af=O-ae|0;Lb(S+(ad<<2)|0,ae|0,af|0)|0;ae=S+((af>>2)+ad<<2)|0;ad=c[R>>2]|0;if((ae|0)!=(ad|0)){c[R>>2]=ad+(~((ad-4+(-ae|0)|0)>>>2)<<2)}K1(N);ag=V;ah=W;ai=ag;aj=0;ak=ai;al=ah;bg(ak|0)}}while(0);J=bS(-1,-1)|0;F=M;if((a[I]&1)==0){G=F;H=J;u=58;break}K1(c[p+8>>2]|0);G=F;H=J;u=58}}while(0);if((u|0)==58){P=H;Q=G}K1(E);am=P;an=Q}else{z=0;r=bS(-1,-1)|0;am=r;an=M}if((a[x]&1)!=0){K1(c[o+8>>2]|0)}r=c[w>>2]|0;y=c[t>>2]|0;L97:do{if((r|0)==(y|0)){ao=r}else{J=r;while(1){F=J+4|0;if((c[J>>2]|0)==(C|0)){ao=J;break L97}if((F|0)==(y|0)){ao=y;break}else{J=F}}}}while(0);w=ao-r>>2;x=r+(w+1<<2)|0;E=y-x|0;Lb(r+(w<<2)|0,x|0,E|0)|0;x=r+((E>>2)+w<<2)|0;w=c[t>>2]|0;if((x|0)!=(w|0)){c[t>>2]=w+(~((w-4+(-x|0)|0)>>>2)<<2)}K1(v);ag=am;ah=an;ai=ag;aj=0;ak=ai;al=ah;bg(ak|0)}}while(0);if((a[l]&1)==0){ag=A;ah=B;ai=ag;aj=0;ak=ai;al=ah;bg(ak|0)}K1(c[s>>2]|0);ag=A;ah=B;ai=ag;aj=0;ak=ai;al=ah;bg(ak|0);return 0}function my(b){b=b|0;c[b>>2]=16664;if((a[b+4|0]&1)==0){return}K1(c[b+12>>2]|0);return}function mz(b){b=b|0;var d=0;c[b>>2]=16664;if((a[b+4|0]&1)==0){d=b;K1(d);return}K1(c[b+12>>2]|0);d=b;K1(d);return}function mA(a,b){a=a|0;b=b|0;cA[c[(c[b>>2]|0)+48>>2]&1023](b,a);return}function mB(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+48>>2]&1023](b,a)|0}function mC(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+48>>2]&1023](b,a)|0}function mD(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+48>>2]&1023](b,a)|0}function mE(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+48>>2]&1023](b,a)|0}function mF(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+48>>2]&511](a,d,b);return}function mG(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+48>>2]&511](a,d,b);return}function mH(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;e=i;i=i+8|0;f=e|0;g=mO(b,f,d)|0;h=c[g>>2]|0;if((h|0)!=0){j=h;k=j+28|0;i=e;return k|0}h=K$(40)|0;l=h+16|0;m=d;L4:do{if((a[m]&1)==0){c[l>>2]=c[m>>2];c[l+4>>2]=c[m+4>>2];c[l+8>>2]=c[m+8>>2]}else{n=c[d+8>>2]|0;o=c[d+4>>2]|0;do{if(o>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(o>>>0<11>>>0){a[l]=o<<1;p=h+17|0}else{q=o+16&-16;r=(z=0,au(246,q|0)|0);if(z){z=0;break}c[h+24>>2]=r;c[l>>2]=q|1;c[h+20>>2]=o;p=r}La(p|0,n|0,o)|0;a[p+o|0]=0;break L4}}while(0);o=bS(-1,-1)|0;if((h|0)==0){bg(o|0)}K1(h);bg(o|0)}}while(0);c[h+28>>2]=0;c[h+32>>2]=0;c[h+36>>2]=0;p=c[f>>2]|0;f=h;c[h>>2]=0;c[h+4>>2]=0;c[h+8>>2]=p;c[g>>2]=f;p=b|0;l=c[c[p>>2]>>2]|0;if((l|0)==0){s=f}else{c[p>>2]=l;s=c[g>>2]|0}e2(c[b+4>>2]|0,s);s=b+8|0;c[s>>2]=(c[s>>2]|0)+1;j=h;k=j+28|0;i=e;return k|0}function mI(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0;g=i;i=i+32|0;h=g|0;j=g+8|0;k=g+16|0;gJ(b|0,d);d=b+12|0;l=d|0;m=b+16|0;c[m>>2]=0;n=b+20|0;c[n>>2]=0;o=m;c[l>>2]=o;m=c[e>>2]|0;p=e+4|0;if((m|0)==(p|0)){q=b+24|0;r=c[f>>2]|0;c[q>>2]=r;i=g;return}e=j|0;s=k|0;t=b+16|0;u=m;while(1){m=u+16|0;c[e>>2]=o;v=mJ(d,j,h,m)|0;if((c[v>>2]|0)==0){z=0;aR(238,k|0,d|0,m|0);if(z){z=0;break}m=c[s>>2]|0;c[s>>2]=0;w=c[h>>2]|0;x=m|0;c[m>>2]=0;c[m+4>>2]=0;c[m+8>>2]=w;c[v>>2]=x;w=c[c[l>>2]>>2]|0;if((w|0)==0){y=x}else{c[l>>2]=w;y=c[v>>2]|0}e2(c[t>>2]|0,y);c[n>>2]=(c[n>>2]|0)+1}v=c[u+4>>2]|0;if((v|0)==0){w=u|0;while(1){x=c[w+8>>2]|0;if((w|0)==(c[x>>2]|0)){A=x;break}else{w=x}}}else{w=v;while(1){x=c[w>>2]|0;if((x|0)==0){A=w;break}else{w=x}}}if((A|0)==(p|0)){B=24;break}else{u=A}}if((B|0)==24){q=b+24|0;r=c[f>>2]|0;c[q>>2]=r;i=g;return}g=bS(-1,-1)|0;fc(d,c[t>>2]|0);t=b|0;d=c[t>>2]|0;if((d|0)==0){bg(g|0)}r=b+4|0;b=c[r>>2]|0;if((d|0)==(b|0)){C=d}else{q=b;while(1){b=q-12|0;c[r>>2]=b;if((a[b]&1)==0){D=b}else{K1(c[q-12+8>>2]|0);D=c[r>>2]|0}if((d|0)==(D|0)){break}else{q=D}}C=c[t>>2]|0}K1(C);bg(g|0)}function mJ(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;g=i;h=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[h>>2];h=b+4|0;j=c[d>>2]|0;do{if((j|0)!=(h|0)){d=f;k=a[f]|0;l=k&255;m=(l&1|0)==0;if(m){n=l>>>1}else{n=c[f+4>>2]|0}o=j+16|0;p=o;q=a[o]|0;o=q&255;r=(o&1|0)==0;if(r){s=o>>>1}else{s=c[j+20>>2]|0}t=(k&1)==0;if(t){u=d+1|0}else{u=c[f+8>>2]|0}k=(q&1)==0;if(k){v=p+1|0}else{v=c[j+24>>2]|0}q=Lc(u|0,v|0,(s>>>0<n>>>0?s:n)|0)|0;if((q|0)==0){if(n>>>0<s>>>0){break}}else{if((q|0)<0){break}}if(r){w=o>>>1}else{w=c[j+20>>2]|0}if(m){x=l>>>1}else{x=c[f+4>>2]|0}if(k){y=p+1|0}else{y=c[j+24>>2]|0}if(t){z=d+1|0}else{z=c[f+8>>2]|0}p=Lc(y|0,z|0,(x>>>0<w>>>0?x:w)|0)|0;if((p|0)==0){if(w>>>0>=x>>>0){A=80}}else{if((p|0)>=0){A=80}}if((A|0)==80){c[e>>2]=j;B=e;i=g;return B|0}p=j+4|0;k=c[p>>2]|0;o=(k|0)==0;if(o){r=j|0;while(1){q=c[r+8>>2]|0;if((r|0)==(c[q>>2]|0)){C=q;break}else{r=q}}}else{r=k;while(1){q=c[r>>2]|0;if((q|0)==0){C=r;break}else{r=q}}}do{if((C|0)!=(h|0)){if(m){D=l>>>1}else{D=c[f+4>>2]|0}r=C+16|0;k=a[r]|0;q=k&255;if((q&1|0)==0){E=q>>>1}else{E=c[C+20>>2]|0}if(t){F=d+1|0}else{F=c[f+8>>2]|0}if((k&1)==0){G=r+1|0}else{G=c[C+24>>2]|0}r=Lc(F|0,G|0,(E>>>0<D>>>0?E:D)|0)|0;if((r|0)==0){if(D>>>0<E>>>0){break}}else{if((r|0)<0){break}}B=e1(b,e,f)|0;i=g;return B|0}}while(0);if(o){c[e>>2]=j;B=p;i=g;return B|0}else{c[e>>2]=C;B=C|0;i=g;return B|0}}}while(0);C=c[j>>2]|0;do{if((j|0)==(c[b>>2]|0)){H=j}else{if((C|0)==0){E=j|0;while(1){D=c[E+8>>2]|0;if((E|0)==(c[D>>2]|0)){E=D}else{I=D;break}}}else{E=C;while(1){p=c[E+4>>2]|0;if((p|0)==0){I=E;break}else{E=p}}}E=I;p=I+16|0;o=a[p]|0;D=o&255;if((D&1|0)==0){J=D>>>1}else{J=c[I+20>>2]|0}D=a[f]|0;G=D&255;if((G&1|0)==0){K=G>>>1}else{K=c[f+4>>2]|0}if((o&1)==0){L=p+1|0}else{L=c[I+24>>2]|0}if((D&1)==0){M=f+1|0}else{M=c[f+8>>2]|0}D=Lc(L|0,M|0,(K>>>0<J>>>0?K:J)|0)|0;if((D|0)==0){if(J>>>0<K>>>0){H=E;break}}else{if((D|0)<0){H=E;break}}B=e1(b,e,f)|0;i=g;return B|0}}while(0);if((C|0)==0){c[e>>2]=j;B=j|0;i=g;return B|0}else{c[e>>2]=H;B=H+4|0;i=g;return B|0}return 0}function mK(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;f=i;i=i+24|0;g=f|0;h=f+8|0;j=d+4|0;d=K$(28)|0;k=d;l=f+16|0;m=h|0;a[m]=a[l]|0;a[m+1|0]=a[l+1|0]|0;a[m+2|0]=a[l+2|0]|0;l=h|0;h=d+16|0;m=e;L1:do{if((a[m]&1)==0){c[h>>2]=c[m>>2];c[h+4>>2]=c[m+4>>2];c[h+8>>2]=c[m+8>>2]}else{n=c[e+8>>2]|0;o=c[e+4>>2]|0;do{if(o>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(o>>>0<11>>>0){a[h]=o<<1;p=d+17|0}else{q=o+16&-16;r=(z=0,au(246,q|0)|0);if(z){z=0;break}c[d+24>>2]=r;c[h>>2]=q|1;c[d+20>>2]=o;p=r}La(p|0,n|0,o)|0;a[p+o|0]=0;break L1}}while(0);o=bS(-1,-1)|0;if((d|0)==0){bg(o|0)}K1(d);bg(o|0)}}while(0);d=g|0;a[d]=a[l]|0;a[d+1|0]=a[l+1|0]|0;a[d+2|0]=a[l+2|0]|0;l=g|0;c[b>>2]=k;c[b+4>>2]=j;a[b+8|0]=1;j=b+9|0;a[j]=a[l]|0;a[j+1|0]=a[l+1|0]|0;a[j+2|0]=a[l+2|0]|0;i=f;return}function mL(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;d=i;i=i+24|0;e=d|0;f=a+8|0;g=f;h=a+4|0;j=c[h>>2]|0;k=a|0;l=c[k>>2]|0;m=l;n=(j-m|0)/28|0;o=n+1|0;if(o>>>0>153391689>>>0){Ip(0)}p=((c[f>>2]|0)-m|0)/28|0;if(p>>>0>76695843>>>0){m=e+12|0;c[m>>2]=0;c[e+16>>2]=g;q=153391689;r=m;s=6}else{m=p<<1;p=m>>>0<o>>>0?o:m;m=e+12|0;c[m>>2]=0;c[e+16>>2]=g;if((p|0)==0){t=0;u=0;v=m}else{q=p;r=m;s=6}}if((s|0)==6){t=K$(q*28|0)|0;u=q;v=r}r=e|0;c[r>>2]=t;q=t+(n*28|0)|0;m=e+8|0;c[m>>2]=q;p=e+4|0;c[p>>2]=q;g=t+(u*28|0)|0;c[v>>2]=g;do{if((q|0)==0){w=l;x=j}else{z=0;as(538,q|0,b|0);if(!z){w=c[k>>2]|0;x=c[h>>2]|0;break}else{z=0}u=bS(-1,-1)|0;y=M;A=u;mM(e);bg(A|0)}}while(0);b=t+((n+1|0)*28|0)|0;c[m>>2]=b;if((x|0)==(w|0)){B=x;C=q;D=x;c[k>>2]=C;c[p>>2]=B;c[h>>2]=b;c[m>>2]=D;E=a+8|0;F=c[E>>2]|0;c[E>>2]=g;c[v>>2]=F;c[r>>2]=B;mM(e);i=d;return}else{G=x;H=q}while(1){q=G-28|0;I=H-28|0;z=0;as(538,I|0,q|0);if(z){z=0;s=15;break}c[p>>2]=I;if((q|0)==(w|0)){s=13;break}else{G=q;H=I}}if((s|0)==15){H=bS(-1,-1)|0;y=M;A=H;mM(e);bg(A|0)}else if((s|0)==13){B=c[k>>2]|0;C=I;D=c[h>>2]|0;c[k>>2]=C;c[p>>2]=B;c[h>>2]=b;c[m>>2]=D;E=a+8|0;F=c[E>>2]|0;c[E>>2]=g;c[v>>2]=F;c[r>>2]=B;mM(e);i=d;return}}function mM(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;d=c[b+4>>2]|0;e=b+8|0;f=c[e>>2]|0;if((d|0)!=(f|0)){g=f;do{f=g-28|0;c[e>>2]=f;fc(g-28+12|0,c[g-28+16>>2]|0);h=f|0;f=c[h>>2]|0;if((f|0)!=0){i=g-28+4|0;j=c[i>>2]|0;if((f|0)==(j|0)){k=f}else{l=j;while(1){j=l-12|0;c[i>>2]=j;if((a[j]&1)==0){m=j}else{K1(c[l-12+8>>2]|0);m=c[i>>2]|0}if((f|0)==(m|0)){break}else{l=m}}k=c[h>>2]|0}K1(k)}g=c[e>>2]|0;}while((d|0)!=(g|0))}g=c[b>>2]|0;if((g|0)==0){return}K1(g);return}function mN(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0;e=i;i=i+32|0;f=e|0;g=e+8|0;h=e+16|0;gJ(b|0,d|0);j=b+12|0;k=j|0;l=b+16|0;c[l>>2]=0;m=b+20|0;c[m>>2]=0;n=l;c[k>>2]=n;l=c[d+12>>2]|0;o=d+16|0;if((l|0)==(o|0)){p=b+24|0;q=d+24|0;r=c[q>>2]|0;c[p>>2]=r;i=e;return}s=g|0;t=h|0;u=b+16|0;v=l;while(1){l=v+16|0;c[s>>2]=n;w=mJ(j,g,f,l)|0;if((c[w>>2]|0)==0){z=0;aR(238,h|0,j|0,l|0);if(z){z=0;break}l=c[t>>2]|0;c[t>>2]=0;x=c[f>>2]|0;y=l|0;c[l>>2]=0;c[l+4>>2]=0;c[l+8>>2]=x;c[w>>2]=y;x=c[c[k>>2]>>2]|0;if((x|0)==0){A=y}else{c[k>>2]=x;A=c[w>>2]|0}e2(c[u>>2]|0,A);c[m>>2]=(c[m>>2]|0)+1}w=c[v+4>>2]|0;if((w|0)==0){x=v|0;while(1){y=c[x+8>>2]|0;if((x|0)==(c[y>>2]|0)){B=y;break}else{x=y}}}else{x=w;while(1){y=c[x>>2]|0;if((y|0)==0){B=x;break}else{x=y}}}if((B|0)==(o|0)){C=22;break}else{v=B}}if((C|0)==22){p=b+24|0;q=d+24|0;r=c[q>>2]|0;c[p>>2]=r;i=e;return}e=bS(-1,-1)|0;fc(j,c[u>>2]|0);u=b|0;j=c[u>>2]|0;if((j|0)==0){bg(e|0)}r=b+4|0;b=c[r>>2]|0;if((j|0)==(b|0)){D=j}else{p=b;while(1){b=p-12|0;c[r>>2]=b;if((a[b]&1)==0){E=b}else{K1(c[p-12+8>>2]|0);E=c[r>>2]|0}if((j|0)==(E|0)){break}else{p=E}}D=c[u>>2]|0}K1(D);bg(e|0)}function mO(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;f=b+4|0;b=f|0;g=c[b>>2]|0;if((g|0)==0){c[d>>2]=f;h=b;return h|0}b=a[e]|0;f=b&255;i=(f&1|0)==0;j=f>>>1;f=(b&1)==0;b=e+1|0;k=e+8|0;l=e+4|0;e=g;while(1){g=e+16|0;if(i){m=j}else{m=c[l>>2]|0}n=g;o=a[g]|0;g=o&255;p=(g&1|0)==0;if(p){q=g>>>1}else{q=c[e+20>>2]|0}if(f){r=b}else{r=c[k>>2]|0}s=(o&1)==0;if(s){t=n+1|0}else{t=c[e+24>>2]|0}o=Lc(r|0,t|0,(q>>>0<m>>>0?q:m)|0)|0;if((o|0)==0){if(m>>>0<q>>>0){u=16}}else{if((o|0)<0){u=16}}if((u|0)==16){u=0;v=e|0;o=c[v>>2]|0;if((o|0)==0){u=17;break}else{e=o;continue}}if(p){w=g>>>1}else{w=c[e+20>>2]|0}if(i){x=j}else{x=c[l>>2]|0}if(s){y=n+1|0}else{y=c[e+24>>2]|0}if(f){z=b}else{z=c[k>>2]|0}n=Lc(y|0,z|0,(x>>>0<w>>>0?x:w)|0)|0;if((n|0)==0){if(w>>>0>=x>>>0){u=33;break}}else{if((n|0)>=0){u=33;break}}A=e+4|0;n=c[A>>2]|0;if((n|0)==0){u=32;break}else{e=n}}if((u|0)==33){c[d>>2]=e;h=d;return h|0}else if((u|0)==32){c[d>>2]=e;h=A;return h|0}else if((u|0)==17){c[d>>2]=e;h=v;return h|0}return 0}function mP(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;d=a+4|0;e=c[d>>2]|0;f=a|0;g=c[f>>2]|0;h=g;i=e-h>>3;j=i+1|0;if(j>>>0>536870911>>>0){Ip(0)}k=a+8|0;a=(c[k>>2]|0)-h|0;if(a>>3>>>0>268435454>>>0){l=536870911;m=5}else{n=a>>2;a=n>>>0<j>>>0?j:n;if((a|0)==0){o=0;p=0}else{l=a;m=5}}if((m|0)==5){o=K$(l<<3)|0;p=l}l=o+(i<<3)|0;m=o+(p<<3)|0;if((l|0)!=0){c[l>>2]=c[b>>2];c[o+(i<<3)+4>>2]=c[b+4>>2]}b=o+(j<<3)|0;if((e|0)==(g|0)){q=e;r=l}else{j=i-1-((e-8+(-h|0)|0)>>>3)|0;h=e;e=l;while(1){l=h-8|0;c[e-8>>2]=c[l>>2];c[e-8+4>>2]=c[h-8+4>>2];if((l|0)==(g|0)){break}else{h=l;e=e-8|0}}q=c[f>>2]|0;r=o+(j<<3)|0}c[f>>2]=r;c[d>>2]=b;c[k>>2]=m;if((q|0)==0){return}K1(q);return}function mQ(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=b+4|0;f=e|0;g=c[f>>2]|0;if((g|0)==0){h=f;i=e;j=d|0}else{e=d|0;f=g;while(1){if(dj(e,f+16|0)|0){g=f|0;k=c[g>>2]|0;if((k|0)==0){h=g;i=f;j=e;break}else{f=k;continue}}else{k=f+4|0;g=c[k>>2]|0;if((g|0)==0){h=k;i=f;j=e;break}else{f=g;continue}}}}f=K$(80)|0;z=0;as(324,f+16|0,j|0);if(!z){c[f+76>>2]=c[d+60>>2];d=f;c[f>>2]=0;c[f+4>>2]=0;c[f+8>>2]=i;c[h>>2]=d;i=b|0;j=c[c[i>>2]>>2]|0;if((j|0)==0){l=d}else{c[i>>2]=j;l=c[h>>2]|0}e2(c[b+4>>2]|0,l);l=b+8|0;c[l>>2]=(c[l>>2]|0)+1;c[a>>2]=f;return}else{z=0}a=bS(-1,-1)|0;if((f|0)==0){bg(a|0)}K1(f);bg(a|0)}function mR(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=a+4|0;e=a|0;f=c[e>>2]|0;g=f;h=(c[d>>2]|0)-g|0;i=h>>2;j=i+1|0;if(j>>>0>1073741823>>>0){Ip(0)}k=a+8|0;a=(c[k>>2]|0)-g|0;if(a>>2>>>0>536870910>>>0){l=1073741823;m=5}else{g=a>>1;a=g>>>0<j>>>0?j:g;if((a|0)==0){n=0;o=0}else{l=a;m=5}}if((m|0)==5){n=K$(l<<2)|0;o=l}l=n+(i<<2)|0;if((l|0)!=0){c[l>>2]=c[b>>2]}b=f;La(n|0,b|0,h)|0;c[e>>2]=n;c[d>>2]=n+(j<<2);c[k>>2]=n+(o<<2);if((f|0)==0){return}K1(b);return}function mS(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=a+4|0;e=a|0;f=c[e>>2]|0;g=f;h=(c[d>>2]|0)-g|0;i=h>>2;j=i+1|0;if(j>>>0>1073741823>>>0){Ip(0)}k=a+8|0;a=(c[k>>2]|0)-g|0;if(a>>2>>>0>536870910>>>0){l=1073741823;m=5}else{g=a>>1;a=g>>>0<j>>>0?j:g;if((a|0)==0){n=0;o=0}else{l=a;m=5}}if((m|0)==5){n=K$(l<<2)|0;o=l}l=n+(i<<2)|0;if((l|0)!=0){c[l>>2]=c[b>>2]}b=f;La(n|0,b|0,h)|0;c[e>>2]=n;c[d>>2]=n+(j<<2);c[k>>2]=n+(o<<2);if((f|0)==0){return}K1(b);return}function mT(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=a+4|0;e=a|0;f=c[e>>2]|0;g=f;h=(c[d>>2]|0)-g|0;i=h>>2;j=i+1|0;if(j>>>0>1073741823>>>0){Ip(0)}k=a+8|0;a=(c[k>>2]|0)-g|0;if(a>>2>>>0>536870910>>>0){l=1073741823;m=5}else{g=a>>1;a=g>>>0<j>>>0?j:g;if((a|0)==0){n=0;o=0}else{l=a;m=5}}if((m|0)==5){n=K$(l<<2)|0;o=l}l=n+(i<<2)|0;if((l|0)!=0){c[l>>2]=c[b>>2]}b=f;La(n|0,b|0,h)|0;c[e>>2]=n;c[d>>2]=n+(j<<2);c[k>>2]=n+(o<<2);if((f|0)==0){return}K1(b);return}function mU(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=a+4|0;e=a|0;f=c[e>>2]|0;g=f;h=(c[d>>2]|0)-g|0;i=h>>2;j=i+1|0;if(j>>>0>1073741823>>>0){Ip(0)}k=a+8|0;a=(c[k>>2]|0)-g|0;if(a>>2>>>0>536870910>>>0){l=1073741823;m=5}else{g=a>>1;a=g>>>0<j>>>0?j:g;if((a|0)==0){n=0;o=0}else{l=a;m=5}}if((m|0)==5){n=K$(l<<2)|0;o=l}l=n+(i<<2)|0;if((l|0)!=0){c[l>>2]=c[b>>2]}b=f;La(n|0,b|0,h)|0;c[e>>2]=n;c[d>>2]=n+(j<<2);c[k>>2]=n+(o<<2);if((f|0)==0){return}K1(b);return}function mV(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;j=i;i=i+32|0;k=e;e=i;i=i+12|0;i=i+7&-8;c[e>>2]=c[k>>2];c[e+4>>2]=c[k+4>>2];c[e+8>>2]=c[k+8>>2];k=j|0;l=j+16|0;m=b|0;n=d;if((a[n]&1)==0){o=k;c[o>>2]=c[n>>2];c[o+4>>2]=c[n+4>>2];c[o+8>>2]=c[n+8>>2]}else{n=c[d+8>>2]|0;o=c[d+4>>2]|0;if(o>>>0>4294967279>>>0){DE(0)}if(o>>>0<11>>>0){a[k]=o<<1;p=k+1|0}else{d=o+16&-16;q=K$(d)|0;c[k+8>>2]=q;c[k>>2]=d|1;c[k+4>>2]=o;p=q}La(p|0,n|0,o)|0;a[p+o|0]=0}o=l;p=e;c[o>>2]=c[p>>2];c[o+4>>2]=c[p+4>>2];c[o+8>>2]=c[p+8>>2];z=0;aV(6,m|0,k|0,l|0,h|0);if(z){z=0;h=bS(-1,-1)|0;l=h;h=M;if((a[k]&1)==0){r=h;s=l;t=s;u=0;v=t;w=r;bg(v|0)}K1(c[k+8>>2]|0);r=h;s=l;t=s;u=0;v=t;w=r;bg(v|0)}if((a[k]&1)!=0){K1(c[k+8>>2]|0)}k=b|0;c[k>>2]=21936;l=b+32|0;h=f;if((a[h]&1)==0){m=l;c[m>>2]=c[h>>2];c[m+4>>2]=c[h+4>>2];c[m+8>>2]=c[h+8>>2];x=b+44|0;c[x>>2]=g;i=j;return}h=c[f+8>>2]|0;m=c[f+4>>2]|0;do{if(m>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(m>>>0<11>>>0){a[l]=m<<1;y=l+1|0}else{f=m+16&-16;p=(z=0,au(246,f|0)|0);if(z){z=0;break}c[b+40>>2]=p;c[l>>2]=f|1;c[b+36>>2]=m;y=p}La(y|0,h|0,m)|0;a[y+m|0]=0;x=b+44|0;c[x>>2]=g;i=j;return}}while(0);j=bS(-1,-1)|0;g=j;j=M;c[k>>2]=16664;if((a[b+4|0]&1)==0){r=j;s=g;t=s;u=0;v=t;w=r;bg(v|0)}K1(c[b+12>>2]|0);r=j;s=g;t=s;u=0;v=t;w=r;bg(v|0)}function mW(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;g=i;i=i+32|0;h=e;e=i;i=i+12|0;i=i+7&-8;c[e>>2]=c[h>>2];c[e+4>>2]=c[h+4>>2];c[e+8>>2]=c[h+8>>2];h=g|0;j=g+16|0;k=b|0;l=d;if((a[l]&1)==0){m=h;c[m>>2]=c[l>>2];c[m+4>>2]=c[l+4>>2];c[m+8>>2]=c[l+8>>2]}else{l=c[d+8>>2]|0;m=c[d+4>>2]|0;if(m>>>0>4294967279>>>0){DE(0)}if(m>>>0<11>>>0){a[h]=m<<1;n=h+1|0}else{d=m+16&-16;o=K$(d)|0;c[h+8>>2]=o;c[h>>2]=d|1;c[h+4>>2]=m;n=o}La(n|0,l|0,m)|0;a[n+m|0]=0}m=j;n=e;c[m>>2]=c[n>>2];c[m+4>>2]=c[n+4>>2];c[m+8>>2]=c[n+8>>2];z=0;aR(412,k|0,h|0,j|0);if(!z){if((a[h]&1)==0){p=b|0;c[p>>2]=16232;q=b+28|0;c[q>>2]=f;i=g;return}K1(c[h+8>>2]|0);p=b|0;c[p>>2]=16232;q=b+28|0;c[q>>2]=f;i=g;return}else{z=0;g=bS(-1,-1)|0;if((a[h]&1)==0){bg(g|0)}K1(c[h+8>>2]|0);bg(g|0)}}function mX(b){b=b|0;var d=0;d=b|0;c[d>>2]=21936;if((a[b+32|0]&1)!=0){K1(c[b+40>>2]|0)}c[d>>2]=16664;if((a[b+4|0]&1)==0){return}K1(c[b+12>>2]|0);return}function mY(b){b=b|0;var d=0,e=0;d=b|0;c[d>>2]=21936;if((a[b+32|0]&1)!=0){K1(c[b+40>>2]|0)}c[d>>2]=16664;if((a[b+4|0]&1)==0){e=b;K1(e);return}K1(c[b+12>>2]|0);e=b;K1(e);return}function mZ(a,b){a=a|0;b=b|0;cA[c[(c[b>>2]|0)+88>>2]&1023](b,a);return}function m_(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+88>>2]&1023](b,a)|0}function m$(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+88>>2]&1023](b,a)|0}function m0(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+88>>2]&1023](b,a)|0}function m1(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+88>>2]&1023](b,a)|0}function m2(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+88>>2]&511](a,d,b);return}function m3(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+88>>2]&511](a,d,b);return}function m4(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;f=i;i=i+32|0;g=e;e=i;i=i+12|0;i=i+7&-8;c[e>>2]=c[g>>2];c[e+4>>2]=c[g+4>>2];c[e+8>>2]=c[g+8>>2];g=f|0;h=f+16|0;j=d;if((a[j]&1)==0){k=h;c[k>>2]=c[j>>2];c[k+4>>2]=c[j+4>>2];c[k+8>>2]=c[j+8>>2];l=a[k]|0;m=k}else{k=c[d+8>>2]|0;j=c[d+4>>2]|0;if(j>>>0>4294967279>>>0){DE(0)}if(j>>>0<11>>>0){d=j<<1&255;n=h;a[n]=d;o=h+1|0;p=d;q=n}else{n=j+16&-16;d=K$(n)|0;c[h+8>>2]=d;r=n|1;c[h>>2]=r;c[h+4>>2]=j;o=d;p=r&255;q=h}La(o|0,k|0,j)|0;a[o+j|0]=0;l=p;m=q}q=e;e=g;c[e>>2]=c[q>>2];c[e+4>>2]=c[q+4>>2];c[e+8>>2]=c[q+8>>2];q=g;g=b|0;c[g>>2]=16664;e=b+4|0;L12:do{if((l&1)==0){p=e;c[p>>2]=c[m>>2];c[p+4>>2]=c[m+4>>2];c[p+8>>2]=c[m+8>>2]}else{p=c[h+8>>2]|0;j=c[h+4>>2]|0;do{if(j>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(j>>>0<11>>>0){a[e]=j<<1;s=e+1|0}else{o=j+16&-16;k=(z=0,au(246,o|0)|0);if(z){z=0;break}c[b+12>>2]=k;c[e>>2]=o|1;c[b+8>>2]=j;s=k}La(s|0,p|0,j)|0;a[s+j|0]=0;break L12}}while(0);j=bS(-1,-1)|0;if((a[m]&1)==0){bg(j|0)}K1(p);bg(j|0)}}while(0);s=b+16|0;c[s>>2]=c[q>>2];c[s+4>>2]=c[q+4>>2];c[s+8>>2]=c[q+8>>2];if((a[m]&1)==0){t=b+28|0;u=b+32|0;c[u>>2]=0;v=b+36|0;c[v>>2]=0;w=b+40|0;c[w>>2]=0;c[g>>2]=21856;c[t>>2]=21904;x=b+44|0;a[x]=0;y=b+45|0;a[y]=0;i=f;return}K1(c[h+8>>2]|0);t=b+28|0;u=b+32|0;c[u>>2]=0;v=b+36|0;c[v>>2]=0;w=b+40|0;c[w>>2]=0;c[g>>2]=21856;c[t>>2]=21904;x=b+44|0;a[x]=0;y=b+45|0;a[y]=0;i=f;return}function m5(b){b=b|0;var d=0,e=0,f=0,g=0;c[b+28>>2]=21664;d=c[b+32>>2]|0;e=d;if((d|0)!=0){f=b+36|0;g=c[f>>2]|0;if((d|0)!=(g|0)){c[f>>2]=g+(~((g-4+(-e|0)|0)>>>2)<<2)}K1(d)}c[b>>2]=16664;if((a[b+4|0]&1)==0){return}K1(c[b+12>>2]|0);return}function m6(b){b=b|0;var d=0,e=0,f=0,g=0,h=0;c[b+28>>2]=21664;d=c[b+32>>2]|0;e=d;if((d|0)!=0){f=b+36|0;g=c[f>>2]|0;if((d|0)!=(g|0)){c[f>>2]=g+(~((g-4+(-e|0)|0)>>>2)<<2)}K1(d)}c[b>>2]=16664;if((a[b+4|0]&1)==0){h=b;K1(h);return}K1(c[b+12>>2]|0);h=b;K1(h);return}function m7(a,b){a=a|0;b=b|0;cA[c[(c[b>>2]|0)+156>>2]&1023](b,a);return}function m8(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+156>>2]&1023](b,a)|0}function m9(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+156>>2]&1023](b,a)|0}function na(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+156>>2]&1023](b,a)|0}function nb(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+156>>2]&1023](b,a)|0}function nc(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+156>>2]&511](a,d,b);return}function nd(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+156>>2]&511](a,d,b);return}function ne(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0;e=i;i=i+240|0;f=e|0;g=e+16|0;h=e+32|0;j=e+48|0;k=e+64|0;l=e+80|0;m=e+96|0;n=e+112|0;o=e+128|0;p=e+144|0;q=e+160|0;r=e+176|0;s=e+192|0;t=e+208|0;u=e+224|0;if((c[d+40>>2]|0)!=0){L3:do{if((a[b+45|0]&1)!=0){v=K$(80)|0;w=f+8|0;c[w>>2]=v;c[f>>2]=81;c[f+4>>2]=71;La(v|0,8032,71)|0;a[v+71|0]=0;v=d+4|0;L5:do{if((a[v]&1)==0){x=g;c[x>>2]=c[v>>2];c[x+4>>2]=c[v+4>>2];c[x+8>>2]=c[v+8>>2];y=13}else{x=c[d+12>>2]|0;A=c[d+8>>2]|0;do{if(A>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(A>>>0<11>>>0){a[g]=A<<1;B=g+1|0}else{C=A+16&-16;D=(z=0,au(246,C|0)|0);if(z){z=0;break}c[g+8>>2]=D;c[g>>2]=C|1;c[g+4>>2]=A;B=D}La(B|0,x|0,A)|0;a[B+A|0]=0;y=13;break L5}}while(0);A=bS(-1,-1)|0;E=M;F=A}}while(0);do{if((y|0)==13){v=h;A=d+16|0;c[v>>2]=c[A>>2];c[v+4>>2]=c[A+4>>2];c[v+8>>2]=c[A+8>>2];z=0;aR(372,f|0,g|0,h|0);if(z){z=0;A=bS(-1,-1)|0;v=A;A=M;if((a[g]&1)==0){E=A;F=v;break}K1(c[g+8>>2]|0);E=A;F=v;break}if((a[g]&1)!=0){K1(c[g+8>>2]|0)}if((a[f]&1)==0){break L3}K1(c[w>>2]|0);break L3}}while(0);if((a[f]&1)==0){G=E;H=F;I=H;J=0;K=I;L=G;bg(K|0)}K1(c[w>>2]|0);G=E;H=F;I=H;J=0;K=I;L=G;bg(K|0)}}while(0);a[b+44|0]=1;i=e;return}F=b+45|0;E=(a[F]&1)!=0;if((a[d+44|0]&1)!=0){L38:do{if(E){f=K$(80)|0;g=j+8|0;c[g>>2]=f;c[j>>2]=81;c[j+4>>2]=72;La(f|0,7864,72)|0;a[f+72|0]=0;f=d+4|0;L40:do{if((a[f]&1)==0){h=k;c[h>>2]=c[f>>2];c[h+4>>2]=c[f+4>>2];c[h+8>>2]=c[f+8>>2];y=36}else{h=c[d+12>>2]|0;B=c[d+8>>2]|0;do{if(B>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(B>>>0<11>>>0){a[k]=B<<1;N=k+1|0}else{v=B+16&-16;A=(z=0,au(246,v|0)|0);if(z){z=0;break}c[k+8>>2]=A;c[k>>2]=v|1;c[k+4>>2]=B;N=A}La(N|0,h|0,B)|0;a[N+B|0]=0;y=36;break L40}}while(0);B=bS(-1,-1)|0;O=M;P=B}}while(0);do{if((y|0)==36){f=l;w=d+16|0;c[f>>2]=c[w>>2];c[f+4>>2]=c[w+4>>2];c[f+8>>2]=c[w+8>>2];z=0;aR(372,j|0,k|0,l|0);if(z){z=0;w=bS(-1,-1)|0;f=w;w=M;if((a[k]&1)==0){O=w;P=f;break}K1(c[k+8>>2]|0);O=w;P=f;break}if((a[k]&1)!=0){K1(c[k+8>>2]|0)}if((a[j]&1)==0){break L38}K1(c[g>>2]|0);break L38}}while(0);if((a[j]&1)==0){G=O;H=P;I=H;J=0;K=I;L=G;bg(K|0)}K1(c[g>>2]|0);G=O;H=P;I=H;J=0;K=I;L=G;bg(K|0)}}while(0);L69:do{if((a[b+44|0]&1)!=0){P=K$(80)|0;O=m+8|0;c[O>>2]=P;c[m>>2]=81;c[m+4>>2]=71;La(P|0,8032,71)|0;a[P+71|0]=0;P=d+4|0;L71:do{if((a[P]&1)==0){j=n;c[j>>2]=c[P>>2];c[j+4>>2]=c[P+4>>2];c[j+8>>2]=c[P+8>>2];y=57}else{j=c[d+12>>2]|0;k=c[d+8>>2]|0;do{if(k>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(k>>>0<11>>>0){a[n]=k<<1;Q=n+1|0}else{l=k+16&-16;N=(z=0,au(246,l|0)|0);if(z){z=0;break}c[n+8>>2]=N;c[n>>2]=l|1;c[n+4>>2]=k;Q=N}La(Q|0,j|0,k)|0;a[Q+k|0]=0;y=57;break L71}}while(0);k=bS(-1,-1)|0;R=M;S=k}}while(0);do{if((y|0)==57){P=o;g=d+16|0;c[P>>2]=c[g>>2];c[P+4>>2]=c[g+4>>2];c[P+8>>2]=c[g+8>>2];z=0;aR(372,m|0,n|0,o|0);if(z){z=0;g=bS(-1,-1)|0;P=g;g=M;if((a[n]&1)==0){R=g;S=P;break}K1(c[n+8>>2]|0);R=g;S=P;break}if((a[n]&1)!=0){K1(c[n+8>>2]|0)}if((a[m]&1)==0){break L69}K1(c[O>>2]|0);break L69}}while(0);if((a[m]&1)==0){G=R;H=S;I=H;J=0;K=I;L=G;bg(K|0)}K1(c[O>>2]|0);G=R;H=S;I=H;J=0;K=I;L=G;bg(K|0)}}while(0);a[F]=1;i=e;return}L102:do{if(E){F=K$(64)|0;S=p+8|0;c[S>>2]=F;c[p>>2]=65;c[p+4>>2]=59;La(F|0,7680,59)|0;a[F+59|0]=0;F=d+4|0;L104:do{if((a[F]&1)==0){R=q;c[R>>2]=c[F>>2];c[R+4>>2]=c[F+4>>2];c[R+8>>2]=c[F+8>>2];y=79}else{R=c[d+12>>2]|0;m=c[d+8>>2]|0;do{if(m>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(m>>>0<11>>>0){a[q]=m<<1;T=q+1|0}else{n=m+16&-16;o=(z=0,au(246,n|0)|0);if(z){z=0;break}c[q+8>>2]=o;c[q>>2]=n|1;c[q+4>>2]=m;T=o}La(T|0,R|0,m)|0;a[T+m|0]=0;y=79;break L104}}while(0);m=bS(-1,-1)|0;U=M;V=m}}while(0);do{if((y|0)==79){F=r;O=d+16|0;c[F>>2]=c[O>>2];c[F+4>>2]=c[O+4>>2];c[F+8>>2]=c[O+8>>2];z=0;aR(372,p|0,q|0,r|0);if(z){z=0;O=bS(-1,-1)|0;F=O;O=M;if((a[q]&1)==0){U=O;V=F;break}K1(c[q+8>>2]|0);U=O;V=F;break}if((a[q]&1)!=0){K1(c[q+8>>2]|0)}if((a[p]&1)==0){break L102}K1(c[S>>2]|0);break L102}}while(0);if((a[p]&1)==0){G=U;H=V;I=H;J=0;K=I;L=G;bg(K|0)}K1(c[S>>2]|0);G=U;H=V;I=H;J=0;K=I;L=G;bg(K|0)}}while(0);if((a[b+44|0]&1)==0){i=e;return}b=K$(64)|0;V=s+8|0;c[V>>2]=b;c[s>>2]=65;c[s+4>>2]=52;La(b|0,7512,52)|0;a[b+52|0]=0;b=d+4|0;L136:do{if((a[b]&1)==0){U=t;c[U>>2]=c[b>>2];c[U+4>>2]=c[b+4>>2];c[U+8>>2]=c[b+8>>2];y=100}else{U=c[d+12>>2]|0;p=c[d+8>>2]|0;do{if(p>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(p>>>0<11>>>0){a[t]=p<<1;W=t+1|0}else{q=p+16&-16;r=(z=0,au(246,q|0)|0);if(z){z=0;break}c[t+8>>2]=r;c[t>>2]=q|1;c[t+4>>2]=p;W=r}La(W|0,U|0,p)|0;a[W+p|0]=0;y=100;break L136}}while(0);p=bS(-1,-1)|0;X=M;Y=p}}while(0);do{if((y|0)==100){W=u;b=d+16|0;c[W>>2]=c[b>>2];c[W+4>>2]=c[b+4>>2];c[W+8>>2]=c[b+8>>2];z=0;aR(372,s|0,t|0,u|0);if(z){z=0;b=bS(-1,-1)|0;W=b;b=M;if((a[t]&1)==0){X=b;Y=W;break}K1(c[t+8>>2]|0);X=b;Y=W;break}if((a[t]&1)!=0){K1(c[t+8>>2]|0)}if((a[s]&1)==0){i=e;return}K1(c[V>>2]|0);i=e;return}}while(0);if((a[s]&1)==0){G=X;H=Y;I=H;J=0;K=I;L=G;bg(K|0)}K1(c[V>>2]|0);G=X;H=Y;I=H;J=0;K=I;L=G;bg(K|0)}function nf(a,b){a=a|0;b=b|0;ne(a-48+20|0,b);return}function ng(b){b=b|0;var d=0,e=0,f=0,g=0;d=b-48+20|0;c[d+28>>2]=21664;b=c[d+32>>2]|0;e=b;if((b|0)!=0){f=d+36|0;g=c[f>>2]|0;if((b|0)!=(g|0)){c[f>>2]=g+(~((g-4+(-e|0)|0)>>>2)<<2)}K1(b)}c[d>>2]=16664;if((a[d+4|0]&1)==0){return}K1(c[d+12>>2]|0);return}function nh(b){b=b|0;var d=0,e=0,f=0,g=0,h=0;d=b-48+20|0;c[d+28>>2]=21664;b=c[d+32>>2]|0;e=b;if((b|0)!=0){f=d+36|0;g=c[f>>2]|0;if((b|0)!=(g|0)){c[f>>2]=g+(~((g-4+(-e|0)|0)>>>2)<<2)}K1(b)}c[d>>2]=16664;if((a[d+4|0]&1)==0){h=d;K1(h);return}K1(c[d+12>>2]|0);h=d;K1(h);return}function ni(a,b){a=a|0;b=b|0;return}function nj(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;k=i;i=i+32|0;l=e;e=i;i=i+12|0;i=i+7&-8;c[e>>2]=c[l>>2];c[e+4>>2]=c[l+4>>2];c[e+8>>2]=c[l+8>>2];l=k|0;m=k+16|0;n=b|0;o=d;if((a[o]&1)==0){p=l;c[p>>2]=c[o>>2];c[p+4>>2]=c[o+4>>2];c[p+8>>2]=c[o+8>>2]}else{o=c[d+8>>2]|0;p=c[d+4>>2]|0;if(p>>>0>4294967279>>>0){DE(0)}if(p>>>0<11>>>0){a[l]=p<<1;q=l+1|0}else{d=p+16&-16;r=K$(d)|0;c[l+8>>2]=r;c[l>>2]=d|1;c[l+4>>2]=p;q=r}La(q|0,o|0,p)|0;a[q+p|0]=0}p=m;q=e;c[p>>2]=c[q>>2];c[p+4>>2]=c[q+4>>2];c[p+8>>2]=c[q+8>>2];z=0;aV(6,n|0,l|0,m|0,h|0);if(z){z=0;h=bS(-1,-1)|0;m=h;h=M;if((a[l]&1)==0){s=h;t=m;u=t;v=0;w=u;x=s;bg(w|0)}K1(c[l+8>>2]|0);s=h;t=m;u=t;v=0;w=u;x=s;bg(w|0)}if((a[l]&1)!=0){K1(c[l+8>>2]|0)}l=b|0;c[l>>2]=22072;m=b+32|0;h=f;if((a[h]&1)==0){n=m;c[n>>2]=c[h>>2];c[n+4>>2]=c[h+4>>2];c[n+8>>2]=c[h+8>>2];y=b+44|0;c[y>>2]=g;A=b+48|0;c[A>>2]=0;B=b+52|0;c[B>>2]=j;C=b+56|0;c[C>>2]=0;D=b+60|0;c[D>>2]=0;E=b+64|0;a[E]=0;F=b+68|0;c[F>>2]=0;i=k;return}h=c[f+8>>2]|0;n=c[f+4>>2]|0;do{if(n>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(n>>>0<11>>>0){a[m]=n<<1;G=m+1|0}else{f=n+16&-16;q=(z=0,au(246,f|0)|0);if(z){z=0;break}c[b+40>>2]=q;c[m>>2]=f|1;c[b+36>>2]=n;G=q}La(G|0,h|0,n)|0;a[G+n|0]=0;y=b+44|0;c[y>>2]=g;A=b+48|0;c[A>>2]=0;B=b+52|0;c[B>>2]=j;C=b+56|0;c[C>>2]=0;D=b+60|0;c[D>>2]=0;E=b+64|0;a[E]=0;F=b+68|0;c[F>>2]=0;i=k;return}}while(0);k=bS(-1,-1)|0;F=k;k=M;c[l>>2]=16664;if((a[b+4|0]&1)==0){s=k;t=F;u=t;v=0;w=u;x=s;bg(w|0)}K1(c[b+12>>2]|0);s=k;t=F;u=t;v=0;w=u;x=s;bg(w|0)}function nk(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;e=b|0;c[e>>2]=16664;f=b+4|0;g=d+4|0;if((a[g]&1)==0){h=f;c[h>>2]=c[g>>2];c[h+4>>2]=c[g+4>>2];c[h+8>>2]=c[g+8>>2]}else{g=c[d+12>>2]|0;h=c[d+8>>2]|0;if(h>>>0>4294967279>>>0){DE(0)}if(h>>>0<11>>>0){a[f]=h<<1;i=f+1|0}else{j=h+16&-16;k=K$(j)|0;c[b+12>>2]=k;c[f>>2]=j|1;c[b+8>>2]=h;i=k}La(i|0,g|0,h)|0;a[i+h|0]=0}h=b+16|0;i=d+16|0;c[h>>2]=c[i>>2];c[h+4>>2]=c[i+4>>2];c[h+8>>2]=c[i+8>>2];c[e>>2]=16232;c[b+28>>2]=c[d+28>>2];c[e>>2]=22072;i=b+32|0;h=d+32|0;if((a[h]&1)==0){g=i;c[g>>2]=c[h>>2];c[g+4>>2]=c[h+4>>2];c[g+8>>2]=c[h+8>>2];l=b+44|0;m=d+44|0;n=l;o=m;c[n>>2]=c[o>>2];c[n+4>>2]=c[o+4>>2];c[n+8>>2]=c[o+8>>2];c[n+12>>2]=c[o+12>>2];c[n+16>>2]=c[o+16>>2];c[n+20>>2]=c[o+20>>2];c[n+24>>2]=c[o+24>>2];return}h=c[d+40>>2]|0;g=c[d+36>>2]|0;do{if(g>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(g>>>0<11>>>0){a[i]=g<<1;p=i+1|0}else{k=g+16&-16;j=(z=0,au(246,k|0)|0);if(z){z=0;break}c[b+40>>2]=j;c[i>>2]=k|1;c[b+36>>2]=g;p=j}La(p|0,h|0,g)|0;a[p+g|0]=0;l=b+44|0;m=d+44|0;n=l;o=m;c[n>>2]=c[o>>2];c[n+4>>2]=c[o+4>>2];c[n+8>>2]=c[o+8>>2];c[n+12>>2]=c[o+12>>2];c[n+16>>2]=c[o+16>>2];c[n+20>>2]=c[o+20>>2];c[n+24>>2]=c[o+24>>2];return}}while(0);o=bS(-1,-1)|0;c[e>>2]=16664;if((a[f]&1)==0){bg(o|0)}K1(c[b+12>>2]|0);bg(o|0)}function nl(b){b=b|0;c[b>>2]=16664;if((a[b+4|0]&1)==0){return}K1(c[b+12>>2]|0);return}function nm(b){b=b|0;var d=0;c[b>>2]=16664;if((a[b+4|0]&1)==0){d=b;K1(d);return}K1(c[b+12>>2]|0);d=b;K1(d);return}function nn(a,b){a=a|0;b=b|0;cA[c[(c[b>>2]|0)+32>>2]&1023](b,a);return}function no(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+32>>2]&1023](b,a)|0}function np(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+32>>2]&1023](b,a)|0}function nq(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+32>>2]&1023](b,a)|0}function nr(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+32>>2]&1023](b,a)|0}function ns(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+32>>2]&511](a,d,b);return}function nt(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+32>>2]&511](a,d,b);return}function nu(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;j=i;i=i+32|0;k=e;e=i;i=i+12|0;i=i+7&-8;c[e>>2]=c[k>>2];c[e+4>>2]=c[k+4>>2];c[e+8>>2]=c[k+8>>2];k=j|0;l=j+16|0;m=b|0;n=d;if((a[n]&1)==0){o=k;c[o>>2]=c[n>>2];c[o+4>>2]=c[n+4>>2];c[o+8>>2]=c[n+8>>2]}else{n=c[d+8>>2]|0;o=c[d+4>>2]|0;if(o>>>0>4294967279>>>0){DE(0)}if(o>>>0<11>>>0){a[k]=o<<1;p=k+1|0}else{d=o+16&-16;q=K$(d)|0;c[k+8>>2]=q;c[k>>2]=d|1;c[k+4>>2]=o;p=q}La(p|0,n|0,o)|0;a[p+o|0]=0}o=l;p=e;c[o>>2]=c[p>>2];c[o+4>>2]=c[p+4>>2];c[o+8>>2]=c[p+8>>2];z=0;aV(6,m|0,k|0,l|0,h|0);if(z){z=0;h=bS(-1,-1)|0;l=h;h=M;if((a[k]&1)==0){r=h;s=l;t=s;u=0;v=t;w=r;bg(v|0)}K1(c[k+8>>2]|0);r=h;s=l;t=s;u=0;v=t;w=r;bg(v|0)}if((a[k]&1)!=0){K1(c[k+8>>2]|0)}k=b|0;c[k>>2]=17416;l=b+32|0;h=f;if((a[h]&1)==0){m=l;c[m>>2]=c[h>>2];c[m+4>>2]=c[h+4>>2];c[m+8>>2]=c[h+8>>2];x=b+44|0;c[x>>2]=g;i=j;return}h=c[f+8>>2]|0;m=c[f+4>>2]|0;do{if(m>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(m>>>0<11>>>0){a[l]=m<<1;y=l+1|0}else{f=m+16&-16;p=(z=0,au(246,f|0)|0);if(z){z=0;break}c[b+40>>2]=p;c[l>>2]=f|1;c[b+36>>2]=m;y=p}La(y|0,h|0,m)|0;a[y+m|0]=0;x=b+44|0;c[x>>2]=g;i=j;return}}while(0);j=bS(-1,-1)|0;g=j;j=M;c[k>>2]=16664;if((a[b+4|0]&1)==0){r=j;s=g;t=s;u=0;v=t;w=r;bg(v|0)}K1(c[b+12>>2]|0);r=j;s=g;t=s;u=0;v=t;w=r;bg(v|0)}function nv(b){b=b|0;var d=0;d=b|0;c[d>>2]=17416;if((a[b+32|0]&1)!=0){K1(c[b+40>>2]|0)}c[d>>2]=16664;if((a[b+4|0]&1)==0){return}K1(c[b+12>>2]|0);return}function nw(b){b=b|0;var d=0,e=0;d=b|0;c[d>>2]=17416;if((a[b+32|0]&1)!=0){K1(c[b+40>>2]|0)}c[d>>2]=16664;if((a[b+4|0]&1)==0){e=b;K1(e);return}K1(c[b+12>>2]|0);e=b;K1(e);return}function nx(a,b){a=a|0;b=b|0;cA[c[(c[b>>2]|0)+28>>2]&1023](b,a);return}function ny(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+28>>2]&1023](b,a)|0}function nz(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+28>>2]&1023](b,a)|0}function nA(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+28>>2]&1023](b,a)|0}function nB(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+28>>2]&1023](b,a)|0}function nC(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+28>>2]&511](a,d,b);return}function nD(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+28>>2]&511](a,d,b);return}function nE(b){b=b|0;c[b>>2]=16664;if((a[b+4|0]&1)==0){return}K1(c[b+12>>2]|0);return}function nF(b){b=b|0;var d=0;c[b>>2]=16664;if((a[b+4|0]&1)==0){d=b;K1(d);return}K1(c[b+12>>2]|0);d=b;K1(d);return}function nG(a,b){a=a|0;b=b|0;cA[c[(c[b>>2]|0)+24>>2]&1023](b,a);return}function nH(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+24>>2]&1023](b,a)|0}function nI(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+24>>2]&1023](b,a)|0}function nJ(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+24>>2]&1023](b,a)|0}function nK(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+24>>2]&1023](b,a)|0}function nL(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+24>>2]&511](a,d,b);return}function nM(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+24>>2]&511](a,d,b);return}function nN(a){a=a|0;return 1}function nO(b){b=b|0;c[b>>2]=16664;if((a[b+4|0]&1)==0){return}K1(c[b+12>>2]|0);return}function nP(b){b=b|0;var d=0;c[b>>2]=16664;if((a[b+4|0]&1)==0){d=b;K1(d);return}K1(c[b+12>>2]|0);d=b;K1(d);return}function nQ(a,b){a=a|0;b=b|0;cA[c[(c[b>>2]|0)+16>>2]&1023](b,a);return}function nR(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+16>>2]&1023](b,a)|0}function nS(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+16>>2]&1023](b,a)|0}function nT(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+16>>2]&1023](b,a)|0}function nU(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+16>>2]&1023](b,a)|0}function nV(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+16>>2]&511](a,d,b);return}function nW(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+16>>2]&511](a,d,b);return}function nX(a){a=a|0;return 1}function nY(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0;h=i;i=i+32|0;j=e;e=i;i=i+12|0;i=i+7&-8;c[e>>2]=c[j>>2];c[e+4>>2]=c[j+4>>2];c[e+8>>2]=c[j+8>>2];j=h|0;k=h+16|0;l=b|0;m=d;if((a[m]&1)==0){n=j;c[n>>2]=c[m>>2];c[n+4>>2]=c[m+4>>2];c[n+8>>2]=c[m+8>>2]}else{m=c[d+8>>2]|0;n=c[d+4>>2]|0;if(n>>>0>4294967279>>>0){DE(0)}if(n>>>0<11>>>0){a[j]=n<<1;o=j+1|0}else{d=n+16&-16;p=K$(d)|0;c[j+8>>2]=p;c[j>>2]=d|1;c[j+4>>2]=n;o=p}La(o|0,m|0,n)|0;a[o+n|0]=0}n=k;o=e;c[n>>2]=c[o>>2];c[n+4>>2]=c[o+4>>2];c[n+8>>2]=c[o+8>>2];z=0;aR(412,l|0,j|0,k|0);if(z){z=0;k=bS(-1,-1)|0;l=k;k=M;if((a[j]&1)==0){q=k;r=l;s=r;t=0;u=s;v=q;bg(u|0)}K1(c[j+8>>2]|0);q=k;r=l;s=r;t=0;u=s;v=q;bg(u|0)}if((a[j]&1)!=0){K1(c[j+8>>2]|0)}j=b+28|0;c[j>>2]=21632;l=b+32|0;c[l>>2]=0;k=b+36|0;c[k>>2]=0;o=b+40|0;c[o>>2]=0;if((f|0)==0){w=b|0;c[w>>2]=18352;c[j>>2]=18408;x=b+44|0;y=g&1;a[x]=y;A=b+45|0;a[A]=0;B=b+46|0;a[B]=0;i=h;return}n=(z=0,au(246,f<<2|0)|0);if(!z){e=n;c[l>>2]=e;c[k>>2]=e;c[o>>2]=e+(f<<2);w=b|0;c[w>>2]=18352;c[j>>2]=18408;x=b+44|0;y=g&1;a[x]=y;A=b+45|0;a[A]=0;B=b+46|0;a[B]=0;i=h;return}else{z=0}h=bS(-1,-1)|0;B=h;h=M;c[b>>2]=16664;if((a[b+4|0]&1)==0){q=h;r=B;s=r;t=0;u=s;v=q;bg(u|0)}K1(c[b+12>>2]|0);q=h;r=B;s=r;t=0;u=s;v=q;bg(u|0)}function nZ(b){b=b|0;var d=0,e=0,f=0,g=0;c[b+28>>2]=21632;d=c[b+32>>2]|0;e=d;if((d|0)!=0){f=b+36|0;g=c[f>>2]|0;if((d|0)!=(g|0)){c[f>>2]=g+(~((g-4+(-e|0)|0)>>>2)<<2)}K1(d)}c[b>>2]=16664;if((a[b+4|0]&1)==0){return}K1(c[b+12>>2]|0);return}function n_(b){b=b|0;var d=0,e=0,f=0,g=0,h=0;c[b+28>>2]=21632;d=c[b+32>>2]|0;e=d;if((d|0)!=0){f=b+36|0;g=c[f>>2]|0;if((d|0)!=(g|0)){c[f>>2]=g+(~((g-4+(-e|0)|0)>>>2)<<2)}K1(d)}c[b>>2]=16664;if((a[b+4|0]&1)==0){h=b;K1(h);return}K1(c[b+12>>2]|0);h=b;K1(h);return}function n$(a,b){a=a|0;b=b|0;cA[c[(c[b>>2]|0)+12>>2]&1023](b,a);return}function n0(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+12>>2]&1023](b,a)|0}function n1(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+12>>2]&1023](b,a)|0}function n2(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+12>>2]&1023](b,a)|0}function n3(a,b){a=a|0;b=b|0;return cU[c[(c[b>>2]|0)+12>>2]&1023](b,a)|0}function n4(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+12>>2]&511](a,d,b);return}function n5(a,b,d){a=a|0;b=b|0;d=d|0;cZ[c[(c[d>>2]|0)+12>>2]&511](a,d,b);return}function n6(a){a=a|0;return a|0}function n7(b,d){b=b|0;d=d|0;if(cC[c[(c[d>>2]|0)+36>>2]&511](d)|0){a[b+45|0]=1;return}else{a[b+46|0]=1;return}}function n8(b,d){b=b|0;d=d|0;var e=0;e=b-48+20|0;if(cC[c[(c[d>>2]|0)+36>>2]&511](d)|0){a[e+45|0]=1;return}else{a[e+46|0]=1;return}}function n9(b){b=b|0;var d=0,e=0,f=0,g=0;d=b-48+20|0;c[d+28>>2]=21632;b=c[d+32>>2]|0;e=b;if((b|0)!=0){f=d+36|0;g=c[f>>2]|0;if((b|0)!=(g|0)){c[f>>2]=g+(~((g-4+(-e|0)|0)>>>2)<<2)}K1(b)}c[d>>2]=16664;if((a[d+4|0]&1)==0){return}K1(c[d+12>>2]|0);return}function oa(b){b=b|0;var d=0,e=0,f=0,g=0,h=0;d=b-48+20|0;c[d+28>>2]=21632;b=c[d+32>>2]|0;e=b;if((b|0)!=0){f=d+36|0;g=c[f>>2]|0;if((b|0)!=(g|0)){c[f>>2]=g+(~((g-4+(-e|0)|0)>>>2)<<2)}K1(b)}c[d>>2]=16664;if((a[d+4|0]&1)==0){h=d;K1(h);return}K1(c[d+12>>2]|0);h=d;K1(h);return}function ob(a,b){a=a|0;b=b|0;return}function oc(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[a>>2]=17752;c[a+4>>2]=b;c[a+8>>2]=d;c[a+12>>2]=e;c[a+16>>2]=f;return}function od(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=b+32|0;e=c[d>>2]|0;f=(c[b+36>>2]|0)-e>>2;if((f|0)==0){return}b=a|0;a=0;g=e;while(1){e=c[g+(a<<2)>>2]|0;cA[c[(c[e>>2]|0)+8>>2]&1023](e|0,b);e=a+1|0;if(e>>>0>=f>>>0){break}a=e;g=c[d>>2]|0}return}function oe(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,at=0,av=0,aw=0,ax=0,ay=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0;e=i;i=i+128|0;f=e|0;g=e+8|0;h=e+16|0;j=e+32|0;k=e+40|0;l=e+48|0;m=e+64|0;n=e+72|0;o=e+88|0;p=e+96|0;q=e+112|0;r=d+32|0;s=c[r>>2]|0;t=n|0;u=n+4|0;c[u>>2]=0;c[n+8>>2]=0;c[n>>2]=u;z=0;as(278,o|0,0);L1:do{if(!z){u=b+4|0;v=c[u>>2]|0;w=(z=0,au(246,48)|0);L3:do{if(!z){x=w;c[m>>2]=x;y=v+4|0;A=c[y>>2]|0;if((A|0)==(c[v+8>>2]|0)){z=0;as(378,v|0,m|0);if(z){z=0;B=38;break}C=c[m>>2]|0}else{if((A|0)==0){D=0}else{c[A>>2]=x;D=c[y>>2]|0}c[y>>2]=D+4;C=x}x=C;A=s+4|0;L13:do{if((a[A]&1)==0){E=p;c[E>>2]=c[A>>2];c[E+4>>2]=c[A+4>>2];c[E+8>>2]=c[A+8>>2];B=19}else{E=c[s+12>>2]|0;F=c[s+8>>2]|0;do{if(F>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(F>>>0<11>>>0){a[p]=F<<1;G=p+1|0}else{H=F+16&-16;I=(z=0,au(246,H|0)|0);if(z){z=0;break}c[p+8>>2]=I;c[p>>2]=H|1;c[p+4>>2]=F;G=I}La(G|0,E|0,F)|0;a[G+F|0]=0;B=19;break L13}}while(0);F=bS(-1,-1)|0;J=F;K=M}}while(0);do{if((B|0)==19){F=s+16|0;E=l;c[E>>2]=c[F>>2];c[E+4>>2]=c[F+4>>2];c[E+8>>2]=c[F+8>>2];E=s+40|0;I=s+36|0;z=0;aV(58,C|0,p|0,l|0,(c[E>>2]|0)-(c[I>>2]|0)>>2|0);if(z){z=0;H=bS(-1,-1)|0;L=H;H=M;if((a[p]&1)==0){J=L;K=H;break}K1(c[p+8>>2]|0);J=L;K=H;break}if((a[p]&1)!=0){K1(c[p+8>>2]|0)}H=c[I>>2]|0;L=(c[E>>2]|0)-H>>2;do{if((L|0)==0){B=67}else{E=C+32|0;N=E;O=C+40|0;P=E+12|0;Q=C+36|0;R=E;E=0;S=0;T=H;L37:while(1){U=T+(E<<2)|0;c[U>>2]=c[(c[U>>2]|0)+40>>2];U=c[(c[I>>2]|0)+(E<<2)>>2]|0;if((a[U+29|0]&1)==0){c[j>>2]=U;V=c[O>>2]|0;W=V;if((W|0)==(c[P>>2]|0)){z=0;as(272,Q|0,j|0);if(z){z=0;B=37;break}X=c[j>>2]|0}else{if((V|0)==0){Y=0}else{c[W>>2]=U;Y=c[O>>2]|0}c[O>>2]=Y+4;X=U}z=0;as(c[c[R>>2]>>2]|0,N|0,X|0);if(z){z=0;B=37;break}Z=c[(c[I>>2]|0)+(E<<2)>>2]|0}else{Z=U}U=(z=0,az(2,b|0,Z|0,n|0)|0);if(z){z=0;B=37;break}W=U+36|0;V=c[W>>2]|0;_=(c[U+40>>2]|0)-V>>2;L52:do{if((_|0)==0){$=S}else{U=0;aa=V;while(1){ab=(z=0,az(20,b|0,c[(c[I>>2]|0)+(E<<2)>>2]|0,c[aa+(U<<2)>>2]|0)|0);if(z){z=0;B=36;break L37}ac=(ab|0)==0?0:ab+32|0;ab=ac+4|0;ad=c[ab>>2]|0;ae=(c[ac+8>>2]|0)-ad>>2;L56:do{if((ae|0)!=0){ac=0;af=ad;while(1){ag=c[af+(ac<<2)>>2]|0;c[f>>2]=ag;ah=c[O>>2]|0;ai=ah;if((ai|0)==(c[P>>2]|0)){z=0;as(272,Q|0,f|0);if(z){z=0;B=35;break L37}aj=c[f>>2]|0}else{if((ah|0)==0){ak=0}else{c[ai>>2]=ag;ak=c[O>>2]|0}c[O>>2]=ak+4;aj=ag}z=0;as(c[c[R>>2]>>2]|0,N|0,aj|0);if(z){z=0;B=35;break L37}ag=ac+1|0;if(ag>>>0>=ae>>>0){break L56}ac=ag;af=c[ab>>2]|0}}}while(0);ab=U+1|0;if(ab>>>0>=_>>>0){$=1;break L52}U=ab;aa=c[W>>2]|0}}}while(0);W=E+1|0;if(W>>>0>=L>>>0){B=66;break}E=W;S=$;T=c[I>>2]|0}if((B|0)==66){if(!$){B=67;break}T=C;c[r>>2]=T;al=T;break}else if((B|0)==35){T=bS(-1,-1)|0;am=M;an=T;B=39;break L3}else if((B|0)==36){T=bS(-1,-1)|0;am=M;an=T;B=39;break L3}else if((B|0)==37){T=bS(-1,-1)|0;am=M;an=T;B=39;break L3}}}while(0);if((B|0)==67){al=c[r>>2]|0}L82:do{if((a[al+29|0]&1)!=0){I=c[u>>2]|0;L=(z=0,au(246,48)|0);if(z){z=0;B=38;break L3}H=L;c[g>>2]=H;L=I+4|0;T=c[L>>2]|0;if((T|0)==(c[I+8>>2]|0)){z=0;as(378,I|0,g|0);if(z){z=0;B=38;break L3}ao=c[g>>2]|0}else{if((T|0)==0){ap=0}else{c[T>>2]=H;ap=c[L>>2]|0}c[L>>2]=ap+4;ao=H}H=ao;L93:do{if((a[A]&1)==0){T=q;c[T>>2]=c[A>>2];c[T+4>>2]=c[A+4>>2];c[T+8>>2]=c[A+8>>2];B=87}else{T=c[s+12>>2]|0;S=c[s+8>>2]|0;do{if(S>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}}else{if(S>>>0<11>>>0){a[q]=S<<1;aq=q+1|0}else{E=S+16&-16;N=(z=0,au(246,E|0)|0);if(z){z=0;break}c[q+8>>2]=N;c[q>>2]=E|1;c[q+4>>2]=S;aq=N}La(aq|0,T|0,S)|0;a[aq+S|0]=0;B=87;break L93}}while(0);S=bS(-1,-1)|0;at=S;av=M}}while(0);do{if((B|0)==87){S=h;c[S>>2]=c[F>>2];c[S+4>>2]=c[F+4>>2];c[S+8>>2]=c[F+8>>2];z=0;aV(58,ao|0,q|0,h|0,0);if(z){z=0;S=bS(-1,-1)|0;T=S;S=M;if((a[q]&1)==0){at=T;av=S;break}K1(c[q+8>>2]|0);at=T;av=S;break}if((a[q]&1)!=0){K1(c[q+8>>2]|0)}S=al+36|0;T=c[S>>2]|0;N=(c[al+40>>2]|0)-T>>2;L115:do{if((N|0)!=0){E=ao+32|0;R=E;O=ao+40|0;Q=E+12|0;P=ao+36|0;W=E;E=0;_=T;while(1){V=c[_+(E<<2)>>2]|0;if((a[V+29|0]&1)==0){c[k>>2]=V;aa=c[O>>2]|0;U=aa;if((U|0)==(c[Q>>2]|0)){z=0;as(272,P|0,k|0);if(z){z=0;break}aw=c[k>>2]|0}else{if((aa|0)==0){ax=0}else{c[U>>2]=V;ax=c[O>>2]|0}c[O>>2]=ax+4;aw=V}z=0;as(c[c[W>>2]>>2]|0,R|0,aw|0);if(z){z=0;break}}V=E+1|0;if(V>>>0>=N>>>0){break L115}E=V;_=c[S>>2]|0}_=bS(-1,-1)|0;am=M;an=_;B=39;break L3}}while(0);c[r>>2]=ao;break L82}}while(0);S=c[I>>2]|0;N=c[L>>2]|0;L134:do{if((S|0)==(N|0)){ay=S}else{T=S;while(1){_=T+4|0;if((c[T>>2]|0)==(ao|0)){ay=T;break L134}if((_|0)==(N|0)){ay=N;break}else{T=_}}}}while(0);I=ay-S>>2;T=S+(I+1<<2)|0;_=N-T|0;Lb(S+(I<<2)|0,T|0,_|0)|0;T=S+((_>>2)+I<<2)|0;I=c[L>>2]|0;if((T|0)!=(I|0)){c[L>>2]=I+(~((I-4+(-T|0)|0)>>>2)<<2)}K1(H);aA=at;aB=av;break L3}}while(0);F=c[d+28>>2]|0;z=0;as(c[(c[F>>2]|0)+8>>2]|0,F|0,b|0);if(z){z=0;B=38;break L3}z=0;ar(444,o|0);if(z){z=0;break L1}o7(t,c[n+4>>2]|0);i=e;return}}while(0);A=c[v>>2]|0;F=c[y>>2]|0;L146:do{if((A|0)==(F|0)){aC=A}else{T=A;while(1){I=T+4|0;if((c[T>>2]|0)==(C|0)){aC=T;break L146}if((I|0)==(F|0)){aC=F;break}else{T=I}}}}while(0);T=aC-A>>2;I=A+(T+1<<2)|0;_=F-I|0;Lb(A+(T<<2)|0,I|0,_|0)|0;I=A+((_>>2)+T<<2)|0;T=c[y>>2]|0;if((I|0)!=(T|0)){c[y>>2]=T+(~((T-4+(-I|0)|0)>>>2)<<2)}K1(x);aA=J;aB=K}else{z=0;B=38}}while(0);if((B|0)==38){v=bS(-1,-1)|0;am=M;an=v;B=39}if((B|0)==39){aA=an;aB=am}z=0;ar(444,o|0);if(!z){aD=aA;aE=aB;aF=n+4|0;aG=c[aF>>2]|0;aH=aG;o7(t,aH);aI=aD;aJ=0;aK=aI;aL=aE;bg(aK|0)}else{z=0;v=bS(-1,-1,0)|0;dk(v)}}else{z=0}}while(0);aB=bS(-1,-1)|0;aD=aB;aE=M;aF=n+4|0;aG=c[aF>>2]|0;aH=aG;o7(t,aH);aI=aD;aJ=0;aK=aI;aL=aE;bg(aK|0)}function of(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0;f=i;i=i+64|0;g=f|0;h=f+8|0;j=f+16|0;k=f+32|0;l=f+40|0;m=f+48|0;A6(l,0);n=c[b+4>>2]|0;o=(z=0,au(246,48)|0);L1:do{if(!z){p=o;c[k>>2]=p;q=n+4|0;r=c[q>>2]|0;if((r|0)==(c[n+8>>2]|0)){z=0;as(378,n|0,k|0);if(z){z=0;s=45;break}t=c[k>>2]|0}else{if((r|0)==0){u=0}else{c[r>>2]=p;u=c[q>>2]|0}c[q>>2]=u+4;t=p}p=t;r=t;v=d+4|0;L11:do{if((a[v]&1)==0){w=m;c[w>>2]=c[v>>2];c[w+4>>2]=c[v+4>>2];c[w+8>>2]=c[v+8>>2];s=18}else{w=c[d+12>>2]|0;x=c[d+8>>2]|0;do{if(x>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(x>>>0<11>>>0){a[m]=x<<1;y=m+1|0}else{A=x+16&-16;B=(z=0,au(246,A|0)|0);if(z){z=0;break}c[m+8>>2]=B;c[m>>2]=A|1;c[m+4>>2]=x;y=B}La(y|0,w|0,x)|0;a[y+x|0]=0;s=18;break L11}}while(0);x=bS(-1,-1)|0;C=x;D=M}}while(0);do{if((s|0)==18){v=d+16|0;x=j;c[x>>2]=c[v>>2];c[x+4>>2]=c[v+4>>2];c[x+8>>2]=c[v+8>>2];z=0;aV(58,r|0,m|0,j|0,0);if(z){z=0;v=bS(-1,-1)|0;x=v;v=M;if((a[m]&1)==0){C=x;D=v;break}K1(c[m+8>>2]|0);C=x;D=v;break}if((a[m]&1)!=0){K1(c[m+8>>2]|0)}v=c[d+36>>2]|0;x=c[d+40>>2]|0;L33:do{if((v|0)!=0){w=c[v+36>>2]|0;do{if(((c[v+40>>2]|0)-w|0)==4){B=c[w>>2]|0;if((B|0)==0){z=0;aS(10);if(z){z=0;s=45;break L1}return 0}else{if((c[(c[(c[B>>2]|0)-4>>2]|0)+4>>2]|0)!=26560){break}if((c[B+32>>2]|0)==0){break L33}else{break}}}}while(0);w=t+32|0;B=w;A=(z=0,az(32,b|0,v|0,e|0)|0);if(z){z=0;s=45;break L1}E=(A|0)==0?0:A+32|0;A=E+4|0;F=c[A>>2]|0;G=(c[E+8>>2]|0)-F>>2;if((G|0)==0){break}E=t+40|0;H=w+12|0;I=t+36|0;J=w;w=0;K=F;while(1){F=c[K+(w<<2)>>2]|0;c[g>>2]=F;L=c[E>>2]|0;N=L;if((N|0)==(c[H>>2]|0)){z=0;as(272,I|0,g|0);if(z){z=0;break}O=c[g>>2]|0}else{if((L|0)==0){P=0}else{c[N>>2]=F;P=c[E>>2]|0}c[E>>2]=P+4;O=F}z=0;as(c[c[J>>2]>>2]|0,B|0,O|0);if(z){z=0;break}F=w+1|0;if(F>>>0>=G>>>0){break L33}w=F;K=c[A>>2]|0}A=bS(-1,-1)|0;Q=M;R=A;s=46;break L1}}while(0);if((x|0)==0){A8(l);i=f;return r|0}v=t+32|0;A=v;K=t+40|0;w=v+12|0;G=t+36|0;B=v;v=x;L62:while(1){J=c[v+36>>2]|0;E=c[v+40>>2]|0;L64:do{if((J|0)!=0){I=c[J+36>>2]|0;do{if(((c[J+40>>2]|0)-I|0)==4){H=c[I>>2]|0;if((H|0)==0){s=59;break L62}if((c[(c[(c[H>>2]|0)-4>>2]|0)+4>>2]|0)!=26560){break}if((c[H+32>>2]|0)==0){break L64}}}while(0);I=(z=0,az(32,b|0,J|0,e|0)|0);if(z){z=0;s=43;break L62}H=(I|0)==0?0:I+32|0;I=H+4|0;F=c[I>>2]|0;N=(c[H+8>>2]|0)-F>>2;if((N|0)==0){break}else{S=0;T=F}while(1){F=c[T+(S<<2)>>2]|0;c[h>>2]=F;H=c[K>>2]|0;L=H;if((L|0)==(c[w>>2]|0)){z=0;as(272,G|0,h|0);if(z){z=0;s=42;break L62}U=c[h>>2]|0}else{if((H|0)==0){V=0}else{c[L>>2]=F;V=c[K>>2]|0}c[K>>2]=V+4;U=F}z=0;as(c[c[B>>2]>>2]|0,A|0,U|0);if(z){z=0;s=42;break L62}F=S+1|0;if(F>>>0>=N>>>0){break L64}S=F;T=c[I>>2]|0}}}while(0);if((E|0)==0){s=80;break}else{v=E}}if((s|0)==80){A8(l);i=f;return r|0}else if((s|0)==42){v=bS(-1,-1)|0;Q=M;R=v;s=46;break L1}else if((s|0)==43){v=bS(-1,-1)|0;Q=M;R=v;s=46;break L1}else if((s|0)==59){z=0;aS(10);if(z){z=0;s=45;break L1}return 0}}}while(0);r=c[n>>2]|0;v=c[q>>2]|0;L92:do{if((r|0)==(v|0)){W=r}else{A=r;while(1){B=A+4|0;if((c[A>>2]|0)==(t|0)){W=A;break L92}if((B|0)==(v|0)){W=v;break}else{A=B}}}}while(0);A=W-r>>2;B=r+(A+1<<2)|0;K=v-B|0;Lb(r+(A<<2)|0,B|0,K|0)|0;B=r+((K>>2)+A<<2)|0;A=c[q>>2]|0;if((B|0)!=(A|0)){c[q>>2]=A+(~((A-4+(-B|0)|0)>>>2)<<2)}K1(p);X=C;Y=D}else{z=0;s=45}}while(0);if((s|0)==45){D=bS(-1,-1)|0;Q=M;R=D;s=46}if((s|0)==46){X=R;Y=Q}z=0;ar(444,l|0);if(!z){bg(X|0)}else{z=0;X=bS(-1,-1,0)|0;dk(X);return 0}return 0}function og(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0;f=i;i=i+136|0;g=f|0;h=f+8|0;j=f+16|0;k=f+24|0;l=f+32|0;m=f+48|0;n=f+56|0;o=f+72|0;p=f+80|0;q=f+88|0;r=f+104|0;s=f+120|0;A6(p,0);t=b+4|0;b=c[t>>2]|0;u=(z=0,au(246,48)|0);L1:do{if(!z){v=u;c[o>>2]=v;w=b+4|0;x=c[w>>2]|0;if((x|0)==(c[b+8>>2]|0)){z=0;as(378,b|0,o|0);if(z){z=0;y=63;break}A=c[o>>2]|0}else{if((x|0)==0){B=0}else{c[x>>2]=v;B=c[w>>2]|0}c[w>>2]=B+4;A=v}v=A;x=A;C=d+4|0;L11:do{if((a[C]&1)==0){D=q;c[D>>2]=c[C>>2];c[D+4>>2]=c[C+4>>2];c[D+8>>2]=c[C+8>>2];y=18}else{D=c[d+12>>2]|0;E=c[d+8>>2]|0;do{if(E>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(E>>>0<11>>>0){a[q]=E<<1;F=q+1|0}else{G=E+16&-16;H=(z=0,au(246,G|0)|0);if(z){z=0;break}c[q+8>>2]=H;c[q>>2]=G|1;c[q+4>>2]=E;F=H}La(F|0,D|0,E)|0;a[F+E|0]=0;y=18;break L11}}while(0);E=bS(-1,-1)|0;I=E;J=M}}while(0);do{if((y|0)==18){C=d+16|0;E=n;c[E>>2]=c[C>>2];c[E+4>>2]=c[C+4>>2];c[E+8>>2]=c[C+8>>2];z=0;aV(58,x|0,q|0,n|0,0);if(z){z=0;C=bS(-1,-1)|0;E=C;C=M;if((a[q]&1)==0){I=E;J=C;break}K1(c[q+8>>2]|0);I=E;J=C;break}if((a[q]&1)!=0){K1(c[q+8>>2]|0)}C=(z=0,aM(52,d|0,c[t>>2]|0)|0);if(z){z=0;y=63;break L1}E=(z=0,aM(52,e|0,c[t>>2]|0)|0);if(z){z=0;y=63;break L1}D=(C|0)!=0;if((E|0)==0|D^1){if(!D){D=A+32|0;H=D;c[g>>2]=e;G=A+40|0;K=c[G>>2]|0;L=K;if((L|0)==(c[D+12>>2]|0)){z=0;as(272,A+36|0,g|0);if(z){z=0;y=63;break L1}N=c[g>>2]|0}else{if((K|0)==0){O=0}else{c[L>>2]=e;O=c[G>>2]|0}c[G>>2]=O+4;N=e}z=0;as(c[c[D>>2]>>2]|0,H|0,N|0);if(z){z=0;y=63;break L1}A8(p);i=f;return x|0}H=(z=0,au(136,C|0)|0);if(z){z=0;y=63;break L1}c[H+40>>2]=e;H=A+32|0;D=H;c[h>>2]=C;G=A+40|0;L=c[G>>2]|0;K=L;if((K|0)==(c[H+12>>2]|0)){z=0;as(272,A+36|0,h|0);if(z){z=0;y=63;break L1}P=c[h>>2]|0}else{if((L|0)==0){Q=0}else{c[K>>2]=C;Q=c[G>>2]|0}c[G>>2]=Q+4;P=C}z=0;as(c[c[H>>2]>>2]|0,D|0,P|0);if(z){z=0;y=63;break L1}A8(p);i=f;return x|0}D=c[t>>2]|0;H=(z=0,au(246,44)|0);if(z){z=0;y=63;break L1}G=H;c[m>>2]=G;H=D+4|0;K=c[H>>2]|0;if((K|0)==(c[D+8>>2]|0)){z=0;as(378,D|0,m|0);if(z){z=0;y=63;break L1}R=c[m>>2]|0}else{if((K|0)==0){S=0}else{c[K>>2]=G;S=c[H>>2]|0}c[H>>2]=S+4;R=G}G=R;K=R;L=A+4|0;L69:do{if((a[L]&1)==0){T=r;c[T>>2]=c[L>>2];c[T+4>>2]=c[L+4>>2];c[T+8>>2]=c[L+8>>2];y=41}else{T=c[A+12>>2]|0;U=c[A+8>>2]|0;do{if(U>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(U>>>0<11>>>0){a[r]=U<<1;V=r+1|0}else{W=U+16&-16;X=(z=0,au(246,W|0)|0);if(z){z=0;break}c[r+8>>2]=X;c[r>>2]=W|1;c[r+4>>2]=U;V=X}La(V|0,T|0,U)|0;a[V+U|0]=0;y=41;break L69}}while(0);U=bS(-1,-1)|0;Y=U;Z=M}}while(0);do{if((y|0)==41){L=s;U=A+16|0;c[L>>2]=c[U>>2];c[L+4>>2]=c[U+4>>2];c[L+8>>2]=c[U+8>>2];U=(z=0,au(82,e|0)|0);do{if(!z){T=l;c[T>>2]=c[L>>2];c[T+4>>2]=c[L+4>>2];c[T+8>>2]=c[L+8>>2];z=0;aD(18,K|0,r|0,l|0,0,U|0,0);if(z){z=0;break}if((a[r]&1)!=0){K1(c[r+8>>2]|0)}T=(z=0,au(136,C|0)|0);if(z){z=0;y=63;break L1}c[T+40>>2]=e;T=A+32|0;X=T;c[k>>2]=C;W=A+40|0;_=c[W>>2]|0;$=_;aa=T+12|0;if(($|0)==(c[aa>>2]|0)){z=0;as(272,A+36|0,k|0);if(z){z=0;y=63;break L1}ab=c[k>>2]|0}else{if((_|0)==0){ac=0}else{c[$>>2]=C;ac=c[W>>2]|0}c[W>>2]=ac+4;ab=C}$=T;z=0;as(c[c[$>>2]>>2]|0,X|0,ab|0);if(z){z=0;y=63;break L1}T=(z=0,aM(52,d|0,c[t>>2]|0)|0);if(z){z=0;y=63;break L1}_=(z=0,au(136,T|0)|0);if(z){z=0;y=63;break L1}c[_+40>>2]=K;_=(z=0,au(136,E|0)|0);if(z){z=0;y=63;break L1}c[_+40>>2]=T;c[j>>2]=E;T=c[W>>2]|0;_=T;if((_|0)==(c[aa>>2]|0)){z=0;as(272,A+36|0,j|0);if(z){z=0;y=63;break L1}ad=c[j>>2]|0}else{if((T|0)==0){ae=0}else{c[_>>2]=E;ae=c[W>>2]|0}c[W>>2]=ae+4;ad=E}z=0;as(c[c[$>>2]>>2]|0,X|0,ad|0);if(z){z=0;y=63;break L1}A8(p);i=f;return x|0}else{z=0}}while(0);U=bS(-1,-1)|0;L=U;U=M;if((a[r]&1)==0){Y=L;Z=U;break}K1(c[r+8>>2]|0);Y=L;Z=U}}while(0);E=c[D>>2]|0;K=c[H>>2]|0;L115:do{if((E|0)==(K|0)){af=E}else{C=E;while(1){U=C+4|0;if((c[C>>2]|0)==(R|0)){af=C;break L115}if((U|0)==(K|0)){af=K;break}else{C=U}}}}while(0);D=af-E>>2;C=E+(D+1<<2)|0;U=K-C|0;Lb(E+(D<<2)|0,C|0,U|0)|0;C=E+((U>>2)+D<<2)|0;D=c[H>>2]|0;if((C|0)!=(D|0)){c[H>>2]=D+(~((D-4+(-C|0)|0)>>>2)<<2)}K1(G);ag=Y;ah=Z;break L1}}while(0);x=c[b>>2]|0;C=c[w>>2]|0;L124:do{if((x|0)==(C|0)){ai=x}else{D=x;while(1){U=D+4|0;if((c[D>>2]|0)==(A|0)){ai=D;break L124}if((U|0)==(C|0)){ai=C;break}else{D=U}}}}while(0);D=ai-x>>2;G=x+(D+1<<2)|0;H=C-G|0;Lb(x+(D<<2)|0,G|0,H|0)|0;G=x+((H>>2)+D<<2)|0;D=c[w>>2]|0;if((G|0)!=(D|0)){c[w>>2]=D+(~((D-4+(-G|0)|0)>>>2)<<2)}K1(v);ag=I;ah=J}else{z=0;y=63}}while(0);if((y|0)==63){y=bS(-1,-1)|0;ag=y;ah=M}z=0;ar(444,p|0);if(!z){bg(ag|0)}else{z=0;ag=bS(-1,-1,0)|0;dk(ag);return 0}return 0}function oh(a,b){a=a|0;b=b|0;var d=0;d=c[b+28>>2]|0;cA[c[(c[d>>2]|0)+8>>2]&1023](d,a|0);return}function oi(a,b){a=a|0;b=b|0;var d=0;d=c[b+28>>2]|0;if((d|0)==0){return}cA[c[(c[d>>2]|0)+8>>2]&1023](d,a|0);return}function oj(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,at=0,av=0,aw=0,ax=0,ay=0,aA=0,aB=0,aC=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aN=0,aO=0,aP=0,aQ=0,aS=0,aT=0,aU=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bh=0,bi=0,bj=0,bk=0,bl=0,bm=0,bn=0,bo=0,bp=0,bq=0,br=0,bs=0,bt=0,bu=0;f=i;i=i+216|0;g=f|0;h=f+8|0;j=f+16|0;k=f+32|0;l=f+40|0;m=f+56|0;n=f+64|0;o=f+80|0;p=f+88|0;q=f+96|0;r=f+104|0;s=f+112|0;t=f+120|0;u=f+136|0;v=f+152|0;w=f+168|0;x=f+184|0;y=f+200|0;A6(s,0);A=b+4|0;B=c[A>>2]|0;C=(z=0,au(246,48)|0);L1:do{if(!z){D=C;c[o>>2]=D;E=B+4|0;F=c[E>>2]|0;if((F|0)==(c[B+8>>2]|0)){z=0;as(378,B|0,o|0);if(z){z=0;G=40;break}H=c[o>>2]|0}else{if((F|0)==0){I=0}else{c[F>>2]=D;I=c[E>>2]|0}c[E>>2]=I+4;H=D}D=H;F=H;J=d+4|0;L11:do{if((a[J]&1)==0){K=t;c[K>>2]=c[J>>2];c[K+4>>2]=c[J+4>>2];c[K+8>>2]=c[J+8>>2];G=18}else{K=c[d+12>>2]|0;L=c[d+8>>2]|0;do{if(L>>>0>4294967279>>>0){z=0;ar(88,0);if(z){z=0;break}return 0}else{if(L>>>0<11>>>0){a[t]=L<<1;N=t+1|0}else{O=L+16&-16;P=(z=0,au(246,O|0)|0);if(z){z=0;break}c[t+8>>2]=P;c[t>>2]=O|1;c[t+4>>2]=L;N=P}La(N|0,K|0,L)|0;a[N+L|0]=0;G=18;break L11}}while(0);L=bS(-1,-1)|0;Q=L;R=M}}while(0);do{if((G|0)==18){L=d+16|0;K=n;c[K>>2]=c[L>>2];c[K+4>>2]=c[L+4>>2];c[K+8>>2]=c[L+8>>2];z=0;aV(58,F|0,t|0,n|0,0);if(z){z=0;K=bS(-1,-1)|0;P=K;K=M;if((a[t]&1)==0){Q=P;R=K;break}K1(c[t+8>>2]|0);Q=P;R=K;break}if((a[t]&1)!=0){K1(c[t+8>>2]|0)}K=c[b+12>>2]|0;z=0;as(108,v|0,d|0);if(z){z=0;G=40;break L1}z=0;aR(164,u|0,K|0,v|0);if(z){z=0;K=bS(-1,-1)|0;P=K;K=M;O=v|0;S=c[O>>2]|0;if((S|0)==0){T=P;U=K;break L1}V=v+4|0;W=c[V>>2]|0;if((S|0)==(W|0)){X=S}else{Y=W;while(1){W=Y-12|0;c[V>>2]=W;if((a[W]&1)==0){Z=W}else{K1(c[Y-12+8>>2]|0);Z=c[V>>2]|0}if((S|0)==(Z|0)){break}else{Y=Z}}X=c[O>>2]|0}K1(X);T=P;U=K;break L1}Y=v|0;S=c[Y>>2]|0;if((S|0)!=0){V=v+4|0;W=c[V>>2]|0;if((S|0)==(W|0)){_=S}else{$=W;while(1){W=$-12|0;c[V>>2]=W;if((a[W]&1)==0){aa=W}else{K1(c[$-12+8>>2]|0);aa=c[V>>2]|0}if((S|0)==(aa|0)){break}else{$=aa}}_=c[Y>>2]|0}K1(_)}$=u+4|0;S=u|0;V=c[S>>2]|0;K=(c[$>>2]|0)-V>>3;L57:do{if((K|0)==0){ab=V}else{P=e+4|0;O=w;W=w+8|0;ac=d+12|0;ad=d+8|0;ae=w+1|0;af=w|0;ag=w+4|0;ah=x;ai=H+32|0;aj=ai;ak=H+40|0;al=ai+12|0;am=H+36|0;an=ai;ai=y|0;ao=y|0;ap=y+4|0;aq=ap|0;at=y+8|0;av=ap;ap=e|0;aw=e+4|0;ax=aw;ay=y+4|0;aA=q|0;aB=x+8|0;aC=x+1|0;aE=x|0;aF=x+4|0;aG=0;aH=V;L59:while(1){aI=c[aH+(aG<<3)+4>>2]|0;aJ=c[P>>2]|0;L61:do{if((aJ|0)==0){aK=aI;G=61}else{aL=aJ;do{aN=aL+16|0;aO=(z=0,aM(80,aI|0,aN|0)|0);if(z){z=0;G=57;break L59}if(aO){aP=aL|0}else{aO=(z=0,aM(80,aN|0,aI|0)|0);if(z){z=0;G=57;break L59}if(!aO){break L61}aP=aL+4|0}aL=c[aP>>2]|0;}while((aL|0)!=0);aK=c[(c[S>>2]|0)+(aG<<3)+4>>2]|0;G=61}}while(0);do{if((G|0)==61){G=0;aI=(z=0,az(12,d|0,aK|0,c[A>>2]|0)|0);if(z){z=0;G=58;break L59}aJ=(z=0,au(82,c[(c[S>>2]|0)+(aG<<3)>>2]|0)|0);if(z){z=0;G=58;break L59}do{if((aJ|0)==0){aQ=c[A>>2]|0;aL=(z=0,au(246,60)|0);if(z){z=0;G=58;break L59}aO=aL;c[m>>2]=aO;aS=aQ+4|0;aL=c[aS>>2]|0;if((aL|0)==(c[aQ+8>>2]|0)){z=0;as(378,aQ|0,m|0);if(z){z=0;G=58;break L59}aT=c[m>>2]|0}else{if((aL|0)==0){aU=0}else{c[aL>>2]=aO;aU=c[aS>>2]|0}c[aS>>2]=aU+4;aT=aO}aW=aT;aO=aT;if((a[J]&1)==0){c[O>>2]=c[J>>2];c[O+4>>2]=c[J+4>>2];c[O+8>>2]=c[J+8>>2]}else{aL=c[ac>>2]|0;aN=c[ad>>2]|0;if(aN>>>0>4294967279>>>0){G=74;break L59}if(aN>>>0<11>>>0){a[O]=aN<<1;aX=ae}else{aY=aN+16&-16;aZ=(z=0,au(246,aY|0)|0);if(z){z=0;G=84;break L59}c[W>>2]=aZ;c[af>>2]=aY|1;c[ag>>2]=aN;aX=aZ}La(aX|0,aL|0,aN)|0;a[aX+aN|0]=0}aN=l;c[aN>>2]=c[L>>2];c[aN+4>>2]=c[L+4>>2];c[aN+8>>2]=c[L+8>>2];z=0;aV(42,aO|0,w|0,l|0,0);if(z){z=0;G=87;break L59}if((a[O]&1)==0){a_=aO;break}K1(c[W>>2]|0);a_=aO}else{a_=aJ}}while(0);do{if((c[a_+40>>2]|0)==(c[a_+36>>2]|0)){a$=aI}else{if((c[aI+40>>2]|0)==(c[aI+36>>2]|0)){a$=a_;break}aJ=(z=0,az(50,a_|0,aI|0,c[A>>2]|0)|0);if(!z){a$=aJ}else{z=0;G=58;break L59}}}while(0);if((a$|0)==0){break}if((c[a$+40>>2]|0)==(c[a$+36>>2]|0)){break}aI=(z=0,aM(634,c[(c[S>>2]|0)+(aG<<3)>>2]|0,c[A>>2]|0)|0);if(z){z=0;G=58;break L59}a0=c[A>>2]|0;aJ=(z=0,au(246,44)|0);if(z){z=0;G=58;break L59}aO=aJ;c[k>>2]=aO;a1=a0+4|0;aJ=c[a1>>2]|0;if((aJ|0)==(c[a0+8>>2]|0)){z=0;as(378,a0|0,k|0);if(z){z=0;G=58;break L59}a2=c[k>>2]|0}else{if((aJ|0)==0){a3=0}else{c[aJ>>2]=aO;a3=c[a1>>2]|0}c[a1>>2]=a3+4;a2=aO}a4=a2;aO=a2;if((a[J]&1)==0){c[ah>>2]=c[J>>2];c[ah+4>>2]=c[J+4>>2];c[ah+8>>2]=c[J+8>>2]}else{aJ=c[ac>>2]|0;aN=c[ad>>2]|0;if(aN>>>0>4294967279>>>0){G=111;break L59}if(aN>>>0<11>>>0){a[ah]=aN<<1;a5=aC}else{aL=aN+16&-16;aZ=(z=0,au(246,aL|0)|0);if(z){z=0;G=152;break L59}c[aB>>2]=aZ;c[aE>>2]=aL|1;c[aF>>2]=aN;a5=aZ}La(a5|0,aJ|0,aN)|0;a[a5+aN|0]=0}aN=j;c[aN>>2]=c[L>>2];c[aN+4>>2]=c[L+4>>2];c[aN+8>>2]=c[L+8>>2];z=0;aD(18,aO|0,x|0,j|0,0,a$|0,0);if(z){z=0;G=155;break L59}if((a[ah]&1)!=0){K1(c[aB>>2]|0)}aN=(z=0,au(48,aI|0)|0);if(z){z=0;G=58;break L59}z=0;aR(470,aI|0,aO|0,aN|0);if(z){z=0;G=58;break L59}c[h>>2]=aI;aN=c[ak>>2]|0;aO=aN;if((aO|0)==(c[al>>2]|0)){z=0;as(272,am|0,h|0);if(z){z=0;G=58;break L59}a6=c[h>>2]|0}else{if((aN|0)==0){a7=0}else{c[aO>>2]=aI;a7=c[ak>>2]|0}c[ak>>2]=a7+4;a6=aI}z=0;as(c[c[an>>2]>>2]|0,aj|0,a6|0);if(z){z=0;G=58;break L59}c[aq>>2]=0;c[at>>2]=0;c[ao>>2]=av;aO=c[ap>>2]|0;if((aO|0)!=(ax|0)){aN=aO;while(1){c[aA>>2]=av;z=0;aV(40,r|0,ai|0,q|0,aN+16|0);if(z){z=0;G=137;break L59}aO=c[aN+4>>2]|0;if((aO|0)==0){aJ=aN|0;while(1){aZ=c[aJ+8>>2]|0;if((aJ|0)==(c[aZ>>2]|0)){a8=aZ;break}else{aJ=aZ}}}else{aJ=aO;while(1){aZ=c[aJ>>2]|0;if((aZ|0)==0){a8=aJ;break}else{aJ=aZ}}}if((a8|0)==(aw|0)){break}else{aN=a8}}}z=0;aR(22,p|0,ai|0,c[(c[S>>2]|0)+(aG<<3)+4>>2]|0);if(z){z=0;G=164;break L59}aN=(z=0,az(2,b|0,aI|0,y|0)|0);if(z){z=0;G=164;break L59}aJ=(aN|0)==0?0:aN+32|0;aN=aJ+4|0;aO=c[aN>>2]|0;aZ=(c[aJ+8>>2]|0)-aO>>2;L155:do{if((aZ|0)!=0){aJ=0;aL=aO;while(1){aY=c[aL+(aJ<<2)>>2]|0;c[g>>2]=aY;a9=c[ak>>2]|0;ba=a9;if((ba|0)==(c[al>>2]|0)){z=0;as(272,am|0,g|0);if(z){z=0;G=163;break L59}bb=c[g>>2]|0}else{if((a9|0)==0){bc=0}else{c[ba>>2]=aY;bc=c[ak>>2]|0}c[ak>>2]=bc+4;bb=aY}z=0;as(c[c[an>>2]>>2]|0,aj|0,bb|0);if(z){z=0;G=163;break L59}aY=aJ+1|0;if(aY>>>0>=aZ>>>0){break L155}aJ=aY;aL=c[aN>>2]|0}}}while(0);o7(ai,c[ay>>2]|0)}}while(0);aN=aG+1|0;aZ=c[S>>2]|0;if(aN>>>0<K>>>0){aG=aN;aH=aZ}else{ab=aZ;break L57}}do{if((G|0)==84){aH=bS(-1,-1)|0;bd=M;be=aH;G=86}else if((G|0)==57){aH=bS(-1,-1)|0;bf=M;bh=aH;G=59}else if((G|0)==137){aH=bS(-1,-1)|0;aG=M;o7(ai,c[ay>>2]|0);bf=aG;bh=aH;G=59}else if((G|0)==58){aH=bS(-1,-1)|0;bf=M;bh=aH;G=59}else if((G|0)==152){aH=bS(-1,-1)|0;bi=M;bj=aH;G=154}else if((G|0)==155){aH=bS(-1,-1)|0;aG=aH;aH=M;if((a[ah]&1)==0){bk=aG;bl=aH;G=157;break}K1(c[aB>>2]|0);bk=aG;bl=aH;G=157}else if((G|0)==87){aH=bS(-1,-1)|0;aG=aH;aH=M;if((a[O]&1)==0){bm=aG;bn=aH;G=89;break}K1(c[W>>2]|0);bm=aG;bn=aH;G=89}else if((G|0)==74){z=0;ar(88,0);if(!z){return 0}else{z=0;aH=bS(-1,-1)|0;bd=M;be=aH;G=86;break}}else if((G|0)==163){aH=bS(-1,-1)|0;bo=M;bp=aH;G=165}else if((G|0)==164){aH=bS(-1,-1)|0;bo=M;bp=aH;G=165}else if((G|0)==111){z=0;ar(88,0);if(!z){return 0}else{z=0;aH=bS(-1,-1)|0;bi=M;bj=aH;G=154;break}}}while(0);if((G|0)==59){bq=bh;br=bf}else if((G|0)==154){bk=bj;bl=bi;G=157}else if((G|0)==86){bm=be;bn=bd;G=89}else if((G|0)==165){o7(ai,c[ay>>2]|0);bq=bp;br=bo}if((G|0)==157){W=c[a0>>2]|0;O=c[a1>>2]|0;L197:do{if((W|0)==(O|0)){bs=W}else{aB=W;while(1){ah=aB+4|0;if((c[aB>>2]|0)==(a2|0)){bs=aB;break L197}if((ah|0)==(O|0)){bs=O;break}else{aB=ah}}}}while(0);ay=bs-W>>2;ai=W+(ay+1<<2)|0;aB=O-ai|0;Lb(W+(ay<<2)|0,ai|0,aB|0)|0;ai=W+((aB>>2)+ay<<2)|0;ay=c[a1>>2]|0;if((ai|0)!=(ay|0)){c[a1>>2]=ay+(~((ay-4+(-ai|0)|0)>>>2)<<2)}K1(a4);bq=bk;br=bl}else if((G|0)==89){ai=c[aQ>>2]|0;ay=c[aS>>2]|0;L206:do{if((ai|0)==(ay|0)){bt=ai}else{aB=ai;while(1){ah=aB+4|0;if((c[aB>>2]|0)==(aT|0)){bt=aB;break L206}if((ah|0)==(ay|0)){bt=ay;break}else{aB=ah}}}}while(0);W=bt-ai>>2;O=ai+(W+1<<2)|0;aB=ay-O|0;Lb(ai+(W<<2)|0,O|0,aB|0)|0;O=ai+((aB>>2)+W<<2)|0;W=c[aS>>2]|0;if((O|0)!=(W|0)){c[aS>>2]=W+(~((W-4+(-O|0)|0)>>>2)<<2)}K1(aW);bq=bm;br=bn}O=c[S>>2]|0;if((O|0)==0){T=bq;U=br;break L1}W=c[$>>2]|0;if((O|0)!=(W|0)){c[$>>2]=W+(~((W-8+(-O|0)|0)>>>3)<<3)}K1(O);T=bq;U=br;break L1}}while(0);if((ab|0)==0){A8(s);i=f;return F|0}S=c[$>>2]|0;if((ab|0)!=(S|0)){c[$>>2]=S+(~((S-8+(-ab|0)|0)>>>3)<<3)}K1(ab);A8(s);i=f;return F|0}}while(0);F=c[B>>2]|0;J=c[E>>2]|0;L228:do{if((F|0)==(J|0)){bu=F}else{S=F;while(1){K=S+4|0;if((c[S>>2]|0)==(H|0)){bu=S;break L228}if((K|0)==(J|0)){bu=J;break}else{S=K}}}}while(0);S=bu-F>>2;$=F+(S+1<<2)|0;K=J-$|0;Lb(F+(S<<2)|0,$|0,K|0)|0;$=F+((K>>2)+S<<2)|0;S=c[E>>2]|0;if(($|0)!=(S|0)){c[E>>2]=S+(~((S-4+(-$|0)|0)>>>2)<<2)}K1(D);T=Q;U=R}else{z=0;G=40}}while(0);if((G|0)==40){G=bS(-1,-1)|0;T=G;U=M}z=0;ar(444,s|0);if(!z){bg(T|0)}else{z=0;T=bS(-1,-1,0)|0;dk(T);return 0}return 0}function ok(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0;f=i;i=i+16|0;g=f|0;pa(g,d,e);e=b|0;c[e>>2]=0;d=b+4|0;c[d>>2]=0;h=b+8|0;c[h>>2]=0;j=g+4|0;k=c[j>>2]|0;l=g|0;g=c[l>>2]|0;m=(k-g|0)/20|0;L1:do{if((k|0)==(g|0)){n=k}else{o=0;p=g;q=0;r=0;while(1){s=p+(o*20|0)|0;if((q|0)==(r|0)){z=0;as(460,b|0,s|0);if(z){z=0;break}}else{if((q|0)==0){t=0}else{c[q>>2]=c[s>>2];c[q+4>>2]=c[p+(o*20|0)+4>>2];t=c[d>>2]|0}c[d>>2]=t+8}s=o+1|0;u=c[l>>2]|0;if(s>>>0>=m>>>0){n=u;break L1}o=s;p=u;q=c[d>>2]|0;r=c[h>>2]|0}r=bS(-1,-1)|0;q=c[e>>2]|0;p=q;if((q|0)!=0){o=c[d>>2]|0;if((q|0)!=(o|0)){c[d>>2]=o+(~((o-8+(-p|0)|0)>>>3)<<3)}K1(q)}q=c[l>>2]|0;if((q|0)==0){bg(r|0)}p=c[j>>2]|0;if((q|0)==(p|0)){v=q}else{o=p;while(1){p=o-20|0;c[j>>2]=p;u=o-20+8|0;s=c[u>>2]|0;if((s|0)==0){w=p}else{p=o-20+12|0;x=c[p>>2]|0;if((s|0)==(x|0)){y=s}else{A=x;while(1){x=A-12|0;c[p>>2]=x;if((a[x]&1)==0){B=x}else{K1(c[A-12+8>>2]|0);B=c[p>>2]|0}if((s|0)==(B|0)){break}else{A=B}}y=c[u>>2]|0}K1(y);w=c[j>>2]|0}if((q|0)==(w|0)){break}else{o=w}}v=c[l>>2]|0}K1(v);bg(r|0)}}while(0);if((n|0)==0){i=f;return}v=c[j>>2]|0;if((n|0)==(v|0)){C=n}else{w=v;while(1){v=w-20|0;c[j>>2]=v;y=w-20+8|0;B=c[y>>2]|0;if((B|0)==0){D=v}else{v=w-20+12|0;d=c[v>>2]|0;if((B|0)==(d|0)){E=B}else{e=d;while(1){d=e-12|0;c[v>>2]=d;if((a[d]&1)==0){F=d}else{K1(c[e-12+8>>2]|0);F=c[v>>2]|0}if((B|0)==(F|0)){break}else{e=F}}E=c[y>>2]|0}K1(E);D=c[j>>2]|0}if((n|0)==(D|0)){break}else{w=D}}C=c[l>>2]|0}K1(C);i=f;return}function ol(a,b){a=a|0;b=b|0;return}function om(a){a=a|0;return}function on(a){a=a|0;K1(a);return}function oo(a,b){a=a|0;b=b|0;return}function op(a,b){a=a|0;b=b|0;return}function oq(a,b){a=a|0;b=b|0;return}function or(a,b){a=a|0;b=b|0;return}function os(a,b){a=a|0;b=b|0;return}function ot(a,b){a=a|0;b=b|0;return}function ou(a,b){a=a|0;b=b|0;return}function ov(a,b){a=a|0;b=b|0;return}function ow(a,b){a=a|0;b=b|0;return}function ox(a,b){a=a|0;b=b|0;return}function oy(a,b){a=a|0;b=b|0;return}function oz(a,b){a=a|0;b=b|0;return}function oA(a,b){a=a|0;b=b|0;return}function oB(a,b){a=a|0;b=b|0;return}function oC(a,b){a=a|0;b=b|0;return}function oD(a,b){a=a|0;b=b|0;return}function oE(a,b){a=a|0;b=b|0;return}function oF(a,b){a=a|0;b=b|0;return}function oG(a,b){a=a|0;b=b|0;return}function oH(a,b){a=a|0;b=b|0;return}function oI(a,b){a=a|0;b=b|0;return}function oJ(a,b){a=a|0;b=b|0;return}function oK(a,b){a=a|0;b=b|0;return}function oL(a,b){a=a|0;b=b|0;return}function oM(a,b){a=a|0;b=b|0;return}function oN(a,b){a=a|0;b=b|0;return}function oO(a,b){a=a|0;b=b|0;return}function oP(a,b){a=a|0;b=b|0;return}function oQ(a,b){a=a|0;b=b|0;return}function oR(a,b){a=a|0;b=b|0;return}function oS(a,b){a=a|0;b=b|0;return}function oT(a,b){a=a|0;b=b|0;return}function oU(a,b){a=a|0;b=b|0;return}function oV(a,b){a=a|0;b=b|0;return}function oW(a,b){a=a|0;b=b|0;return}function oX(a,b){a=a|0;b=b|0;return}function oY(a,b){a=a|0;b=b|0;return}function oZ(a,b){a=a|0;b=b|0;return}function o_(a,b){a=a|0;b=b|0;return}function o$(a,b){a=a|0;b=b|0;return}function o0(a,b){a=a|0;b=b|0;return}function o1(a,b){a=a|0;b=b|0;return}function o2(a,b){a=a|0;b=b|0;return}function o3(a,b){a=a|0;b=b|0;return}function o4(a,b){a=a|0;b=b|0;return}function o5(a,b){a=a|0;b=b|0;return}function o6(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;f=i;i=i+8|0;g=f|0;h=d+4|0;j=h|0;k=c[j>>2]|0;do{if((k|0)==0){c[g>>2]=h;l=j}else{m=k;while(1){n=m+16|0;if(dj(e,n)|0){o=m|0;p=c[o>>2]|0;if((p|0)==0){q=4;break}else{m=p;continue}}if(!(dj(n,e)|0)){q=8;break}r=m+4|0;n=c[r>>2]|0;if((n|0)==0){q=7;break}else{m=n}}if((q|0)==4){c[g>>2]=m;l=o;break}else if((q|0)==7){c[g>>2]=m;l=r;break}else if((q|0)==8){c[g>>2]=m;l=g;break}}}while(0);q=c[l>>2]|0;if((q|0)!=0){s=q;t=0;u=b|0;c[u>>2]=s;v=b+4|0;a[v]=t;i=f;return}q=K$(76)|0;z=0;as(324,q+16|0,e|0);if(!z){e=c[g>>2]|0;g=q;c[q>>2]=0;c[q+4>>2]=0;c[q+8>>2]=e;c[l>>2]=g;e=d|0;r=c[c[e>>2]>>2]|0;if((r|0)==0){w=g}else{c[e>>2]=r;w=c[l>>2]|0}e2(c[d+4>>2]|0,w);w=d+8|0;c[w>>2]=(c[w>>2]|0)+1;s=q;t=1;u=b|0;c[u>>2]=s;v=b+4|0;a[v]=t;i=f;return}else{z=0;f=bS(-1,-1)|0;if((q|0)==0){bg(f|0)}K1(q);bg(f|0)}}function o7(a,b){a=a|0;b=b|0;if((b|0)==0){return}o7(a,c[b>>2]|0);o7(a,c[b+4>>2]|0);a=b+16|0;z=0;ar(c[c[a>>2]>>2]|0,a|0);if(z){z=0;a=bS(-1,-1)|0;bG(a|0)}K1(b);return}function o8(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+16|0;g=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[g>>2];g=f|0;h=f+8|0;c[h>>2]=c[d>>2];d=o9(b,h,g,e)|0;h=c[d>>2]|0;if((h|0)!=0){j=h;k=a|0;c[k>>2]=j;i=f;return}h=K$(76)|0;z=0;as(324,h+16|0,e|0);if(!z){e=c[g>>2]|0;g=h;c[h>>2]=0;c[h+4>>2]=0;c[h+8>>2]=e;c[d>>2]=g;e=b|0;l=c[c[e>>2]>>2]|0;if((l|0)==0){m=g}else{c[e>>2]=l;m=c[d>>2]|0}e2(c[b+4>>2]|0,m);m=b+8|0;c[m>>2]=(c[m>>2]|0)+1;j=h;k=a|0;c[k>>2]=j;i=f;return}else{z=0;f=bS(-1,-1)|0;if((h|0)==0){bg(f|0)}K1(h);bg(f|0)}}function o9(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;f=i;g=b;b=i;i=i+4|0;i=i+7&-8;c[b>>2]=c[g>>2];g=a+4|0;h=c[b>>2]|0;do{if((h|0)!=(g|0)){b=h+16|0;if(dj(e,b)|0){break}if(!(dj(b,e)|0)){c[d>>2]=h;j=d;i=f;return j|0}b=h+4|0;k=c[b>>2]|0;if((k|0)==0){l=h|0;while(1){m=c[l+8>>2]|0;if((l|0)==(c[m>>2]|0)){n=m;break}else{l=m}}}else{l=k;while(1){m=c[l>>2]|0;if((m|0)==0){n=l;break}else{l=m}}}l=g;do{if((n|0)==(l|0)){o=k}else{if(dj(e,n+16|0)|0){o=c[b>>2]|0;break}m=g|0;p=c[m>>2]|0;if((p|0)==0){c[d>>2]=l;j=m;i=f;return j|0}else{q=p}while(1){p=q+16|0;if(dj(e,p)|0){r=q|0;m=c[r>>2]|0;if((m|0)==0){s=35;break}else{q=m;continue}}if(!(dj(p,e)|0)){s=39;break}t=q+4|0;p=c[t>>2]|0;if((p|0)==0){s=38;break}else{q=p}}if((s|0)==35){c[d>>2]=q;j=r;i=f;return j|0}else if((s|0)==38){c[d>>2]=q;j=t;i=f;return j|0}else if((s|0)==39){c[d>>2]=q;j=d;i=f;return j|0}}}while(0);if((o|0)==0){c[d>>2]=h;j=b;i=f;return j|0}else{c[d>>2]=n;j=n|0;i=f;return j|0}}}while(0);n=h|0;do{if((h|0)==(c[a>>2]|0)){u=h}else{o=c[n>>2]|0;if((o|0)==0){q=h|0;while(1){t=c[q+8>>2]|0;if((q|0)==(c[t>>2]|0)){q=t}else{v=t;break}}}else{q=o;while(1){b=c[q+4>>2]|0;if((b|0)==0){v=q;break}else{q=b}}}if(dj(v+16|0,e)|0){u=v;break}q=g|0;o=c[q>>2]|0;if((o|0)==0){c[d>>2]=g;j=q;i=f;return j|0}else{w=o}while(1){o=w+16|0;if(dj(e,o)|0){x=w|0;q=c[x>>2]|0;if((q|0)==0){s=15;break}else{w=q;continue}}if(!(dj(o,e)|0)){s=19;break}y=w+4|0;o=c[y>>2]|0;if((o|0)==0){s=18;break}else{w=o}}if((s|0)==15){c[d>>2]=w;j=x;i=f;return j|0}else if((s|0)==18){c[d>>2]=w;j=y;i=f;return j|0}else if((s|0)==19){c[d>>2]=w;j=d;i=f;return j|0}}}while(0);if((c[n>>2]|0)==0){c[d>>2]=h;j=n;i=f;return j|0}else{c[d>>2]=u;j=u+4|0;i=f;return j|0}return 0}function pa(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,at=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aN=0,aO=0,aP=0,aQ=0,aS=0,aT=0,aU=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0;f=i;i=i+200|0;g=f|0;h=f+8|0;j=f+16|0;k=f+24|0;l=f+32|0;m=f+40|0;n=f+48|0;o=f+56|0;p=f+72|0;q=f+88|0;r=f+104|0;s=f+120|0;t=f+136|0;u=f+152|0;v=f+160|0;w=f+184|0;gJ(p,e);x=p|0;y=c[x>>2]|0;A=p+4|0;p=c[A>>2]|0;z=0;aR(404,y|0,p|0,f+64|0);do{if(!z){B=q|0;c[B>>2]=0;C=q+4|0;c[C>>2]=0;D=q+8|0;c[D>>2]=0;E=c[e+4>>2]|0;F=e|0;G=c[F>>2]|0;H=(E-G|0)/12|0;L3:do{if((E|0)==(G|0)){I=0;J=0;K=65}else{L=d+12|0;N=L|0;O=r|0;P=r|0;Q=r+4|0;R=r+8|0;S=l|0;T=m|0;U=n|0;V=o|0;W=s|0;X=s+4|0;Y=s+4|0;Z=t|0;_=t+4|0;$=s+8|0;aa=0;ab=G;L5:while(1){ac=ab+(aa*12|0)|0;if((pp(N,ac)|0)!=0){ad=(z=0,aM(376,L|0,ac|0)|0);if(z){z=0;K=6;break}c[P>>2]=0;c[Q>>2]=0;c[R>>2]=0;ac=ad+4|0;ae=c[ac>>2]|0;af=ad|0;ad=c[af>>2]|0;do{if((ae|0)!=(ad|0)){ag=ae-ad|0;ah=(ag|0)/28|0;if(ah>>>0>153391689>>>0){K=12;break L5}ai=(z=0,au(246,ag|0)|0);if(z){z=0;K=20;break L5}ag=ai;c[Q>>2]=ag;c[P>>2]=ag;c[R>>2]=ag+(ah*28|0);ah=c[af>>2]|0;aj=c[ac>>2]|0;if((ah|0)==(aj|0)){break}else{ak=ah;al=ag}do{if((al|0)==0){am=0}else{z=0;as(538,al|0,ak|0);if(!z){am=al}else{z=0;K=19;break L5}}al=am+28|0;c[Q>>2]=al;ak=ak+28|0;}while((ak|0)!=(aj|0));aj=(al-ai|0)/28|0;if((al|0)==(ag|0)){break}else{an=0}do{ah=c[ag+(an*28|0)+12>>2]|0;c[S>>2]=y;c[T>>2]=p;c[U>>2]=ah;c[V>>2]=ag+(an*28|0)+16;do{if(po(l,m,n,o,0)|0){ah=c[ag+(an*28|0)+24>>2]|0;z=0;as(294,t|0,ag+(an*28|0)|0);if(z){z=0;K=25;break L5}c[W>>2]=ah;z=0;as(294,X|0,t|0);if(z){z=0;K=47;break L5}ah=c[C>>2]|0;if((ah|0)==(c[D>>2]|0)){z=0;as(768,q|0,s|0);if(z){z=0;K=48;break L5}}else{if((ah|0)==0){ao=0}else{c[ah>>2]=c[W>>2];z=0;as(294,ah+4|0,X|0);if(z){z=0;K=48;break L5}ao=c[C>>2]|0}c[C>>2]=ao+16}ah=c[Y>>2]|0;if((ah|0)!=0){ap=c[$>>2]|0;if((ah|0)!=(ap|0)){aq=ap;while(1){ap=aq-12|0;c[$>>2]=ap;if((a[ap]&1)!=0){K1(c[aq-12+8>>2]|0)}if((ah|0)==(ap|0)){break}else{aq=ap}}}K1(ah)}aq=c[Z>>2]|0;if((aq|0)==0){break}ap=c[_>>2]|0;if((aq|0)!=(ap|0)){at=ap;while(1){ap=at-12|0;c[_>>2]=ap;if((a[ap]&1)!=0){K1(c[at-12+8>>2]|0)}if((aq|0)==(ap|0)){break}else{at=ap}}}K1(aq)}}while(0);an=an+1|0;}while(an>>>0<aj>>>0)}}while(0);pm(O)}ac=aa+1|0;if(ac>>>0>=H>>>0){K=64;break}aa=ac;ab=c[F>>2]|0}do{if((K|0)==64){I=c[B>>2]|0;J=c[C>>2]|0;K=65;break L3}else if((K|0)==6){ab=bS(-1,-1)|0;av=M;aw=ab;K=8;break L3}else if((K|0)==20){ab=bS(-1,-1)|0;ax=M;ay=ab;K=22}else if((K|0)==12){z=0;ar(154,0);if(z){z=0;ab=bS(-1,-1)|0;ax=M;ay=ab;K=22;break}}else if((K|0)==19){ab=bS(-1,-1)|0;ax=M;ay=ab;K=22}else if((K|0)==47){ab=bS(-1,-1)|0;az=ab;aA=M;K=54}else if((K|0)==48){ab=bS(-1,-1)|0;aa=ab;ab=M;X=c[Y>>2]|0;if((X|0)==0){az=aa;aA=ab;K=54;break}W=c[$>>2]|0;if((X|0)!=(W|0)){V=W;while(1){W=V-12|0;c[$>>2]=W;if((a[W]&1)!=0){K1(c[V-12+8>>2]|0)}if((X|0)==(W|0)){break}else{V=W}}}K1(X);az=aa;aA=ab;K=54}else if((K|0)==25){V=bS(-1,-1)|0;aB=V;aC=M}}while(0);if((K|0)==22){pm(O);av=ax;aw=ay;K=8;break}do{if((K|0)==54){$=c[Z>>2]|0;if(($|0)==0){aB=az;aC=aA;break}Y=c[_>>2]|0;if(($|0)!=(Y|0)){V=Y;while(1){Y=V-12|0;c[_>>2]=Y;if((a[Y]&1)!=0){K1(c[V-12+8>>2]|0)}if(($|0)==(Y|0)){break}else{V=Y}}}K1($);aB=az;aC=aA}}while(0);pm(O);aD=aB;aE=aC}}while(0);L89:do{if((K|0)==65){z=0;aR(456,I|0,J|0,k|0);do{if(!z){F=c[C>>2]|0;c[g>>2]=c[B>>2];c[h>>2]=F;z=0;aV(36,u|0,g|0,h|0,j|0);if(z){z=0;break}z=0;as(384,q|0,(c[u>>2]|0)-(c[B>>2]|0)>>4|0);if(z){z=0;break}F=b|0;c[F>>2]=0;H=b+4|0;c[H>>2]=0;D=b+8|0;c[D>>2]=0;G=c[B>>2]|0;E=(c[C>>2]|0)-G>>4;L95:do{if((E|0)==0){aF=G}else{_=d|0;Z=v|0;V=v+4|0;ab=v+8|0;aa=v+8|0;X=w|0;Y=w+4|0;W=v+12|0;U=0;T=G;while(1){S=c[T+(U<<4)>>2]|0;Q=c[_>>2]|0;R=c[Q+(S<<3)>>2]|0;P=c[Q+(S<<3)+4>>2]|0;z=0;as(294,w|0,T+(U<<4)+4|0);if(z){z=0;K=91;break}c[Z>>2]=R;c[V>>2]=P;z=0;as(294,ab|0,w|0);if(z){z=0;K=92;break}P=c[H>>2]|0;if((P|0)==(c[D>>2]|0)){z=0;as(478,b|0,v|0);if(z){z=0;K=93;break}}else{if((P|0)==0){aG=0}else{c[P>>2]=c[Z>>2];c[P+4>>2]=c[V>>2];z=0;as(294,P+8|0,ab|0);if(z){z=0;K=93;break}aG=c[H>>2]|0}c[H>>2]=aG+20}P=c[aa>>2]|0;if((P|0)!=0){R=c[W>>2]|0;if((P|0)!=(R|0)){S=R;while(1){R=S-12|0;c[W>>2]=R;if((a[R]&1)!=0){K1(c[S-12+8>>2]|0)}if((P|0)==(R|0)){break}else{S=R}}}K1(P)}S=c[X>>2]|0;if((S|0)!=0){R=c[Y>>2]|0;if((S|0)!=(R|0)){Q=R;while(1){R=Q-12|0;c[Y>>2]=R;if((a[R]&1)!=0){K1(c[Q-12+8>>2]|0)}if((S|0)==(R|0)){break}else{Q=R}}}K1(S)}Q=U+1|0;P=c[B>>2]|0;if(Q>>>0<E>>>0){U=Q;T=P}else{aF=P;break L95}}do{if((K|0)==93){T=bS(-1,-1)|0;U=T;T=M;ab=c[aa>>2]|0;if((ab|0)==0){aH=U;aI=T;K=99;break}V=c[W>>2]|0;if((ab|0)!=(V|0)){Z=V;while(1){V=Z-12|0;c[W>>2]=V;if((a[V]&1)!=0){K1(c[Z-12+8>>2]|0)}if((ab|0)==(V|0)){break}else{Z=V}}}K1(ab);aH=U;aI=T;K=99}else if((K|0)==91){Z=bS(-1,-1)|0;aJ=Z;aK=M}else if((K|0)==92){Z=bS(-1,-1)|0;aH=Z;aI=M;K=99}}while(0);do{if((K|0)==99){W=c[X>>2]|0;if((W|0)==0){aJ=aH;aK=aI;break}aa=c[Y>>2]|0;if((W|0)!=(aa|0)){Z=aa;while(1){aa=Z-12|0;c[Y>>2]=aa;if((a[aa]&1)!=0){K1(c[Z-12+8>>2]|0)}if((W|0)==(aa|0)){break}else{Z=aa}}}K1(W);aJ=aH;aK=aI}}while(0);Y=c[F>>2]|0;if((Y|0)==0){aD=aJ;aE=aK;break L89}X=c[H>>2]|0;if((Y|0)==(X|0)){aL=Y}else{Z=X;while(1){X=Z-20|0;c[H>>2]=X;T=Z-20+8|0;U=c[T>>2]|0;if((U|0)==0){aN=X}else{X=Z-20+12|0;ab=c[X>>2]|0;if((U|0)==(ab|0)){aO=U}else{aa=ab;while(1){ab=aa-12|0;c[X>>2]=ab;if((a[ab]&1)==0){aP=ab}else{K1(c[aa-12+8>>2]|0);aP=c[X>>2]|0}if((U|0)==(aP|0)){break}else{aa=aP}}aO=c[T>>2]|0}K1(aO);aN=c[H>>2]|0}if((Y|0)==(aN|0)){break}else{Z=aN}}aL=c[F>>2]|0}K1(aL);aD=aJ;aE=aK;break L89}}while(0);if((aF|0)!=0){F=c[C>>2]|0;if((aF|0)==(F|0)){aQ=aF}else{H=F;while(1){F=H-16|0;c[C>>2]=F;E=H-16+4|0;D=c[E>>2]|0;if((D|0)==0){aS=F}else{F=H-16+8|0;G=c[F>>2]|0;if((D|0)==(G|0)){aT=D}else{$=G;while(1){G=$-12|0;c[F>>2]=G;if((a[G]&1)==0){aU=G}else{K1(c[$-12+8>>2]|0);aU=c[F>>2]|0}if((D|0)==(aU|0)){break}else{$=aU}}aT=c[E>>2]|0}K1(aT);aS=c[C>>2]|0}if((aF|0)==(aS|0)){break}else{H=aS}}aQ=c[B>>2]|0}K1(aQ)}H=c[x>>2]|0;if((H|0)==0){i=f;return}$=c[A>>2]|0;if((H|0)!=($|0)){D=$;while(1){$=D-12|0;c[A>>2]=$;if((a[$]&1)!=0){K1(c[D-12+8>>2]|0)}if((H|0)==($|0)){break}else{D=$}}}K1(H);i=f;return}else{z=0}}while(0);O=bS(-1,-1)|0;av=M;aw=O;K=8}}while(0);if((K|0)==8){aD=aw;aE=av}O=c[B>>2]|0;if((O|0)==0){aW=aD;aX=aE;break}D=c[C>>2]|0;if((O|0)==(D|0)){aY=O}else{$=D;while(1){D=$-16|0;c[C>>2]=D;F=$-16+4|0;G=c[F>>2]|0;if((G|0)==0){aZ=D}else{D=$-16+8|0;Z=c[D>>2]|0;if((G|0)==(Z|0)){a_=G}else{Y=Z;while(1){Z=Y-12|0;c[D>>2]=Z;if((a[Z]&1)==0){a$=Z}else{K1(c[Y-12+8>>2]|0);a$=c[D>>2]|0}if((G|0)==(a$|0)){break}else{Y=a$}}a_=c[F>>2]|0}K1(a_);aZ=c[C>>2]|0}if((O|0)==(aZ|0)){break}else{$=aZ}}aY=c[B>>2]|0}K1(aY);aW=aD;aX=aE}else{z=0;$=bS(-1,-1)|0;aW=$;aX=M}}while(0);aE=c[x>>2]|0;if((aE|0)==0){a0=aW;a1=0;a2=a0;a3=aX;bg(a2|0)}x=c[A>>2]|0;if((aE|0)!=(x|0)){aD=x;while(1){x=aD-12|0;c[A>>2]=x;if((a[x]&1)!=0){K1(c[aD-12+8>>2]|0)}if((aE|0)==(x|0)){break}else{aD=x}}}K1(aE);a0=aW;a1=0;a2=a0;a3=aX;bg(a2|0)}function pb(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;e=b+4|0;f=c[e>>2]|0;g=c[b>>2]|0;h=f-g>>4;if(h>>>0<d>>>0){pd(b,d-h|0);return}if(h>>>0<=d>>>0){return}h=g+(d<<4)|0;if((h|0)==(f|0)){return}else{i=f}while(1){f=i-16|0;c[e>>2]=f;d=i-16+4|0;g=c[d>>2]|0;if((g|0)==0){j=f}else{f=i-16+8|0;b=c[f>>2]|0;if((g|0)==(b|0)){k=g}else{l=b;while(1){b=l-12|0;c[f>>2]=b;if((a[b]&1)==0){m=b}else{K1(c[l-12+8>>2]|0);m=c[f>>2]|0}if((g|0)==(m|0)){break}else{l=m}}k=c[d>>2]|0}K1(k);j=c[e>>2]|0}if((h|0)==(j|0)){break}else{i=j}}return}function pc(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0;e=b+4|0;f=c[e>>2]|0;g=b|0;h=c[g>>2]|0;i=h;j=(f-i|0)/20|0;k=j+1|0;if(k>>>0>214748364>>>0){Ip(0)}l=b+8|0;b=((c[l>>2]|0)-i|0)/20|0;if(b>>>0>107374181>>>0){m=214748364;n=5}else{i=b<<1;b=i>>>0<k>>>0?k:i;if((b|0)==0){o=0;p=0}else{m=b;n=5}}if((n|0)==5){o=K$(m*20|0)|0;p=m}m=o+(j*20|0)|0;b=o+(p*20|0)|0;do{if((m|0)==0){q=h;r=f;n=10}else{c[m>>2]=c[d>>2];c[o+(j*20|0)+4>>2]=c[d+4>>2];z=0;as(294,o+(j*20|0)+8|0,d+8|0);if(!z){q=c[g>>2]|0;r=c[e>>2]|0;n=10;break}else{z=0;p=bS(-1,-1)|0;s=M;t=p;break}}}while(0);L14:do{if((n|0)==10){d=o+(k*20|0)|0;L16:do{if((r|0)==(q|0)){c[g>>2]=m;c[e>>2]=d;c[l>>2]=b;u=r}else{j=r;f=m;while(1){h=j-20|0;c[f-20>>2]=c[h>>2];c[f-20+4>>2]=c[j-20+4>>2];z=0;as(294,f-20+8|0,j-20+8|0);if(z){z=0;break}v=f-20|0;if((h|0)==(q|0)){n=14;break}else{j=h;f=v}}if((n|0)==14){j=c[g>>2]|0;h=c[e>>2]|0;c[g>>2]=v;c[e>>2]=d;c[l>>2]=b;if((j|0)==(h|0)){u=j;break}else{w=h}while(1){h=w-20|0;p=w-20+8|0;i=c[p>>2]|0;if((i|0)!=0){x=w-20+12|0;y=c[x>>2]|0;if((i|0)==(y|0)){A=i}else{B=y;while(1){y=B-12|0;c[x>>2]=y;if((a[y]&1)==0){C=y}else{K1(c[B-12+8>>2]|0);C=c[x>>2]|0}if((i|0)==(C|0)){break}else{B=C}}A=c[p>>2]|0}K1(A)}if((j|0)==(h|0)){u=j;break L16}else{w=h}}}j=bS(-1,-1)|0;B=M;if((f|0)!=(d|0)){i=d;while(1){x=i-20|0;y=i-20+8|0;D=c[y>>2]|0;if((D|0)!=0){E=i-20+12|0;F=c[E>>2]|0;if((D|0)==(F|0)){G=D}else{H=F;while(1){F=H-12|0;c[E>>2]=F;if((a[F]&1)==0){I=F}else{K1(c[H-12+8>>2]|0);I=c[E>>2]|0}if((D|0)==(I|0)){break}else{H=I}}G=c[y>>2]|0}K1(G)}if((f|0)==(x|0)){break}else{i=x}}}if((o|0)==0){J=B;K=j}else{s=B;t=j;break L14}bg(K|0)}}while(0);if((u|0)==0){return}K1(u);return}}while(0);K1(o);J=s;K=t;bg(K|0)}function pd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0;e=b+8|0;f=b+4|0;g=c[f>>2]|0;h=c[e>>2]|0;i=g;if(h-i>>4>>>0>=d>>>0){j=d;k=g;do{if((k|0)==0){l=0}else{Ld(k|0,0,16)|0;l=c[f>>2]|0}k=l+16|0;c[f>>2]=k;j=j-1|0;}while((j|0)!=0);return}j=b|0;b=c[j>>2]|0;k=i-b>>4;i=k+d|0;if(i>>>0>268435455>>>0){Ip(0)}l=h-b|0;if(l>>4>>>0>134217726>>>0){m=268435455;n=9}else{b=l>>3;l=b>>>0<i>>>0?i:b;if((l|0)==0){o=0;p=0}else{m=l;n=9}}if((n|0)==9){o=K$(m<<4)|0;p=m}m=o+(k<<4)|0;k=d;d=m;do{if((d|0)==0){q=0}else{Ld(d|0,0,16)|0;q=d}d=q+16|0;k=k-1|0;}while((k|0)!=0);k=o+(p<<4)|0;p=c[j>>2]|0;q=c[f>>2]|0;L23:do{if((q|0)==(p|0)){c[j>>2]=m;c[f>>2]=d;c[e>>2]=k;r=p}else{l=q;b=m;while(1){i=l-16|0;c[b-16>>2]=c[i>>2];z=0;as(294,b-16+4|0,l-16+4|0);if(z){z=0;break}s=b-16|0;if((i|0)==(p|0)){n=18;break}else{l=i;b=s}}if((n|0)==18){l=c[j>>2]|0;i=c[f>>2]|0;c[j>>2]=s;c[f>>2]=d;c[e>>2]=k;if((l|0)==(i|0)){r=l;break}else{t=i}while(1){i=t-16|0;h=t-16+4|0;g=c[h>>2]|0;if((g|0)!=0){u=t-16+8|0;v=c[u>>2]|0;if((g|0)==(v|0)){w=g}else{x=v;while(1){v=x-12|0;c[u>>2]=v;if((a[v]&1)==0){y=v}else{K1(c[x-12+8>>2]|0);y=c[u>>2]|0}if((g|0)==(y|0)){break}else{x=y}}w=c[h>>2]|0}K1(w)}if((l|0)==(i|0)){r=l;break L23}else{t=i}}}l=bS(-1,-1)|0;if((b|0)!=(d|0)){x=d;while(1){g=x-16|0;u=x-16+4|0;v=c[u>>2]|0;if((v|0)!=0){A=x-16+8|0;B=c[A>>2]|0;if((v|0)==(B|0)){C=v}else{D=B;while(1){B=D-12|0;c[A>>2]=B;if((a[B]&1)==0){E=B}else{K1(c[D-12+8>>2]|0);E=c[A>>2]|0}if((v|0)==(E|0)){break}else{D=E}}C=c[u>>2]|0}K1(C)}if((b|0)==(g|0)){break}else{x=g}}}if((o|0)==0){bg(l|0)}K1(o);bg(l|0)}}while(0);if((r|0)==0){return}K1(r);return}function pe(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;g=i;h=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[h>>2];h=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[h>>2];h=f;f=i;i=i+1|0;i=i+7&-8;a[f]=a[h]|0;h=d|0;d=c[h>>2]|0;f=e|0;e=c[f>>2]|0;L1:do{if((d|0)==(e|0)){j=d}else{k=d+16|0;if((k|0)!=(e|0)){l=d;m=k;k=c[d>>2]|0;while(1){n=c[m>>2]|0;L7:do{if((k|0)==(n|0)){o=c[l+8>>2]|0;p=c[l+4>>2]|0;q=c[l+20>>2]|0;if((o-p|0)!=((c[l+24>>2]|0)-q|0)){break}if((p|0)==(o|0)){j=l;break L1}else{r=q;s=p}while(1){p=a[s]|0;q=p&255;if((q&1|0)==0){t=q>>>1}else{t=c[s+4>>2]|0}q=a[r]|0;u=q&255;if((u&1|0)==0){v=u>>>1}else{v=c[r+4>>2]|0}if((t|0)!=(v|0)){break L7}u=(p&1)==0;if(u){w=s+1|0}else{w=c[s+8>>2]|0}if((q&1)==0){x=r+1|0}else{x=c[r+8>>2]|0}do{if(u){if((t|0)==0){break}else{y=x;z=w;A=t}while(1){if((a[z]|0)!=(a[y]|0)){break L7}q=A-1|0;if((q|0)==0){break}else{y=y+1|0;z=z+1|0;A=q}}}else{if((Lc(w|0,x|0,t|0)|0)!=0){break L7}}}while(0);u=s+12|0;if((u|0)==(o|0)){j=l;break L1}else{r=r+12|0;s=u}}}}while(0);o=m+16|0;if((o|0)==(e|0)){break}else{l=m;m=o;k=n}}}c[h>>2]=e;B=e;C=b|0;c[C>>2]=B;i=g;return}}while(0);c[h>>2]=j;if((j|0)==(e|0)){B=e;C=b|0;c[C>>2]=B;i=g;return}s=j+32|0;if((s|0)==(e|0)){D=j}else{e=j+16|0;r=s;s=j;while(1){j=r|0;L47:do{if((c[s>>2]|0)==(c[j>>2]|0)){t=c[s+8>>2]|0;x=c[s+4>>2]|0;w=c[e+20>>2]|0;if((t-x|0)!=((c[e+24>>2]|0)-w|0)){E=53;break}if((x|0)==(t|0)){break}else{F=x;G=w}while(1){w=a[F]|0;x=w&255;if((x&1|0)==0){H=x>>>1}else{H=c[F+4>>2]|0}x=a[G]|0;A=x&255;if((A&1|0)==0){I=A>>>1}else{I=c[G+4>>2]|0}if((H|0)!=(I|0)){E=53;break L47}A=(w&1)==0;if(A){J=F+1|0}else{J=c[F+8>>2]|0}if((x&1)==0){K=G+1|0}else{K=c[G+8>>2]|0}do{if(A){if((H|0)==0){break}else{L=K;M=J;N=H}while(1){if((a[M]|0)!=(a[L]|0)){E=53;break L47}x=N-1|0;if((x|0)==0){break}else{L=L+1|0;M=M+1|0;N=x}}}else{if((Lc(J|0,K|0,H|0)|0)!=0){E=53;break L47}}}while(0);A=F+12|0;if((A|0)==(t|0)){break}else{F=A;G=G+12|0}}}else{E=53}}while(0);do{if((E|0)==53){E=0;t=s+16|0;c[h>>2]=t;c[t>>2]=c[j>>2];if((s|0)==(e|0)){break}jO(s+20|0,c[e+20>>2]|0,c[e+24>>2]|0)}}while(0);j=r+16|0;t=c[h>>2]|0;if((j|0)==(c[f>>2]|0)){D=t;break}else{e=r;r=j;s=t}}}s=D+16|0;c[h>>2]=s;B=s;C=b|0;c[C>>2]=B;i=g;return}function pf(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bg=0,bh=0,bi=0,bj=0,bk=0,bl=0,bm=0,bn=0,bo=0,bp=0,bq=0,br=0,bs=0,bt=0,bu=0,bv=0,bw=0,bx=0,by=0,bz=0,bA=0,bB=0,bC=0,bD=0,bE=0,bF=0,bG=0,bH=0,bI=0,bJ=0,bK=0,bL=0,bM=0,bN=0,bO=0;e=i;i=i+320|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=e+32|0;l=e+40|0;m=e+48|0;n=e+56|0;o=e+64|0;p=e+72|0;q=e+80|0;r=e+88|0;s=e+96|0;t=e+104|0;u=e+112|0;v=e+120|0;w=e+128|0;x=e+136|0;y=e+144|0;z=e+152|0;A=e+160|0;B=e+168|0;C=e+176|0;D=e+184|0;E=e+192|0;F=e+200|0;G=e+208|0;H=e+216|0;I=e+224|0;J=e+232|0;K=e+240|0;L=e+248|0;M=e+256|0;N=e+264|0;O=e+272|0;P=e+280|0;Q=e+288|0;R=e+296|0;S=e+304|0;T=e+312|0;U=f|0;V=g|0;W=h|0;X=j|0;Y=o|0;Z=p|0;_=q|0;$=r|0;aa=k|0;ab=l|0;ac=m|0;ad=n|0;ae=M|0;af=N|0;ag=O|0;ah=P|0;ai=w|0;aj=x|0;ak=y|0;al=z|0;am=A|0;an=B|0;ao=C|0;ap=D|0;aq=I|0;ar=J|0;as=K|0;at=L|0;au=E|0;av=F|0;aw=G|0;ax=H|0;ay=s|0;az=t|0;aA=u|0;aB=v|0;aC=a;a=b;L1:while(1){b=a;aD=a-16|0;aE=a-32|0;aF=aD|0;aG=a-16+4|0;aH=a-16+8|0;aI=a-16+12|0;aJ=aC;L3:while(1){aK=aJ;aL=b-aK|0;aM=aL>>4;switch(aM|0){case 2:{aN=4;break L1;break};case 3:{aN=10;break L1;break};case 4:{aN=11;break L1;break};case 0:case 1:{aN=95;break L1;break};case 5:{aN=12;break L1;break};default:{}}if((aL|0)<112){aN=14;break L1}aO=(aM|0)/2|0;aP=aJ+(aO<<4)|0;if((aL|0)>15984){aL=(aM|0)/4|0;aQ=pi(aJ,aJ+(aL<<4)|0,aP,aJ+(aL+aO<<4)|0,aD,0)|0}else{aQ=pg(aJ,aP,aD,0)|0}aL=aJ|0;aM=c[aL>>2]|0;aR=aP|0;aS=c[aR>>2]|0;L11:do{if(aM>>>0<aS>>>0){aT=aD;aU=aQ}else{if(aS>>>0>=aM>>>0){aV=c[aJ+8>>2]|0;aW=c[aJ+(aO<<4)+4>>2]|0;aX=c[aJ+(aO<<4)+8>>2]|0;c[ae>>2]=c[aJ+4>>2];c[af>>2]=aV;c[ag>>2]=aW;c[ah>>2]=aX;if(pl(M,N,O,P,0)|0){aT=aD;aU=aQ;break}}L16:do{if((aJ|0)!=(aE|0)){aX=aJ+(aO<<4)+4|0;aW=aJ+(aO<<4)+8|0;aV=aD;aY=aE;while(1){aZ=aY|0;a_=c[aZ>>2]|0;a$=c[aR>>2]|0;if(a_>>>0<a$>>>0){aN=50;break}if(a$>>>0>=a_>>>0){a0=aV-16+4|0;a1=aV-16+8|0;a$=c[a1>>2]|0;a2=c[aX>>2]|0;a3=c[aW>>2]|0;c[ay>>2]=c[a0>>2];c[az>>2]=a$;c[aA>>2]=a2;c[aB>>2]=a3;if(pl(s,t,u,v,0)|0){aN=54;break}}a3=aY-16|0;if((aJ|0)==(a3|0)){break L16}else{aV=aY;aY=a3}}if((aN|0)==54){aN=0;a4=c[aZ>>2]|0;a5=a0;a6=a1}else if((aN|0)==50){aN=0;a4=a_;a5=aV-16+4|0;a6=aV-16+8|0}aW=c[aL>>2]|0;c[aL>>2]=a4;c[aZ>>2]=aW;aW=aJ+4|0;aX=c[aW>>2]|0;c[aW>>2]=c[a5>>2];c[a5>>2]=aX;aX=aJ+8|0;aW=c[aX>>2]|0;c[aX>>2]=c[a6>>2];c[a6>>2]=aW;aW=aJ+12|0;aX=aV-16+12|0;a3=c[aW>>2]|0;c[aW>>2]=c[aX>>2];c[aX>>2]=a3;aT=aY;aU=aQ+1|0;break L11}}while(0);a3=aJ+16|0;aX=c[aL>>2]|0;aW=c[aF>>2]|0;do{if(aX>>>0<aW>>>0){a7=a3}else{if(aW>>>0>=aX>>>0){a2=c[aJ+8>>2]|0;a$=c[aG>>2]|0;a8=c[aH>>2]|0;c[aq>>2]=c[aJ+4>>2];c[ar>>2]=a2;c[as>>2]=a$;c[at>>2]=a8;if(pl(I,J,K,L,0)|0){a7=a3;break}}if((a3|0)==(aD|0)){aN=91;break L1}a8=aJ+4|0;a$=aJ+8|0;a2=a3;while(1){a9=c[aL>>2]|0;ba=a2|0;bb=c[ba>>2]|0;if(a9>>>0<bb>>>0){aN=29;break}if(bb>>>0>=a9>>>0){a9=c[a$>>2]|0;bc=a2+4|0;bd=c[bc>>2]|0;be=a2+8|0;bf=c[be>>2]|0;c[au>>2]=c[a8>>2];c[av>>2]=a9;c[aw>>2]=bd;c[ax>>2]=bf;if(pl(E,F,G,H,0)|0){aN=32;break}}bf=a2+16|0;if((bf|0)==(aD|0)){aN=93;break L1}else{a2=bf}}if((aN|0)==32){aN=0;bg=c[ba>>2]|0;bh=bc;bi=be}else if((aN|0)==29){aN=0;bg=bb;bh=a2+4|0;bi=a2+8|0}c[ba>>2]=c[aF>>2];c[aF>>2]=bg;a8=c[bh>>2]|0;c[bh>>2]=c[aG>>2];c[aG>>2]=a8;a8=c[bi>>2]|0;c[bi>>2]=c[aH>>2];c[aH>>2]=a8;a8=a2+12|0;a$=c[a8>>2]|0;c[a8>>2]=c[aI>>2];c[aI>>2]=a$;a7=a2+16|0}}while(0);if((a7|0)==(aD|0)){aN=96;break L1}a3=aJ+4|0;aX=aJ+8|0;aW=aD;a$=a7;while(1){a8=c[aL>>2]|0;aY=a$|0;aV=c[aY>>2]|0;L49:do{if(a8>>>0<aV>>>0){bj=a$;bk=aY}else{bf=a8;bd=aY;a9=aV;while(1){if(a9>>>0<bf>>>0){bl=bf}else{bm=c[aX>>2]|0;bn=c[bd+4>>2]|0;bo=c[bd+8>>2]|0;c[am>>2]=c[a3>>2];c[an>>2]=bm;c[ao>>2]=bn;c[ap>>2]=bo;if(pl(A,B,C,D,0)|0){bj=bd;bk=bd;break L49}bl=c[aL>>2]|0}bp=bd+16|0;bo=c[bp>>2]|0;if(bl>>>0<bo>>>0){break}else{bf=bl;bd=bp;a9=bo}}bj=bp;bk=bp}}while(0);aV=aW;while(1){bq=aV-16|0;aY=c[aL>>2]|0;br=bq|0;a8=c[br>>2]|0;if(aY>>>0<a8>>>0){aV=bq;continue}if(a8>>>0<aY>>>0){break}aY=c[aX>>2]|0;a8=c[aV-16+4>>2]|0;a2=c[aV-16+8>>2]|0;c[ai>>2]=c[a3>>2];c[aj>>2]=aY;c[ak>>2]=a8;c[al>>2]=a2;if(pl(w,x,y,z,0)|0){aV=bq}else{break}}if(bj>>>0>=bq>>>0){aJ=bj;continue L3}a2=c[bk>>2]|0;c[bk>>2]=c[br>>2];c[br>>2]=a2;a2=bj+4|0;a8=aV-16+4|0;aY=c[a2>>2]|0;c[a2>>2]=c[a8>>2];c[a8>>2]=aY;aY=bj+8|0;a8=aV-16+8|0;a2=c[aY>>2]|0;c[aY>>2]=c[a8>>2];c[a8>>2]=a2;a2=bj+12|0;a8=aV-16+12|0;aY=c[a2>>2]|0;c[a2>>2]=c[a8>>2];c[a8>>2]=aY;aW=bq;a$=bj+16|0}}}while(0);aL=aJ+16|0;L65:do{if(aL>>>0<aT>>>0){aR=aT;aO=aL;aM=aU;aS=aP;while(1){a$=aS|0;aW=aS+4|0;a3=aS+8|0;aX=aO;while(1){bs=aX|0;aY=c[bs>>2]|0;a8=c[a$>>2]|0;if(aY>>>0>=a8>>>0){if(a8>>>0<aY>>>0){bt=a8;break}a8=c[aX+8>>2]|0;aY=c[aW>>2]|0;a2=c[a3>>2]|0;c[Y>>2]=c[aX+4>>2];c[Z>>2]=a8;c[_>>2]=aY;c[$>>2]=a2;if(!(pl(o,p,q,r,0)|0)){aN=61;break}}aX=aX+16|0}if((aN|0)==61){aN=0;bt=c[a$>>2]|0}aV=aR-16|0;a2=aV|0;aY=c[a2>>2]|0;L77:do{if(aY>>>0<bt>>>0){bu=aR;bv=aV;bw=a2}else{a8=aR;a9=a2;bd=aY;bf=bt;while(1){bx=a9;if(bf>>>0<bd>>>0){by=bf}else{bo=c[a8-16+8>>2]|0;bn=c[aW>>2]|0;bm=c[a3>>2]|0;c[aa>>2]=c[a8-16+4>>2];c[ab>>2]=bo;c[ac>>2]=bn;c[ad>>2]=bm;if(pl(k,l,m,n,0)|0){bu=a8;bv=bx;bw=a9;break L77}by=c[a$>>2]|0}bz=a9-16|0;bm=c[bz>>2]|0;if(bm>>>0<by>>>0){break}else{a8=bx;a9=bz;bd=bm;bf=by}}bu=bx;bv=bz;bw=bz}}while(0);if(aX>>>0>bv>>>0){bA=aX;bB=aM;bC=aS;break L65}a$=c[bs>>2]|0;c[bs>>2]=c[bw>>2];c[bw>>2]=a$;a$=aX+4|0;a3=bu-16+4|0;aW=c[a$>>2]|0;c[a$>>2]=c[a3>>2];c[a3>>2]=aW;aW=aX+8|0;a3=bu-16+8|0;a$=c[aW>>2]|0;c[aW>>2]=c[a3>>2];c[a3>>2]=a$;a$=aX+12|0;a3=bu-16+12|0;aW=c[a$>>2]|0;c[a$>>2]=c[a3>>2];c[a3>>2]=aW;aR=bv;aO=aX+16|0;aM=aM+1|0;aS=(aS|0)==(aX|0)?bv:aS}}else{bA=aL;bB=aU;bC=aP}}while(0);do{if((bA|0)==(bC|0)){bD=bB}else{aP=bC|0;aL=c[aP>>2]|0;aS=bA|0;aM=c[aS>>2]|0;if(aL>>>0<aM>>>0){bE=aM;bF=aL;bG=bA+4|0;bH=bC+4|0;bI=bA+8|0;bJ=bC+8|0}else{if(aM>>>0<aL>>>0){bD=bB;break}aL=bC+4|0;aM=bC+8|0;aO=c[aM>>2]|0;aR=bA+4|0;aW=c[aR>>2]|0;a3=bA+8|0;a$=c[a3>>2]|0;c[U>>2]=c[aL>>2];c[V>>2]=aO;c[W>>2]=aW;c[X>>2]=a$;if(!(pl(f,g,h,j,0)|0)){bD=bB;break}bE=c[aS>>2]|0;bF=c[aP>>2]|0;bG=aR;bH=aL;bI=a3;bJ=aM}c[aS>>2]=bF;c[aP>>2]=bE;aP=c[bG>>2]|0;c[bG>>2]=c[bH>>2];c[bH>>2]=aP;aP=c[bI>>2]|0;c[bI>>2]=c[bJ>>2];c[bJ>>2]=aP;aP=bA+12|0;aS=bC+12|0;aM=c[aP>>2]|0;c[aP>>2]=c[aS>>2];c[aS>>2]=aM;bD=bB+1|0}}while(0);if((bD|0)==0){bK=pk(aJ,bA,0)|0;aM=bA+16|0;if(pk(aM,a,0)|0){aN=80;break}if(bK){aJ=aM;continue}}aM=bA;if((aM-aK|0)>=(b-aM|0)){aN=84;break}pf(aJ,bA,d);aJ=bA+16|0}if((aN|0)==84){aN=0;pf(bA+16|0,a,d);aC=aJ;a=bA;continue}else if((aN|0)==80){aN=0;if(bK){aN=97;break}else{aC=aJ;a=bA;continue}}}if((aN|0)==4){bA=a-16|0;aC=c[bA>>2]|0;bK=aJ|0;d=c[bK>>2]|0;do{if(aC>>>0<d>>>0){bL=d;bM=aC;bN=aJ+4|0;bO=aJ+8|0}else{if(d>>>0<aC>>>0){i=e;return}bD=c[aH>>2]|0;bB=aJ+4|0;bC=c[bB>>2]|0;bJ=aJ+8|0;bI=c[bJ>>2]|0;c[Q>>2]=c[aG>>2];c[R>>2]=bD;c[S>>2]=bC;c[T>>2]=bI;if(pl(Q,R,S,T,0)|0){bL=c[bK>>2]|0;bM=c[bA>>2]|0;bN=bB;bO=bJ;break}else{i=e;return}}}while(0);c[bK>>2]=bM;c[bA>>2]=bL;bL=c[bN>>2]|0;c[bN>>2]=c[aG>>2];c[aG>>2]=bL;bL=c[bO>>2]|0;c[bO>>2]=c[aH>>2];c[aH>>2]=bL;bL=aJ+12|0;aH=c[bL>>2]|0;c[bL>>2]=c[aI>>2];c[aI>>2]=aH;i=e;return}else if((aN|0)==14){pj(aJ,a,0);i=e;return}else if((aN|0)==10){pg(aJ,aJ+16|0,aD,0)|0;i=e;return}else if((aN|0)==11){ph(aJ,aJ+16|0,aJ+32|0,aD,0)|0;i=e;return}else if((aN|0)==91){i=e;return}else if((aN|0)==93){i=e;return}else if((aN|0)==95){i=e;return}else if((aN|0)==96){i=e;return}else if((aN|0)==97){i=e;return}else if((aN|0)==12){pi(aJ,aJ+16|0,aJ+32|0,aJ+48|0,aD,0)|0;i=e;return}}function pg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0;e=i;i=i+160|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=e+32|0;l=e+40|0;m=e+48|0;n=e+56|0;o=e+64|0;p=e+72|0;q=e+80|0;r=e+88|0;s=e+96|0;t=e+104|0;u=e+112|0;v=e+120|0;w=e+128|0;x=e+136|0;y=e+144|0;z=e+152|0;A=b|0;B=c[A>>2]|0;C=a|0;D=c[C>>2]|0;L1:do{if(B>>>0<D>>>0){E=d|0;F=c[E>>2]|0;if(F>>>0<B>>>0){G=E;H=D;I=F;J=21}else{K=B;L=F;M=E;J=19}}else{do{if(D>>>0<B>>>0){E=d|0;F=c[E>>2]|0;if(F>>>0>=B>>>0){N=B;O=F;P=E;J=8;break}Q=E;R=B;S=F;T=b+4|0;U=b+8|0}else{F=b+4|0;E=b+8|0;V=c[E>>2]|0;W=c[a+4>>2]|0;X=c[a+8>>2]|0;c[w>>2]=c[F>>2];c[x>>2]=V;c[y>>2]=W;c[z>>2]=X;X=pl(w,x,y,z,0)|0;W=d|0;V=c[W>>2]|0;Y=c[A>>2]|0;Z=V>>>0<Y>>>0;if(!X){if(Z){Q=W;R=Y;S=V;T=F;U=E;break}else{N=Y;O=V;P=W;J=8;break}}if(!Z){K=Y;L=V;M=W;J=19;break L1}G=W;H=c[C>>2]|0;I=V;J=21;break L1}}while(0);do{if((J|0)==8){if(N>>>0<O>>>0){_=0;i=e;return _|0}V=c[d+8>>2]|0;W=b+4|0;Y=c[W>>2]|0;Z=b+8|0;E=c[Z>>2]|0;c[s>>2]=c[d+4>>2];c[t>>2]=V;c[u>>2]=Y;c[v>>2]=E;if(pl(s,t,u,v,0)|0){Q=P;R=c[A>>2]|0;S=c[P>>2]|0;T=W;U=Z;break}else{_=0;i=e;return _|0}}}while(0);c[A>>2]=S;c[Q>>2]=R;Z=d+4|0;W=c[T>>2]|0;c[T>>2]=c[Z>>2];c[Z>>2]=W;W=d+8|0;Z=c[U>>2]|0;c[U>>2]=c[W>>2];c[W>>2]=Z;Z=b+12|0;W=d+12|0;E=c[Z>>2]|0;c[Z>>2]=c[W>>2];c[W>>2]=E;E=c[A>>2]|0;W=c[C>>2]|0;do{if(E>>>0<W>>>0){$=W;aa=E;ab=a+4|0;ac=a+8|0}else{if(W>>>0<E>>>0){_=1;i=e;return _|0}Y=c[U>>2]|0;V=a+4|0;F=c[V>>2]|0;X=a+8|0;ad=c[X>>2]|0;c[o>>2]=c[T>>2];c[p>>2]=Y;c[q>>2]=F;c[r>>2]=ad;if(pl(o,p,q,r,0)|0){$=c[C>>2]|0;aa=c[A>>2]|0;ab=V;ac=X;break}else{_=1;i=e;return _|0}}}while(0);c[C>>2]=aa;c[A>>2]=$;E=c[ab>>2]|0;c[ab>>2]=c[T>>2];c[T>>2]=E;E=c[ac>>2]|0;c[ac>>2]=c[U>>2];c[U>>2]=E;E=a+12|0;W=c[E>>2]|0;c[E>>2]=c[Z>>2];c[Z>>2]=W;_=2;i=e;return _|0}}while(0);L32:do{if((J|0)==19){do{if(K>>>0<L>>>0){ae=c[C>>2]|0;af=K;ag=b+4|0;ah=b+8|0}else{U=d+4|0;ac=d+8|0;T=c[ac>>2]|0;ab=b+4|0;$=c[ab>>2]|0;aa=b+8|0;r=c[aa>>2]|0;c[k>>2]=c[U>>2];c[l>>2]=T;c[m>>2]=$;c[n>>2]=r;r=pl(k,l,m,n,0)|0;$=c[C>>2]|0;if(r){ai=M;aj=$;ak=c[M>>2]|0;al=U;am=ac;break L32}else{ae=$;af=c[A>>2]|0;ag=ab;ah=aa;break}}}while(0);c[C>>2]=af;c[A>>2]=ae;Z=a+4|0;aa=c[Z>>2]|0;c[Z>>2]=c[ag>>2];c[ag>>2]=aa;aa=a+8|0;Z=c[aa>>2]|0;c[aa>>2]=c[ah>>2];c[ah>>2]=Z;Z=a+12|0;aa=b+12|0;ab=c[Z>>2]|0;c[Z>>2]=c[aa>>2];c[aa>>2]=ab;ab=c[M>>2]|0;Z=c[A>>2]|0;do{if(ab>>>0<Z>>>0){an=Z;ao=ab;ap=d+4|0;aq=d+8|0}else{if(Z>>>0<ab>>>0){_=1;i=e;return _|0}$=d+4|0;ac=d+8|0;U=c[ac>>2]|0;r=c[ag>>2]|0;T=c[ah>>2]|0;c[f>>2]=c[$>>2];c[g>>2]=U;c[h>>2]=r;c[j>>2]=T;if(pl(f,g,h,j,0)|0){an=c[A>>2]|0;ao=c[M>>2]|0;ap=$;aq=ac;break}else{_=1;i=e;return _|0}}}while(0);c[A>>2]=ao;c[M>>2]=an;ab=c[ag>>2]|0;c[ag>>2]=c[ap>>2];c[ap>>2]=ab;ab=c[ah>>2]|0;c[ah>>2]=c[aq>>2];c[aq>>2]=ab;ab=d+12|0;Z=c[aa>>2]|0;c[aa>>2]=c[ab>>2];c[ab>>2]=Z;_=2;i=e;return _|0}else if((J|0)==21){ai=G;aj=H;ak=I;al=d+4|0;am=d+8|0}}while(0);c[C>>2]=ak;c[ai>>2]=aj;aj=a+4|0;ai=c[aj>>2]|0;c[aj>>2]=c[al>>2];c[al>>2]=ai;ai=a+8|0;al=c[ai>>2]|0;c[ai>>2]=c[am>>2];c[am>>2]=al;al=a+12|0;a=d+12|0;d=c[al>>2]|0;c[al>>2]=c[a>>2];c[a>>2]=d;_=1;i=e;return _|0}function ph(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0;f=i;i=i+96|0;g=f|0;h=f+8|0;j=f+16|0;k=f+24|0;l=f+32|0;m=f+40|0;n=f+48|0;o=f+56|0;p=f+64|0;q=f+72|0;r=f+80|0;s=f+88|0;t=pg(a,b,d,0)|0;u=e|0;v=c[u>>2]|0;w=d|0;x=c[w>>2]|0;do{if(v>>>0<x>>>0){y=x;z=v;A=d+4|0;B=e+4|0;C=d+8|0;D=e+8|0}else{if(x>>>0<v>>>0){E=t;i=f;return E|0}F=e+4|0;G=e+8|0;H=c[G>>2]|0;I=d+4|0;J=c[I>>2]|0;K=d+8|0;L=c[K>>2]|0;c[p>>2]=c[F>>2];c[q>>2]=H;c[r>>2]=J;c[s>>2]=L;if(pl(p,q,r,s,0)|0){y=c[w>>2]|0;z=c[u>>2]|0;A=I;B=F;C=K;D=G;break}else{E=t;i=f;return E|0}}}while(0);c[w>>2]=z;c[u>>2]=y;y=c[A>>2]|0;c[A>>2]=c[B>>2];c[B>>2]=y;y=c[C>>2]|0;c[C>>2]=c[D>>2];c[D>>2]=y;y=d+12|0;d=e+12|0;e=c[y>>2]|0;c[y>>2]=c[d>>2];c[d>>2]=e;e=t+1|0;d=c[w>>2]|0;D=b|0;B=c[D>>2]|0;do{if(d>>>0<B>>>0){M=B;N=d;O=b+4|0;P=b+8|0}else{if(B>>>0<d>>>0){E=e;i=f;return E|0}u=c[C>>2]|0;z=b+4|0;s=c[z>>2]|0;r=b+8|0;q=c[r>>2]|0;c[l>>2]=c[A>>2];c[m>>2]=u;c[n>>2]=s;c[o>>2]=q;if(pl(l,m,n,o,0)|0){M=c[D>>2]|0;N=c[w>>2]|0;O=z;P=r;break}else{E=e;i=f;return E|0}}}while(0);c[D>>2]=N;c[w>>2]=M;M=c[O>>2]|0;c[O>>2]=c[A>>2];c[A>>2]=M;M=c[P>>2]|0;c[P>>2]=c[C>>2];c[C>>2]=M;M=b+12|0;b=c[M>>2]|0;c[M>>2]=c[y>>2];c[y>>2]=b;b=t+2|0;y=c[D>>2]|0;C=a|0;A=c[C>>2]|0;do{if(y>>>0<A>>>0){Q=A;R=y;S=a+4|0;T=a+8|0}else{if(A>>>0<y>>>0){E=b;i=f;return E|0}w=c[P>>2]|0;N=a+4|0;e=c[N>>2]|0;o=a+8|0;n=c[o>>2]|0;c[g>>2]=c[O>>2];c[h>>2]=w;c[j>>2]=e;c[k>>2]=n;if(pl(g,h,j,k,0)|0){Q=c[C>>2]|0;R=c[D>>2]|0;S=N;T=o;break}else{E=b;i=f;return E|0}}}while(0);c[C>>2]=R;c[D>>2]=Q;Q=c[S>>2]|0;c[S>>2]=c[O>>2];c[O>>2]=Q;Q=c[T>>2]|0;c[T>>2]=c[P>>2];c[P>>2]=Q;Q=a+12|0;a=c[Q>>2]|0;c[Q>>2]=c[M>>2];c[M>>2]=a;E=t+3|0;i=f;return E|0}function pi(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0;g=i;i=i+128|0;h=g|0;j=g+8|0;k=g+16|0;l=g+24|0;m=g+32|0;n=g+40|0;o=g+48|0;p=g+56|0;q=g+64|0;r=g+72|0;s=g+80|0;t=g+88|0;u=g+96|0;v=g+104|0;w=g+112|0;x=g+120|0;y=ph(a,b,d,e,0)|0;z=f|0;A=c[z>>2]|0;B=e|0;C=c[B>>2]|0;do{if(A>>>0<C>>>0){D=C;E=A;F=e+4|0;G=f+4|0;H=e+8|0;I=f+8|0}else{if(C>>>0<A>>>0){J=y;i=g;return J|0}K=f+4|0;L=f+8|0;M=c[L>>2]|0;N=e+4|0;O=c[N>>2]|0;P=e+8|0;Q=c[P>>2]|0;c[u>>2]=c[K>>2];c[v>>2]=M;c[w>>2]=O;c[x>>2]=Q;if(pl(u,v,w,x,0)|0){D=c[B>>2]|0;E=c[z>>2]|0;F=N;G=K;H=P;I=L;break}else{J=y;i=g;return J|0}}}while(0);c[B>>2]=E;c[z>>2]=D;D=c[F>>2]|0;c[F>>2]=c[G>>2];c[G>>2]=D;D=c[H>>2]|0;c[H>>2]=c[I>>2];c[I>>2]=D;D=e+12|0;e=f+12|0;f=c[D>>2]|0;c[D>>2]=c[e>>2];c[e>>2]=f;f=y+1|0;e=c[B>>2]|0;I=d|0;G=c[I>>2]|0;do{if(e>>>0<G>>>0){R=G;S=e;T=d+4|0;U=d+8|0}else{if(G>>>0<e>>>0){J=f;i=g;return J|0}z=c[H>>2]|0;E=d+4|0;x=c[E>>2]|0;w=d+8|0;v=c[w>>2]|0;c[q>>2]=c[F>>2];c[r>>2]=z;c[s>>2]=x;c[t>>2]=v;if(pl(q,r,s,t,0)|0){R=c[I>>2]|0;S=c[B>>2]|0;T=E;U=w;break}else{J=f;i=g;return J|0}}}while(0);c[I>>2]=S;c[B>>2]=R;R=c[T>>2]|0;c[T>>2]=c[F>>2];c[F>>2]=R;R=c[U>>2]|0;c[U>>2]=c[H>>2];c[H>>2]=R;R=d+12|0;d=c[R>>2]|0;c[R>>2]=c[D>>2];c[D>>2]=d;d=y+2|0;D=c[I>>2]|0;H=b|0;F=c[H>>2]|0;do{if(D>>>0<F>>>0){V=F;W=D;X=b+4|0;Y=b+8|0}else{if(F>>>0<D>>>0){J=d;i=g;return J|0}B=c[U>>2]|0;S=b+4|0;f=c[S>>2]|0;t=b+8|0;s=c[t>>2]|0;c[m>>2]=c[T>>2];c[n>>2]=B;c[o>>2]=f;c[p>>2]=s;if(pl(m,n,o,p,0)|0){V=c[H>>2]|0;W=c[I>>2]|0;X=S;Y=t;break}else{J=d;i=g;return J|0}}}while(0);c[H>>2]=W;c[I>>2]=V;V=c[X>>2]|0;c[X>>2]=c[T>>2];c[T>>2]=V;V=c[Y>>2]|0;c[Y>>2]=c[U>>2];c[U>>2]=V;V=b+12|0;b=c[V>>2]|0;c[V>>2]=c[R>>2];c[R>>2]=b;b=y+3|0;R=c[H>>2]|0;U=a|0;T=c[U>>2]|0;do{if(R>>>0<T>>>0){Z=T;_=R;$=a+4|0;aa=a+8|0}else{if(T>>>0<R>>>0){J=b;i=g;return J|0}I=c[Y>>2]|0;W=a+4|0;d=c[W>>2]|0;p=a+8|0;o=c[p>>2]|0;c[h>>2]=c[X>>2];c[j>>2]=I;c[k>>2]=d;c[l>>2]=o;if(pl(h,j,k,l,0)|0){Z=c[U>>2]|0;_=c[H>>2]|0;$=W;aa=p;break}else{J=b;i=g;return J|0}}}while(0);c[U>>2]=_;c[H>>2]=Z;Z=c[$>>2]|0;c[$>>2]=c[X>>2];c[X>>2]=Z;Z=c[aa>>2]|0;c[aa>>2]=c[Y>>2];c[Y>>2]=Z;Z=a+12|0;a=c[Z>>2]|0;c[Z>>2]=c[V>>2];c[V>>2]=a;J=y+4|0;i=g;return J|0}function pj(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0;e=i;i=i+80|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=e+32|0;l=e+40|0;m=e+48|0;n=e+56|0;o=e+64|0;p=b+32|0;pg(b,b+16|0,p,0)|0;q=b+48|0;if((q|0)==(d|0)){i=e;return}r=o|0;s=o+4|0;t=s|0;u=o+8|0;v=f|0;w=g|0;x=h|0;y=j|0;A=o+4|0;B=k|0;C=l|0;D=m|0;E=n|0;F=q;q=p;L4:while(1){p=F|0;G=c[p>>2]|0;H=c[q>>2]|0;do{if(G>>>0<H>>>0){I=G;J=7}else{if(H>>>0<G>>>0){break}K=c[F+8>>2]|0;L=c[q+4>>2]|0;N=c[q+8>>2]|0;c[B>>2]=c[F+4>>2];c[C>>2]=K;c[D>>2]=L;c[E>>2]=N;if(!(pl(k,l,m,n,0)|0)){break}I=c[p>>2]|0;J=7}}while(0);do{if((J|0)==7){J=0;c[r>>2]=I;gJ(s,F+4|0);p=F;G=q;while(1){O=G|0;c[p>>2]=c[O>>2];P=G+4|0;z=0;aR(142,p+4|0,c[P>>2]|0,c[G+8>>2]|0);if(z){z=0;J=22;break L4}if((G|0)==(b|0)){Q=b;break}H=G-16|0;N=c[r>>2]|0;L=c[H>>2]|0;if(N>>>0<L>>>0){p=G;G=H;continue}if(L>>>0<N>>>0){Q=G;break}N=c[u>>2]|0;L=c[G-16+4>>2]|0;K=c[G-16+8>>2]|0;c[v>>2]=c[t>>2];c[w>>2]=N;c[x>>2]=L;c[y>>2]=K;if(pl(f,g,h,j,0)|0){p=G;G=H}else{Q=G;break}}c[O>>2]=c[r>>2];if((Q|0)!=(o|0)){z=0;aR(142,P|0,c[t>>2]|0,c[u>>2]|0);if(z){z=0;J=23;break L4}}G=c[A>>2]|0;if((G|0)==0){break}p=c[u>>2]|0;if((G|0)==(p|0)){R=G}else{H=p;while(1){p=H-12|0;c[u>>2]=p;if((a[p]&1)==0){S=p}else{K1(c[H-12+8>>2]|0);S=c[u>>2]|0}if((G|0)==(S|0)){break}else{H=S}}R=c[A>>2]|0}K1(R)}}while(0);H=F+16|0;if((H|0)==(d|0)){J=34;break}else{q=F;F=H}}if((J|0)==22){F=bS(-1,-1)|0;T=M;U=F}else if((J|0)==23){F=bS(-1,-1)|0;T=M;U=F}else if((J|0)==34){i=e;return}e=c[A>>2]|0;if((e|0)==0){bg(U|0)}J=c[u>>2]|0;if((e|0)==(J|0)){V=e}else{F=J;while(1){J=F-12|0;c[u>>2]=J;if((a[J]&1)==0){W=J}else{K1(c[F-12+8>>2]|0);W=c[u>>2]|0}if((e|0)==(W|0)){break}else{F=W}}V=c[A>>2]|0}K1(V);bg(U|0)}function pk(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0;e=i;i=i+112|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=e+32|0;l=e+40|0;m=e+48|0;n=e+56|0;o=e+64|0;p=e+72|0;q=e+80|0;r=e+88|0;s=e+96|0;switch(d-b>>4|0){case 3:{pg(b,b+16|0,d-16|0,0)|0;t=1;i=e;return t|0};case 5:{pi(b,b+16|0,b+32|0,b+48|0,d-16|0,0)|0;t=1;i=e;return t|0};case 0:case 1:{t=1;i=e;return t|0};case 4:{ph(b,b+16|0,b+32|0,d-16|0,0)|0;t=1;i=e;return t|0};case 2:{u=d-16|0;v=c[u>>2]|0;w=b|0;x=c[w>>2]|0;do{if(v>>>0<x>>>0){y=x;A=v;B=b+4|0;C=d-16+4|0;D=b+8|0;E=d-16+8|0}else{if(x>>>0<v>>>0){t=1;i=e;return t|0}F=d-16+4|0;G=d-16+8|0;H=c[G>>2]|0;I=b+4|0;J=c[I>>2]|0;K=b+8|0;L=c[K>>2]|0;c[o>>2]=c[F>>2];c[p>>2]=H;c[q>>2]=J;c[r>>2]=L;if(pl(o,p,q,r,0)|0){y=c[w>>2]|0;A=c[u>>2]|0;B=I;C=F;D=K;E=G;break}else{t=1;i=e;return t|0}}}while(0);c[w>>2]=A;c[u>>2]=y;y=c[B>>2]|0;c[B>>2]=c[C>>2];c[C>>2]=y;y=c[D>>2]|0;c[D>>2]=c[E>>2];c[E>>2]=y;y=b+12|0;E=d-16+12|0;D=c[y>>2]|0;c[y>>2]=c[E>>2];c[E>>2]=D;t=1;i=e;return t|0};default:{D=b+32|0;pg(b,b+16|0,D,0)|0;E=b+48|0;if((E|0)==(d|0)){t=1;i=e;return t|0}y=s|0;C=s+4|0;B=C|0;u=s+8|0;A=f|0;w=g|0;r=h|0;q=j|0;p=s+4|0;o=k|0;v=l|0;x=m|0;G=n|0;K=D;D=0;F=E;E=0;L25:while(1){I=F|0;L=c[I>>2]|0;J=c[K>>2]|0;do{if(L>>>0<J>>>0){N=L;O=17}else{if(J>>>0<L>>>0){P=E;Q=F;R=D;break}H=c[F+8>>2]|0;S=c[K+4>>2]|0;T=c[K+8>>2]|0;c[o>>2]=c[F+4>>2];c[v>>2]=H;c[x>>2]=S;c[G>>2]=T;if(!(pl(k,l,m,n,0)|0)){P=E;Q=F;R=D;break}N=c[I>>2]|0;O=17}}while(0);if((O|0)==17){O=0;c[y>>2]=N;gJ(C,F+4|0);I=K;L=F;while(1){U=I|0;c[L>>2]=c[U>>2];V=I+4|0;if((L|0)!=(I|0)){z=0;aR(142,L+4|0,c[V>>2]|0,c[I+8>>2]|0);if(z){z=0;O=28;break L25}}if((I|0)==(b|0)){W=b;break}J=I-16|0;T=c[y>>2]|0;S=c[J>>2]|0;if(T>>>0<S>>>0){L=I;I=J;continue}if(S>>>0<T>>>0){W=I;break}T=c[u>>2]|0;S=c[I-16+4>>2]|0;H=c[I-16+8>>2]|0;c[A>>2]=c[B>>2];c[w>>2]=T;c[r>>2]=S;c[q>>2]=H;if(pl(f,g,h,j,0)|0){L=I;I=J}else{W=I;break}}c[U>>2]=c[y>>2];if((W|0)!=(s|0)){z=0;aR(142,V|0,c[B>>2]|0,c[u>>2]|0);if(z){z=0;O=29;break}}I=D+1|0;if((I|0)==8){L=F+16|0;X=1;Y=(L|0)==(d|0);Z=L}else{X=0;Y=E;Z=F}L=c[p>>2]|0;if((L|0)!=0){J=c[u>>2]|0;if((L|0)==(J|0)){_=L}else{H=J;while(1){J=H-12|0;c[u>>2]=J;if((a[J]&1)==0){$=J}else{K1(c[H-12+8>>2]|0);$=c[u>>2]|0}if((L|0)==($|0)){break}else{H=$}}_=c[p>>2]|0}K1(_)}if(X){t=Y;O=49;break}else{P=Y;Q=Z;R=I}}H=Q+16|0;if((H|0)==(d|0)){t=1;O=53;break}else{K=Q;D=R;F=H;E=P}}if((O|0)==53){i=e;return t|0}else if((O|0)==49){i=e;return t|0}else if((O|0)==29){t=bS(-1,-1)|0;aa=M;ab=t}else if((O|0)==28){O=bS(-1,-1)|0;aa=M;ab=O}O=c[p>>2]|0;if((O|0)==0){bg(ab|0)}aa=c[u>>2]|0;if((O|0)==(aa|0)){ac=O}else{t=aa;while(1){aa=t-12|0;c[u>>2]=aa;if((a[aa]&1)==0){ad=aa}else{K1(c[t-12+8>>2]|0);ad=c[u>>2]|0}if((O|0)==(ad|0)){break}else{t=ad}}ac=c[p>>2]|0}K1(ac);bg(ab|0)}}return 0}function pl(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;g=i;h=b;b=i;i=i+4|0;i=i+7&-8;c[b>>2]=c[h>>2];h=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[h>>2];h=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[h>>2];h=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[h>>2];h=b|0;b=e|0;e=c[b>>2]|0;j=c[f>>2]|0;if((e|0)==(j|0)){k=0;i=g;return k|0}f=c[d>>2]|0;d=e;e=c[h>>2]|0;while(1){if((e|0)==(f|0)){k=1;l=41;break}m=e;n=a[e]|0;o=n&255;p=(o&1|0)==0;if(p){q=o>>>1}else{q=c[e+4>>2]|0}r=d;s=a[d]|0;t=s&255;u=(t&1|0)==0;if(u){v=t>>>1}else{v=c[d+4>>2]|0}w=(n&1)==0;if(w){x=m+1|0}else{x=c[e+8>>2]|0}n=(s&1)==0;if(n){y=r+1|0}else{y=c[d+8>>2]|0}s=Lc(x|0,y|0,(v>>>0<q>>>0?v:q)|0)|0;if((s|0)==0){if(q>>>0<v>>>0){k=1;l=36;break}}else{if((s|0)<0){k=1;l=42;break}}if(u){z=t>>>1}else{z=c[d+4>>2]|0}if(p){A=o>>>1}else{A=c[e+4>>2]|0}if(n){B=r+1|0}else{B=c[d+8>>2]|0}if(w){C=m+1|0}else{C=c[e+8>>2]|0}m=Lc(B|0,C|0,(A>>>0<z>>>0?A:z)|0)|0;if((m|0)==0){if(z>>>0<A>>>0){k=0;l=39;break}}else{if((m|0)<0){k=0;l=38;break}}m=e+12|0;c[h>>2]=m;w=d+12|0;c[b>>2]=w;if((w|0)==(j|0)){k=0;l=40;break}else{d=w;e=m}}if((l|0)==38){i=g;return k|0}else if((l|0)==39){i=g;return k|0}else if((l|0)==36){i=g;return k|0}else if((l|0)==41){i=g;return k|0}else if((l|0)==40){i=g;return k|0}else if((l|0)==42){i=g;return k|0}return 0}function pm(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;d=b|0;e=c[d>>2]|0;if((e|0)==0){return}f=b+4|0;b=c[f>>2]|0;if((e|0)==(b|0)){g=e}else{h=b;do{b=h-28|0;c[f>>2]=b;fc(h-28+12|0,c[h-28+16>>2]|0);i=b|0;b=c[i>>2]|0;if((b|0)!=0){j=h-28+4|0;k=c[j>>2]|0;if((b|0)==(k|0)){l=b}else{m=k;while(1){k=m-12|0;c[j>>2]=k;if((a[k]&1)==0){n=k}else{K1(c[m-12+8>>2]|0);n=c[j>>2]|0}if((b|0)==(n|0)){break}else{m=n}}l=c[i>>2]|0}K1(l)}h=c[f>>2]|0;}while((e|0)!=(h|0));g=c[d>>2]|0}K1(g);return}function pn(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0;e=b+4|0;f=c[e>>2]|0;g=b|0;h=c[g>>2]|0;i=h;j=f-i>>4;k=j+1|0;if(k>>>0>268435455>>>0){Ip(0)}l=b+8|0;b=(c[l>>2]|0)-i|0;if(b>>4>>>0>134217726>>>0){m=268435455;n=5}else{i=b>>3;b=i>>>0<k>>>0?k:i;if((b|0)==0){o=0;p=0}else{m=b;n=5}}if((n|0)==5){o=K$(m<<4)|0;p=m}m=o+(j<<4)|0;b=o+(p<<4)|0;do{if((m|0)==0){q=h;r=f;n=10}else{c[m>>2]=c[d>>2];z=0;as(294,o+(j<<4)+4|0,d+4|0);if(!z){q=c[g>>2]|0;r=c[e>>2]|0;n=10;break}else{z=0;p=bS(-1,-1)|0;s=M;t=p;break}}}while(0);L14:do{if((n|0)==10){d=o+(k<<4)|0;L16:do{if((r|0)==(q|0)){c[g>>2]=m;c[e>>2]=d;c[l>>2]=b;u=r}else{j=r;f=m;while(1){h=j-16|0;c[f-16>>2]=c[h>>2];z=0;as(294,f-16+4|0,j-16+4|0);if(z){z=0;break}v=f-16|0;if((h|0)==(q|0)){n=14;break}else{j=h;f=v}}if((n|0)==14){j=c[g>>2]|0;h=c[e>>2]|0;c[g>>2]=v;c[e>>2]=d;c[l>>2]=b;if((j|0)==(h|0)){u=j;break}else{w=h}while(1){h=w-16|0;p=w-16+4|0;i=c[p>>2]|0;if((i|0)!=0){x=w-16+8|0;y=c[x>>2]|0;if((i|0)==(y|0)){A=i}else{B=y;while(1){y=B-12|0;c[x>>2]=y;if((a[y]&1)==0){C=y}else{K1(c[B-12+8>>2]|0);C=c[x>>2]|0}if((i|0)==(C|0)){break}else{B=C}}A=c[p>>2]|0}K1(A)}if((j|0)==(h|0)){u=j;break L16}else{w=h}}}j=bS(-1,-1)|0;B=M;if((f|0)!=(d|0)){i=d;while(1){x=i-16|0;y=i-16+4|0;D=c[y>>2]|0;if((D|0)!=0){E=i-16+8|0;F=c[E>>2]|0;if((D|0)==(F|0)){G=D}else{H=F;while(1){F=H-12|0;c[E>>2]=F;if((a[F]&1)==0){I=F}else{K1(c[H-12+8>>2]|0);I=c[E>>2]|0}if((D|0)==(I|0)){break}else{H=I}}G=c[y>>2]|0}K1(G)}if((f|0)==(x|0)){break}else{i=x}}}if((o|0)==0){J=B;K=j}else{s=B;t=j;break L14}bg(K|0)}}while(0);if((u|0)==0){return}K1(u);return}}while(0);K1(o);J=s;K=t;bg(K|0)}function po(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;g=i;h=b;b=i;i=i+4|0;i=i+7&-8;c[b>>2]=c[h>>2];h=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[h>>2];h=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[h>>2];h=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[h>>2];h=b|0;b=e|0;e=c[b>>2]|0;j=c[f>>2]|0;if((e|0)==(j|0)){k=1;i=g;return k|0}f=c[d>>2]|0;d=e;e=c[h>>2]|0;while(1){if((e|0)==(f|0)){k=0;l=41;break}m=d+16|0;n=m;o=a[m]|0;m=o&255;p=(m&1|0)==0;if(p){q=m>>>1}else{q=c[d+20>>2]|0}r=e;s=a[e]|0;t=s&255;u=(t&1|0)==0;if(u){v=t>>>1}else{v=c[e+4>>2]|0}w=(o&1)==0;if(w){x=n+1|0}else{x=c[d+24>>2]|0}o=(s&1)==0;if(o){y=r+1|0}else{y=c[e+8>>2]|0}s=Lc(x|0,y|0,(v>>>0<q>>>0?v:q)|0)|0;if((s|0)==0){if(q>>>0<v>>>0){k=0;l=42;break}}else{if((s|0)<0){k=0;l=44;break}}if(u){z=t>>>1}else{z=c[e+4>>2]|0}if(p){A=m>>>1}else{A=c[d+20>>2]|0}if(o){B=r+1|0}else{B=c[e+8>>2]|0}if(w){C=n+1|0}else{C=c[d+24>>2]|0}n=Lc(B|0,C|0,(A>>>0<z>>>0?A:z)|0)|0;if((n|0)==0){if(z>>>0<A>>>0){D=d}else{l=34}}else{if((n|0)<0){D=d}else{l=34}}if((l|0)==34){l=0;n=c[d+4>>2]|0;if((n|0)==0){w=d|0;while(1){r=c[w+8>>2]|0;if((w|0)==(c[r>>2]|0)){E=r;break}else{w=r}}}else{w=n;while(1){r=c[w>>2]|0;if((r|0)==0){E=w;break}else{w=r}}}w=E;c[b>>2]=w;D=w}w=e+12|0;c[h>>2]=w;if((D|0)==(j|0)){k=1;l=45;break}else{d=D;e=w}}if((l|0)==41){i=g;return k|0}else if((l|0)==42){i=g;return k|0}else if((l|0)==44){i=g;return k|0}else if((l|0)==45){i=g;return k|0}return 0}function pp(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;e=c[b+4>>2]|0;if((e|0)==0){f=0;return f|0}b=a[d]|0;g=b&255;h=(g&1|0)==0;i=g>>>1;g=(b&1)==0;b=d+1|0;j=d+8|0;k=d+4|0;d=e;while(1){e=d+16|0;if(h){l=i}else{l=c[k>>2]|0}m=e;n=a[e]|0;e=n&255;o=(e&1|0)==0;if(o){p=e>>>1}else{p=c[d+20>>2]|0}if(g){q=b}else{q=c[j>>2]|0}r=(n&1)==0;if(r){s=m+1|0}else{s=c[d+24>>2]|0}n=Lc(q|0,s|0,(p>>>0<l>>>0?p:l)|0)|0;if((n|0)==0){if(l>>>0<p>>>0){t=16}else{t=17}}else{if((n|0)<0){t=16}else{t=17}}if((t|0)==16){t=0;u=d|0}else if((t|0)==17){t=0;if(o){v=e>>>1}else{v=c[d+20>>2]|0}if(h){w=i}else{w=c[k>>2]|0}if(r){x=m+1|0}else{x=c[d+24>>2]|0}if(g){y=b}else{y=c[j>>2]|0}m=Lc(x|0,y|0,(w>>>0<v>>>0?w:v)|0)|0;if((m|0)==0){if(v>>>0>=w>>>0){f=1;t=36;break}}else{if((m|0)>=0){f=1;t=35;break}}u=d+4|0}m=c[u>>2]|0;if((m|0)==0){f=0;t=34;break}else{d=m}}if((t|0)==35){return f|0}else if((t|0)==36){return f|0}else if((t|0)==34){return f|0}return 0}function pq(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=d;f=d;g=a[f]|0;h=g&255;if((h&1|0)==0){i=h>>>1}else{i=c[d+4>>2]|0}h=g&1;L5:do{if((i|0)!=0){if(h<<24>>24==0){j=e+1|0}else{j=c[d+8>>2]|0}g=j+i|0;do{if((g|0)==(j|0)){break L5}g=g-1|0;}while((a[g]|0)!=47);k=g-j|0;if((k|0)==-1){break}DJ(b,d,k+1|0,-1,0);return}}while(0);if(h<<24>>24==0){h=b;c[h>>2]=c[f>>2];c[h+4>>2]=c[f+4>>2];c[h+8>>2]=c[f+8>>2];return}f=c[d+8>>2]|0;h=c[d+4>>2]|0;if(h>>>0>4294967279>>>0){DE(0)}if(h>>>0<11>>>0){a[b]=h<<1;l=b+1|0}else{d=h+16&-16;j=K$(d)|0;c[b+8>>2]=j;c[b>>2]=d|1;c[b+4>>2]=h;l=j}La(l|0,f|0,h)|0;a[l+h|0]=0;return}function pr(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0;e=d;f=a[d]|0;g=f&255;if((g&1|0)==0){h=g>>>1}else{h=c[d+4>>2]|0}L5:do{if((h|0)!=0){if((f&1)==0){i=e+1|0}else{i=c[d+8>>2]|0}g=i+h|0;do{if((g|0)==(i|0)){break L5}g=g-1|0;}while((a[g]|0)!=47);j=g-i|0;if((j|0)==-1){break}DJ(b,d,0,j+1|0,0);return}}while(0);a[b]=0;a[b+1|0]=0;return}function ps(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0;g=i;i=i+48|0;h=g|0;j=g+16|0;k=g+32|0;l=e;m=e;n=a[m]|0;o=n&255;p=(o&1|0)==0;if(p){q=o>>>1}else{q=c[e+4>>2]|0}r=f;s=a[r]|0;if((q|0)==0){if((s&1)==0){q=b;c[q>>2]=c[r>>2];c[q+4>>2]=c[r+4>>2];c[q+8>>2]=c[r+8>>2];i=g;return}q=c[f+8>>2]|0;t=c[f+4>>2]|0;if(t>>>0>4294967279>>>0){DE(0)}if(t>>>0<11>>>0){a[b]=t<<1;u=b+1|0}else{v=t+16&-16;w=K$(v)|0;c[b+8>>2]=w;c[b>>2]=v|1;c[b+4>>2]=t;u=w}La(u|0,q|0,t)|0;a[u+t|0]=0;i=g;return}t=s&255;if((t&1|0)==0){x=t>>>1}else{x=c[f+4>>2]|0}if((x|0)==0){if((n&1)==0){x=b;c[x>>2]=c[m>>2];c[x+4>>2]=c[m+4>>2];c[x+8>>2]=c[m+8>>2];i=g;return}x=c[e+8>>2]|0;t=c[e+4>>2]|0;if(t>>>0>4294967279>>>0){DE(0)}if(t>>>0<11>>>0){a[b]=t<<1;y=b+1|0}else{u=t+16&-16;q=K$(u)|0;c[b+8>>2]=q;c[b>>2]=u|1;c[b+4>>2]=t;y=q}La(y|0,x|0,t)|0;a[y+t|0]=0;i=g;return}t=(s&1)==0;if(t){A=f+1|0}else{A=c[f+8>>2]|0}if((a[A]|0)==47){if(t){t=b;c[t>>2]=c[r>>2];c[t+4>>2]=c[r+4>>2];c[t+8>>2]=c[r+8>>2];i=g;return}t=c[f+8>>2]|0;A=c[f+4>>2]|0;if(A>>>0>4294967279>>>0){DE(0)}if(A>>>0<11>>>0){a[b]=A<<1;B=b+1|0}else{s=A+16&-16;y=K$(s)|0;c[b+8>>2]=y;c[b>>2]=s|1;c[b+4>>2]=A;B=y}La(B|0,t|0,A)|0;a[B+A|0]=0;i=g;return}if(p){C=o>>>1}else{C=c[e+4>>2]|0}p=(n&1)==0;if(p){D=l+1|0}else{D=c[e+8>>2]|0}if((a[D+(C-1)|0]|0)!=47){if(p){E=o>>>1;F=10}else{E=c[e+4>>2]|0;F=(c[e>>2]&-2)-1|0}if((E|0)==(F|0)){DT(e,F,1,F,F,0,0);G=a[m]|0}else{G=n}if((G&1)==0){a[m]=(E<<1)+2;H=l+1|0;I=E+1|0}else{G=c[e+8>>2]|0;n=E+1|0;c[e+4>>2]=n;H=G;I=n}a[H+E|0]=47;a[H+I|0]=0}I=h;H=h+1|0;E=j;n=k;G=k+8|0;F=l+1|0;l=e+8|0;o=e+4|0;p=j+8|0;C=h+8|0;D=h+4|0;A=f+4|0;while(1){B=d[r]|0;if((B&1|0)==0){J=B>>>1}else{J=c[A>>2]|0}if(J>>>0<=3>>>0){K=83;break}DJ(h,f,0,3,0);B=a[I]|0;t=B&255;y=(t&1|0)==0?t>>>1:c[D>>2]|0;t=(B&1)==0;B=y>>>0>3>>>0;s=Lc((t?H:c[C>>2]|0)|0,10904,(B?3:y)|0)|0;if((s|0)==0){L=y>>>0<3>>>0?-1:B&1}else{L=s}s=(L|0)==0;if(t){if(!s){K=83;break}}else{K1(c[C>>2]|0);if(!s){K=83;break}}DJ(j,f,3,-1,0);z=0,aM(344,f|0,j|0)|0;if(z){z=0;K=79;break}if((a[E]&1)!=0){K1(c[p>>2]|0)}s=a[m]|0;t=s&255;if((t&1|0)==0){B=t>>>1;N=t>>>1;O=B;P=B}else{B=c[o>>2]|0;N=B;O=B;P=B}L102:do{if((N|0)==0){Q=0}else{if((s&1)==0){R=F}else{R=c[l>>2]|0}B=R+(N>>>0>(P-2|0)>>>0?O-1|0:N)|0;do{if((B|0)==(R|0)){Q=0;break L102}B=B-1|0;}while((a[B]|0)!=47);Q=1-R+B|0}}while(0);DJ(k,e,0,Q,0);z=0,aM(344,e|0,k|0)|0;if(z){z=0;K=81;break}if((a[n]&1)==0){continue}K1(c[G>>2]|0)}if((K|0)==83){i2(b,e,f);i=g;return}else if((K|0)==79){g=bS(-1,-1)|0;f=g;g=M;if((a[E]&1)==0){S=g;T=f;U=T;V=0;W=U;X=S;bg(W|0)}K1(c[p>>2]|0);S=g;T=f;U=T;V=0;W=U;X=S;bg(W|0)}else if((K|0)==81){K=bS(-1,-1)|0;f=K;K=M;if((a[n]&1)==0){S=K;T=f;U=T;V=0;W=U;X=S;bg(W|0)}K1(c[G>>2]|0);S=K;T=f;U=T;V=0;W=U;X=S;bg(W|0)}}
// EMSCRIPTEN_END_FUNCS
var cw=[Ml,Ml,FH,Ml,Fi,Ml,Ml,Ml];var cx=[Mm,Mm,pO,Mm];var cy=[Mn,Mn,tm,Mn,nY,Mn,KR,Mn,kO,Mn,k6,Mn,t0,Mn,yE,Mn,tn,Mn,xw,Mn,fb,Mn,KQ,Mn,oc,Mn,g0,Mn,lg,Mn,KP,Mn,wk,Mn,iw,Mn,lr,Mn,uW,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn,Mn];var cz=[Mo,Mo,Ij,Mo,e0,Mo,pM,Mo,Fa,Mo,Dl,Mo,C8,Mo,Je,Mo,k_,Mo,Ac,Mo,wN,Mo,E5,Mo,hi,Mo,kK,Mo,F7,Mo,m6,Mo,kB,Mo,IB,Mo,Gl,Mo,Hq,Mo,sz,Mo,w4,Mo,fx,Mo,li,Mo,KB,Mo,JC,Mo,HR,Mo,yk,Mo,Dq,Mo,Fb,Mo,on,Mo,JB,Mo,xo,Mo,wc,Mo,F6,Mo,my,Mo,wF,Mo,g3,Mo,GZ,Mo,n9,Mo,wu,Mo,kc,Mo,Ke,Mo,Kf,Mo,DE,Mo,Ek,Mo,nl,Mo,Ar,Mo,kq,Mo,vL,Mo,Ky,Mo,mX,Mo,CO,Mo,EX,Mo,A7,Mo,eg,Mo,v2,Mo,HX,Mo,es,Mo,H9,Mo,C2,Mo,hh,Mo,kQ,Mo,wO,Mo,nE,Mo,d6,Mo,nh,Mo,xA,Mo,yc,Mo,EI,Mo,EP,Mo,xd,Mo,Gz,Mo,KE,Mo,om,Mo,IR,Mo,g2,Mo,Ip,Mo,hd,Mo,Dt,Mo,f9,Mo,E1,Mo,k7,Mo,eh,Mo,vV,Mo,Ez,Mo,iH,Mo,ik,Mo,Aq,Mo,e$,Mo,KH,Mo,gM,Mo,EC,Mo,E$,Mo,kL,Mo,JF,Mo,H8,Mo,EH,Mo,Dl,Mo,JD,Mo,x2,Mo,wb,Mo,fM,Mo,Hr,Mo,GM,Mo,Hf,Mo,D5,Mo,oa,Mo,KF,Mo,eE,Mo,I_,Mo,pC,Mo,E0,Mo,HM,Mo,kd,Mo,nZ,Mo,Is,Mo,yb,Mo,yw,Mo,Kx,Mo,G_,Mo,DF,Mo,kn,Mo,E4,Mo,er,Mo,v3,Mo,HW,Mo,rF,Mo,EN,Mo,DC,Mo,ga,Mo,Ex,Mo,k8,Mo,pz,Mo,vW,Mo,gf,Mo,D2,Mo,EM,Mo,Iv,Mo,il,Mo,w3,Mo,HC,Mo,xT,Mo,Kd,Mo,wW,Mo,gC,Mo,CP,Mo,nw,Mo,KA,Mo,H3,Mo,DK,Mo,Dp,Mo,wv,Mo,Ds,Mo,Ad,Mo,FE,Mo,fL,Mo,vM,Mo,IQ,Mo,gh,Mo,GN,Mo,EV,Mo,xc,Mo,If,Mo,l2,Mo,n_,Mo,yv,Mo,eQ,Mo,ID,Mo,iG,Mo,Dq,Mo,KD,Mo,E3,Mo,CW,Mo,G0,Mo,pA,Mo,g$,Mo,dY,Mo,xJ,Mo,iy,Mo,EO,Mo,K3,Mo,h9,Mo,qM,Mo,jP,Mo,vB,Mo,pB,Mo,fZ,Mo,HB,Mo,x1,Mo,ym,Mo,nO,Mo,KC,Mo,eD,Mo,dP,Mo,m5,Mo,C1,Mo,px,Mo,Ix,Mo,G4,Mo,Gk,Mo,wX,Mo,E6,Mo,CQ,Mo,eG,Mo,H2,Mo,DW,Mo,Ky,Mo,KG,Mo,qL,Mo,sv,Mo,fm,Mo,fz,Mo,EU,Mo,Ie,Mo,wl,Mo,Io,Mo,C9,Mo,l1,Mo,sw,Mo,Ej,Mo,EL,Mo,A8,Mo,Ik,Mo,G1,Mo,xU,Mo,Ki,Mo,Ff,Mo,nv,Mo,D6,Mo,IC,Mo,CX,Mo,Dk,Mo,dZ,Mo,kA,Mo,K4,Mo,Dl,Mo,IA,Mo,FF,Mo,Kw,Mo,jj,Mo,nP,Mo,fw,Mo,fA,Mo,lh,Mo,lu,Mo,j0,Mo,It,Mo,ko,Mo,nF,Mo,pD,Mo,yn,Mo,xn,Mo,mz,Mo,G5,Mo,KW,Mo,Hg,Mo,wE,Mo,gL,Mo,Kb,Mo,eF,Mo,kZ,Mo,Jp,Mo,Ey,Mo,E2,Mo,nm,Mo,xK,Mo,EW,Mo,gY,Mo,wm,Mo,EA,Mo,jQ,Mo,vC,Mo,Kh,Mo,f_,Mo,kP,Mo,rE,Mo,HP,Mo,Kg,Mo,EJ,Mo,eP,Mo,I6,Mo,JE,Mo,Fg,Mo,h8,Mo,d7,Mo,ng,Mo,lt,Mo,dQ,Mo,fy,Mo,kr,Mo,xB,Mo,j1,Mo,mY,Mo,py,Mo,Lu,Mo,fB,Mo,DB,Mo,Gy,Mo,fv,Mo,JA,Mo,HN,Mo,EG,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo,Mo];var cA=[Mp,Mp,sx,Mp,JO,Mp,mU,Mp,gN,Mp,CR,Mp,Ab,Mp,gr,Mp,yd,Mp,sI,Mp,rg,Mp,CY,Mp,sD,Mp,gz,Mp,q7,Mp,eR,Mp,oz,Mp,r$,Mp,sr,Mp,kC,Mp,ow,Mp,rC,Mp,qP,Mp,ss,Mp,n$,Mp,qN,Mp,sh,Mp,f$,Mp,sY,Mp,ei,Mp,s0,Mp,rx,Mp,e_,Mp,sC,Mp,ot,Mp,Hx,Mp,vA,Mp,re,Mp,yo,Mp,qU,Mp,sc,Mp,sF,Mp,Iw,Mp,j2,Mp,qI,Mp,rX,Mp,ti,Mp,kp,Mp,C3,Mp,Dn,Mp,oL,Mp,qT,Mp,sG,Mp,pq,Mp,dD,Mp,jZ,Mp,rr,Mp,oP,Mp,HF,Mp,sK,Mp,rT,Mp,tc,Mp,r4,Mp,oA,Mp,Hm,Mp,xL,Mp,qK,Mp,oD,Mp,ke,Mp,fN,Mp,vX,Mp,oT,Mp,D7,Mp,ro,Mp,r2,Mp,x3,Mp,s_,Mp,sH,Mp,In,Mp,jL,Mp,wn,Mp,o$,Mp,oX,Mp,q$,Mp,rw,Mp,e8,Mp,rW,Mp,d8,Mp,oy,Mp,sb,Mp,G9,Mp,ri,Mp,Kc,Mp,oE,Mp,th,Mp,eB,Mp,q3,Mp,s8,Mp,d_,Mp,vN,Mp,D4,Mp,sN,Mp,r3,Mp,rb,Mp,o4,Mp,HG,Mp,nn,Mp,fH,Mp,qQ,Mp,ov,Mp,kR,Mp,oW,Mp,oM,Mp,oQ,Mp,q4,Mp,oY,Mp,ww,Mp,fh,Mp,nQ,Mp,rK,Mp,so,Mp,Iq,Mp,oS,Mp,JL,Mp,ji,Mp,rH,Mp,sk,Mp,D_,Mp,JK,Mp,f8,Mp,q8,Mp,q9,Mp,Ii,Mp,ge,Mp,El,Mp,Da,Mp,h7,Mp,sg,Mp,gc,Mp,A6,Mp,Ha,Mp,pr,Mp,e6,Mp,ia,Mp,sV,Mp,rD,Mp,rM,Mp,gJ,Mp,HI,Mp,sa,Mp,rt,Mp,sQ,Mp,tj,Mp,nf,Mp,rs,Mp,wP,Mp,qZ,Mp,oU,Mp,sA,Mp,Ae,Mp,rZ,Mp,sp,Mp,fe,Mp,jh,Mp,sM,Mp,rQ,Mp,xp,Mp,sB,Mp,rl,Mp,sd,Mp,JM,Mp,Ho,Mp,hb,Mp,ta,Mp,D3,Mp,tf,Mp,ne,Mp,r9,Mp,op,Mp,z6,Mp,qV,Mp,ry,Mp,D1,Mp,o3,Mp,Hu,Mp,rY,Mp,fp,Mp,e7,Mp,He,Mp,e4,Mp,rI,Mp,oK,Mp,pb,Mp,ob,Mp,o1,Mp,rJ,Mp,r1,Mp,Hw,Mp,qR,Mp,dE,Mp,wG,Mp,s9,Mp,mT,Mp,oI,Mp,r5,Mp,sE,Mp,wY,Mp,v4,Mp,HH,Mp,sO,Mp,rU,Mp,sR,Mp,or,Mp,kJ,Mp,rj,Mp,oB,Mp,HA,Mp,yx,Mp,mZ,Mp,sf,Mp,dG,Mp,et,Mp,s2,Mp,n7,Mp,rR,Mp,oq,Mp,oO,Mp,sP,Mp,im,Mp,tg,Mp,mP,Mp,Do,Mp,sj,Mp,xC,Mp,rf,Mp,se,Mp,e5,Mp,G8,Mp,s3,Mp,pc,Mp,lj,Mp,od,Mp,mR,Mp,lv,Mp,r7,Mp,sy,Mp,mA,Mp,os,Mp,q5,Mp,vz,Mp,JN,Mp,rG,Mp,gd,Mp,DZ,Mp,s4,Mp,sT,Mp,Hk,Mp,fV,Mp,rz,Mp,rS,Mp,Hj,Mp,eZ,Mp,rP,Mp,gy,Mp,Hz,Mp,sm,Mp,s6,Mp,r6,Mp,sS,Mp,mN,Mp,gb,Mp,vD,Mp,lq,Mp,z3,Mp,gn,Mp,oi,Mp,rn,Mp,g4,Mp,oC,Mp,sX,Mp,ls,Mp,kY,Mp,s1,Mp,eH,Mp,qW,Mp,fu,Mp,rd,Mp,o0,Mp,mL,Mp,n8,Mp,rA,Mp,f6,Mp,DQ,Mp,Hv,Mp,sU,Mp,o5,Mp,ks,Mp,qX,Mp,oG,Mp,rN,Mp,Hl,Mp,ol,Mp,k9,Mp,oF,Mp,q0,Mp,k$,Mp,kM,Mp,DP,Mp,Dj,Mp,o2,Mp,km,Mp,nG,Mp,ru,Mp,sn,Mp,rO,Mp,sl,Mp,qS,Mp,j9,Mp,q1,Mp,nk,Mp,rm,Mp,rL,Mp,Hp,Mp,sW,Mp,Hb,Mp,lD,Mp,HK,Mp,r_,Mp,wd,Mp,tk,Mp,s5,Mp,dR,Mp,rq,Mp,oJ,Mp,oH,Mp,r0,Mp,w5,Mp,sJ,Mp,xV,Mp,kl,Mp,q_,Mp,HL,Mp,jR,Mp,ra,Mp,oN,Mp,qJ,Mp,nx,Mp,m7,Mp,oh,Mp,pE,Mp,rV,Mp,tb,Mp,q6,Mp,rv,Mp,r8,Mp,JP,Mp,sZ,Mp,rk,Mp,si,Mp,sL,Mp,te,Mp,xe,Mp,td,Mp,q2,Mp,EE,Mp,s7,Mp,Hd,Mp,e3,Mp,oo,Mp,ni,Mp,qY,Mp,rc,Mp,ou,Mp,sq,Mp,oe,Mp,oR,Mp,rh,Mp,eC,Mp,ox,Mp,s$,Mp,oV,Mp,rp,Mp,o_,Mp,jg,Mp,pn,Mp,oZ,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp];var cB=[Mq,Mq,p_,Mq,qr,Mq,p$,Mq,pW,Mq,p9,Mq,qH,Mq,qA,Mq,qh,Mq,p8,Mq,qk,Mq,pR,Mq,qd,Mq,qj,Mq,p3,Mq,qv,Mq,qa,Mq,qD,Mq,pV,Mq,p4,Mq,pP,Mq,p6,Mq,qo,Mq,qB,Mq,pX,Mq,qq,Mq,qe,Mq,qn,Mq,p1,Mq,qw,Mq,qE,Mq,qf,Mq,p5,Mq,p0,Mq,p2,Mq,qt,Mq,qi,Mq,qG,Mq,p7,Mq,qb,Mq,qF,Mq,qz,Mq,qp,Mq,ql,Mq,pS,Mq,qC,Mq,qm,Mq,qg,Mq,qx,Mq,pT,Mq,hj,Mq,pQ,Mq,qs,Mq,qu,Mq,qc,Mq,pU,Mq,qy,Mq,Mq,Mq,Mq,Mq,Mq,Mq,Mq,Mq,Mq,Mq,Mq,Mq,Mq,Mq];var cC=[Mr,Mr,J1,Mr,JI,Mr,JT,Mr,ui,Mr,J$,Mr,C4,Mr,Lv,Mr,Hh,Mr,ul,Mr,GA,Mr,Dc,Mr,dO,Mr,d5,Mr,Es,Mr,lE,Mr,JJ,Mr,dA,Mr,Lw,Mr,t3,Mr,un,Mr,JH,Mr,uk,Mr,CK,Mr,dv,Mr,t2,Mr,zp,Mr,uj,Mr,dz,Mr,HD,Mr,JQ,Mr,EB,Mr,EZ,Mr,yN,Mr,uB,Mr,Ep,Mr,Hn,Mr,J0,Mr,gU,Mr,uq,Mr,Eq,Mr,ds,Mr,GO,Mr,JZ,Mr,K0,Mr,uy,Mr,tX,Mr,fW,Mr,dy,Mr,JV,Mr,Kz,Mr,Dr,Mr,HJ,Mr,JY,Mr,Hi,Mr,Jl,Mr,lC,Mr,fX,Mr,Lx,Mr,dN,Mr,Kr,Mr,tQ,Mr,Hc,Mr,C_,Mr,um,Mr,Jk,Mr,Jb,Mr,jY,Mr,dt,Mr,tP,Mr,ii,Mr,gq,Mr,Ht,Mr,HE,Mr,uZ,Mr,u0,Mr,Jz,Mr,uM,Mr,Ef,Mr,Jw,Mr,eY,Mr,uz,Mr,dB,Mr,tY,Mr,EK,Mr,uw,Mr,tS,Mr,JG,Mr,uC,Mr,Eb,Mr,I5,Mr,I2,Mr,fU,Mr,zi,Mr,ef,Mr,CZ,Mr,vl,Mr,j$,Mr,vj,Mr,Ec,Mr,uD,Mr,pJ,Mr,nX,Mr,tG,Mr,Db,Mr,yO,Mr,G6,Mr,JS,Mr,G7,Mr,Hs,Mr,Jd,Mr,eO,Mr,Dm,Mr,JR,Mr,J_,Mr,tZ,Mr,Ee,Mr,yK,Mr,I3,Mr,f7,Mr,eA,Mr,Et,Mr,tR,Mr,K$,Mr,iv,Mr,Jv,Mr,JX,Mr,JW,Mr,pI,Mr,gV,Mr,u3,Mr,CS,Mr,uP,Mr,vn,Mr,Ly,Mr,Lz,Mr,j_,Mr,tU,Mr,n6,Mr,to,Mr,tV,Mr,vk,Mr,zg,Mr,pw,Mr,ep,Mr,dC,Mr,zo,Mr,K5,Mr,eq,Mr,u_,Mr,Hy,Mr,JU,Mr,u$,Mr,Ja,Mr,uL,Mr,fE,Mr,LA,Mr,Jo,Mr,nN,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr,Mr];var cD=[Ms,Ms,g1,Ms];var cE=[Mt,Mt,pZ,Mt];var cF=[Mu,Mu,HZ,Mu,HQ,Mu,Mu,Mu];var cG=[Mv,Mv,z1,Mv];var cH=[Mw,Mw,of,Mw,Kj,Mw,KJ,Mw,IE,Mw,IY,Mw,dF,Mw,CT,Mw,Dx,Mw,Ig,Mw,og,Mw,E9,Mw,iV,Mw,IO,Mw,Em,Mw,LB,Mw,oj,Mw,iW,Mw,IJ,Mw,dp,Mw,dq,Mw,iI,Mw,IL,Mw,dn,Mw,IT,Mw,dm,Mw,Kn,Mw,Fe,Mw,Eh,Mw,Il,Mw,HT,Mw,KN,Mw,IV,Mw,dr,Mw,LC,Mw,H$,Mw,ED,Mw,Ko,Mw,pF,Mw,DO,Mw,Dw,Mw,Ed,Mw,DR,Mw,KI,Mw,Er,Mw,D8,Mw,C5,Mw,Ev,Mw,Mw,Mw,Mw,Mw,Mw,Mw,Mw,Mw,Mw,Mw,Mw,Mw,Mw,Mw,Mw,Mw,Mw,Mw,Mw,Mw,Mw,Mw,Mw,Mw,Mw,Mw,Mw,Mw,Mw,Mw,Mw,Mw];var cI=[Mx,Mx,H6,Mx,Ic,Mx,Mx,Mx];var cJ=[My,My,Gi,My,Gf,My,Gv,My,Gt,My,My,My,My,My,My,My];var cK=[Mz,Mz,G2,Mz,vU,Mz,G$,Mz,DS,Mz,H_,Mz,HO,Mz,HS,Mz,gK,Mz,HY,Mz,Mz,Mz,Mz,Mz,Mz,Mz,Mz,Mz,Mz,Mz,Mz,Mz];var cL=[MA,MA,kN,MA,KT,MA,fK,MA,nu,MA,En,MA,uK,MA,KU,MA,xS,MA,fa,MA,D9,MA,fi,MA,x0,MA,fC,MA,fJ,MA,KS,MA,pG,MA,fY,MA,vw,MA,mV,MA,Gr,MA,F8,MA,Gd,MA,F9,MA,lG,MA,Gn,MA,Gm,MA,Gw,MA,xl,MA,vK,MA,Gj,MA,Ih,MA,Im,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA,MA];var cM=[MB,MB,LD,MB,iB,MB,iD,MB,iC,MB,iE,MB,MB,MB,MB,MB];var cN=[MC,MC,J4,MC];var cO=[MD,MD,lF,MD];var cP=[ME,ME,ES,ME];var cQ=[MF,MF,GF,MF,nj,MF,GS,MF,FS,MF,FK,MF,FM,MF,FQ,MF,FI,MF,FG,MF,FY,MF,FW,MF,FU,MF,GT,MF,Ft,MF,Fl,MF,Fn,MF,Fr,MF,Fz,MF,Fx,MF,Fv,MF,GR,MF,Id,MF,DT,MF,Go,MF,GD,MF,Gp,MF,Fj,MF,fs,MF,hg,MF,Fp,MF,GP,MF,H7,MF,GB,MF,GE,MF,Gu,MF,F_,MF,Ge,MF,Gc,MF,FB,MF,Gb,MF,Gs,MF,Gq,MF,Gh,MF,kz,MF,FO,MF,GQ,MF,Fh,MF,GC,MF,MF,MF,MF,MF,MF,MF,MF,MF,MF,MF,MF,MF,MF,MF,MF,MF,MF,MF,MF,MF,MF,MF,MF,MF,MF,MF,MF,MF,MF,MF];var cR=[MG,MG,H4,MG,Ia,MG,MG,MG];var cS=[MH,MH,GG,MH,GU,MH,MH,MH];var cT=[MI,MI,Ib,MI,HU,MI,H0,MI,H5,MI,MI,MI,MI,MI,MI,MI];var cU=[MJ,MJ,xZ,MJ,wJ,MJ,kv,MJ,ew,MJ,dI,MJ,xh,MJ,lT,MJ,lJ,MJ,d2,MJ,iS,MJ,vE,MJ,jC,MJ,mw,MJ,hM,MJ,hu,MJ,fP,MJ,ld,MJ,nr,MJ,x4,MJ,nS,MJ,xt,MJ,eu,MJ,lb,MJ,v6,MJ,f0,MJ,du,MJ,hz,MJ,ll,MJ,gQ,MJ,jr,MJ,nR,MJ,yq,MJ,mr,MJ,LE,MJ,nU,MJ,h1,MJ,j3,MJ,xq,MJ,hp,MJ,dj,MJ,hT,MJ,i9,MJ,iR,MJ,mj,MJ,gt,MJ,jF,MJ,lK,MJ,i8,MJ,mE,MJ,jb,MJ,wh,MJ,hr,MJ,ka,MJ,ln,MJ,hR,MJ,hQ,MJ,fk,MJ,mc,MJ,mh,MJ,ml,MJ,g5,MJ,kT,MJ,iJ,MJ,vG,MJ,nz,MJ,mv,MJ,l9,MJ,gP,MJ,x7,MJ,h5,MJ,xO,MJ,fj,MJ,j4,MJ,v5,MJ,hF,MJ,d0,MJ,l6,MJ,lX,MJ,xP,MJ,hv,MJ,xW,MJ,LF,MJ,wH,MJ,v$,MJ,dJ,MJ,Iy,MJ,lH,MJ,l$,MJ,fn,MJ,hE,MJ,hS,MJ,xg,MJ,dK,MJ,ny,MJ,la,MJ,lQ,MJ,w9,MJ,iK,MJ,Iz,MJ,yy,MJ,ho,MJ,mt,MJ,hl,MJ,nK,MJ,jA,MJ,jw,MJ,hY,MJ,l0,MJ,l3,MJ,wR,MJ,DX,MJ,mu,MJ,yg,MJ,eS,MJ,we,MJ,xG,MJ,l4,MJ,v_,MJ,w$,MJ,wS,MJ,ET,MJ,ex,MJ,IW,MJ,ja,MJ,Eu,MJ,wz,MJ,xF,MJ,vQ,MJ,yB,MJ,i0,MJ,gi,MJ,h3,MJ,C6,MJ,md,MJ,mm,MJ,nb,MJ,hN,MJ,mB,MJ,ju,MJ,hL,MJ,ev,MJ,hs,MJ,eV,MJ,fG,MJ,xM,MJ,hw,MJ,eU,MJ,mg,MJ,jT,MJ,jH,MJ,mn,MJ,me,MJ,wQ,MJ,nB,MJ,ER,MJ,EQ,MJ,d9,MJ,h2,MJ,i1,MJ,mq,MJ,nJ,MJ,n1,MJ,jz,MJ,pv,MJ,dU,MJ,hW,MJ,nH,MJ,hy,MJ,wr,MJ,jd,MJ,xN,MJ,DL,MJ,vR,MJ,d1,MJ,xE,MJ,n2,MJ,yf,MJ,w6,MJ,iQ,MJ,mb,MJ,lU,MJ,hm,MJ,jI,MJ,g7,MJ,em,MJ,xi,MJ,iN,MJ,mH,MJ,w8,MJ,lW,MJ,wf,MJ,vZ,MJ,h6,MJ,kV,MJ,lN,MJ,fF,MJ,wT,MJ,io,MJ,m_,MJ,xY,MJ,vF,MJ,h$,MJ,v8,MJ,yh,MJ,lV,MJ,dV,MJ,f2,MJ,kg,MJ,jq,MJ,jt,MJ,el,MJ,mC,MJ,k3,MJ,hq,MJ,hP,MJ,iM,MJ,ms,MJ,m0,MJ,nq,MJ,i4,MJ,hC,MJ,Dd,MJ,eJ,MJ,i6,MJ,jl,MJ,hZ,MJ,g6,MJ,xr,MJ,vY,MJ,lw,MJ,w0,MJ,wy,MJ,hJ,MJ,k1,MJ,hU,MJ,jf,MJ,kS,MJ,mo,MJ,jn,MJ,iP,MJ,id,MJ,h0,MJ,gR,MJ,jo,MJ,ma,MJ,hX,MJ,uN,MJ,ys,MJ,II,MJ,wp,MJ,lI,MJ,gk,MJ,kG,MJ,jE,MJ,hA,MJ,ye,MJ,w_,MJ,na,MJ,lc,MJ,d$,MJ,jp,MJ,w7,MJ,js,MJ,dH,MJ,hK,MJ,xs,MJ,no,MJ,DM,MJ,nI,MJ,lZ,MJ,wx,MJ,m1,MJ,wA,MJ,ec,MJ,lR,MJ,kh,MJ,iL,MJ,jJ,MJ,mk,MJ,m9,MJ,np,MJ,kf,MJ,vH,MJ,jk,MJ,hI,MJ,x6,MJ,Ew,MJ,f1,MJ,jV,MJ,t1,MJ,dS,MJ,ek,MJ,eK,MJ,nA,MJ,ku,MJ,x5,MJ,l7,MJ,l5,MJ,dT,MJ,mD,MJ,wo,MJ,xD,MJ,hB,MJ,nT,MJ,kF,MJ,eb,MJ,hH,MJ,j5,MJ,mf,MJ,n0,MJ,lm,MJ,g8,MJ,wK,MJ,lO,MJ,jD,MJ,Eg,MJ,dx,MJ,CU,MJ,vO,MJ,f3,MJ,hn,MJ,jU,MJ,iT,MJ,l8,MJ,xX,MJ,lS,MJ,m8,MJ,hO,MJ,kD,MJ,jK,MJ,mi,MJ,kE,MJ,ir,MJ,iq,MJ,IS,MJ,xf,MJ,i5,MJ,kt,MJ,fQ,MJ,mp,MJ,lz,MJ,yp,MJ,ea,MJ,gO,MJ,vP,MJ,l_,MJ,IM,MJ,eT,MJ,i7,MJ,wq,MJ,wI,MJ,hk,MJ,fR,MJ,iO,MJ,C$,MJ,gj,MJ,yr,MJ,ej,MJ,eL,MJ,yA,MJ,lx,MJ,hD,MJ,h4,MJ,ip,MJ,m$,MJ,k2,MJ,jv,MJ,n3,MJ,ie,MJ,jB,MJ,jG,MJ,wg,MJ,hV,MJ,ly,MJ,pK,MJ,hx,MJ,kw,MJ,jx,MJ,IU,MJ,hG,MJ,lL,MJ,ic,MJ,ib,MJ,ht,MJ,lk,MJ,k0,MJ,jy,MJ,fO,MJ,je,MJ,IK,MJ,jS,MJ,ki,MJ,jm,MJ,wZ,MJ,j6,MJ,lP,MJ,kU,MJ,lM,MJ,Ei,MJ,pL,MJ,v7,MJ,fl,MJ,jc,MJ,yz,MJ,eI,MJ,h_,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ,MJ];var cV=[MK,MK,J2,MK,J3,MK,MK,MK];var cW=[ML,ML,CL,ML];var cX=[MM,MM,LG,MM,Iu,MM,LH,MM,LI,MM,MM,MM,MM,MM,MM,MM];var cY=[MN,MN,IP,MN,E7,MN,Kl,MN,I4,MN,Jc,MN,Jx,MN,Jm,MN,Kp,MN,Jj,MN,i3,MN,Ju,MN,Fc,MN,IZ,MN,I1,MN,I9,MN];var cZ=[MO,MO,DD,MO,k4,MO,eN,MO,ey,MO,Bt,MO,BL,MO,su,MO,nt,MO,gT,MO,wM,MO,o6,MO,ps,MO,Bd,MO,lp,MO,go,MO,Au,MO,BV,MO,lo,MO,v9,MO,kI,MO,xQ,MO,BD,MO,kb,MO,j8,MO,nd,MO,Bb,MO,wU,MO,iA,MO,AW,MO,Bi,MO,lf,MO,AX,MO,Ax,MO,DU,MO,x9,MO,AN,MO,vI,MO,Bg,MO,v1,MO,w1,MO,DN,MO,AK,MO,dM,MO,Bf,MO,DH,MO,H1,MO,AD,MO,AY,MO,AS,MO,Bh,MO,ig,MO,dW,MO,w2,MO,xR,MO,it,MO,At,MO,nM,MO,Bq,MO,yu,MO,kW,MO,BO,MO,Ak,MO,xb,MO,BA,MO,A9,MO,BC,MO,v0,MO,Bm,MO,Br,MO,ha,MO,jO,MO,AP,MO,LK,MO,A_,MO,BE,MO,AT,MO,AI,MO,k5,MO,An,MO,AG,MO,lB,MO,ok,MO,Bp,MO,Ao,MO,Bo,MO,yD,MO,fg,MO,yC,MO,Be,MO,Ay,MO,A1,MO,wL,MO,le,MO,wi,MO,nV,MO,lA,MO,wB,MO,BQ,MO,kk,MO,i2,MO,Bv,MO,ya,MO,AL,MO,Bz,MO,xk,MO,ky,MO,kx,MO,lY,MO,Ap,MO,A2,MO,xa,MO,Bc,MO,AM,MO,Aj,MO,Bx,MO,n4,MO,xv,MO,AA,MO,mK,MO,yj,MO,nC,MO,BH,MO,BF,MO,AJ,MO,jW,MO,Dz,MO,kH,MO,xu,MO,kj,MO,Ir,MO,m3,MO,Bj,MO,kX,MO,ih,MO,nL,MO,wt,MO,A$,MO,rB,MO,jX,MO,BR,MO,xj,MO,AR,MO,BX,MO,wC,MO,x_,MO,xm,MO,BB,MO,yi,MO,mG,MO,wj,MO,Bu,MO,BP,MO,BG,MO,vJ,MO,yt,MO,is,MO,A0,MO,eX,MO,fT,MO,n5,MO,A3,MO,Am,MO,d4,MO,Bs,MO,Bw,MO,f5,MO,pt,MO,BS,MO,Bk,MO,AF,MO,A4,MO,en,MO,m2,MO,Dv,MO,ez,MO,AE,MO,AB,MO,BI,MO,As,MO,wa,MO,Ai,MO,ee,MO,wV,MO,eM,MO,Av,MO,ix,MO,gg,MO,Ba,MO,x$,MO,BW,MO,Bl,MO,BK,MO,dX,MO,gv,MO,g9,MO,ws,MO,eo,MO,dL,MO,gp,MO,Al,MO,AV,MO,gD,MO,ed,MO,A5,MO,mQ,MO,gW,MO,gS,MO,Az,MO,eW,MO,mF,MO,uu,MO,AZ,MO,BJ,MO,DA,MO,BN,MO,Aw,MO,BT,MO,BM,MO,AO,MO,AH,MO,x8,MO,AQ,MO,By,MO,Ah,MO,AC,MO,nD,MO,xI,MO,pf,MO,BU,MO,Bn,MO,fS,MO,m4,MO,nW,MO,f4,MO,dw,MO,E_,MO,j7,MO,vT,MO,vS,MO,tu,MO,nc,MO,AU,MO,xH,MO,d3,MO,ns,MO,MO,MO,MO,MO,MO,MO,MO,MO,MO,MO,MO,MO,MO,MO,MO,MO,MO,MO,MO,MO];var c_=[MP,MP,LL,MP,K6,MP,LM,MP,LN,MP,LO,MP,MP,MP,MP,MP];var c$=[MQ,MQ,Jq,MQ,I0,MQ,Js,MQ,I$,MQ,Jf,MQ,I7,MQ,Jh,MQ,I8,MQ,MQ,MQ,MQ,MQ,MQ,MQ,MQ,MQ,MQ,MQ,MQ,MQ,MQ,MQ];var c0=[MR,MR,J7,MR,J9,MR,J8,MR,IG,MR,iY,MR,IH,MR,IF,MR,Km,MR,FD,MR,iZ,MR,J5,MR,EF,MR,Gg,MR,J6,MR,uA,MR,LJ,MR,ff,MR,IN,MR,Kk,MR,Ka,MR,IX,MR,i_,MR,uO,MR,MR,MR,MR,MR,MR,MR,MR,MR,MR,MR,MR,MR,MR,MR,MR,MR];var c1=[MS,MS,wD,MS,iU,MS,mW,MS,gl,MS,xz,MS,Fd,MS,Eo,MS,mI,MS,E8,MS,fD,MS,KL,MS,KM,MS,Ea,MS,yl,MS,xy,MS,ts,MS,pH,MS,pe,MS,yF,MS,o8,MS,fd,MS,pu,MS,iz,MS,KK,MS,xx,MS,iF,MS,t4,MS,ij,MS,iu,MS,MS,MS,MS,MS];return{_memcmp:Lc,_strlen:Le,_free:KW,_realloc:KY,_memmove:Lb,__GLOBAL__I_a:Df,_memset:Ld,_malloc:KV,_memcpy:La,_sass_compile_unrolled:CM,_strcpy:Lf,_calloc:KX,runPostSets:di,stackAlloc:c2,stackSave:c3,stackRestore:c4,setThrew:c5,setTempRet0:c8,setTempRet1:c9,setTempRet2:da,setTempRet3:db,setTempRet4:dc,setTempRet5:dd,setTempRet6:de,setTempRet7:df,setTempRet8:dg,setTempRet9:dh,dynCall_iiiiiiii:LP,dynCall_iiiiiiddi:LQ,dynCall_viiiii:LR,dynCall_vi:LS,dynCall_vii:LT,dynCall_iiiiiii:LU,dynCall_ii:LV,dynCall_viiiddddi:LW,dynCall_iddddiii:LX,dynCall_iiiiiiiiiiii:LY,dynCall_vidi:LZ,dynCall_iiii:L_,dynCall_viiiiiiiiiiiiiii:L$,dynCall_viiiiid:L0,dynCall_viiiiiiii:L1,dynCall_viiiiii:L2,dynCall_ddd:L3,dynCall_fiii:L4,dynCall_viiidi:L5,dynCall_iid:L6,dynCall_viiiiiii:L7,dynCall_viiiiiid:L8,dynCall_viiiiiiiii:L9,dynCall_viiiiiiiiii:Ma,dynCall_iii:Mb,dynCall_diii:Mc,dynCall_dii:Md,dynCall_i:Me,dynCall_iiiiii:Mf,dynCall_viii:Mg,dynCall_v:Mh,dynCall_iiiiiiiii:Mi,dynCall_iiiii:Mj,dynCall_viiii:Mk}})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_iiiiiiii": invoke_iiiiiiii, "invoke_iiiiiiddi": invoke_iiiiiiddi, "invoke_viiiii": invoke_viiiii, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_iiiiiii": invoke_iiiiiii, "invoke_ii": invoke_ii, "invoke_viiiddddi": invoke_viiiddddi, "invoke_iddddiii": invoke_iddddiii, "invoke_iiiiiiiiiiii": invoke_iiiiiiiiiiii, "invoke_vidi": invoke_vidi, "invoke_iiii": invoke_iiii, "invoke_viiiiiiiiiiiiiii": invoke_viiiiiiiiiiiiiii, "invoke_viiiiid": invoke_viiiiid, "invoke_viiiiiiii": invoke_viiiiiiii, "invoke_viiiiii": invoke_viiiiii, "invoke_ddd": invoke_ddd, "invoke_fiii": invoke_fiii, "invoke_viiidi": invoke_viiidi, "invoke_iid": invoke_iid, "invoke_viiiiiii": invoke_viiiiiii, "invoke_viiiiiid": invoke_viiiiiid, "invoke_viiiiiiiii": invoke_viiiiiiiii, "invoke_viiiiiiiiii": invoke_viiiiiiiiii, "invoke_iii": invoke_iii, "invoke_diii": invoke_diii, "invoke_dii": invoke_dii, "invoke_i": invoke_i, "invoke_iiiiii": invoke_iiiiii, "invoke_viii": invoke_viii, "invoke_v": invoke_v, "invoke_iiiiiiiii": invoke_iiiiiiiii, "invoke_iiiii": invoke_iiiii, "invoke_viiii": invoke_viiii, "_llvm_lifetime_end": _llvm_lifetime_end, "_lseek": _lseek, "__scanString": __scanString, "_fclose": _fclose, "_pthread_mutex_lock": _pthread_mutex_lock, "___cxa_end_catch": ___cxa_end_catch, "_strtoull": _strtoull, "_fflush": _fflush, "_strtol": _strtol, "__isLeapYear": __isLeapYear, "_fwrite": _fwrite, "_send": _send, "_isspace": _isspace, "_read": _read, "_ceil": _ceil, "_fsync": _fsync, "___cxa_guard_abort": ___cxa_guard_abort, "_newlocale": _newlocale, "___gxx_personality_v0": ___gxx_personality_v0, "_pthread_cond_wait": _pthread_cond_wait, "___cxa_rethrow": ___cxa_rethrow, "_fmod": _fmod, "___resumeException": ___resumeException, "_llvm_va_end": _llvm_va_end, "_vsscanf": _vsscanf, "_snprintf": _snprintf, "_fgetc": _fgetc, "__getFloat": __getFloat, "_atexit": _atexit, "___cxa_free_exception": ___cxa_free_exception, "_close": _close, "___setErrNo": ___setErrNo, "_isxdigit": _isxdigit, "_ftell": _ftell, "_exit": _exit, "_sprintf": _sprintf, "_asprintf": _asprintf, "___ctype_b_loc": ___ctype_b_loc, "_freelocale": _freelocale, "_catgets": _catgets, "___cxa_is_number_type": ___cxa_is_number_type, "_getcwd": _getcwd, "___cxa_does_inherit": ___cxa_does_inherit, "___cxa_guard_acquire": ___cxa_guard_acquire, "___cxa_begin_catch": ___cxa_begin_catch, "_recv": _recv, "__parseInt64": __parseInt64, "__ZSt18uncaught_exceptionv": __ZSt18uncaught_exceptionv, "___cxa_call_unexpected": ___cxa_call_unexpected, "__exit": __exit, "_strftime": _strftime, "___cxa_throw": ___cxa_throw, "_llvm_eh_exception": _llvm_eh_exception, "_toupper": _toupper, "_pread": _pread, "_fopen": _fopen, "_open": _open, "__arraySum": __arraySum, "_isalnum": _isalnum, "_isalpha": _isalpha, "___cxa_find_matching_catch": ___cxa_find_matching_catch, "_strdup": _strdup, "__formatString": __formatString, "_pthread_cond_broadcast": _pthread_cond_broadcast, "__ZSt9terminatev": __ZSt9terminatev, "_isascii": _isascii, "_pthread_mutex_unlock": _pthread_mutex_unlock, "_sbrk": _sbrk, "___errno_location": ___errno_location, "_strerror": _strerror, "_catclose": _catclose, "_llvm_lifetime_start": _llvm_lifetime_start, "__parseInt": __parseInt, "___cxa_guard_release": ___cxa_guard_release, "_ungetc": _ungetc, "_uselocale": _uselocale, "_vsnprintf": _vsnprintf, "_sscanf": _sscanf, "_sysconf": _sysconf, "_fread": _fread, "_abort": _abort, "_isdigit": _isdigit, "_strtoll": _strtoll, "__addDays": __addDays, "_fabs": _fabs, "_floor": _floor, "__reallyNegative": __reallyNegative, "_fseek": _fseek, "___cxa_bad_typeid": ___cxa_bad_typeid, "_write": _write, "___cxa_allocate_exception": ___cxa_allocate_exception, "_stat": _stat, "___cxa_pure_virtual": ___cxa_pure_virtual, "_vasprintf": _vasprintf, "_catopen": _catopen, "___ctype_toupper_loc": ___ctype_toupper_loc, "___ctype_tolower_loc": ___ctype_tolower_loc, "_llvm_eh_typeid_for": _llvm_eh_typeid_for, "_pwrite": _pwrite, "_strerror_r": _strerror_r, "_time": _time, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "cttz_i8": cttz_i8, "ctlz_i8": ctlz_i8, "NaN": NaN, "Infinity": Infinity, "__ZTVN10__cxxabiv117__class_type_infoE": __ZTVN10__cxxabiv117__class_type_infoE, "___fsmu8": ___fsmu8, "__ZTIc": __ZTIc, "_stdout": _stdout, "__ZTVN10__cxxabiv119__pointer_type_infoE": __ZTVN10__cxxabiv119__pointer_type_infoE, "___dso_handle": ___dso_handle, "_stdin": _stdin, "__ZTVN10__cxxabiv120__si_class_type_infoE": __ZTVN10__cxxabiv120__si_class_type_infoE, "_stderr": _stderr }, buffer);
var _memcmp = Module["_memcmp"] = asm["_memcmp"];
var _strlen = Module["_strlen"] = asm["_strlen"];
var _free = Module["_free"] = asm["_free"];
var _realloc = Module["_realloc"] = asm["_realloc"];
var _memmove = Module["_memmove"] = asm["_memmove"];
var __GLOBAL__I_a = Module["__GLOBAL__I_a"] = asm["__GLOBAL__I_a"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _sass_compile_unrolled = Module["_sass_compile_unrolled"] = asm["_sass_compile_unrolled"];
var _strcpy = Module["_strcpy"] = asm["_strcpy"];
var _calloc = Module["_calloc"] = asm["_calloc"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_iiiiiiii = Module["dynCall_iiiiiiii"] = asm["dynCall_iiiiiiii"];
var dynCall_iiiiiiddi = Module["dynCall_iiiiiiddi"] = asm["dynCall_iiiiiiddi"];
var dynCall_viiiii = Module["dynCall_viiiii"] = asm["dynCall_viiiii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
var dynCall_iiiiiii = Module["dynCall_iiiiiii"] = asm["dynCall_iiiiiii"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_viiiddddi = Module["dynCall_viiiddddi"] = asm["dynCall_viiiddddi"];
var dynCall_iddddiii = Module["dynCall_iddddiii"] = asm["dynCall_iddddiii"];
var dynCall_iiiiiiiiiiii = Module["dynCall_iiiiiiiiiiii"] = asm["dynCall_iiiiiiiiiiii"];
var dynCall_vidi = Module["dynCall_vidi"] = asm["dynCall_vidi"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_viiiiiiiiiiiiiii = Module["dynCall_viiiiiiiiiiiiiii"] = asm["dynCall_viiiiiiiiiiiiiii"];
var dynCall_viiiiid = Module["dynCall_viiiiid"] = asm["dynCall_viiiiid"];
var dynCall_viiiiiiii = Module["dynCall_viiiiiiii"] = asm["dynCall_viiiiiiii"];
var dynCall_viiiiii = Module["dynCall_viiiiii"] = asm["dynCall_viiiiii"];
var dynCall_ddd = Module["dynCall_ddd"] = asm["dynCall_ddd"];
var dynCall_fiii = Module["dynCall_fiii"] = asm["dynCall_fiii"];
var dynCall_viiidi = Module["dynCall_viiidi"] = asm["dynCall_viiidi"];
var dynCall_iid = Module["dynCall_iid"] = asm["dynCall_iid"];
var dynCall_viiiiiii = Module["dynCall_viiiiiii"] = asm["dynCall_viiiiiii"];
var dynCall_viiiiiid = Module["dynCall_viiiiiid"] = asm["dynCall_viiiiiid"];
var dynCall_viiiiiiiii = Module["dynCall_viiiiiiiii"] = asm["dynCall_viiiiiiiii"];
var dynCall_viiiiiiiiii = Module["dynCall_viiiiiiiiii"] = asm["dynCall_viiiiiiiiii"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_diii = Module["dynCall_diii"] = asm["dynCall_diii"];
var dynCall_dii = Module["dynCall_dii"] = asm["dynCall_dii"];
var dynCall_i = Module["dynCall_i"] = asm["dynCall_i"];
var dynCall_iiiiii = Module["dynCall_iiiiii"] = asm["dynCall_iiiiii"];
var dynCall_viii = Module["dynCall_viii"] = asm["dynCall_viii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_iiiiiiiii = Module["dynCall_iiiiiiiii"] = asm["dynCall_iiiiiiiii"];
var dynCall_iiiii = Module["dynCall_iiiii"] = asm["dynCall_iiiii"];
var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];
Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };
// TODO: strip out parts of this we do not need
//======= begin closure i64 code =======
// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
/**
 * @fileoverview Defines a Long class for representing a 64-bit two's-complement
 * integer value, which faithfully simulates the behavior of a Java "long". This
 * implementation is derived from LongLib in GWT.
 *
 */
var i64Math = (function() { // Emscripten wrapper
  var goog = { math: {} };
  /**
   * Constructs a 64-bit two's-complement integer, given its low and high 32-bit
   * values as *signed* integers.  See the from* functions below for more
   * convenient ways of constructing Longs.
   *
   * The internal representation of a long is the two given signed, 32-bit values.
   * We use 32-bit pieces because these are the size of integers on which
   * Javascript performs bit-operations.  For operations like addition and
   * multiplication, we split each number into 16-bit pieces, which can easily be
   * multiplied within Javascript's floating-point representation without overflow
   * or change in sign.
   *
   * In the algorithms below, we frequently reduce the negative case to the
   * positive case by negating the input(s) and then post-processing the result.
   * Note that we must ALWAYS check specially whether those values are MIN_VALUE
   * (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
   * a positive number, it overflows back into a negative).  Not handling this
   * case would often result in infinite recursion.
   *
   * @param {number} low  The low (signed) 32 bits of the long.
   * @param {number} high  The high (signed) 32 bits of the long.
   * @constructor
   */
  goog.math.Long = function(low, high) {
    /**
     * @type {number}
     * @private
     */
    this.low_ = low | 0;  // force into 32 signed bits.
    /**
     * @type {number}
     * @private
     */
    this.high_ = high | 0;  // force into 32 signed bits.
  };
  // NOTE: Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the
  // from* methods on which they depend.
  /**
   * A cache of the Long representations of small integer values.
   * @type {!Object}
   * @private
   */
  goog.math.Long.IntCache_ = {};
  /**
   * Returns a Long representing the given (32-bit) integer value.
   * @param {number} value The 32-bit integer in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromInt = function(value) {
    if (-128 <= value && value < 128) {
      var cachedObj = goog.math.Long.IntCache_[value];
      if (cachedObj) {
        return cachedObj;
      }
    }
    var obj = new goog.math.Long(value | 0, value < 0 ? -1 : 0);
    if (-128 <= value && value < 128) {
      goog.math.Long.IntCache_[value] = obj;
    }
    return obj;
  };
  /**
   * Returns a Long representing the given value, provided that it is a finite
   * number.  Otherwise, zero is returned.
   * @param {number} value The number in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromNumber = function(value) {
    if (isNaN(value) || !isFinite(value)) {
      return goog.math.Long.ZERO;
    } else if (value <= -goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MIN_VALUE;
    } else if (value + 1 >= goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MAX_VALUE;
    } else if (value < 0) {
      return goog.math.Long.fromNumber(-value).negate();
    } else {
      return new goog.math.Long(
          (value % goog.math.Long.TWO_PWR_32_DBL_) | 0,
          (value / goog.math.Long.TWO_PWR_32_DBL_) | 0);
    }
  };
  /**
   * Returns a Long representing the 64-bit integer that comes by concatenating
   * the given high and low bits.  Each is assumed to use 32 bits.
   * @param {number} lowBits The low 32-bits.
   * @param {number} highBits The high 32-bits.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromBits = function(lowBits, highBits) {
    return new goog.math.Long(lowBits, highBits);
  };
  /**
   * Returns a Long representation of the given string, written using the given
   * radix.
   * @param {string} str The textual representation of the Long.
   * @param {number=} opt_radix The radix in which the text is written.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromString = function(str, opt_radix) {
    if (str.length == 0) {
      throw Error('number format error: empty string');
    }
    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }
    if (str.charAt(0) == '-') {
      return goog.math.Long.fromString(str.substring(1), radix).negate();
    } else if (str.indexOf('-') >= 0) {
      throw Error('number format error: interior "-" character: ' + str);
    }
    // Do several (8) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 8));
    var result = goog.math.Long.ZERO;
    for (var i = 0; i < str.length; i += 8) {
      var size = Math.min(8, str.length - i);
      var value = parseInt(str.substring(i, i + size), radix);
      if (size < 8) {
        var power = goog.math.Long.fromNumber(Math.pow(radix, size));
        result = result.multiply(power).add(goog.math.Long.fromNumber(value));
      } else {
        result = result.multiply(radixToPower);
        result = result.add(goog.math.Long.fromNumber(value));
      }
    }
    return result;
  };
  // NOTE: the compiler should inline these constant values below and then remove
  // these variables, so there should be no runtime penalty for these.
  /**
   * Number used repeated below in calculations.  This must appear before the
   * first call to any from* function below.
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_16_DBL_ = 1 << 16;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_24_DBL_ = 1 << 24;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_32_DBL_ =
      goog.math.Long.TWO_PWR_16_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_31_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ / 2;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_48_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_64_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_32_DBL_;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_63_DBL_ =
      goog.math.Long.TWO_PWR_64_DBL_ / 2;
  /** @type {!goog.math.Long} */
  goog.math.Long.ZERO = goog.math.Long.fromInt(0);
  /** @type {!goog.math.Long} */
  goog.math.Long.ONE = goog.math.Long.fromInt(1);
  /** @type {!goog.math.Long} */
  goog.math.Long.NEG_ONE = goog.math.Long.fromInt(-1);
  /** @type {!goog.math.Long} */
  goog.math.Long.MAX_VALUE =
      goog.math.Long.fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0);
  /** @type {!goog.math.Long} */
  goog.math.Long.MIN_VALUE = goog.math.Long.fromBits(0, 0x80000000 | 0);
  /**
   * @type {!goog.math.Long}
   * @private
   */
  goog.math.Long.TWO_PWR_24_ = goog.math.Long.fromInt(1 << 24);
  /** @return {number} The value, assuming it is a 32-bit integer. */
  goog.math.Long.prototype.toInt = function() {
    return this.low_;
  };
  /** @return {number} The closest floating-point representation to this value. */
  goog.math.Long.prototype.toNumber = function() {
    return this.high_ * goog.math.Long.TWO_PWR_32_DBL_ +
           this.getLowBitsUnsigned();
  };
  /**
   * @param {number=} opt_radix The radix in which the text should be written.
   * @return {string} The textual representation of this value.
   */
  goog.math.Long.prototype.toString = function(opt_radix) {
    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }
    if (this.isZero()) {
      return '0';
    }
    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        // We need to change the Long value before it can be negated, so we remove
        // the bottom-most digit in this base and then recurse to do the rest.
        var radixLong = goog.math.Long.fromNumber(radix);
        var div = this.div(radixLong);
        var rem = div.multiply(radixLong).subtract(this);
        return div.toString(radix) + rem.toInt().toString(radix);
      } else {
        return '-' + this.negate().toString(radix);
      }
    }
    // Do several (6) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 6));
    var rem = this;
    var result = '';
    while (true) {
      var remDiv = rem.div(radixToPower);
      var intval = rem.subtract(remDiv.multiply(radixToPower)).toInt();
      var digits = intval.toString(radix);
      rem = remDiv;
      if (rem.isZero()) {
        return digits + result;
      } else {
        while (digits.length < 6) {
          digits = '0' + digits;
        }
        result = '' + digits + result;
      }
    }
  };
  /** @return {number} The high 32-bits as a signed value. */
  goog.math.Long.prototype.getHighBits = function() {
    return this.high_;
  };
  /** @return {number} The low 32-bits as a signed value. */
  goog.math.Long.prototype.getLowBits = function() {
    return this.low_;
  };
  /** @return {number} The low 32-bits as an unsigned value. */
  goog.math.Long.prototype.getLowBitsUnsigned = function() {
    return (this.low_ >= 0) ?
        this.low_ : goog.math.Long.TWO_PWR_32_DBL_ + this.low_;
  };
  /**
   * @return {number} Returns the number of bits needed to represent the absolute
   *     value of this Long.
   */
  goog.math.Long.prototype.getNumBitsAbs = function() {
    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        return 64;
      } else {
        return this.negate().getNumBitsAbs();
      }
    } else {
      var val = this.high_ != 0 ? this.high_ : this.low_;
      for (var bit = 31; bit > 0; bit--) {
        if ((val & (1 << bit)) != 0) {
          break;
        }
      }
      return this.high_ != 0 ? bit + 33 : bit + 1;
    }
  };
  /** @return {boolean} Whether this value is zero. */
  goog.math.Long.prototype.isZero = function() {
    return this.high_ == 0 && this.low_ == 0;
  };
  /** @return {boolean} Whether this value is negative. */
  goog.math.Long.prototype.isNegative = function() {
    return this.high_ < 0;
  };
  /** @return {boolean} Whether this value is odd. */
  goog.math.Long.prototype.isOdd = function() {
    return (this.low_ & 1) == 1;
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long equals the other.
   */
  goog.math.Long.prototype.equals = function(other) {
    return (this.high_ == other.high_) && (this.low_ == other.low_);
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long does not equal the other.
   */
  goog.math.Long.prototype.notEquals = function(other) {
    return (this.high_ != other.high_) || (this.low_ != other.low_);
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than the other.
   */
  goog.math.Long.prototype.lessThan = function(other) {
    return this.compare(other) < 0;
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than or equal to the other.
   */
  goog.math.Long.prototype.lessThanOrEqual = function(other) {
    return this.compare(other) <= 0;
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than the other.
   */
  goog.math.Long.prototype.greaterThan = function(other) {
    return this.compare(other) > 0;
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than or equal to the other.
   */
  goog.math.Long.prototype.greaterThanOrEqual = function(other) {
    return this.compare(other) >= 0;
  };
  /**
   * Compares this Long with the given one.
   * @param {goog.math.Long} other Long to compare against.
   * @return {number} 0 if they are the same, 1 if the this is greater, and -1
   *     if the given one is greater.
   */
  goog.math.Long.prototype.compare = function(other) {
    if (this.equals(other)) {
      return 0;
    }
    var thisNeg = this.isNegative();
    var otherNeg = other.isNegative();
    if (thisNeg && !otherNeg) {
      return -1;
    }
    if (!thisNeg && otherNeg) {
      return 1;
    }
    // at this point, the signs are the same, so subtraction will not overflow
    if (this.subtract(other).isNegative()) {
      return -1;
    } else {
      return 1;
    }
  };
  /** @return {!goog.math.Long} The negation of this value. */
  goog.math.Long.prototype.negate = function() {
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.MIN_VALUE;
    } else {
      return this.not().add(goog.math.Long.ONE);
    }
  };
  /**
   * Returns the sum of this and the given Long.
   * @param {goog.math.Long} other Long to add to this one.
   * @return {!goog.math.Long} The sum of this and the given Long.
   */
  goog.math.Long.prototype.add = function(other) {
    // Divide each number into 4 chunks of 16 bits, and then sum the chunks.
    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;
    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;
    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 + b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };
  /**
   * Returns the difference of this and the given Long.
   * @param {goog.math.Long} other Long to subtract from this.
   * @return {!goog.math.Long} The difference of this and the given Long.
   */
  goog.math.Long.prototype.subtract = function(other) {
    return this.add(other.negate());
  };
  /**
   * Returns the product of this and the given long.
   * @param {goog.math.Long} other Long to multiply with this.
   * @return {!goog.math.Long} The product of this and the other.
   */
  goog.math.Long.prototype.multiply = function(other) {
    if (this.isZero()) {
      return goog.math.Long.ZERO;
    } else if (other.isZero()) {
      return goog.math.Long.ZERO;
    }
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return other.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return this.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    }
    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().multiply(other.negate());
      } else {
        return this.negate().multiply(other).negate();
      }
    } else if (other.isNegative()) {
      return this.multiply(other.negate()).negate();
    }
    // If both longs are small, use float multiplication
    if (this.lessThan(goog.math.Long.TWO_PWR_24_) &&
        other.lessThan(goog.math.Long.TWO_PWR_24_)) {
      return goog.math.Long.fromNumber(this.toNumber() * other.toNumber());
    }
    // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
    // We can skip products that would overflow.
    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;
    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;
    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };
  /**
   * Returns this Long divided by the given one.
   * @param {goog.math.Long} other Long by which to divide.
   * @return {!goog.math.Long} This Long divided by the given one.
   */
  goog.math.Long.prototype.div = function(other) {
    if (other.isZero()) {
      throw Error('division by zero');
    } else if (this.isZero()) {
      return goog.math.Long.ZERO;
    }
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      if (other.equals(goog.math.Long.ONE) ||
          other.equals(goog.math.Long.NEG_ONE)) {
        return goog.math.Long.MIN_VALUE;  // recall that -MIN_VALUE == MIN_VALUE
      } else if (other.equals(goog.math.Long.MIN_VALUE)) {
        return goog.math.Long.ONE;
      } else {
        // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
        var halfThis = this.shiftRight(1);
        var approx = halfThis.div(other).shiftLeft(1);
        if (approx.equals(goog.math.Long.ZERO)) {
          return other.isNegative() ? goog.math.Long.ONE : goog.math.Long.NEG_ONE;
        } else {
          var rem = this.subtract(other.multiply(approx));
          var result = approx.add(rem.div(other));
          return result;
        }
      }
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.ZERO;
    }
    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().div(other.negate());
      } else {
        return this.negate().div(other).negate();
      }
    } else if (other.isNegative()) {
      return this.div(other.negate()).negate();
    }
    // Repeat the following until the remainder is less than other:  find a
    // floating-point that approximates remainder / other *from below*, add this
    // into the result, and subtract it from the remainder.  It is critical that
    // the approximate value is less than or equal to the real value so that the
    // remainder never becomes negative.
    var res = goog.math.Long.ZERO;
    var rem = this;
    while (rem.greaterThanOrEqual(other)) {
      // Approximate the result of division. This may be a little greater or
      // smaller than the actual value.
      var approx = Math.max(1, Math.floor(rem.toNumber() / other.toNumber()));
      // We will tweak the approximate result by changing it in the 48-th digit or
      // the smallest non-fractional digit, whichever is larger.
      var log2 = Math.ceil(Math.log(approx) / Math.LN2);
      var delta = (log2 <= 48) ? 1 : Math.pow(2, log2 - 48);
      // Decrease the approximation until it is smaller than the remainder.  Note
      // that if it is too large, the product overflows and is negative.
      var approxRes = goog.math.Long.fromNumber(approx);
      var approxRem = approxRes.multiply(other);
      while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
        approx -= delta;
        approxRes = goog.math.Long.fromNumber(approx);
        approxRem = approxRes.multiply(other);
      }
      // We know the answer can't be zero... and actually, zero would cause
      // infinite recursion since we would make no progress.
      if (approxRes.isZero()) {
        approxRes = goog.math.Long.ONE;
      }
      res = res.add(approxRes);
      rem = rem.subtract(approxRem);
    }
    return res;
  };
  /**
   * Returns this Long modulo the given one.
   * @param {goog.math.Long} other Long by which to mod.
   * @return {!goog.math.Long} This Long modulo the given one.
   */
  goog.math.Long.prototype.modulo = function(other) {
    return this.subtract(this.div(other).multiply(other));
  };
  /** @return {!goog.math.Long} The bitwise-NOT of this value. */
  goog.math.Long.prototype.not = function() {
    return goog.math.Long.fromBits(~this.low_, ~this.high_);
  };
  /**
   * Returns the bitwise-AND of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to AND.
   * @return {!goog.math.Long} The bitwise-AND of this and the other.
   */
  goog.math.Long.prototype.and = function(other) {
    return goog.math.Long.fromBits(this.low_ & other.low_,
                                   this.high_ & other.high_);
  };
  /**
   * Returns the bitwise-OR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to OR.
   * @return {!goog.math.Long} The bitwise-OR of this and the other.
   */
  goog.math.Long.prototype.or = function(other) {
    return goog.math.Long.fromBits(this.low_ | other.low_,
                                   this.high_ | other.high_);
  };
  /**
   * Returns the bitwise-XOR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to XOR.
   * @return {!goog.math.Long} The bitwise-XOR of this and the other.
   */
  goog.math.Long.prototype.xor = function(other) {
    return goog.math.Long.fromBits(this.low_ ^ other.low_,
                                   this.high_ ^ other.high_);
  };
  /**
   * Returns this Long with bits shifted to the left by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the left by the given amount.
   */
  goog.math.Long.prototype.shiftLeft = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var low = this.low_;
      if (numBits < 32) {
        var high = this.high_;
        return goog.math.Long.fromBits(
            low << numBits,
            (high << numBits) | (low >>> (32 - numBits)));
      } else {
        return goog.math.Long.fromBits(0, low << (numBits - 32));
      }
    }
  };
  /**
   * Returns this Long with bits shifted to the right by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount.
   */
  goog.math.Long.prototype.shiftRight = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >> numBits);
      } else {
        return goog.math.Long.fromBits(
            high >> (numBits - 32),
            high >= 0 ? 0 : -1);
      }
    }
  };
  /**
   * Returns this Long with bits shifted to the right by the given amount, with
   * the new top bits matching the current sign bit.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount, with
   *     zeros placed into the new leading bits.
   */
  goog.math.Long.prototype.shiftRightUnsigned = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >>> numBits);
      } else if (numBits == 32) {
        return goog.math.Long.fromBits(high, 0);
      } else {
        return goog.math.Long.fromBits(high >>> (numBits - 32), 0);
      }
    }
  };
  //======= begin jsbn =======
  var navigator = { appName: 'Modern Browser' }; // polyfill a little
  // Copyright (c) 2005  Tom Wu
  // All Rights Reserved.
  // http://www-cs-students.stanford.edu/~tjw/jsbn/
  /*
   * Copyright (c) 2003-2005  Tom Wu
   * All Rights Reserved.
   *
   * Permission is hereby granted, free of charge, to any person obtaining
   * a copy of this software and associated documentation files (the
   * "Software"), to deal in the Software without restriction, including
   * without limitation the rights to use, copy, modify, merge, publish,
   * distribute, sublicense, and/or sell copies of the Software, and to
   * permit persons to whom the Software is furnished to do so, subject to
   * the following conditions:
   *
   * The above copyright notice and this permission notice shall be
   * included in all copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND, 
   * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY 
   * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.  
   *
   * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
   * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
   * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
   * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
   * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   * In addition, the following condition applies:
   *
   * All redistributions must retain an intact copy of this copyright notice
   * and disclaimer.
   */
  // Basic JavaScript BN library - subset useful for RSA encryption.
  // Bits per digit
  var dbits;
  // JavaScript engine analysis
  var canary = 0xdeadbeefcafe;
  var j_lm = ((canary&0xffffff)==0xefcafe);
  // (public) Constructor
  function BigInteger(a,b,c) {
    if(a != null)
      if("number" == typeof a) this.fromNumber(a,b,c);
      else if(b == null && "string" != typeof a) this.fromString(a,256);
      else this.fromString(a,b);
  }
  // return new, unset BigInteger
  function nbi() { return new BigInteger(null); }
  // am: Compute w_j += (x*this_i), propagate carries,
  // c is initial carry, returns final carry.
  // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
  // We need to select the fastest one that works in this environment.
  // am1: use a single mult and divide to get the high bits,
  // max digit bits should be 26 because
  // max internal value = 2*dvalue^2-2*dvalue (< 2^53)
  function am1(i,x,w,j,c,n) {
    while(--n >= 0) {
      var v = x*this[i++]+w[j]+c;
      c = Math.floor(v/0x4000000);
      w[j++] = v&0x3ffffff;
    }
    return c;
  }
  // am2 avoids a big mult-and-extract completely.
  // Max digit bits should be <= 30 because we do bitwise ops
  // on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
  function am2(i,x,w,j,c,n) {
    var xl = x&0x7fff, xh = x>>15;
    while(--n >= 0) {
      var l = this[i]&0x7fff;
      var h = this[i++]>>15;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x7fff)<<15)+w[j]+(c&0x3fffffff);
      c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
      w[j++] = l&0x3fffffff;
    }
    return c;
  }
  // Alternately, set max digit bits to 28 since some
  // browsers slow down when dealing with 32-bit numbers.
  function am3(i,x,w,j,c,n) {
    var xl = x&0x3fff, xh = x>>14;
    while(--n >= 0) {
      var l = this[i]&0x3fff;
      var h = this[i++]>>14;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x3fff)<<14)+w[j]+c;
      c = (l>>28)+(m>>14)+xh*h;
      w[j++] = l&0xfffffff;
    }
    return c;
  }
  if(j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
    BigInteger.prototype.am = am2;
    dbits = 30;
  }
  else if(j_lm && (navigator.appName != "Netscape")) {
    BigInteger.prototype.am = am1;
    dbits = 26;
  }
  else { // Mozilla/Netscape seems to prefer am3
    BigInteger.prototype.am = am3;
    dbits = 28;
  }
  BigInteger.prototype.DB = dbits;
  BigInteger.prototype.DM = ((1<<dbits)-1);
  BigInteger.prototype.DV = (1<<dbits);
  var BI_FP = 52;
  BigInteger.prototype.FV = Math.pow(2,BI_FP);
  BigInteger.prototype.F1 = BI_FP-dbits;
  BigInteger.prototype.F2 = 2*dbits-BI_FP;
  // Digit conversions
  var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
  var BI_RC = new Array();
  var rr,vv;
  rr = "0".charCodeAt(0);
  for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
  rr = "a".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  rr = "A".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  function int2char(n) { return BI_RM.charAt(n); }
  function intAt(s,i) {
    var c = BI_RC[s.charCodeAt(i)];
    return (c==null)?-1:c;
  }
  // (protected) copy this to r
  function bnpCopyTo(r) {
    for(var i = this.t-1; i >= 0; --i) r[i] = this[i];
    r.t = this.t;
    r.s = this.s;
  }
  // (protected) set from integer value x, -DV <= x < DV
  function bnpFromInt(x) {
    this.t = 1;
    this.s = (x<0)?-1:0;
    if(x > 0) this[0] = x;
    else if(x < -1) this[0] = x+DV;
    else this.t = 0;
  }
  // return bigint initialized to value
  function nbv(i) { var r = nbi(); r.fromInt(i); return r; }
  // (protected) set from string and radix
  function bnpFromString(s,b) {
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 256) k = 8; // byte array
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else { this.fromRadix(s,b); return; }
    this.t = 0;
    this.s = 0;
    var i = s.length, mi = false, sh = 0;
    while(--i >= 0) {
      var x = (k==8)?s[i]&0xff:intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-") mi = true;
        continue;
      }
      mi = false;
      if(sh == 0)
        this[this.t++] = x;
      else if(sh+k > this.DB) {
        this[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
        this[this.t++] = (x>>(this.DB-sh));
      }
      else
        this[this.t-1] |= x<<sh;
      sh += k;
      if(sh >= this.DB) sh -= this.DB;
    }
    if(k == 8 && (s[0]&0x80) != 0) {
      this.s = -1;
      if(sh > 0) this[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
    }
    this.clamp();
    if(mi) BigInteger.ZERO.subTo(this,this);
  }
  // (protected) clamp off excess high words
  function bnpClamp() {
    var c = this.s&this.DM;
    while(this.t > 0 && this[this.t-1] == c) --this.t;
  }
  // (public) return string representation in given radix
  function bnToString(b) {
    if(this.s < 0) return "-"+this.negate().toString(b);
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else return this.toRadix(b);
    var km = (1<<k)-1, d, m = false, r = "", i = this.t;
    var p = this.DB-(i*this.DB)%k;
    if(i-- > 0) {
      if(p < this.DB && (d = this[i]>>p) > 0) { m = true; r = int2char(d); }
      while(i >= 0) {
        if(p < k) {
          d = (this[i]&((1<<p)-1))<<(k-p);
          d |= this[--i]>>(p+=this.DB-k);
        }
        else {
          d = (this[i]>>(p-=k))&km;
          if(p <= 0) { p += this.DB; --i; }
        }
        if(d > 0) m = true;
        if(m) r += int2char(d);
      }
    }
    return m?r:"0";
  }
  // (public) -this
  function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }
  // (public) |this|
  function bnAbs() { return (this.s<0)?this.negate():this; }
  // (public) return + if this > a, - if this < a, 0 if equal
  function bnCompareTo(a) {
    var r = this.s-a.s;
    if(r != 0) return r;
    var i = this.t;
    r = i-a.t;
    if(r != 0) return (this.s<0)?-r:r;
    while(--i >= 0) if((r=this[i]-a[i]) != 0) return r;
    return 0;
  }
  // returns bit length of the integer x
  function nbits(x) {
    var r = 1, t;
    if((t=x>>>16) != 0) { x = t; r += 16; }
    if((t=x>>8) != 0) { x = t; r += 8; }
    if((t=x>>4) != 0) { x = t; r += 4; }
    if((t=x>>2) != 0) { x = t; r += 2; }
    if((t=x>>1) != 0) { x = t; r += 1; }
    return r;
  }
  // (public) return the number of bits in "this"
  function bnBitLength() {
    if(this.t <= 0) return 0;
    return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM));
  }
  // (protected) r = this << n*DB
  function bnpDLShiftTo(n,r) {
    var i;
    for(i = this.t-1; i >= 0; --i) r[i+n] = this[i];
    for(i = n-1; i >= 0; --i) r[i] = 0;
    r.t = this.t+n;
    r.s = this.s;
  }
  // (protected) r = this >> n*DB
  function bnpDRShiftTo(n,r) {
    for(var i = n; i < this.t; ++i) r[i-n] = this[i];
    r.t = Math.max(this.t-n,0);
    r.s = this.s;
  }
  // (protected) r = this << n
  function bnpLShiftTo(n,r) {
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<cbs)-1;
    var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
    for(i = this.t-1; i >= 0; --i) {
      r[i+ds+1] = (this[i]>>cbs)|c;
      c = (this[i]&bm)<<bs;
    }
    for(i = ds-1; i >= 0; --i) r[i] = 0;
    r[ds] = c;
    r.t = this.t+ds+1;
    r.s = this.s;
    r.clamp();
  }
  // (protected) r = this >> n
  function bnpRShiftTo(n,r) {
    r.s = this.s;
    var ds = Math.floor(n/this.DB);
    if(ds >= this.t) { r.t = 0; return; }
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<bs)-1;
    r[0] = this[ds]>>bs;
    for(var i = ds+1; i < this.t; ++i) {
      r[i-ds-1] |= (this[i]&bm)<<cbs;
      r[i-ds] = this[i]>>bs;
    }
    if(bs > 0) r[this.t-ds-1] |= (this.s&bm)<<cbs;
    r.t = this.t-ds;
    r.clamp();
  }
  // (protected) r = this - a
  function bnpSubTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]-a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c -= a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c -= a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c -= a.s;
    }
    r.s = (c<0)?-1:0;
    if(c < -1) r[i++] = this.DV+c;
    else if(c > 0) r[i++] = c;
    r.t = i;
    r.clamp();
  }
  // (protected) r = this * a, r != this,a (HAC 14.12)
  // "this" should be the larger one if appropriate.
  function bnpMultiplyTo(a,r) {
    var x = this.abs(), y = a.abs();
    var i = x.t;
    r.t = i+y.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < y.t; ++i) r[i+x.t] = x.am(0,y[i],r,i,0,x.t);
    r.s = 0;
    r.clamp();
    if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
  }
  // (protected) r = this^2, r != this (HAC 14.16)
  function bnpSquareTo(r) {
    var x = this.abs();
    var i = r.t = 2*x.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < x.t-1; ++i) {
      var c = x.am(i,x[i],r,2*i,0,1);
      if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
        r[i+x.t] -= x.DV;
        r[i+x.t+1] = 1;
      }
    }
    if(r.t > 0) r[r.t-1] += x.am(i,x[i],r,2*i,0,1);
    r.s = 0;
    r.clamp();
  }
  // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
  // r != q, this != m.  q or r may be null.
  function bnpDivRemTo(m,q,r) {
    var pm = m.abs();
    if(pm.t <= 0) return;
    var pt = this.abs();
    if(pt.t < pm.t) {
      if(q != null) q.fromInt(0);
      if(r != null) this.copyTo(r);
      return;
    }
    if(r == null) r = nbi();
    var y = nbi(), ts = this.s, ms = m.s;
    var nsh = this.DB-nbits(pm[pm.t-1]);	// normalize modulus
    if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
    else { pm.copyTo(y); pt.copyTo(r); }
    var ys = y.t;
    var y0 = y[ys-1];
    if(y0 == 0) return;
    var yt = y0*(1<<this.F1)+((ys>1)?y[ys-2]>>this.F2:0);
    var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
    var i = r.t, j = i-ys, t = (q==null)?nbi():q;
    y.dlShiftTo(j,t);
    if(r.compareTo(t) >= 0) {
      r[r.t++] = 1;
      r.subTo(t,r);
    }
    BigInteger.ONE.dlShiftTo(ys,t);
    t.subTo(y,y);	// "negative" y so we can replace sub with am later
    while(y.t < ys) y[y.t++] = 0;
    while(--j >= 0) {
      // Estimate quotient digit
      var qd = (r[--i]==y0)?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);
      if((r[i]+=y.am(0,qd,r,j,0,ys)) < qd) {	// Try it out
        y.dlShiftTo(j,t);
        r.subTo(t,r);
        while(r[i] < --qd) r.subTo(t,r);
      }
    }
    if(q != null) {
      r.drShiftTo(ys,q);
      if(ts != ms) BigInteger.ZERO.subTo(q,q);
    }
    r.t = ys;
    r.clamp();
    if(nsh > 0) r.rShiftTo(nsh,r);	// Denormalize remainder
    if(ts < 0) BigInteger.ZERO.subTo(r,r);
  }
  // (public) this mod a
  function bnMod(a) {
    var r = nbi();
    this.abs().divRemTo(a,null,r);
    if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
    return r;
  }
  // Modular reduction using "classic" algorithm
  function Classic(m) { this.m = m; }
  function cConvert(x) {
    if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
    else return x;
  }
  function cRevert(x) { return x; }
  function cReduce(x) { x.divRemTo(this.m,null,x); }
  function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
  function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }
  Classic.prototype.convert = cConvert;
  Classic.prototype.revert = cRevert;
  Classic.prototype.reduce = cReduce;
  Classic.prototype.mulTo = cMulTo;
  Classic.prototype.sqrTo = cSqrTo;
  // (protected) return "-1/this % 2^DB"; useful for Mont. reduction
  // justification:
  //         xy == 1 (mod m)
  //         xy =  1+km
  //   xy(2-xy) = (1+km)(1-km)
  // x[y(2-xy)] = 1-k^2m^2
  // x[y(2-xy)] == 1 (mod m^2)
  // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
  // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
  // JS multiply "overflows" differently from C/C++, so care is needed here.
  function bnpInvDigit() {
    if(this.t < 1) return 0;
    var x = this[0];
    if((x&1) == 0) return 0;
    var y = x&3;		// y == 1/x mod 2^2
    y = (y*(2-(x&0xf)*y))&0xf;	// y == 1/x mod 2^4
    y = (y*(2-(x&0xff)*y))&0xff;	// y == 1/x mod 2^8
    y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;	// y == 1/x mod 2^16
    // last step - calculate inverse mod DV directly;
    // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
    y = (y*(2-x*y%this.DV))%this.DV;		// y == 1/x mod 2^dbits
    // we really want the negative inverse, and -DV < y < DV
    return (y>0)?this.DV-y:-y;
  }
  // Montgomery reduction
  function Montgomery(m) {
    this.m = m;
    this.mp = m.invDigit();
    this.mpl = this.mp&0x7fff;
    this.mph = this.mp>>15;
    this.um = (1<<(m.DB-15))-1;
    this.mt2 = 2*m.t;
  }
  // xR mod m
  function montConvert(x) {
    var r = nbi();
    x.abs().dlShiftTo(this.m.t,r);
    r.divRemTo(this.m,null,r);
    if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
    return r;
  }
  // x/R mod m
  function montRevert(x) {
    var r = nbi();
    x.copyTo(r);
    this.reduce(r);
    return r;
  }
  // x = x/R mod m (HAC 14.32)
  function montReduce(x) {
    while(x.t <= this.mt2)	// pad x so am has enough room later
      x[x.t++] = 0;
    for(var i = 0; i < this.m.t; ++i) {
      // faster way of calculating u0 = x[i]*mp mod DV
      var j = x[i]&0x7fff;
      var u0 = (j*this.mpl+(((j*this.mph+(x[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
      // use am to combine the multiply-shift-add into one call
      j = i+this.m.t;
      x[j] += this.m.am(0,u0,x,i,0,this.m.t);
      // propagate carry
      while(x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
    }
    x.clamp();
    x.drShiftTo(this.m.t,x);
    if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
  }
  // r = "x^2/R mod m"; x != r
  function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }
  // r = "xy/R mod m"; x,y != r
  function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
  Montgomery.prototype.convert = montConvert;
  Montgomery.prototype.revert = montRevert;
  Montgomery.prototype.reduce = montReduce;
  Montgomery.prototype.mulTo = montMulTo;
  Montgomery.prototype.sqrTo = montSqrTo;
  // (protected) true iff this is even
  function bnpIsEven() { return ((this.t>0)?(this[0]&1):this.s) == 0; }
  // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
  function bnpExp(e,z) {
    if(e > 0xffffffff || e < 1) return BigInteger.ONE;
    var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
    g.copyTo(r);
    while(--i >= 0) {
      z.sqrTo(r,r2);
      if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
      else { var t = r; r = r2; r2 = t; }
    }
    return z.revert(r);
  }
  // (public) this^e % m, 0 <= e < 2^32
  function bnModPowInt(e,m) {
    var z;
    if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
    return this.exp(e,z);
  }
  // protected
  BigInteger.prototype.copyTo = bnpCopyTo;
  BigInteger.prototype.fromInt = bnpFromInt;
  BigInteger.prototype.fromString = bnpFromString;
  BigInteger.prototype.clamp = bnpClamp;
  BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
  BigInteger.prototype.drShiftTo = bnpDRShiftTo;
  BigInteger.prototype.lShiftTo = bnpLShiftTo;
  BigInteger.prototype.rShiftTo = bnpRShiftTo;
  BigInteger.prototype.subTo = bnpSubTo;
  BigInteger.prototype.multiplyTo = bnpMultiplyTo;
  BigInteger.prototype.squareTo = bnpSquareTo;
  BigInteger.prototype.divRemTo = bnpDivRemTo;
  BigInteger.prototype.invDigit = bnpInvDigit;
  BigInteger.prototype.isEven = bnpIsEven;
  BigInteger.prototype.exp = bnpExp;
  // public
  BigInteger.prototype.toString = bnToString;
  BigInteger.prototype.negate = bnNegate;
  BigInteger.prototype.abs = bnAbs;
  BigInteger.prototype.compareTo = bnCompareTo;
  BigInteger.prototype.bitLength = bnBitLength;
  BigInteger.prototype.mod = bnMod;
  BigInteger.prototype.modPowInt = bnModPowInt;
  // "constants"
  BigInteger.ZERO = nbv(0);
  BigInteger.ONE = nbv(1);
  // jsbn2 stuff
  // (protected) convert from radix string
  function bnpFromRadix(s,b) {
    this.fromInt(0);
    if(b == null) b = 10;
    var cs = this.chunkSize(b);
    var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
    for(var i = 0; i < s.length; ++i) {
      var x = intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
        continue;
      }
      w = b*w+x;
      if(++j >= cs) {
        this.dMultiply(d);
        this.dAddOffset(w,0);
        j = 0;
        w = 0;
      }
    }
    if(j > 0) {
      this.dMultiply(Math.pow(b,j));
      this.dAddOffset(w,0);
    }
    if(mi) BigInteger.ZERO.subTo(this,this);
  }
  // (protected) return x s.t. r^x < DV
  function bnpChunkSize(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }
  // (public) 0 if this == 0, 1 if this > 0
  function bnSigNum() {
    if(this.s < 0) return -1;
    else if(this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
    else return 1;
  }
  // (protected) this *= n, this >= 0, 1 < n < DV
  function bnpDMultiply(n) {
    this[this.t] = this.am(0,n-1,this,0,0,this.t);
    ++this.t;
    this.clamp();
  }
  // (protected) this += n << w words, this >= 0
  function bnpDAddOffset(n,w) {
    if(n == 0) return;
    while(this.t <= w) this[this.t++] = 0;
    this[w] += n;
    while(this[w] >= this.DV) {
      this[w] -= this.DV;
      if(++w >= this.t) this[this.t++] = 0;
      ++this[w];
    }
  }
  // (protected) convert to radix string
  function bnpToRadix(b) {
    if(b == null) b = 10;
    if(this.signum() == 0 || b < 2 || b > 36) return "0";
    var cs = this.chunkSize(b);
    var a = Math.pow(b,cs);
    var d = nbv(a), y = nbi(), z = nbi(), r = "";
    this.divRemTo(d,y,z);
    while(y.signum() > 0) {
      r = (a+z.intValue()).toString(b).substr(1) + r;
      y.divRemTo(d,y,z);
    }
    return z.intValue().toString(b) + r;
  }
  // (public) return value as integer
  function bnIntValue() {
    if(this.s < 0) {
      if(this.t == 1) return this[0]-this.DV;
      else if(this.t == 0) return -1;
    }
    else if(this.t == 1) return this[0];
    else if(this.t == 0) return 0;
    // assumes 16 < DB < 32
    return ((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0];
  }
  // (protected) r = this + a
  function bnpAddTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]+a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c += a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c += a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += a.s;
    }
    r.s = (c<0)?-1:0;
    if(c > 0) r[i++] = c;
    else if(c < -1) r[i++] = this.DV+c;
    r.t = i;
    r.clamp();
  }
  BigInteger.prototype.fromRadix = bnpFromRadix;
  BigInteger.prototype.chunkSize = bnpChunkSize;
  BigInteger.prototype.signum = bnSigNum;
  BigInteger.prototype.dMultiply = bnpDMultiply;
  BigInteger.prototype.dAddOffset = bnpDAddOffset;
  BigInteger.prototype.toRadix = bnpToRadix;
  BigInteger.prototype.intValue = bnIntValue;
  BigInteger.prototype.addTo = bnpAddTo;
  //======= end jsbn =======
  // Emscripten wrapper
  var Wrapper = {
    abs: function(l, h) {
      var x = new goog.math.Long(l, h);
      var ret;
      if (x.isNegative()) {
        ret = x.negate();
      } else {
        ret = x;
      }
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
    },
    ensureTemps: function() {
      if (Wrapper.ensuredTemps) return;
      Wrapper.ensuredTemps = true;
      Wrapper.two32 = new BigInteger();
      Wrapper.two32.fromString('4294967296', 10);
      Wrapper.two64 = new BigInteger();
      Wrapper.two64.fromString('18446744073709551616', 10);
      Wrapper.temp1 = new BigInteger();
      Wrapper.temp2 = new BigInteger();
    },
    lh2bignum: function(l, h) {
      var a = new BigInteger();
      a.fromString(h.toString(), 10);
      var b = new BigInteger();
      a.multiplyTo(Wrapper.two32, b);
      var c = new BigInteger();
      c.fromString(l.toString(), 10);
      var d = new BigInteger();
      c.addTo(b, d);
      return d;
    },
    stringify: function(l, h, unsigned) {
      var ret = new goog.math.Long(l, h).toString();
      if (unsigned && ret[0] == '-') {
        // unsign slowly using jsbn bignums
        Wrapper.ensureTemps();
        var bignum = new BigInteger();
        bignum.fromString(ret, 10);
        ret = new BigInteger();
        Wrapper.two64.addTo(bignum, ret);
        ret = ret.toString(10);
      }
      return ret;
    },
    fromString: function(str, base, min, max, unsigned) {
      Wrapper.ensureTemps();
      var bignum = new BigInteger();
      bignum.fromString(str, base);
      var bigmin = new BigInteger();
      bigmin.fromString(min, 10);
      var bigmax = new BigInteger();
      bigmax.fromString(max, 10);
      if (unsigned && bignum.compareTo(BigInteger.ZERO) < 0) {
        var temp = new BigInteger();
        bignum.addTo(Wrapper.two64, temp);
        bignum = temp;
      }
      var error = false;
      if (bignum.compareTo(bigmin) < 0) {
        bignum = bigmin;
        error = true;
      } else if (bignum.compareTo(bigmax) > 0) {
        bignum = bigmax;
        error = true;
      }
      var ret = goog.math.Long.fromString(bignum.toString()); // min-max checks should have clamped this to a range goog.math.Long can handle well
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
      if (error) throw 'range error';
    }
  };
  return Wrapper;
})();
//======= end closure i64 code =======
// === Auto-generated postamble setup entry stuff ===
if (memoryInitializer) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
  }
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    applyData(Module['readBinary'](memoryInitializer));
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      applyData(data);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}
function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;
var initialStackTop;
var preloadStartTime = null;
var calledMain = false;
dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun'] && shouldRunNow) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}
Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');
  args = args || [];
  if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
    Module.printErr('preload time: ' + (Date.now() - preloadStartTime) + ' ms');
  }
  ensureInitRuntime();
  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);
  initialStackTop = STACKTOP;
  try {
    var ret = Module['_main'](argc, argv, 0);
    // if we're not running an evented main loop, it's time to exit
    if (!Module['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}
function run(args) {
  args = args || Module['arguments'];
  if (preloadStartTime === null) preloadStartTime = Date.now();
  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }
  preRun();
  if (runDependencies > 0) {
    // a preRun added a dependency, run will be called later
    return;
  }
  function doRun() {
    ensureInitRuntime();
    preMain();
    Module['calledRun'] = true;
    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }
    postRun();
  }
  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;
function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;
  // exit the runtime
  exitRuntime();
  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371
  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;
function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }
  ABORT = true;
  EXITSTATUS = 1;
  throw 'abort() at ' + stackTrace();
}
Module['abort'] = Module.abort = abort;
// {{PRE_RUN_ADDITIONS}}
if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}
// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}
run();
// {{POST_RUN_ADDITIONS}}
// {{MODULE_ADDITIONS}}