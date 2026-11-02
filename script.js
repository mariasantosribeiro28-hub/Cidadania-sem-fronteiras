
document.addEventListener("DOMContentLoaded", () => {

    // =====================================
    // ELEMENTOS DA BUSCA
    // =====================================

    const estadoSelect = document.getElementById("estado");
    const cidadeSelect = document.getElementById("cidade");
    const botaoBuscar = document.getElementById("buscarServicos");

    const mensagemBusca = document.getElementById("mensagemBusca");
    const resultadosServicos = document.getElementById("resultadosServicos");
    const gradeResultados = document.getElementById("gradeResultados");
    const localSelecionado = document.getElementById("localSelecionado");


    // =====================================
    // IDIOMAS
    // =====================================

    const seletorIdioma = document.getElementById("idioma");

    const idiomasPermitidos = ["pt", "en", "es"];

    const idiomaSalvo = localStorage.getItem("idioma");

    let idiomaAtual = idiomasPermitidos.includes(idiomaSalvo)
        ? idiomaSalvo
        : "pt";

    function traduzir(textos) {
        return textos[idiomaAtual] || textos.pt;
    }

    function alterarIdioma(idioma) {

        if (!idiomasPermitidos.includes(idioma)) {
            idioma = "pt";
        }

        idiomaAtual = idioma;

        document.documentElement.lang =
            idioma === "en" ? "en-US" :
            idioma === "es" ? "es-ES" :
            "pt-BR";

        document.querySelectorAll("[data-pt][data-en][data-es]")
            .forEach(elemento => {
                elemento.textContent = elemento.dataset[idioma];
            });

        localStorage.setItem("idioma", idioma);

        if (seletorIdioma) {
            seletorIdioma.value = idioma;
        }

        atualizarOpcoesLocalizacao();
        atualizarRotuloAudio();
    }

    if (seletorIdioma) {
        seletorIdioma.addEventListener("change", () => {
            alterarIdioma(seletorIdioma.value);
        });
    }


    // =====================================
    // ACESSIBILIDADE - TAMANHO DO TEXTO
    // =====================================

    const aumentar = document.getElementById("aumentarTexto");
    const diminuir = document.getElementById("diminuirTexto");

    let escalaSalva = Number(localStorage.getItem("escalaTexto"));

    let escala = Number.isFinite(escalaSalva) && escalaSalva >= 0.8 && escalaSalva <= 1.5
        ? escalaSalva
        : 1;

    function aplicarEscala() {
        document.documentElement.style.setProperty("--font-scale", escala);
        localStorage.setItem("escalaTexto", String(escala));
    }

    if (aumentar) {
        aumentar.addEventListener("click", () => {
            escala = Math.min(1.5, Math.round((escala + 0.1) * 10) / 10);
            aplicarEscala();
        });
    }

    if (diminuir) {
        diminuir.addEventListener("click", () => {
            escala = Math.max(0.8, Math.round((escala - 0.1) * 10) / 10);
            aplicarEscala();
        });
    }

    aplicarEscala();


    // =====================================
    // ALTO CONTRASTE
    // =====================================

    const contraste = document.getElementById("contraste");

    const contrasteAtivo =
        localStorage.getItem("altoContraste") === "true";

    document.body.classList.toggle("alto-contraste", contrasteAtivo);

    function atualizarBotaoContraste() {
        if (contraste) {
            const ativo = document.body.classList.contains("alto-contraste");
            contraste.setAttribute("aria-pressed", String(ativo));
        }
    }

    if (contraste) {
        contraste.addEventListener("click", () => {
            document.body.classList.toggle("alto-contraste");

            const ativo = document.body.classList.contains("alto-contraste");

            localStorage.setItem("altoContraste", String(ativo));
            atualizarBotaoContraste();
        });
    }

    atualizarBotaoContraste();


    // =====================================
    // LEITURA SIMPLIFICADA
    // =====================================

    const leituraSimples = document.getElementById("leituraSimples");

    const leituraSimplesAtiva =
        localStorage.getItem("leituraSimples") === "true";

    document.body.classList.toggle("leitura-simples", leituraSimplesAtiva);

    function atualizarBotaoLeituraSimples() {
        if (leituraSimples) {
            const ativo = document.body.classList.contains("leitura-simples");
            leituraSimples.setAttribute("aria-pressed", String(ativo));
        }
    }

    if (leituraSimples) {
        leituraSimples.addEventListener("click", () => {
            document.body.classList.toggle("leitura-simples");

            const ativo = document.body.classList.contains("leitura-simples");

            localStorage.setItem("leituraSimples", String(ativo));
            atualizarBotaoLeituraSimples();
        });
    }

    atualizarBotaoLeituraSimples();


    // =====================================
    // OPÇÕES DE LOCALIZAÇÃO
    // =====================================

    function criarOpcao(select, valor, texto) {
        const opcao = document.createElement("option");
        opcao.value = valor;
        opcao.textContent = texto;
        select.appendChild(opcao);
        return opcao;
    }

    function atualizarOpcoesLocalizacao() {

        if (!estadoSelect || !cidadeSelect) return;

        const opcaoEstado = estadoSelect.querySelector('option[value=""]');
        const opcaoCidade = cidadeSelect.querySelector('option[value=""]');

        if (opcaoEstado) {
            opcaoEstado.textContent = traduzir({
                pt: "Selecione um estado",
                en: "Select a state",
                es: "Seleccione un estado"
            });
        }

        if (opcaoCidade) {
            opcaoCidade.textContent = traduzir(
                estadoSelect.value
                    ? {
                        pt: "Selecione uma cidade",
                        en: "Select a city",
                        es: "Seleccione una ciudad"
                    }
                    : {
                        pt: "Selecione primeiro um estado",
                        en: "Select a state first",
                        es: "Seleccione primero un estado"
                    }
            );
        }
    }


    // =====================================
    // MENSAGENS DA BUSCA
    // =====================================

    function mostrarMensagem(textos) {

        if (!mensagemBusca) return;

        mensagemBusca.textContent =
            typeof textos === "string"
                ? textos
                : traduzir(textos);
    }


    // =====================================
    // CARREGAR ESTADOS PELO IBGE
    // =====================================

    async function carregarEstados() {

        if (!estadoSelect) return;

        estadoSelect.disabled = true;
        estadoSelect.innerHTML = "";

        criarOpcao(
            estadoSelect,
            "",
            traduzir({
                pt: "Carregando estados...",
                en: "Loading states...",
                es: "Cargando estados..."
            })
        );

        mostrarMensagem({
            pt: "Carregando a lista de estados...",
            en: "Loading the list of states...",
            es: "Cargando la lista de estados..."
        });

        try {

            const resposta = await fetch(
                "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
            );

            if (!resposta.ok) {
                throw new Error("Não foi possível carregar os estados.");
            }

            const estados = await resposta.json();

            estadoSelect.innerHTML = "";

            criarOpcao(
                estadoSelect,
                "",
                traduzir({
                    pt: "Selecione um estado",
                    en: "Select a state",
                    es: "Seleccione un estado"
                })
            );

            estados.forEach(estado => {

                const opcao = criarOpcao(
                    estadoSelect,
                    estado.id,
                    `${estado.nome} (${estado.sigla})`
                );

                opcao.dataset.sigla = estado.sigla;

            });

            estadoSelect.disabled = false;
            mostrarMensagem("");

        } catch (erro) {

            console.error("Erro ao carregar estados:", erro);

            estadoSelect.innerHTML = "";

            criarOpcao(
                estadoSelect,
                "",
                traduzir({
                    pt: "Erro ao carregar estados",
                    en: "Error loading states",
                    es: "Error al cargar estados"
                })
            );

            mostrarMensagem({
                pt: "Não foi possível carregar os estados. Verifique sua conexão com a internet e atualize a página.",
                en: "Could not load states. Check your internet connection and refresh the page.",
                es: "No fue posible cargar los estados. Compruebe su conexión a internet y actualice la página."
            });
        }
    }


    // =====================================
    // CARREGAR CIDADES PELO IBGE
    // =====================================

    async function carregarCidades(idEstado) {

        if (!cidadeSelect || !botaoBuscar) return;

        cidadeSelect.disabled = true;
        botaoBuscar.disabled = true;
        cidadeSelect.innerHTML = "";

        if (resultadosServicos) {
            resultadosServicos.hidden = true;
        }

        if (!idEstado) {

            criarOpcao(
                cidadeSelect,
                "",
                traduzir({
                    pt: "Selecione primeiro um estado",
                    en: "Select a state first",
                    es: "Seleccione primero un estado"
                })
            );

            mostrarMensagem("");
            return;
        }

        criarOpcao(
            cidadeSelect,
            "",
            traduzir({
                pt: "Carregando cidades...",
                en: "Loading cities...",
                es: "Cargando ciudades..."
            })
        );

        mostrarMensagem({
            pt: "Carregando municípios...",
            en: "Loading municipalities...",
            es: "Cargando municipios..."
        });

        try {

            const resposta = await fetch(
                `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${idEstado}/municipios?orderBy=nome`
            );

            if (!resposta.ok) {
                throw new Error("Não foi possível carregar as cidades.");
            }

            const cidades = await resposta.json();

            cidadeSelect.innerHTML = "";

            criarOpcao(
                cidadeSelect,
                "",
                traduzir({
                    pt: "Selecione uma cidade",
                    en: "Select a city",
                    es: "Seleccione una ciudad"
                })
            );

            cidades.forEach(cidade => {
                criarOpcao(cidadeSelect, cidade.nome, cidade.nome);
            });

            cidadeSelect.disabled = false;
            mostrarMensagem("");

        } catch (erro) {

            console.error("Erro ao carregar cidades:", erro);

            cidadeSelect.innerHTML = "";

            criarOpcao(
                cidadeSelect,
                "",
                traduzir({
                    pt: "Erro ao carregar cidades",
                    en: "Error loading cities",
                    es: "Error al cargar ciudades"
                })
            );

            mostrarMensagem({
                pt: "Não foi possível carregar os municípios. Tente selecionar o estado novamente.",
                en: "Could not load municipalities. Try selecting the state again.",
                es: "No fue posible cargar los municipios. Intente seleccionar el estado nuevamente."
            });
        }
    }


    // =====================================
    // EVENTOS DE ESTADO E CIDADE
    // =====================================

    if (estadoSelect && cidadeSelect && botaoBuscar) {

        estadoSelect.addEventListener("change", () => {
            carregarCidades(estadoSelect.value);
        });

        cidadeSelect.addEventListener("change", () => {

            botaoBuscar.disabled = !cidadeSelect.value;

            if (resultadosServicos) {
                resultadosServicos.hidden = true;
            }

        });
    }


    // =====================================
    // CATEGORIAS DE SERVIÇOS
    // =====================================

    const categorias = [

        {
            icone: "🏥",
            nome: {
                pt: "Saúde",
                en: "Healthcare",
                es: "Salud"
            },
            descricao: {
                pt: "Encontre unidades básicas de saúde, hospitais, postos de atendimento e serviços do SUS.",
                en: "Find public health centers, hospitals, clinics and healthcare services.",
                es: "Encuentre centros de salud, hospitales y servicios de atención pública."
            },
            pesquisa: "UBS unidades básicas de saúde hospitais SUS"
        },

        {
            icone: "🤝",
            nome: {
                pt: "Assistência social",
                en: "Social assistance",
                es: "Asistencia social"
            },
            descricao: {
                pt: "Consulte informações sobre CRAS, CREAS, programas sociais e atendimento à população.",
                en: "Find information about CRAS, CREAS and social assistance programs.",
                es: "Consulte información sobre CRAS, CREAS y programas de asistencia social."
            },
            pesquisa: "CRAS CREAS assistência social"
        },

        {
            icone: "💡",
            nome: {
                pt: "Energia elétrica",
                en: "Electricity",
                es: "Electricidad"
            },
            descricao: {
                pt: "Encontre informações sobre a distribuidora de energia e atendimento ao consumidor.",
                en: "Find information about electricity providers and customer services.",
                es: "Encuentre información sobre la compañía eléctrica y la atención al consumidor."
            },
            pesquisa: "distribuidora de energia elétrica atendimento"
        },

        {
            icone: "💧",
            nome: {
                pt: "Água e saneamento",
                en: "Water and sanitation",
                es: "Agua y saneamiento"
            },
            descricao: {
                pt: "Consulte os serviços de abastecimento de água, saneamento e atendimento.",
                en: "Find water supply, sanitation and customer service information.",
                es: "Consulte los servicios de suministro de agua, saneamiento y atención."
            },
            pesquisa: "abastecimento de água saneamento atendimento"
        },

        {
            icone: "📚",
            nome: {
                pt: "Educação",
                en: "Education",
                es: "Educación"
            },
            descricao: {
                pt: "Encontre escolas públicas, instituições de ensino e serviços educacionais.",
                en: "Find public schools, educational institutions and services.",
                es: "Encuentre escuelas públicas, instituciones educativas y servicios."
            },
            pesquisa: "escolas públicas instituições de ensino"
        },

        {
            icone: "📋",
            nome: {
                pt: "Outros serviços",
                en: "Other services",
                es: "Otros servicios"
            },
            descricao: {
                pt: "Consulte órgãos públicos, prefeitura e outros serviços disponíveis no município.",
                en: "Find public agencies, city hall and other municipal services.",
                es: "Consulte organismos públicos, ayuntamiento y otros servicios municipales."
            },
            pesquisa: "prefeitura órgãos públicos serviços municipais"
        }

    ];


    // =====================================
    // MOSTRAR RESULTADOS
    // =====================================

    function criarCartoesServicos(nomeCidade, siglaEstado) {

        if (!gradeResultados) return;

        gradeResultados.innerHTML = "";

        const localBusca = `${nomeCidade}, ${siglaEstado}, Brasil`;

        categorias.forEach(categoria => {

            const card = document.createElement("article");
            card.className = "card-servico";

            const icone = document.createElement("span");
            icone.className = "icone-servico";
            icone.setAttribute("aria-hidden", "true");
            icone.textContent = categoria.icone;

            const titulo = document.createElement("h3");
            titulo.dataset.pt = categoria.nome.pt;
            titulo.dataset.en = categoria.nome.en;
            titulo.dataset.es = categoria.nome.es;

            const descricao = document.createElement("p");
            descricao.dataset.pt = categoria.descricao.pt;
            descricao.dataset.en = categoria.descricao.en;
            descricao.dataset.es = categoria.descricao.es;

            const link = document.createElement("a");
            link.className = "botao botao-consultar";
            link.target = "_blank";
            link.rel = "noopener noreferrer";

            link.href =
                "https://www.google.com/maps/search/?api=1&query=" +
                encodeURIComponent(`${categoria.pesquisa} ${localBusca}`);

            link.dataset.pt = "Consultar locais";
            link.dataset.en = "Find locations";
            link.dataset.es = "Consultar lugares";

            card.appendChild(icone);
            card.appendChild(titulo);
            card.appendChild(descricao);
            card.appendChild(link);

            gradeResultados.appendChild(card);

        });

        alterarIdioma(idiomaAtual);
    }


    // =====================================
    // BOTÃO BUSCAR SERVIÇOS
    // =====================================

    if (botaoBuscar) {

        botaoBuscar.addEventListener("click", () => {

            const nomeCidade = cidadeSelect.value;
            const opcaoEstado = estadoSelect.selectedOptions[0];
            const siglaEstado = opcaoEstado.dataset.sigla;

            if (!nomeCidade || !siglaEstado) {

                mostrarMensagem({
                    pt: "Selecione um estado e uma cidade para continuar.",
                    en: "Select a state and a city to continue.",
                    es: "Seleccione un estado y una ciudad para continuar."
                });

                return;
            }

            criarCartoesServicos(nomeCidade, siglaEstado);

            if (localSelecionado) {
                localSelecionado.textContent = traduzir({
                    pt: `Local selecionado: ${nomeCidade} - ${siglaEstado}`,
                    en: `Selected location: ${nomeCidade} - ${siglaEstado}`,
                    es: `Ubicación seleccionada: ${nomeCidade} - ${siglaEstado}`
                });
            }

            if (resultadosServicos) {

                resultadosServicos.hidden = false;

                resultadosServicos.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

            mostrarMensagem("");
        });
    }


    // =====================================
    // LEITURA EM VOZ ALTA
    // =====================================

    const botaoAudio = document.getElementById("botaoAudio");
    const painelAudio = document.getElementById("painelAudio");

    const reproduzir = document.getElementById("reproduzir");
    const pausar = document.getElementById("pausar");
    const encerrar = document.getElementById("encerrar");

    function atualizarRotuloAudio() {
        if (!botaoAudio) return;

        const rotulos = {
            pt: "Abrir leitura em voz alta",
            en: "Open read aloud controls",
            es: "Abrir controles de lectura en voz alta"
        };

        botaoAudio.setAttribute("aria-label", rotulos[idiomaAtual]);
    }

    if (botaoAudio && painelAudio) {

        botaoAudio.addEventListener("click", () => {

            painelAudio.hidden = !painelAudio.hidden;

            botaoAudio.setAttribute(
                "aria-expanded",
                String(!painelAudio.hidden)
            );

            if (!painelAudio.hidden && reproduzir) {
                reproduzir.focus();
            }
        });
    }

    if (reproduzir) {

        reproduzir.addEventListener("click", () => {

            if (!("speechSynthesis" in window)) {
                mostrarMensagem({
                    pt: "Seu navegador não oferece suporte à leitura em voz alta.",
                    en: "Your browser does not support read aloud.",
                    es: "Su navegador no admite la lectura en voz alta."
                });
                return;
            }

            window.speechSynthesis.cancel();

            const conteudo = document.querySelector("main");

            if (!conteudo) return;

            const textoLeitura = conteudo.innerText.trim();

            if (!textoLeitura) return;

            const leitura = new SpeechSynthesisUtterance(textoLeitura);

            leitura.lang =
                idiomaAtual === "en" ? "en-US" :
                idiomaAtual === "es" ? "es-ES" :
                "pt-BR";

            leitura.rate = 0.95;

            window.speechSynthesis.speak(leitura);
        });
    }

    if (pausar) {
        pausar.addEventListener("click", () => {
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.pause();
            }
        });
    }

    if (encerrar) {
        encerrar.addEventListener("click", () => {
            window.speechSynthesis.cancel();
        });
    }


    // =====================================
    // INICIAR A PÁGINA
    // =====================================

    alterarIdioma(idiomaAtual);
    carregarEstados();


    // =====================================
    // ENCERRAR ÁUDIO AO SAIR DA PÁGINA
    // =====================================

    window.addEventListener("beforeunload", () => {

        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }

    });

});
