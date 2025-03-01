const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const controlButton = document.getElementById("controlButton");
const resultText = document.getElementById("resultText");

const sectors = 10;
const radius = canvas.width / 2;
const numbers = Array.from({ length: sectors }, (_, i) => i + 1);
const colors = ["#ffed67", "#fecd67", "#ef4649", "#fc78a5", "#aa5590", "#5a5490", "#4e80c9", "#50ccf1", "#4fad52", "#b0dd42"];
let angle = 0;
let speed = 0;
let isSpinning = false;
let isStopping = false;
let stopTimeout = null;

function drawRoulette() {
    const anglePerSector = (2 * Math.PI) / sectors;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(angle);

    for (let i = 0; i < sectors; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, i * anglePerSector, (i + 1) * anglePerSector);
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // テキストの位置と向きを調整
        const textAngle = (i + 0.5) * anglePerSector;
        const textX = Math.cos(textAngle) * radius * 0.8;
        const textY = Math.sin(textAngle) * radius * 0.8;
        ctx.save();
        ctx.translate(textX, textY);
        ctx.rotate(textAngle + Math.PI / 2);
        ctx.fillText(numbers[i], 0, 0);
        ctx.restore();
    }

    ctx.restore();

    // 矢印を描画（ルーレットの回転に影響されないように固定）
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(radius - 10, -10);
    ctx.lineTo(radius + 10, -10);
    ctx.lineTo(radius, 30);
    ctx.closePath();
    ctx.fill();
}


// ルーレット回転処理
function spin() {
    if (!isSpinning) return;
    angle += speed;

    if (isStopping) {
        speed *= 0.98; // ストップボタン押下後に減速
        if (speed < 0.002) {
            speed = 0;
            isSpinning = false;
            isStopping = false;
            clearTimeout(stopTimeout);
            determineResult(); // 矢印の指す結果を取得
            return;
        }
    }

    drawRoulette();
    requestAnimationFrame(spin);
}


// 矢印が指す数字を計算
function determineResult() {
    const anglePerSector = (2 * Math.PI) / sectors;

    // 角度を 0 〜 2π の範囲に正規化
    const adjustedAngle = (angle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);

    // 上方向が指すセクターを計算
    const index = Math.floor(((adjustedAngle - Math.PI / 2 +  Math.PI ) % (2 * Math.PI)) / anglePerSector);

    let winningNumber = numbers[(sectors - index) % sectors] - 1;
    // 10を指すときは10と表示
    if (winningNumber === 0) {
        winningNumber = 10;
    }
    resultText.textContent = `結果: ${winningNumber}`;
    controlButton.textContent = "次のプレイヤーへ";
    controlButton.onclick = reset;
    controlButton.style.backgroundColor = "#F39C12";
    controlButton.onmouseenter = () => controlButton.style.backgroundColor = "#D68910";
    controlButton.onmouseleave = () => controlButton.style.backgroundColor = "#F39C12";

    blinkWinningSector(winningNumber);
}

function blinkWinningSector(winningIndex) {
    let count = 0;
    const correctedIndex = (winningIndex - 1 + sectors) % sectors;
    const originalColor = colors[correctedIndex];
    const blinkColors = ["#fdf1a3", "#fbe1b0", "#f5a1a4", "#f9c2d5", "#d3a6c3", "#a79bca", "#8ab2e0", "#a3e1f3", "#94d4a1", "#d4e68b"

    ];

    const blinkColor = blinkColors[correctedIndex];

    const blinkInterval = setInterval(() => {
        colors[correctedIndex] = count % 2 === 0 ? blinkColor : originalColor;
        drawRoulette();
        count++;

        if (count >= 4) {
            clearInterval(blinkInterval);
            colors[correctedIndex] = originalColor;
            drawRoulette();
        }
    }, 500);
}

// スタートボタンの処理
function startRoulette() {
    if (isSpinning) return;
    isSpinning = true;
    isStopping = false;
    speed = Math.random() * 0.4 + 0.3;
    controlButton.textContent = "ストップ";
    controlButton.onclick = stopRoulette;

    controlButton.style.backgroundColor = "#DA5A56";
    controlButton.style.color = "white";
    controlButton.style.borderRadius = "8px";
    controlButton.onmouseenter = () => controlButton.style.backgroundColor = "#B34743";
    controlButton.onmouseleave = () => controlButton.style.backgroundColor = "#DA5A56";
    spin();
}

// ストップボタンの処理
function stopRoulette() {
    if (!isSpinning || isStopping) return;
    isStopping = true;
    stopTimeout = setTimeout(() => {
        speed = 0;
    }, 4000);
}

// 次のプレイヤーへボタンの処理
function reset() {
    controlButton.textContent = "スタート";
    controlButton.onclick = startRoulette;
    resultText.textContent = "結果: ";

    controlButton.style.backgroundColor = "#0957D0";
    controlButton.onmouseenter = () => controlButton.style.backgroundColor = "#0747A0";
    controlButton.onmouseleave = () => controlButton.style.backgroundColor = "#0957D0";
}

// 初期描画
drawRoulette();
controlButton.onclick = startRoulette;
