import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { CANCEL_PAYMENT_JOB_NAME, PAYMENT_QUEUE_NAME } from 'src/shared/constants/queue.constant'
import { SharedPaymentRepository } from 'src/shared/repositories/payment.repo'

/**
 * Payment Consumer for handling payment-related jobs in the queue.
 * This class processes jobs from the payment queue,
 * specifically for cancelling payments and associated orders.
 * It uses BullMQ for queue management and integrates with the NestJS framework.
 * Sau khoảng thời gian delay được định nghĩa trong OrderProducer thì job này sẽ được thực thi.
 */
@Processor(PAYMENT_QUEUE_NAME)
export class PaymentConsumer extends WorkerHost {
  constructor(private readonly sharedPaymentRepo: SharedPaymentRepository) {
    super()
  }
  async process(job: Job<{ paymentId: number }, any, string>): Promise<any> {
    switch (job.name) {
      case CANCEL_PAYMENT_JOB_NAME: {
        const { paymentId } = job.data
        await this.sharedPaymentRepo.cancelPaymentAndOrder(paymentId)
        console.log('Completed cancel payment job for paymentId:', paymentId)
        return {}
      }
      default:
        break
    }
    return {}
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    console.log(`Processing job ${job.id} of type ${job.name}`)
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job, result: any) {
    console.log(`Job ${job.id} completed ${job.name}`, result)
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    console.log(`Job ${job.id} failed with error: ${error}`)
  }

  @OnWorkerEvent('stalled')
  onStalled(job: Job, error: Error) {
    console.log(`Job ${job.id} failed with error: ${error}`)
  }

  @OnWorkerEvent('error')
  onError(error: Error) {
    console.log(`Worker error: ${error}`)
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job, progress: number) {
    console.log(`Job ${job.id} progress: ${progress}`)
  }
}
