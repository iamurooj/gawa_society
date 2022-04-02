import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import { Parser } from "json2csv";
import { v4 as uuidv4 } from "uuid";
import { request } from "http";
import { formatDistance, subDays, yearsToQuarters } from "date-fns";

function getData() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  const prisma = new PrismaClient();

  app.post("/createResident", async (req: Request, res: Response) => {
    const {
      name,
      houseNumber,
      streetNumber,
      phoneNumber,
      floor,
      designatedAmount,
      createdOn,
    } = req.body;
    const resident = await prisma.resident.create({
      data: {
        name: name.toLowerCase(),
        houseNumber: houseNumber,
        streetNumber: streetNumber.toLowerCase(),
        phoneNumber: phoneNumber,
        floor: floor,
        designatedAmount: Number(designatedAmount),
        active: "Y",
        createdOn,
      },
    });
    res.json(resident);
  });

  app.post("/createPayment", async (req: Request, res: Response) => {
    const monthNames = [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec",
    ];

    const { amount, resId, paymentDate } = req.body;
    try {
      const d = new Date(paymentDate);
      const paymentMonth = monthNames[d.getMonth()];
      const paymentYear = d.getFullYear().toString();
      const payment = await prisma.payment.create({
        data: {
          amount: Number(amount),
          resId: Number(resId),
          paymentMonth: paymentMonth,
          PaymentYear: paymentYear,
        },
      });
      console.log(payment);
      res.json(payment);
    } catch (error) {
      console.log(error);
    }
  });

  app.get("/getResident/:id", async (req, res) => {
    const id = req.params.id;
    const resident = await prisma.resident.findUnique({
      where: {
        id: Number(id),
      },
    });
    res.json(resident);
  });

  app.get("/getPayemnt/:id", async (req, res) => {
    const id = req.params.id;
    const payments = await prisma.payment.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        amount: true,
        paymentMonth: true,
        PaymentYear: true,
        resident: {
          select: {
            name: true,
            houseNumber: true,
            streetNumber: true,
          },
        },
      },
    });
    res.json(payments);
  });

  app.get("/getPayments/:resId", async (req, res) => {
    const resId = req.params.resId;
    const payments = await prisma.payment.findMany({
      where: {
        resId: Number(resId),
      },
      select: {
        amount: true,
        paymentMonth: true,
        PaymentYear: true,
        resident: {
          select: {
            name: true,
            houseNumber: true,
            streetNumber: true,
          },
        },
      },
    });
    res.json(payments);
  });

  app.get("/listAllResidents/:street", async (req, res) => {
    const street = req.params.street;
    const residents = await prisma.resident.findMany({
      where: {
        streetNumber: {
          contains: street as string,
        },
      },
      include: {
        Payment: {
          select: {
            paymentMonth: true,
            PaymentYear: true,
            amount: true,
          },
        },
      },
    });
    res.json(residents);
  });
  app.get("/listAllResidents", async (req, res) => {
    const residents = await prisma.resident.findMany({
        orderBy: [
            {
              name: 'asc',
            },
          ],
      include: {
        Payment: {
          select: {
            paymentMonth: true,
            PaymentYear: true,
            amount: true,
          },
        },
      },
    });
    res.json(residents);
  });
  app.get("/listAllPayments", async (req, res) => {
    const payments = await prisma.payment.findMany({
        orderBy: [
            {
              createdOn: 'desc',
            },
          ],
      include: {
        resident: {
          select: {
            name: true,
            houseNumber: true,
            streetNumber: true,
            designatedAmount: true,
          },
        },
      },
    });
    res.json(payments);
  });

  app.get("/listStreetResidents/:streetNumber", async (req, res) => {
    const streetNumber: any = req.params.streetNumber;
    //const dt= `${req.params.year}-01-01`
    const residents = await prisma.resident.findMany({
      where: {
        streetNumber: {
          contains: streetNumber,
        },
      },
      include: {
        Payment: {
          select: {
            paymentMonth: true,
            PaymentYear: true,
            amount: true,
          },
        },
      },
    });
    res.json(residents);
  });
  
  app.get("/listYearWiseResidents/:year/:streetNumber", async (req, res) => {
    const streetNumber: any = req.params.streetNumber;
    const year = req.params.year;

    const residents = await prisma.resident.findMany({
      where: {
        streetNumber: {
          contains: streetNumber.toLowerCase(),
        },
      },
      include: {
        Payment: {
          select: {
            paymentMonth: true,
            amount: true,
          },
          where: {
            PaymentYear: year,
          },
        },
      },
    });
    res.json(residents);
  });
  app.get("/listStreets", async (req, res) => {
    const result = await prisma.resident.findMany({
      where: {},
      distinct: ["streetNumber"],
      select: {
        streetNumber: true,
      },
    });
    res.json(result);
  });
  app.get("/list/:streetNo/:month/:year", async (req, res) => {
    const streetNumber = req.params.streetNo;
    const month = "feb";//req.params.month;
    const year = req.params.year;

    const residents = await prisma.resident.findMany({
      where: {
        AND:[{
         streetNumber:{
           contains:streetNumber.toLowerCase()
        },
        Payment: {
          every: {
            PaymentYear: {
              contains: year as string,
            },
            paymentMonth: {
              contains: month as string,
            },
          },
        },
      }]
      },
      include: {
        Payment: {
          select: {
            paymentMonth: true,
            amount: true,
          },
          // where: {
          //   PaymentYear: year,
          //   paymentMonth: month
          // },
        },
      },
      
    });
    // let sum =0;
    // for (let val of residents) {
    //   for (let i of val.Payment) {
    //     console.log(i.amount);
    //     sum += i.amount;
    //   }
    // }
   
    // const obj={
    //     result:residents,
    //     sum:sum
    // }

    // console.log(obj.sum);
    // console.log(sum);
    // res.json(obj);
    
    res.json(residents);
  });
  app.put("/updateResident/:id", async (req, res) => {
    const id = req.params.id;
    const { name, houseNumber, phoneNumber, active, updatedOn } = req.body;
    const resident = await prisma.resident.update({
      where: {
        id: Number(id),
      },
      data: {
        name: name,
        houseNumber: houseNumber,
        phoneNumber: phoneNumber,
        active: active,
        updatedOn,
      },
    });
    res.json(resident);
  });

  app.put("/updatePayment/:id", async (req, res) => {
    const id = req.params.id;
    const { amount, paymentMonth, paymentYear, updatedOn } = req.body;
    const payment = await prisma.payment.update({
      where: {
        id: Number(id),
      },
      data: {
        amount: amount,
        paymentMonth: paymentMonth,
        PaymentYear: paymentYear,
        updatedOn,
      },
    });
    res.json(payment);
  });

  app.delete("/deleteResident/:id", async (req, res) => {
    const id = req.params.id;
    const resident = await prisma.resident.delete({
      where: {
        id: Number(id),
      },
    });
    res.json(resident);
  });

  app.delete("/deletePayment/:id", async (req, res) => {
    const id = req.params.id;
    const resident = await prisma.payment.delete({
      where: {
        id: Number(id),
      },
    });
    res.json(resident);
  });

  app.get(
    "/report-by-street-and-year/:streetNo/:month/:year",
    async (req, res) => {
      // const { query: { streetNo = "", year } = {} } = req;
      const streetNo = req.params.streetNo;
      const year = req.params.year;
      const month = req.params.month;
      const result = await prisma.resident.findMany({
        where: {
          streetNumber: {
            contains: streetNo as string,
          },
          Payment: {
            every: {
              PaymentYear: {
                contains: year as string,
              },
              paymentMonth: {
                contains: month as string,
              },
            },
          },
        },
        select: {
          id: true,
          name: true,
          streetNumber: true,
          houseNumber: true,
          Payment: {
            select: {
              PaymentYear: true,
              paymentMonth: true,
              amount: true,
            },
          },
        },
      });
      
      let sum =0;
      for (let val of result) {
        for (let i of val.Payment) {
          console.log(i.amount);
          sum += i.amount;
        }
      }

      const obj={
          result:result,
          sum:sum
      }
      res.json(obj);
    }
  );

  return app;
}

export { getData };
