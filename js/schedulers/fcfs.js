/**
 * First Come First Serve (FCFS) Scheduling Algorithm
 * Non-preemptive scheduling based on arrival time
 */
class FCFSScheduler {
    constructor() {
        this.name = "FCFS (First Come First Serve)";
        this.description = "Non-preemptive scheduling where processes are executed in order of arrival";
    }

    /**
     * Execute FCFS scheduling algorithm
     * @param {Array<Process>} processes - Array of processes to schedule
     * @returns {Object} Scheduling result with timeline and metrics
     */
    schedule(processes) {
        // Clone processes to avoid modifying originals
        const processList = processes.map(p => p.clone());

        // Sort by arrival time (FCFS principle)
        processList.sort((a, b) => a.arrivalTime - b.arrivalTime);

        const timeline = [];
        let currentTime = 0;

        for (const process of processList) {
            // If CPU is idle, jump to next process arrival
            if (currentTime < process.arrivalTime) {
                if (currentTime < process.arrivalTime) {
                    // Add idle time to timeline
                    timeline.push({
                        processId: null,
                        start: currentTime,
                        end: process.arrivalTime,
                        isIdle: true
                    });
                    currentTime = process.arrivalTime;
                }
            }

            // Record start time for response time calculation
            if (process.firstExecutionTime === -1) {
                process.firstExecutionTime = currentTime;
                process.responseTime = currentTime - process.arrivalTime;
            }

            // Execute process to completion (non-preemptive)
            const startTime = currentTime;
            const endTime = currentTime + process.burstTime;

            process.completionTime = endTime;
            process.turnaroundTime = process.completionTime - process.arrivalTime;
            process.waitingTime = process.turnaroundTime - process.burstTime;
            process.isCompleted = true;

            // Add to timeline
            timeline.push({
                processId: process.id,
                process: process,
                start: startTime,
                end: endTime,
                isIdle: false
            });

            currentTime = endTime;
        }

        return {
            algorithm: this.name,
            timeline: timeline,
            processes: processList,
            metrics: this.calculateMetrics(processList)
        };
    }

    /**
     * Calculate performance metrics
     */
    calculateMetrics(processes) {
        const completed = processes.filter(p => p.isCompleted);

        if (completed.length === 0) {
            return {
                avgTurnaroundTime: 0,
                avgWaitingTime: 0,
                avgResponseTime: 0,
                totalTime: 0,
                cpuUtilization: 0
            };
        }

        const totalTurnaround = completed.reduce((sum, p) => sum + p.turnaroundTime, 0);
        const totalWaiting = completed.reduce((sum, p) => sum + p.waitingTime, 0);
        const totalResponse = completed.reduce((sum, p) => sum + p.responseTime, 0);
        const totalBurst = completed.reduce((sum, p) => sum + p.burstTime, 0);
        const totalTime = Math.max(...completed.map(p => p.completionTime));

        return {
            avgTurnaroundTime: totalTurnaround / completed.length,
            avgWaitingTime: totalWaiting / completed.length,
            avgResponseTime: totalResponse / completed.length,
            totalTime: totalTime,
            cpuUtilization: (totalBurst / totalTime) * 100,
            throughput: completed.length / totalTime
        };
    }

    /**
     * Get algorithm information
     */
    getInfo() {
        return {
            name: this.name,
            type: "Non-preemptive",
            description: this.description,
            advantages: [
                "Simple to implement and understand",
                "No starvation - every process gets executed eventually",
                "Low overhead - no context switching"
            ],
            disadvantages: [
                "Convoy effect - short processes wait for long ones",
                "Poor average waiting time",
                "Not suitable for time-sharing systems",
                "No consideration for process priority or burst time"
            ],
            useCase: "Best for batch systems where processes are executed in order"
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FCFSScheduler;
}
