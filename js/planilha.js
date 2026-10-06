/* Leitura da primeira aba; as colunas são identificadas pelos títulos. */
window.BuddyData = (() => {
  const domain = '@al.insper.edu.br';
  const text = value => String(value ?? '').trim();
  const normalize = value => text(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ');
  let cached;
  function fromRows(rows) {
    if (!rows.length) throw new Error('A planilha está vazia.');
    const headers = rows[0].map(normalize);
    const find = prefix => headers.findIndex(h => h.startsWith(prefix));
    const columns = {name:find('nome completo'),email:find('e-mail'),fallbackEmail:headers.indexOf('email'),course:find('curso'),semester:find('qual sera o seu semestre'),experience:find('voce ja foi buddy'),intro:find('vamos la'),organization:find('voce tera disponibilidade para encontros'),welcome:find('voce tera disponibilidade para estar'),photo:find('compartilhe uma foto')};
    for (const key of ['name','email','course','semester','experience','intro','organization','welcome']) {
      if(columns[key] < 0) throw new Error('A estrutura da planilha mudou. Confira os títulos das colunas do formulário.');
    }
    return rows.slice(1).filter(row => row.some(value => text(value))).map(row => {
      const get = key => text(row[columns[key]]);
      const emails = [get('email'),get('fallbackEmail')].map(e => e.toLowerCase());
      const email = emails.find(e => e.endsWith(domain) && /^[^\s@]+@al\.insper\.edu\.br$/.test(e)) || '';
      return {name:get('name'),email,username:email.slice(0,-domain.length),course:get('course'),semester:get('semester'),experience:get('experience'),intro:get('intro'),organization:get('organization'),welcome:get('welcome'),photo:get('photo')};
    });
  }
  async function load() {
    if (cached) return cached;
    if (location.protocol === 'file:') throw new Error('Abra o site pelo Live Server do VS Code ou pelo GitHub Pages para carregar a planilha.');
    if (typeof readXlsxFile !== 'function') throw new Error('Não foi possível carregar o leitor de Excel. Confira a pasta vendor.');
    const response = await fetch(new URL('dados/candidatos.xlsx', document.baseURI), {cache:'no-store'});
    if (!response.ok) throw new Error('Não foi possível carregar dados/candidatos.xlsx. Confira o arquivo e tente novamente.');
    let rows;
    try { rows = await readXlsxFile(await response.blob()); }
    catch { throw new Error('Não foi possível ler a planilha. Confira se candidatos.xlsx é um arquivo Excel válido.'); }
    cached = fromRows(rows);
    return cached;
  }
  function findCandidate(records, username) {
    const matches = records.filter(r => r.email && r.username === text(username).toLowerCase());
    if (!matches.length) throw new Error('Usuário não encontrado. Confira o nome digitado.');
    if (matches.length > 1) throw new Error('Há mais de uma resposta para este usuário. A organização precisa conferir a planilha.');
    return matches[0];
  }
  return {load,fromRows,findCandidate};
})();
