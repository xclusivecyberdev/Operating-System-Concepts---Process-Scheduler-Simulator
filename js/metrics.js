/**
 * Performance Metrics Calculator
 * Calculates and formats various scheduling performance metrics
 */
class MetricsCalculator {
    /**
     * Calculate comprehensive metrics for a set of processes
     */
    static calculateMetrics(processes, timeline) {
        const completed = processes.filter(p => p.isCompleted);

        if (completed.length === 0) {
            return {
                processMetrics: [],
                systemMetrics: {
                    avgTurnaroundTime: 0,
                    avgWaitingTime: 0,
                    avgResponseTime: 0,
                    totalTime: 0,
                    cpuUtilization: 0,
                    throughput: 0,
                    contextSwitches: 0
                }
            };
        }

        // Calculate per-process metrics
        const processMetrics = completed.map(p => ({
            processId: p.id,
            arrivalTime: p.arrivalTime,
            burstTime: p.burstTime,
            priority: p.priority,
            completionTime: p.completionTime,
            turnaroundTime: p.turnaroundTime,
            waitingTime: p.waitingTime,
            responseTime: p.responseTime,
            normalizedTurnaround: p.turnaroundTime / p.burstTime
        }));

        // Calculate system-wide metrics
        const totalTurnaround = completed.reduce((sum, p) => sum + p.turnaroundTime, 0);
        const totalWaiting = completed.reduce((sum, p) => sum + p.waitingTime, 0);
        const totalResponse = completed.reduce((sum, p) => sum + p.responseTime, 0);
        const totalBurst = completed.reduce((sum, p) => sum + p.burstTime, 0);
        const totalTime = Math.max(...completed.map(p => p.completionTime), 0);

        // Count context switches
        const contextSwitches = this.countContextSwitches(timeline);

        const systemMetrics = {
            avgTurnaroundTime: totalTurnaround / completed.length,
            avgWaitingTime: totalWaiting / completed.length,
            avgResponseTime: totalResponse / completed.length,
            totalTime: totalTime,
            cpuUtilization: totalTime > 0 ? (totalBurst / totalTime) * 100 : 0,
            throughput: totalTime > 0 ? completed.length / totalTime : 0,
            contextSwitches: contextSwitches,
            totalProcesses: processes.length,
            completedProcesses: completed.length
        };

        return {
            processMetrics,
            systemMetrics
        };
    }

    /**
     * Count context switches in timeline
     */
    static countContextSwitches(timeline) {
        let switches = 0;
        let lastProcess = null;

        timeline.forEach(entry => {
            if (!entry.isIdle && entry.processId !== lastProcess) {
                if (lastProcess !== null) {
                    switches++;
                }
                lastProcess = entry.processId;
            }
        });

        return switches;
    }

    /**
     * Format metrics for display
     */
    static formatMetrics(metrics) {
        const { processMetrics, systemMetrics } = metrics;

        return {
            process: processMetrics.map(p => ({
                ...p,
                turnaroundTime: p.turnaroundTime.toFixed(2),
                waitingTime: p.waitingTime.toFixed(2),
                responseTime: p.responseTime.toFixed(2),
                normalizedTurnaround: p.normalizedTurnaround.toFixed(2)
            })),
            system: {
                'Average Turnaround Time': systemMetrics.avgTurnaroundTime.toFixed(2),
                'Average Waiting Time': systemMetrics.avgWaitingTime.toFixed(2),
                'Average Response Time': systemMetrics.avgResponseTime.toFixed(2),
                'CPU Utilization': systemMetrics.cpuUtilization.toFixed(2) + '%',
                'Throughput': systemMetrics.throughput.toFixed(4) + ' processes/unit',
                'Total Time': systemMetrics.totalTime.toFixed(2),
                'Context Switches': systemMetrics.contextSwitches,
                'Completed Processes': `${systemMetrics.completedProcesses}/${systemMetrics.totalProcesses}`
            }
        };
    }

    /**
     * Compare metrics between different algorithms
     */
    static compareAlgorithms(results) {
        const comparison = {
            algorithms: [],
            metrics: {}
        };

        results.forEach(result => {
            comparison.algorithms.push(result.algorithm);

            const metrics = this.calculateMetrics(result.processes, result.timeline);

            if (!comparison.metrics.avgTurnaroundTime) {
                comparison.metrics.avgTurnaroundTime = [];
                comparison.metrics.avgWaitingTime = [];
                comparison.metrics.avgResponseTime = [];
                comparison.metrics.cpuUtilization = [];
                comparison.metrics.throughput = [];
                comparison.metrics.contextSwitches = [];
            }

            comparison.metrics.avgTurnaroundTime.push(metrics.systemMetrics.avgTurnaroundTime);
            comparison.metrics.avgWaitingTime.push(metrics.systemMetrics.avgWaitingTime);
            comparison.metrics.avgResponseTime.push(metrics.systemMetrics.avgResponseTime);
            comparison.metrics.cpuUtilization.push(metrics.systemMetrics.cpuUtilization);
            comparison.metrics.throughput.push(metrics.systemMetrics.throughput);
            comparison.metrics.contextSwitches.push(metrics.systemMetrics.contextSwitches);
        });

        // Find best algorithm for each metric
        comparison.best = {
            avgTurnaroundTime: comparison.algorithms[
                comparison.metrics.avgTurnaroundTime.indexOf(
                    Math.min(...comparison.metrics.avgTurnaroundTime)
                )
            ],
            avgWaitingTime: comparison.algorithms[
                comparison.metrics.avgWaitingTime.indexOf(
                    Math.min(...comparison.metrics.avgWaitingTime)
                )
            ],
            avgResponseTime: comparison.algorithms[
                comparison.metrics.avgResponseTime.indexOf(
                    Math.min(...comparison.metrics.avgResponseTime)
                )
            ],
            cpuUtilization: comparison.algorithms[
                comparison.metrics.cpuUtilization.indexOf(
                    Math.max(...comparison.metrics.cpuUtilization)
                )
            ],
            throughput: comparison.algorithms[
                comparison.metrics.throughput.indexOf(
                    Math.max(...comparison.metrics.throughput)
                )
            ],
            contextSwitches: comparison.algorithms[
                comparison.metrics.contextSwitches.indexOf(
                    Math.min(...comparison.metrics.contextSwitches)
                )
            ]
        };

        return comparison;
    }

    /**
     * Generate detailed report
     */
    static generateReport(result) {
        const metrics = this.calculateMetrics(result.processes, result.timeline);
        const formatted = this.formatMetrics(metrics);

        return {
            algorithm: result.algorithm,
            processTable: formatted.process,
            systemMetrics: formatted.system,
            timeline: result.timeline,
            totalProcesses: result.processes.length
        };
    }

    /**
     * Calculate CPU idle time
     */
    static calculateIdleTime(timeline) {
        return timeline
            .filter(entry => entry.isIdle)
            .reduce((sum, entry) => sum + (entry.end - entry.start), 0);
    }

    /**
     * Get timeline statistics
     */
    static getTimelineStats(timeline) {
        const processExecutions = {};
        let totalExecutionTime = 0;
        const idleTime = this.calculateIdleTime(timeline);

        timeline.forEach(entry => {
            if (!entry.isIdle) {
                const duration = entry.end - entry.start;
                totalExecutionTime += duration;

                if (!processExecutions[entry.processId]) {
                    processExecutions[entry.processId] = {
                        count: 0,
                        totalTime: 0
                    };
                }

                processExecutions[entry.processId].count++;
                processExecutions[entry.processId].totalTime += duration;
            }
        });

        return {
            totalExecutionTime,
            idleTime,
            processExecutions,
            totalTimelineLength: timeline.length > 0 ?
                timeline[timeline.length - 1].end - timeline[0].start : 0
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MetricsCalculator;
}
