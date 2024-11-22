# ReAssist: Research Intelligence Companion

ReAssist is an advanced research assistant platform that helps researchers explore academic papers, analyze research trends, and discover semantic connections between studies. It combines powerful paper recommendations with interactive visualizations and real-time research insights.

![ReAssist Logo](https://via.placeholder.com/600x200?text=ReAssist+Research+Intelligence+Companion)

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
git clone https://github.com/yourusername/reassist.git
cd reassist
```

2. Set up the backend:
```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Add your SAMBANOVA_API_KEY to .env
```

3. Set up the frontend:
```bash
cd frontend
npm install
```

### Running the Application

1. Start the backend server:
```bash
uvicorn main:app --reload
```

2. Start the frontend development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Research Endpoints
- `POST /research/recommend`: Get paper recommendations
- `POST /research/analyze`: Get comprehensive research analysis
- `WS /research/updates`: WebSocket endpoint for real-time updates

### Semantic Network Endpoints
- `POST /semantic-network/graph`: Generate semantic network graph
- `POST /semantic-network/connections`: Extract semantic connections
- `POST /semantic-network/contradictions`: Identify contradictions
- `POST /semantic-network/visualize`: Generate network visualization

### Chat Endpoint
- `POST /chat`: Interactive chat with research assistant

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with SambaNova's AI API
- Uses Meta's Llama 3.1 405B model
- Shadcn/ui for component library

## Support

For support, please open an issue in the GitHub repository or contact the maintenance team.
