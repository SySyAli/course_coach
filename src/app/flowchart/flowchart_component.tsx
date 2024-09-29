/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as d3 from "d3";
import { HierarchyPointNode, HierarchyPointLink } from "d3-hierarchy";

export function createTreeChart(data: any) {
	const container = document.getElementById("flowchart");
	if (!container) return;

	const width = 1200;
	const height = 1000;
	const nodeRadius = 30;

	// Clear any existing SVGs
	d3.select("#flowchart").select("svg").remove();

	// Create the SVG canvas
	const svg = d3
		.select("#flowchart")
		.append("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("transform", "translate(50, 50)");

	// Create a scrollable group
	const scrollGroup = svg.append("g").attr("class", "scroll-group");

	// Prepare hierarchical data
	const root = d3
		.stratify()
		.id((d: any) => d.__catalogCourseId)
		.parentId((d: any) => {
			// The parent is either the first prerequisite or null if there are none
			return d.subjectCode.prerequisites &&
				d.subjectCode.prerequisites.length > 0
				? d.subjectCode.prerequisites[0]
				: null;
		})(data);

	// Create the tree layout
	const treeLayout = d3.tree().size([height - 100, width - 200]);

	// Generate the tree data
	const treeData = treeLayout(root);

	// Add links
	const link = scrollGroup
		.selectAll(".link")
		.data(treeData.links())
		.enter()
		.append("path")
		.attr("class", "link")
		.attr(
			"d",
			d3
				.linkHorizontal<HierarchyPointLink<any>, HierarchyPointNode<any>>()
				.x((d: any) => d.target.y)
				.y((d: HierarchyPointNode<any>) => d.x)
		)
		.attr("stroke", "#999")
		.attr("stroke-width", 2)
		.attr("fill", "none");

	// Add nodes
	const node = scrollGroup
		.selectAll(".node")
		.data(treeData.descendants())
		.enter()
		.append("g")
		.attr("class", "node")
		.attr("transform", (d: any) => `translate(${d.y},${d.x})`);

	// Append circles for nodes
	node
		.append("circle")
		.attr("r", nodeRadius)
		.attr("fill", "#4e79a7")
		.attr("stroke", "#fff")
		.attr("stroke-width", 2);

	// Add course IDs as text inside the circles
	node
		.append("text")
		.attr("dy", ".35em")
		.attr("x", (d: any) => (d.children ? -15 : 15)) // Position text based on children
		.style("text-anchor", (d: any) => (d.children ? "end" : "start"))
		.text((d: any) => d.data.__catalogCourseId)
		.style("fill", "white")
		.style("font-size", "10px");

	// Tooltip for course details
	node.append("title").text((d: any) => d.data.title);
}
