const nome_admin = document.querySelector('#nome');
const senha_admin = document.querySelector('#senha');
const btn = document.querySelector('#entrar');

btn.addEventListener('click', async () =>{
let dados ={
    user: nome_admin.value,
    password: senha_admin.value
}

const resposta =  await fetch('http://localhost:3000/login',{
    method: "POST",
    headers:{"content-type" : "application/json"},
    body: JSON.stringify(dados)
})
const objeto = await resposta.json();
if(resposta.status == 200){
alert('Seja bem vindo')
localStorage.setItem('id', objeto.id_admin)
localStorage.setItem('nome', objeto.nome_admin)
return window.location.href = '../Home/home.html'
}
alert('Erro ao logar')

})