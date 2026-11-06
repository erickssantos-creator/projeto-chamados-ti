### PROJETO FINAL INTEGRADOR

# INTEGRANTES:
Erick Simionato Santos
Arthur Walcafre Oliveira

# OBJETIVO: Nosso projeto final integrador tem como tema chamados de T.I, pra isso fizemos algumas pesquisas para analisar como as chamadas são feitas. A partir daí, começamos nosso projeto subindo ele para o github e utilizando ele no servidor debian.


## COMANDOS E PROCEDIMENTOS OPERACIONAIS (DEBIAN & CURL)
# 4.1. Inicialização e Gerenciamento de Processos
cd ~/curso-pbe1/projeto-chamados-ti npm start & ps aux | grep node kill -9
# 4.2. Execução de Testes Automatizados e Auditoria
chmod +x testes_automacao.sh ./testes_automacao.sh | tee resultado_execucao.log
# 4.3. Exemplos de Comandos Individuais via cURL (CRUD Prático)
curl -i -X POST http://localhost:3009/api/v1/tecnicos
-H "Content-Type: application/json"
-d '{"nome":"Marcos Lima","email":"marcos@empresa.com","especialidade":"SOFTWARE"}'
curl -i -X GET "http://localhost:3009/api/v1/tecnicos?especialidade=REDES"
curl -i -X POST http://localhost:3009/api/v1/chamados
-H "Content-Type: application/json"
-d '{"titulo":"Impressora travada","descricao":"Papel agarrado","prioridade":"BAIXA","tecnicoId":1}'
curl -i -X PATCH http://localhost:3009/api/v1/chamados/1
-H "Content-Type: application/json"
-d '{"status":"FECHADO"}'
curl -i -X DELETE
