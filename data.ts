import express, { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import { v4 as uuidv4 } from "uuid";

function getData() {
    const app = express()
    app.use(cors());
    app.use(express.json());
    const prisma = new PrismaClient();
    
    app.post('/createResident', async(req: Request, res: Response) => {
        const{name,houseNumber,streetNumber,phoneNumber,active} = req.body;
        const resident = await prisma.resident.create({
            data: {
                name: name,
                houseNumber: houseNumber,
                streetNumber: streetNumber,
                phoneNumber: phoneNumber,
                active: active
            },
        });
        res.json(resident);
    });

    app.post('createPayment', async(req,res) => {
        const{paymentDate,amount,resId} = req.body;
        const payment = await prisma.payment.create({
            data:{
                paymentDate: paymentDate,
                amount: amount,
                resId: resId
            },

        });
        res.json(payment);
    });
    
    app.get('/getResident/:id',async (req,res) => {
       const id = req.params.id;
       const resident = await prisma.resident.findUnique({
           where:{
               id: id,
            }
        });
        res.json(resident);
    });

    app.get('/getPayemnts/:id',async (req,res) => {
        const id = req.params.id;
        const payments = await prisma.payment.findUnique({
            where: {
              id: id,
            },
            select: {
              amount: true,
              paymentDate:true,
              resident: {
                select: {
                  name: true,
                  houseNumber: true,
                  streetNumber: true
                },
              },
            },
          });
          res.json(payments);    
    });

    app.get('/listResidents',async (req,res) => {
        const residents = await prisma.resident.findMany();
        res.json(residents); 
    });
    
    app.put('/updateResident/:id',async (req,res) => {
        const id = req.params.id;
        const {name, houseNumber, phoneNumber, active, updatedOn} = req.body;
        const resident = await prisma.resident.update({
            where: {
                id: id,
            },
            data: {
                name: name,
                houseNumber: houseNumber,
                phoneNumber: phoneNumber,
                active: active,
                updatedOn: updatedOn
            },
        });
        res.json(resident);
    });

    app.put('/updateStatus/:id',async (req,res) => {
        const id = req.params.id;
        const {updatedOn} = req.body;
        let {status} = req.body;
        status = !status;
        const post = await prisma.resident.update({
            where: {
                id: id,
            },
            data: {
                active: status,
                updatedOn: updatedOn
            },
        });
        res.json(post);
    });

    app.put('/updatePayemnt/:id',async (req,res) => {
        const id = req.params.id;
        const{paymentDate,amount,updatedOn} = req.body;
        const payment = await prisma.payment.update({
            where: {
              id: id,
            },
            data: {
              amount: amount,
              paymentDate: paymentDate,
              updatedOn: updatedOn
            },
          });
          res.json(payment);    
    });
    
    app.delete('/deleteResident/:id',async (req, res) => {
        const id = req.params.id;
        const resident = await prisma.resident.delete({
            where:{
                id: id,
            },
        });
        res.json(resident);
    });

    app.delete('/deletePayment/:id',async (req, res) => {
        const id = req.params.id;
        const resident = await prisma.payment.delete({
            where:{
                id: id,
            },
        });
        res.json(resident);
    });

    return app;
}

export { getData };