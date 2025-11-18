// Worker skeleton for in-browser LLM integration.
// The UI can send: { type: 'loadModel', url: '...' } and { type: 'generate', prompt: '...' }

self.onmessage = async (e) => {
  const msg = e.data;
  if (msg.type === 'statusCheck') {
    self.postMessage({ type: 'status', status: 'placeholder-ready' });
    return;
  }

  if (msg.type === 'loadModel') {
    self.postMessage({ type: 'status', status: 'loaded-placeholder' });
  } else if (msg.type === 'generate') {
    const prompt = msg.prompt || '';
    const reply = {
      text: `Placeholder DM response to prompt: ${prompt.slice(0, 120)}...`,
      structure: { description: 'A short scene description', options: ['Option A', 'Option B'] }
    };
    self.postMessage({ type: 'response', reply });
  }
};
