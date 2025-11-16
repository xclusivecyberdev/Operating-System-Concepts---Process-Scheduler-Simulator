/**
 * Gantt Chart Visualization
 * Creates visual timeline representation of process scheduling
 */
class GanttChart {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.colors = [
            '#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0',
            '#00BCD4', '#FFEB3B', '#795548', '#607D8B', '#FF5722'
        ];
    }

    /**
     * Render Gantt chart from timeline
     */
    render(timeline, algorithm = '') {
        if (!this.container) return;

        this.container.innerHTML = '';

        if (!timeline || timeline.length === 0) {
            this.container.innerHTML = '<p class="no-data">No timeline data to display</p>';
            return;
        }

        // Create header
        const header = document.createElement('div');
        header.className = 'gantt-header';
        header.innerHTML = `<h3>Gantt Chart - ${algorithm}</h3>`;
        this.container.appendChild(header);

        // Create chart container
        const chartContainer = document.createElement('div');
        chartContainer.className = 'gantt-chart-container';

        // Calculate scale
        const maxTime = Math.max(...timeline.map(t => t.end));
        const scale = Math.min(800 / maxTime, 40); // Scale to fit, max 40px per unit

        // Create timeline bars
        const chartRow = document.createElement('div');
        chartRow.className = 'gantt-row';

        timeline.forEach(entry => {
            const block = document.createElement('div');
            block.className = 'gantt-block';

            const width = (entry.end - entry.start) * scale;

            if (entry.isIdle) {
                block.classList.add('idle');
                block.style.width = `${width}px`;
                block.innerHTML = `
                    <div class="block-content">
                        <span class="block-label">Idle</span>
                    </div>
                `;
            } else {
                const color = this.colors[(entry.processId - 1) % this.colors.length];
                block.style.backgroundColor = color;
                block.style.width = `${width}px`;

                const queueInfo = entry.queue ? `<br><small>${entry.queue}</small>` : '';

                block.innerHTML = `
                    <div class="block-content">
                        <span class="block-label">P${entry.processId}</span>
                        ${queueInfo}
                    </div>
                `;

                block.title = `Process ${entry.processId}\nTime: ${entry.start} - ${entry.end}\nDuration: ${entry.end - entry.start}${entry.queue ? '\nQueue: ' + entry.queue : ''}`;
            }

            chartRow.appendChild(block);
        });

        chartContainer.appendChild(chartRow);

        // Create time axis
        const timeAxis = document.createElement('div');
        timeAxis.className = 'gantt-time-axis';

        let currentPos = 0;
        timeline.forEach((entry, index) => {
            const width = (entry.end - entry.start) * scale;

            const marker = document.createElement('div');
            marker.className = 'time-marker';
            marker.style.width = `${width}px`;

            if (index === 0) {
                marker.innerHTML = `<span class="time-label">${entry.start}</span>`;
            }

            marker.innerHTML += `<span class="time-label end">${entry.end}</span>`;

            timeAxis.appendChild(marker);
            currentPos += width;
        });

        chartContainer.appendChild(timeAxis);
        this.container.appendChild(chartContainer);

        // Create legend
        this.createLegend(timeline);
    }

    /**
     * Create color legend for processes
     */
    createLegend(timeline) {
        const processes = new Set();
        timeline.forEach(entry => {
            if (!entry.isIdle) {
                processes.add(entry.processId);
            }
        });

        if (processes.size === 0) return;

        const legend = document.createElement('div');
        legend.className = 'gantt-legend';
        legend.innerHTML = '<h4>Process Legend:</h4>';

        const legendItems = document.createElement('div');
        legendItems.className = 'legend-items';

        Array.from(processes).sort((a, b) => a - b).forEach(pid => {
            const color = this.colors[(pid - 1) % this.colors.length];
            const item = document.createElement('div');
            item.className = 'legend-item';
            item.innerHTML = `
                <span class="legend-color" style="background-color: ${color}"></span>
                <span class="legend-label">Process ${pid}</span>
            `;
            legendItems.appendChild(item);
        });

        legend.appendChild(legendItems);
        this.container.appendChild(legend);
    }

    /**
     * Create comparison view with multiple Gantt charts
     */
    renderComparison(results) {
        if (!this.container) return;

        this.container.innerHTML = '';

        const header = document.createElement('div');
        header.className = 'gantt-header';
        header.innerHTML = '<h3>Algorithm Comparison - Gantt Charts</h3>';
        this.container.appendChild(header);

        results.forEach((result, index) => {
            const section = document.createElement('div');
            section.className = 'comparison-section';

            const sectionHeader = document.createElement('h4');
            sectionHeader.textContent = result.algorithm;
            section.appendChild(sectionHeader);

            const tempContainer = document.createElement('div');
            tempContainer.id = `temp-gantt-${index}`;
            section.appendChild(tempContainer);

            this.container.appendChild(section);

            // Temporarily set container and render
            const originalContainer = this.container;
            this.container = tempContainer;
            this.render(result.timeline, '');
            this.container = originalContainer;
        });
    }

    /**
     * Create interactive timeline with process details
     */
    renderInteractive(timeline, processes, algorithm = '') {
        if (!this.container) return;

        this.container.innerHTML = '';

        if (!timeline || timeline.length === 0) {
            this.container.innerHTML = '<p class="no-data">No timeline data to display</p>';
            return;
        }

        // Create header
        const header = document.createElement('div');
        header.className = 'gantt-header';
        header.innerHTML = `
            <h3>Interactive Gantt Chart - ${algorithm}</h3>
            <p class="chart-info">Hover over blocks for details, click for process information</p>
        `;
        this.container.appendChild(header);

        // Create main chart
        this.render(timeline, '');

        // Add process details section
        const detailsSection = document.createElement('div');
        detailsSection.className = 'process-details';
        detailsSection.id = 'process-details';
        detailsSection.innerHTML = '<p>Click on a process in the Gantt chart to see details</p>';
        this.container.appendChild(detailsSection);

        // Add click handlers to blocks
        const blocks = this.container.querySelectorAll('.gantt-block:not(.idle)');
        blocks.forEach(block => {
            block.style.cursor = 'pointer';
            block.addEventListener('click', (e) => {
                const processId = parseInt(block.querySelector('.block-label').textContent.replace('P', ''));
                this.showProcessDetails(processId, processes);
            });
        });
    }

    /**
     * Show detailed information for a process
     */
    showProcessDetails(processId, processes) {
        const process = processes.find(p => p.id === processId);
        if (!process) return;

        const detailsSection = document.getElementById('process-details');
        if (!detailsSection) return;

        detailsSection.innerHTML = `
            <h4>Process ${process.id} Details</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Arrival Time:</span>
                    <span class="detail-value">${process.arrivalTime}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Burst Time:</span>
                    <span class="detail-value">${process.burstTime}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Priority:</span>
                    <span class="detail-value">${process.priority}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Completion Time:</span>
                    <span class="detail-value">${process.completionTime}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Turnaround Time:</span>
                    <span class="detail-value">${process.turnaroundTime}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Waiting Time:</span>
                    <span class="detail-value">${process.waitingTime}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Response Time:</span>
                    <span class="detail-value">${process.responseTime}</span>
                </div>
            </div>
        `;
    }

    /**
     * Export Gantt chart as image (canvas-based)
     */
    exportAsImage() {
        // This would require a canvas implementation
        // Simplified version - could be enhanced
        console.log('Export functionality would be implemented here');
    }

    /**
     * Clear the Gantt chart
     */
    clear() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GanttChart;
}
