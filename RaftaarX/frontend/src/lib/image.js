function canvasToBlob(canvas, quality) {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", quality);
  });
}

export function compressImage(
  file,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.7,
  targetBytes = 350 * 1024
) {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith("image/")) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions keeping aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const qualitySteps = [quality, 0.66, 0.58, 0.5, 0.42];

        (async () => {
          let bestBlob = null;

          for (const stepQuality of qualitySteps) {
            const blob = await canvasToBlob(canvas, stepQuality);

            if (!blob) {
              continue;
            }

            bestBlob = blob;

            if (blob.size <= targetBytes) {
              break;
            }
          }

          if (!bestBlob || (bestBlob.size >= file.size && file.size <= targetBytes)) {
            resolve(file);
            return;
          }

          const compressedFile = new File(
            [bestBlob],
            file.name.replace(/\.[^/.]+$/, "") + ".jpg",
            {
              type: "image/jpeg",
              lastModified: Date.now(),
            }
          );
          resolve(compressedFile);
        })();
      };
      img.onerror = () => resolve(file);
      img.src = event.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
