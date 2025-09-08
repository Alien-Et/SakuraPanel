var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var { exit, platform, nextTick } = getBuiltinModule(
  "node:process"
);
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  nextTick
});
var {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  finalization,
  features,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  on,
  off,
  once,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// utils/response.js
function createHTMLResponse(\u5185\u5BB9, \u72B6\u6001\u7801 = 200) {
  return new Response(\u5185\u5BB9, {
    status: \u72B6\u6001\u7801,
    headers: {
      "Content-Type": "text/html;charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"
    }
  });
}
__name(createHTMLResponse, "createHTMLResponse");
function createRedirectResponse(\u8DEF\u5F84, \u989D\u5916\u5934 = {}) {
  return new Response(null, {
    status: 302,
    headers: {
      "Location": \u8DEF\u5F84,
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      ...\u989D\u5916\u5934
    }
  });
}
__name(createRedirectResponse, "createRedirectResponse");
function createJSONResponse(\u6570\u636E, \u72B6\u6001\u7801 = 200, \u989D\u5916\u5934 = {}) {
  return new Response(JSON.stringify(\u6570\u636E), {
    status: \u72B6\u6001\u7801,
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      ...\u989D\u5916\u5934
    }
  });
}
__name(createJSONResponse, "createJSONResponse");

// utils/auth.js
async function checkLock(env2, \u8BBE\u5907\u6807\u8BC6, \u9501\u5B9A\u65F6\u95F4) {
  const \u9501\u5B9A\u65F6\u95F4\u6233 = await env2.KV\u6570\u636E\u5E93.get(`lock_${\u8BBE\u5907\u6807\u8BC6}`);
  const \u5F53\u524D\u65F6\u95F4 = Date.now();
  const \u88AB\u9501\u5B9A = \u9501\u5B9A\u65F6\u95F4\u6233 && \u5F53\u524D\u65F6\u95F4 < Number(\u9501\u5B9A\u65F6\u95F4\u6233);
  return {
    \u88AB\u9501\u5B9A,
    \u5269\u4F59\u65F6\u95F4: \u88AB\u9501\u5B9A ? Math.ceil((Number(\u9501\u5B9A\u65F6\u95F4\u6233) - \u5F53\u524D\u65F6\u95F4) / 1e3) : 0
  };
}
__name(checkLock, "checkLock");
function generateLoginRegisterPage(\u7C7B\u578B, \u989D\u5916\u53C2\u6570 = {}, \u767D\u5929\u80CC\u666F\u56FE, \u6697\u9ED1\u80CC\u666F\u56FE) {
  const \u754C\u9762\u6570\u636E = {
    \u6CE8\u518C: {
      title: "\u{1F338}\u9996\u6B21\u4F7F\u7528\u6CE8\u518C\u{1F338}",
      \u8868\u5355: `
        <form class="auth-form" action="/register/submit" method="POST" enctype="application/x-www-form-urlencoded">
          <input type="text" name="username" placeholder="\u8BBE\u7F6E\u8D26\u53F7" required pattern="^[a-zA-Z0-9]{4,20}$" title="4-20\u4F4D\u5B57\u6BCD\u6570\u5B57">
          <input type="password" name="password" placeholder="\u8BBE\u7F6E\u5BC6\u7801" required minlength="6">
          <input type="password" name="confirm" placeholder="\u786E\u8BA4\u5BC6\u7801" required>
          <button type="submit">\u7ACB\u5373\u6CE8\u518C</button>
        </form>
        ${\u989D\u5916\u53C2\u6570.\u9519\u8BEF\u4FE1\u606F ? `<div class="error-message">${\u989D\u5916\u53C2\u6570.\u9519\u8BEF\u4FE1\u606F}</div>` : ""}
      `
    },
    \u767B\u5F55: {
      title: "\u{1F338}\u6B22\u8FCE\u56DE\u6765\u{1F338}",
      \u8868\u5355: `
        <form class="auth-form" action="/login/submit" method="POST" enctype="application/x-www-form-urlencoded">
          <input type="text" name="username" placeholder="\u767B\u5F55\u8D26\u53F7" required>
          <input type="password" name="password" placeholder="\u767B\u5F55\u5BC6\u7801" required>
          <button type="submit" id="loginButton" ${\u989D\u5916\u53C2\u6570.\u9501\u5B9A\u72B6\u6001 ? "disabled" : ""}>\u7ACB\u5373\u767B\u5F55</button>
        </form>
        ${\u989D\u5916\u53C2\u6570.\u8F93\u9519\u5BC6\u7801 ? `<div class="error-message">\u5BC6\u7801\u9519\u8BEF\uFF0C\u5269\u4F59\u5C1D\u8BD5\u6B21\u6570\uFF1A${\u989D\u5916\u53C2\u6570.\u5269\u4F59\u6B21\u6570}</div>` : ""}
        ${\u989D\u5916\u53C2\u6570.\u9501\u5B9A\u72B6\u6001 ? `
          <div class="lock-message">
            \u8D26\u6237\u9501\u5B9A\uFF0C\u8BF7<span id="countdown">${\u989D\u5916\u53C2\u6570.\u5269\u4F59\u65F6\u95F4}</span>\u79D2\u540E\u91CD\u8BD5
          </div>` : ""}
        ${\u989D\u5916\u53C2\u6570.\u9519\u8BEF\u4FE1\u606F ? `<div class="error-message">${\u989D\u5916\u53C2\u6570.\u9519\u8BEF\u4FE1\u606F}</div>` : ""}
      `
    }
  };
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Comic Sans MS', 'Arial', sans-serif;
      color: #ff6f91;
      margin: 0;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      overflow: hidden;
      transition: background 0.5s ease;
    }
    @media (prefers-color-scheme: light) {
      body { background: linear-gradient(135deg, #ffe6f0, #fff0f5); }
      .auth-container { background: rgba(255, 245, 247, 0.9); box-shadow: 0 8px 20px rgba(255, 182, 193, 0.3); }
    }
    @media (prefers-color-scheme: dark) {
      body { background: linear-gradient(135deg, #1e1e2f, #2a2a3b); }
      .auth-container { background: rgba(30, 30, 30, 0.9); color: #ffd1dc; box-shadow: 0 8px 20px rgba(255, 133, 162, 0.2); }
    }
    .background-media {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: -1;
      transition: opacity 0.5s ease;
    }
    .auth-container {
      padding: 30px;
      border-radius: 25px;
      max-width: 400px;
      width: 90%;
      text-align: center;
      position: relative;
      z-index: 1;
    }
    h1 {
      font-size: 1.8em;
      color: #ff69b4;
      margin-bottom: 20px;
      text-shadow: 1px 1px 3px rgba(255, 105, 180, 0.2);
    }
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 15px;
      width: 100%;
      max-width: 300px;
      margin: 0 auto;
    }
    .auth-form input {
      padding: 12px;
      border-radius: 15px;
      border: 2px solid #ffb6c1;
      font-size: 1em;
      width: 100%;
      box-sizing: border-box;
    }
    .auth-form button {
      padding: 12px;
      background: linear-gradient(to right, #ffb6c1, #ff69b4);
      color: white;
      border: none;
      border-radius: 20px;
      cursor: pointer;
      font-size: 1em;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .auth-form button:hover {
      transform: scale(1.05);
      box-shadow: 0 5px 15px rgba(255, 105, 180, 0.4);
    }
    .auth-form button:active {
      transform: scale(0.95);
    }
    .auth-form button:disabled {
      background: #ccc;
      cursor: not-allowed;
      box-shadow: none;
      transform: none;
    }
    .error-message {
      color: #ff6666;
      margin-top: 15px;
      font-size: 0.9em;
    }
    .lock-message {
      color: #ff6666;
      margin-top: 20px;
      font-size: 1.1em;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
    }
    #countdown {
      color: #ff1493;
      font-weight: bold;
      min-width: 50px;
      text-align: center;
    }
    @media (max-width: 600px) {
      .auth-container { padding: 20px; }
      h1 { font-size: 1.5em; }
      .auth-form input, .auth-form button { padding: 10px; font-size: 0.95em; }
    }
  </style>
</head>
<body>
  <img id="backgroundImage" class="background-media">
  <div class="auth-container">
    <h1>${\u754C\u9762\u6570\u636E[\u7C7B\u578B].title}</h1>
    ${\u754C\u9762\u6570\u636E[\u7C7B\u578B].\u8868\u5355}
  </div>
  <script>
    const lightBg = '${\u767D\u5929\u80CC\u666F\u56FE}';
    const darkBg = '${\u6697\u9ED1\u80CC\u666F\u56FE}';
    const bgImage = document.getElementById('backgroundImage');

    function updateBackground() {
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      bgImage.src = isDarkMode ? darkBg : lightBg;
      bgImage.onerror = () => { bgImage.style.display = 'none'; };
    }
    updateBackground();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateBackground);

    // \u5012\u8BA1\u65F6\u903B\u8F91
    let remainingTime = ${\u989D\u5916\u53C2\u6570.\u9501\u5B9A\u72B6\u6001 ? \u989D\u5916\u53C2\u6570.\u5269\u4F59\u65F6\u95F4 : 0};
    const countdownElement = document.getElementById('countdown');
    const loginButton = document.getElementById('loginButton');

    function startCountdown() {
      if (!countdownElement) return;

      const interval = setInterval(() => {
        if (remainingTime <= 0) {
          clearInterval(interval);
          countdownElement.textContent = '0';
          loginButton.disabled = false;
          document.querySelector('.lock-message').textContent = '\u9501\u5B9A\u5DF2\u89E3\u9664\uFF0C\u8BF7\u91CD\u65B0\u5C1D\u8BD5\u767B\u5F55';
          fetch('/reset-login-failures', { method: 'POST' });
          return;
        }
        countdownElement.textContent = remainingTime;
        remainingTime--;
      }, 1000);
    }

    function syncWithServer() {
      fetch('/check-lock')
        .then(response => response.json())
        .then(data => {
          if (data.locked) {
            remainingTime = data.remainingTime;
            countdownElement.textContent = remainingTime;
            loginButton.disabled = true;
          } else {
            remainingTime = 0;
            countdownElement.textContent = '0';
            loginButton.disabled = false;
            document.querySelector('.lock-message').textContent = '\u9501\u5B9A\u5DF2\u89E3\u9664\uFF0C\u8BF7\u91CD\u65B0\u5C1D\u8BD5\u767B\u5F55';
          }
        })
        .catch(error => {
          console.error('\u540C\u6B65\u9501\u5B9A\u72B6\u6001\u5931\u8D25:', error);
        });
    }

    if (${\u989D\u5916\u53C2\u6570.\u9501\u5B9A\u72B6\u6001}) {
      startCountdown();
      setInterval(syncWithServer, 10000);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          syncWithServer();
        }
      });
    }

    // \u9632\u6B62 UA \u5207\u6362\u89E6\u53D1\u8868\u5355\u63D0\u4EA4
    document.querySelector('.auth-form')?.addEventListener('submit', function(event) {
      if (!event.isTrusted) {
        event.preventDefault();
        console.log('\u963B\u6B62\u975E\u7528\u6237\u89E6\u53D1\u7684\u8868\u5355\u63D0\u4EA4');
      }
    });

    // \u76D1\u542C UA \u53D8\u5316\u5E76\u5E73\u6ED1\u5904\u7406
    let lastUA = navigator.userAgent;
    function checkUAChange() {
      const currentUA = navigator.userAgent;
      if (currentUA !== lastUA) {
        console.log('UA \u5DF2\u5207\u6362\uFF0C\u4ECE', lastUA, '\u5230', currentUA);
        lastUA = currentUA;
      }
    }
    setInterval(checkUAChange, 500);
  <\/script>
</body>
</html>
  `;
}
__name(generateLoginRegisterPage, "generateLoginRegisterPage");
async function encryptPassword(\u5BC6\u7801) {
  const encoder = new TextEncoder();
  const data = encoder.encode(\u5BC6\u7801);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(encryptPassword, "encryptPassword");

// utils/nodes.js
async function getOrInitializeUUID(env2) {
  let uuid = await env2.KV\u6570\u636E\u5E93.get("current_uuid");
  if (!uuid) {
    uuid = generateUUID();
    await env2.KV\u6570\u636E\u5E93.put("current_uuid", uuid);
  }
  return uuid;
}
__name(getOrInitializeUUID, "getOrInitializeUUID");
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}
__name(generateUUID, "generateUUID");
async function loadNodesAndConfig(env2, hostName, preferredNodes, nodeName) {
  try {
    const nodePathsCache = await env2.KV\u6570\u636E\u5E93.get("node_file_paths");
    let nodeFilePaths = nodePathsCache ? JSON.parse(nodePathsCache) : ["https://raw.githubusercontent.com/Alien-Et/SakuraPanel/refs/heads/main/ips.txt", "https://raw.githubusercontent.com/Alien-Et/SakuraPanel/refs/heads/main/url.txt"];
    const manualNodesCache = await env2.KV\u6570\u636E\u5E93.get("manual_preferred_ips");
    let manualNodeList = [];
    if (manualNodesCache) {
      manualNodeList = JSON.parse(manualNodesCache).map((line) => line.trim()).filter(Boolean);
    }
    const responseList = await Promise.all(
      nodeFilePaths.map(async (\u8DEF\u5F84) => {
        try {
          const response = await fetch(\u8DEF\u5F84);
          if (!response.ok) throw new Error(`\u8BF7\u6C42 ${\u8DEF\u5F84} \u5931\u8D25\uFF0C\u72B6\u6001\u7801: ${response.status}`);
          const text = await response.text();
          return text.split("\n").map((line) => line.trim()).filter(Boolean);
        } catch (\u9519\u8BEF) {
          console.error(`\u62C9\u53D6 ${\u8DEF\u5F84} \u5931\u8D25: ${\u9519\u8BEF.message}`);
          return [];
        }
      })
    );
    const domainNodeList = [...new Set(responseList.flat())];
    const mergedNodeList = [.../* @__PURE__ */ new Set([...manualNodeList, ...domainNodeList])];
    const cachedNodes = await env2.KV\u6570\u636E\u5E93.get("ip_preferred_ips");
    const currentNodeList = cachedNodes ? JSON.parse(cachedNodes) : [];
    const listsAreSame = JSON.stringify(mergedNodeList) === JSON.stringify(currentNodeList);
    if (mergedNodeList.length > 0) {
      preferredNodes.length = 0;
      mergedNodeList.forEach((node) => preferredNodes.push(node));
      if (!listsAreSame) {
        const newVersion = String(Date.now());
        await env2.KV\u6570\u636E\u5E93.put("ip_preferred_ips", JSON.stringify(mergedNodeList));
        await env2.KV\u6570\u636E\u5E93.put("ip_preferred_ips_version", newVersion);
      }
    } else {
      preferredNodes.length = 0;
      (currentNodeList.length > 0 ? currentNodeList : [`${hostName}:443`]).forEach((node) => preferredNodes.push(node));
    }
    await env2.KV\u6570\u636E\u5E93.put("node_file_paths", JSON.stringify(nodeFilePaths));
  } catch (\u9519\u8BEF) {
    const cachedNodes = await env2.KV\u6570\u636E\u5E93.get("ip_preferred_ips");
    preferredNodes.length = 0;
    (cachedNodes ? JSON.parse(cachedNodes) : [`${hostName}:443`]).forEach((node) => preferredNodes.push(node));
    await env2.KV\u6570\u636E\u5E93.put("ip_error_log", JSON.stringify({ time: Date.now(), error: "\u6240\u6709\u8DEF\u5F84\u62C9\u53D6\u5931\u8D25\u6216\u624B\u52A8\u4E0A\u4F20\u4E3A\u7A7A" }), { expirationTtl: 86400 });
  }
}
__name(loadNodesAndConfig, "loadNodesAndConfig");
async function getConfig(env2, type, hostName, generateConfigFunction) {
  const cacheKey = type === atob("Y2xhc2g=") ? "config_" + atob("Y2xhc2g=") : "config_" + atob("djJyYXk=");
  const versionKey = `${cacheKey}_version`;
  const cachedConfig = await env2.KV\u6570\u636E\u5E93.get(cacheKey);
  const configVersion = await env2.KV\u6570\u636E\u5E93.get(versionKey) || "0";
  const nodeVersion = await env2.KV\u6570\u636E\u5E93.get("ip_preferred_ips_version") || "0";
  if (cachedConfig && configVersion === nodeVersion) {
    return cachedConfig;
  }
  const newConfig = await generateConfigFunction(env2, hostName);
  await env2.KV\u6570\u636E\u5E93.put(cacheKey, newConfig);
  await env2.KV\u6570\u636E\u5E93.put(versionKey, nodeVersion);
  return newConfig;
}
__name(getConfig, "getConfig");

// utils/generate.js
async function generateCatConfig(env2, hostName) {
  try {
    const cachedNodes = await env2.KV\u6570\u636E\u5E93.get("ip_preferred_ips");
    const nodes = cachedNodes ? JSON.parse(cachedNodes) : [];
    const currentNodeList = nodes.length > 0 ? nodes : [`${hostName}:443`];
    const uuid = await env2.KV\u6570\u636E\u5E93.get("current_uuid");
    const domain2 = hostName.replace(/^[^.]+\./, "");
    const port = "443";
    const countryMap = /* @__PURE__ */ new Map();
    currentNodeList.forEach((node, index) => {
      let country = "CN";
      let nodeName = node;
      if (node.includes("|")) {
        const parts = node.split("|");
        nodeName = parts[0];
        if (parts.length > 1) {
          country = parts[1];
        }
      }
      if (!nodeName || !nodeName.includes(":")) {
        return;
      }
      const nodeInfo = nodeName.split(":");
      const nodeHost = nodeInfo[0];
      const nodePort = nodeInfo.length > 1 ? nodeInfo[1] : port;
      const wsPath = `/ws?ed=2048`;
      const userInfo = btoa(`${uuid}-${index}`);
      const configLine = `${nodeHost}:${nodePort}#${domain2}|${country}|${userInfo}|${btoa(wsPath)}`;
      if (!countryMap.has(country)) {
        countryMap.set(country, []);
      }
      countryMap.get(country).push(configLine);
    });
    let configContent = "";
    const sortedCountries = Array.from(countryMap.keys()).sort();
    sortedCountries.forEach((country) => {
      const countryNodes = countryMap.get(country);
      configContent += `[${country}]
${countryNodes.join("\n")}

`;
    });
    return configContent.trim();
  } catch (error3) {
    console.error("\u751F\u6210\u732B\u54AA\u914D\u7F6E\u5931\u8D25:", error3);
    return "\u751F\u6210\u914D\u7F6E\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5";
  }
}
__name(generateCatConfig, "generateCatConfig");
async function generateUniversalConfig(env2, hostName) {
  try {
    const cachedNodes = await env2.KV\u6570\u636E\u5E93.get("ip_preferred_ips");
    const nodes = cachedNodes ? JSON.parse(cachedNodes) : [];
    const currentNodeList = nodes.length > 0 ? nodes : [`${hostName}:443`];
    const uuid = await env2.KV\u6570\u636E\u5E93.get("current_uuid");
    const domain2 = hostName;
    const vmessConfigs = currentNodeList.map((node, index) => {
      let nodeName = node;
      let remark = "";
      if (node.includes("|")) {
        const parts = node.split("|");
        nodeName = parts[0];
        if (parts.length > 1) {
          remark = parts[1];
        }
      }
      if (!nodeName || !nodeName.includes(":")) {
        return null;
      }
      const nodeInfo = nodeName.split(":");
      const nodeHost = nodeInfo[0];
      const nodePort = parseInt(nodeInfo[1]) || 443;
      const vmessConfig = {
        v: "2",
        ps: `${domain2}-${remark || "\u8282\u70B9"}-${index + 1}`,
        add: nodeHost,
        port: nodePort,
        id: uuid,
        aid: "0",
        scy: "auto",
        net: "ws",
        type: "none",
        host: domain2,
        path: "/ws?ed=2048",
        tls: "tls",
        sni: domain2,
        alpn: "http/1.1",
        fp: "chrome"
      };
      return btoa(JSON.stringify(vmessConfig));
    }).filter(Boolean);
    const configContent = vmessConfigs.join("\n");
    return configContent.trim();
  } catch (error3) {
    console.error("\u751F\u6210\u901A\u7528\u914D\u7F6E\u5931\u8D25:", error3);
    return "\u751F\u6210\u914D\u7F6E\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5";
  }
}
__name(generateUniversalConfig, "generateUniversalConfig");
function generateSubscriptionPage(uuid, hostName, lightBgImage, darkBgImage) {
  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>\u{1F338}\u6A31\u82B1\u4EE3\u7406 - \u8BA2\u9605\u7BA1\u7406</title>
      <style>
        /* \u54CD\u5E94\u5F0FCSS\u6837\u5F0F */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
          min-height: 100vh;
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          transition: background-image 0.5s ease;
          padding: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .container {
          max-width: 600px;
          width: 100%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        h1, h2 {
          color: #333;
          text-align: center;
          margin-bottom: 20px;
          text-shadow: 0 2px 4px rgba(255, 255, 255, 0.5);
        }
        h1 { font-size: 2.5rem; color: #ff6b6b; }
        h2 { font-size: 1.5rem; margin-top: 30px; }
        .uuid-display {
          background: rgba(255, 255, 255, 0.8);
          padding: 20px;
          border-radius: 10px;
          font-family: 'Courier New', monospace;
          word-break: break-all;
          margin: 20px 0;
          position: relative;
        }
        .copy-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #ff6b6b;
          color: white;
          border: none;

          padding: 5px 15px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.3s;
        }
        .copy-btn:hover { background: #ff5252; }
        .config-section {
          margin: 30px 0;
        }
        .config-item {
          background: rgba(255, 255, 255, 0.8);
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 15px;
          transition: transform 0.3s;
        }
        .config-item:hover { transform: translateY(-5px); }
        .config-item h3 {
          color: #333;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
        }
        .config-item h3 i {
          margin-right: 10px;
          color: #ff6b6b;
        }
        .config-url {
          font-family: 'Courier New', monospace;
          background: rgba(0, 0, 0, 0.05);
          padding: 10px;
          border-radius: 5px;
          word-break: break-all;
          margin: 10px 0;
        }
        .action-btn {
          background: #4CAF50;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
          margin-right: 10px;
          transition: background 0.3s;
        }
        .action-btn:hover { background: #45a049; }
        .danger-btn {
          background: #f44336;
        }
        .danger-btn:hover { background: #d32f2f; }
        .btn-group {
          display: flex;
          justify-content: center;
          margin-top: 30px;
        }
        .toggle-theme {
          position: fixed;
          top: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.3);
          border: none;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 24px;
          transition: background 0.3s;
        }
        .toggle-theme:hover { background: rgba(255, 255, 255, 0.5); }
        
        /* \u79FB\u52A8\u7AEF\u9002\u914D */
        @media (max-width: 600px) {
          body { padding: 10px; }
          .container { padding: 20px; }
          h1 { font-size: 2rem; }
          h2 { font-size: 1.2rem; }
          .action-btn {
            display: block;
            width: 100%;
            margin: 10px 0;
          }
          .btn-group { flex-direction: column; }
        }
      </style>
    </head>
    <body id="subscription-page">
      <button class="toggle-theme" id="theme-toggle">\u{1F319}</button>
      
      <div class="container">
        <h1>\u{1F338}\u6A31\u82B1\u4EE3\u7406</h1>
        <h2>\u8BA2\u9605\u7BA1\u7406\u4E2D\u5FC3</h2>
        
        <div class="uuid-display">
          <span>\u5F53\u524DUUID\uFF1A${uuid}</span>
          <button class="copy-btn" onclick="copyToClipboard('${uuid}')">\u590D\u5236</button>
        </div>
        
        <div class="config-section">
          <h3>\u914D\u7F6E\u94FE\u63A5</h3>
          
          <div class="config-item">
            <h3>\u{1F431} \u732B\u54AA\u914D\u7F6E</h3>
            <div class="config-url" id="cat-config-url">https://${hostName}/config/cat?uuid=${uuid}</div>
            <div class="btn-group">
              <button class="action-btn" onclick="copyToClipboard(document.getElementById('cat-config-url').textContent)">\u590D\u5236\u94FE\u63A5</button>
              <a href="https://${hostName}/config/cat?uuid=${uuid}" target="_blank" class="action-btn">\u6253\u5F00</a>
            </div>
          </div>
          
          <div class="config-item">
            <h3>\u{1F310} \u901A\u7528\u914D\u7F6E</h3>
            <div class="config-url" id="universal-config-url">https://${hostName}/config/universal?uuid=${uuid}</div>
            <div class="btn-group">
              <button class="action-btn" onclick="copyToClipboard(document.getElementById('universal-config-url').textContent)">\u590D\u5236\u94FE\u63A5</button>
              <a href="https://${hostName}/config/universal?uuid=${uuid}" target="_blank" class="action-btn">\u6253\u5F00</a>
            </div>
          </div>
        </div>
        
        <div class="btn-group">
          <button class="action-btn" onclick="location.href='/update-uuid'">\u66F4\u6362UUID</button>
          <button class="action-btn" onclick="location.href='/proxy-settings'">\u4EE3\u7406\u8BBE\u7F6E</button>
          <button class="action-btn danger-btn" onclick="location.href='/logout'">\u9000\u51FA\u767B\u5F55</button>
        </div>
      </div>
      
      <script>
        // \u5207\u6362\u4E3B\u9898
        const themeToggle = document.getElementById('theme-toggle');
        const subscriptionPage = document.getElementById('subscription-page');
        
        // \u521D\u59CB\u5316\u4E3B\u9898
        function initTheme() {
          const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
          const savedTheme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');
          
          if (savedTheme === 'dark') {
            subscriptionPage.style.backgroundImage = 'url(${darkBgImage})';
            themeToggle.textContent = '\u2600\uFE0F';
          } else {
            subscriptionPage.style.backgroundImage = 'url(${lightBgImage})';
            themeToggle.textContent = '\u{1F319}';
          }
        }
        
        // \u5207\u6362\u4E3B\u9898\u4E8B\u4EF6
        themeToggle.addEventListener('click', () => {
          const currentTheme = localStorage.getItem('theme') || 'light';
          const newTheme = currentTheme === 'light' ? 'dark' : 'light';
          
          localStorage.setItem('theme', newTheme);
          
          if (newTheme === 'dark') {
            subscriptionPage.style.backgroundImage = 'url(${darkBgImage})';
            themeToggle.textContent = '\u2600\uFE0F';
          } else {
            subscriptionPage.style.backgroundImage = 'url(${lightBgImage})';
            themeToggle.textContent = '\u{1F319}';
          }
        });
        
        // \u590D\u5236\u5230\u526A\u8D34\u677F
        function copyToClipboard(text) {
          navigator.clipboard.writeText(text)
            .then(() => {
              const btn = event.target;
              const originalText = btn.textContent;
              btn.textContent = '\u5DF2\u590D\u5236!';
              setTimeout(() => {
                btn.textContent = originalText;
              }, 2000);
            })
            .catch(err => {
              console.error('\u590D\u5236\u5931\u8D25:', err);
            });
        }
        
        // \u68C0\u6D4B\u7528\u6237\u4EE3\u7406
        function detectUserAgent() {
          const ua = navigator.userAgent;
          const isMobile = /Mobile|Android|iOS|iPhone|iPad|iPod/i.test(ua);
          
          if (isMobile) {
            document.body.style.fontSize = '14px';
          }
        }
        
        // \u9875\u9762\u52A0\u8F7D\u65F6\u6267\u884C
        window.addEventListener('load', () => {
          initTheme();
          detectUserAgent();
        });
        
        // \u7A97\u53E3\u5927\u5C0F\u53D8\u5316\u65F6\u91CD\u65B0\u68C0\u6D4B
        window.addEventListener('resize', detectUserAgent);
      <\/script>
    </body>
    </html>
  `;
}
__name(generateSubscriptionPage, "generateSubscriptionPage");
function generateKvNotBoundPage(lightBgImage, darkBgImage) {
  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>\u{1F338}\u6A31\u82B1\u4EE3\u7406 - \u914D\u7F6E\u9519\u8BEF</title>
      <style>
        /* \u54CD\u5E94\u5F0FCSS\u6837\u5F0F */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
          min-height: 100vh;
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          transition: background-image 0.5s ease;
          padding: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .container {
          max-width: 600px;
          width: 100%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          text-align: center;
        }
        h1 {
          color: #ff6b6b;
          font-size: 2.5rem;
          margin-bottom: 20px;
          text-shadow: 0 2px 4px rgba(255, 255, 255, 0.5);
        }
        p {
          color: #333;
          font-size: 1.2rem;
          margin-bottom: 20px;
          line-height: 1.6;
        }
        .error-code {
          font-family: 'Courier New', monospace;
          background: rgba(255, 0, 0, 0.1);
          padding: 10px;
          border-radius: 5px;
          margin: 20px 0;
          font-size: 18px;
        }
        .instructions {
          text-align: left;
          background: rgba(255, 255, 255, 0.8);
          padding: 20px;
          border-radius: 10px;
          margin: 20px 0;
        }
        .instructions ol {
          margin-left: 20px;
        }
        .instructions li {
          margin-bottom: 10px;
        }
        .toggle-theme {
          position: fixed;
          top: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.3);
          border: none;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 24px;
          transition: background 0.3s;
        }
        .toggle-theme:hover { background: rgba(255, 255, 255, 0.5); }
        
        /* \u79FB\u52A8\u7AEF\u9002\u914D */
        @media (max-width: 600px) {
          body { padding: 10px; }
          .container { padding: 20px; }
          h1 { font-size: 2rem; }
          p { font-size: 1rem; }
        }
      </style>
    </head>
    <body id="kv-error-page">
      <button class="toggle-theme" id="theme-toggle">\u{1F319}</button>
      
      <div class="container">
        <h1>\u26A0\uFE0F \u914D\u7F6E\u9519\u8BEF</h1>
        <p>\u65E0\u6CD5\u4F7F\u7528\u6A31\u82B1\u4EE3\u7406\u9762\u677F\uFF0C\u56E0\u4E3A\u672A\u6B63\u786E\u7ED1\u5B9AKV\u6570\u636E\u5E93\u3002</p>
        
        <div class="error-code">\u9519\u8BEF\u4EE3\u7801: KV_DATABASE_NOT_BOUND</div>
        
        <div class="instructions">
          <h3>\u89E3\u51B3\u65B9\u6CD5:</h3>
          <ol>
            <li>\u767B\u5F55\u5230 Cloudflare \u63A7\u5236\u53F0</li>
            <li>\u521B\u5EFA\u4E00\u4E2A KV \u547D\u540D\u7A7A\u95F4</li>
            <li>\u5728 Workers \u8BBE\u7F6E\u4E2D\uFF0C\u5C06 KV \u547D\u540D\u7A7A\u95F4\u7ED1\u5B9A\u5230\u60A8\u7684 Worker</li>
            <li>\u786E\u4FDD\u7ED1\u5B9A\u540D\u79F0\u4E3A <strong>KV\u6570\u636E\u5E93</strong></li>
            <li>\u91CD\u65B0\u90E8\u7F72\u60A8\u7684 Worker</li>
          </ol>
        </div>
        
        <p>\u5B8C\u6210\u4E0A\u8FF0\u6B65\u9AA4\u540E\uFF0C\u5237\u65B0\u6B64\u9875\u9762\u5373\u53EF\u6B63\u5E38\u4F7F\u7528\u6A31\u82B1\u4EE3\u7406\u9762\u677F\u3002</p>
      </div>
      
      <script>
        // \u5207\u6362\u4E3B\u9898
        const themeToggle = document.getElementById('theme-toggle');
        const kvErrorPage = document.getElementById('kv-error-page');
        
        // \u521D\u59CB\u5316\u4E3B\u9898
        function initTheme() {
          const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
          const savedTheme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');
          
          if (savedTheme === 'dark') {
            kvErrorPage.style.backgroundImage = 'url(${darkBgImage})';
            themeToggle.textContent = '\u2600\uFE0F';
          } else {
            kvErrorPage.style.backgroundImage = 'url(${lightBgImage})';
            themeToggle.textContent = '\u{1F319}';
          }
        }
        
        // \u5207\u6362\u4E3B\u9898\u4E8B\u4EF6
        themeToggle.addEventListener('click', () => {
          const currentTheme = localStorage.getItem('theme') || 'light';
          const newTheme = currentTheme === 'light' ? 'dark' : 'light';
          
          localStorage.setItem('theme', newTheme);
          
          if (newTheme === 'dark') {
            kvErrorPage.style.backgroundImage = 'url(${darkBgImage})';
            themeToggle.textContent = '\u2600\uFE0F';
          } else {
            kvErrorPage.style.backgroundImage = 'url(${lightBgImage})';
            themeToggle.textContent = '\u{1F319}';
          }
        });
        
        // \u9875\u9762\u52A0\u8F7D\u65F6\u6267\u884C
        window.addEventListener('load', initTheme);
      <\/script>
    </body>
    </html>
  `;
}
__name(generateKvNotBoundPage, "generateKvNotBoundPage");

// utils/websocket.js
async function handleWebSocketUpgrade(request, env2, hostName, preferredNodes) {
  try {
    const authHeader = request.headers.get("Authorization") || "";
    const uuid = await env2.KV\u6570\u636E\u5E93.get("current_uuid");
    if (!authHeader.includes(uuid) && !isProxyRequestPath(request)) {
      const url = new URL(request.url);
      if (!url.searchParams.get("uuid") || url.searchParams.get("uuid") !== uuid) {
        return new Response("Unauthorized", { status: 401 });
      }
    }
    const { conn, selectedNode } = await connectToNode(preferredNodes, hostName);
    if (!conn) {
      throw new Error("\u65E0\u6CD5\u8FDE\u63A5\u5230\u4EFB\u4F55\u8282\u70B9");
    }
    const { socket, response } = Deno.upgradeWebSocket(request);
    handleWebSocketEvents(socket, conn);
    console.log(`WebSocket \u8FDE\u63A5\u5DF2\u5EFA\u7ACB\u5230\u8282\u70B9: ${selectedNode}`);
    return response;
  } catch (error3) {
    console.error("WebSocket \u5347\u7EA7\u5931\u8D25:", error3);
    return new Response("WebSocket \u5347\u7EA7\u5931\u8D25", { status: 500 });
  }
}
__name(handleWebSocketUpgrade, "handleWebSocketUpgrade");
function isProxyRequestPath(request) {
  const url = new URL(request.url);
  return url.pathname === "/ws" || url.pathname === "/socks5";
}
__name(isProxyRequestPath, "isProxyRequestPath");
async function connectToNode(preferredNodes, hostName) {
  for (const node of [...preferredNodes, `${hostName}:443`]) {
    try {
      const nodeParts = node.split(":");
      const nodeHost = nodeParts[0];
      const nodePort = parseInt(nodeParts[1]) || 443;
      const wsUrl = `wss://${nodeHost}:${nodePort}/ws?ed=2048`;
      const conn = await new Promise((resolve, reject) => {
        const ws = new WebSocket(wsUrl);
        ws.onopen = () => resolve(ws);
        ws.onerror = reject;
        ws.onclose = () => reject(new Error("\u8FDE\u63A5\u5173\u95ED"));
        setTimeout(() => reject(new Error("\u8FDE\u63A5\u8D85\u65F6")), 5e3);
      });
      return { conn, selectedNode: node };
    } catch (error3) {
      console.warn(`\u8FDE\u63A5\u5230\u8282\u70B9 ${node} \u5931\u8D25: ${error3.message}`);
    }
  }
  throw new Error("\u6240\u6709\u8282\u70B9\u8FDE\u63A5\u5931\u8D25");
}
__name(connectToNode, "connectToNode");
function handleWebSocketEvents(socket, conn) {
  socket.onmessage = (event) => {
    if (conn && conn.readyState === WebSocket.OPEN) {
      conn.send(event.data);
    }
  };
  conn.onmessage = (event) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(event.data);
    }
  };
  socket.onclose = () => {
    if (conn && conn.readyState !== WebSocket.CLOSED) {
      conn.close();
    }
  };
  conn.onclose = () => {
    if (socket.readyState !== WebSocket.CLOSED) {
      socket.close();
    }
  };
  socket.onerror = (error3) => {
    console.error("\u5BA2\u6237\u7AEF WebSocket \u9519\u8BEF:", error3);
  };
  conn.onerror = (error3) => {
    console.error("\u76EE\u6807\u8282\u70B9 WebSocket \u9519\u8BEF:", error3);
  };
}
__name(handleWebSocketEvents, "handleWebSocketEvents");

// utils/mock-kv.js
var MockKV = class {
  static {
    __name(this, "MockKV");
  }
  constructor() {
    this.data = /* @__PURE__ */ new Map();
  }
  async get(key) {
    return this.data.get(key) || null;
  }
  async put(key, value, options) {
    this.data.set(key, value);
    return void 0;
  }
  async delete(key) {
    this.data.delete(key);
    return void 0;
  }
  async list(options) {
    let keys = Array.from(this.data.keys());
    if (options?.prefix) {
      keys = keys.filter((key) => key.startsWith(options.prefix));
    }
    if (options?.limit && keys.length > options.limit) {
      keys = keys.slice(0, options.limit);
    }
    return {
      keys: keys.map((key) => ({ name: key })),
      list_complete: true,
      cursor: null
    };
  }
  async getWithMetadata(key) {
    const value = this.data.get(key);
    return value ? { value, metadata: null } : null;
  }
};
var mockKvInstance = new MockKV();

// index.js
var CONFIG_PATH = "config";
var PREFERRED_NODES = [];
var PROXY_ADDRESS = "ts.hpc.tw";
var SOCKS5_ACCOUNT = "";
var NODE_NAME = "\u{1F338}\u6A31\u82B1";
var FAKE_DOMAIN = "lkssite.vip";
var MAX_FAILURES = 5;
var LOCK_TIME = 5 * 60 * 1e3;
var LIGHT_BG_IMAGE = "https://i.meee.com.tw/el91luR.png";
var DARK_BG_IMAGE = "https://i.meee.com.tw/QPWx8nX.png";
var index_default = {
  async fetch(request, env2) {
    try {
      PROXY_ADDRESS = env2.PROXYIP || PROXY_ADDRESS;
      SOCKS5_ACCOUNT = env2.SOCKS5 || SOCKS5_ACCOUNT;
      const isDevelopmentMode = env2.DEVELOPMENT_MODE === "true";
      if (!env2.KV\u6570\u636E\u5E93) {
        if (isDevelopmentMode) {
          env2.KV\u6570\u636E\u5E93 = mockKvInstance;
          console.log("\u5F00\u53D1\u6A21\u5F0F\uFF1A\u4F7F\u7528\u6A21\u62DFKV\u6570\u636E\u5E93");
        } else {
          return createHTMLResponse(generateKvNotBoundPage(LIGHT_BG_IMAGE, DARK_BG_IMAGE));
        }
      }
      const upgradeHeader = request.headers.get("Upgrade");
      const url = new URL(request.url);
      const hostName = request.headers.get("Host");
      const UA = request.headers.get("User-Agent") || "unknown";
      const IP = request.headers.get("CF-Connecting-IP") || "unknown";
      const deviceId = `${UA}_${IP}`;
      let formData;
      if (upgradeHeader && upgradeHeader === "websocket") {
        await loadNodesAndConfig(env2, hostName, PREFERRED_NODES, NODE_NAME);
        return await handleWebSocketUpgrade(request, env2, hostName, PREFERRED_NODES);
      }
      if (url.pathname === "/login/submit" || url.pathname === "/register/submit") {
        const contentType = request.headers.get("Content-Type") || "";
        if (!contentType.includes("application/x-www-form-urlencoded") && !contentType.includes("multipart/form-data")) {
          console.log(`\u65E0\u6548\u8BF7\u6C42: UA=${UA}, IP=${IP}, Path=${url.pathname}, Headers=${JSON.stringify([...request.headers])}`);
          return createHTMLResponse(generateLoginRegisterPage(url.pathname === "/login/submit" ? "\u767B\u5F55" : "\u6CE8\u518C", {
            \u9519\u8BEF\u4FE1\u606F: "\u8BF7\u901A\u8FC7\u6B63\u5E38\u8868\u5355\u63D0\u4EA4"
          }, LIGHT_BG_IMAGE, DARK_BG_IMAGE), 400);
        }
        try {
          formData = await request.formData();
        } catch (error3) {
          return createHTMLResponse(generateLoginRegisterPage(url.pathname === "/login/submit" ? "\u767B\u5F55" : "\u6CE8\u518C", {
            \u9519\u8BEF\u4FE1\u606F: "\u63D0\u4EA4\u6570\u636E\u683C\u5F0F\u9519\u8BEF\uFF0C\u8BF7\u91CD\u8BD5"
          }, LIGHT_BG_IMAGE, DARK_BG_IMAGE), 400);
        }
      }
      if (url.pathname === "/register/submit") {
        const username = formData.get("username");
        const password = formData.get("password");
        const confirmPassword = formData.get("confirm");
        if (!username || !password || password !== confirmPassword) {
          return createHTMLResponse(generateLoginRegisterPage("\u6CE8\u518C", {
            \u9519\u8BEF\u4FE1\u606F: password !== confirmPassword ? "\u4E24\u6B21\u5BC6\u7801\u4E0D\u4E00\u81F4" : "\u8BF7\u586B\u5199\u5B8C\u6574\u4FE1\u606F"
          }, LIGHT_BG_IMAGE, DARK_BG_IMAGE), 400);
        }
        const existingUser = await env2.KV\u6570\u636E\u5E93.get("stored_credentials");
        if (existingUser) {
          return createRedirectResponse("/login");
        }
        const encryptedPassword = await encryptPassword(password);
        await env2.KV\u6570\u636E\u5E93.put("stored_credentials", JSON.stringify({
          username,
          password: encryptedPassword
        }));
        const newToken = Math.random().toString(36).substring(2);
        await env2.KV\u6570\u636E\u5E93.put("current_token", newToken, { expirationTtl: 300 });
        return createRedirectResponse(`/${CONFIG_PATH}`, {
          "Set-Cookie": `token=${newToken}; Path=/; HttpOnly; SameSite=Strict`
        });
      }
      if (url.pathname === "/login/submit") {
        const lockStatus = await checkLock(env2, deviceId, LOCK_TIME);
        if (lockStatus.\u88AB\u9501\u5B9A) {
          return createHTMLResponse(generateLoginRegisterPage("\u767B\u5F55", {
            \u9501\u5B9A\u72B6\u6001: true,
            \u5269\u4F59\u65F6\u95F4: lockStatus.\u5269\u4F59\u65F6\u95F4
          }, LIGHT_BG_IMAGE, DARK_BG_IMAGE), 403);
        }
        const storedCredentials = await env2.KV\u6570\u636E\u5E93.get("stored_credentials");
        if (!storedCredentials) {
          return createRedirectResponse("/register");
        }
        const inputUsername = formData.get("username");
        const inputPassword = formData.get("password");
        const credentialsObj = JSON.parse(storedCredentials || "{}");
        const passwordMatch = await encryptPassword(inputPassword) === credentialsObj.password;
        if (inputUsername === credentialsObj.username && passwordMatch) {
          const newToken = Math.random().toString(36).substring(2);
          await env2.KV\u6570\u636E\u5E93.put("current_token", newToken, { expirationTtl: 300 });
          await env2.KV\u6570\u636E\u5E93.put(`fail_${deviceId}`, "0");
          return createRedirectResponse(`/${CONFIG_PATH}`, {
            "Set-Cookie": `token=${newToken}; Path=/; HttpOnly; SameSite=Strict`
          });
        }
        let failureCount = Number(await env2.KV\u6570\u636E\u5E93.get(`fail_${deviceId}`) || 0) + 1;
        await env2.KV\u6570\u636E\u5E93.put(`fail_${deviceId}`, String(failureCount));
        if (failureCount >= MAX_FAILURES) {
          await env2.KV\u6570\u636E\u5E93.put(`lock_${deviceId}`, String(Date.now() + LOCK_TIME), { expirationTtl: 300 });
          const newLockStatus = await checkLock(env2, deviceId, LOCK_TIME);
          return createHTMLResponse(generateLoginRegisterPage("\u767B\u5F55", {
            \u9501\u5B9A\u72B6\u6001: true,
            \u5269\u4F59\u65F6\u95F4: newLockStatus.\u5269\u4F59\u65F6\u95F4
          }, LIGHT_BG_IMAGE, DARK_BG_IMAGE), 403);
        }
        return createHTMLResponse(generateLoginRegisterPage("\u767B\u5F55", {
          \u8F93\u9519\u5BC6\u7801: true,
          \u5269\u4F59\u6B21\u6570: MAX_FAILURES - failureCount
        }, LIGHT_BG_IMAGE, DARK_BG_IMAGE), 401);
      }
      const isRegistered = await env2.KV\u6570\u636E\u5E93.get("stored_credentials");
      if (!isRegistered && url.pathname !== "/register") {
        return createHTMLResponse(generateLoginRegisterPage("\u6CE8\u518C", {}, LIGHT_BG_IMAGE, DARK_BG_IMAGE));
      }
      switch (url.pathname) {
        case "/login":
          const storedCredentials = await env2.KV\u6570\u636E\u5E93.get("stored_credentials");
          if (!storedCredentials) {
            return createRedirectResponse("/register");
          }
          const lockStatus = await checkLock(env2, deviceId, LOCK_TIME);
          if (lockStatus.\u88AB\u9501\u5B9A) {
            return createHTMLResponse(generateLoginRegisterPage("\u767B\u5F55", { \u9501\u5B9A\u72B6\u6001: true, \u5269\u4F59\u65F6\u95F4: lockStatus.\u5269\u4F59\u65F6\u95F4 }, LIGHT_BG_IMAGE, DARK_BG_IMAGE));
          }
          if (request.headers.get("Cookie")?.split("=")[1] === await env2.KV\u6570\u636E\u5E93.get("current_token")) {
            return createRedirectResponse(`/${CONFIG_PATH}`);
          }
          const failureCount = Number(await env2.KV\u6570\u636E\u5E93.get(`fail_${deviceId}`) || 0);
          return createHTMLResponse(generateLoginRegisterPage("\u767B\u5F55", { \u8F93\u9519\u5BC6\u7801: failureCount > 0, \u5269\u4F59\u6B21\u6570: MAX_FAILURES - failureCount }, LIGHT_BG_IMAGE, DARK_BG_IMAGE));
        case "/reset-login-failures":
          await env2.KV\u6570\u636E\u5E93.put(`fail_${deviceId}`, "0");
          await env2.KV\u6570\u636E\u5E93.delete(`lock_${deviceId}`);
          return new Response(null, { status: 200 });
        case "/check-lock":
          const lockCheck = await checkLock(env2, deviceId, LOCK_TIME);
          return createJSONResponse({
            locked: lockCheck.\u88AB\u9501\u5B9A,
            remainingTime: lockCheck.\u5269\u4F59\u65F6\u95F4
          });
        case `/${CONFIG_PATH}`:
          const token = request.headers.get("Cookie")?.split("=")[1];
          const validToken = await env2.KV\u6570\u636E\u5E93.get("current_token");
          if (!token || token !== validToken) return createRedirectResponse("/login");
          const uuid = await getOrInitializeUUID(env2);
          return createHTMLResponse(generateSubscriptionPage(uuid, hostName, LIGHT_BG_IMAGE, DARK_BG_IMAGE));
        case `/${CONFIG_PATH}/logout`:
          await env2.KV\u6570\u636E\u5E93.delete("current_token");
          return createRedirectResponse("/login", { "Set-Cookie": "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict" });
        case `/${CONFIG_PATH}/` + atob("Y2xhc2g="):
          await loadNodesAndConfig(env2, hostName, PREFERRED_NODES, NODE_NAME);
          const catConfig = await getConfig(env2, atob("Y2xhc2g="), hostName, generateCatConfig);
          return new Response(catConfig, { status: 200, headers: { "Content-Type": "text/plain;charset=utf-8" } });
        case `/${CONFIG_PATH}/` + atob("djJyYXluZw=="):
          await loadNodesAndConfig(env2, hostName, PREFERRED_NODES, NODE_NAME);
          const universalConfig = await getConfig(env2, atob("djJyYXk="), hostName, generateUniversalConfig);
          return new Response(universalConfig, { status: 200, headers: { "Content-Type": "text/plain;charset=utf-8" } });
        case `/${CONFIG_PATH}/upload`:
          const uploadToken = request.headers.get("Cookie")?.split("=")[1];
          const validUploadToken = await env2.KV\u6570\u636E\u5E93.get("current_token");
          if (!uploadToken || uploadToken !== validUploadToken) {
            return createJSONResponse({ error: "\u672A\u767B\u5F55\u6216Token\u65E0\u6548\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55" }, 401);
          }
          formData = await request.formData();
          const ipFiles = formData.getAll("ipFiles");
          if (!ipFiles || ipFiles.length === 0) {
            return createJSONResponse({ error: "\u672A\u9009\u62E9\u4EFB\u4F55\u6587\u4EF6" }, 400);
          }
          let allIpList = [];
          try {
            for (const ipFile of ipFiles) {
              if (!ipFile || !ipFile.text) throw new Error(`\u6587\u4EF6 ${ipFile.name} \u65E0\u6548`);
              const ipText = await ipFile.text();
              const ipList = ipText.split("\n").map((line) => line.trim()).filter(Boolean);
              if (ipList.length === 0) console.warn(`\u6587\u4EF6 ${ipFile.name} \u5185\u5BB9\u4E3A\u7A7A`);
              allIpList = allIpList.concat(ipList);
            }
            if (allIpList.length === 0) {
              return createJSONResponse({ error: "\u6240\u6709\u4E0A\u4F20\u6587\u4EF6\u5185\u5BB9\u4E3A\u7A7A" }, 400);
            }
            const uniqueIpList = [...new Set(allIpList)];
            const currentManualNodes = await env2.KV\u6570\u636E\u5E93.get("manual_preferred_ips");
            const currentNodeList = currentManualNodes ? JSON.parse(currentManualNodes) : [];
            const isDuplicateUpload = JSON.stringify(currentNodeList.sort()) === JSON.stringify(uniqueIpList.sort());
            if (isDuplicateUpload) {
              return createJSONResponse({ message: "\u4E0A\u4F20\u5185\u5BB9\u4E0E\u73B0\u6709\u8282\u70B9\u76F8\u540C\uFF0C\u65E0\u9700\u66F4\u65B0" }, 200);
            }
            await env2.KV\u6570\u636E\u5E93.put("manual_preferred_ips", JSON.stringify(uniqueIpList));
            const newVersion2 = String(Date.now());
            await env2.KV\u6570\u636E\u5E93.put("ip_preferred_ips_version", newVersion2);
            await env2.KV\u6570\u636E\u5E93.put("config_" + atob("Y2xhc2g="), await generateCatConfig(env2, hostName, PREFERRED_NODES, NODE_NAME));
            await env2.KV\u6570\u636E\u5E93.put("config_" + atob("Y2xhc2g=") + "_version", newVersion2);
            await env2.KV\u6570\u636E\u5E93.put("config_" + atob("djJyYXk="), await generateUniversalConfig(env2, hostName, PREFERRED_NODES, NODE_NAME));
            await env2.KV\u6570\u636E\u5E93.put("config_" + atob("djJyYXk=") + "_version", newVersion2);
            return createJSONResponse({ message: "\u4E0A\u4F20\u6210\u529F\uFF0C\u5373\u5C06\u8DF3\u8F6C" }, 200, { "Location": `/${CONFIG_PATH}` });
          } catch (error3) {
            console.error(`\u4E0A\u4F20\u5904\u7406\u5931\u8D25: ${error3.message}`);
            return createJSONResponse({ error: `\u4E0A\u4F20\u5904\u7406\u5931\u8D25: ${error3.message}` }, 500);
          }
        case `/${CONFIG_PATH}/change-uuid`:
          const changeToken = request.headers.get("Cookie")?.split("=")[1];
          const validChangeToken = await env2.KV\u6570\u636E\u5E93.get("current_token");
          if (!changeToken || changeToken !== validChangeToken) {
            return createJSONResponse({ error: "\u672A\u767B\u5F55\u6216Token\u65E0\u6548" }, 401);
          }
          const newUUID = generateUUID2();
          await env2.KV\u6570\u636E\u5E93.put("current_uuid", newUUID);
          await env2.KV\u6570\u636E\u5E93.put("config_" + atob("Y2xhc2g="), await generateCatConfig(env2, hostName, PREFERRED_NODES, NODE_NAME));
          await env2.KV\u6570\u636E\u5E93.put("config_" + atob("djJyYXk="), await generateUniversalConfig(env2, hostName, PREFERRED_NODES, NODE_NAME));
          const newVersion = String(Date.now());
          await env2.KV\u6570\u636E\u5E93.put("config_" + atob("Y2xhc2g=") + "_version", newVersion);
          await env2.KV\u6570\u636E\u5E93.put("config_" + atob("djJyYXk=") + "_version", newVersion);
          return createJSONResponse({ uuid: newUUID }, 200);
        case `/${CONFIG_PATH}/add-node-path`:
          const addToken = request.headers.get("Cookie")?.split("=")[1];
          const validAddToken = await env2.KV\u6570\u636E\u5E93.get("current_token");
          if (!addToken || addToken !== validAddToken) {
            return createJSONResponse({ error: "\u672A\u767B\u5F55\u6216Token\u65E0\u6548" }, 401);
          }
          const addData = await request.json();
          const newPath = addData.path;
          if (!newPath || !newPath.match(/^https?:\/\//)) {
            return createJSONResponse({ error: "\u65E0\u6548\u7684URL\u683C\u5F0F" }, 400);
          }
          let currentPaths = await env2.KV\u6570\u636E\u5E93.get("node_file_paths");
          currentPaths = currentPaths ? JSON.parse(currentPaths) : [];
          if (currentPaths.includes(newPath)) {
            return createJSONResponse({ error: "\u8BE5\u8DEF\u5F84\u5DF2\u5B58\u5728" }, 400);
          }
          currentPaths.push(newPath);
          await env2.KV\u6570\u636E\u5E93.put("node_file_paths", JSON.stringify(currentPaths));
          await loadNodesAndConfig(env2, hostName, PREFERRED_NODES, NODE_NAME);
          return createJSONResponse({ success: true }, 200);
        case `/${CONFIG_PATH}/remove-node-path`:
          const removeToken = request.headers.get("Cookie")?.split("=")[1];
          const validRemoveToken = await env2.KV\u6570\u636E\u5E93.get("current_token");
          if (!removeToken || removeToken !== validRemoveToken) {
            return createJSONResponse({ error: "\u672A\u767B\u5F55\u6216Token\u65E0\u6548" }, 401);
          }
          const removeData = await request.json();
          const index = removeData.index;
          let paths = await env2.KV\u6570\u636E\u5E93.get("node_file_paths");
          paths = paths ? JSON.parse(paths) : [];
          if (index < 0 || index >= paths.length) {
            return createJSONResponse({ error: "\u65E0\u6548\u7684\u7D22\u5F15" }, 400);
          }
          paths.splice(index, 1);
          await env2.KV\u6570\u636E\u5E93.put("node_file_paths", JSON.stringify(paths));
          await loadNodesAndConfig(env2, hostName, PREFERRED_NODES, NODE_NAME);
          return createJSONResponse({ success: true }, 200);
        case `/${CONFIG_PATH}/get-node-paths`:
          const getToken = request.headers.get("Cookie")?.split("=")[1];
          const validGetToken = await env2.KV\u6570\u636E\u5E93.get("current_token");
          if (!getToken || getToken !== validGetToken) {
            return createJSONResponse({ error: "\u672A\u767B\u5F55\u6216Token\u65E0\u6548" }, 401);
          }
          let nodePaths = await env2.KV\u6570\u636E\u5E93.get("node_file_paths");
          nodePaths = nodePaths ? JSON.parse(nodePaths) : ["https://v2.i-sweet.us.kg/ips.txt", "https://v2.i-sweet.us.kg/url.txt"];
          return createJSONResponse({ paths: nodePaths }, 200);
        case "/set-proxy-state":
          formData = await request.formData();
          const proxyEnabled = formData.get("proxyEnabled");
          const proxyType = formData.get("proxyType");
          const forceProxy = formData.get("forceProxy");
          await env2.KV\u6570\u636E\u5E93.put("proxyEnabled", proxyEnabled);
          await env2.KV\u6570\u636E\u5E93.put("proxyType", proxyType);
          await env2.KV\u6570\u636E\u5E93.put("forceProxy", forceProxy);
          return new Response(null, { status: 200 });
        case "/get-proxy-status":
          const currentProxyEnabled = await env2.KV\u6570\u636E\u5E93.get("proxyEnabled") === "true";
          const currentProxyType = await env2.KV\u6570\u636E\u5E93.get("proxyType") || "reverse";
          const currentForceProxy = await env2.KV\u6570\u636E\u5E93.get("forceProxy") === "true";
          const proxyAddress = env2.PROXYIP || "ts.hpc.tw";
          const socks5Account = env2.SOCKS5 || "";
          let status = "\u76F4\u8FDE";
          if (currentProxyEnabled) {
            if (currentForceProxy) {
              status = currentProxyType === "reverse" && proxyAddress ? "\u5F3A\u5236\u53CD\u4EE3" : "\u5F3A\u5236SOCKS5";
            } else if (currentProxyType === "reverse" && proxyAddress) {
              status = "\u52A8\u6001\u53CD\u4EE3";
            } else if (currentProxyType === "socks5" && socks5Account) {
              status = "\u52A8\u6001SOCKS5";
            }
          }
          return createJSONResponse({ status });
        default:
          url.hostname = FAKE_DOMAIN;
          url.protocol = "https:";
          return fetch(new Request(url, request));
      }
    } catch (error3) {
      console.error(`\u5168\u5C40\u9519\u8BEF: ${error3.message}`);
      return createJSONResponse({ error: `\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF: ${error3.message}` }, 500);
    }
  }
};
function generateUUID2() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}
__name(generateUUID2, "generateUUID");

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error3 = reduceError(e);
    return Response.json(error3, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-6qCsx1/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = index_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-6qCsx1/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
