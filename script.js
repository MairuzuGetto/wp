document.addEventListener("DOMContentLoaded", () => {
    const imageInput = document.getElementById("imageInput");
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const detectButton = document.getElementById("detectButton");
    const output = document.getElementById("output");

    let img = new Image();

    // 载入图片
    imageInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // 图片加载完成后绘制到 canvas
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
    };

    // 检测数字
    detectButton.addEventListener("click", () => {
        // 获取 canvas 数据
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // 使用 OpenCV 预处理图像
        const src = cv.matFromImageData(imageData);
        const gray = new cv.Mat();
        const thresh = new cv.Mat();

        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
        cv.threshold(gray, thresh, 0, 255, cv.THRESH_BINARY | cv.THRESH_OTSU);

        // 将处理后的图像重新绘制到 canvas
        cv.imshow(canvas, thresh);

        // 将图像数据传递给 Tesseract.js
        const processedImageData = canvas.toDataURL("image/png");

        Tesseract.recognize(
            processedImageData,       // 图像数据
            'eng+chi_tra',                    // 语言
            {
                logger: (info) => console.log(info), // 可选：查看识别进度
            }
        ).then(({ data: { text } }) => {
            output.textContent = text; // 输出识别结果
        }).catch((error) => {
            console.error(error);
            output.textContent = "识别失败!";
        });

        // 清理内存
        src.delete();
        gray.delete();
        thresh.delete();
    });
});
