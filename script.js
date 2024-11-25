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
        const contours = new cv.MatVector();
        const hierarchy = new cv.Mat();

        // 灰度化
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

        // 二值化
        cv.threshold(gray, thresh, 0, 255, cv.THRESH_BINARY | cv.THRESH_OTSU);

        // 检测轮廓
        cv.findContours(thresh, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

        // 遍历轮廓，提取数字区域
        let rois = [];
        for (let i = 0; i < contours.size(); i++) {
            const rect = cv.boundingRect(contours.get(i));
            if (rect.width > 10 && rect.height > 10) { // 忽略太小的噪点
                rois.push(rect);
            }
        }

        // 排序轮廓（从左到右，或其他逻辑）
        rois.sort((a, b) => a.x - b.x);

        // 在画布上绘制数字区域框（调试用）
        rois.forEach(rect => {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
        });

        // 处理每个数字区域
        let recognizedText = "";
        let promises = rois.map(rect => {
            const roi = new cv.Mat();
            const roiCanvas = document.createElement("canvas");
            roiCanvas.width = rect.width;
            roiCanvas.height = rect.height;

            // 提取感兴趣区域 (ROI)
            cv.getRectSubPix(thresh, new cv.Size(rect.width, rect.height), 
                             new cv.Point(rect.x + rect.width / 2, rect.y + rect.height / 2), roi);

            // 将 ROI 转换为 Base64 图片数据
            cv.imshow(roiCanvas, roi);
            const roiDataURL = roiCanvas.toDataURL("image/png");

            // 使用 Tesseract.js 识别每个区域
            return Tesseract.recognize(roiDataURL, 'eng', {
                logger: info => console.log(info)
            }).then(({ data: { text } }) => {
                recognizedText += text + " ";
            }).finally(() => {
                roi.delete();
            });
        });

        // 等待所有区域识别完成
        Promise.all(promises).then(() => {
            output.textContent = recognizedText.trim();
        }).catch(err => {
            console.error(err);
            output.textContent = "识别失败!";
        }).finally(() => {
            // 清理内存
            src.delete();
            gray.delete();
            thresh.delete();
            contours.delete();
            hierarchy.delete();
        });
    });
});
