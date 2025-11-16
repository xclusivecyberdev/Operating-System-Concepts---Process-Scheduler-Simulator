/**
 * User Interface Controller
 * Manages all UI interactions and coordination between components
 */
class UIController {
    constructor() {
        this.processBuilder = new ProcessBuilder();
        this.ganttChart = new GanttChart('gantt-container');
        this.currentResult = null;
        this.comparisonResults = [];
    }

    /**
     * Initialize the UI
     */
    init() {
        this.setupEventListeners();
        this.loadExampleScenario('default');
        this.updateProcessTable();
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Add process button
        document.getElementById('add-process')?.addEventListener('click', () => {
            this.addProcess();
        });

        // Clear processes button
        document.getElementById('clear-processes')?.addEventListener('click', () => {
            this.clearProcesses();
        });

        // Run simulation button
        document.getElementById('run-simulation')?.addEventListener('click', () => {
            this.runSimulation();
        });

        // Compare algorithms button
        document.getElementById('compare-algorithms')?.addEventListener('click', () => {
            this.compareAlgorithms();
        });

        // Algorithm selection change
        document.getElementById('algorithm-select')?.addEventListener('change', (e) => {
            this.onAlgorithmChange(e.target.value);
        });

        // Load example scenarios
        document.getElementById('load-example')?.addEventListener('click', () => {
            const scenario = document.getElementById('example-select')?.value || 'default';
            this.loadExampleScenario(scenario);
        });

        // Random process generation
        document.getElementById('generate-random')?.addEventListener('click', () => {
            this.generateRandomProcesses();
        });

        // Enter key on process inputs
        const inputs = ['arrival-time', 'burst-time', 'priority'];
        inputs.forEach(id => {
            document.getElementById(id)?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addProcess();
                }
            });
        });
    }

    /**
     * Add a new process
     */
    addProcess() {
        const arrivalTime = parseInt(document.getElementById('arrival-time')?.value) || 0;
        const burstTime = parseInt(document.getElementById('burst-time')?.value) || 1;
        const priority = parseInt(document.getElementById('priority')?.value) || 0;

        if (burstTime <= 0) {
            alert('Burst time must be greater than 0');
            return;
        }

        this.processBuilder.addProcess(arrivalTime, burstTime, priority);
        this.updateProcessTable();

        // Clear inputs
        document.getElementById('arrival-time').value = '';
        document.getElementById('burst-time').value = '';
        document.getElementById('priority').value = '0';
        document.getElementById('arrival-time').focus();
    }

    /**
     * Clear all processes
     */
    clearProcesses() {
        this.processBuilder.clear();
        this.updateProcessTable();
        this.ganttChart.clear();
        document.getElementById('metrics-container').innerHTML = '';
        document.getElementById('comparison-container').innerHTML = '';
    }

    /**
     * Update the process table display
     */
    updateProcessTable() {
        const tbody = document.getElementById('process-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        const processes = this.processBuilder.getProcesses();

        if (processes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="no-data">No processes added</td></tr>';
            return;
        }

        processes.forEach((p, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>P${p.id}</td>
                <td>${p.arrivalTime}</td>
                <td>${p.burstTime}</td>
                <td>${p.priority}</td>
                <td>
                    <button class="btn-small btn-danger" onclick="uiController.removeProcess(${index})">
                        Remove
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    /**
     * Remove a process
     */
    removeProcess(index) {
        this.processBuilder.processes.splice(index, 1);
        this.updateProcessTable();
    }

    /**
     * Run simulation with selected algorithm
     */
    runSimulation() {
        const processes = this.processBuilder.getProcesses();

        if (processes.length === 0) {
            alert('Please add at least one process');
            return;
        }

        const algorithmType = document.getElementById('algorithm-select')?.value;
        const scheduler = this.createScheduler(algorithmType);

        if (!scheduler) {
            alert('Please select an algorithm');
            return;
        }

        // Run scheduling
        this.currentResult = scheduler.schedule(processes);

        // Display results
        this.displayResults(this.currentResult);
    }

    /**
     * Create scheduler based on algorithm type
     */
    createScheduler(algorithmType) {
        const quantum = parseInt(document.getElementById('quantum')?.value) || 4;

        switch (algorithmType) {
            case 'fcfs':
                return new FCFSScheduler();
            case 'sjf':
                return new SJFScheduler(false);
            case 'srtf':
                return new SJFScheduler(true);
            case 'priority':
                return new PriorityScheduler(false);
            case 'priority-preemptive':
                return new PriorityScheduler(true);
            case 'rr':
                return new RoundRobinScheduler(quantum);
            case 'mlq':
                return new MultilevelQueueScheduler();
            case 'mlfq':
                return new MLFQScheduler();
            default:
                return null;
        }
    }

    /**
     * Display scheduling results
     */
    displayResults(result) {
        // Display Gantt chart
        this.ganttChart.renderInteractive(result.timeline, result.processes, result.algorithm);

        // Display metrics
        this.displayMetrics(result);

        // Show results section
        document.getElementById('results-section')?.classList.remove('hidden');
    }

    /**
     * Display performance metrics
     */
    displayMetrics(result) {
        const container = document.getElementById('metrics-container');
        if (!container) return;

        const metrics = MetricsCalculator.calculateMetrics(result.processes, result.timeline);
        const formatted = MetricsCalculator.formatMetrics(metrics);

        container.innerHTML = `
            <h3>Performance Metrics</h3>

            <div class="metrics-grid">
                <div class="metric-card">
                    <h4>System Metrics</h4>
                    <table class="metrics-table">
                        ${Object.entries(formatted.system).map(([key, value]) => `
                            <tr>
                                <td>${key}</td>
                                <td class="metric-value">${value}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>

                <div class="metric-card">
                    <h4>Process Metrics</h4>
                    <div class="table-scroll">
                        <table class="metrics-table">
                            <thead>
                                <tr>
                                    <th>Process</th>
                                    <th>AT</th>
                                    <th>BT</th>
                                    <th>CT</th>
                                    <th>TAT</th>
                                    <th>WT</th>
                                    <th>RT</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${formatted.process.map(p => `
                                    <tr>
                                        <td>P${p.processId}</td>
                                        <td>${p.arrivalTime}</td>
                                        <td>${p.burstTime}</td>
                                        <td>${p.completionTime}</td>
                                        <td>${p.turnaroundTime}</td>
                                        <td>${p.waitingTime}</td>
                                        <td>${p.responseTime}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    <p class="table-legend">
                        AT: Arrival Time, BT: Burst Time, CT: Completion Time,
                        TAT: Turnaround Time, WT: Waiting Time, RT: Response Time
                    </p>
                </div>
            </div>
        `;
    }

    /**
     * Compare multiple algorithms
     */
    compareAlgorithms() {
        const processes = this.processBuilder.getProcesses();

        if (processes.length === 0) {
            alert('Please add at least one process');
            return;
        }

        const algorithms = [
            { name: 'FCFS', scheduler: new FCFSScheduler() },
            { name: 'SJF', scheduler: new SJFScheduler(false) },
            { name: 'SRTF', scheduler: new SJFScheduler(true) },
            { name: 'Priority (NP)', scheduler: new PriorityScheduler(false) },
            { name: 'Priority (P)', scheduler: new PriorityScheduler(true) },
            { name: 'Round Robin', scheduler: new RoundRobinScheduler(4) },
            { name: 'MLFQ', scheduler: new MLFQScheduler() }
        ];

        this.comparisonResults = algorithms.map(alg => {
            return alg.scheduler.schedule(processes);
        });

        this.displayComparison(this.comparisonResults);
    }

    /**
     * Display algorithm comparison
     */
    displayComparison(results) {
        const container = document.getElementById('comparison-container');
        if (!container) return;

        container.innerHTML = '<h3>Algorithm Comparison</h3>';

        // Show comparison metrics
        const comparison = MetricsCalculator.compareAlgorithms(results);

        const table = document.createElement('table');
        table.className = 'comparison-table';

        table.innerHTML = `
            <thead>
                <tr>
                    <th>Algorithm</th>
                    <th>Avg TAT</th>
                    <th>Avg WT</th>
                    <th>Avg RT</th>
                    <th>CPU Util</th>
                    <th>Context Switches</th>
                </tr>
            </thead>
            <tbody>
                ${comparison.algorithms.map((alg, i) => `
                    <tr>
                        <td><strong>${alg}</strong></td>
                        <td ${comparison.best.avgTurnaroundTime === alg ? 'class="best-metric"' : ''}>
                            ${comparison.metrics.avgTurnaroundTime[i].toFixed(2)}
                        </td>
                        <td ${comparison.best.avgWaitingTime === alg ? 'class="best-metric"' : ''}>
                            ${comparison.metrics.avgWaitingTime[i].toFixed(2)}
                        </td>
                        <td ${comparison.best.avgResponseTime === alg ? 'class="best-metric"' : ''}>
                            ${comparison.metrics.avgResponseTime[i].toFixed(2)}
                        </td>
                        <td ${comparison.best.cpuUtilization === alg ? 'class="best-metric"' : ''}>
                            ${comparison.metrics.cpuUtilization[i].toFixed(2)}%
                        </td>
                        <td ${comparison.best.contextSwitches === alg ? 'class="best-metric"' : ''}>
                            ${comparison.metrics.contextSwitches[i]}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;

        container.appendChild(table);

        // Show Gantt chart comparison
        this.ganttChart.renderComparison(results);

        // Show results section
        document.getElementById('results-section')?.classList.remove('hidden');
    }

    /**
     * Handle algorithm selection change
     */
    onAlgorithmChange(algorithmType) {
        const quantumContainer = document.getElementById('quantum-container');
        if (!quantumContainer) return;

        // Show quantum input only for Round Robin
        if (algorithmType === 'rr') {
            quantumContainer.classList.remove('hidden');
        } else {
            quantumContainer.classList.add('hidden');
        }
    }

    /**
     * Load example scenario
     */
    loadExampleScenario(scenario) {
        this.processBuilder.clear();

        const scenarios = {
            'default': [
                { arrivalTime: 0, burstTime: 5, priority: 2 },
                { arrivalTime: 1, burstTime: 3, priority: 1 },
                { arrivalTime: 2, burstTime: 8, priority: 3 },
                { arrivalTime: 3, burstTime: 6, priority: 2 }
            ],
            'convoy': [
                { arrivalTime: 0, burstTime: 24, priority: 2 },
                { arrivalTime: 1, burstTime: 3, priority: 1 },
                { arrivalTime: 2, burstTime: 3, priority: 1 }
            ],
            'starvation': [
                { arrivalTime: 0, burstTime: 4, priority: 0 },
                { arrivalTime: 1, burstTime: 2, priority: 0 },
                { arrivalTime: 2, burstTime: 8, priority: 2 },
                { arrivalTime: 3, burstTime: 1, priority: 0 },
                { arrivalTime: 4, burstTime: 3, priority: 1 }
            ],
            'mixed': [
                { arrivalTime: 0, burstTime: 10, priority: 2 },
                { arrivalTime: 1, burstTime: 1, priority: 0 },
                { arrivalTime: 2, burstTime: 2, priority: 1 },
                { arrivalTime: 3, burstTime: 1, priority: 0 },
                { arrivalTime: 4, burstTime: 5, priority: 2 }
            ]
        };

        const processArray = scenarios[scenario] || scenarios['default'];
        this.processBuilder.addProcesses(processArray);
        this.updateProcessTable();
    }

    /**
     * Generate random processes
     */
    generateRandomProcesses() {
        const count = parseInt(prompt('How many random processes to generate?', '5')) || 5;
        this.processBuilder.generateRandomProcesses(count, 10, 15, 3);
        this.updateProcessTable();
    }
}

// Global instance
let uiController;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    uiController = new UIController();
    uiController.init();
});
