import { openaiService } from './services/openaiService';

// Test the OpenAI service
async function testOpenAI() {
    console.log('🧪 Testing OpenAI Service...\n');

    // Test 1: Simple title enhancement
    console.log('Test 1: Title Enhancement');
    try {
        const enhanced = await openaiService.enhancePropertyTitle(
            'Casa en venta',
            {
                tipo: 'casa',
                tipo_operacion: 'venta',
                dormitorios: 3,
                banos_completos: 2,
                barrio: 'Palermo',
                sup_cubierta: 150
            }
        );
        console.log('✅ Title enhanced:', enhanced);
    } catch (error: any) {
        console.error('❌ Title enhancement failed:', error.message);
    }

    console.log('\n---\n');

    // Test 2: Property search
    console.log('Test 2: Property Search');
    try {
        const result = await openaiService.searchPropertiesByChatbot(
            'Busco casa con pileta',
            [{
                id: '1',
                titulo: 'Casa con pileta',
                tipo: 'casa',
                tipo_operacion: 'venta',
                pileta: true,
                precio_venta: 300000,
                dormitorios: 3,
                barrio: 'Nordelta'
            } as any]
        );
        console.log('✅ Search results:', result.properties.length, 'properties');
        console.log('   Explanation:', result.explanation);
    } catch (error: any) {
        console.error('❌ Search failed:', error.message);
    }
}

// Run tests
testOpenAI().catch(console.error);
