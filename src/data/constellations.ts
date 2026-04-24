import { normalizeWord } from '../lib/utils';

export interface ConstellationNode {
  id: string;
  word: string;
  connections: string[];
}

export interface Constellation {
  theme: string;
  description: string;
  seedWord: string;
  aliases: string[];
  nodes: ConstellationNode[];
}

interface ThemeDefinition {
  theme: string;
  description: string;
  seedWord: string;
  aliases?: string[];
  nodes: Array<{
    word: string;
    connections: string[];
  }>;
}

export interface ThemeOption {
  theme: string;
  description: string;
  seedWord: string;
  totalWords: number;
}

function toId(value: string): string {
  return normalizeWord(value).replace(/[^a-z0-9]+/g, '');
}

function warnConstellationIssue(theme: string, message: string): void {
  console.warn(`[constellations] ${theme}: ${message}`);
}

function sanitizeConstellation(definition: ThemeDefinition): Constellation | null {
  const seenIds = new Set<string>();
  const validNodes = definition.nodes.filter((node) => {
    // Força palavra e conexões para minúsculo
    node.word = node.word.trim().toLocaleLowerCase();
    node.connections = node.connections.map(c => c.trim().toLocaleLowerCase());

    const trimmedWord = node.word;

    if (!trimmedWord) {
      warnConstellationIssue(definition.theme, 'registro ignorado por ter word vazia.');
      return false;
    }

    const id = toId(trimmedWord);
    if (!id) {
      warnConstellationIssue(definition.theme, `registro "${node.word}" ignorado por gerar id vazio.`);
      return false;
    }

    if (seenIds.has(id)) {
      warnConstellationIssue(
        definition.theme,
        `registro "${node.word}" ignorado porque o id normalizado "${id}" já existe.`,
      );
      return false;
    }

    seenIds.add(id);
    return true;
  });

  if (validNodes.length === 0) {
    warnConstellationIssue(definition.theme, 'constelação ignorada por não ter nós válidos.');
    return null;
  }

  const knownWords = new Set(validNodes.map((node) => node.word));
  const sanitizedSeedWord = knownWords.has(definition.seedWord) ? definition.seedWord : validNodes[0].word;

  if (sanitizedSeedWord !== definition.seedWord) {
    warnConstellationIssue(
      definition.theme,
      `seedWord "${definition.seedWord}" não existe. Usando "${sanitizedSeedWord}" no lugar.`,
    );
  }

  return {
    theme: definition.theme,
    description: definition.description,
    seedWord: sanitizedSeedWord,
    aliases: definition.aliases ?? [],
    nodes: validNodes.map((node) => ({
      id: toId(node.word),
      word: node.word,
      connections: node.connections
        .filter((connection) => {
          const isValid = knownWords.has(connection);
          if (!isValid) {
            warnConstellationIssue(
              definition.theme,
              `conexão inválida "${connection}" em "${node.word}" foi ignorada.`,
            );
          }
          return isValid;
        })
        .map(toId),
    })),
  };
}

const constellationDefinitions: ThemeDefinition[] = [
  {
    theme: 'Tecnologia',
    description: 'Computadores, internet, software e infraestrutura digital.',
    seedWord: 'Computador',
    aliases: ['programação', 'informatica', 'internet', 'software', 'hardware'],
    nodes: [
      { word: 'Computador', connections: ['Processador', 'Memória', 'Sistema Operacional', 'Monitor'] },
      { word: 'Processador', connections: ['Computador', 'Placa-mãe', 'Desempenho', 'Algoritmo'] },
      { word: 'Memória', connections: ['Computador', 'Armazenamento', 'Cache', 'Dados'] },
      { word: 'Sistema Operacional', connections: ['Computador', 'Aplicativo', 'Rede', 'Segurança'] },
      { word: 'Monitor', connections: ['Computador', 'Interface', 'Pixels', 'Imagem'] },
      { word: 'Placa-mãe', connections: ['Processador', 'Circuito', 'Energia', 'Hardware'] },
      { word: 'Desempenho', connections: ['Processador', 'Código', 'Benchmark', 'Latência'] },
      { word: 'Algoritmo', connections: ['Processador', 'Código', 'Lógica', 'Automação'] },
      { word: 'Armazenamento', connections: ['Memória', 'Nuvem', 'Backup', 'Banco de Dados'] },
      { word: 'Cache', connections: ['Memória', 'Latência', 'Velocidade', 'Dados'] },
      { word: 'Dados', connections: ['Memória', 'Banco de Dados', 'Nuvem', 'Segurança'] },
      { word: 'Aplicativo', connections: ['Sistema Operacional', 'Interface', 'Código', 'Usuário'] },
      { word: 'Rede', connections: ['Sistema Operacional', 'Internet', 'Servidor', 'Protocolo'] },
      { word: 'Segurança', connections: ['Sistema Operacional', 'Criptografia', 'Firewall', 'Dados'] },
      { word: 'Interface', connections: ['Monitor', 'Aplicativo', 'Usuário', 'Imagem'] },
      { word: 'Pixels', connections: ['Monitor', 'Imagem', 'Cor', 'Resolução'] },
      { word: 'Imagem', connections: ['Monitor', 'Pixels', 'Interface', 'Resolução'] },
      { word: 'Circuito', connections: ['Placa-mãe', 'Hardware', 'Energia', 'Transistor'] },
      { word: 'Energia', connections: ['Placa-mãe', 'Circuito', 'Fonte', 'Hardware'] },
      { word: 'Hardware', connections: ['Placa-mãe', 'Circuito', 'Fonte', 'Servidor'] },
      { word: 'Código', connections: ['Desempenho', 'Algoritmo', 'Aplicativo', 'Lógica'] },
      { word: 'Benchmark', connections: ['Desempenho', 'Velocidade', 'Latência', 'Servidor'] },
      { word: 'Latência', connections: ['Desempenho', 'Cache', 'Rede', 'Benchmark'] },
      { word: 'Lógica', connections: ['Algoritmo', 'Código', 'Automação', 'Protocolo'] },
      { word: 'Automação', connections: ['Algoritmo', 'Lógica', 'Servidor', 'Internet'] },
      { word: 'Nuvem', connections: ['Armazenamento', 'Dados', 'Servidor', 'Internet'] },
      { word: 'Backup', connections: ['Armazenamento', 'Banco de Dados', 'Segurança', 'Nuvem'] },
      { word: 'Banco de Dados', connections: ['Armazenamento', 'Dados', 'Backup', 'Servidor'] },
      { word: 'Internet', connections: ['Rede', 'Servidor', 'Nuvem', 'Protocolo'] },
      { word: 'Servidor', connections: ['Rede', 'Internet', 'Hardware', 'Banco de Dados'] },
      { word: 'Protocolo', connections: ['Rede', 'Internet', 'Lógica', 'Criptografia'] },
      { word: 'Criptografia', connections: ['Segurança', 'Protocolo', 'Firewall', 'Dados'] },
      { word: 'Firewall', connections: ['Segurança', 'Criptografia', 'Rede', 'Servidor'] },
      { word: 'Usuário', connections: ['Aplicativo', 'Interface', 'Internet', 'Experiência'] },
      { word: 'Cor', connections: ['Pixels', 'Imagem', 'Resolução', 'Interface'] },
      { word: 'Resolução', connections: ['Pixels', 'Imagem', 'Cor', 'Monitor'] },
      { word: 'Transistor', connections: ['Circuito', 'Processador', 'Energia', 'Hardware'] },
      { word: 'Fonte', connections: ['Energia', 'Hardware', 'Computador', 'Circuito'] },
      { word: 'Velocidade', connections: ['Cache', 'Benchmark', 'Latência', 'Desempenho'] },
      { word: 'Experiência', connections: ['Usuário', 'Interface', 'Aplicativo', 'Desempenho'] },
    ],
  },
  {
    theme: 'Natureza',
    description: 'Ecossistemas, clima, plantas e animais.',
    seedWord: 'Floresta',
    aliases: ['meio ambiente', 'ecologia', 'bioma', 'fauna', 'flora'],
    nodes: [
      { word: 'Floresta', connections: ['Árvore', 'Biodiversidade', 'Solo', 'Chuva'] },
      { word: 'Árvore', connections: ['Floresta', 'Folha', 'Raiz', 'Fruto'] },
      { word: 'Biodiversidade', connections: ['Floresta', 'Espécie', 'Ecossistema', 'Habitat'] },
      { word: 'Solo', connections: ['Floresta', 'Raiz', 'Mineral', 'Rio'] },
      { word: 'Chuva', connections: ['Floresta', 'Nuvem', 'Água', 'Clima'] },
      { word: 'Folha', connections: ['Árvore', 'Fotossíntese', 'Clorofila', 'Oxigênio'] },
      { word: 'Raiz', connections: ['Árvore', 'Solo', 'Nutriente', 'Água'] },
      { word: 'Fruto', connections: ['Árvore', 'Semente', 'Polinização', 'Animal'] },
      { word: 'Espécie', connections: ['Biodiversidade', 'Evolução', 'Habitat', 'Animal'] },
      { word: 'Ecossistema', connections: ['Biodiversidade', 'Cadeia Alimentar', 'Equilíbrio', 'Clima'] },
      { word: 'Habitat', connections: ['Biodiversidade', 'Espécie', 'Animal', 'Abrigo'] },
      { word: 'Abrigo', connections: ['Habitat', 'Animal', 'Floresta', 'Rocha'] },
      { word: 'Mineral', connections: ['Solo', 'Nutriente', 'Rocha', 'Raiz'] },
      { word: 'Rio', connections: ['Solo', 'Água', 'Peixe', 'Nascentes'] },
      { word: 'Peixe', connections: ['Rio', 'Água', 'Animal', 'Cadeia Alimentar'] },
      { word: 'Nuvem', connections: ['Chuva', 'Vapor', 'Clima', 'Vento'] },
      { word: 'Água', connections: ['Chuva', 'Rio', 'Raiz', 'Vida'] },
      { word: 'Clima', connections: ['Chuva', 'Nuvem', 'Ecossistema', 'Temperatura'] },
      { word: 'Temperatura', connections: ['Clima', 'Vento', 'Sol', 'Vida'] },
      { word: 'Fotossíntese', connections: ['Folha', 'Clorofila', 'Luz Solar', 'Oxigênio'] },
      { word: 'Clorofila', connections: ['Folha', 'Fotossíntese', 'Luz Solar', 'Planta'] },
      { word: 'Oxigênio', connections: ['Folha', 'Fotossíntese', 'Vida', 'Atmosfera'] },
      { word: 'Nutriente', connections: ['Raiz', 'Mineral', 'Solo', 'Vida'] },
      { word: 'Semente', connections: ['Fruto', 'Germinação', 'Planta', 'Solo'] },
      { word: 'Polinização', connections: ['Fruto', 'Abelha', 'Flor', 'Semente'] },
      { word: 'Animal', connections: ['Fruto', 'Espécie', 'Habitat', 'Cadeia Alimentar'] },
      { word: 'Evolução', connections: ['Espécie', 'Adaptação', 'Tempo', 'Vida'] },
      { word: 'Cadeia Alimentar', connections: ['Ecossistema', 'Animal', 'Predador', 'Energia'] },
      { word: 'Equilíbrio', connections: ['Ecossistema', 'Clima', 'Vida', 'Biodiversidade'] },
      { word: 'Rocha', connections: ['Mineral', 'Montanha', 'Solo', 'Tempo'] },
      { word: 'Nascentes', connections: ['Rio', 'Montanha', 'Água', 'Vapor'] },
      { word: 'Vapor', connections: ['Nuvem', 'Água', 'Calor', 'Ciclo da Água'] },
      { word: 'Vento', connections: ['Nuvem', 'Clima', 'Semente', 'Temperatura'] },
      { word: 'Luz Solar', connections: ['Fotossíntese', 'Clorofila', 'Temperatura', 'Vida'] },
      { word: 'Planta', connections: ['Clorofila', 'Semente', 'Flor', 'Vida'] },
      { word: 'Vida', connections: ['Água', 'Oxigênio', 'Nutriente', 'Equilíbrio'] },
      { word: 'Atmosfera', connections: ['Oxigênio', 'Clima', 'Temperatura', 'Vento'] },
      { word: 'Germinação', connections: ['Semente', 'Solo', 'Água', 'Planta'] },
      { word: 'Abelha', connections: ['Polinização', 'Flor', 'Mel', 'Ecossistema'] },
      { word: 'Flor', connections: ['Polinização', 'Planta', 'Abelha', 'Fruto'] },
      { word: 'Predador', connections: ['Cadeia Alimentar', 'Animal', 'Habitat', 'Equilíbrio'] },
      { word: 'Montanha', connections: ['Rocha', 'Nascentes', 'Clima', 'Vento'] },
      { word: 'Ciclo da Água', connections: ['Vapor', 'Chuva', 'Rio', 'Água'] },
    ],
  },
  {
    theme: 'Astronomia',
    description: 'Universo, corpos celestes e exploração espacial.',
    seedWord: 'Universo',
    aliases: ['espaço', 'cosmos', 'planetas', 'estrelas'],
    nodes: [
      { word: 'Universo', connections: ['Galáxia', 'Estrela', 'Planeta', 'Espaço'] },
      { word: 'Galáxia', connections: ['Universo', 'Via Láctea', 'Gravidade', 'Nebulosa'] },
      { word: 'Estrela', connections: ['Universo', 'Luz', 'Fusão', 'Supernova'] },
      { word: 'Planeta', connections: ['Universo', 'Órbita', 'Atmosfera', 'Lua'] },
      { word: 'Espaço', connections: ['Universo', 'Vácuo', 'Exploração', 'Telescópio'] },
      { word: 'Via Láctea', connections: ['Galáxia', 'Sistema Solar', 'Braço Espiral', 'Buraco Negro'] },
      { word: 'Gravidade', connections: ['Galáxia', 'Órbita', 'Massa', 'Buraco Negro'] },
      { word: 'Nebulosa', connections: ['Galáxia', 'Gás', 'Poeira Cósmica', 'Estrela'] },
      { word: 'Luz', connections: ['Estrela', 'Espectro', 'Fóton', 'Telescópio'] },
      { word: 'Fusão', connections: ['Estrela', 'Hidrogênio', 'Energia', 'Hélio'] },
      { word: 'Supernova', connections: ['Estrela', 'Buraco Negro', 'Elemento', 'Explosão'] },
      { word: 'Órbita', connections: ['Planeta', 'Gravidade', 'Período', 'Satélite'] },
      { word: 'Atmosfera', connections: ['Planeta', 'Vida', 'Gás', 'Clima Espacial'] },
      { word: 'Lua', connections: ['Planeta', 'Satélite', 'Maré', 'Cratera'] },
      { word: 'Vácuo', connections: ['Espaço', 'Silêncio', 'Temperatura', 'Gravidade'] },
      { word: 'Exploração', connections: ['Espaço', 'Foguete', 'Astronauta', 'Missão'] },
      { word: 'Telescópio', connections: ['Espaço', 'Luz', 'Observatório', 'Imagem'] },
      { word: 'Sistema Solar', connections: ['Via Láctea', 'Sol', 'Planeta', 'Cometa'] },
      { word: 'Braço Espiral', connections: ['Via Láctea', 'Galáxia', 'Estrela', 'Poeira Cósmica'] },
      { word: 'Buraco Negro', connections: ['Via Láctea', 'Gravidade', 'Supernova', 'Horizonte de Eventos'] },
      { word: 'Massa', connections: ['Gravidade', 'Planeta', 'Estrela', 'Densidade'] },
      { word: 'Gás', connections: ['Nebulosa', 'Atmosfera', 'Hidrogênio', 'Cometa'] },
      { word: 'Poeira Cósmica', connections: ['Nebulosa', 'Braço Espiral', 'Cometa', 'Imagem'] },
      { word: 'Espectro', connections: ['Luz', 'Cor', 'Frequência', 'Observatório'] },
      { word: 'Fóton', connections: ['Luz', 'Energia', 'Velocidade', 'Espectro'] },
      { word: 'Hidrogênio', connections: ['Fusão', 'Gás', 'Hélio', 'Estrela'] },
      { word: 'Energia', connections: ['Fusão', 'Fóton', 'Explosão', 'Velocidade'] },
      { word: 'Hélio', connections: ['Fusão', 'Hidrogênio', 'Estrela', 'Elemento'] },
      { word: 'Elemento', connections: ['Supernova', 'Hélio', 'Átomo', 'Núcleo'] },
      { word: 'Explosão', connections: ['Supernova', 'Energia', 'Missão', 'Impacto'] },
      { word: 'Período', connections: ['Órbita', 'Rotação', 'Calendário', 'Tempo'] },
      { word: 'Satélite', connections: ['Órbita', 'Lua', 'Foguete', 'Comunicação'] },
      { word: 'Vida', connections: ['Atmosfera', 'Água', 'Planeta', 'Zona Habitável'] },
      { word: 'Clima Espacial', connections: ['Atmosfera', 'Sol', 'Radiação', 'Missão'] },
      { word: 'Foguete', connections: ['Exploração', 'Missão', 'Satélite', 'Combustível'] },
      { word: 'Astronauta', connections: ['Exploração', 'Missão', 'Gravidade', 'Estação Espacial'] },
      { word: 'Missão', connections: ['Exploração', 'Foguete', 'Astronauta', 'Comunicação'] },
      { word: 'Observatório', connections: ['Telescópio', 'Espectro', 'Imagem', 'Pesquisa'] },
      { word: 'Imagem', connections: ['Telescópio', 'Observatório', 'Poeira Cósmica', 'Cor'] },
      { word: 'Sol', connections: ['Sistema Solar', 'Clima Espacial', 'Energia', 'Zona Habitável'] },
    ],
  },
  {
    theme: 'Corpo Humano',
    description: 'Anatomia, fisiologia e sistemas vitais.',
    seedWord: 'Coração',
    aliases: ['anatomia', 'saúde', 'biologia', 'medicina'],
    nodes: [
      { word: 'Coração', connections: ['Sangue', 'Batimento', 'Artéria', 'Veia'] },
      { word: 'Sangue', connections: ['Coração', 'Oxigênio', 'Nutriente', 'Glóbulo Vermelho'] },
      { word: 'Batimento', connections: ['Coração', 'Pulso', 'Ritmo', 'Pressão Arterial'] },
      { word: 'Artéria', connections: ['Coração', 'Pressão Arterial', 'Circulação', 'Oxigênio'] },
      { word: 'Veia', connections: ['Coração', 'Circulação', 'Retorno Venoso', 'Sangue'] },
      { word: 'Oxigênio', connections: ['Sangue', 'Pulmão', 'Respiração', 'Célula'] },
      { word: 'Nutriente', connections: ['Sangue', 'Digestão', 'Energia', 'Célula'] },
      { word: 'Glóbulo Vermelho', connections: ['Sangue', 'Hemoglobina', 'Oxigênio', 'Medula Óssea'] },
      { word: 'Pulso', connections: ['Batimento', 'Ritmo', 'Artéria', 'Medição'] },
      { word: 'Ritmo', connections: ['Batimento', 'Pulso', 'Sistema Nervoso', 'Músculo'] },
      { word: 'Pressão Arterial', connections: ['Batimento', 'Artéria', 'Saúde', 'Circulação'] },
      { word: 'Circulação', connections: ['Artéria', 'Veia', 'Pulmão', 'Tecido'] },
      { word: 'Retorno Venoso', connections: ['Veia', 'Circulação', 'Músculo', 'Coração'] },
      { word: 'Pulmão', connections: ['Oxigênio', 'Respiração', 'Alvéolo', 'Circulação'] },
      { word: 'Respiração', connections: ['Oxigênio', 'Pulmão', 'Diafragma', 'Energia'] },
      { word: 'Célula', connections: ['Oxigênio', 'Nutriente', 'Mitocôndria', 'Membrana'] },
      { word: 'Digestão', connections: ['Nutriente', 'Estômago', 'Intestino', 'Metabolismo'] },
      { word: 'Energia', connections: ['Nutriente', 'Respiração', 'Metabolismo', 'Mitocôndria'] },
      { word: 'Hemoglobina', connections: ['Glóbulo Vermelho', 'Oxigênio', 'Sangue', 'Ferro'] },
      { word: 'Medula Óssea', connections: ['Glóbulo Vermelho', 'Osso', 'Célula', 'Imunidade'] },
      { word: 'Medição', connections: ['Pulso', 'Saúde', 'Temperatura', 'Diagnóstico'] },
      { word: 'Sistema Nervoso', connections: ['Ritmo', 'Cérebro', 'Neurônio', 'Músculo'] },
      { word: 'Músculo', connections: ['Ritmo', 'Retorno Venoso', 'Movimento', 'Energia'] },
      { word: 'Saúde', connections: ['Pressão Arterial', 'Medição', 'Imunidade', 'Metabolismo'] },
      { word: 'Tecido', connections: ['Circulação', 'Célula', 'Oxigênio', 'Regeneração'] },
      { word: 'Alvéolo', connections: ['Pulmão', 'Respiração', 'Oxigênio', 'Gás Carbônico'] },
      { word: 'Diafragma', connections: ['Respiração', 'Pulmão', 'Movimento', 'Músculo'] },
      { word: 'Mitocôndria', connections: ['Célula', 'Energia', 'Metabolismo', 'Oxigênio'] },
      { word: 'Membrana', connections: ['Célula', 'Transporte', 'Nutriente', 'Equilíbrio'] },
      { word: 'Estômago', connections: ['Digestão', 'Intestino', 'Alimento', 'Ácido'] },
      { word: 'Intestino', connections: ['Digestão', 'Absorção', 'Nutriente', 'Microbiota'] },
      { word: 'Metabolismo', connections: ['Digestão', 'Energia', 'Mitocôndria', 'Saúde'] },
      { word: 'Ferro', connections: ['Hemoglobina', 'Nutriente', 'Sangue', 'Absorção'] },
      { word: 'Osso', connections: ['Medula Óssea', 'Estrutura', 'Cálcio', 'Músculo'] },
      { word: 'Imunidade', connections: ['Medula Óssea', 'Saúde', 'Defesa', 'Célula'] },
      { word: 'Cérebro', connections: ['Sistema Nervoso', 'Neurônio', 'Memória', 'Coordenação'] },
      { word: 'Neurônio', connections: ['Sistema Nervoso', 'Cérebro', 'Sinapse', 'Memória'] },
      { word: 'Movimento', connections: ['Músculo', 'Diafragma', 'Coordenação', 'Energia'] },
      { word: 'Gás Carbônico', connections: ['Alvéolo', 'Respiração', 'Pulmão', 'Circulação'] },
      { word: 'Absorção', connections: ['Intestino', 'Ferro', 'Nutriente', 'Metabolismo'] },
    ],
  },
  {
    theme: 'Cinema',
    description: 'Filmes, narrativa audiovisual e produção.',
    seedWord: 'Cinema',
    aliases: ['filme', 'série', 'roteiro', 'audiovisual'],
    nodes: [
      { word: 'Cinema', connections: ['Filme', 'Diretor', 'Roteiro', 'Montagem'] },
      { word: 'Filme', connections: ['Cinema', 'Gênero', 'Cena', 'Trilha Sonora'] },
      { word: 'Diretor', connections: ['Cinema', 'Visão', 'Elenco', 'Enquadramento'] },
      { word: 'Roteiro', connections: ['Cinema', 'Personagem', 'Conflito', 'Diálogo'] },
      { word: 'Montagem', connections: ['Cinema', 'Corte', 'Ritmo', 'Sequência'] },
      { word: 'Gênero', connections: ['Filme', 'Drama', 'Comédia', 'Suspense'] },
      { word: 'Cena', connections: ['Filme', 'Enquadramento', 'Luz', 'Ator'] },
      { word: 'Trilha Sonora', connections: ['Filme', 'Música', 'Emoção', 'Clima'] },
      { word: 'Visão', connections: ['Diretor', 'Estilo', 'Tema', 'Fotografia'] },
      { word: 'Elenco', connections: ['Diretor', 'Ator', 'Personagem', 'Ensaios'] },
      { word: 'Enquadramento', connections: ['Diretor', 'Cena', 'Câmera', 'Fotografia'] },
      { word: 'Personagem', connections: ['Roteiro', 'Ator', 'Arco', 'Conflito'] },
      { word: 'Conflito', connections: ['Roteiro', 'Personagem', 'Clímax', 'Drama'] },
      { word: 'Diálogo', connections: ['Roteiro', 'Personagem', 'Subtexto', 'Cena'] },
      { word: 'Corte', connections: ['Montagem', 'Transição', 'Ritmo', 'Cena'] },
      { word: 'Ritmo', connections: ['Montagem', 'Corte', 'Tensão', 'Trilha Sonora'] },
      { word: 'Sequência', connections: ['Montagem', 'Cena', 'Narrativa', 'Plano'] },
      { word: 'Drama', connections: ['Gênero', 'Conflito', 'Emoção', 'Clímax'] },
      { word: 'Comédia', connections: ['Gênero', 'Tempo Cômico', 'Diálogo', 'Personagem'] },
      { word: 'Suspense', connections: ['Gênero', 'Tensão', 'Mistério', 'Trilha Sonora'] },
      { word: 'Luz', connections: ['Cena', 'Fotografia', 'Sombra', 'Clima'] },
      { word: 'Ator', connections: ['Cena', 'Elenco', 'Personagem', 'Expressão'] },
      { word: 'Música', connections: ['Trilha Sonora', 'Clima', 'Ritmo', 'Tema'] },
      { word: 'Emoção', connections: ['Trilha Sonora', 'Drama', 'Expressão', 'Clímax'] },
      { word: 'Clima', connections: ['Trilha Sonora', 'Luz', 'Suspense', 'Fotografia'] },
      { word: 'Estilo', connections: ['Visão', 'Tema', 'Fotografia', 'Direção de Arte'] },
      { word: 'Tema', connections: ['Visão', 'Música', 'Estilo', 'Narrativa'] },
      { word: 'Fotografia', connections: ['Visão', 'Enquadramento', 'Luz', 'Câmera'] },
      { word: 'Ensaios', connections: ['Elenco', 'Ator', 'Direção', 'Cena'] },
      { word: 'Câmera', connections: ['Enquadramento', 'Fotografia', 'Plano', 'Movimento'] },
      { word: 'Arco', connections: ['Personagem', 'Narrativa', 'Clímax', 'Transformação'] },
      { word: 'Clímax', connections: ['Conflito', 'Drama', 'Arco', 'Tensão'] },
      { word: 'Subtexto', connections: ['Diálogo', 'Tema', 'Personagem', 'Cena'] },
      { word: 'Transição', connections: ['Corte', 'Sequência', 'Tempo', 'Narrativa'] },
      { word: 'Tensão', connections: ['Ritmo', 'Suspense', 'Clímax', 'Mistério'] },
      { word: 'Narrativa', connections: ['Sequência', 'Tema', 'Arco', 'Tempo'] },
      { word: 'Tempo Cômico', connections: ['Comédia', 'Ritmo', 'Diálogo', 'Ator'] },
      { word: 'Mistério', connections: ['Suspense', 'Tensão', 'Conflito', 'Revelação'] },
      { word: 'Sombra', connections: ['Luz', 'Clima', 'Suspense', 'Fotografia'] },
      { word: 'Expressão', connections: ['Ator', 'Emoção', 'Cena', 'Silêncio'] },
    ],
  },
  {
    theme: 'Mitologia',
    description: 'Mitos, deuses, heróis e símbolos arquetípicos.',
    seedWord: 'Mitologia',
    aliases: ['deuses', 'lendas', 'olimpo', 'heróis'],
    nodes: [
      { word: 'Mitologia', connections: ['Deus', 'Lenda', 'Herói', 'Ritual'] },
      { word: 'Deus', connections: ['Mitologia', 'Olimpo', 'Poder', 'Templo'] },
      { word: 'Lenda', connections: ['Mitologia', 'Oralidade', 'Símbolo', 'Monstro'] },
      { word: 'Herói', connections: ['Mitologia', 'Jornada', 'Provação', 'Semideus'] },
      { word: 'Ritual', connections: ['Mitologia', 'Templo', 'Sacrifício', 'Profecia'] },
      { word: 'Olimpo', connections: ['Deus', 'Raio', 'Trono', 'Imortalidade'] },
      { word: 'Poder', connections: ['Deus', 'Raio', 'Destino', 'Trono'] },
      { word: 'Templo', connections: ['Deus', 'Ritual', 'Sacerdote', 'Oferenda'] },
      { word: 'Oralidade', connections: ['Lenda', 'Memória', 'Poema', 'Tradição'] },
      { word: 'Símbolo', connections: ['Lenda', 'Arquétipo', 'Profecia', 'Destino'] },
      { word: 'Monstro', connections: ['Lenda', 'Labirinto', 'Medo', 'Provação'] },
      { word: 'Jornada', connections: ['Herói', 'Destino', 'Provação', 'Retorno'] },
      { word: 'Provação', connections: ['Herói', 'Monstro', 'Jornada', 'Coragem'] },
      { word: 'Semideus', connections: ['Herói', 'Deus', 'Linagem', 'Poder'] },
      { word: 'Sacrifício', connections: ['Ritual', 'Oferenda', 'Profecia', 'Destino'] },
      { word: 'Profecia', connections: ['Ritual', 'Símbolo', 'Destino', 'Oráculo'] },
      { word: 'Raio', connections: ['Olimpo', 'Poder', 'Tempestade', 'Céu'] },
      { word: 'Trono', connections: ['Olimpo', 'Poder', 'Reino', 'Imortalidade'] },
      { word: 'Imortalidade', connections: ['Olimpo', 'Trono', 'Néctar', 'Deus'] },
      { word: 'Sacerdote', connections: ['Templo', 'Oferenda', 'Ritual', 'Profecia'] },
      { word: 'Oferenda', connections: ['Templo', 'Sacrifício', 'Sacerdote', 'Gratidão'] },
      { word: 'Memória', connections: ['Oralidade', 'Tradição', 'Poema', 'Genealogia'] },
      { word: 'Poema', connections: ['Oralidade', 'Verso', 'Canto', 'Herói'] },
      { word: 'Tradição', connections: ['Oralidade', 'Memória', 'Genealogia', 'Cultura'] },
      { word: 'Arquétipo', connections: ['Símbolo', 'Herói', 'Sombra', 'Destino'] },
      { word: 'Destino', connections: ['Símbolo', 'Jornada', 'Profecia', 'Oráculo'] },
      { word: 'Labirinto', connections: ['Monstro', 'Mistério', 'Provação', 'Fio'] },
      { word: 'Medo', connections: ['Monstro', 'Sombra', 'Coragem', 'Noite'] },
      { word: 'Retorno', connections: ['Jornada', 'Vitória', 'Lar', 'Sabedoria'] },
      { word: 'Coragem', connections: ['Provação', 'Medo', 'Vitória', 'Herói'] },
      { word: 'Linagem', connections: ['Semideus', 'Genealogia', 'Reino', 'Sangue'] },
      { word: 'Oráculo', connections: ['Profecia', 'Destino', 'Mistério', 'Templo'] },
      { word: 'Tempestade', connections: ['Raio', 'Céu', 'Mar', 'Poder'] },
      { word: 'Céu', connections: ['Raio', 'Tempestade', 'Imortalidade', 'Poder'] },
      { word: 'Reino', connections: ['Trono', 'Linagem', 'Cultura', 'Guerra'] },
      { word: 'Néctar', connections: ['Imortalidade', 'Deus', 'Banquete', 'Olimpo'] },
      { word: 'Gratidão', connections: ['Oferenda', 'Ritual', 'Templo', 'Paz'] },
      { word: 'Verso', connections: ['Poema', 'Canto', 'Memória', 'Símbolo'] },
      { word: 'Genealogia', connections: ['Memória', 'Tradição', 'Linagem', 'Sangue'] },
      { word: 'Cultura', connections: ['Tradição', 'Reino', 'Arquétipo', 'Lenda'] },
    ],
  },
  {
    theme: 'Culinária',
    description: 'Ingredientes, técnicas e experiência gastronômica.',
    seedWord: 'Cozinha',
    aliases: ['gastronomia', 'comida', 'receita', 'restaurante'],
    nodes: [
      { word: 'Cozinha', connections: ['Receita', 'Ingrediente', 'Chef', 'Fogão'] },
      { word: 'Receita', connections: ['Cozinha', 'Preparo', 'Medida', 'Sabor'] },
      { word: 'Ingrediente', connections: ['Cozinha', 'Frescor', 'Tempero', 'Textura'] },
      { word: 'Chef', connections: ['Cozinha', 'Técnica', 'Criação', 'Serviço'] },
      { word: 'Fogão', connections: ['Cozinha', 'Calor', 'Panela', 'Ponto'] },
      { word: 'Preparo', connections: ['Receita', 'Tempo', 'Corte', 'Mise en place'] },
      { word: 'Medida', connections: ['Receita', 'Proporção', 'Balança', 'Precisão'] },
      { word: 'Sabor', connections: ['Receita', 'Tempero', 'Aroma', 'Degustação'] },
      { word: 'Frescor', connections: ['Ingrediente', 'Safra', 'Cor', 'Textura'] },
      { word: 'Tempero', connections: ['Ingrediente', 'Sabor', 'Sal', 'Erva'] },
      { word: 'Textura', connections: ['Ingrediente', 'Frescor', 'Crocante', 'Cremoso'] },
      { word: 'Técnica', connections: ['Chef', 'Corte', 'Emulsão', 'Assado'] },
      { word: 'Criação', connections: ['Chef', 'Menu', 'Harmonia', 'Apresentação'] },
      { word: 'Serviço', connections: ['Chef', 'Prato', 'Mesa', 'Restaurante'] },
      { word: 'Calor', connections: ['Fogão', 'Assado', 'Cocção', 'Panela'] },
      { word: 'Panela', connections: ['Fogão', 'Calor', 'Cocção', 'Molho'] },
      { word: 'Ponto', connections: ['Fogão', 'Tempo', 'Cocção', 'Carne'] },
      { word: 'Tempo', connections: ['Preparo', 'Ponto', 'Fermentação', 'Cocção'] },
      { word: 'Corte', connections: ['Preparo', 'Técnica', 'Faca', 'Precisão'] },
      { word: 'Mise en place', connections: ['Preparo', 'Organização', 'Ingrediente', 'Serviço'] },
      { word: 'Proporção', connections: ['Medida', 'Equilíbrio', 'Receita', 'Molho'] },
      { word: 'Balança', connections: ['Medida', 'Precisão', 'Confeitaria', 'Receita'] },
      { word: 'Precisão', connections: ['Medida', 'Corte', 'Balança', 'Confeitaria'] },
      { word: 'Aroma', connections: ['Sabor', 'Tempero', 'Erva', 'Memória'] },
      { word: 'Degustação', connections: ['Sabor', 'Prato', 'Harmonia', 'Vinho'] },
      { word: 'Safra', connections: ['Frescor', 'Origem', 'Ingrediente', 'Estação'] },
      { word: 'Cor', connections: ['Frescor', 'Apresentação', 'Prato', 'Ingrediente'] },
      { word: 'Sal', connections: ['Tempero', 'Equilíbrio', 'Sabor', 'Cocção'] },
      { word: 'Erva', connections: ['Tempero', 'Aroma', 'Horta', 'Molho'] },
      { word: 'Crocante', connections: ['Textura', 'Fritura', 'Prato', 'Contraste'] },
      { word: 'Cremoso', connections: ['Textura', 'Molho', 'Emulsão', 'Conforto'] },
      { word: 'Emulsão', connections: ['Técnica', 'Molho', 'Cremoso', 'Precisão'] },
      { word: 'Assado', connections: ['Técnica', 'Calor', 'Carne', 'Forno'] },
      { word: 'Menu', connections: ['Criação', 'Restaurante', 'Harmonia', 'Estação'] },
      { word: 'Harmonia', connections: ['Criação', 'Degustação', 'Vinho', 'Proporção'] },
      { word: 'Apresentação', connections: ['Criação', 'Cor', 'Prato', 'Mesa'] },
      { word: 'Prato', connections: ['Serviço', 'Degustação', 'Apresentação', 'Mesa'] },
      { word: 'Mesa', connections: ['Serviço', 'Prato', 'Hospitalidade', 'Vinho'] },
      { word: 'Restaurante', connections: ['Serviço', 'Menu', 'Mesa', 'Hospitalidade'] },
      { word: 'Cocção', connections: ['Calor', 'Panela', 'Ponto', 'Tempo'] },
    ],
  },
  {
    theme: 'Música',
    description: 'Som, composição, instrumentos e performance.',
    seedWord: 'Música',
    aliases: ['canção', 'ritmo', 'melodia', 'instrumento'],
    nodes: [
      { word: 'Música', connections: ['Melodia', 'Ritmo', 'Harmonia', 'Instrumento'] },
      { word: 'Melodia', connections: ['Música', 'Nota', 'Escala', 'Tema'] },
      { word: 'Ritmo', connections: ['Música', 'Compasso', 'Bateria', 'Pulso'] },
      { word: 'Harmonia', connections: ['Música', 'Acorde', 'Tonalidade', 'Progressão'] },
      { word: 'Instrumento', connections: ['Música', 'Cordas', 'Sopro', 'Percussão'] },
      { word: 'Nota', connections: ['Melodia', 'Escala', 'Timbre', 'Silêncio'] },
      { word: 'Escala', connections: ['Melodia', 'Nota', 'Tonalidade', 'Improviso'] },
      { word: 'Tema', connections: ['Melodia', 'Composição', 'Memória', 'Refrão'] },
      { word: 'Compasso', connections: ['Ritmo', 'Pulso', 'Tempo', 'Partitura'] },
      { word: 'Bateria', connections: ['Ritmo', 'Percussão', 'Groove', 'Pulso'] },
      { word: 'Pulso', connections: ['Ritmo', 'Compasso', 'Groove', 'Tempo'] },
      { word: 'Acorde', connections: ['Harmonia', 'Progressão', 'Tonalidade', 'Piano'] },
      { word: 'Tonalidade', connections: ['Harmonia', 'Escala', 'Acorde', 'Modulação'] },
      { word: 'Progressão', connections: ['Harmonia', 'Acorde', 'Refrão', 'Tensão'] },
      { word: 'Cordas', connections: ['Instrumento', 'Violão', 'Violino', 'Timbre'] },
      { word: 'Sopro', connections: ['Instrumento', 'Flauta', 'Saxofone', 'Respiração'] },
      { word: 'Percussão', connections: ['Instrumento', 'Bateria', 'Tambor', 'Groove'] },
      { word: 'Timbre', connections: ['Nota', 'Cordas', 'Voz', 'Textura'] },
      { word: 'Silêncio', connections: ['Nota', 'Dinâmica', 'Suspensão', 'Tempo'] },
      { word: 'Improviso', connections: ['Escala', 'Jazz', 'Expressão', 'Tema'] },
      { word: 'Composição', connections: ['Tema', 'Partitura', 'Arranjo', 'Forma'] },
      { word: 'Memória', connections: ['Tema', 'Refrão', 'Emoção', 'Canção'] },
      { word: 'Tempo', connections: ['Compasso', 'Pulso', 'Dinâmica', 'Metrônomo'] },
      { word: 'Partitura', connections: ['Compasso', 'Composição', 'Leitura', 'Arranjo'] },
      { word: 'Groove', connections: ['Bateria', 'Pulso', 'Percussão', 'Baixo'] },
      { word: 'Piano', connections: ['Acorde', 'Tecla', 'Arranjo', 'Harmonia'] },
      { word: 'Modulação', connections: ['Tonalidade', 'Tensão', 'Progressão', 'Surpresa'] },
      { word: 'Violão', connections: ['Cordas', 'Canção', 'Ritmo', 'Harmonia'] },
      { word: 'Violino', connections: ['Cordas', 'Orquestra', 'Melodia', 'Timbre'] },
      { word: 'Flauta', connections: ['Sopro', 'Melodia', 'Respiração', 'Timbre'] },
      { word: 'Saxofone', connections: ['Sopro', 'Jazz', 'Improviso', 'Timbre'] },
      { word: 'Respiração', connections: ['Sopro', 'Voz', 'Tempo', 'Expressão'] },
      { word: 'Tambor', connections: ['Percussão', 'Ritmo', 'Pulso', 'Cerimônia'] },
      { word: 'Voz', connections: ['Timbre', 'Respiração', 'Canção', 'Expressão'] },
      { word: 'Textura', connections: ['Timbre', 'Arranjo', 'Camada', 'Harmonia'] },
      { word: 'Dinâmica', connections: ['Silêncio', 'Tempo', 'Expressão', 'Tensão'] },
      { word: 'Jazz', connections: ['Improviso', 'Saxofone', 'Groove', 'Tensão'] },
      { word: 'Expressão', connections: ['Improviso', 'Voz', 'Dinâmica', 'Emoção'] },
      { word: 'Arranjo', connections: ['Composição', 'Partitura', 'Textura', 'Piano'] },
      { word: 'Forma', connections: ['Composição', 'Refrão', 'Canção', 'Tema'] },
    ],
  },
  {
    theme: 'Esportes',
    description: 'Competição, técnica, estratégia e torcida.',
    seedWord: 'Futebol',
    aliases: ['esporte', 'competição', 'atleta', 'jogo'],
    nodes: [
      { word: 'Futebol', connections: ['Bola', 'Gol', 'Time', 'Campo'] },
      { word: 'Bola', connections: ['Futebol', 'Passe', 'Chute', 'Controle'] },
      { word: 'Gol', connections: ['Futebol', 'Rede', 'Finalização', 'Vitória'] },
      { word: 'Time', connections: ['Futebol', 'Treinador', 'Tática', 'Torcida'] },
      { word: 'Campo', connections: ['Futebol', 'Gramado', 'Lateral', 'Arbitragem'] },
      { word: 'Passe', connections: ['Bola', 'Meio-campo', 'Tática', 'Assistência'] },
      { word: 'Chute', connections: ['Bola', 'Finalização', 'Potência', 'Precisão'] },
      { word: 'Controle', connections: ['Bola', 'Drible', 'Passe', 'Técnica'] },
      { word: 'Rede', connections: ['Gol', 'Trave', 'Goleiro', 'Finalização'] },
      { word: 'Finalização', connections: ['Gol', 'Chute', 'Rede', 'Atacante'] },
      { word: 'Vitória', connections: ['Gol', 'Pontuação', 'Torcida', 'Campeonato'] },
      { word: 'Treinador', connections: ['Time', 'Tática', 'Treino', 'Estratégia'] },
      { word: 'Tática', connections: ['Time', 'Passe', 'Treinador', 'Formação'] },
      { word: 'Torcida', connections: ['Time', 'Vitória', 'Estádio', 'Campeonato'] },
      { word: 'Gramado', connections: ['Campo', 'Estádio', 'Clima', 'Partida'] },
      { word: 'Lateral', connections: ['Campo', 'Arbitragem', 'Passe', 'Defesa'] },
      { word: 'Arbitragem', connections: ['Campo', 'Lateral', 'Falta', 'Regra'] },
      { word: 'Meio-campo', connections: ['Passe', 'Posse', 'Tática', 'Ritmo'] },
      { word: 'Assistência', connections: ['Passe', 'Atacante', 'Gol', 'Visão'] },
      { word: 'Potência', connections: ['Chute', 'Treino', 'Velocidade', 'Explosão'] },
      { word: 'Precisão', connections: ['Chute', 'Técnica', 'Treino', 'Visão'] },
      { word: 'Drible', connections: ['Controle', 'Velocidade', 'Atacante', 'Técnica'] },
      { word: 'Técnica', connections: ['Controle', 'Precisão', 'Drible', 'Treino'] },
      { word: 'Trave', connections: ['Rede', 'Goleiro', 'Defesa', 'Altura'] },
      { word: 'Goleiro', connections: ['Rede', 'Trave', 'Defesa', 'Reflexo'] },
      { word: 'Atacante', connections: ['Finalização', 'Assistência', 'Drible', 'Gol'] },
      { word: 'Pontuação', connections: ['Vitória', 'Campeonato', 'Tabela', 'Regra'] },
      { word: 'Campeonato', connections: ['Vitória', 'Torcida', 'Pontuação', 'Tabela'] },
      { word: 'Treino', connections: ['Treinador', 'Potência', 'Precisão', 'Condicionamento'] },
      { word: 'Estratégia', connections: ['Treinador', 'Formação', 'Tática', 'Adversário'] },
      { word: 'Formação', connections: ['Tática', 'Estratégia', 'Defesa', 'Ataque'] },
      { word: 'Estádio', connections: ['Torcida', 'Gramado', 'Partida', 'Campeonato'] },
      { word: 'Clima', connections: ['Gramado', 'Partida', 'Condicionamento', 'Resistência'] },
      { word: 'Falta', connections: ['Arbitragem', 'Regra', 'Cartão', 'Defesa'] },
      { word: 'Regra', connections: ['Arbitragem', 'Pontuação', 'Falta', 'Campeonato'] },
      { word: 'Posse', connections: ['Meio-campo', 'Passe', 'Ritmo', 'Estratégia'] },
      { word: 'Ritmo', connections: ['Meio-campo', 'Posse', 'Partida', 'Velocidade'] },
      { word: 'Visão', connections: ['Assistência', 'Precisão', 'Meio-campo', 'Tática'] },
      { word: 'Velocidade', connections: ['Potência', 'Drible', 'Ritmo', 'Explosão'] },
      { word: 'Explosão', connections: ['Potência', 'Velocidade', 'Atacante', 'Treino'] },
    ],
  },
  {
    theme: 'História',
    description: 'Civilizações, poder, revoluções e memória coletiva.',
    seedWord: 'Império',
    aliases: ['civilização', 'antiguidade', 'guerra', 'revolução'],
    nodes: [
      { word: 'Império', connections: ['Rei', 'Exército', 'Território', 'Tributo'] },
      { word: 'Rei', connections: ['Império', 'Coroa', 'Dinastia', 'Palácio'] },
      { word: 'Exército', connections: ['Império', 'Batalha', 'Estratégia', 'Conquista'] },
      { word: 'Território', connections: ['Império', 'Mapa', 'Fronteira', 'Cidade'] },
      { word: 'Tributo', connections: ['Império', 'Economia', 'Comércio', 'Poder'] },
      { word: 'Coroa', connections: ['Rei', 'Dinastia', 'Legitimidade', 'Cerimônia'] },
      { word: 'Dinastia', connections: ['Rei', 'Herdeiro', 'Trono', 'Aliança'] },
      { word: 'Palácio', connections: ['Rei', 'Corte', 'Cerimônia', 'Arquitetura'] },
      { word: 'Batalha', connections: ['Exército', 'Arma', 'Estratégia', 'Vitória'] },
      { word: 'Estratégia', connections: ['Exército', 'Batalha', 'General', 'Diplomacia'] },
      { word: 'Conquista', connections: ['Exército', 'Território', 'Colonização', 'Poder'] },
      { word: 'Mapa', connections: ['Território', 'Fronteira', 'Exploração', 'Navegação'] },
      { word: 'Fronteira', connections: ['Território', 'Mapa', 'Conflito', 'Tratado'] },
      { word: 'Cidade', connections: ['Território', 'Comércio', 'Cultura', 'Arquitetura'] },
      { word: 'Economia', connections: ['Tributo', 'Moeda', 'Comércio', 'Trabalho'] },
      { word: 'Comércio', connections: ['Tributo', 'Cidade', 'Rota', 'Mercado'] },
      { word: 'Poder', connections: ['Tributo', 'Conquista', 'Legitimidade', 'Lei'] },
      { word: 'Legitimidade', connections: ['Coroa', 'Poder', 'Lei', 'Reforma'] },
      { word: 'Cerimônia', connections: ['Coroa', 'Palácio', 'Cultura', 'Religião'] },
      { word: 'Herdeiro', connections: ['Dinastia', 'Trono', 'Aliança', 'Coroa'] },
      { word: 'Trono', connections: ['Dinastia', 'Herdeiro', 'Palácio', 'Poder'] },
      { word: 'Aliança', connections: ['Dinastia', 'Diplomacia', 'Tratado', 'Guerra'] },
      { word: 'Corte', connections: ['Palácio', 'Nobreza', 'Cultura', 'Diplomacia'] },
      { word: 'Arquitetura', connections: ['Palácio', 'Cidade', 'Memória', 'Monumento'] },
      { word: 'Arma', connections: ['Batalha', 'Metal', 'Exército', 'Tecnologia'] },
      { word: 'Vitória', connections: ['Batalha', 'Memória', 'Conquista', 'Povo'] },
      { word: 'General', connections: ['Estratégia', 'Exército', 'Batalha', 'Disciplina'] },
      { word: 'Diplomacia', connections: ['Estratégia', 'Aliança', 'Tratado', 'Embaixador'] },
      { word: 'Colonização', connections: ['Conquista', 'Território', 'Rota', 'Exploração'] },
      { word: 'Exploração', connections: ['Mapa', 'Colonização', 'Navegação', 'Rota'] },
      { word: 'Navegação', connections: ['Mapa', 'Exploração', 'Rota', 'Oceano'] },
      { word: 'Conflito', connections: ['Fronteira', 'Guerra', 'Tratado', 'Revolta'] },
      { word: 'Tratado', connections: ['Fronteira', 'Aliança', 'Diplomacia', 'Lei'] },
      { word: 'Cultura', connections: ['Cidade', 'Cerimônia', 'Corte', 'Memória'] },
      { word: 'Moeda', connections: ['Economia', 'Mercado', 'Trabalho', 'Comércio'] },
      { word: 'Trabalho', connections: ['Economia', 'Povo', 'Ofício', 'Mercado'] },
      { word: 'Rota', connections: ['Comércio', 'Exploração', 'Navegação', 'Mercado'] },
      { word: 'Mercado', connections: ['Comércio', 'Moeda', 'Rota', 'Cidade'] },
      { word: 'Lei', connections: ['Poder', 'Legitimidade', 'Tratado', 'Reforma'] },
      { word: 'Religião', connections: ['Cerimônia', 'Povo', 'Legitimidade', 'Templo'] },
    ],
  },
  {
    theme: 'Literatura',
    description: 'Livros, linguagem, narrativa e leitura.',
    seedWord: 'Livro',
    aliases: ['leitura', 'poesia', 'romance', 'escrita'],
    nodes: [
      { word: 'Livro', connections: ['Autor', 'Leitor', 'Capítulo', 'Biblioteca'] },
      { word: 'Autor', connections: ['Livro', 'Narrador', 'Estilo', 'Rascunho'] },
      { word: 'Leitor', connections: ['Livro', 'Interpretação', 'Imaginação', 'Memória'] },
      { word: 'Capítulo', connections: ['Livro', 'Enredo', 'Ritmo', 'Virada'] },
      { word: 'Biblioteca', connections: ['Livro', 'Arquivo', 'Silêncio', 'Pesquisa'] },
      { word: 'Narrador', connections: ['Autor', 'Voz', 'Ponto de Vista', 'Enredo'] },
      { word: 'Estilo', connections: ['Autor', 'Linguagem', 'Metáfora', 'Ritmo'] },
      { word: 'Rascunho', connections: ['Autor', 'Revisão', 'Ideia', 'Estrutura'] },
      { word: 'Interpretação', connections: ['Leitor', 'Símbolo', 'Tema', 'Contexto'] },
      { word: 'Imaginação', connections: ['Leitor', 'Cena', 'Metáfora', 'Memória'] },
      { word: 'Memória', connections: ['Leitor', 'Personagem', 'Tema', 'Tempo'] },
      { word: 'Enredo', connections: ['Capítulo', 'Narrador', 'Conflito', 'Clímax'] },
      { word: 'Ritmo', connections: ['Capítulo', 'Estilo', 'Pausa', 'Verso'] },
      { word: 'Virada', connections: ['Capítulo', 'Clímax', 'Conflito', 'Suspense'] },
      { word: 'Arquivo', connections: ['Biblioteca', 'Pesquisa', 'História', 'Documento'] },
      { word: 'Silêncio', connections: ['Biblioteca', 'Pausa', 'Leitura', 'Tempo'] },
      { word: 'Pesquisa', connections: ['Biblioteca', 'Arquivo', 'Contexto', 'Documento'] },
      { word: 'Voz', connections: ['Narrador', 'Linguagem', 'Tom', 'Personagem'] },
      { word: 'Ponto de Vista', connections: ['Narrador', 'Personagem', 'Conflito', 'Cena'] },
      { word: 'Linguagem', connections: ['Estilo', 'Voz', 'Símbolo', 'Verso'] },
      { word: 'Metáfora', connections: ['Estilo', 'Imaginação', 'Símbolo', 'Poesia'] },
      { word: 'Revisão', connections: ['Rascunho', 'Estrutura', 'Precisão', 'Tom'] },
      { word: 'Ideia', connections: ['Rascunho', 'Tema', 'Conceito', 'Imagem'] },
      { word: 'Estrutura', connections: ['Rascunho', 'Revisão', 'Enredo', 'Forma'] },
      { word: 'Símbolo', connections: ['Interpretação', 'Metáfora', 'Tema', 'Imagem'] },
      { word: 'Tema', connections: ['Interpretação', 'Memória', 'Ideia', 'Símbolo'] },
      { word: 'Contexto', connections: ['Interpretação', 'Pesquisa', 'História', 'Documento'] },
      { word: 'Cena', connections: ['Imaginação', 'Ponto de Vista', 'Personagem', 'Conflito'] },
      { word: 'Conflito', connections: ['Enredo', 'Virada', 'Cena', 'Clímax'] },
      { word: 'Clímax', connections: ['Enredo', 'Virada', 'Conflito', 'Desfecho'] },
      { word: 'Pausa', connections: ['Ritmo', 'Silêncio', 'Verso', 'Respiração'] },
      { word: 'Verso', connections: ['Ritmo', 'Linguagem', 'Pausa', 'Poesia'] },
      { word: 'História', connections: ['Arquivo', 'Contexto', 'Documento', 'Tempo'] },
      { word: 'Documento', connections: ['Arquivo', 'Pesquisa', 'História', 'Registro'] },
      { word: 'Tom', connections: ['Voz', 'Revisão', 'Humor', 'Atmosfera'] },
      { word: 'Personagem', connections: ['Voz', 'Ponto de Vista', 'Cena', 'Memória'] },
      { word: 'Poesia', connections: ['Metáfora', 'Verso', 'Linguagem', 'Imagem'] },
      { word: 'Conceito', connections: ['Ideia', 'Tema', 'Forma', 'Ensaios'] },
      { word: 'Imagem', connections: ['Ideia', 'Símbolo', 'Poesia', 'Imaginação'] },
      { word: 'Forma', connections: ['Estrutura', 'Conceito', 'Verso', 'Gênero'] },
    ],
  },
  {
    theme: 'Oceanos',
    description: 'Vida marinha, correntes e paisagens submarinas.',
    seedWord: 'Oceano',
    aliases: ['mar', 'submarino', 'praia', 'biologia marinha'],
    nodes: [
      { word: 'Oceano', connections: ['Maré', 'Corrente Marinha', 'Profundidade', 'Recife'] },
      { word: 'Maré', connections: ['Oceano', 'Lua', 'Costa', 'Ondas'] },
      { word: 'Corrente Marinha', connections: ['Oceano', 'Temperatura', 'Clima', 'Plâncton'] },
      { word: 'Profundidade', connections: ['Oceano', 'Abismo', 'Pressão', 'Escuridão'] },
      { word: 'Recife', connections: ['Oceano', 'Coral', 'Peixe', 'Biodiversidade'] },
      { word: 'Lua', connections: ['Maré', 'Órbita', 'Noite', 'Céu'] },
      { word: 'Costa', connections: ['Maré', 'Praia', 'Erosão', 'Areia'] },
      { word: 'Ondas', connections: ['Maré', 'Vento', 'Costa', 'Surf'] },
      { word: 'Temperatura', connections: ['Corrente Marinha', 'Clima', 'Profundidade', 'Gelo'] },
      { word: 'Clima', connections: ['Corrente Marinha', 'Temperatura', 'Vento', 'Tempestade'] },
      { word: 'Plâncton', connections: ['Corrente Marinha', 'Baleia', 'Peixe', 'Luz Solar'] },
      { word: 'Abismo', connections: ['Profundidade', 'Escuridão', 'Pressão', 'Bioluminescência'] },
      { word: 'Pressão', connections: ['Profundidade', 'Abismo', 'Mergulho', 'Escuridão'] },
      { word: 'Escuridão', connections: ['Profundidade', 'Abismo', 'Bioluminescência', 'Mistério'] },
      { word: 'Coral', connections: ['Recife', 'Biodiversidade', 'Peixe', 'Água Quente'] },
      { word: 'Peixe', connections: ['Recife', 'Plâncton', 'Coral', 'Cardume'] },
      { word: 'Biodiversidade', connections: ['Recife', 'Coral', 'Mangue', 'Peixe'] },
      { word: 'Praia', connections: ['Costa', 'Areia', 'Sol', 'Maré'] },
      { word: 'Erosão', connections: ['Costa', 'Ondas', 'Areia', 'Clima'] },
      { word: 'Areia', connections: ['Costa', 'Praia', 'Erosão', 'Concha'] },
      { word: 'Vento', connections: ['Ondas', 'Clima', 'Tempestade', 'Vela'] },
      { word: 'Surf', connections: ['Ondas', 'Praia', 'Vento', 'Esporte'] },
      { word: 'Gelo', connections: ['Temperatura', 'Polo', 'Corrente Marinha', 'Derretimento'] },
      { word: 'Tempestade', connections: ['Clima', 'Vento', 'Relâmpago', 'Navegação'] },
      { word: 'Baleia', connections: ['Plâncton', 'Canto', 'Migração', 'Oceano'] },
      { word: 'Luz Solar', connections: ['Plâncton', 'Superfície', 'Temperatura', 'Vida'] },
      { word: 'Bioluminescência', connections: ['Abismo', 'Escuridão', 'Vida', 'Mistério'] },
      { word: 'Mergulho', connections: ['Pressão', 'Recife', 'Equipamento', 'Profundidade'] },
      { word: 'Mistério', connections: ['Escuridão', 'Bioluminescência', 'Abismo', 'Naufrágio'] },
      { word: 'Água Quente', connections: ['Coral', 'Temperatura', 'Recife', 'Corrente Marinha'] },
      { word: 'Cardume', connections: ['Peixe', 'Biodiversidade', 'Predador', 'Migração'] },
      { word: 'Mangue', connections: ['Biodiversidade', 'Costa', 'Raiz', 'Berçário'] },
      { word: 'Sol', connections: ['Praia', 'Luz Solar', 'Calor', 'Clima'] },
      { word: 'Concha', connections: ['Areia', 'Praia', 'Costa', 'Molusco'] },
      { word: 'Polo', connections: ['Gelo', 'Clima', 'Derretimento', 'Corrente Marinha'] },
      { word: 'Derretimento', connections: ['Gelo', 'Polo', 'Clima', 'Nível do Mar'] },
      { word: 'Relâmpago', connections: ['Tempestade', 'Vento', 'Céu', 'Energia'] },
      { word: 'Navegação', connections: ['Tempestade', 'Corrente Marinha', 'Vela', 'Mapa'] },
      { word: 'Canto', connections: ['Baleia', 'Migração', 'Som', 'Comunicação'] },
      { word: 'Migração', connections: ['Baleia', 'Cardume', 'Canto', 'Estação'] },
    ],
  },
];

export const constellations: Constellation[] = [];
for (const def of constellationDefinitions) {
  try {
    const result = sanitizeConstellation(def);
    if (result) {
      constellations.push(result);
    } else {
      warnConstellationIssue(def.theme, 'constelação ignorada por falha de sanitização.');
    }
  } catch (e) {
    warnConstellationIssue(def.theme, `erro ao carregar constelação: ${(e as Error).message}`);
  }
}

export function getConstellationByTheme(query: string): Constellation | undefined {
  const normalizedQuery = normalizeWord(query);

  return constellations.find((constellation) => {
    const searchableTerms = [
      constellation.theme,
      constellation.seedWord,
      constellation.description,
      ...constellation.aliases,
      ...constellation.nodes.map((node) => node.word),
    ];

    return searchableTerms.some((term) => normalizeWord(term).includes(normalizedQuery));
  });
}

export function getRandomConstellation(): Constellation {
  if (constellations.length === 0) {
    throw new Error('Nenhuma constelação válida foi carregada.');
  }

  return constellations[Math.floor(Math.random() * constellations.length)];
}

export function listThemes(): string[] {
  return constellations.map((constellation) => constellation.theme);
}

export function listThemeOptions(): ThemeOption[] {
  return constellations.map((constellation) => ({
    theme: constellation.theme,
    description: constellation.description,
    seedWord: constellation.seedWord,
    totalWords: constellation.nodes.length,
  }));
}
