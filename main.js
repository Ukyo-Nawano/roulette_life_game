const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const controlButton = document.getElementById("controlButton");
const resultText = document.getElementById("resultText");

const sectors = 10;
const radius = canvas.width / 2;
const numbers = Array.from({ length: sectors }, (_, i) => i + 1);
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
        ctx.fillStyle = i % 2 === 0 ? "#ffcc00" : "#ff6600";
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#000";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const textAngle = (i + 0.5) * anglePerSector;
        const textX = Math.cos(textAngle) * radius * 0.7;
        const textY = Math.sin(textAngle) * radius * 0.7;
        ctx.fillText(numbers[i], textX, textY);
    }

    ctx.restore();

    // 矢印の描画
    drawArrow();
}

// 矢印を描画（上向き固定）
function drawArrow() {
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(radius - 10, 10);
    ctx.lineTo(radius + 10, 10);
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

    const winningNumber = numbers[(sectors - index) % sectors] - 1;
    resultText.textContent = `結果: ${winningNumber}`;
    controlButton.textContent = "次のプレイヤーへ";
    controlButton.onclick = reset;
}

// スタートボタンの処理
function startRoulette() {
    if (isSpinning) return;
    isSpinning = true;
    isStopping = false;
    speed = Math.random() * 0.2 + 0.2;
    controlButton.textContent = "ストップ";
    controlButton.onclick = stopRoulette;
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
}

// 初期描画
drawRoulette();
controlButton.onclick = startRoulette;
