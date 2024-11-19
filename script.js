// 获取元素
const imageInput = document.getElementById('imageInput');
const outputText = document.getElementById('outputText');

// 当选择图片时
imageInput.addEventListener('change', handleImageUpload);

function handleImageUpload(event) {
  const file = event.target.files[0];

  if (!file) {
    outputText.textContent = '未选择文件';
    return;
  }

  if (!file.type.startsWith('image/')) {
    alert('请上传图片文件');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.src = e.target.result;
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const scale = Math.min(1000 / img.width, 1000 / img.height); // 缩放至最大边不超过 1000px
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      extractTextFromImage(canvas);
    };
  };
  reader.readAsDataURL(file);
}

function extractTextFromImage(image) {
  outputText.textContent = '正在提取文字，请稍候...';

  Tesseract.recognize(
    image,
    'chi_tra', // 设置语言为中文
    { logger: info => console.log(info) } // 日志输出，可选
  ).then(({ data: { text } }) => {
    console.log(text);
    outputText.textContent = '提取的文字：\n\n' + text;
  }).catch(error => {
    console.error('发生错误：', error);
    outputText.textContent = '发生错误：无法提取文字。请检查图片内容。';
  });
}
