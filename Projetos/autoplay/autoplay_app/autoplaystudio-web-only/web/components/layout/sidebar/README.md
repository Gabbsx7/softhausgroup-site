# Client Dashboard Sidebar

Este componente implementa o sidebar do client dashboard seguindo o design do Figma com uma estrutura hierárquica completa.

## Estrutura

O sidebar é organizado em seções principais:

### 1. Navigation Header
- Ícone de compass (Home)
- Título "Home"
- Botão de expansão/colapso
- Menu de três pontos

### 2. Sections

#### Projects
- Lista de projetos com detalhes completos
- Cada projeto pode ser expandido para mostrar:
  - Descrição do projeto
  - Detalhes (Category, Deadline, Budget)
  - Team members com avatars
  - Status do projeto
  - Seção de Assets
  - Milestones com tasks

#### Collections
- Collections organizadas por pastas
- Cada collection pode conter:
  - Folders com assets
  - Subfolders hierárquicos
  - Assets organizados por tipo

#### Assets
- Lista de assets gerais
- Filtros por tipo (All Assets)
- Botão de adicionar novos assets

## Funcionalidades

### Estados Visuais
- **Completed**: Ícone de check verde
- **In Progress**: Ícone de clock azul
- **Pending**: Ícone de círculo cinza

### Tipos de Assets
- **Image**: Ícone de imagem
- **Video**: Ícone de play
- **Document**: Ícone de documento

### Interações
- Expand/collapse de seções
- Expand/collapse de projetos
- Expand/collapse de milestones
- Expand/collapse de folders
- Navegação hierárquica

## Dados Mockados

O componente inclui dados mockados para demonstração:

```typescript
// Projeto exemplo
{
  id: 'project-1',
  name: 'A cool Branding Project',
  description: 'Currently in production a CGI video for FootlockerFootlockerFootlockerFootlocker featuring',
  category: 'CGI',
  deadline: '14 April, 2025',
  budget: '$4,000',
  status: 'in_progress',
  team: ['avatar1', 'avatar2', 'avatar3'],
  milestones: [...]
}
```

## Cores e Estilos

### Backgrounds
- **Projects**: `#FDFBF3` (container), `#E6EFFF` (header)
- **Milestones**: `#FFF9D7` (completed), `#F6F4E7` (in progress), `#F0F5FF` (pending)
- **Tasks**: `#FEFDF7` (container), `#FFFBE5` (details)
- **Collections**: `#E6EFFF`

### Cores de Status
- **Completed**: `#64C039` (verde)
- **In Progress**: `#7CCDF5` (azul)
- **Pending**: `#E0E0E0` (cinza)

### Cores de Assets
- **Assets**: `#CC00FF` (magenta)

## Responsividade

O sidebar é responsivo e se adapta a diferentes tamanhos de tela:
- Desktop: Sidebar fixo lateral
- Mobile: Sidebar colapsável com overlay

## Uso

```tsx
import { ClientSidebar } from '@/components/layout/sidebar/client-sidebar'

<ClientSidebar className="custom-class" />
```

## Ícones Customizados

O componente usa ícones SVG customizados localizados em `@/components/icons/sidebar-icons.tsx` que seguem exatamente o design do Figma. 