'use strict';

const characters = {
  Ash: { pronouns: 'he/him', skin: '#b8c5a5', clothes: '#536b3e', hair: '#302c28', accent: '#ff7ca8' },
  Cleo: { pronouns: 'she/her', skin: '#c5c6dc', clothes: '#242027', hair: '#792b50', accent: '#8bd7ff' },
  Julian: { pronouns: 'he/him', skin: '#e0af9d', clothes: '#4a5d4e', hair: '#46352b', accent: '#a3ff80' },
  Mika: { pronouns: 'he/they', skin: '#f3e5ab', clothes: '#b0dce5', hair: '#bc8e52', accent: '#ffb7d9' },
  Maya: { pronouns: 'she/her', skin: '#c98e70', clothes: '#a64835', hair: '#242027', accent: '#ffd36a' },
  Robin: { pronouns: 'they/them', skin: '#d8c1c8', clothes: '#403747', hair: '#242027', accent: '#d3b4ff' }
};

const crushOptions = {
  Ash: [
    { name: 'Julian', description: 'The grumpy lookout' },
    { name: 'Mika', description: 'The soft sunshine medic' }
  ],
  Cleo: [
    { name: 'Maya', description: 'The badass mechanic' },
    { name: 'Robin', description: 'The goth archivist' }
  ]
};

const state = {
  protagonist: '',
  crush: '',
  hunger: 30,
  affection: 0,
  step: 0,
  firstChoice: '',
  ending: ''
};

const screens = [...document.querySelectorAll('.screen')];
const hud = document.getElementById('hud');
const choicesBox = document.getElementById('choices-box');
const nextButton = document.getElementById('next-btn');

function showScreen(name) {
  const target = document.getElementById(`screen-${name}`);
  if (!target) return;

  screens.forEach((screen) => {
    const active = screen === target;
    screen.hidden = !active;
    screen.classList.toggle('active', active);
  });
  hud.hidden = name !== 'game';
}

function makeSprite(name) {
  const character = characters[name];
  if (!character) return '';

  const longHair = ['Cleo', 'Maya'].includes(name);
  const hair = longHair
    ? `<path d="M28 43Q22 8 50 8Q79 10 72 46L68 95 59 73 58 34Q48 23 38 36L35 92 28 75Z" fill="${character.hair}"/>`
    : `<path d="M30 39Q27 10 50 9Q74 9 71 41L63 33Q50 25 37 37Z" fill="${character.hair}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 150" role="img" aria-label="${name}">
    <ellipse cx="50" cy="146" rx="33" ry="4" fill="#000" opacity=".35"/>
    <path d="M27 68Q50 53 73 68L83 139H17Z" fill="${character.clothes}"/>
    <path d="M38 69L50 82 62 69" fill="none" stroke="${character.accent}" stroke-width="3"/>
    <rect x="43" y="60" width="14" height="15" rx="5" fill="${character.skin}"/>
    <circle cx="50" cy="43" r="20" fill="${character.skin}"/>
    ${hair}
    <circle cx="43" cy="46" r="3" fill="#18151a"/>
    <circle cx="57" cy="46" r="3" fill="#18151a"/>
    <path d="M43 57Q50 62 57 57" fill="none" stroke="${character.accent}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M37 51L32 54M67 51L62 54" stroke="#6e9a62" stroke-width="3" stroke-linecap="round"/>
    <path d="M22 84L13 116M78 84L87 116" stroke="${character.skin}" stroke-width="9" stroke-linecap="round"/>
    <path d="M38 139L36 148M62 139L64 148" stroke="#202027" stroke-width="8" stroke-linecap="round"/>
  </svg>`;
}

function updateHUD() {
  document.getElementById('hunger-display').textContent = `🧠 HUNGER: ${state.hunger}%`;
  document.getElementById('affection-display').textContent = `💖 AFFECTION: ${state.affection}`;
}

function setDialogue(speaker, text, act = '') {
  document.getElementById('speaker-name').textContent = speaker;
  document.getElementById('dialogue-text').textContent = text;
  document.getElementById('act-label').textContent = act;
  document.getElementById('player-sprite').classList.toggle('speaking', speaker === state.protagonist);
  document.getElementById('crush-sprite').classList.toggle('speaking', speaker === state.crush);
}

function startStory() {
  document.getElementById('player-sprite').innerHTML = makeSprite(state.protagonist);
  document.getElementById('crush-sprite').innerHTML = makeSprite(state.crush);
  document.getElementById('player-sprite').classList.add('active');
  document.getElementById('crush-sprite').classList.add('active');
  updateHUD();
  runStory();
}

function chooseProtagonist(name) {
  if (!crushOptions[name]) return;
  state.protagonist = name;
  state.hunger = 30;
  state.affection = 0;
  state.step = 0;
  state.firstChoice = '';
  state.ending = '';

  const container = document.getElementById('crush-options');
  container.replaceChildren();

  crushOptions[name].forEach(({ name: crush, description }) => {
    const button = document.createElement('button');
    button.className = 'btn character-option';
    button.type = 'button';
    button.dataset.crush = crush;

    const title = document.createElement('span');
    title.className = 'option-name';
    title.textContent = `${crush} `;
    const pronouns = document.createElement('small');
    pronouns.textContent = `(${characters[crush].pronouns})`;
    title.append(pronouns);

    const detail = document.createElement('span');
    detail.className = 'option-description';
    detail.textContent = description;
    button.append(title, detail);
    container.append(button);
  });

  showScreen('crush-select');
}

function chooseCrush(name) {
  if (!characters[name] || !state.protagonist) return;
  state.crush = name;
  state.hunger = 30;
  state.affection = 0;
  state.step = 0;
  state.firstChoice = '';
  state.ending = '';
  choicesBox.replaceChildren();
  nextButton.hidden = false;
  showScreen('game');
  startStory();
}

function showChoices(options) {
  choicesBox.replaceChildren();
  nextButton.hidden = true;

  options.forEach(({ text, action }) => {
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
  if (state.step >= 8) return;
  state.step += 1;
  runStory();
}

function runStory() {
  const crush = state.crush;
  switch (state.step) {
    case 0:
      setDialogue('Narrator', `You creep up to the survivor camp's fence. Your dead heart beats for ${crush}.`, 'Act I · Unquiet Bones');
      break;
    case 1:
      setDialogue(crush, "Hey! Who's out there rustling in the perimeter bushes? Show yourself!", 'Act I · Unquiet Bones');
      break;
    case 2:
      setDialogue('System', 'Your stomach growls. The scent of a living human is intoxicating. What do you do?');
      showChoices([
        {
          text: '[Groan longingly] Try to greet them with your broken vocal cords.',
          action: () => {
            state.hunger = Math.min(100, state.hunger + 12);
            state.affection += 6;
            state.firstChoice = 'groan';
            updateHUD();
          }
        },
        {
          text: '[Offer a gift] Slide some scavenged flowers and a mixtape under the fence.',
          action: () => {
            state.affection += 16;
            state.firstChoice = 'gift';
            updateHUD();
          }
        }
      ]);
      break;
    case 3:
      if (state.firstChoice === 'groan') {
        setDialogue(state.protagonist, '…Ggrraaaaooohh…', 'Act I · Unquiet Bones');
      } else {
        setDialogue('Narrator', `You slide the flowers and mixtape under the fence. ${crush} picks them up and smiles.`, 'Act I · Unquiet Bones');
      }
      break;
    case 4:
      if (state.firstChoice === 'groan') {
        setDialogue(crush, 'Wait… are you trying to say hello? You aren’t attacking…', 'Act I · Unquiet Bones');
      } else {
        setDialogue(crush, 'You brought these for me? That might be the sweetest thing anyone has done in months.', 'Act I · Unquiet Bones');
      }
      break;
    case 5:
      setDialogue('Narrator', `Weeks pass. Your midnight meetups become a secret ritual. Tonight, ${crush} slips outside the gate to sit with you beneath the moon.`, 'Act II · A Very Human Secret');
      break;
    case 6:
      setDialogue(crush, 'I know it sounds impossible… but I think I have real feelings for you.', 'Act II · A Very Human Secret');
      break;
    case 7:
      setDialogue('System', `${crush} reaches for your cold hand. Your hunger surges. What will you do?`);
      showChoices([
        {
          text: '[Risk the kiss] Hold their hand and trust your heart more than your teeth.',
          action: () => {
            state.ending = state.hunger >= 42 ? 'tragedy' : 'love';
            if (state.ending === 'love') state.affection += 20;
            updateHUD();
          }
        },
        {
          text: '[Look at the stars] Pull away, steady yourself, and keep them safe.',
          action: () => {
            state.hunger = Math.max(0, state.hunger - 15);
            state.ending = 'friends';
            updateHUD();
          }
        }
      ]);
      break;
    case 8:
      finishGame();
      break;
    default:
      break;
  }
}

function finishGame() {
  const endings = {
    tragedy: {
      title: '💔 Kawaii Gore Tragedy',
      text: `Your hunger won out and you gave ${state.crush} a bite before you could stop yourself. The virus takes hold; they wake up undead, and you face the apocalypse together.`
    },
    love: {
      title: '💖 Happily Ever Undead',
      text: `You pulled off the impossible: a tender, clumsy kiss with ${state.crush} without letting hunger win. They promise to sneak you snacks at midnight. True love is a complete no-brainer!`
    },
    friends: {
      title: '🤝 Ghoul-ish Besties',
      text: `You pulled away and kept ${state.crush} safe. The romance can wait; for now, you are their loyal, stylish zombie bodyguard and favorite friend.`
    }
  };

  const ending = endings[state.ending] || endings.friends;
  document.getElementById('end-title').textContent = ending.title;
  document.getElementById('end-text').textContent = ending.text;
  showScreen('end');
}

function resetGame() {
  Object.assign(state, { protagonist: '', crush: '', hunger: 30, affection: 0, step: 0, firstChoice: '', ending: '' });
  document.getElementById('player-sprite').classList.remove('active', 'speaking');
  document.getElementById('crush-sprite').classList.remove('active', 'speaking');
  document.getElementById('player-sprite').replaceChildren();
  document.getElementById('crush-sprite').replaceChildren();
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
  if (protagonist) chooseProtagonist(protagonist);
  if (crush) chooseCrush(crush);
});
