
// Variáveis globais
const apiKeyInput = document.getElementById('apiKey')
const gameSelect = document.getElementById('gameSelect')
const questionInput = document.getElementById('questionInput')
const askButton = document.getElementById('askButton')
const aiResponse = document.getElementById('aiResponse')
const form = document.getElementById('form')

const markDownToHTML = (text) =>
{
    const converter = new showdown.converter()
    return converter.maakeHtml(text)
}
// chave api: AIzaSyD9uP6pHv-rVZqc_hb8scizouiT5j6DWPY
const perguntarAI = async(question, game, apiKey) => 
{
    const model = "gemini-2.5-flash"
    const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    
    const pergunta = `
        ## Especialidade
        - Você é um especialista assistente de meta para o jogo ${game}
        ## Tarefa
        - Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estrátegias, build e dicas
        ## Regras
        - Se você não sabe a resposta, responde com 'Não sei' e não tente inventar uma resposta
        - Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não está relacionada ao jogo'
        - COnsidere a data atual ${new Date().toLocaleDateString()}
        - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
        - Nunca responda itens que você não tenha certeza de que existe no patch atual.
        ## Resposta
        - Economize na resposta, seja direto e responda no máximo no máximo 500 caracteres. Responda em markdown
        - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está perguntando
        ## Exemplo de resposta
        - Pergunta do usuário: Melhor builda Rengar jungle
        resposta: A build mais atual é: \n\n **Itens:** \n\n coloque os itens aqui.
        \n\n **Runas:** \n\nexemplo de runas \n\n

        ___
        Aqui está a pergunta do usuário: ${question}
    `

    const contents = [{
        role: "user",
        parts: [{
            text: pergunta
        }]
    }]

    const tools = [{
        google_search: {}
    }]

    // chamada da API
    const response = await fetch(geminiURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents,
            tools
        })
    })

    const data = await response.json()
    return data.candidates[0].content.parts[0].text
}

const enviarFormulario = async(event) => 
{
    event.preventDefault()

    const apiKey = apiKeyInput.value
    const game = gameSelect.value
    const question = questionInput.value

    if(apiKey == '' || game == '' || question == '')
    {
        alert('Por favor, preencha todos os campos"')
        return
    }

    askButton.disabled = true
    askButton.textContent = 'Perguntando...'
    askButton.classList.add('loading')

    try 
    {
        const text = await perguntarAI(question, game, apiKey)
        aiResponse.querySelector('.responde-content').innerHTML = markDownToHTML(text)
        aiResponse.classList.remove('hidden')
    }
    catch (error)
    {
        console.log('Erro: ', error)
    } 
    finally 
    {
        askButton.disabled = false
        askButton.textContent = 'Perguntar'
        askButton.classList.remove('loading')
    }
}

form.addEventListener('submit', enviarFormulario)