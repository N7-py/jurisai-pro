/**
 * Model Testing Script for JurisAI Pro
 * Tests all HuggingFace models to verify they work with chat completion API
 */

const https = require('https');

// HuggingFace API Token - Set your token here or in environment
const HF_API_TOKEN = process.env.HF_API_TOKEN || 'YOUR_HF_TOKEN_HERE';

// Models to test
const MODELS_TO_TEST = [
    'Qwen/Qwen2.5-72B-Instruct',
    'meta-llama/Llama-3.1-70B-Instruct',
    'Qwen/Qwen2.5-32B-Instruct',
    'meta-llama/Llama-3-8B-Instruct',
    'mistralai/Mistral-7B-Instruct-v0.3',
    'Qwen/Qwen2.5-7B-Instruct'
];

// Test prompt - simple legal question
const TEST_MESSAGES = [
    {
        role: 'system',
        content: 'You are a legal AI assistant specializing in Indian law.'
    },
    {
        role: 'user',
        content: 'What is Section 2(b) of the Contempt of Courts Act, 1971?'
    }
];

/**
 * Test a single model via HuggingFace Chat Completion API
 */
async function testModel(modelName) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            model: modelName,
            messages: TEST_MESSAGES,
            max_tokens: 150,
            temperature: 0.2
        });

        const options = {
            hostname: 'router.huggingface.co',
            port: 443,
            path: '/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${HF_API_TOKEN}`,
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    
                    if (res.statusCode === 200 && parsed.choices && parsed.choices[0]) {
                        resolve({
                            success: true,
                            statusCode: res.statusCode,
                            response: parsed.choices[0].message.content.substring(0, 100) + '...'
                        });
                    } else {
                        resolve({
                            success: false,
                            statusCode: res.statusCode,
                            error: parsed.error || responseData
                        });
                    }
                } catch (error) {
                    resolve({
                        success: false,
                        statusCode: res.statusCode,
                        error: responseData
                    });
                }
            });
        });

        req.on('error', (error) => {
            resolve({
                success: false,
                error: error.message
            });
        });

        req.write(data);
        req.end();
    });
}

/**
 * Main testing function
 */
async function runTests() {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║         JurisAI Pro - Model Compatibility Test            ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    if (HF_API_TOKEN === 'YOUR_HF_TOKEN_HERE') {
        console.error('❌ ERROR: Please set HF_API_TOKEN environment variable or update the script');
        console.error('   Get your token from: https://huggingface.co/settings/tokens\n');
        process.exit(1);
    }

    console.log(`Testing ${MODELS_TO_TEST.length} models...\n`);

    const results = {
        working: [],
        failed: []
    };

    for (const model of MODELS_TO_TEST) {
        process.stdout.write(`Testing ${model}... `);
        
        try {
            const result = await testModel(model);
            
            if (result.success) {
                console.log('✅ WORKING');
                console.log(`   Response: ${result.response}\n`);
                results.working.push(model);
            } else {
                console.log(`❌ FAILED (Status: ${result.statusCode || 'N/A'})`);
                console.log(`   Error: ${typeof result.error === 'string' ? result.error.substring(0, 150) : JSON.stringify(result.error).substring(0, 150)}...\n`);
                results.failed.push({ model, error: result.error });
            }
        } catch (error) {
            console.log(`❌ ERROR: ${error.message}\n`);
            results.failed.push({ model, error: error.message });
        }

        // Wait 2 seconds between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Summary
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                      TEST SUMMARY                          ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log(`✅ Working Models (${results.working.length}/${MODELS_TO_TEST.length}):`);
    if (results.working.length > 0) {
        results.working.forEach(model => console.log(`   - ${model}`));
    } else {
        console.log('   None');
    }

    console.log(`\n❌ Failed Models (${results.failed.length}/${MODELS_TO_TEST.length}):`);
    if (results.failed.length > 0) {
        results.failed.forEach(item => {
            console.log(`   - ${item.model}`);
            const errorMsg = typeof item.error === 'string' ? item.error : JSON.stringify(item.error);
            console.log(`     Error: ${errorMsg.substring(0, 100)}...`);
        });
    } else {
        console.log('   None');
    }

    console.log('\n');

    // Recommendations
    if (results.failed.length > 0) {
        console.log('💡 RECOMMENDATION: Remove the failed models from public/index.html');
        console.log('   to provide a better user experience.\n');
    } else {
        console.log('🎉 SUCCESS: All models are working! Your platform is ready.\n');
    }
}

// Run the tests
runTests().catch(console.error);