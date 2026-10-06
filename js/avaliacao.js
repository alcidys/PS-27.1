/* Avaliações locais: não há envio de notas para o GitHub nem para terceiros. */
window.BuddyEvaluation = (() => {
  'use strict';
  const STORAGE_KEY = 'buddy-2027-1-entrevistados-v1';
  const criteria = [
    ['comunicacao', 'Comunicação e Empatia'],
    ['solucoes', 'Soluções Práticas'],
    ['equipe', 'Trabalho em Equipe e Responsabilidade'],
    ['ingles', 'Inglês'],
    ['texto', 'Texto']
  ];
  const el = id => document.getElementById(id);
  let candidate = null;
  let dirty = false;
  let busy = false;
  function readRecords() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const records = JSON.parse(raw);
    if (!Array.isArray(records) || records.some(r => !r || typeof r.username !== 'string' || typeof r.name !== 'string' || typeof r.notes !== 'string' || !r.scores || criteria.some(([key]) => !Number.isInteger(r.scores[key]) || r.scores[key] < 0 || r.scores[key] > 5))) {
      throw new Error('Os registros locais não puderam ser lidos. Nenhum registro foi sobrescrito.');
    }
    return records;
  }
  function status(message) { el('avaliacao-status').textContent = message; }
  function refreshCount() {
    try {
      const count = readRecords().length;
      el('salvas-resumo').textContent = `${count} entrevista${count === 1 ? '' : 's'} salva${count === 1 ? '' : 's'} neste navegador.`;
      el('exportar-inicio').disabled = count === 0;
    } catch {
      el('salvas-resumo').textContent = 'Não foi possível acessar as avaliações salvas neste navegador.';
      el('exportar-inicio').disabled = true;
    }
  }
  function paint(key) {
    const group = el(`criterio-${key}`);
    const chosen = group.querySelector('input:checked');
    const value = chosen ? Number(chosen.value) : -1;
    group.querySelectorAll('.star-option').forEach(label => {
      const score = Number(label.dataset.score);
      label.classList.toggle('filled', score > 0 && score <= value);
      label.classList.toggle('selected', score === value);
    });
    group.querySelector('output').textContent = value < 0 ? 'Sem nota' : `${value} de 5`;
  }
  criteria.forEach(([key, label]) => {
    const fieldset = document.createElement('fieldset');
    fieldset.id = `criterio-${key}`;
    fieldset.className = 'rating-field';
    const legend = document.createElement('legend'); legend.textContent = label; fieldset.append(legend);
    const choices = document.createElement('div'); choices.className = 'star-choices';
    for (let n = 0; n <= 5; n++) {
      const option = document.createElement('label'); option.className = 'star-option'; option.dataset.score = n;
      const radio = document.createElement('input'); radio.type = 'radio'; radio.name = key; radio.value = n; radio.required = true;
      radio.setAttribute('aria-label', `${label}: ${n} de 5`);
      const icon = document.createElement('span'); icon.textContent = n === 0 ? '0' : '★'; icon.setAttribute('aria-hidden', 'true');
      radio.addEventListener('change', () => paint(key));
      option.append(radio, icon); choices.append(option);
    }
    const output = document.createElement('output'); output.textContent = 'Sem nota'; output.setAttribute('aria-live', 'polite');
    fieldset.append(choices, output); el('criterios').append(fieldset);
  });
  function open(person) {
    candidate = person; dirty = false;
    el('form-avaliacao').reset();
    status('');
    try {
      const saved = readRecords().find(r => r.username === person.username);
      if (saved) {
        criteria.forEach(([key]) => { el(`criterio-${key}`).querySelector(`input[value="${saved.scores[key]}"]`).checked = true; });
        el('anotacoes').value = saved.notes;
        status('Avaliação salva carregada. Você pode revisar e salvar novamente.');
      }
    } catch { status('Não foi possível ler o armazenamento local. Verifique as permissões do navegador antes de salvar.'); }
    criteria.forEach(([key]) => paint(key));
  }
  async function workbookBuffer(records) {
    if (typeof ExcelJS === 'undefined') throw new Error('O exportador de Excel não carregou. Recarregue a página e tente baixar novamente.');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('entrevistados');
    sheet.columns = [
      {header:'Nome',key:'name',width:42}, {header:'Usuário Insper',key:'username',width:25},
      ...criteria.map(([key,label]) => ({header:label,key,width:key === 'equipe' ? 35 : 24})),
      {header:'Anotações',key:'notes',width:65}, {header:'Atualizado em (UTC)',key:'updatedAt',width:26}
    ];
    records.forEach(record => sheet.addRow({name:record.name,username:record.username,...record.scores,notes:record.notes,updatedAt:record.updatedAt}));
    sheet.views = [{state:'frozen',ySplit:1}];
    sheet.autoFilter = {from:'A1',to:'I1'};
    sheet.getRow(1).height = 40;
    sheet.getRow(1).eachCell(cell => {
      cell.font = {bold:true,color:{argb:'FFFFFFFF'}};
      cell.fill = {type:'pattern',pattern:'solid',fgColor:{argb:'FFB40000'}};
      cell.alignment = {vertical:'middle',wrapText:true};
    });
    for (let row = 2; row <= sheet.rowCount; row++) {
      sheet.getRow(row).alignment = {vertical:'top',wrapText:true};
      sheet.getRow(row).height = Math.min(240, Math.max(32, 16 * Math.ceil((records[row-2].notes.length || 1) / 60)));
      for (let col = 3; col <= 7; col++) sheet.getCell(row,col).numFmt = '0';
    }
    return workbook.xlsx.writeBuffer();
  }
  async function download() {
    const records = readRecords();
    if (!records.length) throw new Error('Salve uma avaliação antes de baixar a planilha.');
    const buffer = await workbookBuffer(records);
    const url = URL.createObjectURL(new Blob([buffer], {type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
    const link = document.createElement('a'); link.href = url; link.download = 'entrevistados.xlsx';
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
  function setBusy(value) {
    busy = value;
    for (const id of ['salvar-avaliacao','exportar-curriculo','exportar-inicio','voltar']) el(id).disabled = value;
    if (!value) refreshCount();
  }
  el('form-avaliacao').addEventListener('input', () => { dirty = true; status('Alterações ainda não salvas.'); });
  el('form-avaliacao').addEventListener('submit', async event => {
    event.preventDefault();
    if (!candidate || busy) return;
    const scores = {};
    for (const [key] of criteria) {
      const selected = el(`criterio-${key}`).querySelector('input:checked');
      if (!selected) { status('Selecione uma nota em todos os critérios.'); return; }
      scores[key] = Number(selected.value);
    }
    try {
      const records = readRecords();
      const record = {name:candidate.name.toLocaleUpperCase('pt-BR'),username:candidate.username,scores,notes:el('anotacoes').value,updatedAt:new Date().toISOString()};
      const index = records.findIndex(r => r.username === record.username);
      if (index < 0) records.push(record); else records[index] = record;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      dirty = false; refreshCount();
    } catch {
      status('Não foi possível salvar. O armazenamento pode estar bloqueado, cheio ou conter registros inválidos. Suas alterações continuam no formulário; não feche a página.'); return;
    }
    setBusy(true); status('Avaliação salva neste navegador. Preparando a planilha…');
    try { await download(); status('Avaliação salva neste navegador. Download solicitado: entrevistados.xlsx.'); }
    catch(error) { status(`Avaliação salva neste navegador, mas o download falhou. ${error.message}`); }
    finally { setBusy(false); }
  });
  for (const id of ['exportar-inicio','exportar-curriculo']) {
    el(id).addEventListener('click', async () => {
      if (busy) return;
      const target = id === 'exportar-inicio' ? el('exportacao-status') : el('avaliacao-status');
      setBusy(true);
      try { await download(); target.textContent = 'Download solicitado: entrevistados.xlsx (somente avaliações já salvas).'; }
      catch(error) { target.textContent = error.message; }
      finally { setBusy(false); }
    });
  }
  window.addEventListener('beforeunload', event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });
  window.addEventListener('storage', event => { if (event.key === STORAGE_KEY) refreshCount(); });
  refreshCount();
  return {open,workbookBuffer,canLeave:() => !dirty || window.confirm('Há alterações não salvas. Deseja sair sem salvar?')};
})();
