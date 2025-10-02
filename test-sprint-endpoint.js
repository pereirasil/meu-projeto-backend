const axios = require('axios');

async function testSprintTaskEndpoint() {
  try {
    console.log('🔐 Fazendo login...');
    
    // Fazer login
    const loginResponse = await axios.post('http://localhost:3003/auth/login', {
      email: 'anderson.informata@gmail.com',
      password: 'password' // Assumindo que a senha é 'password'
    });
    
    console.log('✅ Login realizado:', loginResponse.data);
    const token = loginResponse.data.token;
    
    console.log('🧪 Testando endpoint POST /sprints/tasks...');
    
    // Testar o endpoint de adicionar tarefa à sprint
    const taskResponse = await axios.post('http://localhost:3003/sprints/tasks', {
      sprint_id: 4, // Sprint existente
      card_id: 1,   // Card que acabamos de criar
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
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('🔑 Problema de autenticação. Tentando com usuário de teste...');
      
      try {
        // Tentar com usuário de teste
        const testLoginResponse = await axios.post('http://localhost:3003/auth/login', {
          email: 'test@example.com',
          password: 'password'
        });
        
        console.log('✅ Login com usuário de teste:', testLoginResponse.data);
        const testToken = testLoginResponse.data.token;
        
        // Testar novamente
        const testTaskResponse = await axios.post('http://localhost:3003/sprints/tasks', {
          sprint_id: 4,
          card_id: 1,
          status: 'pendente',
          prioridade: 'media',
          estimativa_horas: 8
        }, {
          headers: {
            'Authorization': `Bearer ${testToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ Resposta com usuário de teste:', testTaskResponse.data);
        
      } catch (testError) {
        console.error('❌ Erro mesmo com usuário de teste:', testError.response?.data || testError.message);
      }
    }
  }
}

testSprintTaskEndpoint();

