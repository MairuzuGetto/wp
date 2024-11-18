document.getElementById("imageUpload").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function () {
            const img = new Image();
            img.src = reader.result;
            img.onload = function () {
                processImage(img);
            };
        };
        reader.readAsDataURL(file);
    }
});

function processImage(image) {
    const output = document.getElementById("output");
    output.textContent = "正在识别中，请稍候...";

    // 使用 Tesseract.js 识别文字
    Tesseract.recognize(image.src, 'chi_sim', {
        logger: (info) => console.log(info), // 可选：查看 OCR 过程日志
    })
        .then(({ data: { text } }) => {
            console.log("识别的文字：", text);
            // 使用正则表达式提取三组数字
            const numbers = text.match(/\d+/g);
            if (numbers && numbers.length >= 3) {
                output.textContent = `提取的数字：${numbers.slice(0, 3).join(', ')}`;
            } else {
                output.textContent = "未能提取到三组数字，请检查图片清晰度。";
            }
        })
        .catch((err) => {
            console.error(err);
            output.textContent = "识别失败，请重试。";
        });
}
