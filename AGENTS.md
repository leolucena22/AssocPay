<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — AssocPay

> Documento guia para qualquer IA (Claude Code, Cursor, Windsurf, etc.) trabalhar neste projeto.

---

## 1. Sobre o Projeto

**AssocPay** é um sistema de gerenciamento de pagamentos de associados de um ônibus fretado para universitários.

A coordenação cadastra instituições, associados e meses de cobrança, define quem participa de cada mês, e os associados (sem login, acesso público) sobem o comprovante de pagamento. A coordenação aprova ou rejeita cada comprovante.

**Dois perfis:**
- **Coordenação** — login único por senha, autenticado via JWT. Gerencia instituições, associados, meses, seleção de participantes e aprovação de comprovantes.
- **Público (associados)** — sem login, acesso 100% aberto. Encontra o próprio nome na lista do mês e envia comprovante.

**Entidades principais:**
- **Institution** — instituição de ensino do associado.
- **Member** — associado, vinculado (opcionalmente) a uma instituição. Possui `type` (`Regular` ou `Fee`) e `active`.
- **Month** — mês de cobrança, com valores próprios (`regularAmount`, `feeAmount`, `lateFee`, `expectedAmount`, `dueDate`).
- **Payment** — pagamento de 1 associado em 1 mês. Status: `pending → under_review → confirmed/rejected`.

---

## 2. Stack

- Next.js (API Routes)
- Prisma
- Supabase (Postgres + Storage para os comprovantes)

Não há restrição rígida de outras bibliotecas/dependências — use o que fizer sentido, desde que não vá contra o que já está estabelecido no projeto.

---

## 3. Como Trabalhar Neste Projeto

- **Antes de criar algo novo, olhe como já é feito no código existente** e siga o mesmo padrão: estrutura de pastas, nomenclatura, formato de resposta (sucesso/erro), autenticação, validação, tratamento de erros, status HTTP, paginação, etc.
- **Não invente uma arquitetura nova.** Reutilize o que já está implementado.
- **Não duplique lógica** que já existe em algum helper/arquivo.
- **Não mude contratos da API** (formato de request/response, nomes de campos, status codes) sem necessidade real.
- Se tiver dúvida sobre um padrão, procure um exemplo parecido no próprio código antes de perguntar ou assumir.

---

## 4. Fluxos de Negócio

### 4.1 Fluxo de Autenticação

```
1. POST /auth/login { password }
2. Compara hash (bcrypt) com o registro da coordenação
3. Se válido: gera JWT → retorna { token, coordinatorId }, 200
4. Se inválido: erro 401
5. GET /auth/me e demais rotas privadas validam o token via helper de autenticação
6. POST /auth/logout invalida o token atual → 204
```

### 4.2 Fluxo de Criação de Meses

```
1. Coordenação cria o mês com os valores do período:
   { date, regular_amount, fee_amount, late_fee, expected_amount, due_date }
2. Coordenação define quais associados participam daquele mês (POST /months/:id/members
   com { member_ids: string[] }), gerando em lote os payments "pending" correspondentes
3. Como sugestão de UX, a seleção pode vir pré-marcada com base no mês anterior,
   mas pode ser ajustada antes e depois de "postar" o mês
4. Esse endpoint pode ser chamado de novo para AJUSTAR a seleção:
   - member_ids que já têm payment: não duplicar
   - member_ids novos: criar novo payment "pending"
   - member_ids removidos: nunca remover payment que já está em under_review/confirmed
5. Associados só entram a partir do mês em que começaram a usar o ônibus
```

### 4.3 Fluxo de Pagamento (público)

```
1. Acesso aberto (sem login) à listagem do mês (GET /months/:id/full)
2. Associado encontra seu nome/payment na lista
3. Associado faz upload do comprovante (POST /payments/:id/upload)
   - Permitido apenas se o payment estiver em "pending" ou "rejected"
   - Retorna { receipt_url }
4. Associado confirma o pagamento (POST /payments/:id/pay { notes, receipt_url })
   - Muda status para "under_review"
5. Enquanto "under_review": associado NÃO pode reenviar
6. Coordenação decide via PATCH /payments/:id (aprova ou rejeita)
7. Se "rejected": associado pode reenviar (novo upload + pay)
8. Se "confirmed": fluxo encerrado para aquele payment
```

### 4.4 Fluxo de Aprovação de Pagamentos

```
1. Coordenação lista payments pendentes de revisão (status=under_review)
2. Abre o detalhe do payment (inclui receipt_url, notes)
3. Coordenação decide:
   - Aprovar → status "confirmed"
   - Rejeitar → status "rejected" (com motivo em notes)
4. Só é possível transicionar de "under_review" para "confirmed" ou "rejected".
   Transições inválidas (ex: de "confirmed" de volta pra "pending") devem ser
   bloqueadas, seguindo o mesmo padrão de erro já usado no projeto.
```

---

## 5. Regras de Negócio Consolidadas

1. Um `Payment` é único por par `(memberId, monthId)`.
2. Status possíveis de um `Payment`: `pending`, `under_review`, `confirmed`, `rejected`.
3. Upload de comprovante só é permitido quando o payment está em `pending` ou `rejected`.
4. `pay` (confirmação do associado) sempre move o status para `under_review`.
5. Apenas a coordenação (autenticada) pode mover de `under_review` para `confirmed`/`rejected`.
6. Excluir uma `Institution` deve desvincular os `Members` relacionados, nunca excluí-los.
7. Excluir um `Month` deve excluir os `Payments` daquele mês.
8. Excluir um `Member` deve excluir os `Payments` daquele associado.
9. Associados só participam de meses a partir do momento em que
   passaram a usar o ônibus — não devem aparecer automaticamente em meses anteriores
   a esse marco.
10. Relatórios (`/reports/*`) são somente leitura, nunca alteram dados.

---

## 6. Padrões a Seguir (sem prescrever arquitetura)

- **Respostas de API:** sempre usar o padrão já existente de sucesso/erro do projeto
  (não inventar um formato novo).
- **Autenticação:** sempre usar o helper de autenticação já existente para rotas
  privadas — nunca reimplementar verificação de token manualmente.
- **Validação:** sempre validar entrada externa (body, params, query) com o
  validador já usado no projeto (Zod), mesmo em rotas públicas.
- **Erros:** sempre usar o mesmo padrão de tratamento de erro já estabelecido no
  código (mesmas classes/mensagens/status codes), nunca lançar erros genéricos ou
  formatos diferentes.
- **Status HTTP:** seguir o que já está em uso nas rotas existentes (200, 201, 204,
  400, 401, 403, 404, 409, 500) de forma consistente.
- **Paginação e filtros:** listagens seguem o padrão já implementado (`page`,
  `limit`, filtros opcionais aplicados só quando enviados).
- **Nunca** retornar campos sensíveis (ex: senha) em qualquer resposta.

---

*Mantenha este documento atualizado se alguma decisão importante do projeto mudar.*