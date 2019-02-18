import axios from 'axios';

const BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '';
const BASE_API_URL = `${BASE_URL}/api`;

async function login(email, password) {
    const result = await axios.post(`${BASE_API_URL}/login`, { email, password });
    return result.data;
}

async function signup(email, password) {
    const result = await axios.post(`${BASE_API_URL}/signup`, { email, password });
    return result.data;
}

async function resetPassword(email, old, newPassword) {
    const result = await axios.post(`${BASE_API_URL}/password`, { email, old, new: newPassword });
    return result.data;
}

function getUploadLink() {
    let uploadPath = `${BASE_API_URL}/upload`
    if (process.env.NODE_ENV !== 'development') {
        uploadPath = `.${uploadPath}`
    }
    return uploadPath
}

function getOutputLink(imageSetId, imageID) {
    return `${BASE_URL}/output/${imageSetId}/${imageID}`;
}

async function processImage(email, buildings, trees, uploadImages) {
    const result = await axios.post(`${BASE_API_URL}/process`, { email, buildings, trees, uploadImages });
    return result.data;
}

async function saveData(email, treeVal, buildingVal, latitude, longitude, label, merge, description) {
    const trees = treeVal === 'NA' ? -1: treeVal;
    const buildings = buildingVal === 'NA' ? -1: buildingVal;
    const result = await axios.post(`${BASE_API_URL}/store`, { email, buildings, trees, latitude, longitude, label, merge, description });
    return result.data;
}

async function clean(imageSetId) {
    const result = await axios.post(`${BASE_API_URL}/clean`, { imageSetId });
    return result.data;
}

async function getList(email) {
    const result = await axios.post(`${BASE_API_URL}/list`, { email });
    return result.data.data;
}

export { login, signup, resetPassword, getUploadLink, processImage, getOutputLink, saveData, clean, getList };
