export class HttpClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  private async request(method: string, endpoint: string, body?: any) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": this.apiKey,
    };

    const options: RequestInit = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    };

    const response = await fetch(url, options);
    if (!response.ok && response.status !== 408) {
      throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  get(endpoint: string) {
    return this.request("GET", endpoint);
  }

  post(endpoint: string, body?: any) {
    return this.request("POST", endpoint, body);
  }

  delete(endpoint: string) {
    return this.request("DELETE", endpoint);
  }
}
