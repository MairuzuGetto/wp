document.getElementById('imageUpload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function() {
                processImage(img);
            };
        };
        reader.readAsDataURL(file);
    }
});

function processImage(img) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    // 设置画布尺寸
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    // 裁剪图片的特定区域 (手动设置区域坐标)
    const cropX = 200; // 调整为数字区域的 X 起始位置
    const cropY = 600; // 调整为数字区域的 Y 起始位置
    const cropWidth = 500; // 裁剪区域宽度
    const cropHeight = 300; // 裁剪区域高度

    const croppedImage = ctx.getImageData(cropX, cropY, cropWidth, cropHeight);

    // 创建裁剪后的图片
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;
    const croppedCtx = croppedCanvas.getContext('2d');
    croppedCtx.putImageData(croppedImage, 0, 0);

    // 使用 OCR 提取文字
    Tesseract.recognize(croppedCanvas.toDataURL(), 'chi_sim', {
        logger: (info) => console.log(info) // 可选：查看 OCR 进度
    }).then(({ data: { text } }) => {
        console.log("提取的文字：", text);

        // 提取三组数字
        const numbers = text.match(/\d+/g);
        const formattedText = [
            "台北市停車開單管理",
            `新單數: ${numbers && numbers[0] ? numbers[0] : 'N/A'}`,
            `上傳市府點數: ${numbers && numbers[1] ? numbers[1] : 'N/A'}`,
            `勞務費點數: ${numbers && numbers[2] ? numbers[2] : 'N/A'}`
        ];

        // 生成新图片
        createOutputImage(formattedText);
    }).catch(err => {
        console.error(err);
        document.getElementById('output').textContent = "OCR 提取失敗，請重試！";
    });
}

function createOutputImage(textLines) {
    const outputCanvas = document.createElement('canvas');
    const ctx = outputCanvas.getContext('2d');

    // 设置输出图片尺寸
    outputCanvas.width = 800;
    outputCanvas.height = 400;

    // 绘制背景
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);

    // 绘制文字
    ctx.fillStyle = "black";
    ctx.font = "24px Arial";
    let y = 50;
    textLines.forEach(line => {
        ctx.fillText(line, 50, y);
        y += 50;
    });

    // 显示生成的图片
    const outputImage = document.getElementById('outputImage');
    outputImage.src = outputCanvas.toDataURL();
}
