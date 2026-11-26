// Legacy in-browser model worker removed from the active architecture.
// StoryFoundry now uses the secure server-side /api/adventure endpoint.
self.onmessage=()=>self.postMessage({type:'error',error:'The local model worker is no longer used. Configure the Gemini server endpoint.'});