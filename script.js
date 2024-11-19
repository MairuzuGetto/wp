document.getElementById('imageUpload').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = async () => {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // 使用 Tesseract.js 進行文字識別
        const { data: { words } } = await Tesseract.recognize(img.src, 'chi_sim'); // 簡體中文
        console.log(words);

        // 查找目標文字的位置
        const targetWord = '台北市停車開單管理';
        let targetBox = null;

        words.forEach(word => {
            if (word.text.includes(targetWord)) {
                targetBox = word.bbox; // 獲取文字邊界框
            }
        });

        if (!targetBox) {
            alert('未找到目標文字！');
            return;
        }

        // 計算裁剪區域（基於目標文字位置調整）
        const { x0, y0, x1, y1 } = targetBox;
        const cropX = x0;
        const cropY = y1 + 10; // 偏移文字框的底部
        const cropWidth = x1 - x0;
        const cropHeight = 100; // 自定義裁剪高度

        // 裁剪圖片
        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = cropWidth;
        croppedCanvas.height = cropHeight;
        const croppedCtx = croppedCanvas.getContext('2d');
        croppedCtx.drawImage(canvas, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

        // 顯示裁剪結果
        const croppedImage = document.getElementById('resultImage');
        croppedImage.src = croppedCanvas.toDataURL();
    };
});
