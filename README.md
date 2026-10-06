# Buddy Program 2027.1

Site estático para consultar candidaturas pelo usuário do e-mail institucional.

## Executar localmente

Abra a pasta no VS Code e use a extensão Live Server para abrir index.html. Abrir o arquivo diretamente com dois cliques não permite carregar o Excel automaticamente.

Digite somente a parte anterior a @al.insper.edu.br. A busca ignora maiúsculas e espaços nas extremidades. Respostas duplicadas para um usuário geram uma mensagem para revisão da organização.

## Atualizar os dados

Substitua dados/candidatos.xlsx e mantenha os títulos das colunas do formulário na primeira linha da primeira aba. Recarregue a página após atualizar o arquivo. O campo E-mail é usado primeiro; Email é usado como alternativa quando contém um endereço institucional válido. Não são exibidos matrícula e horários de envio.

Fotos são exibidas como links para o arquivo original, pois links do formulário podem precisar de autenticação e não ser imagens públicas diretas. As respostas são mostradas como texto, sem executar HTML.

## Publicar no GitHub Pages

Envie esta estrutura para seu repositório, incluindo vendor e dados. Em Settings > Pages, selecione Deploy from a branch, a branch principal e a pasta /(root). O site usa caminhos relativos e pode funcionar em um subdiretório como /PS-27.1/.

O arquivo Excel publicado pode ser baixado integralmente. A consulta por usuário não é autenticação. A instrução noindex apenas solicita que buscadores não indexem a página; não protege os dados.

## Arquivos

- index.html: consulta e currículo.
- css/style.css: estilo responsivo e impressão.
- js/planilha.js: leitura e busca das respostas.
- js/app.js: interação e preenchimento do currículo.
- vendor/read-excel-file.min.js: leitor Excel local, versão 5.8.8 (MIT).

Biblioteca: https://github.com/catamphetamine/read-excel-file
Distribuição: https://unpkg.com/read-excel-file@5.8.8/bundle/read-excel-file.min.js

## Avaliações de entrevistas

O formulário registra cinco notas inteiras de 0 a 5: Comunicação e Empatia, Soluções Práticas, Trabalho em Equipe e Responsabilidade, Inglês e Texto. Texto é um critério de nota; Anotações é um campo livre separado. Zero é uma nota válida, diferente de não avaliado. Todos os critérios precisam ser preenchidos para salvar.

Salvar grava as notas e anotações no localStorage deste navegador e solicita o download de entrevistados.xlsx, com uma aba entrevistados. Cada candidato tem uma linha, identificada pelo usuário Insper. Salvar novamente atualiza a linha existente. O download contém todas as entrevistas salvas neste navegador, com as notas numéricas em colunas próprias e as anotações ao final. A data é registrada em UTC. O botão Baixar entrevistados.xlsx permite repetir o download.

O navegador pode renomear downloads repetidos (por exemplo, entrevistados (1).xlsx). O site não pode sobrescrever automaticamente um arquivo existente na pasta do projeto. Guarde a cópia mais recente. Limpar os dados do navegador, trocar de computador/perfil/endereço do site ou usar modo privado pode remover ou separar os registros. Não há sincronização entre entrevistadores. Para um arquivo central compartilhado será necessário conectar um serviço de armazenamento com autenticação.

Leitor de arquivos: read-excel-file 5.8.8. Exportador: ExcelJS 4.4.0, incluído localmente em vendor, licença MIT. Fontes Inter e League Spartan em assets/fonts, licenças OFL incluídas.
