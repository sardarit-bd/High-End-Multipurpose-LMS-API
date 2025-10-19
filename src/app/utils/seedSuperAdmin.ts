import { envVars } from "../config/env"
import { IAuthProvider, IUser, Role } from "../modules/user/user.interface"
import { User } from "../modules/user/user.model"
import bcryptJs from 'bcryptjs'

export const seedSuperAdmin = async () => {
    try{
        const isSuperAdminExist = await User.findOne({email: envVars.SUPER_ADMIN_EMAIL})

        if(isSuperAdminExist){
            console.log('Super Admin already exist')
            return
        }

        console.log("Super Admin is being created now....")
        const hashedPassword = await bcryptJs.hash(envVars.SUPER_ADMIN_PASSWORD, Number(envVars.BCRYPT_SALT_ROUND))

        const authProvider: IAuthProvider = {
            provider: 'credentials',
            providerId: envVars.SUPER_ADMIN_EMAIL
        }

        const payload: Partial<IUser> = {
            name: "Super Admin",
            role: Role.SUPER_ADMIN,
            email: envVars.SUPER_ADMIN_EMAIL,
            password: hashedPassword,
            isVerified: true,
            auths: [authProvider]
        }

        const superAdmin = await User.create(payload)
        console.log("Super Admin is created successfully\n")
        console.log(superAdmin)
    }catch(err){
        console.log(err)
    }
}