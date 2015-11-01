RioBus
======

[![Build Status](https://snap-ci.com/RioBus/data-provider/branch/master/build_image)](https://snap-ci.com/RioBus/data-provider/branch/master)

O RioBus é um sistema colaborativo de monitoramento de ônibus em tempo real, que utiliza a API aberta de dados de
mobilidade urbana fornecida pela parceria entre a Prefeitura do Rio de Janeiro e a FETRANSPOR.
Seu objetivo principal é ajudar o cidadão, seja ele morador ou visitante, do Rio de Janeiro a se deslocar pela cidade.


Arquitetura
-----------

A aplicação do provedor de dados do RioBus foi desenvolvida sobre a plataforma Node.js.

A organização da lógica da aplicação é dividida em camadas e separa o acesso ao repositório de dados da lógica da aplicação,
de forma que o código fique desacoplado e organizado, facilitando a manutenção e a adição de novas funcionalidades.


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

Execute a aplicação:
> $ npm start

Os dados dos ônibus são salvos no banco de dados NoSQL [MongoDB](https://www.mongodb.org/). Certifique-se de que ele 
esteja ligado antes de executar a aplicação. As configurações de conexão devem ser definidas nas variáveis de ambiente do
Sistema Operacional de acordo com as configurações padrão descritas em ```env.config.sh```.

Comandos NPM
------------

npm test
> Invoca o Mocha e roda as rotinas de testes unitários configurados em test/

npm start
> Roda a aplicação

npm install
> Inslata as dependências locais e globais do projeto.

Compatibilidade
---------------

* node.js >= 0.11