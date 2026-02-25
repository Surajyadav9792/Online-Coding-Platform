

const { Queue, QueueEvents } = require('bullmq');
const IORedis = require('ioredis');

// Redis connection for BullMQ (using ioredis)
// Uses environment variables if available, otherwise falls back to defaults
// Note: For production, set REDIS_HOST, REDIS_PORT, REDIS_USERNAME, REDIS_PASSWORD in .env
// const redisConnection = new IORedis({
//   host: process.env.REDIS_HOST || 'redis-15072.c12.us-east-1-4.ec2.cloud.redislabs.com',
//   port: Number(process.env.REDIS_PORT) || 15072,
//   username: process.env.REDIS_USERNAME || 'default',
//   password: process.env.REDIS_PASSWORD || '9gpSO1axx9Q5QWOKJ3owi0cA9cs8ZAXw',
//   maxRetriesPerRequest: null,
//   enableReadyCheck: true,
//   retryStrategy: (times) => {
//     const delay = Math.min(times * 50, 2000);
//     return delay;
//   },
//   reconnectOnError: (err) => {
//     const targetError = 'READONLY';
//     if (err.message.includes(targetError)) {
//       return true; // Reconnect on READONLY error
//     }
//     return false;
//   },
// });
// ---- Update this block in problemUtility.js ----
const redisConnection = new IORedis({
  host: '127.0.0.1', // Change from Cloud to Local
  port: 6379,        // Change to default Local port
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});
const QUEUE_NAME = process.env.QUEUE_NAME || 'submissions';

// Initialize Queue and QueueEvents
const queue = new Queue(QUEUE_NAME, { connection: redisConnection });
let queueEvents = null;

// Initialize QueueEvents (lazy initialization)
function getQueueEvents() {
  if (!queueEvents) {
    queueEvents = new QueueEvents(QUEUE_NAME, { connection: redisConnection });
  }
  return queueEvents;
}

// Map user language input to worker-expected language strings
const getLanguageId = (lang) => {
  const languageMap = {
    "c++": "cpp",
    "java": "java",
    "javascript": "node",
    "node": "node",
    "nodejs": "node",
  };
  return languageMap[lang.toLowerCase()] || lang.toLowerCase();
};

// Map worker status to Judge0-compatible status_id
const mapStatusToId = (status) => {
  const statusMap = {
    'Accepted': 3,
    'Wrong Answer': 4,
    'TLE': 5,
    'Runtime Error': 12, // Runtime Error (Other)
  };
  return statusMap[status] || 13; // Default to Internal Error if unknown
};

// How long to wait for BullMQ jobs to finish (per job) before treating as timeout.
// Use env override if provided, otherwise fall back to 5 minutes to allow for
// multiple testcases processed sequentially by a single worker.
const JOB_WAIT_TIMEOUT_MS = Number(process.env.JOB_WAIT_TIMEOUT_MS) || 300000;

// Submit batch of test cases to the queue
const submitBatch = async (submission) => {
  try {
    // Ensure Queue and QueueEvents are initialized and connected
    await queue.waitUntilReady();
    const events = getQueueEvents();
    await events.waitUntilReady();

    // Add each submission as a job to the queue
    const jobs = [];
    for (const sub of submission) {
      const language = getLanguageId(sub.language || 'node');
      
      // Map Judge0 format to worker format
      const jobData = {
        language: language,
        sourceCode: sub.source_code,
        stdin: sub.stdin || '',
        expectedOutput: sub.expected_output,
      };

      const job = await queue.add('run-submission', jobData, {
        attempts: 1,
        timeout: 30000, // 30 second timeout per job
      });

      jobs.push({
        job,
        token: job.id, // Use job ID as token for compatibility
      });
    }

    // Return tokens (job IDs) for compatibility with existing code
    return jobs.map(j => ({ token: j.token }));
  } catch (error) {
    console.error('BullMQ Error in submitBatch:', error);
    throw new Error('Failed to submit jobs to queue');
  }
};

// Wait for jobs to complete and return results
const submitoken = async (resultoken) => {
  try {
    // Ensure both queue and events are fully connected
    await queue.waitUntilReady();
    const events = getQueueEvents();
    await events.waitUntilReady();

    // Convert tokens (job IDs) to numbers if they're strings
    const jobIds = resultoken.map(token => String(token));

    // Wait for all jobs to complete
    const results = await Promise.all(
      jobIds.map(async (jobId) => {
        try {
          const job = await queue.getJob(jobId);
          
          if (!job) {
            return {
              token: jobId,
              status_id: 13, // Internal Error
              stdout: '',
              stderr: 'Job not found',
            };
          }

          // Wait for job to complete (with generous timeout so multiple tests
          // can run sequentially without spurious timeouts)
          const result = await job.waitUntilFinished(events, JOB_WAIT_TIMEOUT_MS);

          // Map worker result format to Judge0-compatible format
          return {
            token: jobId,
            status_id: mapStatusToId(result.status),
            stdout: result.output || '',
            stderr: result.stderr || '',
            time: result.execution_time ? `${(result.execution_time / 1000).toFixed(3)}` : '0.000',
            memory: null, // Worker doesn't provide memory info
          };
        } catch (error) {
          console.error(`Error waiting for job ${jobId}:`, error);

          // If BullMQ timed out waiting for the completion event, treat as TLE
          // instead of a generic Internal Error. This usually means the worker
          // never reported completion (e.g., infinite loop / hung job).
          if (
            typeof error?.message === 'string' &&
            error.message.includes('timed out before finishing')
          ) {
            return {
              token: jobId,
              status_id: 5, // Time Limit Exceeded
              stdout: '',
              stderr: error.message,
            };
          }
          
          // Check if job exists and get its state
          const job = await queue.getJob(jobId);
          if (job) {
            const state = await job.getState();

            // If the job actually completed but we missed the event, try to
            // recover the result from the stored returnvalue.
            if (state === 'completed' && job.returnvalue) {
              const result = job.returnvalue;
              return {
                token: jobId,
                status_id: mapStatusToId(result.status),
                stdout: result.output || '',
                stderr: result.stderr || '',
                time: result.execution_time ? `${(result.execution_time / 1000).toFixed(3)}` : '0.000',
                memory: null,
              };
            }

            if (state === 'failed') {
              const failedReason = job.failedReason || 'Unknown error';
              return {
                token: jobId,
                status_id: 13, // Internal Error
                stdout: '',
                stderr: failedReason,
              };
            }
          }

          return {
            token: jobId,
            status_id: 13, // Internal Error
            stdout: '',
            stderr: error.message || 'Job execution failed',
          };
        }
      })
    );

    return results;
  } catch (error) {
    console.error('BullMQ Error in submitoken:', error);
    throw new Error('Failed to retrieve job results');
  }
};

// Status mapping for error messages (keeping for compatibility)
const checkstatus = [
  {
    "id": 1,
    "description": "In Queue"
  },
  {
    "id": 2,
    "description": "Processing"
  },
  {
    "id": 3,
    "description": "Accepted"
  },
  {
    "id": 4,
    "description": "Wrong Answer"
  },
  {
    "id": 5,
    "description": "Time Limit Exceeded"
  },
  {
    "id": 6,
    "description": "Compilation Error"
  },
  {
    "id": 7,
    "description": "Runtime Error (SIGSEGV)"
  },
  {
    "id": 8,
    "description": "Runtime Error (SIGXFSZ)"
  },
  {
    "id": 9,
    "description": "Runtime Error (SIGFPE)"
  },
  {
    "id": 10,
    "description": "Runtime Error (SIGABRT)"
  },
  {
    "id": 11,
    "description": "Runtime Error (NZEC)"
  },
  {
    "id": 12,
    "description": "Runtime Error (Other)"
  },
  {
    "id": 13,
    "description": "Internal Error"
  },
  {
    "id": 14,
    "description": "Exec Format Error"
  }
];

const statusresult = (status_id) => {
  const status = checkstatus.find(item => item.id === status_id);
  
  if (!status) {
    return "Invalid status id";
  } else {
    return status.description;
  }
};
module.exports = { getLanguageId , submitBatch, submitoken, statusresult };
