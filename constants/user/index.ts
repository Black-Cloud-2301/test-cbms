export interface IUser {
  code: string;
  password: string;
  name: string;
}

export const USERS: Record<'NHUNG' | 'PC' | 'HONG' | 'TUOI' | 'MANH', IUser> = {
  NHUNG: {
    code: '435319',
    password: 'Bear188!@#',
    name: 'Giang Thị Nhung'
  },
  PC: {
    code: '270504',
    password: 'Cntt@1334',
    name: 'Lê Thị Ngọc Ánh'
  },
  HONG: {
    code: '192981',
    password: 'CNTT2025a@*HH',
    name: 'Bùi Thị Hồng'
  },
  TUOI: {
    code: '293289',
    password: 'Vcc@2025',
    name: 'Tô Thị Thúy Tươi'
  },
  MANH: {
    code: '467607',
    password: 'Anhpd35cons@',
    name: 'Lê Đức Mạnh'
  }
};
