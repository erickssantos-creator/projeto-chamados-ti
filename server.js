const express = require('express');
const app = express();
const PORT = 3009;
const BASE = '/api/v1';

app.use(express.json());
app.use((req, res, next) => {
  req.body = req.body || {};
  next();
});

// ---------- "Banco de Dados" em Memória ----------
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

// ---------- Funções Auxiliares e Validações ----------
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

// =====================================================
//                      1. TÉCNICOS
// =====================================================
const CAMPOS_TECNICO = ['nome', 'email', 'especialidade'];

// GET listar (suporta Query Param: ?especialidade=REDES)
app.get(`${BASE}/tecnicos`, (req, res) => {
  let resultado = tecnicos;
  if (req.query.especialidade) {
    resultado = resultado.filter(
      (t) => t.especialidade.toLowerCase() === req.query.especialidade.toLowerCase()
    );
  }
  res.status(200).json(resultado);
});

// GET por ID (200 ou 404)
app.get(`${BASE}/tecnicos/:id`, (req, res) => {
  const tecnico = tecnicos.find((t) => t.id === Number(req.params.id));
  if (!tecnico) return res.status(404).json({ erro: 'Técnico não encontrado' });
  res.status(200).json(tecnico);
});

// POST criar (201 ou 400)
app.post(`${BASE}/tecnicos`, (req, res) => {
  const faltando = camposFaltando(req.body, CAMPOS_TECNICO);
  if (faltando.length) {
    return res.status(400).json({ erro: 'Campos obrigatórios ausentes', campos: faltando });
  }
  const novo = { id: proximoTecnicoId++, ...pegarCampos(req.body, CAMPOS_TECNICO) };
  tecnicos.push(novo);
  res.status(201).json(novo);
});

// PUT atualizar tudo (200, 400 ou 404)
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

// PATCH atualizar parcial (200, 400 ou 404)
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

// DELETE remover (200 ou 404) - Mantém integridade referencial
app.delete(`${BASE}/tecnicos/:id`, (req, res) => {
  const indice = tecnicos.findIndex((t) => t.id === Number(req.params.id));
  if (indice === -1) return res.status(404).json({ erro: 'Técnico não encontrado' });

  const [removido] = tecnicos.splice(indice, 1);
  // Chamados vinculados a este técnico ficam com tecnicoId = null
  chamados.forEach((c) => {
    if (c.tecnicoId === removido.id) c.tecnicoId = null;
  });
  res.status(200).json({ mensagem: 'Técnico removido com sucesso', tecnico: removido });
});

// =====================================================
//                      2. CHAMADOS
// =====================================================
const CAMPOS_CHAMADO = ['titulo', 'descricao', 'prioridade', 'status', 'tecnicoId'];
const OBRIGATORIOS_CHAMADO = ['titulo', 'descricao', 'prioridade'];

// GET listar (suporta Query Params: ?status=ABERTO e ?prioridade=ALTA)
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

// GET por ID (200 ou 404)
app.get(`${BASE}/chamados/:id`, (req, res) => {
  const chamado = chamados.find((c) => c.id === Number(req.params.id));
  if (!chamado) return res.status(404).json({ erro: 'Chamado não encontrado' });
  res.status(200).json(chamado);
});

// POST criar (201 ou 400)
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

// PUT atualizar tudo (200, 400 ou 404)
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

// PATCH atualizar parcial (200, 400 ou 404)
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

// DELETE remover (200 ou 404)
app.delete(`${BASE}/chamados/:id`, (req, res) => {
  const indice = chamados.findIndex((c) => c.id === Number(req.params.id));
  if (indice === -1) return res.status(404).json({ erro: 'Chamado não encontrado' });

  const [removido] = chamados.splice(indice, 1);
  res.status(200).json({ mensagem: 'Chamado removido com sucesso', chamado: removido });
});

// ---------- Tratamento de Erros Inexistentes / Payload ----------
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
