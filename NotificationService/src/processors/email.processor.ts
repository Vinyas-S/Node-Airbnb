import {Job, Worker} from 'bullmq';
import { NotificationDto } from '../dtos/notification.dto';
import { MAILER_QUEUE } from '../queues/mailer.queue';
import { getRedisConnObj } from '../config/redis.config';
import { MAILER_PAYLOAD } from '../producers/email.producer';

export const setupMailerWorker = () => {
    const emailProcessor = new Worker<NotificationDto>(
        MAILER_QUEUE,
        async (job: Job) => {
            if(job.name !== MAILER_PAYLOAD){
                throw new Error("Invalid job payload for email processing");
            }
        },
        {
            connection: getRedisConnObj()
        }
    );

    emailProcessor.on("failed", () => {
        console.log("Email job processing failed");
    });

    emailProcessor.on("completed", () => {
        console.log("Email job processing completed");
    });

}
