# 🎮 Interligado Livre - 3 Modos de Jogo

Uma evolução do jogo "Racha Cuca Interligados" com **3 modos diferentes** para gerar grafos de palavras associadas.

## 📋 Modos Disponíveis

### 1️⃣ **Modo Offline** (Recomendado)
- ✅ **Instantâneo** - Sem latência
- ✅ **Gratuito** - Zero API Keys necessárias
- ✅ **Sem Internet** - Funciona offline completamente
- ✅ **Constelações Pré-construídas** - 8 temas enormes com centenas de palavras

**Temas Disponíveis:**
- 🖥️ **Tecnologia** - Computador, CPU, Processador, Memória, Software...
- 🌳 **Natureza** - Floresta, Árvore, Animal, Biodiversidade, Ecossistema...
- 🌌 **Astronomia** - Universo, Galáxia, Estrela, Planeta, Espaço...
- ❤️ **Corpo Humano** - Coração, Sangue, Célula, Circulação...
- 🎬 **Cinema** - Filme, Ator, Diretor, Roteiro, Produção...
- ⚡ **Mitologia** - Deus, Mito, Herói, Lenda, Divino...
- 🍳 **Culinária** - Cozinha, Chef, Receita, Ingrediente, Sabor...
- 🎵 **Música** - Som, Nota, Ritmo, Harmonia, Instrumento...
- ⚽ **Esportes** - Futebol, Bola, Jogador, Gol, Time...

### 2️⃣ **Modo Gemini IA** (Google Gemini API)
- 🤖 **Inteligência Artificial** - Gemini gera palavras criativas e personalizadas
- 🌐 **API Key Obrigatória** - https://makersuite.google.com/app/apikey
- 💰 **Gratuito** - Tier gratuito do Google Gemini
- 📝 **Personalizado** - Qualquer palavra/tema que você digitizar
- ⚡ **Criativo** - Gera conexões únicas baseadas em semântica

### 3️⃣ **Modo Ollama** (Modelo Local)
- 🚀 **Completamente Local** - Roda no seu computador
- 🔒 **Privado** - Sem enviar dados para nenhum servidor
- 💯 **Sem API Key** - Nenhuma autenticação necessária
- 📦 **Modelos Suportados**: mistral, llama2, neural-chat, starling-lm
- ⚡ **Rápido** - Dependente do seu hardware

**Instalação do Ollama:**
```bash
# Download em https://ollama.ai

# Fazer download de um modelo
ollama pull mistral

# Rodar Ollama (rodará em http://localhost:11434)
ollama serve
```

---

## 🏗️ Arquitetura da Solução

### Novo Arquivo: `src/data/constellations.ts`
Contém 8 constelações pré-construídas com grafos complexos:
- Cada constelação tem 20-30 nós
- Conexões semanticamente significativas
- Estrutura em grafo pronta para uso

### Tipos Atualizados: `src/types.ts`
```typescript
type GameMode = 'offline' | 'gemini' | 'ollama';

interface GameConfig {
  mode: GameMode;
  geminiKey?: string;        // Para Gemini
  ollamaUrl?: string;        // Para Ollama
  ollamaModel?: string;      // Para Ollama
}
```

### Serviço de IA: `src/services/aiService.ts`
Agora com 3 funções:
1. `generateOfflineGraph()` - Usa constelações pré-construídas
2. `generateGeminiGraph()` - Chama Google Gemini API
3. `generateOllamaGraph()` - Chama servidor Ollama local
4. `generateWordGraph()` - Roteia para o modo correto

### Componente Atualizado: `src/components/SetupScreen.tsx`
- Seleção visual dos 3 modos
- Botões de tema para modo offline
- Inputs de API Key para Gemini
- Inputs de URL/Modelo para Ollama
- Validação automática de campos

---

## 🎯 Fluxo de Uso

### Offline
1. Abra o app
2. Clique em "Offline"
3. Clique em um dos temas (ou digite outra palavra)
4. Clique "Iniciar Jogo"
5. ✅ Grafo carrega instantaneamente!

### Gemini
1. Abra https://makersuite.google.com/app/apikey
2. Crie e copie sua API Key
3. Cole no campo "Gemini API Key"
4. Digite qualquer palavra/tema
5. Clique "Iniciar Jogo"
6. ⏳ Aguarde a IA gerar o grafo

### Ollama
1. Instale Ollama de https://ollama.ai
2. Rode `ollama pull mistral`
3. Rode `ollama serve`
4. No app, clique em "Ollama Local"
5. Deixe URL padrão `http://localhost:11434`
6. Digite qualquer palavra/tema
7. Clique "Iniciar Jogo"

---

## 💻 Instalação & Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar localmente
npm run dev

# Build para produção
npm run build
```

---

## 📊 Comparação de Modos

| Feature | Offline | Gemini | Ollama |
|---------|---------|--------|--------|
| Velocidade | ⚡ Instantânea | ⏳ 2-5s | ⏳ 5-30s |
| Personalização | 15% (8 temas) | 100% (qualquer palavra) | 100% (qualquer palavra) |
| Custo | 🆓 Gratuito | 🆓 Gratuito (tier) | 🆓 Gratuito |
| Conexão Internet | ❌ Não precisa | ✅ Obrigatória | ❌ Não precisa |
| Qualidade | ⭐⭐⭐ Boa | ⭐⭐⭐⭐⭐ Excelente | ⭐⭐⭐⭐ Muito Boa |
| API Key | ❌ Não | ✅ Sim | ❌ Não |
| Privacidade | 🔒 100% Local | 📤 Envia dados | 🔒 100% Local |

---

## 🎮 Próximas Melhorias Possíveis

- [ ] Salvar progresso do jogo
- [ ] Leaderboard local
- [ ] Mais constelações offline
- [ ] Suporte a múltiplos idiomas
- [ ] Modo colaborativo (multiplayer)
- [ ] Análise de etimologia das palavras
- [ ] Visualização 3D do grafo

---

## 📝 Estrutura de Dados

Cada nó do grafo:
```json
{
  "id": "identificador_unico",
  "word": "Palavra Real",
  "connections": ["id1", "id2", "id3"]
}
```

Exemplo:
```json
{
  "id": "coracao",
  "word": "Coração",
  "connections": ["sangue", "batimento", "ventriculo", "amor", "bomba"]
}
```

---

## 🚀 Performance

- **Offline**: < 100ms para carregar
- **Gemini**: 2-5 segundos (dependendo de latência)
- **Ollama**: 5-30 segundos (dependendo do modelo e hardware)

---

## 🔐 Segurança

- **Offline**: Completamente seguro, sem dados transmitidos
- **Gemini**: Use API Key segura (não compartilhe)
- **Ollama**: Completamente privado

**IMPORTANTE**: Nunca compartilhe sua Gemini API Key publicamente!

---

## 📞 Suporte

Para problemas com:
- **Offline**: Limpe cache, recarregue a página
- **Gemini**: Verifique API Key em https://makersuite.google.com/app/apikey
- **Ollama**: Certifique-se que `ollama serve` está rodando em `http://localhost:11434`

---

**Versão**: 2.0.0  
**Data**: 2026  
**Autor**: Everton
