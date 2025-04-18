/**
 * API Service for making HTTP requests
 */
import axios from 'axios';

export class ApiService {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    async fetchData<T>(endpoint: string): Promise<T> {
        try {
            const response = await axios.get<T>(`${this.baseUrl}/${endpoint}`);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch data: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async postData<T, R>(endpoint: string, data: T): Promise<R> {
        try {
            const response = await axios.post<R>(`${this.baseUrl}/${endpoint}`, data);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to post data: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async updateData<T, R>(endpoint: string, id: string, data: T): Promise<R> {
        try {
            const response = await axios.put<R>(`${this.baseUrl}/${endpoint}/${id}`, data);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to update data: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async deleteData(endpoint: string, id: string): Promise<boolean> {
        try {
            await axios.delete(`${this.baseUrl}/${endpoint}/${id}`);
            return true;
        } catch (error) {
            throw new Error(`Failed to delete data: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
} 