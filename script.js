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

  function startExperiment() {
    // Select one of the five lists independently for every attempt.
    wordList = wordLists[Math.floor(Math.random() * wordLists.length)].slice();
    recallScores = new Array(wordList.length).fill(0);
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('display-screen').classList.remove('hidden');
    currentWordIndex = 0;
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
    document.getElementById('display-screen').classList.add('hidden');
    document.getElementById('recall-screen').classList.remove('hidden');
    document.getElementById('recall-input').focus();
  }

  function submitRecall() {
    const userInput = document.getElementById('recall-input').value.toLowerCase();
    
    // Normalize user words using a regex split to catch spaces, commas, and newlines
    const userWords = userInput.split(/[^a-z]+/).map(w => w.trim()).filter(w => w.length > 0);

    // Reset scores
    recallScores.fill(0);

    // Check matches against the original list positions
    wordList.forEach((word, index) => {
      if (userWords.includes(word.toLowerCase())) {
        recallScores[index] = 1; // Binary recall outcome for this position
      }
    });

    renderGraph();

    document.getElementById('recall-screen').classList.add('hidden');
    document.getElementById('results-screen').classList.remove('hidden');
  }

  function renderGraph() {
    const chart = document.getElementById('chart');
    chart.innerHTML = '';
    const total = recallScores.filter(score => score > 0).length;
    document.getElementById('score-summary').textContent = 'Recalled ' + total + ' of ' + wordList.length + ' words.';
    const resultList = document.getElementById('result-list');
    resultList.innerHTML = '';
    wordList.forEach((word, index) => {
      const item = document.createElement('li');
      item.textContent = word + ': ' + (recallScores[index] ? 'Recalled' : 'Missed');
      resultList.appendChild(item);
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
    svg.setAttribute('aria-label', 'Recall by serial position. 1 means recalled; 0 means not recalled. Word-by-word results are available below.');
    chart.appendChild(svg);
    add('title', {}, 'Recall by serial position');
    const left = 65, right = 540, top = 35, bottom = 225;
    const x = index => left + index * (right - left) / (wordList.length - 1);
    const y = score => score === 1 ? top : bottom;
    [0, 1].forEach(score => {
      add('line', {x1: left, x2: right, y1: y(score), y2: y(score), stroke: '#cbd5e1', 'stroke-dasharray': '4 4'});
      add('text', {x: left - 14, y: y(score) + 5, 'text-anchor': 'end', fill: '#334155', 'font-size': 15}, score);
    });
    add('line', {x1: left, x2: left, y1: top - 12, y2: bottom, stroke: '#334155'});
    add('line', {x1: left, x2: right, y1: bottom, y2: bottom, stroke: '#334155'});
    add('text', {x: 18, y: 130, transform: 'rotate(-90 18 130)', 'text-anchor': 'middle', fill: '#334155', 'font-size': 14}, 'Recall (0 or 1)');
    add('text', {x: (left + right) / 2, y: 285, 'text-anchor': 'middle', fill: '#334155', 'font-size': 14}, 'Serial position');
    add('polyline', {points: recallScores.map((score, index) => x(index) + ',' + y(score)).join(' '), fill: 'none', stroke: '#2563eb', 'stroke-width': 3, 'stroke-linejoin': 'round'});
    recallScores.forEach((score, index) => {
      const dot = add('circle', {cx: x(index), cy: y(score), r: 5, fill: '#2563eb', stroke: '#fff', 'stroke-width': 1.5});
      const title = document.createElementNS(ns, 'title');
      title.textContent = 'Position ' + (index + 1) + ': ' + wordList[index] + ' — ' + (score ? 'recalled (1)' : 'not recalled (0)');
      dot.appendChild(title);
      add('text', {x: x(index), y: bottom + 24, 'text-anchor': 'middle', fill: '#475569', 'font-size': 12}, index + 1);
    });
  }

  function resetExperiment() {
    document.getElementById('recall-input').value = '';
    document.getElementById('results-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
  }
