const mainImageInput = document.getElementById('mainImageInput');
const templateImageInput = document.getElementById('templateImageInput');
const matchButton = document.getElementById('matchButton');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const resultText = document.getElementById('result');

let mainImage, templateImage;

mainImageInput.addEventListener('change', (e) => loadImage(e, 'main'));
templateImageInput.addEventListener('change', (e) => loadImage(e, 'template'));

function loadImage(event, type) {
  const file = event.target.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = () => {
    if (type === 'main') {
      mainImage = img;
      canvas.width = mainImage.width;
      canvas.height = mainImage.height;
      ctx.drawImage(mainImage, 0, 0);
    } else if (type === 'template') {
      templateImage = img;
    }
  };
  img.src = URL.createObjectURL(file);
}

matchButton.addEventListener('click', () => {
  if (!mainImage || !templateImage) {
    resultText.textContent = '请先上传主图和模板图！';
    return;
  }

  const mainData = getImageData(mainImage);
  const templateData = getImageData(templateImage);

  const match = findTemplate(mainData, templateData);

  if (match) {
    const { x, y, width, height } = match;
    ctx.drawImage(mainImage, 0, 0); // 重绘主图
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    resultText.textContent = `模板匹配成功！位置：(${x}, ${y})`;
  } else {
    resultText.textContent = '未找到匹配区域。';
  }
});

function getImageData(image) {
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  tempCanvas.width = image.width;
  tempCanvas.height = image.height;
  tempCtx.drawImage(image, 0, 0);
  return tempCtx.getImageData(0, 0, image.width, image.height);
}

function findTemplate(mainData, templateData) {
  const { width: mainWidth, height: mainHeight, data: mainPixels } = mainData;
  const { width: templateWidth, height: templateHeight, data: templatePixels } = templateData;

  for (let y = 0; y <= mainHeight - templateHeight; y++) {
    for (let x = 0; x <= mainWidth - templateWidth; x++) {
      if (isMatch(mainPixels, mainWidth, x, y, templatePixels, templateWidth, templateHeight)) {
        return { x, y, width: templateWidth, height: templateHeight };
      }
    }
  }
  return null;
}

function isMatch(mainPixels, mainWidth, startX, startY, templatePixels, templateWidth, templateHeight) {
  for (let ty = 0; ty < templateHeight; ty++) {
    for (let tx = 0; tx < templateWidth; tx++) {
      const mainIndex = ((startY + ty) * mainWidth + (startX + tx)) * 4;
      const templateIndex = (ty * templateWidth + tx) * 4;

      for (let i = 0; i < 4; i++) { // 比较 RGBA 四个通道
        if (mainPixels[mainIndex + i] !== templatePixels[templateIndex + i]) {
          return false;
        }
      }
    }
  }
  return true;
}
