# Ajuste local em read-excel-file 5.8.8

O Excel fornecido declara dimension ref="A1", mas contém células até a coluna P e várias linhas. O leitor original usa essa dimensão para reduzir a matriz e descarta as outras colunas.

No bundle distribuído, a expressão `l=wr(u)||function` foi substituída por `l=function`, fazendo o leitor usar seu cálculo já existente de dimensões a partir das células reais. Nenhum dado da planilha foi modificado. Preserve este ajuste ao atualizar a biblioteca ou confirme que a nova versão resolve esse caso.

Fonte original: https://unpkg.com/read-excel-file@5.8.8/bundle/read-excel-file.min.js
Licença: LICENSE-read-excel-file.txt
