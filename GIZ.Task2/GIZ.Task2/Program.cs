using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GIZ.Task2
{
    class Program
    {
        static void Main(string[] args)
        {
            if(args.Length != 2)
            {
                Console.WriteLine("Incorrect number of arguments, try following options");
                Console.WriteLine("\"-b FILEPATH\" for bridges");
                Console.WriteLine("\"-aBp FILEPATH\" for articulation points");
                return;
            }

            if(args[0] == "-b")
            {
                Console.WriteLine("Looking for bridges");
                var handler = new BridgeFinder();
                using (var file = new System.IO.StreamReader(args[1]))
                {
                    var nodesString = file.ReadLine();
                    var nodes = int.Parse(nodesString.Trim());
                    handler.AddFirstLine(nodes);
                    for (int i = 1; i <= nodes; i++)
                    {
                        handler.AddNextLine(i, file.ReadLine());
                    }
                    var path = new FileInfo(args[1]).Directory.FullName + "\\outputB.txt";
                    File.WriteAllText(path, handler.GetResult());
                    Console.WriteLine("Result saved in file: " + path);
                }
            }
            else if(args[0] == "-ap")
            {
                Console.WriteLine("Looking for articulation points");
                var handler = new ArticulationPointFinder();
                using (var file = new System.IO.StreamReader(args[1]))
                {
                    var nodesString = file.ReadLine();
                    var nodes = int.Parse(nodesString.Trim());
                    handler.AddFirstLine(nodes);
                    for (int i = 1; i <= nodes; i++)
                    {
                        handler.AddNextLine(i, file.ReadLine());
                    }
                    var path = new FileInfo(args[1]).Directory.FullName + "\\outputAP.txt";
                    File.WriteAllText(path, handler.GetResult());
                    Console.WriteLine("Result saved in file: " + path);
                }
            }
        }
    }
}
