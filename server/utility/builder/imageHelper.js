import dotenv from "dotenv";

dotenv.config();

export function changeImageName(fileName, username) {
    return `${username}.${fileName.split(".").pop()}`;
}

export function createImageURL(imagePath) {
    if (imagePath == null || imagePath === "null" || imagePath === "") {
        return null;
    }

    return `http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/${imagePath}`;
}


