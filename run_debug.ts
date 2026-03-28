import { checkDesignData } from './tmp_debug_db'

async function run() {
    try {
        const result = await checkDesignData()
        console.log('DEBUG_RESULT:', JSON.stringify(result, null, 2))
    } catch (e) {
        console.error('DEBUG_ERROR:', e)
    }
}

run()
