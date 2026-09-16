const scenes = [
  {num:'壹',name:'西湖初遇',eye:'序 · 南宋绍兴年间',title:'烟雨断桥<br><strong>一伞相逢</strong>',text:'清明时节，西湖烟雨。白素贞与小青游至断桥，恰逢书生许仙。一柄青伞，遮住了雨，也撑开一段千年情缘。',action:'递出油纸伞'},
  {num:'贰',name:'同舟归家',eye:'第一折 · 雨歇钱塘',title:'渡船轻摇<br><strong>心意初明</strong>',text:'船行碧波，雨声渐远。许仙送伞至白府，几句温言，一盏清茶。两颗心在檐下悄然靠近，结作人间夫妻。',action:'叩响白府门'},
  {num:'叁',name:'端午惊变',eye:'第二折 · 雄黄入酒',title:'一盏雄黄<br><strong>惊破好梦</strong>',text:'端午日，许仙劝饮雄黄。白素贞难抵药力，现出蛇身。许仙惊绝倒地，她却不顾安危，远赴昆仑求取仙草。',action:'前往昆仑山'},
  {num:'肆',name:'水漫金山',eye:'第三折 · 金山寺外',title:'潮生江海<br><strong>只为一人</strong>',text:'法海将许仙困于金山。白素贞苦求不得，情急引来滔天江水。风雷之中，她要的不过是与所爱之人重逢。',action:'唤起钱塘潮'},
  {num:'伍',name:'雷峰永誓',eye:'终折 · 雷峰塔下',title:'塔影千年<br><strong>此情不灭</strong>',text:'雷峰塔锁得住身，却锁不住相思。多年之后塔倾人聚，断桥仍在，伞下的誓言终于穿过漫长岁月。',action:'回望初见时'}
];

let current = 0;
const $ = (s) => document.querySelector(s);
const stage = $('.stage');
const title = $('#title');
const storyText = $('#storyText');
const eyebrow = $('#eyebrow');
const actionLabel = $('#storyAction span');
const buttons = [...document.querySelectorAll('[data-scene]')];

function showScene(index) {
  current = (index + scenes.length) % scenes.length;
  const scene = scenes[current];
  document.body.className = `scene-${current + 1}`;
  $('#chapterNumber').textContent = scene.num;
  $('#chapterName').textContent = scene.name;
  eyebrow.textContent = scene.eye;
  title.innerHTML = scene.title;
  storyText.textContent = scene.text;
  actionLabel.textContent = scene.action;
  buttons.forEach((button, i) => button.classList.toggle('active', i === current));
  $('#progressBar').style.width = `${(current + 1) * 20}%`;
  stage.classList.remove('transitioning');
  void stage.offsetWidth;
  stage.classList.add('transitioning');
}

buttons.forEach(button => button.addEventListener('click', () => showScene(Number(button.dataset.scene))));
$('#prevBtn').addEventListener('click', () => showScene(current - 1));
$('#nextBtn').addEventListener('click', () => showScene(current + 1));
$('#storyAction').addEventListener('click', () => showScene(current === scenes.length - 1 ? 0 : current + 1));
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight') showScene(current + 1);
  if (event.key === 'ArrowLeft') showScene(current - 1);
});

stage.addEventListener('pointermove', (event) => {
  const x = (event.clientX / innerWidth - .5) * 2;
  const y = (event.clientY / innerHeight - .5) * 2;
  $('.lady').style.translate = `${x * 8}px ${y * 3}px`;
  $('.scholar').style.translate = `${x * -7}px ${y * -2}px`;
  $('#umbrella').style.marginLeft = `${x * 5}px`;
});

// A tiny synthesized rain bed keeps the page self-contained and starts only after consent.
let audioContext;
let rainSource;
$('#soundBtn').addEventListener('click', () => {
  const button = $('#soundBtn');
  if (audioContext) {
    rainSource.stop();
    audioContext.close();
    audioContext = null;
    button.classList.remove('playing');
    button.setAttribute('aria-pressed', 'false');
    button.querySelector('b').textContent = '听雨';
    return;
  }
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 2, audioContext.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < channel.length; i++) channel[i] = (Math.random() * 2 - 1) * .22;
  rainSource = audioContext.createBufferSource();
  const filter = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();
  filter.type = 'lowpass'; filter.frequency.value = 1800; gain.gain.value = .09;
  rainSource.buffer = buffer; rainSource.loop = true;
  rainSource.connect(filter).connect(gain).connect(audioContext.destination);
  rainSource.start();
  button.classList.add('playing');
  button.setAttribute('aria-pressed', 'true');
  button.querySelector('b').textContent = '止雨';
});
