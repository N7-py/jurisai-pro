/**
 * Test script to verify which Mistral models work with Hugging Face's Inference API
 * Run with: node test_mistral_models.js
 */

require('dotenv').config();
const OpenAI = require('openai');

// Mistral models to test
const MISTRAL_MODELS = [
    'mistralai/Mistral-7B-Instruct-v0.1',
    'mistralai/Mistral-7B-Instruct-v0.2',
    'mistralai/Mistral-7B-Instruct-v0.3',
    'mistralai/Mistral-Nemo-Instruct-2407',
    'mistralai/Mixtral-8x7B-Instruct-v0.1',
];

async function testModel(modelId) {
    const HF_API_TOKEN = process.env.HF_API_TOKEN;
    
    if (!HF_API_TOKEN) {
        console.error('❌ HF_API_TOKEN not found in environment variables!');
        process.exit(1);
    }

    console.log(`\n🔍 Testing: ${modelId}`);
    console.log('─'.repeat(60));

    try {
        const hfOpenAI = new OpenAI({
            apiKey: HF_API_TOKEN,
            baseURL: "https://router.huggingface.co/v1/"
        });

        const startTime = Date.now();
        
        const completion = await hfOpenAI.chat.completions.create({
            model: modelId,
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: 'Say "Hello, I am working!" in one sentence.' }
            ],
            temperature: 0.2,
            max_tokens: 50,
        });

        const endTime = Date.now();
        const responseTime = ((endTime - startTime) / 1000).toFixed(2);

        const response = completion.choices[0].message.content;
        
        console.log(`✅ SUCCESS`);
        console.log(`⏱️  Response Time: ${responseTime}s`);
        console.log(`💬 Response: ${response}`);
        console.log(`📊 Tokens: ${completion.usage?.total_tokens || 'N/A'}`);

        return { success: true, modelId, responseTime, response };

    } catch (error) {
        console.log(`❌ FAILED`);
        console.log(`🚨 Error: ${error.message}`);
        
        if (error.response) {
            console.log(`📍 Status: ${error.response.status}`);
            console.log(`📄 Data: ${JSON.stringify(error.response.data, null, 2)}`);
        }

        return { success: false, modelId, error: error.message };
    }
}

async function runTests() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 MISTRAL MODELS COMPATIBILITY TEST');
    console.log('='.repeat(60));
    console.log(`📅 Date: ${new Date().toISOString()}`);
    console.log(`🔑 HF Token: ${process.env.HF_API_TOKEN ? '✓ Set' : '✗ Missing'}`);
    console.log('='.repeat(60));

    const results = [];

    for (const modelId of MISTRAL_MODELS) {
        const result = await testModel(modelId);
        results.push(result);
        
        // Wait 2 seconds between tests to avoid rate limiting
        if (MISTRAL_MODELS.indexOf(modelId) < MISTRAL_MODELS.length - 1) {
            console.log('\n⏳ Waiting 2 seconds before next test...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));

    const working = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`\n✅ Working Models (${working.length}):`);
    working.forEach(r => {
        console.log(`   • ${r.modelId} (${r.responseTime}s)`);
    });

    console.log(`\n❌ Failed Models (${failed.length}):`);
    failed.forEach(r => {
        console.log(`   • ${r.modelId}`);
        console.log(`     Reason: ${r.error}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('💡 RECOMMENDATIONS:');
    console.log('='.repeat(60));
    
    if (working.length > 0) {
        console.log('\nUse these models in your index.html:');
        working.forEach(r => {
            console.log(`<option value="${r.modelId}">Mistral Model</option>`);
        });
    } else {
        console.log('\n⚠️  No Mistral models are working with your HF token!');
        console.log('   Possible reasons:');
        console.log('   1. Invalid or expired HF_API_TOKEN');
        console.log('   2. Models require Pro/Enterprise access');
        console.log('   3. HuggingFace API is temporarily down');
        console.log('\n   Try these alternatives:');
        console.log('   • meta-llama/Meta-Llama-3-8B-Instruct');
        console.log('   • HuggingFaceH4/zephyr-7b-beta');
    }

    console.log('\n' + '='.repeat(60));
}

// Run the tests
runTests().catch(console.error);