import { IDataServiceRegistry } from './serviceInterfaces';
import { mockDataProvider } from './mockDataProvider';
import { createApiDataProvider } from './apiDataProvider';

/**
 * Data Provider Selection Gateway
 * Switches between Mock Demonstration Data and live FastAPI backend
 * based on import.meta.env.VITE_DATA_PROVIDER
 */

const providerMode = import.meta.env.VITE_DATA_PROVIDER || 'mock';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const isUsingMockData = providerMode === 'mock';

export const dataService: IDataServiceRegistry =
  providerMode === 'api'
    ? createApiDataProvider(apiBaseUrl)
    : mockDataProvider;

export default dataService;
