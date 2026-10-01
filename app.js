const $ = s => document.querySelector(s);
const esc = s => s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const slug = n => n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const byName = Object.fromEntries(INJURIES.map(i => [slug(i[0]), i]));
const regions = ['All', ...new Set(INJURIES.map(i => i[2]))];
const ML = n => 'https://vsearch.nlm.nih.gov/vivisimo/cgi-bin/query-meta?v%3Aproject=medlineplus&query=' + encodeURIComponent(n);
let region = 'All';

$('#statInj').textContent = INJURIES.length;
$('#statNut').textContent = Object.keys(SUPP).length;

function renderGallery() {
  $('#chips').innerHTML = regions.map(r => `<button class="chip${r === region ? ' on' : ''}" data-r="${r}">${r}</button>`).join('');
  const list = INJURIES.filter(i => region === 'All' || i[2] === region);
  $('#gallery').innerHTML = list.map(i => `<a class="card" href="#/injury/${slug(i[0])}"><span class="ico">${i[1]}</span><h3>${i[0]}</h3><small>${i[2]}</small><p>${i[3]}</p></a>`).join('');
}
$('#chips').addEventListener('click', e => { if (e.target.dataset.r) { region = e.target.dataset.r; renderGallery(); } });

$('#sideInjuries').innerHTML = INJURIES.map(i => `<a href="#/injury/${slug(i[0])}">${i[0]}</a>`).join('');
const sidebar = $('#sidebar'), overlay = $('#overlay');
const side = open => { sidebar.classList.toggle('open', open); overlay.classList.toggle('on', open); };
$('#menuBtn').onclick = () => side(true);
$('#closeSide').onclick = overlay.onclick = () => side(false);
sidebar.addEventListener('click', e => { if (e.target.closest('.side-sub a, a.side-link')) side(false); });
$('#injToggle').onclick = () => $('#sideInjuries').classList.toggle('show');
$('#aboutToggle').onclick = () => $('#sideAbout').classList.toggle('show');

const input = $('#search'), box = $('#suggest');
input.addEventListener('input', () => {
  const q = input.value.toLowerCase().trim();
  const m = q ? INJURIES.filter(i => (i[0] + ' ' + i[2]).toLowerCase().includes(q)) : [];
  box.hidden = !m.length;
  box.innerHTML = m.map(i => `<a href="#/injury/${slug(i[0])}">${i[1]} ${i[0]} <small>${i[2]}</small></a>`).join('');
});
input.addEventListener('keydown', e => { if (e.key === 'Enter') { const a = box.querySelector('a'); if (a) location.hash = a.getAttribute('href'); } });
document.addEventListener('click', e => {
  if (!e.target.closest('.search')) box.hidden = true;
  else if (e.target.closest('#suggest a')) { box.hidden = true; input.value = ''; }
});

function renderView(i) {
  const nut = i[6].map(k => SUPP[k]).map(s => `<section class="nut"><h3>${s.n}</h3><dl>
    <dt>Source</dt><dd>${s.s}</dd><dt>Formulation</dt><dd>${s.f}</dd><dt>Typical dose</dt><dd>${s.d}</dd><dt>How to use</dt><dd>${s.u}</dd></dl>
    <p class="warn"><b>Caution:</b> ${s.w}</p></section>`).join('');
  return `<div class="vhead"><a href="#/" class="back">← All injuries</a><span class="ico big">${i[1]}</span><h2>${i[0]}</h2><small>${i[2]}</small></div>
  <div class="vbody">
   <section><h3>What it is</h3><p>${i[3]}</p></section>
   <section><h3>Common signs</h3><p>${i[4]}</p></section>
   <section><h3>First aid and care</h3><p>${i[5]}</p></section>
   <h3 class="sec">Nutraceutical support</h3><div class="nuts">${nut}</div>
   <section class="src"><h3>Source and further reading</h3>
    <p>Description summarised from public-domain NIH health information. <a href="${ML(i[0])}" target="_blank" rel="noopener">MedlinePlus: ${esc(i[0])}</a> · <a href="https://ods.od.nih.gov/factsheets/list-all/" target="_blank" rel="noopener">NIH Office of Dietary Supplements fact sheets</a></p></section>
   <p class="disc">Educational suggestion only. Evidence for supplements varies; they do not replace medical treatment. Consult a doctor for severe pain, swelling or loss of function.</p></div>`;
}
function route() {
  const m = location.hash.match(/^#\/injury\/(.+)$/), i = m && byName[m[1]];
  $('#view').hidden = !i; $('#home').hidden = !!i;
  if (i) { $('#view').innerHTML = renderView(i); $('#view').scrollTop = 0; document.title = i[0] + ' · Sports Injury Care'; }
  else document.title = 'Sports Injury Care';
  document.body.style.overflow = i ? 'hidden' : '';
}
window.addEventListener('hashchange', route);
renderGallery(); route();