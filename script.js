document.getElementById("upload").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function () {
            const image = new Image();
            image.src = reader.result;
            image.onload = function () {
                extractText(image);
            };
        };
        reader.readAsDataURL(file);
    }
});

function extractText(image) {
    const output = document.getElementById("output");
    output.textContent = "正在识别中，请稍候...";
    
    // 使用 Tesseract.js 进行 OCR
    Tesseract.recognize(image.src, 'eng', {
        logger: (info) => console.log(info), // 可选：输出日志
    })
        .then(({ data: { text } }) => {
            // 使用正则表达式提取三组数字
            const numbers = text.match(/\d+/g);
            if (numbers && numbers.length >= 3) {
                output.textContent = `提取到的数字：${numbers.slice(0, 3).join(', ')}`;
            } else {
                output.textContent = "未能提取到足够的数字，请尝试上传其他图片。";
            }
        })
        .catch((err) => {
            console.error(err);
            output.textContent = "发生错误，请重试。";
        });
}
