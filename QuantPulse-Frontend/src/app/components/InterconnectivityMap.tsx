import { useEffect, useState, useRef, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { AlertTriangle, Activity, Zap, Info, ShieldCheck } from 'lucide-react';
import graphDataRaw from '@/app/data/graphData.json';

// Types
interface Node {
    id: string;
    group: number;
    risk_score: number;
    market_cap: string;
    centrality_between?: number;
    centrality_eigen?: number;
    x?: number;
    y?: number;
    color?: string; // For display
    val?: number; // Radius
}

interface Link {
    source: string | Node;
    target: string | Node;
    value: number;
    type?: string;
}

interface GraphData {
    nodes: Node[];
    links: Link[];
}

export function InterconnectivityMap() {
    const [data, setData] = useState<GraphData>({ nodes: [], links: [] });
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [shockActive, setShockActive] = useState(false);
    const graphRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Process raw data to match graph format
        // Assign colors based on groups/risk
        const nodes = graphDataRaw.nodes.map(n => ({
            ...n,
            color: getGroupColor(n.group),
            val: n.risk_score * 20 // Scale node size by risk
        }));

        // Links need source/target as strings initially for the engine to bind
        const links = graphDataRaw.links.map(l => ({ ...l }));

        setData({ nodes, links });
    }, []);

    useEffect(() => {
        // Responsive resize
        const handleResize = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                });
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Helpers
    const getGroupColor = (group: number) => {
        // Matching QuantPulse/Fintech styling
        // 1: Finance (Purple/Blue), 2: IT (Cyan), 3: Infra (Green), etc.
        switch (group) {
            case 1: return '#8B5CF6'; // Violet
            case 2: return '#06B6D4'; // Cyan
            case 3: return '#10B981'; // Emerald
            case 4: return '#F59E0B'; // Amber
            case 5: return '#EC4899'; // Pink
            default: return '#94A3B8'; // Slate
        }
    };

    const handleNodeClick = (node: Node) => {
        setSelectedNode(node);
        // Focus camera
        if (graphRef.current) {
            graphRef.current.centerAt(node.x, node.y, 1000);
            graphRef.current.zoom(2.5, 2000);
        }
    };

    const simulateShock = () => {
        setShockActive(prev => !prev);
    };

    // Memoized insights
    const clusterRisk = useMemo(() => {
        const g = graphDataRaw.insights.clusters.find(c => c.risk === 'Critical');
        return g ? g.name : 'None';
    }, []);

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] gap-6 p-1">

            {/* Header / Actions */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
                        <Activity className="size-6 text-[#3A6FF8]" />
                        Market Topology
                    </h1>
                    <p className="text-zinc-400 text-sm">Real-time correlation network & contagion analysis</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={simulateShock}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all border ${shockActive
                            ? 'bg-red-500/10 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                            : 'bg-[#3A6FF8]/10 border-[#3A6FF8]/50 text-[#3A6FF8] hover:bg-[#3A6FF8]/20'
                            }`}
                    >
                        <Zap className="size-4" />
                        {shockActive ? 'Stop Simulation' : 'Simulate Market Shock'}
                    </button>
                </div>
            </div>

            <div className="flex flex-1 gap-6 min-h-0">

                {/* Main Graph Card */}
                <div
                    className="flex-1 relative rounded-xl border border-[rgba(100,150,255,0.1)] bg-[rgba(15,23,42,0.4)] backdrop-blur-sm overflow-hidden shadow-lg"
                    ref={containerRef}
                >
                    {/* Legend/Overlay */}
                    <div className="absolute top-4 left-4 z-10 bg-black/40 backdrop-blur-md p-3 rounded-lg border border-white/10 text-xs text-zinc-300">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-3 h-3 rounded-full bg-[#8B5CF6]"></span> Finance
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-3 h-3 rounded-full bg-[#06B6D4]"></span> IT Services
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-[#10B981]"></span> Infra/Energy
                        </div>
                    </div>

                    <ForceGraph2D
                        ref={graphRef}
                        width={dimensions.width}
                        height={dimensions.height}
                        graphData={data}
                        nodeLabel="id"
                        nodeRelSize={6}

                        // Visuals
                        backgroundColor="rgba(0,0,0,0)" // Transparent
                        linkColor={(link: any) => {
                            if (shockActive) return '#EF4444';
                            return link.type === 'MST' ? 'rgba(255,255,255,0.3)' : 'rgba(100,150,255,0.2)';
                        }}
                        linkWidth={link => (link.value as number) * 2} // Thicker for higher correlation
                        nodeCanvasObject={(node, ctx, globalScale) => {
                            // Custom Node Rendering
                            const label = node.id;
                            const fontSize = 12 / globalScale;
                            const isSelected = selectedNode?.id === node.id;

                            // Outer Glow (if shock or selected)
                            if (shockActive && (node.id === 'ICICIBANK.NS' || node.id === 'SBIN.NS')) {
                                ctx.beginPath();
                                ctx.arc(node.x!, node.y!, 8, 0, 2 * Math.PI, false);
                                ctx.fillStyle = 'rgba(239, 68, 68, 0.4)'; // Red danger glow
                                ctx.fill();
                            } else if (isSelected) {
                                ctx.beginPath();
                                ctx.arc(node.x!, node.y!, 8, 0, 2 * Math.PI, false);
                                ctx.fillStyle = 'rgba(58, 111, 248, 0.4)'; // Blue focus glow
                                ctx.fill();
                            }

                            // Main Dot
                            ctx.beginPath();
                            ctx.arc(node.x!, node.y!, 4, 0, 2 * Math.PI, false);
                            ctx.fillStyle = node.color || '#fff';
                            ctx.fill();

                            // Text
                            ctx.font = `${fontSize}px Sans-Serif`;
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillStyle = isSelected ? '#fff' : 'rgba(255,255,255,0.8)';
                            ctx.fillText(label, node.x!, node.y! + 8);
                        }}

                        // Interaction
                        onNodeClick={handleNodeClick}

                        // Particles for shock
                        linkDirectionalParticles={shockActive ? 4 : 0}
                        linkDirectionalParticleSpeed={0.01}
                        linkDirectionalParticleWidth={2}
                        linkDirectionalParticleColor={() => '#EF4444'}
                    />
                </div>

                {/* Sidebar Panel */}
                <div className="w-80 flex flex-col gap-4">
                    {/* Stats Widget */}
                    <div className="p-4 rounded-xl border border-[rgba(100,150,255,0.1)] bg-[rgba(15,23,42,0.4)] backdrop-blur-sm">
                        <h3 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center gap-2">
                            <Info className="size-4 text-[#06B6D4]" /> Topology Metrics
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-400">Critical Cluster</span>
                                <span className="text-red-400 font-mono">{clusterRisk}</span>
                            </div>
                            {/* New Metrics from JSON */}
                            {graphDataRaw.insights.metrics && (
                                <>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-zinc-400">Spectral Radius</span>
                                        <span className="text-purple-400 font-mono">{graphDataRaw.insights.metrics.spectral_radius}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-zinc-400">Avg. Path Length</span>
                                        <span className="text-blue-400 font-mono">{graphDataRaw.insights.metrics.avg_path_length}</span>
                                    </div>
                                </>
                            )}
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-400">HDFC Centrality</span>
                                <span className="text-[#3A6FF8] font-mono">1.00</span>
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Context Panel */}
                    <div className={`flex-1 p-4 rounded-xl border border-[rgba(100,150,255,0.1)] bg-[rgba(15,23,42,0.4)] backdrop-blur-sm transition-all ${selectedNode ? 'opacity-100' : 'opacity-60 grayscale'}`}>
                        <h3 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center gap-2">
                            <ShieldCheck className="size-4 text-[#10B981]" /> Node Analysis
                        </h3>

                        {selectedNode ? (
                            <div className="space-y-4">
                                <div className="text-xl font-bold text-white">{selectedNode.id}</div>

                                <div className="space-y-2">
                                    <div className="text-xs text-zinc-400 uppercase tracking-wider">Contagion Risk</div>
                                    <div className="h-2 w-full bg-zinc-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-red-500"
                                            style={{ width: `${selectedNode.risk_score * 100}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-zinc-300">
                                        <span>Stable</span>
                                        <span>{(selectedNode.risk_score * 100).toFixed(1)}% Critical</span>
                                    </div>
                                </div>

                                {/* Betweenness Centrality Insight if available */}
                                {selectedNode.centrality_between !== undefined && (
                                    <div className="flex justify-between text-xs text-zinc-400 border-b border-white/5 pb-2">
                                        <span>Bridge Score (Betweenness)</span>
                                        <span className="text-white font-mono">{selectedNode.centrality_between.toFixed(4)}</span>
                                    </div>
                                )}

                                <div className="p-3 bg-zinc-900/50 rounded-lg border border-white/5">
                                    <div className="text-xs text-zinc-400 mb-1">Downstream Impact</div>
                                    <div className="text-sm text-zinc-200">
                                        Direct MST links with
                                        <span className="text-[#3A6FF8]"> {data.links.filter(l => (typeof l.source === 'object' ? l.source.id : l.source) === selectedNode.id).length} </span>
                                        nodes.
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-zinc-500 text-sm text-center">
                                Select a node to view <br /> contagion analysis
                            </div>
                        )}
                    </div>
                </div>

            </div>

        </div>
    );
}
