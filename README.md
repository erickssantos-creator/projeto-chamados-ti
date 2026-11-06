cd ~/curso-pbe1/projeto-chamados-ti && cat > README.md << 'EOF'
<div align="center">

# 🛠️ API de Chamados de Suporte T.I.

**Projeto Final Integrador — Back-End 1 (PBE1)**
SENAI / Binário Tech · Mauá · 2026

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![Bash](https://img.shields.io/badge/Bash-Automa%C3%A7%C3%A3o-4EAA25?logo=gnubash&logoColor=white)
![Debian](https://img.shields.io/badge/Linux-Debian-A81D33?logo=debian&logoColor=white)
![Status](https://img.shields.io/badge/status-conclu%C3%ADdo-success)

</div>

---

## 📑 Sumário

1. [Sobre o projeto](#-sobre-o-projeto)
2. [Equipe](#-equipe)
3. [Tecnologias](#-tecnologias)
4. [Arquitetura e modelo de dados](#-arquitetura-e-modelo-de-dados)
5. [Estrutura do repositório](#-estrutura-do-repositório)
6. [Como executar](#-como-executar)
7. [Gerenciamento de processos (Debian)](#-gerenciamento-de-processos-debian)
8. [Endpoints da API](#-endpoints-da-api)
9. [Exemplos de uso com cURL](#-exemplos-de-uso-com-curl)
10. [Códigos HTTP](#-códigos-http-utilizados)
11. [Automação de testes](#-automação-de-testes-bash)
12. [Regras de negócio](#-regras-de-negócio)

---

## 📌 Sobre o projeto

API RESTful para gerenciamento de **suporte de T.I.**, desenvolvida em **Node.js com Express**. O sistema controla dois recursos relacionados, **Técnicos** e **Chamados**, com integridade relacional em memória, validação de payload, filtros por query params e respostas padronizadas com os status HTTP corretos.

O projeto é acompanhado por um **script de automação em Bash** (`curl` + `jq`) que testa todas as rotas e gera um **log de auditoria**, tudo rodando em **Linux Debian** e versionado no **GitHub**.

**Tema escolhido:** 5 — Sistema de Chamados de Suporte T.I.

---

## 👥 Equipe

| Integrante | Papel |
|:--|:--|
| **Arthur Walcafre Oliveira** | Desenvolvimento, testes e documentação |
| **Erick Simionato Santos** | Desenvolvimento, testes e documentação |

**Orientador:** Prof. Irineu Moura Caldeira

---

## 🧰 Tecnologias

| Tecnologia | Uso |
|:--|:--|
| Node.js | Ambiente de execução |
| Express 4 | Framework web e roteamento |
| Bash + cURL + jq | Automação de testes e leitura de JSON |
| Linux Debian | Ambiente de execução e gestão de processos |
| Git / GitHub | Versionamento e colaboração |

---

## 🧱 Arquitetura e modelo de dados

Os dados ficam em **memória** (arrays no `server.js`), sem banco externo.

**Técnico** — `/api/v1/tecnicos`

| Campo | Tipo | Observação |
|:--|:--|:--|
| `id` | número | Gerado automaticamente |
| `nome` | texto | Obrigatório |
| `email` | texto | Obrigatório |
| `especialidade` | texto | Obrigatório (ex.: REDES, HARDWARE, SOFTWARE) |

**Chamado** — `/api/v1/chamados`

| Campo | Tipo | Observação |
|:--|:--|:--|
| `id` | número | Gerado automaticamente |
| `titulo` | texto | Obrigatório |
| `descricao` | texto | Obrigatório |
| `prioridade` | texto | Obrigatório: `BAIXA`, `MEDIA` ou `ALTA` |
| `status` | texto | `ABERTO` (padrão), `EM_ANDAMENTO` ou `FECHADO` |
| `tecnicoId` | número | Opcional; deve referenciar um técnico existente |

**Relacionamento:** um técnico pode ter vários chamados (1:N), ligados pelo campo `tecnicoId`.

---

## 📁 Estrutura do repositório

```text
projeto-chamados-ti/
├── server.js               # API Express (rotas, validações, dados em memória)
├── testes_automacao.sh     # Script Bash de testes (curl + jq)
├── resultado_execucao.log  # Log de auditoria gerado pelo script
├── package.json            # Dependências e script de start
└── README.md               # Documentação
```

---

## 🚀 Como executar

**Pré-requisitos:** Node.js 18+, npm, Git, `curl` e `jq`.

```bash
sudo apt update && sudo apt install -y curl jq
```

**1. Clonar o repositório**

```bash
git clone https://github.com/SEU-USUARIO/projeto-chamados-ti.git
cd projeto-chamados-ti
```

**2. Instalar as dependências**

```bash
npm install
```

**3. Iniciar o servidor**

```bash
npm start
```

✅ Saída esperada: `API de Chamados de T.I. rodando em http://localhost:3009/api/v1`

---

## ⚙️ Gerenciamento de processos (Debian)

```bash
npm start &                # sobe a API em background
ps aux | grep node         # localiza o PID do processo
kill -9 <PID>              # encerra o processo
```

---

## 📚 Endpoints da API

**Base URL:** `http://localhost:3009/api/v1`

### Técnicos

| Método | Endpoint | Parâmetros | Descrição |
|:--|:--|:--|:--|
| `GET` | `/tecnicos` | Query: `especialidade` (opcional) | Lista técnicos, com filtro por especialidade |
| `GET` | `/tecnicos/:id` | Path: `id` | Retorna um técnico específico |
| `POST` | `/tecnicos` | Body: `nome`, `email`, `especialidade` | Cadastra um técnico (**201**) |
| `PUT` | `/tecnicos/:id` | Path: `id` · Body: todos os campos | Substituição completa |
| `PATCH` | `/tecnicos/:id` | Path: `id` · Body: campos desejados | Atualização parcial |
| `DELETE` | `/tecnicos/:id` | Path: `id` | Remove o técnico e desvincula seus chamados |

### Chamados

| Método | Endpoint | Parâmetros | Descrição |
|:--|:--|:--|:--|
| `GET` | `/chamados` | Query: `status`, `prioridade` (opcionais) | Lista chamados, com filtros combináveis |
| `GET` | `/chamados/:id` | Path: `id` | Retorna um chamado específico |
| `POST` | `/chamados` | Body: `titulo`, `descricao`, `prioridade` (+ `status`, `tecnicoId`) | Cria chamado (status padrão `ABERTO`) |
| `PUT` | `/chamados/:id` | Path: `id` · Body: todos os campos | Atualização completa |
| `PATCH` | `/chamados/:id` | Path: `id` · Body: campos desejados | Atualização parcial (ex.: fechar chamado) |
| `DELETE` | `/chamados/:id` | Path: `id` | Exclui o chamado |

---

## 💻 Exemplos de uso com cURL

**Cadastrar um técnico**

```bash
curl -i -X POST http://localhost:3009/api/v1/tecnicos \
  -H "Content-Type: application/json" \
  -d '{"nome":"Marcos Lima","email":"marcos@empresa.com","especialidade":"SOFTWARE"}'
```

**Filtrar técnicos por especialidade**

```bash
curl -i "http://localhost:3009/api/v1/tecnicos?especialidade=REDES"
```

**Abrir um chamado vinculado a um técnico**

```bash
curl -i -X POST http://localhost:3009/api/v1/chamados \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Impressora travada","descricao":"Papel agarrado","prioridade":"BAIXA","tecnicoId":1}'
```

**Fechar um chamado (PATCH)**

```bash
curl -i -X PATCH http://localhost:3009/api/v1/chamados/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"FECHADO"}'
```

**Listar apenas chamados abertos de prioridade alta**

```bash
curl -s "http://localhost:3009/api/v1/chamados?status=ABERTO&prioridade=ALTA" | jq .
```

**Remover um chamado**

```bash
curl -i -X DELETE http://localhost:3009/api/v1/chamados/1
```

---

## 📋 Códigos HTTP utilizados

| Código | Significado | Quando ocorre |
|:--:|:--|:--|
| **200** | OK | GET, PUT, PATCH e DELETE bem-sucedidos |
| **201** | Created | POST com cadastro realizado |
| **400** | Bad Request | Campos obrigatórios ausentes, JSON malformado, status/prioridade/técnico inválidos |
| **404** | Not Found | ID não localizado ou rota inexistente |

---

## 🧪 Automação de testes (Bash)

O script `testes_automacao.sh` percorre **todas as rotas** da API com `curl`, formata os retornos com `jq`, compara o status HTTP recebido com o esperado e imprime `PASSOU` ou `FALHOU` em cada teste, finalizando com um resumo.

Com o servidor rodando, execute:

```bash
chmod +x testes_automacao.sh
./testes_automacao.sh | tee resultado_execucao.log
```

O arquivo `resultado_execucao.log` guarda o **log de auditoria** completo, com data e hora, requisições, respostas e o resumo final.

---

## 📐 Regras de negócio

- Todo chamado criado sem `status` nasce como **ABERTO**.
- Só é possível vincular um chamado a um `tecnicoId` **que exista**.
- Ao remover um técnico, os chamados dele **não são apagados**: ficam sem responsável (`tecnicoId: null`).
- Os filtros por query param **não diferenciam maiúsculas de minúsculas**.
- Os dados vivem **em memória**: reiniciar o servidor restaura os dados iniciais.

---

<div align="center">

**Arthur Walcafre Oliveira** · **Erick Simionato Santos**
Orientador: Prof. Irineu Moura Caldeira
SENAI · Mauá · 2026

</div>

