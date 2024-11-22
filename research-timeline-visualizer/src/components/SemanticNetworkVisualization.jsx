import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Network from 'react-vis-network-graph';
import { 
  AlertCircle, 
  Share2, 
  GitCompare, 
  Layers 
} from 'lucide-react';

const SemanticNetworkVisualization = ({ papers }) => {
  const [graph, setGraph] = useState(null);
  const [connections, setConnections] = useState([]);
  const [contradictions, setContradictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    const fetchSemanticNetwork = async () => {
      if (!papers || papers.length === 0) {
        setError('No papers provided for semantic network analysis');
        return;
      }
  
      setLoading(true);
      setError(null);
      setDebugInfo(null);
  
      try {
        const debugPayload = {
          paperCount: papers.length,
          paperTitles: papers.map(paper => paper.title || 'Untitled'),
          paperIds: papers.map(paper => paper.id || 'No ID')
        };
        setDebugInfo(debugPayload);
  
        const papersPayload = papers.map((paper, index) => ({
          title: paper.title,
          id: paper.id || `paper_${index}`,  
          abstract: paper.abstract || ''     
        }));
  
        const requests = [
          axios.post('http://localhost:8000/semantic-network/graph', { papers: papersPayload }, { 
            timeout: 45000,
            headers: { 'Content-Type': 'application/json' }
          }),
          axios.post('http://localhost:8000/semantic-network/connections', { papers: papersPayload }, { 
            timeout: 45000,
            headers: { 'Content-Type': 'application/json' }
          }),
          axios.post('http://localhost:8000/semantic-network/contradictions', { papers: papersPayload }, { 
            timeout: 45000,
            headers: { 'Content-Type': 'application/json' }
          })
        ];
  
        const results = await Promise.allSettled(requests);
  
        const processedResults = results.map(result => {
          if (result.status === 'fulfilled') {
            return result.value.data;
          } else {
            console.error('Request failed:', result.reason);
            return null;
          }
        });
  
        const [graphResponse, connectionsResponse, contradictionsResponse] = processedResults;
  
        console.log('Graph Response:', graphResponse);
        console.log('Connections Response:', connectionsResponse);
        console.log('Contradictions Response:', contradictionsResponse);
  
        if (graphResponse) {
          setGraph(graphResponse);
        } else {
          const mockGraph = generateMockGraph(papers);
          setGraph(mockGraph);
        }
  
        if (connectionsResponse?.connections) {
          setConnections(connectionsResponse.connections);
        }
  
        if (contradictionsResponse?.contradictions) {
          setContradictions(contradictionsResponse.contradictions);
        }
  
        if (!graphResponse && !connectionsResponse && !contradictionsResponse) {
          throw new Error('No data received from server');
        }
  
      } catch (err) {
        console.error('Semantic Network Error:', err);
        
        let errorMessage = 'Failed to generate semantic network';
        if (err.response) {
          errorMessage = `Server error: ${err.response.status} - ${err.response.data?.detail || 'Unknown error'}`;
        } else if (err.request) {
          errorMessage = 'No response received from server. Check network connection.';
        } else {
          errorMessage = err.message || 'Unknown error occurred';
        }
        
        setError(errorMessage);
  
        const mockGraph = generateMockGraph(papers);
        setGraph(mockGraph);
        setConnections(generateMockConnections(papers));
        setContradictions(generateMockContradictions(papers));
      } finally {
        setLoading(false);
      }
    };
  
    const generateMockGraph = (papers) => ({
      nodes: papers.map(paper => ({
        id: paper.title,
        label: paper.title
      })),
      edges: papers.slice(0, -1).map((paper, index) => ({
        from: paper.title,
        to: papers[index + 1].title
      }))
    });
  
    const generateMockConnections = (papers) => 
      papers.slice(0, -1).map((paper, index) => ({
        source_paper: paper.title,
        target_paper: papers[index + 1].title,
        relationship: 'related'
      }));
  
    const generateMockContradictions = (papers) => 
      papers.slice(0, -1).map((paper, index) => ({
        source_paper: paper.title,
        target_paper: papers[index + 1].title,
        description: 'Potential methodological difference'
      }));
  
    if (papers && papers.length > 0) {
      fetchSemanticNetwork();
    }
  }, [papers]);

  const renderGraph = () => {
    if (!graph) return null;
  
    const graphOptions = {
      layout: {
        hierarchical: {
          enabled: false,
          direction: 'UD',
          sortMethod: 'directed',
        },
      },
      nodes: {
        color: {
          background: '#2196F3',
          border: '#1565C0',
          highlight: {
            background: '#FF5722',
            border: '#E64A19',
          },
        },
        font: { color: 'white' },
      },
      edges: {
        color: { inherit: true },
        smooth: {
          type: 'dynamic',
        },
      },
    };
  
    return (
      <div
        className="bg-white p-4 rounded-lg shadow-md"
        style={{ height: '500px', overflow: 'hidden' }} 
      >
        <Network
          graph={graph}
          options={graphOptions}
          events={{
            select: (event) => {
              const { nodes, edges } = event;
              console.log('Selected nodes:', nodes);
              console.log('Selected edges:', edges);
            },
          }}
          style={{ height: '100%' }} 
        />
      </div>
    );
  };  

  const renderContradictions = () => {
    const contradictionsList = Array.isArray(contradictions) 
      ? contradictions 
      : contradictions?.contradictions || [];
  
    if (contradictionsList.length === 0) return null;
  
    return (
      <div className="bg-white p-4 rounded-lg shadow-md mt-4">
        <div className="flex items-center mb-3">
          <AlertCircle className="text-red-500 mr-2" />
          <h3 className="text-lg font-bold text-gray-800">
            Research Contradictions
          </h3>
        </div>
        {contradictionsList.map((contradiction, index) => (
          <div 
            key={index} 
            className="border-l-4 border-red-500 pl-3 py-2 mb-2 bg-red-50"
          >
            <p className="text-sm text-gray-700">
              {contradiction.description || 'No detailed description available'}
            </p>
            <div className="text-xs text-gray-500 mt-1">
              {contradiction.source_paper && contradiction.target_paper && (
                <>
                  Between: {contradiction.source_paper} and {contradiction.target_paper}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderConnections = () => {
    if (!connections || connections.length === 0) return null;

    return (
      <div className="bg-white p-4 rounded-lg shadow-md mt-4">
        <div className="flex items-center mb-3">
          <Share2 className="text-blue-500 mr-2" />
          <h3 className="text-lg font-bold text-gray-800">
            Paper Connections
          </h3>
        </div>
        {connections.map((connection, index) => (
          <div 
            key={index} 
            className="border-l-4 border-blue-500 pl-3 py-2 mb-2 bg-blue-50"
          >
            <p className="text-sm text-gray-700">
              {connection.source_paper} → {connection.target_paper}: 
              {connection.relationship}
            </p>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <p>Generating semantic network...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded">
        <div className="mb-4">
          <p className="font-bold">Error: {error}</p>
        </div>
        {debugInfo && (
          <details className="text-sm text-gray-700 bg-white p-3 rounded">
            <summary>Debug Information</summary>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </details>
        )}
      </div>
    );
  }

  if (!papers || papers.length === 0 || !graph) {
    return (
      <div className="text-center py-4 text-gray-500">
        <p>No semantic network available. Please perform a search first.</p>
      </div>
    );
  }

  return (
    <div className="semantic-network-visualization">
      {graph && (
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            {renderGraph()}
          </div>
          <div>
            {renderContradictions()}
          </div>
          <div>
            {renderConnections()}
          </div>
        </div>
      )}
    </div>
  );
};

export default SemanticNetworkVisualization;