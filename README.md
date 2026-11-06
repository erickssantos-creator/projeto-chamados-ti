🛠️ Sistema de Chamados de T.I. - API RESTfulProjeto Integrador - Programação Back-End 1 (PBE1) | SENAIAutores: Erick S. Santos e Arthur Walcafre OliveiraAmbiente Alvo: Linux Debian📋 SumárioVisão Geral e Arquitetura da APIMapeamento de Endpoints e Métodos HTTPCódigos de Resposta HTTP UtilizadosCódigo-Fonte dos Arquivos do Projetopackage.jsonserver.jstestes_automacao.shComandos e Procedimentos Operacionais (Debian & cURL)1. Visão Geral e Arquitetura da APIEste documento reúne a especificação técnica completa, códigos-fonte, rotinas de testes automatizados e procedimentos operacionais no Linux Debian para o projeto integrador de Back-End 1.A aplicação é uma API RESTful desenvolvida em Node.js com Express para gerenciamento de chamados e suporte de TI. O sistema gerencia duas entidades principais com integridade relacional mantida em memória:Entidade Técnicos (/api/v1/tecnicos): Profissionais de TI cadastrados no sistema, identificados por ID, nome, e-mail e especialidade (ex: REDES, HARDWARE, SOFTWARE).Entidade Chamados (/api/v1/chamados): Solicitações de suporte contendo título, descrição, prioridade (BAIXA, MEDIA, ALTA), status (ABERTO, EM_ANDAMENTO, FECHADO) e vínculo com o técnico responsável (tecnicoId).2. Mapeamento de Endpoints e Métodos HTTP👨‍💻 Entidade: Técnicos (/api/v1/tecnicos)MétodoEndpointParâmetrosDescriçãoGET/api/v1/tecnicosQuery: especialidadeLista todos os técnicos (suporta filtro por especialidade).GET/api/v1/tecnicos/:idPath: idRetorna os detalhes de um técnico específico.POST/api/v1/tecnicosBody: JSONCadastra um novo técnico (Retorna status 201 Created).PUT/api/v1/tecnicos/:idPath: id / Body: JSONSubstituição completa dos dados de um técnico.PATCH/api/v1/tecnicos/:idPath: id / Body: JSONAtualização parcial de campos específicos.DELETE/api/v1/tecnicos/:idPath: idRemove um técnico (desvincula dos chamados associados).🎫 Entidade: Chamados (/api/v1/chamados)MétodoEndpointParâmetrosDescriçãoGET/api/v1/chamadosQuery: status, prioridadeLista chamados com filtros flexíveis via Query Param.GET/api/v1/chamados/:idPath: idRetorna os detalhes de um chamado específico.POST/api/v1/chamadosBody: JSONCria chamado vinculado a técnico (Status padrão: ABERTO).PUT/api/v1/chamados/:idPath: id / Body: JSONAtualização completa do chamado.PATCH/api/v1/chamados/:idPath: id / Body: JSONAtualização parcial (ex: alterar status para FECHADO).DELETE/api/v1/chamados/:idPath: idExclui um chamado do sistema.3. Códigos de Resposta HTTP Utilizados200 OK — Sucesso Geral: Retornado em GET, PUT, PATCH e DELETE bem-sucedidos.201 Created — Criado: Retornado em requisições POST com cadastro realizado com sucesso.400 Bad Request — Requisição Inválida: Payload incompleto, JSON malformatado ou dados inválidos (ex: técnico, status ou prioridade ausentes/inválidos).404 Not Found — Não Encontrado: Recurso por ID não localizado no banco em memória ou rota inexistente.4. Código-Fonte dos Arquivos do Projeto4.1. package.json{
  "name": "projeto-chamados-ti",
  "version": "1.0.0",
  "description": "API RESTful para Sistema de Chamados de Suporte T.I. - Projeto Integrador PBE1 SENAI",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "test": "./testes_automacao.sh"
  },
  "keywords": [
    "express",
    "nodejs",
    "rest",
    "senai",
    "pbe1",
    "debian"
  ],
  "author": "Erick S. Santos e Arthur Walcafre Oliveira",
  "license": "ISC",
  "dependencies": {
    "express": "^4.19.2"
  }
}
4.2. server.js (Aplicação Principal Express)const express = require('express');
const app = express();
const PORT = 3009;
const BASE = '/api/v1';

app.use(express.json());
app.use((req, res, next) => {
  req.body = req.body || {};
  next();
});

const STATUS_VALIDOS = ['ABERTO', 'EM_ANDAMENTO', 'FECHADO'];
const PRIORIDADES_VALIDAS = ['BAIXA', 'MEDIA', 'ALTA'];

let tecnicos = [
  { id: 1, nome: 'Carlos Silva', email: 'carlos@empresa.com', especialidade: 'REDES' },
  { id: 2, nome: 'Ana Souza', email: 'ana@empresa.com', especialidade: 'HARDWARE' },
];

let chamados = [
  { id: 1, titulo: 'Internet caiu', descricao: 'Sem conexão na sala 3', prioridade: 'ALTA', status: 'ABERTO', tecnicoId: 1 },
  { id: 2, titulo: 'Monitor sem imagem', descricao: 'Monitor do financeiro não liga', prioridade: 'MEDIA', status: 'EM_ANDAMENTO', tecnicoId: 2 },
];

let proximoTecnicoId = 3;
let proximoChamadoId = 3;

const vazio = (v) => v === undefined || v === null || String(v).trim() === '';
const camposFaltando = (body, campos) => campos.filter((c) => vazio(body[c]));
const pegarCampos = (body, campos) => {
  const obj = {};
  campos.forEach((c) => {
    if (body[c] !== undefined) obj[c] = body[c];
  });
  return obj;
};

function validarChamado(dados) {
  if (dados.prioridade !== undefined && !PRIORIDADES_VALIDAS.includes(dados.prioridade)) {
    return `prioridade deve ser uma de: ${PRIORIDADES_VALIDAS.join(', ')}`;
  }
  if (dados.status !== undefined && !STATUS_VALIDOS.includes(dados.status)) {
    return `status deve ser um de: ${STATUS_VALIDOS.join(', ')}`;
  }
  if (
    dados.tecnicoId !== undefined &&
    dados.tecnicoId !== null &&
    !tecnicos.find((t) => t.id === Number(dados.tecnicoId))
  ) {
    return 'tecnicoId informado não existe';
  }
  return null;
}

const CAMPOS_TECNICO = ['nome', 'email', 'especialidade'];

app.get(`${BASE}/tecnicos`, (req, res) => {
  let resultado = tecnicos;
  if (req.query.especialidade) {
    resultado = resultado.filter(
      (t) => t.especialidade.toLowerCase() === req.query.especialidade.toLowerCase()
    );
  }
  res.status(200).json(resultado);
});

app.get(`${BASE}/tecnicos/:id`, (req, res) => {
  const tecnico = tecnicos.find((t) => t.id === Number(req.params.id));
  if (!tecnico) return res.status(404).json({ erro: 'Técnico não encontrado' });
  res.status(200).json(tecnico);
});

app.post(`${BASE}/tecnicos`, (req, res) => {
  const faltando = camposFaltando(req.body, CAMPOS_TECNICO);
  if (faltando.length) {
    return res.status(400).json({ erro: 'Campos obrigatórios ausentes', campos: faltando });
  }
  const novo = { id: proximoTecnicoId++, ...pegarCampos(req.body, CAMPOS_TECNICO) };
  tecnicos.push(novo);
  res.status(201).json(novo);
});

app.put(`${BASE}/tecnicos/:id`, (req, res) => {
  const tecnico = tecnicos.find((t) => t.id === Number(req.params.id));
  if (!tecnico) return res.status(404).json({ erro: 'Técnico não encontrado' });

  const faltando = camposFaltando(req.body, CAMPOS_TECNICO);
  if (faltando.length) {
    return res.status(400).json({ erro: 'Campos obrigatórios ausentes', campos: faltando });
  }
  Object.assign(tecnico, pegarCampos(req.body, CAMPOS_TECNICO));
  res.status(200).json(tecnico);
});

app.patch(`${BASE}/tecnicos/:id`, (req, res) => {
  const tecnico = tecnicos.find((t) => t.id === Number(req.params.id));
  if (!tecnico) return res.status(404).json({ erro: 'Técnico não encontrado' });

  const dados = pegarCampos(req.body, CAMPOS_TECNICO);
  if (Object.keys(dados).length === 0) {
    return res.status(400).json({ erro: `Envie ao menos um campo: ${CAMPOS_TECNICO.join(', ')}` });
  }
  const vazios = Object.keys(dados).filter((c) => vazio(dados[c]));
  if (vazios.length) {
    return res.status(400).json({ erro: 'Campos não podem ser vazios', campos: vazios });
  }

  Object.assign(tecnico, dados);
  res.status(200).json(tecnico);
});

app.delete(`${BASE}/tecnicos/:id`, (req, res) => {
  const indice = tecnicos.findIndex((t) => t.id === Number(req.params.id));
  if (indice === -1) return res.status(404).json({ erro: 'Técnico não encontrado' });

  const [removido] = tecnicos.splice(indice, 1);
  chamados.forEach((c) => {
    if (c.tecnicoId === removido.id) c.tecnicoId = null;
  });
  res.status(200).json({ mensagem: 'Técnico removido com sucesso', tecnico: removido });
});

const CAMPOS_CHAMADO = ['titulo', 'descricao', 'prioridade', 'status', 'tecnicoId'];
const OBRIGATORIOS_CHAMADO = ['titulo', 'descricao', 'prioridade'];

app.get(`${BASE}/chamados`, (req, res) => {
  let resultado = chamados;
  if (req.query.status) {
    resultado = resultado.filter((c) => c.status.toLowerCase() === req.query.status.toLowerCase());
  }
  if (req.query.prioridade) {
    resultado = resultado.filter(
      (c) => c.prioridade.toLowerCase() === req.query.prioridade.toLowerCase()
    );
  }
  res.status(200).json(resultado);
});

app.get(`${BASE}/chamados/:id`, (req, res) => {
  const chamado = chamados.find((c) => c.id === Number(req.params.id));
  if (!chamado) return res.status(404).json({ erro: 'Chamado não encontrado' });
  res.status(200).json(chamado);
});

app.post(`${BASE}/chamados`, (req, res) => {
  const faltando = camposFaltando(req.body, OBRIGATORIOS_CHAMADO);
  if (faltando.length) {
    return res.status(400).json({ erro: 'Campos obrigatórios ausentes', campos: faltando });
  }

  const erro = validarChamado(req.body);
  if (erro) return res.status(400).json({ erro });

  const novo = {
    id: proximoChamadoId++,
    titulo: req.body.titulo,
    descricao: req.body.descricao,
    prioridade: req.body.prioridade,
    status: req.body.status || 'ABERTO',
    tecnicoId: req.body.tecnicoId !== undefined ? Number(req.body.tecnicoId) : null,
  };
  chamados.push(novo);
  res.status(201).json(novo);
});

app.put(`${BASE}/chamados/:id`, (req, res) => {
  const chamado = chamados.find((c) => c.id === Number(req.params.id));
  if (!chamado) return res.status(404).json({ erro: 'Chamado não encontrado' });

  const faltando = camposFaltando(req.body, [...OBRIGATORIOS_CHAMADO, 'status']);
  if (faltando.length) {
    return res.status(400).json({ erro: 'Campos obrigatórios ausentes', campos: faltando });
  }

  const erro = validarChamado(req.body);
  if (erro) return res.status(400).json({ erro });

  chamado.titulo = req.body.titulo;
  chamado.descricao = req.body.descricao;
  chamado.prioridade = req.body.prioridade;
  chamado.status = req.body.status;
  chamado.tecnicoId = req.body.tecnicoId !== undefined ? Number(req.body.tecnicoId) : null;
  res.status(200).json(chamado);
});

app.patch(`${BASE}/chamados/:id`, (req, res) => {
  const chamado = chamados.find((c) => c.id === Number(req.params.id));
  if (!chamado) return res.status(404).json({ erro: 'Chamado não encontrado' });

  const dados = pegarCampos(req.body, CAMPOS_CHAMADO);
  if (Object.keys(dados).length === 0) {
    return res.status(400).json({ erro: `Envie ao menos um campo: ${CAMPOS_CHAMADO.join(', ')}` });
  }

  const erro = validarChamado(dados);
  if (erro) return res.status(400).json({ erro });

  if (dados.tecnicoId !== undefined && dados.tecnicoId !== null) {
    dados.tecnicoId = Number(dados.tecnicoId);
  }

  Object.assign(chamado, dados);
  res.status(200).json(chamado);
});

app.delete(`${BASE}/chamados/:id`, (req, res) => {
  const indice = chamados.findIndex((c) => c.id === Number(req.params.id));
  if (indice === -1) return res.status(404).json({ erro: 'Chamado não encontrado' });

  const [removido] = chamados.splice(indice, 1);
  res.status(200).json({ mensagem: 'Chamado removido com sucesso', chamado: removido });
});

app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição' });
  }
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`API de Chamados de T.I. rodando em http://localhost:${PORT}${BASE}`);
});
4.3. testes_automacao.sh (Script Bash)#!/bin/bash
BASE="http://localhost:3009/api/v1"
PASSOU=0
FALHOU=0

chamar() {
  local metodo="$1"
  local rota="$2"
  local esperado="$3"
  local dados="$4"

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

echo ""
echo "============================================================"
echo " LOG DE AUDITORIA - TESTES DA API DE CHAMADOS DE T.I."
echo " Data/Hora: $(date '+%d/%m/%Y %H:%M:%S')"
echo "============================================================"

echo ""
echo "######## ENTIDADE: TÉCNICOS ########"
chamar POST /tecnicos 201 '{"nome":"Marcos Lima","email":"marcos@empresa.com","especialidade":"SOFTWARE"}'
TID=$(echo "$corpo" | jq -r '.id' 2>/dev/null)

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
CID=$(echo "$corpo" | jq -r '.id' 2>/dev/null)

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
5. Comandos e Procedimentos Operacionais (Debian & cURL)5.1. Inicialização e Gerenciamento de ProcessosNavegue até o diretório do projeto e execute a aplicação em segundo plano ou visualize os processos em execução:# Entrar no diretório do projeto
cd ~/curso-pbe1/projeto-chamados-ti

# Iniciar o servidor em segundo plano
npm start &

# Verificar se o processo Node.js está em execução
ps aux | grep node

# Caso precise encerrar o servidor (substitua pelo PID retornado)
kill -9 <PID>
5.2. Execução de Testes Automatizados e AuditoriaDê permissão de execução ao script Bash de automação e execute-o salvando os resultados em arquivo de log:# Conceder permissão de execução ao script
chmod +x testes_automacao.sh

# Executar a suíte de testes e gerar log de resultado
./testes_automacao.sh | tee resultado_execucao.log
5.3. Exemplos de Comandos Individuais via cURL (CRUD Prático)1. Cadastrar um novo técnico:curl -i -X POST http://localhost:3009/api/v1/tecnicos \
  -H "Content-Type: application/json" \
  -d '{"nome":"Marcos Lima","email":"marcos@empresa.com","especialidade":"SOFTWARE"}'
2. Listar técnicos filtrando por especialidade:curl -i -X GET "http://localhost:3009/api/v1/tecnicos?especialidade=REDES"
3. Abrir um novo chamado:curl -i -X POST http://localhost:3009/api/v1/chamados \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Impressora travada","descricao":"Papel agarrado","prioridade":"BAIXA","tecnicoId":1}'
4. Atualizar parcialmente o status de um chamado:curl -i -X PATCH http://localhost:3009/api/v1/chamados/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"FECHADO"}'
5. Excluir um chamado:curl -i -X DELETE http://localhost:3009/api/v1/chamados/1
