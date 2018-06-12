using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GIZ.Task2
{
    public class ArticulationPointFinder
    {
        private Node[] _nodes;
        private StringBuilder _bridges = new StringBuilder();

        public void AddFirstLine(int lines)
        {
            _nodes = new Node[lines + 1];
            for (int i = 1; i <= lines; i++)
            {
                _nodes[i] = new Node(i);
            }
        }

        public void AddNextLine(int nodeId, string line)
        {
            var lowerNodesString = line;
            var lowerNodes = lowerNodesString.Split(' ');
            foreach (var lowerNode in lowerNodes)
            {
                if(int.TryParse(lowerNode, out var nodeIdx))
                {
                    _nodes[nodeId].AddNode(_nodes[nodeIdx]);
                    _nodes[nodeIdx].AddNode(_nodes[nodeId]);
                }
            }
        }

        public int DFS(int dfsIndex, int currentNodeNumber, int parentNode)
        {
            var currentNode = _nodes[currentNodeNumber];
            currentNode.DFSIndex = dfsIndex;
            currentNode.Low = dfsIndex;

            var test = 0;

            for (int i = 0; i < currentNode.ConnectedNodes.Count; i++)
            {
                var neighbor = currentNode.ConnectedNodes[i];
                if(neighbor.NodeNumber != parentNode)
                {
                    if (!neighbor.Visited)
                    {
                        var nestedLow = DFS(dfsIndex + 1, neighbor.NodeNumber, currentNodeNumber);
                        if(nestedLow < currentNode.Low)
                        {
                            currentNode.Low = nestedLow;
                        }
                        if(nestedLow >= currentNode.DFSIndex)
                        {
                            test = 1;
                        }
                    }
                    else if(neighbor.DFSIndex < currentNode.Low)
                    {
                        currentNode.Low = neighbor.DFSIndex;
                    }
                }
            }

            if(test == 1)
            {
                Console.WriteLine($"Found articulation point! {currentNodeNumber}");
                _bridges.Append($"{currentNodeNumber} ");
            }
            return currentNode.Low;
        }

        public string GetResult()
        {
            for (int i = 1; i < _nodes.Length; i++)
            {
                if(!_nodes[i].Visited)
                    DFS(1, i, -1);
            }
            return _bridges.ToString();
        }
    }
}
