'use strict';

const characterData = {
  Ash: { pronouns: 'he/him', skin: '#a3b899', clothes: '#556b2f', hair: '#302c28', eyes: '#101010' },
  Cleo: { pronouns: 'she/her', skin: '#b0c4de', clothes: '#1a1a1a', hair: '#792b50', eyes: '#101010' },
  Julian: { pronouns: 'he/him', skin: '#e0af9d', clothes: '#4a5d4e', hair: '#46352b', eyes: '#101010' },
  Mika: { pronouns: 'he/they', skin: '#f3e5ab', clothes: '#b0e0e6', hair: '#bc8e52', eyes: '#101010' },
  Maya: { pronouns: 'she/her', skin: '#c98e70', clothes: '#a64835', hair: '#242027', eyes: '#101010' },
  Robin: { pronouns: 'they/them', skin: '#d8c1c8', clothes: '#403747', hair: '#242027', eyes: '#101010' }
};

const crushData = {
  Ash: [
    { name: 'Julian', desc: 'The grumpy lookout' },
    { name: 'Mika', desc: 'The soft sunshine medic' }
  ],
  Cleo: [
    { name: 'Maya', desc: 'The badass mechanic' },
    { name: 'Robin', desc: 'The goth archivist' }
  ]
};

const state = {
  protagonist: '',
  crush: '',
  hunger: 30,
  affection: 0,
  currentStep: 0,
  choice1: '',
  ending: ''
};

const screens = [...document.querySelectorAll('.screen')];
const hud = document.getElementById('hud');
const choicesBox = document.getElementById('choices-box');
const nextButton = document.getElementById('next-btn');

function showScreen(screenName) {
  const target = document.getElementById(`screen-${screenName}`);
  if (!target) return;
  screens.forEach((screen) => {
    const active = screen === target;
    screen.classList.toggle('active', active);
    screen.hidden = !active;
  });
  hud.hidden = screenName !== 'game';
}

function svgSprite(name) {
  const character = characterData[name];
  const hair = name === 'Ash' || name === 'Julian' || name === 'Mika' || name === 'Robin';
  const hairShape = hair
    ? `<path d="M34 28 Q34 8 50 10 Q68 10 67 31 L61 24 Q50 18 39 27Z" fill="${character.hair}"/>`
    : `<path d="M33 31 Q29 7 50 8 Q72 9 68 33 L63 25 L60 42 L39 39 L37 25Z" fill="${character.hair}"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 150"><ellipse cx="50" cy="146" rx="33" ry="4" fill="#000" opacity=".35"/><path d="M27 67 Q50 51 73 67 L82 137 L18 137Z" fill="${character.clothes}"/><rect x="43" y="43" width="14" height="16" rx="5" fill="${character.skin}"/><ellipse cx="50" cy="31" rx="19" ry="24" fill="${character.skin}"/>${hairShape}<circle cx="43" cy="33" r="2" fill="${character.eyes}"/><circle cx="57" cy="33" r="2" fill="${character.eyes}"/><path d="M45 43 Q50 46 55 43" fill="none" stroke="#573d3d" stroke-width="1.5"/><path d="M30 75 L24 115 M70 75 L76 115" stroke="${character.skin}" stroke-width="9" stroke-linecap="round"/><path d="M34 136 L31 149 M66 136 L69 149" stroke="#24232a" stroke-width="9" stroke-linecap="round"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function updateHUD() {
  document.getElementById('hunger-display').textContent = `🧠 HUNGER: ${state.hunger}%`;
  document.getElementById('affection-display').textContent = `🖤 AFFECTION: ${state.affection}`;
}

function setDialogue(speaker, text, activeSpeaker = 'none', act = '') {
  document.getElementById('speaker-name').textContent = speaker;
  document.getElementById('dialogue-text').textContent = text;
  document.getElementById('act-label').textContent = act;
  document.getElementById('player-sprite').classList.toggle('speaking', activeSpeaker === 'player');
  document.getElementById('crush-sprite').classList.toggle('speaking', activeSpeaker === 'crush');
}

function setupStage() {
  const playerSprite = document.getElementById('player-sprite');
  const crushSprite = document.getElementById('crush-sprite');
  playerSprite.style.backgroundImage = svgSprite(state.protagonist);
  crushSprite.style.backgroundImage = svgSprite(state.crush);
  playerSprite.classList.add('active');
  crushSprite.classList.add('active');
  updateHUD();
  runScript();
}

function selectProtagonist(name) {
  if (!crushData[name]) return;
  state.protagonist = name;
  const container = document.getElementById('crush-options');
  container.replaceChildren();
  crushData[name].forEach(({ name: crushName, desc }) => {
    const button = document.createElement('button');
    button.className = 'btn character-option';
    button.type = 'button';
    button.dataset.crush = crushName;
    const title = document.createElement('span');
    title.className = 'option-name';
    title.textContent = `${crushName} `;
    const pronouns = document.createElement('small');
    pronouns.textContent = `(${characterData[crushName].pronouns})`;
    title.append(pronouns);
    const description = document.createElement('span');
    description.className = 'option-description';
    description.textContent = desc;
    button.append(title, description);
    container.append(button);
  });
  showScreen('crush-select');
}

function selectCrush(name) {
  if (!characterData[name]) return;
  state.crush = name;
  state.hunger = 30;
  state.affection = 0;
  state.currentStep = 0;
  state.choice1 = '';
  state.ending = '';
  choicesBox.replaceChildren();
  nextButton.hidden = false;
  showScreen('game');
  setupStage();
}

function showChoices(choices) {
  choicesBox.replaceChildren();
  nextButton.hidden = true;
  choices.forEach(({ text, action }) => {
    const button = document.createElement('button');
    button.className = 'btn choice-btn';
    button.type = 'button';
    button.textContent = text;
    button.addEventListener('click', () => {
      button.disabled = true;
      action();
      choicesBox.replaceChildren();
      nextButton.hidden = false;
      advanceStory();
    }, { once: true });
    choicesBox.append(button);
  });
}

function advanceStory() {
  if (state.currentStep >= 8) return;
  state.currentStep += 1;
  runScript();
}

function runScript() {
  const crush = state.crush;
  switch (state.currentStep) {
    case 0:
      setDialogue('System', `You creep up to the edge of the survivor camp's fence. Your dead heart beats for ${crush}.`, 'none', 'Act I · If I were a zombie…');
      break;
    case 1:
      setDialogue(crush, "Hey! Who's out there rustling in the perimeter bushes? Show yourself!", 'crush');
      break;
    case 2:
      setDialogue('System', 'Your stomach rumbles fiercely. The scent of a live human is intoxicating. What do you do?');
      showChoices([
        { text: '[Groan longingly] Try to use your broken vocal cords.', action: () => { state.hunger = Math.min(100, state.hunger + 10); state.affection += 5; state.choice1 = 'groan'; updateHUD(); } },
        { text: '[Offer a gift] Slide your scavenged mixtape under the fence.', action: () => { state.affection += 15; state.choice1 = 'gift'; updateHUD(); } }
      ]);
      break;
    case 3:
      if (state.choice1 === 'groan') {
        setDialogue(state.protagonist, '…Gggrrraaaaooohh…', 'player');
      } else {
        setDialogue('System', `You slide your mixtape under the fence. ${crush} steps back, then carefully picks it up.`);
      }
      updateHUD();
      break;
    case 4:
      if (state.choice1 === 'groan') {
        setDialogue(crush, 'Wait… are you trying to say hello to me? You aren’t attacking…', 'crush');
      } else {
        setDialogue(crush, 'You… brought this for me? Wow. You’re not like the other monsters out there.', 'crush');
      }
      break;
    case 5:
      setDialogue('System', `A few weeks pass. Your midnight rendezvous have become a mutual secret. Tonight, ${crush} sneaks outside the gate to sit with you.`, 'none', 'Act II · A no-brainer');
      break;
    case 6:
      setDialogue(crush, 'I know it sounds completely insane… but I think I have real feelings for you.', 'crush');
      break;
    case 7:
      setDialogue('System', `${crush} rests a warm hand over your cold undead one. Your hunger spikes dangerously. What will you do?`);
      showChoices([
        { text: '[Lean closer] Hold their hand and go in for a clumsy zombie kiss.', action: () => { state.ending = state.hunger >= 40 ? 'tragedy' : 'love'; if (state.ending === 'love') state.affection += 20; updateHUD(); } },
        { text: '[Distract yourself] Pull away safely and point out the constellations.', action: () => { state.hunger = Math.max(0, state.hunger - 15); state.ending = 'friends'; updateHUD(); } }
      ]);
      break;
    case 8:
      triggerEnding();
      break;
    default:
      break;
  }
}

function triggerEnding() {
  const endings = {
    tragedy: {
      title: '💔 Tragic ending',
      text: `Your hunger was too strong. You bit ${state.crush}. But hey… as the song says, now you can walk down the street together as the undead.`
    },
    love: {
      title: '🖤 Happily ever undead',
      text: `You pulled off the impossible! You shared a beautiful, clumsy romantic kiss with ${state.crush} without trying to eat their brains. True love is a complete no-brainer!`
    },
    friends: {
      title: '🤷 Apocalyptic friends',
      text: `You kept ${state.crush} safe from your appetite, but the romantic window passed. You remain their loyal, secret zombie bodyguard on the outside of the fence.`
    }
  };
  const ending = endings[state.ending] || endings.friends;
  document.getElementById('end-title').textContent = ending.title;
  document.getElementById('end-text').textContent = ending.text;
  showScreen('end');
}

function resetGame() {
  state.protagonist = '';
  state.crush = '';
  state.hunger = 30;
  state.affection = 0;
  state.currentStep = 0;
  state.choice1 = '';
  state.ending = '';
  document.getElementById('player-sprite').classList.remove('active', 'speaking');
  document.getElementById('crush-sprite').classList.remove('active', 'speaking');
  choicesBox.replaceChildren();
  nextButton.hidden = false;
  showScreen('start');
}

document.addEventListener('click', (event) => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'start') showScreen('char-select');
  if (action === 'back-start') showScreen('start');
  if (action === 'back-protagonist') showScreen('char-select');
  if (action === 'next') advanceStory();
  if (action === 'reset') resetGame();
  const protagonist = event.target.closest('[data-protagonist]')?.dataset.protagonist;
  const crush = event.target.closest('[data-crush]')?.dataset.crush;
  if (protagonist) selectProtagonist(protagonist);
  if (crush) selectCrush(crush);
});
