let nomePessoa = {};
let msgAPI = {};
let mensagens = [];
let mensagens_filtrado = [];
let participantes = [];
let participantes_filtrado = [];
let destinatario = "Todos";
let visibilidade = "Público";
let tipoMsg = "message";
const uuid = "c7bfeaaa-5d58-4541-95c1-e50a7735fb12";


function entrarChat() {
  nomePessoa = {
    name: prompt("Qual o seu nome?")
  };

  axios.post("https://mock-api.driven.com.br/api/v6/uol/participants/"+uuid, nomePessoa).then(entradaNovaPessoa).catch(nomeRepetido);
  setInterval(manterConexao, 5000);
  setInterval(buscarParticipantes, 10000);
  setInterval(buscarMsg, 3000);
}

function nomeRepetido(error) {
  if (error.response.status === 400) {
    nomePessoa = {
      name: prompt("Qual o seu nome?")
    };
    axios.post("https://mock-api.driven.com.br/api/v6/uol/participants/"+uuid, nomePessoa).then(entradaNovaPessoa).catch(nomeRepetido);
  } else {
    alert("Erro não identificado. Recarregue a página e tente novamente.");
  }
}

function entradaNovaPessoa() {
  buscarMsg();
  buscarParticipantes();
}

function manterConexao() {
  axios.post("https://mock-api.driven.com.br/api/v6/uol/status/"+uuid, nomePessoa).catch(nomeRepetido);
}

function enviarMsg() {
  if (visibilidade === "Público") {
    tipoMsg = "message";
  } else {
    tipoMsg = "private_message";
  }

  msgAPI = {
    from: nomePessoa.name,
    to: destinatario,
    text: document.querySelector(".nova_msg").value,
    type: tipoMsg
  };

  const destinatario_atual = participantes_filtrado.find(pessoa => pessoa.name === destinatario);
  if (destinatario_atual === undefined && destinatario !== "Todos") {
    alert("Destinatário não encontrado.");
    window.location.reload(true);
  }

  axios.post("https://mock-api.driven.com.br/api/v6/uol/messages/"+uuid, msgAPI).then(function (resp) {
    document.querySelector(".nova_msg").value = "";
    buscarMsg();
  }).catch(erroEnvioMsg);
}

function erroEnvioMsg (err) {
  if (err.response.status === 400) {
    window.location.reload(true)
  } else {
    alert("Erro não identificado. Recarregue a página e tente novamente.");
  }
}

function buscarMsg() {
  axios.get("https://mock-api.driven.com.br/api/v6/uol/messages/"+uuid).then(function processarMsgRecebida(resp) {
    mensagens = resp.data;
    mensagens_filtrado = mensagens.filter(mensagem => mensagem.type === "status" || mensagem.type === "message" || mensagem.from === nomePessoa.name || mensagem.to === nomePessoa.name);
    renderizarMsg();
  });
}

function buscarParticipantes(){
  axios.get("https://mock-api.driven.com.br/api/v6/uol/participants/"+uuid).then(function processarParticipantes(resp) {
    participantes = resp.data;
    participantes_filtrado = participantes.filter(pessoa => pessoa.name !== nomePessoa.name);  
    renderizarParticipante();
  });  
}

function renderizarMsg() {
  document.querySelector(".conteiner").innerHTML = "";
  for (let i = 0; i < mensagens_filtrado.length; i++) {
    if (mensagens_filtrado[i].type === "status"){
      document.querySelector(".conteiner").innerHTML +=
      `<div class="entra_ou_sai">
        <span><span class="texto_time">(${mensagens_filtrado[i].time})</span><b> ${mensagens_filtrado[i].from}</b> ${mensagens_filtrado[i].text}</span>
      </div>`;
    } else if (mensagens_filtrado[i].type === "message") {
      document.querySelector(".conteiner").innerHTML +=
      `<div class="nova_mensagem">
        <span><span class="texto_time">(${mensagens_filtrado[i].time})</span><b> ${mensagens_filtrado[i].from}</b> para <b>${mensagens_filtrado[i].to}: </b>${mensagens_filtrado[i].text}</span>
      </div>`;
    } else if (mensagens_filtrado[i].type === "private_message") {
      document.querySelector(".conteiner").innerHTML +=
      `<div class="nova_mensagem_privada">
        <span><span class="texto_time">(${mensagens_filtrado[i].time})</span><b> ${mensagens_filtrado[i].from}</b> reservadamente para <b>${mensagens_filtrado[i].to}: </b>${mensagens_filtrado[i].text}</span>
      </div>`;
    } 
  }
  document.querySelector(".publico_privado").innerHTML = `${destinatario} (${visibilidade})`;

  const elementoQueQueroQueApareca = document.querySelector('.conteiner');
  elementoQueQueroQueApareca.scrollIntoView({ block: 'end' });
}

function renderizarParticipante() {
  document.querySelector(".participantes").innerHTML = "";
  for (let i = 0; i < participantes_filtrado.length; i++) {
    document.querySelector(".participantes").innerHTML +=
    `<div class="participante" onclick="direcionaMsg(this)">
      <ion-icon name="person-circle-outline" class="icon3"></ion-icon>
      <p class="texto_sidebar">${participantes_filtrado[i].name}</p>
      <img class="check escondido" src="img/Vector.png" />
    </div>`;
  } 
}

function acessarSidebar() {
  document.querySelector('.escondido').classList.add("transparencia");
  document.querySelector('.escondido').classList.remove("escondido");
  document.querySelector('.escondido').classList.add("sidebar");
  // document.querySelector('.escondido').classList.add("move-sidebar");
  document.querySelector('.escondido').classList.remove("escondido");
}

function voltaChat(){
  document.querySelector('.sidebar').classList.add("escondido");
  // document.querySelector('.sidebar').classList.remove("move-sidebar");
  document.querySelector('.sidebar').classList.remove("sidebar");
  document.querySelector('.transparencia').classList.add("escondido");
  document.querySelector('.transparencia').classList.remove("transparencia");
}

function direcionaMsg(escolhido) {
  if (document.querySelector('.este') === null){
    escolhido.classList.add("este");
    destinatario = document.querySelector('.este .texto_sidebar').innerHTML;
    document.querySelector('.este .check').classList.remove("escondido");
    document.querySelector(".publico_privado").innerHTML = `${destinatario} (${visibilidade})`;
  } else if (document.querySelector('.este') === escolhido) {
    destinatario = "Todos";
    document.querySelector('.este .check').classList.add("escondido");
    escolhido.classList.remove("este");
    document.querySelector(".publico_privado").innerHTML = `${destinatario} (${visibilidade})`;
  } else {
    document.querySelector('.este .check').classList.add("escondido");
    document.querySelector('.este').classList.remove("este");
    escolhido.classList.add("este");
    destinatario = document.querySelector('.este .texto_sidebar').innerHTML;
    document.querySelector('.este .check').classList.remove("escondido");
    document.querySelector(".publico_privado").innerHTML = `${destinatario} (${visibilidade})`;
  }
}

function escolhaVisibilidade(escolhido) {
  if (document.querySelector('.esta') === null){
    escolhido.classList.add("esta");
    visibilidade = document.querySelector('.esta .texto_sidebar').innerHTML;
    document.querySelector('.esta .check').classList.remove("escondido");
    document.querySelector(".publico_privado").innerHTML = `${destinatario} (${visibilidade})`;
  } else if (document.querySelector('.esta') === escolhido){
    visibilidade = "Público";
    document.querySelector('.esta .check').classList.add("escondido");
    escolhido.classList.remove("esta");
    document.querySelector(".publico_privado").innerHTML = `${destinatario} (${visibilidade})`;
  } else {
    document.querySelector('.esta .check').classList.add("escondido");
    document.querySelector('.esta').classList.remove("esta");
    escolhido.classList.add("esta");
    visibilidade = document.querySelector('.esta .texto_sidebar').innerHTML;
    document.querySelector('.esta .check').classList.remove("escondido");
    document.querySelector(".publico_privado").innerHTML = `${destinatario} (${visibilidade})`;
  }
}

entrarChat();

