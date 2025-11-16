/**
 * Process class representing a single process in the scheduling simulator
 */
class Process {
    constructor(id, arrivalTime, burstTime, priority = 0) {
        this.id = id;
        this.arrivalTime = arrivalTime;
        this.burstTime = burstTime;
        this.remainingTime = burstTime;
        this.priority = priority;

        // Metrics
        this.completionTime = 0;
        this.turnaroundTime = 0;
        this.waitingTime = 0;
        this.responseTime = -1; // -1 indicates not yet started
        this.firstExecutionTime = -1;

        // Execution tracking
        this.executionHistory = []; // Array of {start, end} time intervals
        this.currentQueue = 0; // For multilevel queue scheduling
        this.quantumUsed = 0; // For round robin tracking

        // State
        this.isCompleted = false;
        this.isExecuting = false;
    }

    /**
     * Create a copy of this process (useful for comparison runs)
     */
    clone() {
        const cloned = new Process(this.id, this.arrivalTime, this.burstTime, this.priority);
        return cloned;
    }

    /**
     * Execute the process for a given time duration
     */
    execute(currentTime, duration) {
        if (this.firstExecutionTime === -1) {
            this.firstExecutionTime = currentTime;
            this.responseTime = currentTime - this.arrivalTime;
        }

        this.remainingTime -= duration;
        this.isExecuting = true;

        if (this.remainingTime <= 0) {
            this.isCompleted = true;
            this.completionTime = currentTime + duration + this.remainingTime; // Adjust for overshoot
            this.turnaroundTime = this.completionTime - this.arrivalTime;
            this.waitingTime = this.turnaroundTime - this.burstTime;
        }
    }

    /**
     * Record an execution interval for Gantt chart
     */
    addExecutionInterval(start, end) {
        this.executionHistory.push({ start, end, processId: this.id });
    }

    /**
     * Reset process to initial state
     */
    reset() {
        this.remainingTime = this.burstTime;
        this.completionTime = 0;
        this.turnaroundTime = 0;
        this.waitingTime = 0;
        this.responseTime = -1;
        this.firstExecutionTime = -1;
        this.executionHistory = [];
        this.currentQueue = 0;
        this.quantumUsed = 0;
        this.isCompleted = false;
        this.isExecuting = false;
    }

    /**
     * Check if process has arrived at given time
     */
    hasArrived(currentTime) {
        return this.arrivalTime <= currentTime;
    }

    /**
     * Get process info as object
     */
    getInfo() {
        return {
            id: this.id,
            arrivalTime: this.arrivalTime,
            burstTime: this.burstTime,
            priority: this.priority,
            completionTime: this.completionTime,
            turnaroundTime: this.turnaroundTime,
            waitingTime: this.waitingTime,
            responseTime: this.responseTime
        };
    }

    /**
     * String representation of process
     */
    toString() {
        return `P${this.id} (AT: ${this.arrivalTime}, BT: ${this.burstTime}, Priority: ${this.priority})`;
    }
}

/**
 * Process Builder for easier process creation
 */
class ProcessBuilder {
    constructor() {
        this.processes = [];
        this.nextId = 1;
    }

    /**
     * Add a new process
     */
    addProcess(arrivalTime, burstTime, priority = 0) {
        const process = new Process(this.nextId++, arrivalTime, burstTime, priority);
        this.processes.push(process);
        return process;
    }

    /**
     * Add multiple processes from array
     */
    addProcesses(processArray) {
        processArray.forEach(p => {
            this.addProcess(p.arrivalTime, p.burstTime, p.priority || 0);
        });
    }

    /**
     * Get all processes
     */
    getProcesses() {
        return this.processes;
    }

    /**
     * Clone all processes (for running multiple algorithms)
     */
    cloneProcesses() {
        return this.processes.map(p => p.clone());
    }

    /**
     * Clear all processes
     */
    clear() {
        this.processes = [];
        this.nextId = 1;
    }

    /**
     * Generate random processes for testing
     */
    generateRandomProcesses(count, maxArrival = 10, maxBurst = 20, maxPriority = 5) {
        this.clear();
        for (let i = 0; i < count; i++) {
            const arrival = Math.floor(Math.random() * maxArrival);
            const burst = Math.floor(Math.random() * maxBurst) + 1;
            const priority = Math.floor(Math.random() * maxPriority);
            this.addProcess(arrival, burst, priority);
        }
        return this.processes;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Process, ProcessBuilder };
}
