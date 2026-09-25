import axios from "axios";

const API = axios.create({
    baseURL: "http://127.0.0.1:4000/api"
});

export const getDocuments = () => {
    return API.get("/documents");
};

export const uploadDocument = (file) => {

    const formData = new FormData();

    formData.append("file", file);

    return API.post("/documents", formData);
};

export const downloadDocument = (id) => {

    window.open(
        `http://127.0.0.1:4000/api/documents/${id}/download`,
        "_blank"
    );
};

export const deleteDocument = (id) => {
    return API.delete(`/documents/${id}`);
};

export const askQuestion = (question) => {

    return API.post("/chat", {
        question: question
    });
};