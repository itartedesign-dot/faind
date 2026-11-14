/* FAIND Transcribe — worker.
   Gira nel browser dell'utente: scarica il modello Whisper (una volta, poi resta nella cache del browser)
   e trascrive l'audio ricevuto. L'audio non viene inviato a nessun server. */
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';

env.allowLocalModels = false;
env.useBrowserCache = true;

const MODELS = { fast: 'onnx-community/whisper-base', better: 'onnx-community/whisper-small' };
let asr = null, loaded = '';

function post(type, data) { self.postMessage(Object.assign({ type }, data || {})); }

async function load(quality) {
  const key = quality;
  if (asr && loaded === key) return;
  asr = null;
  const progress_callback = (p) => {
    if (p && p.status === 'progress' && p.file) post('download', { file: p.file, loaded: p.loaded, total: p.total });
  };
  const gpu = typeof navigator !== 'undefined' && !!navigator.gpu;
  const attempts = gpu
    ? [{ device: 'webgpu', dtype: { encoder_model: 'fp32', decoder_model_merged: 'q4' } }, { device: 'wasm', dtype: 'q8' }]
    : [{ device: 'wasm', dtype: 'q8' }];
  let lastErr = null;
  for (const a of attempts) {
    try {
      asr = await pipeline('automatic-speech-recognition', MODELS[quality], Object.assign({ progress_callback }, a));
      loaded = key;
      post('ready', { device: a.device });
      return;
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error('Model could not be loaded');
}

self.onmessage = async (ev) => {
  const m = ev.data || {};
  try {
    if (m.type !== 'run') return;
    post('status', { text: 'loading' });
    await load(m.quality);
    post('status', { text: 'transcribing' });
    const dur = m.audio.length / 16000;
    const STEP = 20;                                   // 30 s di finestra meno 5 s di sovrapposizione per lato
    const total = Math.max(1, Math.ceil(Math.max(dur - 30, 0) / STEP) + 1);
    let done = 0;
    const opts = {
      chunk_length_s: 30, stride_length_s: 5, return_timestamps: true, task: 'transcribe',
      // il generatore chiama streamer.end() alla fine di ogni finestra da 30 s: lo uso per l'avanzamento
      streamer: { put() {}, end() { done++; post('progress', { value: Math.min(done / total, 0.99) }); } }
    };
    if (m.language && m.language !== 'auto') opts.language = m.language;
    const out = await asr(m.audio, opts);
    const chunks = (out.chunks || []).map((c) => ({ text: c.text, start: c.timestamp ? c.timestamp[0] : null, end: c.timestamp ? c.timestamp[1] : null }));
    post('done', { text: (out.text || '').trim(), chunks, duration: dur });
  } catch (e) {
    post('error', { message: String((e && e.message) || e) });
  }
};
