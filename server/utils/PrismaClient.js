import { PrismaClient } from "@prisma/client";

let prismaInstance =  null;

function getPrismaInstance() {
    if(!prismaInstance) {
        prismaInstance = new PrismaClient();
        prismaInstance.$connect(); // i added this line
    }
    return prismaInstance;
}

export default getPrismaInstance;