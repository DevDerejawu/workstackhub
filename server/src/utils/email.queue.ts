import { Queue, type QueueOptions } from "bullmq";
import { redisApi } from "./ioredis.js";
import { EmailTemplateParams } from "@/email.templates/security.alert.js";
type BaseEmailJob = {
  to: string;
  name: string;
};

// union for each email type
export type EmailJobData =
  | BaseEmailJob & {
      type: "welcome";
      token:string;
    }
  | BaseEmailJob & {
      type: "verification";
      token: string;
    }
  | BaseEmailJob & {
      type: "password-reset";
      token: string;
      message?: string;
    }
  | BaseEmailJob & {
      type: "account-restore";
      token: string;
      config?: {
        message: string;
        title: string;
        subject: string;
      };
    }
  | BaseEmailJob & {
      type: "security-alert";
      token: string;
      alertType: EmailTemplateParams["type"];
      deviceInfo: EmailTemplateParams["deviceInfo"];
      customMessage?: string;
    };

    
 

export const emailQueue = new Queue<EmailJobData>(
  "emailqueue",
  {
    prefix: "email:queue",
    connection: redisApi(),
    defaultJobOptions: {
      attempts: 4,
      backoff: { type: "exponential", delay: 4000, jitter: 0.5 },
      removeOnComplete: true,
      removeOnFail: { count: 10 },
      keepLogs: 3,
      stackTraceLimit: 1,
      sizeLimit: 25 * 1024,
    },
  } as QueueOptions
);