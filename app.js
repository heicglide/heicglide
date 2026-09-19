(() => {
  const input = document.getElementById('file-input');
  const dropzone = document.getElementById('dropzone');
  const choose = document.getElementById('choose-button');
  const list = document.getElementById('file-list');
  const clear = document.getElementById('clear-button');
  if (!input || !dropzone) return;

  let rows = [];
  let converterPromise;

  function loadConverter() {
    if (window.heic2any) return Promise.resolve(window.heic2any);
    if (!converterPromise) {
      converterPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js';
        script.onload = () => window.heic2any ? resolve(window.heic2any) : reject(new Error('Converter unavailable'));
        script.onerror = () => reject(new Error('Converter library could not load'));
        document.head.appendChild(script);
      });
    }
    return converterPromise;
  }

  const esc = (value) => String(value).replace(/[&<>'"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const isHeic = (file) => /\.(heic|heif)$/i.test(file.name) || /image\/(heic|heif)/i.test(file.type);
  const outputName = (name) => name.replace(/\.(heic|heif)$/i, '') + '.jpg';

  function rowMarkup(row) {
    const action = row.url ? `<a class="download-button" href="${row.url}" download="${esc(row.output)}">Download</a>` : `<button class="download-button" type="button" disabled>${row.busy ? 'Working…' : 'Ready'}</button>`;
    return `<div class="file-row" data-id="${row.id}"><span class="file-thumb" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="3"/><path d="m7 16 3.5-4 2.3 2.2 1.7-1.8 2.5 3.6M8 7.5h4"/></svg></span><div class="file-meta"><div class="file-name" title="${esc(row.file.name)}">${esc(row.file.name)}</div><div class="file-status ${row.error ? 'error' : ''}">${esc(row.status)}</div></div>${action}</div>`;
  }

  function render() {
    list.innerHTML = rows.map(rowMarkup).join('');
    clear.hidden = rows.length === 0;
    dropzone.style.display = rows.length ? 'none' : 'flex';
  }

  async function convert(row) {
    row.busy = true; row.status = 'Loading converter…'; render();
    try {
      const heic2any = await loadConverter();
      row.status = 'Converting locally…'; render();
      const result = await heic2any({ blob: row.file, toType: 'image/jpeg', quality: 0.92 });
      const blob = Array.isArray(result) ? result[0] : result;
      row.url = URL.createObjectURL(blob);
      row.output = outputName(row.file.name);
      row.status = 'JPG ready to download';
      row.busy = false;
      if (window.trackHeicGlideEvent) window.trackHeicGlideEvent('conversion_complete', { output_format: 'jpg' });
    } catch (error) {
      row.status = 'Could not convert this file. Try again.';
      row.error = true; row.busy = false;
      console.error(error);
    }
    render();
  }

  function addFiles(fileList) {
    const files = Array.from(fileList).filter(isHeic);
    if (!files.length) {
      rows.push({id: crypto.randomUUID(), file: {name: 'Unsupported file', type: ''}, status: 'Please choose a .heic or .heif file', error: true, busy: false});
      render();
      return;
    }
    files.forEach((file) => {
      const row = {id: crypto.randomUUID(), file, status: 'Waiting…', busy: false, output: outputName(file.name)};
      rows.push(row);
      convert(row);
    });
    render();
  }

  choose.addEventListener('click', (event) => { event.stopPropagation(); input.click(); });
  dropzone.addEventListener('click', (event) => { if (event.target !== choose) input.click(); });
  dropzone.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); input.click(); } });
  input.addEventListener('change', () => { addFiles(input.files); input.value = ''; });
  ['dragenter','dragover'].forEach((name) => dropzone.addEventListener(name, (event) => { event.preventDefault(); dropzone.classList.add('dragover'); }));
  ['dragleave','drop'].forEach((name) => dropzone.addEventListener(name, (event) => { event.preventDefault(); dropzone.classList.remove('dragover'); }));
  dropzone.addEventListener('drop', (event) => addFiles(event.dataTransfer.files));
  clear.addEventListener('click', () => { rows.forEach((row) => row.url && URL.revokeObjectURL(row.url)); rows = []; render(); });
  render();
})();
