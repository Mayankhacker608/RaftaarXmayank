export function toStoredFile(file) {
  if (!file) {
    return null;
  }

  return {
    filename: file.originalname,
    originalname: file.originalname,
    mimetype: file.mimetype,
    path: `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
  };
}
