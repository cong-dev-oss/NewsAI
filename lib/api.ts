const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const api = {
    // Sources
    getSources: () => fetch(`${API_BASE_URL}/sources/`).then(res => res.json()),
    createSource: (data: any) => fetch(`${API_BASE_URL}/sources/`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(res => res.json()),
    
    // Topics
    getTopics: () => fetch(`${API_BASE_URL}/sources/topics`).then(res => res.json()),
    createTopic: (data: any) => fetch(`${API_BASE_URL}/sources/topics`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(res => res.json()),
    
    // Configs
    getConfigs: () => fetch(`${API_BASE_URL}/sources/configs`).then(res => res.json()),
    createConfig: (data: any) => fetch(`${API_BASE_URL}/sources/configs`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(res => res.json()),
    
    // History
    getHistory: () => fetch(`${API_BASE_URL}/history/`).then(res => res.json()),
};
