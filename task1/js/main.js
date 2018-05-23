var mainVM = function() {
    // GUI specific stuff
    var viewModel = {
        pageVisible : ko.observable('decode-huffman'),
        fileContent : ko.observable(''),
        inputFileContent: ko.observable(''),
        pruferObject : ko.observable(),
        huffmanArray : ko.observable(),
        downloadPrufer : function(){
            var text = viewModel.pruferObject().root.toString() + '\n';
            text += viewModel.pruferObject().code.join(' ') + '\n';
            text += viewModel.pruferObject().labels.join(' ') + '\n';
            download('pruferCode.txt', text);
        },
        changePage : function(pageName){
            this.pageVisible(pageName);
        },
        loadFile : function(){
            $('#file-upload').click();
        },
        loadFileHandler : function(){
            var self = this;
            var files = document.getElementById('file-upload').files;
            if(files.length > 0){
                var reader = new FileReader();
                reader.onloadend = function(){
                    self.fileContent(reader.result);
                }
                reader.readAsText(files[0]);
            }
        },
    };

    viewModel.isHuffmanMode = ko.computed(function(){
        return viewModel.pageVisible() === 'decode-huffman';
    });

    viewModel.isPruferMode = ko.computed(function(){
        return viewModel.pageVisible() === 'decode-prufer';
    });

    viewModel.pageVisible.subscribe(function(){
        viewModel.inputFileContent('');
        viewModel.pruferObject('');
        viewModel.huffmanArray('');
        viewModel.fileContent('');
    })

    //handle huffman decoding
    viewModel.fileContent.subscribe(function(data){
        if(data && viewModel.isHuffmanMode()){
            viewModel.inputFileContent(data.split('\n').join('\<br/\>'));
            viewModel.huffmanArray(data.split('\n').map(x => {
                var row = x.split(' ');
                return {label : row[0], value: parseFloat(row[1])};
            }));
            parseHuffmanCode(viewModel.huffmanArray().slice())
        }
    });

    //handle prufer decoding
    viewModel.fileContent.subscribe(function(data){
        if(data && viewModel.isPruferMode()){
            viewModel.inputFileContent(data.split('\n').join('\<br/\>'));
            viewModel.pruferObject(parsePruferInput(data));
            var root = viewModel.pruferObject().root;
            var edgesAndLeaves = generateEdgesAndLeaves(viewModel.pruferObject().prufferCode);
            var nodes = generateNodes(viewModel.pruferObject().prufferCode, edgesAndLeaves.leaves, viewModel.pruferObject().labels);
            drawTree(root, nodes, edgesAndLeaves.edges);
        }
    })

    //huffman part
    var parseHuffmanCode = function(huffmanArray){
        var v = huffmanArray.length * 2 - 1;
        var nodeNumber = v;
        var e = v - 1;
        var deg = Array.apply(null, {length: v}).map(x => 0);
        huffmanArray = huffmanArray.map(x => {
            nodeNumber -=1;
            return {id : nodeNumber, label: x.label, value: x.value};
        })
        edges = Array.apply(null, {length: e}).map(x => {return {}});
        nodes = Array.apply(null, {length: v}).map(x => {return { label: ''}});
        var edgeIdx = 0;
        while(huffmanArray.length > 1){

            var min1 = findMin(huffmanArray);
            huffmanArray = huffmanArray.filter(x => x.id != min1.id);

            var min2 = findMin(huffmanArray);
            huffmanArray = huffmanArray.filter(x => x.id != min2.id);

            nodeNumber -= 1;
            nodes[min1.id].label = min1.label;
            nodes[min2.id].label = min2.label;
            
            edges[edgeIdx].left = min1.id;
            edges[edgeIdx].right = nodeNumber;
            edgeIdx += 1;

            edges[edgeIdx].left = min2.id;
            edges[edgeIdx].right = nodeNumber;
            edgeIdx += 1;

            huffmanArray.push({label: '', value: min1.value + min2.value, id: nodeNumber});
        }

        for(var ed of edges){
            deg[ed.left] +=1;
            deg[ed.right] +=1;
        }

        drawTree(nodeNumber+1, prepareNodes(nodes), prepareEdges(edges));

        //generate prufer code
        var prufer = {
            root : nodeNumber+1,
            code : [],
            labels : []
        };
        var edgesCopy = edges.slice();
        for(var i = 0; i < v - 2; i++){
            var minNode = v * 3;
            var edgeIndex = -1;
            for(var j = 0; j < edgesCopy.length; j++){
                if(deg[edgesCopy[j].left]==1){
                    if(minNode > edgesCopy[j].left){
                        minNode = edgesCopy[j].left;
                        edgeIndex = j;
                    }
                }
                if(deg[edgesCopy[j].right]==1){
                    if(minNode > edgesCopy[j].right){
                        minNode = edgesCopy[j].right;
                        edgeIndex = j;
                    }
                }
            }
            
            deg[edgesCopy[edgeIndex].left] -= 1;
            deg[edgesCopy[edgeIndex].right] -= 1;
            if(deg[edgesCopy[edgeIndex].left] > 0){
                prufer.code.push(edgesCopy[edgeIndex].left+1);
            }
            else{
                prufer.code.push(edgesCopy[edgeIndex].right+1);
            }
            edgesCopy.splice(edgeIndex,1);
            
            var nodeLabel = nodes[minNode].label
            if(nodeLabel){
                prufer.labels.push(nodeLabel);
            }
        }

        prufer.labels = nodes.map(x => { if(x.label) return x.label;}).filter(x => x);
        viewModel.pruferObject(prufer);
    }

    var download = function(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
      
        element.style.display = 'none';
        document.body.appendChild(element);
      
        element.click();
      
        document.body.removeChild(element);
    }

    var findMin = function(huffmanArray){
        var lowest = huffmanArray[0];
        
        for(var i = 0; i < huffmanArray.length; i++){
            if(lowest.value > huffmanArray[i].value){
                lowest = huffmanArray[i];
            }
        }
        return lowest;
    }
    
    var prepareNodes = function(nodes){
        var result = [];
        for(var i = 0; i < nodes.length; i++){
            result.push({ group: "nodes", data: { id: i+1 , label: nodes[i].label}});
        }
        return result;
    }
    
    var prepareEdges = function(edges){
        var result = [];
        for(var i = 0; i < edges.length; i++){
            var left = edges[i].left+1;
            var right = edges[i].right+1;
            
            result.push({
                group: "edges", data: { id: "e"+left+"-"+right, source: left, target: right }
            });
        }
        return result;
    }

    //prufer part
    var parsePruferInput = function(input){
        var array = input.split('\n');
        var result = {
            root : array[0],
            prufferCode : array[1].split(' '),
            labels : array[2].split(' ')
        }
        return result;
    }

    var generateEdgesAndLeaves = function(prufer){
        var vertices = prufer.length + 2;
        var deg = Array.apply(null, {length: vertices}).map(x => 1);
        
        //calculate occurence of each node
        for(i = 0; i < vertices - 2; i++){
            var currentVertex = prufer[i];
            deg[currentVertex-1] += 1;
        }
        
        //get leaves nodes numbers
        var leavesId = []
        for(i = 0; i < vertices; i++){
            if(deg[i]==1){
                leavesId.push(i+1);
            }
        }
        
        var edges = [];
        //iterate all prufer numbers
        for(i = 0; i < vertices-2; i++){
            var currentVertex = prufer[i];
            var lowestVertex = -1;
            //find first number not existing deg (value = 0)
            for(j = 0; j < vertices; j++ ){
                if(deg[j] == 1){
                    lowestVertex = j+1;
                    //remove current value from pruffer code
                    deg[j] = -1;
                    // -1 index
                    deg[prufer[i]-1] -= 1;
                    break;
                }
            }
            edges.push({
                group: "edges", data: { id: "e"+currentVertex+"-"+lowestVertex, source: currentVertex, target: lowestVertex }
            });
        }

        var left = -1;
        var right = -1;
        for(i = 0; i < vertices; i++){
            if(deg[i] == 1 && left == -1){
                left = i + 1;
            }
            else if(deg[i] == 1){
                right = i + 1;
            }
        }
        edges.push({
            group: "edges", data: { id: "e"+left+"-"+right, source: left, target: right }
        });
        return {
            edges: edges,
            leaves : leavesId
        };
    }

    var generateNodes = function(prufer, leavesIds, leaveLabels){
        var vertices = prufer.length + 2;
        return Array.apply(null, {length: vertices}).map(Number.call, Number).map(x => {
            var leaveIndex = leavesIds.indexOf(x+1);
            if(leaveIndex > -1){
                return { group: "nodes", data: { id: (x+1) , label:leaveLabels[leaveIndex] } };
            }
            else{
                return { group: "nodes", data: { id: (x+1) , label: ''} };
            }
        });
    }

    //common
    var drawTree = function(_root, _nodes, _edges){
        var cy = cytoscape({
            container: document.getElementById('svg-graph'),
            style: [ // the stylesheet for the graph
                {
                  selector: 'node',
                  style: {
                    'background-color': '#666',
                    'label': 'data(id)'
                  }
                },
            
                {
                  selector: 'edge',
                  style: {
                    'width': 3,
                    'line-color': '#ccc',
                    'target-arrow-color': '#ccc',
                    'target-arrow-shape': 'triangle'
                  }
                }
              ],
            layout: {
                name: 'breadthfirst',
                avoidOverlap: true,
                roots: '#'+_root,
            },
            elements: {
                grabbable: false,
                nodes: _nodes,
                edges: _edges
              },
        });
    
        cy.nodeHtmlLabel([{
            query: 'node',
            tpl: function(data){
              return '<p class="nodeLabel">' + data.label + '</p>'
            }
        }]);
    
    }

    return viewModel;
}


