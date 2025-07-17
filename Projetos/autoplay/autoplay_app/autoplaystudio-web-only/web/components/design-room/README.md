# 🎨 Design Room UI

## Visão Geral

O Design Room UI é uma interface de design colaborativo inspirada no Figma, construída com Konva.js e Next.js, integrada ao ecossistema Autoplay Studio. Permite que estúdios de design e seus clientes colaborem em tempo real na criação de interfaces e designs.

## 🚀 Recursos Implementados

### ✅ Interface Principal
- **Layout Responsivo**: Interface adaptável com painéis laterais colapsáveis
- **Tema Autoplay**: Gradiente purple-to-blue com glassmorphism
- **Header Completo**: Navegação, controles de zoom, e ações principais
- **Status Bar**: Informações de zoom, contagem de objetos, e modo atual

### ✅ Canvas Interativo
- **Konva.js Integration**: Canvas performático com renderização WebGL
- **Zoom & Pan**: Controles suaves de zoom (10%-800%) e navegação
- **Grid System**: Grid visual com snap automático
- **Infinite Canvas**: Área de trabalho ilimitada

### ✅ Ferramentas de Design
- **Select Tool (V)**: Seleção e movimentação de objetos
- **Hand Tool (H)**: Navegação no canvas
- **Rectangle Tool (R)**: Criação de retângulos
- **Circle Tool (O)**: Criação de círculos
- **Text Tool (T)**: Adição de texto editável
- **Line Tool (L)**: Criação de linhas
- **Frame Tool (F)**: Containers/frames

### ✅ Painéis Laterais
- **Layers Panel**: Lista de objetos e assets com thumbnails
- **Properties Panel**: Edição de propriedades (posição, cor, tipografia)
- **Expansível/Colapsável**: Painéis podem ser ocultados para mais espaço

### ✅ Integração com Projeto
- **Assets Automáticos**: Assets do projeto aparecem como frames editáveis
- **Navegação Integrada**: Botões de acesso no ProjectHeader e ProjectSidebar
- **Permissões**: Modo visualização vs edição baseado em permissões

### ✅ Gerenciamento de Estado
- **Zustand Stores**: Estado reativo para canvas e ferramentas
- **History System**: Preparado para undo/redo (estrutura criada)
- **Real-time Ready**: Arquitetura preparada para colaboração

## 🎯 Rota de Acesso

```
/dashboard/client/[clientId]/project/[projectId]/design-room-ui
```

## 🔧 Arquitetura

### Componentes Principais
```
components/design-room/
├── DesignRoomUI.tsx          # Componente principal
├── Canvas/
│   └── KonvaCanvas.tsx       # Canvas Konva.js
├── Toolbar/
│   └── Toolbar.tsx           # Barra de ferramentas
├── Panels/
│   ├── LayersPanel.tsx       # Painel de layers
│   └── PropertiesPanel.tsx   # Painel de propriedades
└── Header/
    └── Header.tsx            # Header com controles
```

### Stores
```
stores/
├── canvasStore.ts            # Estado do canvas e objetos
└── toolStore.ts              # Estado das ferramentas
```

### Hooks
```
hooks/
└── useProjectAssets.ts       # Hook para assets do projeto
```

## 🎨 Uso

### Acesso ao Design Room
1. Navegue para um projeto
2. Clique em "Design Room" no header ou sidebar
3. Interface carrega automaticamente com assets do projeto

### Ferramentas Básicas
- **V**: Selecionar objetos
- **H**: Navegar no canvas
- **R**: Criar retângulos
- **O**: Criar círculos
- **T**: Adicionar texto
- **L**: Desenhar linhas

### Navegação
- **Zoom**: Ctrl + Mouse Wheel ou botões no header
- **Pan**: Ferramenta Hand ou arrastar com mouse
- **Fit to Screen**: Botão no header

## 🔄 Assets do Projeto

Os assets do projeto são automaticamente carregados como frames editáveis no canvas:
- Organizados em grid 3x3
- Mantêm proporções originais
- Podem ser movidos e redimensionados
- Aparecem no painel de layers

## 🎨 Temas e Estilização

### Cores Principais
- **Purple**: `#8B5CF6` (Autoplay Primary)
- **Blue**: `#3B82F6` (Autoplay Secondary)
- **Gradient**: `from-purple-500 to-blue-500`

### Efeitos
- **Glassmorphism**: `bg-white/90 backdrop-blur-sm`
- **Shadows**: `shadow-lg` para painéis flutuantes
- **Hover Effects**: `hover:scale-105` para interações

## 📱 Responsividade

### Breakpoints
- **Desktop**: Interface completa com painéis
- **Tablet**: Painéis colapsáveis
- **Mobile**: Interface otimizada (preparada)

### Adaptações
- Toolbar vertical em telas pequenas
- Canvas ocupa toda área disponível
- Painéis podem ser ocultados para mais espaço

## 🚀 Próximos Passos

### Colaboração Real-time
- [ ] Sincronização com Supabase Realtime
- [ ] Cursores de usuários online
- [ ] Resolução de conflitos

### Ferramentas Avançadas
- [ ] Layers com hierarquia
- [ ] Componentes reutilizáveis
- [ ] Animações e transições

### Export e Integração
- [ ] Export para SVG/PNG
- [ ] Geração de código React
- [ ] Integração com design system

## 🔗 Integração

### Projeto
O Design Room está integrado ao projeto através de:
- Botão no `ProjectHeader`
- Botão no `ProjectSidebar`
- Rota dinâmica baseada em `projectId` e `clientId`

### Permissões
- **Modo Edit**: Usuários com permissão de edição
- **Modo View**: Usuários apenas com visualização
- Toolbar adaptada conforme permissões

## 💡 Características Únicas

### 1. **Asset-First Design**
Assets do projeto são automaticamente frames editáveis, não apenas referências.

### 2. **Identidade Autoplay**
Interface com cores e efeitos visuais consistentes com o brand.

### 3. **Integração Nativa**
Não é uma ferramenta externa, é parte integral do workflow.

### 4. **Performance Focada**
Konva.js garante renderização suave mesmo com muitos objetos.

### 5. **Preparado para Expansão**
Arquitetura modular permite adicionar novas ferramentas facilmente.

---

*🎨 O Design Room UI está pronto para uso e pode ser acessado através dos projetos!* 