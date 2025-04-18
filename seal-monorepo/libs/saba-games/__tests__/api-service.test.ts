/**
 * API Service test file
 * Demonstrating mocking of external dependencies
 * Following AAA (Arrange, Act, Assert) pattern
 */
import axios from 'axios';
import { ApiService } from '../src/services/api-service';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Test suite
describe('ApiService', () => {
    // Setup
    const baseUrl = 'https://api.example.com';
    let apiService: ApiService;

    beforeEach(() => {
        // Create a new instance for each test
        apiService = new ApiService(baseUrl);
        // Clear all mock implementations and calls for each test
        jest.clearAllMocks();
    });

    // Happy Path Tests
    describe('fetchData', () => {
        it('should fetch data successfully from the API', async () => {
            // Arrange
            const mockData = { id: 1, name: 'Test Item' };
            const endpoint = 'items';
            mockedAxios.get.mockResolvedValueOnce({ data: mockData });

            // Act
            const result = await apiService.fetchData(endpoint);

            // Assert
            expect(mockedAxios.get).toHaveBeenCalledWith(`${baseUrl}/${endpoint}`);
            expect(result).toEqual(mockData);
        });
    });

    describe('postData', () => {
        it('should post data successfully to the API', async () => {
            // Arrange
            const inputData = { name: 'New Item' };
            const mockResponse = { id: 1, name: 'New Item' };
            const endpoint = 'items';
            mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

            // Act
            const result = await apiService.postData(endpoint, inputData);

            // Assert
            expect(mockedAxios.post).toHaveBeenCalledWith(`${baseUrl}/${endpoint}`, inputData);
            expect(result).toEqual(mockResponse);
        });
    });

    describe('updateData', () => {
        it('should update data successfully', async () => {
            // Arrange
            const id = '1';
            const inputData = { name: 'Updated Item' };
            const mockResponse = { id: 1, name: 'Updated Item' };
            const endpoint = 'items';
            mockedAxios.put.mockResolvedValueOnce({ data: mockResponse });

            // Act
            const result = await apiService.updateData(endpoint, id, inputData);

            // Assert
            expect(mockedAxios.put).toHaveBeenCalledWith(`${baseUrl}/${endpoint}/${id}`, inputData);
            expect(result).toEqual(mockResponse);
        });
    });

    describe('deleteData', () => {
        it('should delete data successfully', async () => {
            // Arrange
            const id = '1';
            const endpoint = 'items';
            mockedAxios.delete.mockResolvedValueOnce({});

            // Act
            const result = await apiService.deleteData(endpoint, id);

            // Assert
            expect(mockedAxios.delete).toHaveBeenCalledWith(`${baseUrl}/${endpoint}/${id}`);
            expect(result).toBe(true);
        });
    });

    // Error Handling Tests
    describe('error handling', () => {
        it('should throw an error when fetchData fails', async () => {
            // Arrange
            const errorMessage = 'Network Error';
            const endpoint = 'items';
            mockedAxios.get.mockRejectedValueOnce(new Error(errorMessage));

            // Act & Assert
            await expect(apiService.fetchData(endpoint)).rejects.toThrow(`Failed to fetch data: ${errorMessage}`);
            expect(mockedAxios.get).toHaveBeenCalledWith(`${baseUrl}/${endpoint}`);
        });

        it('should throw an error when postData fails', async () => {
            // Arrange
            const errorMessage = 'Bad Request';
            const endpoint = 'items';
            const inputData = { name: 'Test' };
            mockedAxios.post.mockRejectedValueOnce(new Error(errorMessage));

            // Act & Assert
            await expect(apiService.postData(endpoint, inputData)).rejects.toThrow(`Failed to post data: ${errorMessage}`);
            expect(mockedAxios.post).toHaveBeenCalledWith(`${baseUrl}/${endpoint}`, inputData);
        });

        it('should throw an error when updateData fails', async () => {
            // Arrange
            const errorMessage = 'Not Found';
            const endpoint = 'items';
            const id = '999';
            const inputData = { name: 'Test' };
            mockedAxios.put.mockRejectedValueOnce(new Error(errorMessage));

            // Act & Assert
            await expect(apiService.updateData(endpoint, id, inputData)).rejects.toThrow(
                `Failed to update data: ${errorMessage}`
            );
            expect(mockedAxios.put).toHaveBeenCalledWith(`${baseUrl}/${endpoint}/${id}`, inputData);
        });

        it('should throw an error when deleteData fails', async () => {
            // Arrange
            const errorMessage = 'Forbidden';
            const endpoint = 'items';
            const id = '1';
            mockedAxios.delete.mockRejectedValueOnce(new Error(errorMessage));

            // Act & Assert
            await expect(apiService.deleteData(endpoint, id)).rejects.toThrow(`Failed to delete data: ${errorMessage}`);
            expect(mockedAxios.delete).toHaveBeenCalledWith(`${baseUrl}/${endpoint}/${id}`);
        });
    });

    // Edge Cases
    describe('edge cases', () => {
        it('should handle empty responses', async () => {
            // Arrange
            const endpoint = 'empty';
            mockedAxios.get.mockResolvedValueOnce({ data: null });

            // Act
            const result = await apiService.fetchData(endpoint);

            // Assert
            expect(result).toBeNull();
        });

        it('should handle special characters in URL parameters', async () => {
            // Arrange
            const id = 'test/special?chars';
            const endpoint = 'items';
            const inputData = { name: 'Test' };
            mockedAxios.put.mockResolvedValueOnce({ data: { success: true } });

            // Act
            await apiService.updateData(endpoint, id, inputData);

            // Assert
            expect(mockedAxios.put).toHaveBeenCalledWith(`${baseUrl}/${endpoint}/${id}`, inputData);
        });
    });
}); 