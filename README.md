# SPCITY

SPCITY is an application designed to facilitate the interaction between citizens and the São Paulo municipal government, promoting the registration, monitoring, and management of urban demands in a simplified, efficient, and transparent manner.

## 📜 About the Project

Interacting with the government is often bureaucratic and demotivating for citizens. SPCITY aims to revolutionize this environment, allowing users to report urban problems intuitively and track their resolutions in real time.

### Main Features
- Registration of urban demands using simplified geolocation.
- Visualization of open demands on an interactive map.
- Continuous feedback system.
- Engagement incentives through gamification.
- User-friendly and accessible interface.

## 🚀 Technologies Used

- **Frontend**: Next.js 15.
- **Backend**: MongoDB and custom APIs.
- **Geolocation**: Leaflet for rendering interactive maps.
- **Authentication**: NextAuth with MongoDB adapter.
- **Styling**: TailwindCSS with animation support.

## 📦 Installation

### Prerequisites
- Node.js version 22 or higher (recommended for compatibility).
- Configured and running MongoDB.

### Step-by-Step

1. Clone the repository:
    ```bash
    git clone https://github.com/hexglyph/spcity.git
    cd spcity
    ```

2. Install dependencies:
    ```bash
    bun install
    ```

3. Configure the environment variables:
    Create a `.env` file at the root of the project and add the required variables, such as:
    ```env
    MONGODB_URI=mongodb+srv://your-username:password@cluster.mongodb.net/spcity
    NEXTAUTH_SECRET=your_secret_key
    ```

4. Start the development server:
    ```bash
    bun run dev
    ```

5. Open the application in your browser at [http://localhost:3000](http://localhost:3000).

## 📋 Project Structure


Copy markdown
# SPCITY

SPCITY is an application designed to facilitate the interaction between citizens and the São Paulo municipal government, promoting the registration, monitoring, and management of urban demands in a simplified, efficient, and transparent manner.

## 📜 About the Project

Interacting with the government is often bureaucratic and demotivating for citizens. SPCITY aims to revolutionize this environment, allowing users to report urban problems intuitively and track their resolutions in real time.

### Main Features
- Registration of urban demands using simplified geolocation.
- Visualization of open demands on an interactive map.
- Continuous feedback system.
- Engagement incentives through gamification.
- User-friendly and accessible interface.

## 🚀 Technologies Used

- **Frontend**: Next.js 15.
- **Backend**: MongoDB and custom APIs.
- **Geolocation**: Leaflet for rendering interactive maps.
- **Authentication**: NextAuth with MongoDB adapter.
- **Styling**: TailwindCSS with animation support.

## 📦 Installation

### Prerequisites
- Node.js version 22 or higher (recommended for compatibility).
- Configured and running MongoDB.

### Step-by-Step

1. Clone the repository:
    ```bash
    git clone https://github.com/hexglyph/spcity.git
    cd spcity
    ```

2. Install dependencies:
    ```bash
    bun install
    ```

3. Configure the environment variables:
    Create a `.env` file at the root of the project and add the required variables, such as:
    ```env
    MONGODB_URI=mongodb+srv://your-username:password@cluster.mongodb.net/spcity
    NEXTAUTH_SECRET=your_secret_key
    ```

4. Start the development server:
    ```bash
    bun run dev
    ```

5. Open the application in your browser at [http://localhost:3000](http://localhost:3000).

## 📋 Project Structure
```
spcity/ 
├── public/                # Public files 
├── src/                   # Main source code 
│   ├── pages/             # Next.js routes and pages 
│   ├── components/        # Reusable components 
│   ├── styles/            # Global styles 
│   ├── lib/               # Utility functions and configurations 
│   └── api/               # Custom APIs 
├── .env                   # Environment variables 
├── package.json           # Dependency manager configuration 
└── tailwind.config.js     # TailwindCSS configuration
```

Copy

## 🎮 Gamification

The application includes a gamification system that encourages continuous and responsible usage:
- **Levels:** Based on user interaction.
- **Ranking:** Qualitative evaluation of contributions.
- **Educational Control:** Penalties for misuse of the system.

## 🛡️ Privacy and Security

- Personal data is anonymized and handled in accordance with LGPD.
- All interactions occur over secure channels.

## 🤝 Contributions

Contributions are welcome! To collaborate:
1. Fork the repository.
2. Create a branch for your feature: `git checkout -b my-feature`.
3. Submit a pull request for review.

## 📝 License

This project is proprietary. Usage, modification, or redistribution are permitted only with the author’s authorization.

# SPCITY

SPCITY é uma aplicação para facilitar a interação dos cidadãos com o governo municipal de São Paulo, promovendo o registro, acompanhamento e gestão de demandas urbanas de forma simplificada, eficiente e transparente.

## 📜 Sobre o Projeto

A interação com o governo é muitas vezes burocrática e desmotivadora para os cidadãos. SPCITY busca revolucionar esse cenário, permitindo que os usuários reportem problemas urbanos de forma intuitiva e acompanhem suas resoluções em tempo real. 

### Funcionalidades Principais
- Registro de demandas urbanas usando geolocalização simplificada.
- Visualização de demandas abertas no mapa interativo.
- Sistema de feedback contínuo.
- Incentivo ao engajamento por meio de gamificação.
- Interface amigável e acessível.

## 🚀 Tecnologias Utilizadas

- **Frontend**: Next.js 15.
- **Backend**: MongoDB e APIs customizadas.
- **Geolocalização**: Leaflet para renderização de mapas interativos.
- **Autenticação**: NextAuth com adaptador MongoDB.
- **Styling**: TailwindCSS com suporte a animações.

## 📦 Como Instalar

### Pré-requisitos
- Node.js versão mínima 22 (recomendado para compatibilidade).
- MongoDB configurado e em execução.

### Passo a Passo

1. Clone o repositório:
    ```bash
    git clone https://github.com/hexglyph/spcity.git
    cd spcity
    ```

2. Instale as dependências:
    ```bash
    bun install
    ```

3. Configure as variáveis de ambiente:
    Crie um arquivo `.env` na raiz do projeto e adicione as variáveis necessárias, como:
    ```env
    MONGODB_URI=mongodb+srv://seu-usuario:senha@cluster.mongodb.net/spcity
    NEXTAUTH_SECRET=sua_chave_secreta
    ```

4. Inicie o servidor de desenvolvimento:
    ```bash
    bun run dev
    ```

5. Acesse o aplicativo no navegador em [http://localhost:3000](http://localhost:3000).

## 📋 Estrutura do Projeto

```
spcity/
├── public/                # Arquivos públicos
├── src/                   # Código-fonte principal
│   ├── pages/             # Rotas e páginas do Next.js
│   ├── components/        # Componentes reutilizáveis
│   ├── styles/            # Estilos globais
│   ├── lib/               # Funções utilitárias e configurações
│   └── api/               # APIs customizadas
├── .env                   # Variáveis de ambiente
├── package.json           # Gerenciador de dependências
└── tailwind.config.js     # Configuração do TailwindCSS
```

## 🎮 Gamificação

O aplicativo inclui um sistema de gamificação que incentiva o uso contínuo e responsável:
- **Níveis:** Baseados na interação do usuário.
- **Ranking:** Avaliação qualitativa de contribuições.
- **Controle Educativo:** Penalidades para uso indevido do sistema.

## 🛡️ Privacidade e Segurança

- Dados pessoais são anonimizados e tratados em conformidade com a LGPD.
- Todas as interações são realizadas em canais seguros.

## 🤝 Contribuições

Contribuições são bem-vindas! Para colaborar:
1. Crie um fork do repositório.
2. Crie uma branch para sua feature: `git checkout -b minha-feature`.
3. Envie um pull request para revisão.

## 📝 Licença

Este projeto é proprietário. O uso, modificação ou redistribuição são permitidos apenas sob autorização do autor.

---

Todo:
- Definir Base de Dados
- Implementar Backoffice para a Administração Pública
- Tailwind 4
- Implementar Modelo de Filtragem de Demandas

**Contato:**
- Email: me@danielniebraz.dev
- LinkedIn: [(https://www.linkedin.com/in/danielniebraz/)](https://www.linkedin.com/in/danielniebraz/)
