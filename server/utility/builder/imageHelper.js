export function changeImageName(fileName, username) {
    return `${username}.${fileName.split(".").pop()}`;
}

export function createImageURL(imagePath) {
    if (imagePath == null || imagePath === "null" || imagePath === "") {
        return null;
    }

    return `${process.env.CLIENT_URL}/${imagePath}`;
}


