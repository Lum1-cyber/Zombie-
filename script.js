'use strict';

const characterData = {
  Ash: { pronouns: 'he/him', skin: '#a3b899', clothes: '#556b2f', hair: '#302c28' },
  Cleo: { pronouns: 'she/her', skin: '#b0c4de', clothes: '#1a1a1a', hair: '#792b50' },
  Julian: { pronouns: 'he/him', skin: '#e0af9d', clothes: '#4a5d4e', hair: '#46352b' },
  Mika: { pronouns: 'he/they', skin: '#f3e5ab', clothes: '#b0e0e6', hair: '#bc8e52' },
  Maya: { pronouns: 'she/her', skin: '#c98e70', clothes: '#a64835', hair: '#242027' },
  Robin: { pronouns: 'they/them', skin: '#d8c1c8', clothes: '#403747', hair: '#242027' }
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
  firstChoice: '',
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
  if (!character) return '';

  const longHair = ['Cleo', 'Maya'].includes(name);
  const hair = longHair
    ? `<path d="M29 43Q24 8 50 9Q78 10 72 46L68 93 60 75 58 34Q48 23 37 36L35 91 28 73Z" fill="${character.hair}"/>`
    : `<path d="M31 39Q29 9 50 9Q73 9 70 40L63 32Q49 24 37 37Z" fill="${character.hair}"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 150"><ellipse cx="50" cy="146" rx="33" ry="4" fill="#000" opacity=".35"/><path d="M27 67Q50 51 73 67L82 137H18Z" fill="${character.clothes}"/><path d="M39 59h22v20H39z" fill="${character.skin}"/><ellipse cx="50" cy="39" rx="22" ry="27" fill="${character.skin}"/>${hair}<circle cx="42" cy="43" r="2.5" fill="#17131b"/><circle cx="58" cy="43" r="2.5" fill="#17131b"/><path d="M44 55q6 5 12 0" fill="none" stroke="#713c4c" stroke-width="2" stroke-linecap="round"/><path d="M22 78l-8 39m64-39 8 39" stroke="${character.skin}" stroke-width="9" stroke-linecap="round"/><path d="M34 137v8m32-8v8" stroke="#d5c6ae" stroke-width="8" stroke-linecap="round"/><circle cx="32" cy="52" r="3" fill="#ff4a75" opacity=".8"/><circle cx="68" cy="52" r="3" fill="#ff4a75" opacity=".8"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function updateHUD() {
  document.getElementById('hunger-display').textContent = `🧠 HUNGER: ${state.hunger}%`;
  document.getElementById('affection-display').textContent = `💖 AFFECTION: ${state.affection}`;
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
  if (!characterData[name] || !state.protagonist) return;
  state.crush = name;
  state.hunger = 30;
  state.affection = 0;
  state.currentStep = 0;
  state.firstChoice = '';
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
      setDialogue('Narrator', `You creep up to the edge of the survivor camp's fence. Your dead heart beats for ${crush}.`, 'none', 'Act I · If I were a zombie…');
      break;
    case 1:
      setDialogue(crush, "Hey! Who's out there rustling in the perimeter bushes? Show yourself!", 'crush');
      break;
    case 2:
      setDialogue('System', 'Your stomach rumbles fiercely. The scent of a live human is intoxicating. What do you do?');
      showChoices([
        {
          text: '[Groan longingly] Try to use your broken vocal cords.',
          action: () => {
            state.hunger = Math.min(100, state.hunger + 10);
            state.affection += 5;
            state.firstChoice = 'groan';
            updateHUD();
          }
        },
        {
          text: '[Offer a gift] Slide your scavenged mixtape under the fence.',
          action: () => {
            state.affection += 15;
            state.firstChoice = 'gift';
            updateHUD();
          }
        }
      ]);
      break;
    case 3:
      if (state.firstChoice === 'groan') {
        setDialogue(state.protagonist, '…Gggrrraaaaooohh…', 'player');
      } else {
        setDialogue('Narrator', `You slide your mixtape under the fence. ${crush} steps back, then carefully picks it up.`);
      }
      updateHUD();
      break;
    case 4:
      if (state.firstChoice === 'groan') {
        setDialogue(crush, 'Wait… are you trying to say hello to me? You aren’t attacking…', 'crush');
      } else {
        setDialogue(crush, 'You… brought this for me? Wow. You’re not like the other monsters out there.', 'crush');
      }
      break;
    case 5:
      setDialogue('Narrator', `A few weeks pass. Your midnight rendezvous have become a mutual secret. Tonight, ${crush} sneaks outside the gate to sit with you.`, 'none', 'Act II · A no-brainer');
      break;
    case 6:
      setDialogue(crush, 'I know it sounds completely insane… but I think I have real feelings for you.', 'crush');
      break;
    case 7:
      setDialogue('System', `${crush} rests a warm hand over your cold undead one. Your hunger spikes dangerously. What will you do?`);
      showChoices([
        {
          text: '[Lean closer] Hold their hand and go in for a clumsy zombie kiss.',
          action: () => {
            state.ending = state.hunger >= 40 ? 'tragedy' : 'love';
            if (state.ending === 'love') state.affection += 20;
            updateHUD();
          }
        },
        {
          text: '[Distract yourself] Pull away safely and point out the constellations.',
          action: () => {
            state.hunger = Math.max(0, state.hunger - 15);
            state.ending = 'friends';
            updateHUD();
          }
        }
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
      title: '💖 Happily ever undead',
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
  state.firstChoice = '';
  state.ending = '';
  document.getElementById('player-sprite').classList.remove('active', 'speaking');
  document.getElementById('crush-sprite').classList.remove('active', 'speaking');
  choicesBox.replaceChildren();
  nextButton.hidden = false;
  showScreen('start');
}

document.addEventListener('click', (event) => {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;
  const action = target.closest('[data-action]')?.dataset.action;
  if (action === 'start') showScreen('char-select');
  if (action === 'back-start') showScreen('start');
  if (action === 'back-protagonist') showScreen('char-select');
  if (action === 'next') advanceStory();
  if (action === 'reset') resetGame();

  const protagonist = target.closest('[data-protagonist]')?.dataset.protagonist;
  const crush = target.closest('[data-crush]')?.dataset.crush;
  if (protagonist) selectProtagonist(protagonist);
  if (crush) selectCrush(crush);
});
