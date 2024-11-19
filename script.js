// 获取元素
const imageInput = document.getElementById('imageInput');
const outputText = document.getElementById('outputText');

// 当选择图片时
imageInput.addEventListener('change', handleImageUpload);

function handleImageUpload(event) {
  const file = event.target.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.src = e.target.result;
      img.onload = function() {
        extractTextFromImage(img);
      };
    };
    reader.readAsDataURL(file);
  }
}

function extractTextFromImage(image) {
  Tesseract.recognize(
    image,
    'chi_sim', // 设置语言为中文
    { logger: info => console.log(info) } // 日志输出，可选
  ).then(({ data: { text } }) => {
    console.log(text);
    outputText.textContent = '提取的文字：\n\n' + text;
  }).catch(error => {
    console.error('发生错误：', error);
  });
}
