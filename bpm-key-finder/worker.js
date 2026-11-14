/* Runs the analysis off the main thread so the page stays responsive. */
importScripts('engine.js');
self.onmessage = function (e) {
  try {
    var out = FaindKeyBpm.analyse(e.data.samples, function (p) { self.postMessage({ type: 'progress', p: p }); });
    self.postMessage({ type: 'done', result: out });
  } catch (err) {
    self.postMessage({ type: 'error', message: String(err && err.message || err) });
  }
};
