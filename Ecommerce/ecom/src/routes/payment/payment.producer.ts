import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'
import { InjectQueue } from '@nestjs/bullmq'
import { PAYMENT_QUEUE_NAME } from 'src/shared/constants/queue.constant'
import { generateCancelPaymentJobId } from 'src/shared/helpers'

@Injectable()
/**

 */
export class PaymentProducer {
  constructor(@InjectQueue(PAYMENT_QUEUE_NAME) private paymentQueue: Queue) {
    this.paymentQueue
      .getJobs()
      .then((jobs) => {
        console.log(
          'Existing jobs in payment queue:',
          jobs.map((job) => job.id),
        )
      })
      .catch((error) => {
        console.error('Error fetching existing jobs in payment queue:', error)
      })
  }

  removeJob(paymentId: number) {
    return this.paymentQueue.remove(generateCancelPaymentJobId(paymentId))
  }
}
