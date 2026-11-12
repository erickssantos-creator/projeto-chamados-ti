#!/bin/bash

BASE="http://localhost:3009/api/v1"

executar_passo() {
  local titulo="$1"
  local esperado="$2"
  local comando="$3"

  echo ""
  echo "=================================================================="
  echo " PASSO: $titulo"
  echo " ESPERADO: $esperado"
  echo " COMANDO:  $comando"
  echo "------------------------------------------------------------------"
  eval "$comando"
  echo ""
}

clear
echo "##################################################################"
echo "#   RESUMO E DEMONSTRACAO AO VIVO - API CHAMADOS DE SUPORTE T.I. #"
echo "#   Projeto Integrador PBE1 - SENAI Maua (2026)                  #"
echo "#   Autores: Arthur Walcafre Oliveira & Erick Simionato Santos   #"
echo "##################################################################"

# 1. POST - 201 Created (captura o ID gerado na variavel CID)
echo ""
echo "=================================================================="
echo " PASSO: 1. Criar novo chamado (POST)"
echo " ESPERADO: HTTP 201 Created"
CMD1="curl -s -i -X POST $BASE/chamados -H 'Content-Type: application/json' -d '{\"titulo\":\"Teclado com defeito\",\"descricao\":\"Tecla Enter falhando\",\"prioridade\":\"ALTA\",\"tecnicoId\":1}'"
echo " COMANDO:  $CMD1"
echo "------------------------------------------------------------------"
RESP1=$(eval "$CMD1")
echo "$RESP1"
CID=$(echo "$RESP1" | tail -n1 | jq -r '.id')
echo ""

# 2. GET - 200 OK (Buscar por ID)
executar_passo \
  "2. Buscar chamado criado por ID (GET /:id)" \
  "HTTP 200 OK" \
  "curl -s -i -X GET $BASE/chamados/$CID"

# 3. GET com Query Parameters - 200 OK
executar_passo \
  "3. Filtrar chamados por Query Parameters (status=ABERTO & prioridade=ALTA)" \
  "HTTP 200 OK (apenas chamados filtrados)" \
  "curl -s -i -X GET '$BASE/chamados?status=ABERTO&prioridade=ALTA'"

# 4. PATCH - 200 OK (Atualizacao parcial)
executar_passo \
  "4. Fechar chamado com atualizacao parcial (PATCH)" \
  "HTTP 200 OK (status alterado para FECHADO)" \
  "curl -s -i -X PATCH $BASE/chamados/$CID -H 'Content-Type: application/json' -d '{\"status\":\"FECHADO\"}'"

# 5. PUT - 200 OK (Atualizacao completa)
executar_passo \
  "5. Substituir dados completos do chamado (PUT)" \
  "HTTP 200 OK" \
  "curl -s -i -X PUT $BASE/chamados/$CID -H 'Content-Type: application/json' -d '{\"titulo\":\"Teclado substituido\",\"descricao\":\"Troca realizada no setor\",\"prioridade\":\"BAIXA\",\"status\":\"FECHADO\",\"tecnicoId\":1}'"

# 6. DELETE - 200 OK
executar_passo \
  "6. Excluir chamado pelo ID (DELETE)" \
  "HTTP 200 OK (chamado removido)" \
  "curl -s -i -X DELETE $BASE/chamados/$CID"

# 7. GET em ID inexistente - 404 Not Found
executar_passo \
  "7. Buscar chamado ja excluido ou inexistente (GET /999)" \
  "HTTP 404 Not Found" \
  "curl -s -i -X GET $BASE/chamados/999"

# 8. POST com payload incompleto - 400 Bad Request
executar_passo \
  "8. Tentar criar chamado sem campos obrigatorios (POST invalido)" \
  "HTTP 400 Bad Request" \
  "curl -s -i -X POST $BASE/chamados -H 'Content-Type: application/json' -d '{\"titulo\":\"Chamado incompleto\"}'"

echo "=================================================================="
echo " DEMONSTRACAO CONCLUIDA COM SUCESSO!"
echo "=================================================================="

