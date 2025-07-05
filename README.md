# ReAssist: Research Intelligence Companion

ReAssist is an advanced research assistant platform that helps researchers explore academic papers, analyze research trends, and discover semantic connections between studies. It combines powerful paper recommendations with interactive visualizations and real-time research insights.

![image](https://github.com/user-attachments/assets/a0473baa-8c42-4b93-b899-5eac134e179f)

![1](https://github.com/user-attachments/assets/5e01ffc1-769a-4a92-a1a0-57b297be18a6)
![2](https://github.com/user-attachments/assets/6bfc0c30-7f1f-4586-89a6-556cbfdf1c26)

![3](https://github.com/user-attachments/assets/7adb94b8-a5b7-487e-94b9-a93c2ae01614)

## Demo
https://www.youtube.com/watch?v=-NbU6WdOk5k
## Features

- **Smart Paper Recommendations**: Get tailored research paper recommendations based on your queries
- **Semantic Network Analysis**: Visualize connections and relationships between papers
- **Research Insights**: Generate comprehensive thematic and comparative analyses
- **Real-time Chat Interface**: Interactive AI-powered research assistant
- **Predictive Intelligence**: Identify emerging research trends and gaps
- **WebSocket Updates**: Real-time progress tracking for research queries

## Tech Stack

### Backend
- FastAPI
- OpenAI/SambaNova API integration
- Pydantic for data validation
- WebSocket support for real-time updates
- Custom paper analysis and semantic network visualization

### Frontend
- React
- Tailwind CSS
- Lucide React icons
- Axios for API communication
- Real-time WebSocket integration
- Shadcn/ui components

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 14+
- SambaNova API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/StarAtNyte/reassist.git
cd reassist
```

2. Set up the backend:
```bash

# Create .env file
# Add your SAMBANOVA_API_KEY to .env

# Create and activate virtual environment
python -m venv reassist
source reassist/bin/activate  # On Windows: .\venv\Scripts\activate

#cd to backend folder
cd reassist_backend

# Install dependencies
pip install -r requirements.txt

```

3. Set up the frontend:
```bash
cd reassist_frontend
npm install
```

### Running the Application

1. Start the backend server:
```bash
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

2. Start the frontend development server:
```bash
npm start
```
The application will be available at `http://localhost:3000`

## API Endpoints

### Research Endpoints
- `POST /research/recommend`: Get paper recommendations
- `POST /research/analyze`: Get comprehensive research analysis
- `WS /research/updates`: WebSocket endpoint for real-time updates

### Chat Endpoint
- `POST /chat`: Interactive chat with research assistant

### Semantic Network Endpoints
- `POST /semantic-network/graph`: Generate semantic network graph
- `POST /semantic-network/connections`: Extract semantic connections
- `POST /semantic-network/contradictions`: Identify contradictions
- `POST /semantic-network/visualize`: Generate network visualization

## Acknowledgments

- Built with SambaNova's AI API
- Uses Meta's Llama 3.1 405B, Llama-3.2-11B-Vision-Instruct, and Llama-3.2-90B-Vision-Instruct model
- Shadcn/ui for component library


