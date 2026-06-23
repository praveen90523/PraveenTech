import axios from "axios";

const API_URL = "http://localhost:5000/api/interviews";

const authHeader = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
});

export const createInterview = (data) =>
    axios.post(`${API_URL}/create`, data, authHeader());

export const getInterviews = () =>
    axios.get(API_URL, authHeader());

export const getInterviewById = (id) =>
    axios.get(`${API_URL}/${id}`, authHeader());

export const submitAnswer = (id, data) =>
    axios.post(
        `${API_URL}/${id}/answer`,
        data,
        authHeader()
    );

export const completeInterview = (id) =>
    axios.post(
        `${API_URL}/${id}/complete`,
        {},
        authHeader()
    );