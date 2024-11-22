import React, { useState, useEffect } from 'react';
import { ForceGraph2D } from 'react-force-graph';
import * as d3 from 'd3';
import axios from 'axios';

const SemanticNetworkVisualization = ({ papers, query }) => {
  const [graphData, setGraphData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const generateSemanticNetwork = async () => {
      if (!papers || papers.length === 0) return;

      setIsLoading(true);
      setError(null);

      try {
        // Call backend API to generate semantic network
        const response = await axios.post('http://127.0.0.1:8000/semantic-network/analyze', papers, {
          timeout: 100000
        });

        const networkData = response.data;

        // Transform graph data for visualization
        const transformedData = {
          nodes: Object.keys(networkData.impact_scores).map(nodeId => {
            const paper = papers.find(p => p.id === nodeId);
            return {
              id: nodeId,
              title: paper.title,
              impactScore: networkData.impact_scores[nodeId].impact_score,
              innovationPotential: networkData.impact_scores[nodeId].innovation_potential,
              group: paper.journal || 'default'
            };
          }),
          links: Object.entries(networkData.semantic_graph.edges).map(([key, edge]) => ({
            source: edge.source,
            target: edge.target,
            value: edge.weight
          }))
        };

        setGraphData(transformedData);
      } catch (err) {
        console.error('Error generating semantic network:', err);
        setError('Failed to generate semantic network. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    generateSemanticNetwork();
  }, [papers]);

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  return (
    <div className="semantic-network-visualization relative">
      {graphData ? (
        <>
          <div className="text-sm text-gray-500 mb-4">
            Semantic Network for: <span className="font-semibold">{query}</span>
          </div>
          <div className="h-[600px] w-full border rounded-lg overflow-hidden">
            <ForceGraph2D
              graphData={graphData}
              nodeColor={node => 
                d3.scaleOrdinal(d3.schemeCategory10)(node.group)
              }
              nodeCanvasObject={(node, ctx, globalScale) => {
                const label = node.title;
                const fontSize = 12 / globalScale;
                ctx.font = `${fontSize}px Arial`;
                const textWidth = ctx.measureText(label).width;
                const nodeRadius = 5;

                // Draw node
                ctx.beginPath();
                ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI, false);
                ctx.fillStyle = d3.scaleOrdinal(d3.schemeCategory10)(node.group);
                ctx.fill();

                // Draw label
                ctx.fillStyle = 'black';
                ctx.fillText(
                  label, 
                  node.x + nodeRadius + 2, 
                  node.y + fontSize / 2
                );
              }}
              nodeCanvasObjectMode={() => 'after'}
              onNodeClick={handleNodeClick}
              linkWidth={link => link.value * 2}
              linkColor={() => 'rgba(0,100,200,0.3)'}
            />
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500">
          Insufficient data to generate semantic network
        </div>
      )}

      {selectedNode && (
        <ResearchNodeDetails node={selectedNode} />
      )}
    </div>
  );
};

const ResearchNodeDetails = ({ node }) => {
  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 w-80 border">
      <h3 className="text-lg font-bold mb-2 truncate">{node.title}</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Impact Score:</span>
          <span className="font-semibold">
            {(node.impactScore * 100).toFixed(2)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Innovation Potential:</span>
          <span className="font-semibold">
            {(node.innovationPotential * 100).toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default SemanticNetworkVisualization;