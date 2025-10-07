(() => {
    // ----- Test data (non-random, in given order) -----
    const tests = {
        1: {
            texts: ['LEFT','RIGHT','UP','RIGHT','DOWN','RIGHT','LEFT','UP','LEFT','RIGHT'],
            images: ['arrow-l.png','arrow-r.png','arrow-u.png','arrow-r.png','arrow-d.png','arrow-r.png','arrow-l.png','arrow-u.png','arrow-l.png','arrow-r.png']
        },
        2: {
            texts: ['LEFT','UP','RIGHT','DOWN','UP','LEFT','UP','RIGHT','DOWN','LEFT'],
            images: ['arrow-r.png','arrow-r.png','arrow-d.png','arrow-l.png','arrow-d.png','arrow-u.png','arrow-l.png','arrow-d.png','arrow-r.png','arrow-u.png']
        }
    };

    const ASSET_BASE = '../assets/stroop/'; // image path base
    const TOTAL = 10;

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
    const statusEl = document.querySelector('.test-status');

    // Ensure container hidden initially
    container.style.display = 'none';

    // ----- State -----
    let running = false;
    let activeTest = null; // 1 or 2
    let index = 0;
    let startTime = 0;
    let timerInterval = null;
    let countdownInterval = null;
    let keyHandler = null;
    let elapsedWhenStopped = 0;

    // ----- Helpers -----
    function imageDirectionFromFilename(filename) {
        if (filename.includes('-l')) return 'ArrowLeft';
        if (filename.includes('-r')) return 'ArrowRight';
        if (filename.includes('-u')) return 'ArrowUp';
        if (filename.includes('-d')) return 'ArrowDown';
        return null;
    }

    function formatTimeMs(ms) {
        return (ms / 1000).toFixed(2) + ' s';
    }

    function updateLiveTimer() {
        if (!running) return;
        const now = performance.now();
        const elapsed = now - startTime;
        testTimeEl.textContent = formatTimeMs(elapsed);
    }

    // ----- Present a question -----
    function presentQuestion() {
        statusEl.textContent = ''; // clear status
        const test = tests[activeTest];
        const txt = test.texts[index];
        const img = test.images[index];

        imgEl.src = ASSET_BASE + img;
        imgEl.alt = txt + ' (arrow)';
        textEl.textContent = txt;
        testQuestionsEl.textContent = `Question ${index + 1} of ${TOTAL}`;
        // update the live timer immediately so it shows 0.00 right after start
        updateLiveTimer();
    }

    // ----- Start countdown then test -----
    function startCountdownAndTest(testNum) {
        if (running) return;
        running = true;
        activeTest = testNum;
        index = 0;
        elapsedWhenStopped = 0;

        // prepare UI
        initialScreen.style.display = 'none';
        container.style.display = 'block';
        testTitleEl.textContent = `Test ${activeTest}`;
        testTimeEl.textContent = '0.00 s';
        statusEl.textContent = '';

        // Always clear everything before countdown starts
        imgEl.src = '';
        textEl.textContent = '';
        countdownEl.textContent = '';

        // 3-second countdown
        let countdown = 3;
        countdownEl.textContent = countdown;

        // Ensure text/arrow are hidden during countdown
        textEl.style.display = 'none';
        imgEl.style.display = 'none';

        countdownInterval = setInterval(() => {
            countdown -= 1;
            if (countdown > 0) {
                countdownEl.textContent = countdown;
            } else {
                clearInterval(countdownInterval);
                countdownEl.textContent = '';

                // Restore visibility for test run
                textEl.style.display = '';
                imgEl.style.display = '';

                beginTestRun();
            }
        }, 1000);
    }



    // ----- Begin the test run: start stopwatch and attach key listener -----
    function beginTestRun() {
        // start stopwatch
        startTime = performance.now();
        timerInterval = setInterval(updateLiveTimer, 50);

        // show first question
        presentQuestion();

        // key handler
        keyHandler = function (ev) {
            // only Arrow keys are relevant
            if (!ev || !ev.key || !ev.key.startsWith('Arrow')) return;

            const test = tests[activeTest];
            const correct = imageDirectionFromFilename(test.images[index]);

            if (ev.key === correct) {
            // correct -> move to next question
            index += 1;
            if (index >= TOTAL) {
                finishTest();
            } else {
                presentQuestion();
            }
            } else {
            // incorrect -> do NOT advance, show status
            statusEl.textContent = 'Incorrect — try again';
            }
        };

        window.addEventListener('keydown', keyHandler);
    }

    // ----- Finish test -----
    function finishTest() {
        // stop timers and key listener
        const endTime = performance.now();
        elapsedWhenStopped = endTime - startTime;
        running = false;

        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }

        if (keyHandler) {
            window.removeEventListener('keydown', keyHandler);
            keyHandler = null;
        }

        // update the corresponding score element on initial screen
        const formatted = formatTimeMs(elapsedWhenStopped);
        if (activeTest === 1) {
            score1El.textContent = formatted;
        } else if (activeTest === 2) {
            score2El.textContent = formatted;
        }

        // Reset UI: show initial and hide container
        container.style.display = 'none';
        initialScreen.style.display = 'flex';

        // clear values in container for next run
        testTitleEl.textContent = '';
        testQuestionsEl.textContent = '';
        testTimeEl.textContent = '';
        imgEl.src = '';
        textEl.textContent = '';
        countdownEl.textContent = '';
        statusEl.textContent = '';
        activeTest = null;
    }

    // ----- Wire up buttons -----
    // Expect two buttons: first = Test 1, second = Test 2
    if (startButtons.length >= 2) {
        startButtons[0].addEventListener('click', () => startCountdownAndTest(1));
        startButtons[1].addEventListener('click', () => startCountdownAndTest(2));
        } else {
        console.warn('Stroop: expected two .stroop-buttons button elements.');
    }

    // Optional: preload images so they appear promptly
    (function preload() {
        const imgs = new Set();
        Object.values(tests).forEach(t => t.images.forEach(i => imgs.add(ASSET_BASE + i)));
        imgs.forEach(src => {
            const im = new Image();
            im.src = src;
        });
    })();
})();