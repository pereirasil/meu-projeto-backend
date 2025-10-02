const axios = require('axios');

async function testSprintTaskEndpoint() {
  try {
    console.log('🔐 Fazendo login com usuário de teste...');
    
    // Fazer login com usuário de teste
    const loginResponse = await axios.post('http://localhost:3003/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    
    console.log('✅ Login realizado:', loginResponse.data);
    const token = loginResponse.data.token;
    
    console.log('🧪 Testando endpoint POST /sprints/tasks...');
    
    // Testar o endpoint de adicionar tarefa à sprint
    const taskResponse = await axios.post('http://localhost:3003/sprints/tasks', {
      sprint_id: 4, // Sprint existente
      card_id: 1,   // Card que criamos
      status: 'pendente',
      prioridade: 'media',
      estimativa_horas: 8
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Resposta do endpoint:', taskResponse.data);
    console.log('🎉 Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    
    if (error.response?.status === 500) {
      console.log('🔍 Erro 500 - verificando logs do backend...');
    }
  }
}

testSprintTaskEndpoint();

