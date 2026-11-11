import { Worker, type WorkerOptions } from "bullmq";
import { redisWorker } from "@/utils/ioredis.js";
import { emailJobProcessor } from "./email.job.processor.js";
import { EmailJobData } from "@/utils/email.queue.js";
import { UserModel } from "@/models/auth.model.js";
import { errorLogger } from "./error.logger.js";
import { hashToken } from "./manage.crypto.js";

const emailTypeMap = {
  verification: "verification",
  welcome: "welcome",
  "password-reset": "password_reset",
  "account-restore": "account_restore",
  "security-alert": "security_alert",
} as const;

const workerOptions: WorkerOptions = {
  connection: redisWorker(),
  prefix: "email:queue",
  concurrency: 5,
  stalledInterval: 10000,
  maxStalledCount: 2,
};

export const emailWorker = new Worker<EmailJobData>(
  "emailqueue",
  emailJobProcessor,
  workerOptions
);

// Event listeners
emailWorker.on("completed", async (job) => {
  const type = emailTypeMap[job.data.type];
  const log = await UserModel.findByTokenForJobProcessor(
    hashToken(job.data.token),
    type,
    ["pending", "failed"]
  );

  if (!log) {
    errorLogger.error(
      `Completed email job doesn't exist in database. jobId:[${job.id}], token:[${job.data.token}], email:[${job.data.to}], emailType:[${type}], timestamp:[${new Date()}]`
    );
    return;
  }

  await UserModel.updateEmailLog(log.log.id, log.user.id, {
    jobId: job.id,
    status: "sent",
    updatedAt: new Date(),
  });
});


emailWorker.on("failed", async (job, err) => {
  if (!job) return;

  const maxAttempts = job.opts.attempts || 4;

  if (job.attemptsMade >= maxAttempts) {
    errorLogger.error(
      `[Final Failure] Job ${job.id} exhausted. Error: ${err.message}`
    );

    const type = emailTypeMap[job.data.type];

    const log = await UserModel.findByTokenForJobProcessor(
      hashToken(job.data.token),
      type,
      ["pending", "failed"]
    );

    if (!log) {
      errorLogger.error(
        `Failed email job doesn't exist in database. jobId:[${job.id}], token:[${job.data.token}], email:[${job.data.to}], emailType:[${type}], timestamp:[${new Date()}]`
      );
      return;
    }

    await UserModel.updateEmailLog(log.log.id, log.user.id, {
      jobId: job.id,
      status: "failed",
      updatedAt: new Date(),
    });
  } else {
    errorLogger.warn(
      `[Temporary Drop] Job ${job.id} attempt ${job.attemptsMade}/${maxAttempts}. Backing off...`
    );
  }
});

emailWorker.on("error", (err) => {
  errorLogger.error("[Internal Worker Core Error]: " + err.message);
});