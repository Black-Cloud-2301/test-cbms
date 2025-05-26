export interface IUser {
  code: string;
  password: string;
  name: string;
}

export const USERS: Record<'NHUNG' | 'PC' | 'HONG' | 'TUOI' | 'CAM_NHUNG' | 'MANH', IUser> = {
  NHUNG: {
    code: '435319',
    password: 'Bear199!@#',
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
  CAM_NHUNG: {
    code: '455651',
    password: 'Thang5nam25@',
    name: 'Nguyễn Thị Cẩm Nhung'
  },
  TUOI: {
    code: '293289',
    password: 'Vcc@2026',
    name: 'Tô Thị Thúy Tươi'
  },
  MANH: {
    code: '467607',
    password: 'Hongbt8cons@',
    name: 'Lê Đức Mạnh'
  }
};
