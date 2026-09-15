// src/utils/labelGenerator.ts
// High-resolution Canvas and Print Utility for Kalakriti Physical Authentication Labels

export interface LabelData {
  productId: string; // 7-character ID, e.g. K7B9X3Q
  productTitle?: string;
  qrCodeDataUrl: string;
  fingerprintImageDataUrl?: string;
  verificationUrl?: string;
}

/**
 * Draws the high-resolution (1600 x 800 px) Kalakriti Authentication Label on a Canvas
 * precisely matching the reference physical label design.
 */
export async function renderAuthenticationLabelCanvas(
  canvas: HTMLCanvasElement,
  data: LabelData
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = 1600;
  const height = 800;
  canvas.width = width;
  canvas.height = height;

  // 1. Base card background with rounded corners
  const radius = 48;
  const margin = 24;
  const cardW = width - margin * 2;
  const cardH = height - margin * 2;
  const cardX = margin;
  const cardY = margin;

  ctx.clearRect(0, 0, width, height);

  // Card Shadow (subtle)
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.10)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 8;

  // Background fill
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, radius);
  ctx.fillStyle = '#FAF7F2';
  ctx.fill();
  ctx.restore();

  // Outer border
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#D9CFBE';
  ctx.stroke();

  // 2. Left Side: Physical Fingerprint / Texture Framing Box
  const leftBoxX = cardX + 50;
  const leftBoxY = cardY + 55;
  const leftBoxW = 710;
  const leftBoxH = 540;

  // Load and draw fingerprint/texture image if available
  if (data.fingerprintImageDataUrl) {
    try {
      const fpImg = await loadImage(data.fingerprintImageDataUrl);
      ctx.save();
      // Clip to fingerprint inner area with slight inset
      const imgInset = 28;
      const imgX = leftBoxX + imgInset;
      const imgY = leftBoxY + imgInset;
      const imgW = leftBoxW - imgInset * 2;
      const imgH = leftBoxH - imgInset * 2 - 30;

      ctx.beginPath();
      ctx.rect(imgX, imgY, imgW, imgH);
      ctx.clip();

      // Draw the image filling the area
      ctx.drawImage(fpImg, imgX, imgY, imgW, imgH);
      ctx.restore();
    } catch (e) {
      console.warn('Could not render fingerprint image to canvas:', e);
      drawFallbackFingerprintPattern(ctx, leftBoxX + 28, leftBoxY + 28, leftBoxW - 56, leftBoxH - 86);
    }
  } else {
    drawFallbackFingerprintPattern(ctx, leftBoxX + 28, leftBoxY + 28, leftBoxW - 56, leftBoxH - 86);
  }

  // Draw Gold L-Corner Brackets around fingerprint
  const bracketSize = 56;
  const bracketThickness = 6;
  ctx.strokeStyle = '#B38B42'; // Antique gold
  ctx.lineWidth = bracketThickness;
  ctx.lineCap = 'square';

  // Top-Left bracket
  ctx.beginPath();
  ctx.moveTo(leftBoxX, leftBoxY + bracketSize);
  ctx.lineTo(leftBoxX, leftBoxY);
  ctx.lineTo(leftBoxX + bracketSize, leftBoxY);
  ctx.stroke();

  // Top-Right bracket
  ctx.beginPath();
  ctx.moveTo(leftBoxX + leftBoxW - bracketSize, leftBoxY);
  ctx.lineTo(leftBoxX + leftBoxW, leftBoxY);
  ctx.lineTo(leftBoxX + leftBoxW, leftBoxY + bracketSize);
  ctx.stroke();

  // Bottom-Left bracket
  ctx.beginPath();
  ctx.moveTo(leftBoxX, leftBoxY + leftBoxH - bracketSize);
  ctx.lineTo(leftBoxX, leftBoxY + leftBoxH);
  ctx.lineTo(leftBoxX + bracketSize, leftBoxY + leftBoxH);
  ctx.stroke();

  // Bottom-Right bracket
  ctx.beginPath();
  ctx.moveTo(leftBoxX + leftBoxW - bracketSize, leftBoxY + leftBoxH);
  ctx.lineTo(leftBoxX + leftBoxW, leftBoxY + leftBoxH);
  ctx.lineTo(leftBoxX + leftBoxW, leftBoxY + leftBoxH - bracketSize);
  ctx.stroke();

  // Caption under fingerprint: — SCAN QR TO START VERIFICATION —
  ctx.fillStyle = '#3E3C38';
  ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const captionY = leftBoxY + leftBoxH + 34;
  const captionText = 'SCAN QR TO START VERIFICATION';
  
  // Left and right accent lines flanking caption
  ctx.strokeStyle = '#B38B42';
  ctx.lineWidth = 2;
  const textWidth = ctx.measureText(captionText).width;
  const lineGap = 20;
  const lineLen = 60;

  // Left line
  ctx.beginPath();
  ctx.moveTo(leftBoxX + (leftBoxW / 2) - (textWidth / 2) - lineGap - lineLen, captionY);
  ctx.lineTo(leftBoxX + (leftBoxW / 2) - (textWidth / 2) - lineGap, captionY);
  ctx.stroke();

  // Text
  ctx.fillText(captionText, leftBoxX + leftBoxW / 2, captionY);

  // Right line
  ctx.beginPath();
  ctx.moveTo(leftBoxX + (leftBoxW / 2) + (textWidth / 2) + lineGap, captionY);
  ctx.lineTo(leftBoxX + (leftBoxW / 2) + (textWidth / 2) + lineGap + lineLen, captionY);
  ctx.stroke();

  // 3. Center Divider with Diamond Star
  const dividerX = cardX + 810;
  const dividerTop = cardY + 60;
  const dividerBottom = cardY + 610;
  const starY = (dividerTop + dividerBottom) / 2 - 20;

  ctx.strokeStyle = '#D9CFBE';
  ctx.lineWidth = 2;

  // Upper vertical line
  ctx.beginPath();
  ctx.moveTo(dividerX, dividerTop);
  ctx.lineTo(dividerX, starY - 24);
  ctx.stroke();

  // Lower vertical line
  ctx.beginPath();
  ctx.moveTo(dividerX, starY + 24);
  ctx.lineTo(dividerX, dividerBottom);
  ctx.stroke();

  // Golden 4-point Diamond Star in center
  drawDiamondStar(ctx, dividerX, starY, 18, '#B38B42');

  // 4. Right Side: Branding, QR, and Product ID
  const rightX = dividerX + 55;
  const rightW = cardW - (rightX - cardX) - 50;

  // Crest / Shield Icon with "K"
  const crestX = rightX + 45;
  const crestY = cardY + 95;
  drawShieldLogo(ctx, crestX, crestY, 65, 80);

  // Brand Name: KALAKRITI
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#1C1917';
  ctx.font = 'bold 54px "Playfair Display", Georgia, serif';
  ctx.fillText('KALAKRITI', crestX + 90, crestY + 12);

  // Subtitle: AUTHENTICITY (spaced)
  ctx.fillStyle = '#B38B42';
  ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
  drawSpacedText(ctx, 'AUTHENTICITY', crestX + 92, crestY + 54, 10);

  // Horizontal Accent Rule with Gold Node
  const ruleY = crestY + 105;
  const ruleStartX = rightX;
  const ruleEndX = rightX + rightW;

  ctx.strokeStyle = '#B38B42';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(ruleStartX, ruleY);
  ctx.lineTo(ruleEndX - 16, ruleY);
  ctx.stroke();

  // Golden circular node on right of rule
  ctx.fillStyle = '#B38B42';
  ctx.beginPath();
  ctx.arc(ruleEndX - 8, ruleY, 6, 0, Math.PI * 2);
  ctx.fill();

  // PRODUCT ID Label
  const pidLabelY = ruleY + 80;
  ctx.fillStyle = '#44403C';
  ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('PRODUCT ID:', rightX, pidLabelY);

  // 7-character Bold Product ID
  const pidValueY = pidLabelY + 52;
  ctx.fillStyle = '#1C1917';
  ctx.font = 'bold 46px "Playfair Display", Georgia, monospace';
  ctx.fillText(data.productId, rightX, pidValueY);

  // High-Resolution QR Code
  if (data.qrCodeDataUrl) {
    try {
      const qrImg = await loadImage(data.qrCodeDataUrl);
      const qrSize = 250;
      const qrX = rightX + rightW - qrSize;
      const qrY = pidLabelY - 50;

      // QR White backing plate with clean border
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 16);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#E5DDD0';
      ctx.stroke();

      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
    } catch (e) {
      console.warn('Could not draw QR code on canvas:', e);
    }
  }

  // 5. Bottom Banner: • KALAKRITI PHYSICAL AUTHENTICATION SYSTEM •
  const bannerY = cardY + cardH - 45;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#57534E';
  ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';

  const bottomText = 'KALAKRITI PHYSICAL AUTHENTICATION SYSTEM';
  ctx.fillText(bottomText, width / 2, bannerY);

  // Golden dots flanking bottom banner
  const bTextW = ctx.measureText(bottomText).width;
  ctx.fillStyle = '#B38B42';
  ctx.beginPath();
  ctx.arc((width / 2) - (bTextW / 2) - 30, bannerY, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc((width / 2) + (bTextW / 2) + 30, bannerY, 5, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Helper to draw heraldic shield with K monogram
 */
function drawShieldLogo(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number
) {
  ctx.save();
  ctx.translate(cx, cy);

  // Draw Shield Path
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.lineTo(w / 2, -h / 2);
  ctx.lineTo(w / 2, 0);
  ctx.bezierCurveTo(w / 2, h / 3, 0, h / 2, 0, h / 2);
  ctx.bezierCurveTo(0, h / 2, -w / 2, h / 3, -w / 2, 0);
  ctx.lineTo(-w / 2, -h / 2);
  ctx.closePath();

  ctx.lineWidth = 4;
  ctx.strokeStyle = '#B38B42';
  ctx.fillStyle = '#FAF7F2';
  ctx.fill();
  ctx.stroke();

  // "K" in center
  ctx.fillStyle = '#B38B42';
  ctx.font = 'bold 38px "Playfair Display", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('K', 0, 0);

  ctx.restore();
}

/**
 * Helper to draw a 4-point diamond star
 */
function drawDiamondStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.quadraticCurveTo(cx, cy, cx + r, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy + r);
  ctx.quadraticCurveTo(cx, cy, cx - r, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy - r);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Helper to draw spaced text
 */
function drawSpacedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number
) {
  let currentX = x;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    ctx.fillText(char, currentX, y);
    currentX += ctx.measureText(char).width + spacing;
  }
}

/**
 * Draws a high-detail procedural stippled microstructure pattern as fallback
 */
function drawFallbackFingerprintPattern(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.save();
  ctx.fillStyle = '#F2ECE1';
  ctx.fillRect(x, y, w, h);

  // Draw organic woodgrain/weave contours
  ctx.strokeStyle = 'rgba(60, 50, 40, 0.45)';
  ctx.lineWidth = 1.5;

  for (let i = 0; i < 28; i++) {
    ctx.beginPath();
    let currX = x;
    let currY = y + (h / 28) * i + Math.sin(i) * 10;
    ctx.moveTo(currX, currY);
    while (currX < x + w) {
      currX += 20;
      currY += Math.sin(currX * 0.04 + i) * 6;
      ctx.lineTo(currX, currY);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Downloads a canvas as a high-resolution PNG image
 */
export function downloadCanvasAsPng(canvas: HTMLCanvasElement, filename: string): void {
  const dataUrl = canvas.toDataURL('image/png', 1.0);
  const link = document.createElement('a');
  link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Downloads a QR data URL directly as PNG
 */
export function downloadQrDataUrl(qrDataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
  link.href = qrDataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Prints the label cleanly formatted in the browser
 */
export function printCanvasLabel(canvas: HTMLCanvasElement): void {
  const dataUrl = canvas.toDataURL('image/png', 1.0);
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Kalakriti Authentication Label</title>
        <style>
          @page {
            size: 4in 2in landscape;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: #FFFFFF;
          }
          img {
            width: 100%;
            max-width: 800px;
            height: auto;
            display: block;
            border-radius: 8px;
          }
        </style>
      </head>
      <body>
        <img src="${dataUrl}" onload="window.print(); window.close();" />
      </body>
    </html>
  `);
  printWindow.document.close();
}
