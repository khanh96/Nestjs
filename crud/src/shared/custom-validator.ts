import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator'
import { RegisterBodyDTO } from 'src/routes/auth/auth.dto'

export function Match(property: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'Match',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          console.log(value, args)
          console.log(args)
          // value là giá trị của propertyName (confỉmPassword)
          // args.object là giá trị của object truyền vào (RegisterBodyDTO)
          // args.constraints là các giá trị truyền vào từ decorator (password)

          const [relatedPropertyName] = args.constraints as string[]
          const relatedValue = (args.object as RegisterBodyDTO)[relatedPropertyName]
          // Nếu hàm validate() trả về true → ✅ validation thành công → không hiển thị message.
          // Nếu hàm validate() trả về false → ❌ validation thất bại → hiển thị message
          return value === relatedValue
        },
      },
    })
  }
}
