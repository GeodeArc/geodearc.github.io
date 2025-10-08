// chatgpt aah (look i needed to do this quickly dont judge me)

(() => {
    const ASSET_BASE = '../assets/stroop/'; // image path base
    const TOTAL = 10; // number of questions per test

    // ----- UI elements -----
    const initialScreen = document.querySelector('.stroop-initial');
    const container = document.querySelector('.stroop-container');
    const startButtons = Array.from(document.querySelectorAll('.stroop-buttons button'));
    const score1El = document.querySelector('.score1');
    const score2El = document.querySelector('.score2');

    const testTitleEl = document.querySelector('.test-title');
    const testQuestionsEl = document.querySelector('.test-questions');
    const testTimeEl = document.querySelector('.test-time');
    const imgEl = document.querySelector('.stroop-img');
    const textEl = document.querySelector('.stroop-text');
    const countdownEl = document.querySelector('.stroop-initialcountdown');
    const nextBtn = document.querySelector('.stroop-next');

    // Hide container & next button initially
    container.style.display = 'none';
    nextBtn.style.display = 'none';

    // ----- State -----
    let running = false;
    let activeTest = null;
    let index = 0;
    let startTime = 0;
    let timerInterval = null;
    let countdownInterval = null;
    let keyHandler = null;
    let elapsedWhenStopped = 0;
    let questions = [];

    // ----- Helpers -----
    const directions = [
        { text: 'LEFT', img: 'arrow-l.png' },
        { text: 'RIGHT', img: 'arrow-r.png' },
        { text: 'UP', img: 'arrow-u.png' },
        { text: 'DOWN', img: 'arrow-d.png' }
    ];

    function formatTimeMs(ms) {
        return (ms / 1000).toFixed(2) + ' s';
    }

    function updateLiveTimer() {
        if (!running) return;
        const now = performance.now();
        const elapsed = now - startTime;
        testTimeEl.textContent = formatTimeMs(elapsed);
    }

    function shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function generateQuestions(testNum) {
        let q = [];
        if (testNum === 1) {
            // Matching text+arrow
            for (let i = 0; i < TOTAL; i++) {
                const dir = directions[Math.floor(Math.random() * directions.length)];
                q.push({ text: dir.text, img: dir.img });
            }
        } else {
            // Non-matching text+arrow
            for (let i = 0; i < TOTAL; i++) {
                const textDir = directions[Math.floor(Math.random() * directions.length)];
                let arrowDir;
                do {
                    arrowDir = directions[Math.floor(Math.random() * directions.length)];
                } while (arrowDir.text === textDir.text); // ensure mismatch
                q.push({ text: textDir.text, img: arrowDir.img });
            }
        }
        return shuffleArray(q);
    }

    // ----- Present a question -----
    function presentQuestion() {
        const q = questions[index];
        imgEl.src = ASSET_BASE + q.img;
        imgEl.alt = q.text + ' (arrow)';
        textEl.textContent = q.text;
        testQuestionsEl.textContent = `Question ${index + 1} of ${TOTAL}`;
        updateLiveTimer();
    }

    // ----- Advance question (shared by space + button) -----
    function advanceQuestion() {
        if (!running) return;
        index += 1;
        if (index >= TOTAL) {
            finishTest();
        } else {
            presentQuestion();
        }
    }

    // ----- Start countdown then test -----
    function startCountdownAndTest(testNum) {
        if (running) return;
        running = true;
        activeTest = testNum;
        index = 0;
        elapsedWhenStopped = 0;
        questions = generateQuestions(testNum);

        // prepare UI
        initialScreen.style.display = 'none';
        container.style.display = 'block';
        testTitleEl.textContent = `Test ${activeTest}`;
        testTimeEl.textContent = '0.00 s';

        // Clear before countdown
        imgEl.src = '';
        textEl.textContent = '';
        countdownEl.textContent = '';

        // Hide during countdown
        textEl.style.display = 'none';
        imgEl.style.display = 'none';
        nextBtn.style.display = 'none';

        // 3-second countdown
        let countdown = 3;
        countdownEl.textContent = countdown;
        countdownInterval = setInterval(() => {
            countdown -= 1;
            if (countdown > 0) {
                countdownEl.textContent = countdown;
            } else {
                clearInterval(countdownInterval);
                countdownEl.textContent = '';

                // Restore visibility
                textEl.style.display = '';
                imgEl.style.display = '';
                nextBtn.style.display = 'inline-block';

                beginTestRun();
            }
        }, 1000);
    }

    // ----- Begin the test run -----
    function beginTestRun() {
        startTime = performance.now();
        timerInterval = setInterval(updateLiveTimer, 50);

        presentQuestion();

        keyHandler = function (ev) {
            if (ev.code === 'Space') {
                ev.preventDefault(); // stop page scrolling
                advanceQuestion();
            }
        };
        window.addEventListener('keydown', keyHandler);

        nextBtn.addEventListener('click', advanceQuestion);
    }

    // ----- Finish test -----
    function finishTest() {
        const endTime = performance.now();
        elapsedWhenStopped = endTime - startTime;
        running = false;

        if (timerInterval) clearInterval(timerInterval);
        if (countdownInterval) clearInterval(countdownInterval);
        if (keyHandler) {
            window.removeEventListener('keydown', keyHandler);
            keyHandler = null;
        }

        nextBtn.style.display = 'none';
        nextBtn.removeEventListener('click', advanceQuestion);

        const formatted = formatTimeMs(elapsedWhenStopped);
        if (activeTest === 1) {
            score1El.textContent = formatted;
        } else if (activeTest === 2) {
            score2El.textContent = formatted;
        }

        container.style.display = 'none';
        initialScreen.style.display = 'flex';

        testTitleEl.textContent = '';
        testQuestionsEl.textContent = '';
        testTimeEl.textContent = '';
        imgEl.src = '';
        textEl.textContent = '';
        countdownEl.textContent = '';
        activeTest = null;
    }


    // ----- Wire up buttons -----
    if (startButtons.length >= 2) {
        startButtons[0].addEventListener('click', () => startCountdownAndTest(1));
        startButtons[1].addEventListener('click', () => startCountdownAndTest(2));
    } else {
        console.warn('Stroop: expected two .stroop-buttons button elements.');
    }

    // Optional: preload images
    (function preload() {
        const imgs = directions.map(d => ASSET_BASE + d.img);
        imgs.forEach(src => {
            const im = new Image();
            im.src = src;
        });
    })();
})();