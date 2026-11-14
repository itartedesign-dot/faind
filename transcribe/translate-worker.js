/* FAIND Transcribe — translation fallback worker.
   Used only when the browser has no built-in Translator. Runs a free open translation model
   (NLLB-200 distilled, via Transformers.js) on the user's device. The text is never sent to a server;
   only the model files are downloaded, once, from Hugging Face. */
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';

env.allowLocalModels = false;
env.useBrowserCache = true;

const MODEL = 'Xenova/nllb-200-distilled-600M';
let tr = null;

function post(type, data) { self.postMessage(Object.assign({ type }, data || {})); }

self.onmessage = async (ev) => {
  const m = ev.data || {};
  try {
    if (m.type !== 'run') return;
    if (!tr) {
      const files = {};
      tr = await pipeline('translation', MODEL, {
        dtype: 'q8', device: 'wasm',
        progress_callback: (p) => {
          if (p && p.status === 'progress' && p.file) {
            files[p.file] = { l: p.loaded || 0, t: p.total || 0 };
            let l = 0, t = 0;
            for (const k in files) { l += files[k].l; t += files[k].t; }
            post('download', { value: t ? l / t : 0 });
          }
        }
      });
    }
    const out = [];
    for (let i = 0; i < m.texts.length; i++) {
      const r = await tr(m.texts[i], { src_lang: m.src, tgt_lang: m.tgt, max_new_tokens: 256 });
      out.push(((r && r[0] && r[0].translation_text) || '').trim());
      post('progress', { value: (i + 1) / m.texts.length });
    }
    post('done', { texts: out });
  } catch (e) {
    post('error', { message: String((e && e.message) || e) });
  }
};
