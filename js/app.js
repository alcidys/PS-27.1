(() => {
  const el = id => document.getElementById(id);
  const fill = (id, value) => { el(id).textContent = value || 'Não informado'; };
  function showResume(person) {
    BuddyEvaluation.open(person);
    for(const [id,key] of Object.entries({nome:'name',email:'email',curso:'course',semestre:'semester',apresentacao:'intro',experiencia:'experience',organizacao:'organization',welcome:'welcome'})) fill(id,person[key]);
    el('nome').textContent = (person.name || 'Não informado').toLocaleUpperCase('pt-BR');
    el('formacao-resumo').textContent = person.course;
    el('fotos').replaceChildren();
    const urls = [...new Set(person.photo.match(/https?:\/\/[^\s;<>"\]]+/gi) || [])];
    urls.forEach((raw,index) => {
      try {
        const url = new URL(raw);
        if(!['https:','http:'].includes(url.protocol)) return;
        const link = document.createElement('a');
        link.href = url.href; link.target = '_blank'; link.rel = 'noopener noreferrer';
        link.textContent = urls.length > 1 ? `Abrir foto ${index + 1} ↗` : 'Abrir foto enviada ↗';
        el('fotos').append(link);
      } catch { /* Um valor que não seja URL não é exibido como link. */ }
    });
    el('foto-secao').hidden = !el('fotos').childElementCount;
    el('consulta').hidden = true; el('resultado').hidden = false;
    el('nome').focus(); window.scrollTo(0,0);
  }
  el('form-usuario').addEventListener('submit', async event => {
    event.preventDefault();
    const username = el('usuario').value.trim().toLowerCase();
    el('status').textContent = '';
    if (!username || /[\s@]/.test(username)) {
      el('status').textContent = 'Digite somente o usuário do candidato, sem espaços e sem @al.insper.edu.br.';
      el('usuario').focus(); return;
    }
    el('confirmar').disabled = true; el('status').textContent = 'Buscando candidatura…';
    try {
      const records = await BuddyData.load();
      showResume(BuddyData.findCandidate(records,username));
      el('status').textContent = '';
    } catch(error) {
      el('status').textContent = error instanceof TypeError ? 'Não foi possível carregar a planilha. Verifique sua conexão e tente novamente.' : error.message;
    } finally { el('confirmar').disabled = false; }
  });
  el('voltar').addEventListener('click', () => {
    if (!BuddyEvaluation.canLeave()) return;
    el('resultado').hidden = true; el('consulta').hidden = false;
    el('usuario').value = ''; el('status').textContent = ''; el('usuario').focus(); window.scrollTo(0,0);
  });
  el('imprimir').addEventListener('click', () => window.print());
})();
