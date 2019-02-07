import axios from 'axios';

const BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:5000/api' : '/api';

async function login(email, password) {
    const result = await axios.post(`${BASE_URL}/login`, { email, password });
    return result.data;
}

async function signup(email, password) {
    const result = await axios.post(`${BASE_URL}/signup`, { email, password });
    return result.data;
}

async function resetPassword(email, old, newPassword) {
    const result = await axios.post(`${BASE_URL}/password`, { email, old, new: newPassword });
    return result.data;
}

function getUploadLink() {
    let uploadPath = `${BASE_URL}/upload`
    if (process.env.NODE_ENV !== 'development') {
        uploadPath = `.${uploadPath}`
    }
    return uploadPath
}

async function processImage(email, buildings, trees, uploadImages) {
    const result = await axios.post(`${BASE_URL}/process`, { email, buildings, trees, uploadImages });
    return result.data;
}

export { login, signup, resetPassword, getUploadLink, processImage };
