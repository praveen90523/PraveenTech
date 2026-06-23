import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${API_BASE_URL}/api/resumes`;

const authHeader = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
});

/**
 * Uploads a resume file with optional target role and job description.
 * @param {FormData} formData - Contains the file, targetRole, and targetDescription
 */
export const uploadResume = (formData) => {
    return axios.post(`${API_URL}/upload`, formData, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
        },
    });
};

/**
 * Fetches the resume analysis history of the current user.
 */
export const getResumeHistory = () => {
    return axios.get(`${API_URL}/history`, authHeader());
};

/**
 * Fetches a single resume analysis report.
 * @param {string} id - The resume analysis ID
 */
export const getResumeById = (id) => {
    return axios.get(`${API_URL}/${id}`, authHeader());
};

/**
 * Deletes a single resume analysis report.
 * @param {string} id - The resume analysis ID
 */
export const deleteResume = (id) => {
    return axios.delete(`${API_URL}/${id}`, authHeader());
};
