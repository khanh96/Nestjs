import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'
import { InjectQueue } from '@nestjs/bullmq'
import { CANCEL_PAYMENT_JOB_NAME, PAYMENT_QUEUE_NAME } from 'src/shared/constants/queue.constant'
import { generateCancelPaymentJobId } from 'src/shared/helpers'

@Injectable()
/**
 * Order Producer for handling order-related jobs in the queue.
 * This class is responsible for adding jobs to the payment queue,
 * specifically for cancelling payments after a certain delay.
 * It uses BullMQ for queue management and integrates with the NestJS framework.
 */
export class OrderProducer {
  constructor(@InjectQueue(PAYMENT_QUEUE_NAME) private paymentQueue: Queue) {
    // Log existing jobs in the payment queue upon initialization
    this.paymentQueue
      .getJobs()
      .then((jobs) => {
        console.log(
          `Current jobs in ${PAYMENT_QUEUE_NAME} queue:`,
          jobs.map((job) => job.data),
        )
      })
      .catch((err) => {
        console.error(`Failed to get jobs from ${PAYMENT_QUEUE_NAME} queue:`, err)
      })
  }
  async addCancelPaymentJob(paymentId: number) {
    console.log('Add cancel payment job to queue for paymentId:', paymentId)
    return this.paymentQueue.add(
      CANCEL_PAYMENT_JOB_NAME,
      {
        paymentId,
      },
      {
        delay: 1000 * 10, // delay 24 hours
        jobId: generateCancelPaymentJobId(paymentId),
        removeOnComplete: true,
        removeOnFail: true,
      },
    )
  }
}
