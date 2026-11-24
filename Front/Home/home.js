const nome_dono = localStorage.getItem("nome");
const btn_logout = document.querySelector("#logout");
document.querySelector("h2").innerText = nome_dono;
const form_paciente = document.querySelector("#cad_paciente");
const form_procedimento = document.querySelector("#cad_procedimentos");
const form_consulta = document.querySelector("#cad_consulta");
const nome_paciente = document.querySelector("#nome_paciente");
const nome_procedimento = document.querySelector("#nome_procedimento");
const cpf_paciente = document.querySelector("#cpf_paciente");
const valor_procedimento = document.querySelector("#valor_procedimento");
const data_consulta = document.querySelector("#data_consulta");
const select_procedimento = document.querySelector("#id_procedimento");
const select_paciente = document.querySelector("#id_paciente");
const vazia = document.querySelector("#vazia");
const buscar = document.querySelector("#buscar");
const procurar = document.querySelector("#procurar");

window.addEventListener("load", async () => {
  btn_logout.addEventListener("click", () => {
    localStorage.clear();
    window.location.replace("../login/login.html");
  });
  if(!nome_dono){
    window.location.replace("../login/login.html");
  }
  const resposta = await fetch("http://localhost:3000/preenchimento");
  const lista = await resposta.json();
  const resposta_agenda = await fetch("http://localhost:3000/consultas");
  const lista_agenda = await resposta_agenda.json();
  if (resposta_agenda.status == 200) {
    // CORRIGIDO: mostra o nome do procedimento e usa id_consultas (nome real da coluna)
    lista_agenda.forEach((element) => {
      vazia.innerHTML += `
            <div class='card'>
            <p>${element.nome_paciente}</p>
            <p>${element.nome_procedimento ?? element.procedimento_id}</p>
            <p>${String(element.data_consulta).slice(0, 16)}</p>
            <button class="deletar" onclick="deletar(${element.id_consultas})">Deletar</button>
            <button class="editar" onclick="editar(${element.id_consultas})">Editar</button>
            </div>
            `;
    });
  }
  if (resposta.status == 200) {
    select_paciente.innerHTML = "";
    select_procedimento.innerHTML = "";
    // CORRIGIDO: /preenchimento agora retorna { pacientes, procedimentos }; cada select usa sua lista
    lista.pacientes.forEach((element) => {
      select_paciente.innerHTML += `
                <option value="${element.id_paciente}">${element.nome_paciente}</option>
            `;
    });
    lista.procedimentos.forEach((element) => {
      select_procedimento.innerHTML += `
                <option value="${element.id_procedimento}">${element.nome_procedimento}</option>
            `;
    });
  }
});

form_paciente.addEventListener("submit", async (event) => {
  event.preventDefault();
  let dados = {
    paciente: nome_paciente.value,
    cpf: cpf_paciente.value,
  };
  const resposta = await fetch("http://localhost:3000/cadPaciente", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(dados),
  });
  if (resposta.status == 201) {
    alert("Cadastro realizado com sucesso");
    return window.location.reload();
  }
  alert("Cadastro não realizado");
});
form_procedimento.addEventListener("submit", async (event) => {
  event.preventDefault();
  let dados = {
    nome_procedimento: nome_procedimento.value,
    valor: valor_procedimento.value,
  };
 
  const resposta = await fetch("http://localhost:3000/cadProcedimento", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(dados),
  });
  if (resposta.status == 201) {
    alert("Cadastro realizado com sucesso");
    return window.location.reload();
  }
  alert("Cadastro não realizado");
});
form_consulta.addEventListener("submit", async (event) => {
  event.preventDefault();
  let dados = {
    data_consulta: data_consulta.value,
    procedimento_id: select_procedimento.value,
    paciente_id: select_paciente.value
  };
  const resposta = await fetch("http://localhost:3000/cadConsulta", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(dados),
  });
  if (resposta.status == 201) {
    alert("Cadastro realizado com sucesso");
    return window.location.reload();
  }
  alert("Cadastro não realizado");
});
buscar.addEventListener("click", async () => {
  if (procurar.value == "") return alert("Digite um valor");
  let texto = procurar.value;
  const resposta = await fetch(
    `http://localhost:3000/consultas?search=${texto}`,
  );
  const lista = await resposta.json();
  vazia.innerHTML = "";
  if (resposta.status == 200) {
    lista.forEach((element) => {
      vazia.innerHTML += `
            <div class='card'>
            <p>${element.nome_paciente}</p>
            <p>${element.data_consulta.slice(0, 16)}</p>
            </div>
            `;
    });
  }
});

async function deletar(id) {
  console.log(id);
  const resposta = await fetch(`http://localhost:3000/deletar/${id}`, {
    method: "delete",
  });
  if (resposta.status == 204) {
    alert("agendamento deletado");
    return window.location.reload();
  }
  alert("Erro ao deletar consulta");
}

async function editar(id) {
  const respota = await fetch(`http://localhost:3000/consulta/${id}`);
  const lista = await respota.json();
  let dados = {
    data_consulta: prompt('Data da consulta', lista.data_consulta),
  };
  const resposta = await fetch(`http://localhost:3000/editar/${id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(dados),
  });
  if(resposta.status==201){
    alert('editado com sucesso')
    return window.location.reload()
  }
  alert('erro ao editar')
}
