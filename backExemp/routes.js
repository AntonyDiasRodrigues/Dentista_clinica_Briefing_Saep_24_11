import express from "express";
import sql from "./database.js";
const routes = express.Router();

// ROTA: POST /login
// FINALIDADE: autenticar o administrador (dono do consultório) comparando nome e senha (MD5) na tabela admins
routes.post("/login", async (req, res) => {
  try {
    const { user, password } = req.body;
    const resposta =
      await sql`select * from admins where nome_admin = ${user} and senha_admin = md5(${password});`;
    if (resposta.length != 0) {
      return res.status(200).json(resposta[0]);
    }
    return res.status(401).json("erro ao logar");
  } catch (error) {
    console.log(error);
    return res.status(500);
  }
});
// ROTA: POST /cadUsuario
// FINALIDADE: cadastrar um novo usuário (nome + senha em MD5) na tabela usuarios
routes.post("/cadUsuario", async (req, res) => {
  try {
    const { user, password } = req.body;
    await sql`insert into usuarios(nome_usuario, senha) values
    (${user},md5(${password}))`;
    return res.status(201).json();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Erro interno ao cadastrar usuário",
    });
  }
});

// ROTA: POST /cadProcedimento
// FINALIDADE: cadastrar um novo procedimento (nome + valor) na tabela procedimentos
// CORRIGIDO: o insert falhava porque procedimentos.paciente_id era NOT NULL.
// Rodei no banco: ALTER TABLE procedimentos ALTER COLUMN paciente_id DROP NOT NULL;
routes.post("/cadProcedimento", async (req, res) => {
  try {
    const { nome_procedimento, valor } = req.body;
    await sql`insert into procedimentos(nome_procedimento, valor)values 
    (${nome_procedimento},${valor})`;
    return res.status(201).json();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Erro interno ao cadastrar procedimentos",
    });
  }
});
// ROTA: POST /cadPaciente
// FINALIDADE: cadastrar um novo paciente (nome + CPF em MD5) na tabela paciente
routes.post("/cadPaciente", async (req, res) => {
  try {
    const { paciente, cpf } = req.body;
    await sql`insert into paciente(nome_user, cpf) values 
    (${paciente},md5(${cpf}))`;
    return res.status(201).json();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Erro interno ao cadastrar Paciente",
    });
  }
});

// ROTA: POST /cadConsulta
// FINALIDADE: agendar uma consulta ligando um paciente a um procedimento em uma data
routes.post("/cadConsulta", async (req, res) => {
  try {
    const { data_consulta, procedimento_id, paciente_id } = req.body;
    await sql`insert into consultas(data_consulta, procedimento_id, paciente_id)values
    (${data_consulta},${procedimento_id},${paciente_id} )`;
    return res.status(201).json("Consulta cadastrada com sucesso");
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Erro interno ao cadastrar consulta",
    });
  }
});
// ROTA: PUT /editar/:id
// FINALIDADE: alterar a data de uma consulta existente (id = id_consultas)
routes.put("/editar/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data_consulta } = req.body;
    const resposta =
      await sql`update consultas set data_consulta = ${data_consulta} where id_consultas=${id}`; // CORRIGIDO: era id_consulta (a coluna é id_consultas)
    return res.status(201).json("atualizado");
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao editar consulta" });
  }
});
// ROTA: DELETE /deletar/:id
// FINALIDADE: excluir uma consulta (id = id_consultas)
routes.delete("/deletar/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const resposta = await sql`delete from consultas where id_consultas=${id}`; // CORRIGIDO: era id_consulta
    return res.status(204).json("Excluído");
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao deletar consulta " });
  }
});
// ROTA: GET /consultas  (opcional: ?search=nome)
// FINALIDADE: listar todas as consultas com nome do paciente e do procedimento; com ?search filtra pelo nome do paciente
routes.get("/consultas", async (req, res) => {
  const { search } = req.query;
  let rows;
  // CORRIGIDO: antes usava p.nome_paciente e p.id_cliente (colunas inexistentes);
  // agora usa nome_user / id_paciente e traz também o nome do procedimento
  if (search) {
    rows = await sql`
        select c.*, p.nome_user as nome_paciente, pr.nome_procedimento
        from paciente p inner join consultas c on c.paciente_id = p.id_paciente
        left join procedimentos pr on pr.id_procedimento = c.procedimento_id
        WHERE p.nome_user ILIKE ${"%" + search + "%"}`;
  } else {
    rows = await sql`
        select c.*, p.nome_user as nome_paciente, pr.nome_procedimento
        from paciente p inner join consultas c on c.paciente_id = p.id_paciente
        left join procedimentos pr on pr.id_procedimento = c.procedimento_id`;
  }
  return res.status(200).json(rows);
});
// ROTA: GET /preenchimento
// FINALIDADE: fornecer as listas de pacientes e procedimentos para preencher os selects do formulário de consulta
routes.get("/preenchimento", async (req, res) => {
  // CORRIGIDO: a query antiga tinha dois aliases "p" e um join errado (id_procedimento = id_paciente).
  // Agora são duas queries separadas e a rota devolve { pacientes, procedimentos }
  const pacientes = await sql`select id_paciente, nome_user as nome_paciente from paciente`;
  const procedimentos = await sql`select id_procedimento, nome_procedimento from procedimentos`;
  return res.status(200).json({ pacientes, procedimentos });
});

// ROTA: GET /consulta/:id
// FINALIDADE: buscar os dados de uma única consulta (usada para pré-preencher a edição)
routes.get('/consulta/:id', async (req,res) => {
  const {id}= req.params;
  const resposta = await sql `select * from consultas where id_consultas=${id}`
   return res.status(200).json(resposta[0]);
})

// ROTA: GET /usuarios
// FINALIDADE: listar todos os usuários da tabela usuarios
routes.get("/usuarios", async (req, res) => {
  const resposta = await sql`select * from usuarios`;
  return res.status(200).json(resposta);
});

export default routes;
