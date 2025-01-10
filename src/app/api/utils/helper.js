// src/utils/jwtHelper.js
import axios from 'axios';
import FormData from 'form-data';

const API_KEY = process.env.DROPBOX_SIGN_API_KEY;
const DROPBOX_SIGN_API_URL = 'https://api.hellosign.com/v3';

export async function createSignatureRequest({ participants, base64Content }) {
    try {
        const payload = new FormData();
        payload.append('title', 'Please sign this agreement');
        payload.append('subject', 'Agreement Signing Request');
        payload.append('message', 'Please sign this document to proceed.');
        payload.append('test_mode', '1');

        participants.forEach((participant, index) => {
            payload.append(`signers[${index}][email_address]`, participant.email);
            payload.append(`signers[${index}][name]`, participant.name);
            payload.append(`signers[${index}][order]`, index + 1);
        });

        // Decode the base64 content and append as a file
        const fileBuffer = Buffer.from(base64Content, 'base64');
        payload.append('file[0]', fileBuffer, 'document.pdf');

        const headers = {
            Authorization: `Basic ${Buffer.from(API_KEY + ':').toString('base64')}`,
            ...payload.getHeaders(),
        };


        // Make the API request
        const response = await axios.post(
            `${DROPBOX_SIGN_API_URL}/signature_request/send`,
            payload,
            { headers }
        );

        return response.data;

    } catch (error) {
        console.error('Error details:', error.response?.data || error.message);
        throw new Error('Failed to send signature request');
    }
}
