// 获取元素
const imageInput = document.getElementById('imageInput');
const outputText = document.getElementById('outputText');

// 当选择图片时
imageInput.addEventListener('change', handleImageUpload);

function handleImageUpload(event) {
  const file = event.target.files[0];

  if (file) {
    if (file.size > 5 * 1024 * 1024) { // 限制文件大小为 5MB
      outputText.textContent = '图片文件过大，请上传小于 5MB 的图片！';
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        outputText.textContent = '正在提取文字，请稍候...';
        extractTextFromImage(img);
      };
      img.src = e.target.result; // 不插入 DOM
    };
    reader.readAsDataURL(file);
  }
}

function extractTextFromImage(image) {
  Tesseract.recognize(
    image,
    'chi_tra', // 设置语言为中文
    { logger: info => console.log(info) } // 日志输出，可选
  )
    .then(({ data: { text } }) => {
      outputText.textContent = '提取的文字：\n\n' + text;
    })
    .catch(error => {
      outputText.textContent = '提取失败，请重试！';
      console.error('发生错误：', error);
    });
}
