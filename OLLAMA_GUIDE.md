# 🚀 Guia: Usando Ollama com Interligado

## O que é Ollama?

Ollama permite rodar modelos de IA **localmente no seu computador** sem precisar de:
- ❌ Conexão com internet
- ❌ API Keys
- ❌ Conta em serviços externo
- ❌ Gastos de API

## Instalação

### macOS
```bash
# Fazer download direto
# https://ollama.ai/download

# Ou via Homebrew
brew install ollama

# Iniciar Ollama
ollama serve
```

### Linux
```bash
curl https://ollama.ai/install.sh | sh
ollama serve
```

### Windows
```bash
# Download do instalador em https://ollama.ai/download/windows
# Execute o instalador e siga as instruções
# O Ollama iniciará automaticamente
```

## Escolher um Modelo

Ollama suporta vários modelos. Para o jogo, recomendo:

### Option 1: **Mistral** (Recomendado)
Ótimo balance entre velocidade e qualidade
```bash
ollama pull mistral
# ~5GB
```

### Option 2: **Llama 2**
Mais rápido, mas um pouco menos criativo
```bash
ollama pull llama2
# ~4GB
```

### Option 3: **Neural Chat**
Otimizado para conversas
```bash
ollama pull neural-chat
# ~8GB
```

### Option 4: **Starling-LM**
Mais criativo e de alta qualidade
```bash
ollama pull starling-lm
# ~15GB
```

## Iniciar Ollama

```bash
# Simplemente rode:
ollama serve

# Ollama rodará em http://localhost:11434
# Deixe esse terminal aberto
```

## Usar no Jogo

1. Entre no app Interligado
2. Clique em "Ollama Local"
3. Deixe URL como: `http://localhost:11434`
4. Digite o modelo (ex: `mistral`, `llama2`, `neural-chat`)
5. Digite uma palavra/tema
6. Clique "Iniciar Jogo"

## Performance por Hardware

| Hardware | Recomendação |
|----------|-------------|
| Mac M1/M2 | mistral ou llama2 (rápido) |
| Mac Intel | mistral (mais lento) |
| RTX 3060+ | starling-lm ou mistral (grátis) |
| CPU apenas | llama2 (mais otimizado para CPU) |

## Dicas de Performance

### Ver modelos instalados
```bash
ollama list
```

### Remover um modelo
```bash
ollama rm mistral
```

### Rodar em porta diferente
```bash
ollama serve --port 8000
```

### Ver status
```bash
curl http://localhost:11434/api/generate
```

## Troubleshooting

### "Connection refused"
- ✅ Certifique-se que `ollama serve` está rodando
- ✅ Não feche o terminal do Ollama
- ✅ Espere 2-3 segundos para conectar

### Modelo não encontrado
```bash
# Verifique modelos disponíveis
ollama list

# Se não aparecer, faça download
ollama pull mistral
```

### Lento demais
- 🔴 CPU: Use `llama2` ou modelo menor
- 🟡 RAM limitada: Feche outros programas
- 🟢 GPU: Use modelo maior como `starling-lm`

### Usar diferentes modelos
Você pode trocar o modelo a qualquer momento no app sem reiniciar!

## Comparação entre Modelos

| Modelo | Tamanho | Velocidade | Qualidade | Criatividade |
|--------|---------|-----------|-----------|--------------|
| llama2 | 4GB | ⚡⚡⚡ | ⭐⭐⭐ | ⭐⭐ |
| mistral | 5GB | ⚡⚡ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| neural-chat | 8GB | ⚡ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| starling-lm | 15GB | ⏳ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## Exemplos de Uso

### Tema: Tecnologia
```
Modelo: mistral
Palavras: 25
Resultado: Computador → CPU → Processador → Velocidade → MHz...
```

### Tema: Mitologia
```
Modelo: starling-lm
Palavras: 30
Resultado: Deus → Olimpo → Zeus → Poder → Divino...
```

## Links Úteis

- **Site Oficial**: https://ollama.ai
- **Modelos Disponíveis**: https://ollama.ai/library
- **Discord Ollama**: https://discord.gg/ollama-ai

---

**Dica**: Comece com `mistral` que é um ótimo meio termo entre velocidade e qualidade! 🎯
