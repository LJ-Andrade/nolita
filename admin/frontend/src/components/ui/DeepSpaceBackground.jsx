import { useEffect, useState } from 'react';

const CONFIG = {
	background: {
		gradientStart: '#1d2442ff',
		gradientEnd: '#160b1dff',
	},
	stars: {
		count: 150,
		color: '#205387',
		minSize: 1,
		maxSize: 3,
		minOpacity: 0.4,
		maxOpacity: 1.0,
		twinkleMin: 3,
		twinkleMax: 6,
		drift: 40,
		moveDurationMin: 60,
		moveDurationMax: 100,
	},
	nodes: {
		count: 20,
		color: '#ffffff',
		size: 1.2,
		opacity: 0.4,
		vxMax: 0.6,
		vyMax: 0.6,
	},
	connections: {
		color: '#205387',
		maxDistance: 15,
		maxOpacity: 0.15,
		strokeWidth: 0.5,
	}
};

function DeepSpaceBackground() {
	const [starts, setStars] = useState([]);
	const [nodes, setNodes] = useState([]);

	useEffect(() => {
		const newStars = Array.from({ length: CONFIG.stars.count }).map((_, i) => ({
			id: i,
			x: Math.random() * 100,
			y: Math.random() * 100,
			size: Math.random() * (CONFIG.stars.maxSize - CONFIG.stars.minSize) + CONFIG.stars.minSize,
			opacity: Math.random() * (CONFIG.stars.maxOpacity - CONFIG.stars.minOpacity) + CONFIG.stars.minOpacity,
			twinkleDuration: Math.random() * (CONFIG.stars.twinkleMax - CONFIG.stars.twinkleMin) + CONFIG.stars.twinkleMin,
			driftX: (Math.random() - 0.5) * CONFIG.stars.drift,
			driftY: (Math.random() - 0.5) * CONFIG.stars.drift,
			moveDuration: Math.random() * (CONFIG.stars.moveDurationMax - CONFIG.stars.moveDurationMin) + CONFIG.stars.moveDurationMin,
		}));

		const newNodes = Array.from({ length: CONFIG.nodes.count }).map((_, i) => ({
			id: i,
			x: Math.random() * 100,
			y: Math.random() * 100,
			vx: (Math.random() - 0.5) * CONFIG.nodes.vxMax,
			vy: (Math.random() - 0.5) * CONFIG.nodes.vyMax,
		}));

		setStars(newStars);
		setNodes(newNodes);
	}, []);

	const getConnections = () => {
		const connections = [];
		const maxDist = CONFIG.connections.maxDistance;
		for (let i = 0; i < nodes.length; i++) {
			for (let j = i + 1; j < nodes.length; j++) {
				const dx = nodes[i].x - nodes[j].x;
				const dy = nodes[i].y - nodes[j].y;
				const dist = Math.sqrt(dx * dx + dy * dy);
				if (dist < maxDist) {
					connections.push({
						x1: nodes[i].x,
						y1: nodes[i].y,
						x2: nodes[j].x,
						y2: nodes[j].y,
						opacity: (1 - dist / maxDist) * CONFIG.connections.maxOpacity,
						key: `${i}-${j}`
					});
				}
			}
		}
		return connections;
	};

	return (
		<div className="absolute inset-0 overflow-hidden pointer-events-none" style={{
			background: `linear-gradient(to bottom, ${CONFIG.background.gradientStart}, ${CONFIG.background.gradientEnd})`
		}}>
			<div className="absolute inset-0 z-0" style={{
				background: 'radial-gradient(circle at center, rgba(59,130,246,0.02) 0%, transparent 80%)'
			}} />

			<svg className="absolute inset-0 w-full h-full z-2 opacity-30" style={{ position: 'absolute', width: '300%', height: '300%', left: '-100%', top: '-100%' }}>
				{getConnections().map(conn => (
					<line
						key={conn.key}
						x1={`${conn.x1}%`}
						y1={`${conn.y1}%`}
						x2={`${conn.x2}%`}
						y2={`${conn.y2}%`}
						stroke={CONFIG.connections.color}
						strokeWidth={CONFIG.connections.strokeWidth}
						strokeOpacity={conn.opacity}
					/>
				))}
				{nodes.map(node => (
					<circle
						key={node.id}
						cx={`${node.x}%`}
						cy={`${node.y}%`}
						r={CONFIG.nodes.size}
						fill={CONFIG.nodes.color}
						fillOpacity={CONFIG.nodes.opacity}
						className="animate-node-drift"
						style={{
							'--node-vx': `${node.vx * 100}px`,
							'--node-vy': `${node.vy * 100}px`,
						}}
					/>
				))}
			</svg>

			{starts.map(star => (
				<div
					key={star.id}
					className="absolute rounded-full z-1 animate-star-twinkle"
					style={{
						backgroundColor: CONFIG.stars.color,
						left: `${star.x}%`,
						top: `${star.y}%`,
						width: star.size,
						height: star.size,
						boxShadow: star.size > 1.5 ? `0 0 3px ${CONFIG.stars.color}66` : 'none',
						animationDuration: `${star.twinkleDuration}s`,
						'--drift-x': `${star.driftX}px`,
						'--drift-y': `${star.driftY}px`,
					}}
				/>
			))}
		</div>
	);
}

export default DeepSpaceBackground;