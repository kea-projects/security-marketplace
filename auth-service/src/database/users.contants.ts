import { Role } from "../interfaces";

export const users = [
  {
    userId: "1929b579-2f32-4822-96a5-aa2980a6b5ed",
    username: "user@example.com",
    password: "$2b$10$yp2Q4gt7fiPN5kF5MIRekO2CzruNer9WV6A1MzmyhdZIVW46ogeuy",
    role: Role.user,
  },
  {
    userId: "8409db78-ba39-41d9-a67e-833eb839a876",
    username: "user2@example.com",
    password: "$2b$10$yp2Q4gt7fiPN5kF5MIRekO2CzruNer9WV6A1MzmyhdZIVW46ogeuy",
    role: Role.user,
  },
  {
    userId: "d54d698a-af15-415b-bba8-5fec15503367",
    username: "user3@example.com",
    password: "$2b$10$yp2Q4gt7fiPN5kF5MIRekO2CzruNer9WV6A1MzmyhdZIVW46ogeuy",
    role: Role.user,
  },
  {
    userId: "9e3988ba-2b27-4474-82a3-30a52968f4ac",
    username: "admin@example.com",
    password: "$2b$10$yp2Q4gt7fiPN5kF5MIRekO2CzruNer9WV6A1MzmyhdZIVW46ogeuy",
    role: Role.admin,
  },
];
