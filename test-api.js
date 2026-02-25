// Quick test to verify the proxy API works
const payload = {
    inputs: "The Supreme Court ruled today that the right to privacy extends to digital communications. The decision establishes that law enforcement must obtain a warrant before accessing electronic messages.",
    parameters: { max_length: 100, min_length: 30 }
};

fetch('http://localhost:3000/api/hf/facebook/bart-large-cnn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
})
    .then(r => r.json())
    .then(data => {
        console.log('STATUS: SUCCESS');
        console.log('RESPONSE:', JSON.stringify(data, null, 2));
    })
    .catch(err => {
        console.log('STATUS: FAILED');
        console.log('ERROR:', err.message);
    });
