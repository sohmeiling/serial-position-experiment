  const wordLists = [
    [
      "Apple", "Blanket", "Candle", "Dragon", "Engine",
      "Forest", "Guitar", "Hammer", "Island", "Jacket",
      "Kitten", "Lantern", "Magnet", "Needle", "Ocean"
    ],
    [
      "Basket", "Window", "Rabbit", "Pencil", "Mountain",
      "Bottle", "Carpet", "Lemon", "Ladder", "Pocket",
      "River", "Button", "Castle", "Feather", "Mirror"
    ],
    [
      "Garden", "Ticket", "Pillow", "Horse", "Camera",
      "Bridge", "Cookie", "Helmet", "Flower", "Suitcase",
      "Turtle", "Ribbon", "Cabinet", "Balloon", "Spoon"
    ],
    [
      "Anchor", "Table", "Monkey", "Curtain", "Diamond",
      "Kettle", "Village", "Wallet", "Pumpkin", "Scissors",
      "Rocket", "Cushion", "Tiger", "Envelope", "Wheel"
    ],
    [
      "Chimney", "Parrot", "Bicycle", "Bucket", "Cloud",
      "Sandwich", "Drum", "Palace", "Towel", "Spider",
      "Newspaper", "Bench", "Potato", "Umbrella", "Clock"
    ]
  ];

  let wordList = [];
  let currentWordIndex = 0;
  let recallScores = [];
  let sessionLists = [];
  let trialResults = [];
  let phase = 'start';

  function showScreen(id) {
    ['start-screen', 'display-screen', 'recall-screen', 'between-screen', 'results-screen'].forEach(screen => {
      document.getElementById(screen).classList.toggle('hidden', screen !== id);
    });
  }

  function startExperiment() {
    if (phase !== 'start') return;
    const count = Number(document.getElementById('trial-count').value);
    if (!Number.isInteger(count) || count < 1 || count > wordLists.length) return;
    sessionLists = wordLists.map(list => list.slice());
    // Shuffle the lists without replacement.
    for (let i = sessionLists.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [sessionLists[i], sessionLists[j]] = [sessionLists[j], sessionLists[i]];
    }
    sessionLists = sessionLists.slice(0, count);
    // Shuffle each copied list; presentation and scoring use this same order.
    sessionLists.forEach(list => {
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
      }
    });
    trialResults = [];
    recallScores = new Array(15).fill(0);
    startTrial();
  }

  function startTrial() {
    if (phase !== 'start' && phase !== 'between') return;
    phase = 'display';
    wordList = sessionLists[trialResults.length];
    currentWordIndex = 0;
    document.getElementById('recall-input').value = '';
    const progress = 'Trial ' + (trialResults.length + 1) + ' of ' + sessionLists.length;
    document.getElementById('trial-progress').textContent = progress;
    document.getElementById('recall-progress').textContent = progress;
    document.getElementById('submit-recall').textContent = trialResults.length + 1 === sessionLists.length ? 'View Results' : 'Submit Recall';
    showScreen('display-screen');
    showNextWord();
  }

  function showNextWord() {
    if (currentWordIndex < wordList.length) {
      document.getElementById('word-box').innerText = wordList[currentWordIndex];
      currentWordIndex++;
      setTimeout(showNextWord, 2000); // 2 seconds per word
    } else {
      goToRecall();
    }
  }

  function goToRecall() {
    phase = 'recall';
    showScreen('recall-screen');
    document.getElementById('recall-input').focus();
  }

  function submitRecall() {
    if (phase !== 'recall') return;
    const userWords = document.getElementById('recall-input').value.toLowerCase()
      .split(/[^a-z]+/).filter(Boolean);
    const scores = wordList.map(word => userWords.includes(word.toLowerCase()) ? 1 : 0);
    trialResults.push({ words: wordList.slice(), scores });
    scores.forEach((score, index) => { recallScores[index] += score; });
    if (trialResults.length < sessionLists.length) {
      phase = 'between';
      document.getElementById('between-progress').textContent = 'Trial ' + trialResults.length + ' of ' + sessionLists.length + ' complete. Select Next Trial when you are ready.';
      showScreen('between-screen');
    } else {
      phase = 'results';
      renderGraph();
      showScreen('results-screen');
    }
  }

  function renderGraph() {
    const chart = document.getElementById('chart');
    chart.innerHTML = '';
    const completed = trialResults.length;
    const total = recallScores.reduce((sum, score) => sum + score, 0);
    document.getElementById('score-summary').textContent = 'Completed ' + completed + ' trial' + (completed === 1 ? '' : 's') + '. Recalled ' + total + ' of ' + (15 * completed) + ' words.';
    document.getElementById('scale-description').textContent = 'Vertical scale: number of trials recalled (0–' + completed + '). Horizontal scale: original list position (1–15).';
    const resultList = document.getElementById('result-list');
    resultList.innerHTML = '';
    recallScores.forEach((score, index) => {
      const item = document.createElement('li');
      item.textContent = 'Position ' + (index + 1) + ': recalled in ' + score + ' of ' + completed + ' trials (' + Math.round(score / completed * 100) + '%).';
      resultList.appendChild(item);
    });
    const trialDetails = document.getElementById('trial-details');
    trialDetails.innerHTML = '';
    trialResults.forEach((trial, index) => {
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = 'Trial ' + (index + 1) + ': ' + trial.scores.reduce((sum, score) => sum + score, 0) + ' of 15 recalled';
      details.appendChild(summary);
      const list = document.createElement('ol');
      trial.words.forEach((word, position) => {
        const item = document.createElement('li');
        item.textContent = word + ': ' + (trial.scores[position] ? 'Recalled' : 'Missed');
        list.appendChild(item);
      });
      details.appendChild(list);
      trialDetails.appendChild(details);
    });

    const ns = 'http://www.w3.org/2000/svg';
    function add(tag, attributes, text) {
      const node = document.createElementNS(ns, tag);
      Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
      if (text !== undefined) node.textContent = text;
      svg.appendChild(node);
      return node;
    }
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 560 300');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Recall by serial position across ' + completed + ' trials. Counts range from 0 to ' + completed + '. Position totals and word-by-word results are available below.');
    chart.appendChild(svg);
    add('title', {}, 'Recall by serial position');
    const left = 65, right = 540, top = 35, bottom = 225;
    const x = index => left + index * (right - left) / (wordList.length - 1);
    const y = score => bottom - score / completed * (bottom - top);
    Array.from({ length: completed + 1 }, (_, score) => score).forEach(score => {
      add('line', {x1: left, x2: right, y1: y(score), y2: y(score), stroke: '#cbd5e1', 'stroke-dasharray': '4 4'});
      add('text', {x: left - 14, y: y(score) + 5, 'text-anchor': 'end', fill: '#334155', 'font-size': 15}, score);
    });
    add('line', {x1: left, x2: left, y1: top - 12, y2: bottom, stroke: '#334155'});
    add('line', {x1: left, x2: right, y1: bottom, y2: bottom, stroke: '#334155'});
    add('text', {x: 18, y: 130, transform: 'rotate(-90 18 130)', 'text-anchor': 'middle', fill: '#334155', 'font-size': 14}, 'Trials recalled');
    add('text', {x: (left + right) / 2, y: 285, 'text-anchor': 'middle', fill: '#334155', 'font-size': 14}, 'Serial position');
    add('polyline', {points: recallScores.map((score, index) => x(index) + ',' + y(score)).join(' '), fill: 'none', stroke: '#2563eb', 'stroke-width': 3, 'stroke-linejoin': 'round'});
    recallScores.forEach((score, index) => {
      const dot = add('circle', {cx: x(index), cy: y(score), r: 5, fill: '#2563eb', stroke: '#fff', 'stroke-width': 1.5});
      const title = document.createElementNS(ns, 'title');
      title.textContent = 'Position ' + (index + 1) + ': recalled in ' + score + ' of ' + completed + ' trials';
      dot.appendChild(title);
      add('text', {x: x(index), y: bottom + 24, 'text-anchor': 'middle', fill: '#475569', 'font-size': 12}, index + 1);
    });
  }

  function resetExperiment() {
    if (phase !== 'results') return;
    phase = 'start';
    document.getElementById('recall-input').value = '';
    showScreen('start-screen');
  }
