let counter = 0;

function generateUniqueId() {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 1e6);
  const randomStr = Math.random().toString(36).substring(2, 8);
  counter += 1;

  const rawId = `${timestamp}-${randomNum}-${randomStr}-${counter}`;

  const encodedId = btoa(rawId);

  return encodedId;
}

export default generateUniqueId;