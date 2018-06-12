using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GIZ.Task2
{
    [DebuggerDisplay("NodeN = {NodeNumber}")]
    public class Node
    {
        private List<Node> _nodesList = new List<Node>();

        public List<Node> ConnectedNodes => _nodesList;

        public Node(int nodeNumber)
        {
            NodeNumber = nodeNumber;
        }

        public int NodeNumber { get; }
        public int DFSIndex { get; set; }
        public bool Visited => DFSIndex > 0;
        public int Low { get; set; }
        internal void AddNode(Node node)
        {
            _nodesList.Add(node);
        }


    }
}
