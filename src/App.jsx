import React, { useEffect, useState } from 'react';
import DiceRoller from './components/DiceRoller';

export default function App() {
  const [workerStatus, setWorkerStatus] = useState('idle');
  useEffect(() => {
    const worker = new Worker(new URL('./workers/llmWorker.js', import.meta.url), { type: 'module' });
    worker.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === 'status') setWorkerStatus(msg.status);
    };
    worker.postMessage({ type: 'statusCheck' });
    return () => worker.terminate();
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: 'system-ui, sans-serif', maxWidth: 900 }}>
      <h1>DnD DM PWA (starter)</h1>
      <p>Minimal PWA with a Web Worker skeleton for an in-browser LLM.</p>

      <DiceRoller />

      <section style={{ marginTop: 20 }}>
        <h2>AI DM (worker)</h2>
        <p>Worker status: {workerStatus}</p>
        <p>
          The Web Worker at src/workers/llmWorker.js is a placeholder. When you have a WASM/JS runtime (e.g.
          gpt4all-native-web or a llama wasm build), drop code into the worker and communicate via postMessage.
        </p>
      </section>
    </div>
  );
}
