#!/bin/bash
# Script de automação de testes - API de Chamados de T.I.
BASE="http://localhost:3009/api/v1"
PASSOU=0
FALHOU=0

chamar() {
  local metodo="$1" rota="$2" esperado="$3" dados="$4"
  echo ""
  echo "------------------------------------------------------------"
  echo ">> $metodo $rota"
  [ -n "$dados" ] && echo ">> Corpo enviado: $dados"

  if [ -n "$dados" ]; then
    resp=$(curl -s -w "\n%{http_code}" -X "$metodo" "$BASE$rota" \
      -H "Content-Type: application/json" -d "$dados")
  else
    resp=$(curl -s -w "\n%{http_code}" -X "$metodo" "$BASE$rota")
  fi

  codigo=$(echo "$resp" | tail -n1)
  corpo=$(echo "$resp" | sed '$d')

  echo "Status HTTP: $codigo (esperado: $esperado)"
  echo "$corpo" | jq . 2>/dev/null || echo "$corpo"

  if [ "$codigo" = "$esperado" ]; then
    echo "RESULTADO: PASSOU"
    PASSOU=$((PASSOU + 1))
  else
    echo "RESULTADO: FALHOU"
    FALHOU=$((FALHOU + 1))
  fi
}

echo "============================================================"
echo " LOG DE AUDITORIA - TESTES DA API DE CHAMADOS DE T.I."
echo " Data/Hora: $(date '+%d/%m/%Y %H:%M:%S')"
echo "============================================================"

echo ""
echo "######## ENTIDADE: TÉCNICOS ########"
chamar POST /tecnicos 201 '{"nome":"Marcos Lima","email":"marcos@empresa.com","especialidade":"SOFTWARE"}'
TID=$(echo "$corpo" | jq -r '.id 2>/dev/null')

chamar POST /tecnicos 400 '{"nome":"Sem Email"}'
chamar GET /tecnicos 200
chamar GET "/tecnicos?especialidade=REDES" 200
chamar GET "/tecnicos/$TID" 200
chamar GET /tecnicos/999 404
chamar PUT "/tecnicos/$TID" 200 '{"nome":"Marcos Lima Jr","email":"marcos.jr@empresa.com","especialidade":"SEGURANCA"}'
chamar PUT "/tecnicos/$TID" 400 '{"nome":"Incompleto"}'
chamar PATCH "/tecnicos/$TID" 200 '{"especialidade":"INFRAESTRUTURA"}'
chamar PATCH /tecnicos/999 404 '{"nome":"Fantasma"}'

echo ""
echo "######## ENTIDADE: CHAMADOS ########"
chamar POST /chamados 201 "{\"titulo\":\"Impressora travada\",\"descricao\":\"Papel agarrado na bandeja\",\"prioridade\":\"BAIXA\",\"tecnicoId\":$TID}"
CID=$(echo "$corpo" | jq -r '.id 2>/dev/null')

chamar POST /chamados 400 '{"titulo":"Sem descricao"}'
chamar GET /chamados 200
chamar GET "/chamados?status=ABERTO" 200
chamar GET "/chamados?prioridade=ALTA" 200
chamar GET "/chamados/$CID" 200
chamar GET /chamados/999 404
chamar PUT "/chamados/$CID" 200 "{\"titulo\":\"Impressora travada (revisado)\",\"descricao\":\"Troca de rolo necessária\",\"prioridade\":\"MEDIA\",\"status\":\"EM_ANDAMENTO\",\"tecnicoId\":$TID}"
chamar PUT "/chamados/$CID" 400 '{"titulo":"Faltou o resto"}'
chamar PATCH "/chamados/$CID" 200 '{"status":"FECHADO"}'
chamar PATCH "/chamados/$CID" 400 '{"status":"STATUS_INVENTADO"}'
chamar PATCH /chamados/999 404 '{"status":"FECHADO"}'

echo ""
echo "######## REMOÇÕES ########"
chamar DELETE "/chamados/$CID" 200
chamar DELETE "/chamados/$CID" 404
chamar DELETE "/tecnicos/$TID" 200
chamar DELETE "/tecnicos/$TID" 404

echo ""
echo "============================================================"
echo " RESUMO: $PASSOU testes passaram | $FALHOU falharam"
echo "============================================================"
