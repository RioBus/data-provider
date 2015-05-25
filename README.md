RioBus
======

O RioBus é um sistema colaborativo de monitoramento de ônibus em tempo real, que utiliza a API aberta de dados de
mobilidade urbana fornecida pela parceria entre a Prefeitura do Rio de Janeiro e a FETRANSPOR.
Seu objetivo principal é ajudar o cidadão, seja ele morador ou visitante, do Rio de Janeiro a se deslocar pela cidade.


Arquitetura
-----------

A aplicação do provedor de dados do RioBus foi desenvolvida em TypeScript, através do GULP e Node.js.

A organização da lógica da aplicação segue a metodologia de desenvolvimento do DDD (Domain-Driven Design), que deixa o
código desacoplado e organizado, facilitando a manutenção e a adição de novas funcionalidades.

Além disso, foi preparada uma infra-estrutura graças ao poder do GULP, um dos automatizadores de tarefas mais utilizados
atualmente por equipes de desenvolvimento de JavaScript. Desta forma foi possível escrever um código limpo e sucinto que
garante flexibilidade e modularidade.

Além disso, o GULP compila o código do TypeScript em "Javascript comum" seguindo os padrões CommonJS, garantindo a
compatibilidade com a plataforma do Node.js.


Instalação
----------

Instale o Node.js

Windows e Linux:
> http://nodebr.com/instalando-node-js-atraves-do-gerenciador-de-pacotes/

Mac OS X:
> https://nodejs.org/download/

Faça o download do projeto em sua máquina:
> $ git clone https://github.com/RioBus/data-provider.git

Entre na raiz do projeto e instale as dependências do Node.js:
> $ npm install

Todos os dados dos ônibus são salvas em cache. O diretório até o arquivo deve ser indicado em ```config.js```, em 
```server.dataProvider.dataPath``` e em ```server.dataProvider.path.output```.

Ainda na raiz do projeto, configure o ambiente
> $ npm run configure

Execute a aplicação:
> $ npm start

Comandos NPM
------------

npm run configure
> Configura o ambiente para compilação

npm run build
> Compila o projeto para JavaScript e põe o código em compiled/build/

npm run test
> Invoca o Mocha e roda as rotinas de testes unitários configurados em test/

npm run start
> Compila e roda a aplicação

npm run release
> Compila e gera um código comprimido para distribuição

npm run deploy
> Compila, gera o código de distribuição e executa a aplicação final


Comandos do NPM e Gulp
----------------------

> gulp build ou npm run build

    Compila o projeto e gera o código em dist/

> gulp clean

    Limpa o diretório dist/ que é onde fica o código compilado

> gulp run

    gulp clean && Executa o código compilado

> npm test

    Invoca o Mocha para executar as rotinas de teste definidas em test/

> npm start

    gulp build && gulp run

```OBS.: Para a aplicação funcionar, ela precisa estar em um projeto cujos módulos Node.js estejam instalados.```

Compatibilidade
---------------

* 0.10.x ou superior